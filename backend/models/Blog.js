const mongoose = require("mongoose");
const slugify = require("slugify");

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    canonicalUrl: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    robots: { type: String, default: "index, follow" },
  },
  { _id: false },
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    content: { type: String, required: true }, // rich HTML/markdown body
    excerpt: { type: String, default: "" },
    featuredImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      default: null,
    },
    tags: [{ type: String, trim: true }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    publishedAt: { type: Date, default: null }, // set on publish, or the future date for a scheduled post

    // Admin-curated related posts; getBlogBySlug falls back to same-category
    // posts when this is empty rather than requiring it to be set.
    relatedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],

    seo: { type: seoSchema, default: () => ({}) },

    viewCount: { type: Number, default: 0 },

    // Journal presentation (all optional — older posts keep working).
    isFeatured: { type: Boolean, default: false }, // featured slider on the journal page
    isTrending: { type: Boolean, default: false }, // pinned to "Trending"
    likeCount: { type: Number, default: 0, min: 0 },
    faqs: [
      {
        _id: false,
        question: { type: String, trim: true, maxlength: 300 },
        answer: { type: String, trim: true, maxlength: 3000 },
      },
    ],
    readingTime: { type: Number, default: null }, // minutes, computed from content on save
  },
  { timestamps: true },
);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ isFeatured: 1, publishedAt: -1 });
blogSchema.index({ viewCount: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: "text", content: "text", excerpt: "text" });

/** Minutes to read: ~200 words per minute of visible text, at least 1. */
blogSchema.statics.computeReadingTime = (html = "") => {
  const words = String(html).replace(/<[^>]*>/g, " ").split(/s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

blogSchema.pre("save", function () {
  if (this.isModified("content") || this.readingTime == null) {
    this.readingTime = this.constructor.computeReadingTime(this.content);
  }
});

blogSchema.pre("save", async function () {
  if (this.isModified("title") && !this.slug) {
    const base = slugify(this.title, { lower: true, strict: true });

    let candidate = base;
    let suffix = 1;

    while (
      await this.constructor.exists({
        slug: candidate,
        _id: { $ne: this._id },
      })
    ) {
      suffix++;
      candidate = `${base}-${suffix}`;
    }

    this.slug = candidate;
  }

  if (this.isModified("status")) {
    if (this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date();
    }

    // 'scheduled' keeps whatever publishedAt (a future date) the admin set
  }
});

module.exports = mongoose.model("Blog", blogSchema);
