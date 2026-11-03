const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");
const escapeRegex = require("../utils/escapeRegex");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinary.service");

// A scheduled post becomes publicly visible once its publishedAt time has
// passed, even before any cron job (not yet built — see Phase 19) formally
// flips its status to "published". This is the correct behavior without
// requiring that dependency to exist first.
const PUBLIC_VISIBILITY_FILTER = {
  $or: [
    { status: "published" },
    { status: "scheduled", publishedAt: { $lte: new Date() } },
  ],
};

// @desc    List public blog posts — search, filter by category/tag, paginated
// @route   GET /api/v1/blogs?keyword=&category=&tag=&page=&limit=
// @access  Public
// Sort options for the journal (default: newest first).
const PUBLIC_SORTS = {
  latest: "-publishedAt",
  popular: "-viewCount -likeCount -publishedAt",
  trending: "-isTrending -viewCount -publishedAt",
  liked: "-likeCount -publishedAt",
};

const getPublicBlogs = asyncHandler(async (req, res) => {
  const { keyword, category, tag, page = 1, limit = 10, sort, featured, trending } = req.query;

  const filter = { ...PUBLIC_VISIBILITY_FILTER };
  if (keyword) filter.$text = { $search: keyword };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (featured === "true") filter.isFeatured = true;
  if (trending === "true") filter.isTrending = true;

  const skip = (Number(page) - 1) * Number(limit);
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .select("-content")
      .populate("category", "name slug")
      .populate("author", "name profileImage")
      .sort(PUBLIC_SORTS[sort] || PUBLIC_SORTS.latest)
      .skip(skip)
      .limit(Number(limit)),
    Blog.countDocuments(filter),
  ]);

  sendResponse(
    res,
    200,
    { blogs, total, page: Number(page), totalPages: Math.ceil(total / limit) },
    "Blogs fetched successfully",
  );
});

// @desc    Get one public blog post by slug — increments view count, falls
//          back to same-category posts for "related" if none are curated
// @route   GET /api/v1/blogs/:slug
// @access  Public
const getPublicBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, ...PUBLIC_VISIBILITY_FILTER },
    { $inc: { viewCount: 1 } },
    { new: true },
  )
    .populate("category", "name slug")
    .populate("author", "name profileImage")
    .populate("relatedBlogs", "title slug excerpt featuredImage publishedAt readingTime category viewCount");

  if (!blog) throw new ApiError(404, "Blog post not found");

  let related = blog.relatedBlogs;
  if (!related || related.length === 0) {
    related = blog.category
      ? await Blog.find({
          ...PUBLIC_VISIBILITY_FILTER,
          category: blog.category,
          _id: { $ne: blog._id },
        })
          .select("title slug excerpt featuredImage publishedAt readingTime category viewCount")
          .limit(4)
      : [];
  }

  // Previous (older) and next (newer) published posts for in-article navigation.
  const navFields = "title slug featuredImage publishedAt readingTime";
  const [prev, next] = await Promise.all([
    Blog.findOne({ ...PUBLIC_VISIBILITY_FILTER, publishedAt: { $lt: blog.publishedAt } }).sort("-publishedAt").select(navFields).lean(),
    Blog.findOne({ ...PUBLIC_VISIBILITY_FILTER, publishedAt: { $gt: blog.publishedAt } }).sort("publishedAt").select(navFields).lean(),
  ]);

  sendResponse(res, 200, { blog, related, prev, next }, "Blog post fetched successfully");
});

// @desc    List blog categories
// @route   GET /api/v1/blogs/categories
// @access  Public
// @desc    Journal highlights: featured, trending and popular posts, popular
//          tags and category counts — one request for the journal landing page.
// @route   GET /api/v1/blogs/highlights
// @access  Public
const getBlogHighlights = asyncHandler(async (req, res) => {
  const card = "-content";
  const base = () => Blog.find(PUBLIC_VISIBILITY_FILTER).select(card).populate("category", "name slug").populate("author", "name profileImage");
  const [featured, trending, popular, tags, categoryCounts] = await Promise.all([
    base().where({ isFeatured: true }).sort("-publishedAt").limit(6),
    base().sort(PUBLIC_SORTS.trending).limit(6),
    base().sort(PUBLIC_SORTS.popular).limit(6),
    Blog.aggregate([
      { $match: PUBLIC_VISIBILITY_FILTER },
      { $unwind: "$tags" },
      { $group: { _id: { $toLower: "$tags" }, tag: { $first: "$tags" }, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 20 },
    ]),
    Blog.aggregate([{ $match: { ...PUBLIC_VISIBILITY_FILTER, category: { $ne: null } } }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);
  sendResponse(res, 200, {
    featured,
    trending,
    popular,
    tags: tags.map((t) => ({ tag: t.tag, count: t.count })),
    categoryCounts: Object.fromEntries(categoryCounts.map((c) => [String(c._id), c.count])),
  }, "Journal highlights fetched successfully");
});

// @desc    Like / unlike a post (the browser remembers its own like)
// @route   POST /api/v1/blogs/:slug/like  { liked: boolean }
// @access  Public (rate limited)
const likeBlog = asyncHandler(async (req, res) => {
  const liked = req.body?.liked !== false;
  const filter = { slug: req.params.slug, ...PUBLIC_VISIBILITY_FILTER, ...(liked ? {} : { likeCount: { $gt: 0 } }) };
  const blog = await Blog.findOneAndUpdate(filter, { $inc: { likeCount: liked ? 1 : -1 } }, { new: true, timestamps: false }).select("likeCount").lean();
  if (!blog) {
    const exists = await Blog.exists({ slug: req.params.slug, ...PUBLIC_VISIBILITY_FILTER });
    if (!exists) throw new ApiError(404, "Blog post not found");
  }
  const current = blog || (await Blog.findOne({ slug: req.params.slug }).select("likeCount").lean());
  sendResponse(res, 200, { likeCount: current?.likeCount || 0, liked }, liked ? "Liked" : "Like removed");
});

/** One-time fill of readingTime for posts saved before it existed (idempotent). */
const backfillReadingTimes = async () => {
  const missing = await Blog.find({ readingTime: null }).select("content").lean();
  if (!missing.length) return 0;
  await Blog.bulkWrite(
    missing.map((b) => ({ updateOne: { filter: { _id: b._id }, update: { $set: { readingTime: Blog.computeReadingTime(b.content) } }, timestamps: false } })),
  );
  return missing.length;
};

const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = await BlogCategory.find({ status: "active" }).sort("name");
  sendResponse(
    res,
    200,
    { categories },
    "Blog categories fetched successfully",
  );
});

// ---------- Admin ----------

// @desc    List ALL posts regardless of status, with search/filter (admin)
// @route   GET /api/v1/admin/blogs?status=&keyword=&category=
// @access  Private/Admin
const getAllBlogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.keyword)
    filter.title = { $regex: escapeRegex(req.query.keyword), $options: "i" };

  const blogs = await Blog.find(filter)
    .select("-content")
    .populate("category", "name slug")
    .populate("author", "name")
    .sort("-createdAt");

  sendResponse(
    res,
    200,
    { blogs, count: blogs.length },
    "Blogs fetched successfully",
  );
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate("category", "name slug")
    .populate("relatedBlogs", "title slug");
  if (!blog) throw new ApiError(404, "Blog post not found");
  sendResponse(res, 200, { blog }, "Blog post fetched successfully");
});

const BLOG_SEO_FIELDS = ["metaTitle", "metaDescription", "metaKeywords", "canonicalUrl", "ogTitle", "ogDescription", "ogImage", "robots"];
const CATEGORY_SEO_FIELDS = ["title", "description", "keywords", "canonicalUrl", "ogImage"];

const parseJsonObject = (raw, name) => {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, `${name} must be valid JSON`);
  }
};

/** Keeps only known string fields, trimmed. */
const pickStrings = (obj, fields) => {
  const out = {};
  fields.forEach((f) => {
    if (obj?.[f] !== undefined && obj[f] !== null) out[f] = String(Array.isArray(obj[f]) ? obj[f].join(", ") : obj[f]).trim();
  });
  return out;
};

/** Blog SEO. Older clients sent { title, description, keywords } — mapped to the schema's meta* fields. */
const parseSeo = (raw) => {
  const seo = parseJsonObject(raw, "seo");
  if (seo === undefined || seo === null || typeof seo !== "object") return undefined;
  const legacy = { metaTitle: seo.title, metaDescription: seo.description, metaKeywords: seo.keywords };
  Object.entries(legacy).forEach(([k, v]) => {
    if (seo[k] === undefined && v !== undefined) seo[k] = v;
  });
  return pickStrings(seo, BLOG_SEO_FIELDS);
};

const parseCategorySeo = (raw) => {
  const seo = parseJsonObject(raw, "seo");
  if (seo === undefined || seo === null || typeof seo !== "object") return undefined;
  return pickStrings(seo, CATEGORY_SEO_FIELDS);
};

const parseArrayField = (raw) => {
  if (raw === undefined) return undefined;
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
};

/** Multipart sends booleans as strings. */
const parseBool = (v) => (v === undefined ? undefined : v === true || v === "true" || v === "1");

/** FAQ list (JSON string in multipart): [{ question, answer }], max 20, blanks dropped. */
const parseFaqs = (raw) => {
  if (raw === undefined) return undefined;
  const list = parseJsonObject(raw, "faqs");
  if (!Array.isArray(list)) throw new ApiError(400, "faqs must be a list of { question, answer }");
  const faqs = list
    .map((f) => ({ question: String(f?.question ?? "").trim(), answer: String(f?.answer ?? "").trim() }))
    .filter((f) => f.question && f.answer);
  if (faqs.length > 20) throw new ApiError(400, "At most 20 FAQs per post");
  if (faqs.some((f) => f.question.length > 300 || f.answer.length > 3000)) throw new ApiError(400, "FAQ questions are limited to 300 characters and answers to 3000");
  return faqs;
};

// @desc    Create a blog post
// @route   POST /api/v1/admin/blogs
// @access  Private/Admin
const createBlog = asyncHandler(async (req, res) => {
  const { title, slug, content, excerpt, category, status, publishedAt } =
    req.body;
  const tags = parseArrayField(req.body.tags) || [];
  const relatedBlogs = parseArrayField(req.body.relatedBlogs) || [];
  const seo = parseSeo(req.body.seo);

  let featuredImage;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, "ecommerce/blog");
    featuredImage = { url: result.url, publicId: result.publicId };
  }

  const blog = await Blog.create({
    title,
    slug,
    content,
    excerpt,
    category: category || null,
    tags,
    relatedBlogs,
    status,
    publishedAt,
    seo,
    featuredImage,
    author: req.user._id,
    isFeatured: parseBool(req.body.isFeatured) ?? false,
    isTrending: parseBool(req.body.isTrending) ?? false,
    faqs: parseFaqs(req.body.faqs) ?? [],
  });

  sendResponse(res, 201, { blog }, "Blog post created successfully");
});

// @desc    Update a blog post
// @route   PUT /api/v1/admin/blogs/:id
// @access  Private/Admin
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new ApiError(404, "Blog post not found");

  if (req.file) {
    if (blog.featuredImage?.publicId)
      await deleteFromCloudinary(blog.featuredImage.publicId);
    const result = await uploadToCloudinary(req.file.buffer, "ecommerce/blog");
    blog.featuredImage = { url: result.url, publicId: result.publicId };
  }

  [
    "title",
    "slug",
    "content",
    "excerpt",
    "category",
    "status",
    "publishedAt",
  ].forEach((field) => {
    if (req.body[field] !== undefined) blog[field] = req.body[field];
  });

  const tags = parseArrayField(req.body.tags);
  if (tags !== undefined) blog.tags = tags;
  const relatedBlogs = parseArrayField(req.body.relatedBlogs);
  if (relatedBlogs !== undefined) blog.relatedBlogs = relatedBlogs;
  const seo = parseSeo(req.body.seo);
  if (seo !== undefined) blog.seo = { ...blog.seo.toObject(), ...seo };
  const isFeatured = parseBool(req.body.isFeatured);
  if (isFeatured !== undefined) blog.isFeatured = isFeatured;
  const isTrending = parseBool(req.body.isTrending);
  if (isTrending !== undefined) blog.isTrending = isTrending;
  const faqs = parseFaqs(req.body.faqs);
  if (faqs !== undefined) blog.faqs = faqs;

  await blog.save();
  sendResponse(res, 200, { blog }, "Blog post updated successfully");
});

// @desc    Publish / unpublish / schedule a post
// @route   PATCH /api/v1/admin/blogs/:id/status
// @access  Private/Admin
const setBlogStatus = asyncHandler(async (req, res) => {
  const { status, publishedAt } = req.body;
  if (!["draft", "published", "scheduled"].includes(status)) {
    throw new ApiError(400, "status must be draft, published, or scheduled");
  }
  if (status === "scheduled" && !publishedAt) {
    throw new ApiError(
      400,
      "publishedAt (a future date) is required to schedule a post",
    );
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new ApiError(404, "Blog post not found");

  blog.status = status;
  if (publishedAt) blog.publishedAt = publishedAt;
  await blog.save();

  sendResponse(res, 200, { blog }, `Blog post ${status} successfully`);
});

// @desc    Delete a blog post
// @route   DELETE /api/v1/admin/blogs/:id
// @access  Private/Admin
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new ApiError(404, "Blog post not found");

  if (blog.featuredImage?.publicId)
    await deleteFromCloudinary(blog.featuredImage.publicId);
  await blog.deleteOne();

  sendResponse(res, 200, {}, "Blog post deleted successfully");
});

// ---------- Blog Categories (admin) ----------

const createBlogCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const category = await BlogCategory.create({ name, description, status, seo: parseCategorySeo(req.body.seo) || {} });
  sendResponse(res, 201, { category }, "Blog category created successfully");
});

const updateBlogCategory = asyncHandler(async (req, res) => {
  const category = await BlogCategory.findById(req.params.id);
  if (!category) throw new ApiError(404, "Blog category not found");
  ["name", "description", "status"].forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });
  const seo = parseCategorySeo(req.body.seo);
  if (seo) category.seo = { ...(category.seo?.toObject?.() ?? category.seo ?? {}), ...seo };
  await category.save();
  sendResponse(res, 200, { category }, "Blog category updated successfully");
});

const deleteBlogCategory = asyncHandler(async (req, res) => {
  const inUse = await Blog.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    throw new ApiError(
      400,
      `Cannot delete: ${inUse} blog post(s) still use this category. Reassign them first.`,
    );
  }
  const category = await BlogCategory.findById(req.params.id);
  if (!category) throw new ApiError(404, "Blog category not found");
  await category.deleteOne();
  sendResponse(res, 200, {}, "Blog category deleted successfully");
});

module.exports = {
  getPublicBlogs,
  getPublicBlogBySlug,
  getBlogCategories,
  getBlogHighlights,
  likeBlog,
  backfillReadingTimes,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  setBlogStatus,
  deleteBlog,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  PUBLIC_VISIBILITY_FILTER,
};
