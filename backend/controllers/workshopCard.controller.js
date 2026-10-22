const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const WorkshopCard = require("../models/WorkshopCard");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinary.service");
const { invalidate } = require("../services/cache.service");

// ======================
// Get Active Cards (public)
// ======================
const getActiveCards = asyncHandler(async (req, res) => {
  const cards = await WorkshopCard.find({ isActive: true }).sort("order");

  sendResponse(res, 200, { cards, count: cards.length }, "Workshop cards fetched successfully");
});

// ======================
// Get All Cards (admin)
// ======================
const getAllCards = asyncHandler(async (req, res) => {
  const cards = await WorkshopCard.find().sort("order");

  sendResponse(res, 200, { cards, count: cards.length }, "Workshop cards fetched successfully");
});

// ======================
// Create Card
// ======================
const createCard = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image is required");
  }

  const result = await uploadToCloudinary(req.file.buffer, "ecommerce/workshop-cards");

  const count = await WorkshopCard.countDocuments();

  const card = await WorkshopCard.create({
    image: { url: result.url, publicId: result.publicId },
    heading: req.body.heading,
    shortDescription: req.body.shortDescription,
    order: req.body.order !== undefined ? Number(req.body.order) : count,
    isActive: req.body.isActive !== undefined ? req.body.isActive === "true" || req.body.isActive === true : true,
  });

  await invalidate("workshop-cards:*");

  sendResponse(res, 201, { card }, "Workshop card created successfully");
});

// ======================
// Update Card
// ======================
const updateCard = asyncHandler(async (req, res) => {
  const card = await WorkshopCard.findById(req.params.id);

  if (!card) {
    throw new ApiError(404, "Workshop card not found");
  }

  if (req.file) {
    if (card.image?.publicId) {
      await deleteFromCloudinary(card.image.publicId);
    }
    const result = await uploadToCloudinary(req.file.buffer, "ecommerce/workshop-cards");
    card.image = { url: result.url, publicId: result.publicId };
  }

  ["heading", "shortDescription"].forEach((field) => {
    if (req.body[field] !== undefined) {
      card[field] = req.body[field];
    }
  });

  if (req.body.order !== undefined) {
    card.order = Number(req.body.order);
  }

  if (req.body.isActive !== undefined) {
    card.isActive = req.body.isActive === "true" || req.body.isActive === true;
  }

  await card.save();

  await invalidate("workshop-cards:*");

  sendResponse(res, 200, { card }, "Workshop card updated successfully");
});

// ======================
// Delete Card
// ======================
const deleteCard = asyncHandler(async (req, res) => {
  const card = await WorkshopCard.findById(req.params.id);

  if (!card) {
    throw new ApiError(404, "Workshop card not found");
  }

  if (card.image?.publicId) {
    await deleteFromCloudinary(card.image.publicId);
  }

  await card.deleteOne();

  await invalidate("workshop-cards:*");

  sendResponse(res, 200, {}, "Workshop card deleted successfully");
});

// ======================
// Reorder Cards
// ======================
const reorderCards = asyncHandler(async (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    throw new ApiError(400, "order must be a non-empty array of ids");
  }

  await Promise.all(
    order.map((id, index) => WorkshopCard.findByIdAndUpdate(id, { order: index })),
  );

  const cards = await WorkshopCard.find().sort("order");

  await invalidate("workshop-cards:*");

  sendResponse(res, 200, { cards }, "Workshop cards reordered successfully");
});

module.exports = {
  getActiveCards,
  getAllCards,
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
};
