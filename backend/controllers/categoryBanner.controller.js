const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const CategoryBanner = require("../models/CategoryBanner");
const Category = require("../models/Category");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinary.service");
const { invalidate } = require("../services/cache.service");

// ======================
// Parse Categories
// ======================
const parseCategories = (raw) => {
  if (raw === undefined) return undefined;
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return raw;

  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "categories must be valid JSON");
  }
};

// ======================
// Get All Banners (admin)
// ======================
const getBanners = asyncHandler(async (req, res) => {
  const banners = await CategoryBanner.find()
    .populate("categories", "name slug")
    .sort({ priority: 1, createdAt: -1 });

  sendResponse(
    res,
    200,
    { banners, count: banners.length },
    "Category banners fetched successfully",
  );
});

// ======================
// Get Banner By Id (admin)
// ======================
const getBannerById = asyncHandler(async (req, res) => {
  const banner = await CategoryBanner.findById(req.params.id).populate(
    "categories",
    "name slug",
  );

  if (!banner) {
    throw new ApiError(404, "Category banner not found");
  }

  sendResponse(res, 200, { banner }, "Category banner fetched successfully");
});

// ======================
// Create Banner
// ======================
const createBanner = asyncHandler(async (req, res) => {
  const {
    name,
    title,
    subtitle,
    description,
    buttonText,
    buttonLink,
    priority,
    status,
    startDate,
    endDate,
  } = req.body;

  const categories = parseCategories(req.body.categories) || [];

  if (!categories.length) {
    throw new ApiError(400, "At least one category must be selected");
  }

  if (!req.files?.desktopImage?.[0]) {
    throw new ApiError(400, "Desktop banner image is required");
  }

  const desktopResult = await uploadToCloudinary(
    req.files.desktopImage[0].buffer,
    "ecommerce/category-banners",
  );

  let mobileImage;
  if (req.files?.mobileImage?.[0]) {
    const mobileResult = await uploadToCloudinary(
      req.files.mobileImage[0].buffer,
      "ecommerce/category-banners",
    );
    mobileImage = { url: mobileResult.url, publicId: mobileResult.publicId };
  }

  const banner = await CategoryBanner.create({
    name,
    title,
    subtitle,
    description,
    buttonText,
    buttonLink,
    priority,
    status,
    startDate: startDate || null,
    endDate: endDate || null,
    categories,
    desktopImage: { url: desktopResult.url, publicId: desktopResult.publicId },
    mobileImage,
  });

  await invalidate("category-banners:*");

  sendResponse(res, 201, { banner }, "Category banner created successfully");
});

// ======================
// Update Banner
// ======================
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await CategoryBanner.findById(req.params.id);

  if (!banner) {
    throw new ApiError(404, "Category banner not found");
  }

  // Update Desktop Image
  if (req.files?.desktopImage?.[0]) {
    if (banner.desktopImage?.publicId) {
      await deleteFromCloudinary(banner.desktopImage.publicId);
    }

    const result = await uploadToCloudinary(
      req.files.desktopImage[0].buffer,
      "ecommerce/category-banners",
    );

    banner.desktopImage = { url: result.url, publicId: result.publicId };
  }

  // Update Mobile Image
  if (req.files?.mobileImage?.[0]) {
    if (banner.mobileImage?.publicId) {
      await deleteFromCloudinary(banner.mobileImage.publicId);
    }

    const result = await uploadToCloudinary(
      req.files.mobileImage[0].buffer,
      "ecommerce/category-banners",
    );

    banner.mobileImage = { url: result.url, publicId: result.publicId };
  }

  // Update Fields
  [
    "name",
    "title",
    "subtitle",
    "description",
    "buttonText",
    "buttonLink",
    "priority",
    "status",
  ].forEach((field) => {
    if (req.body[field] !== undefined) {
      banner[field] = req.body[field];
    }
  });

  if (req.body.startDate !== undefined) {
    banner.startDate = req.body.startDate || null;
  }
  if (req.body.endDate !== undefined) {
    banner.endDate = req.body.endDate || null;
  }

  const categories = parseCategories(req.body.categories);
  if (categories !== undefined) {
    if (!categories.length) {
      throw new ApiError(400, "At least one category must be selected");
    }
    banner.categories = categories;
  }

  await banner.save();

  await invalidate("category-banners:*");

  sendResponse(res, 200, { banner }, "Category banner updated successfully");
});

// ======================
// Delete Banner
// ======================
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await CategoryBanner.findById(req.params.id);

  if (!banner) {
    throw new ApiError(404, "Category banner not found");
  }

  if (banner.desktopImage?.publicId) {
    await deleteFromCloudinary(banner.desktopImage.publicId);
  }
  if (banner.mobileImage?.publicId) {
    await deleteFromCloudinary(banner.mobileImage.publicId);
  }

  await banner.deleteOne();

  await invalidate("category-banners:*");

  sendResponse(res, 200, {}, "Category banner deleted successfully");
});

// ======================
// Get Active Banner For Category (public)
// ======================
const getBannerByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId).select("ancestors");

  if (!category) {
    return sendResponse(res, 200, { banner: null }, "No banner found");
  }

  const candidateIds = [category._id, ...(category.ancestors || [])];
  const now = new Date();

  const banner = await CategoryBanner.findOne({
    categories: { $in: candidateIds },
    status: "active",
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  }).sort({ priority: 1, createdAt: -1 });

  sendResponse(
    res,
    200,
    { banner: banner || null },
    banner ? "Banner fetched successfully" : "No banner found",
  );
});

module.exports = {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerByCategory,
};
