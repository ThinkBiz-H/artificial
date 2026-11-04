const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const Offer = require("../models/Offer");
const { removeOffer, syncOffers } = require("../services/offer.service");

const FIELDS = ["name", "kind", "discountType", "value", "categories", "products", "startsAt", "endsAt", "isActive", "description"];

/** Validated offer fields from the request body. */
const readBody = (body, partial = false) => {
  const data = {};
  FIELDS.forEach((f) => body[f] !== undefined && (data[f] = body[f]));
  if (!partial && !String(data.name || "").trim()) throw new ApiError(400, "Offer name is required");
  if (data.value !== undefined) {
    data.value = Number(data.value);
    if (!Number.isFinite(data.value) || data.value <= 0) throw new ApiError(400, "Discount value must be more than 0");
  }
  const type = data.discountType;
  if (type === "percentage" && data.value > 90) throw new ApiError(400, "Percentage discount can be at most 90%");
  ["categories", "products"].forEach((k) => {
    if (data[k] !== undefined) data[k] = (Array.isArray(data[k]) ? data[k] : []).filter((id) => mongoose.Types.ObjectId.isValid(id));
  });
  if (!partial && !data.endsAt) throw new ApiError(400, "Choose when the offer ends");
  if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) throw new ApiError(400, "The offer must end after it starts");
  return data;
};

// @desc    List offers (newest first)
// @route   GET /api/v1/offers
// @access  Private/Admin
const getOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find().select("-applied").populate("categories", "name slug").populate("products", "title slug").sort("-createdAt").lean();
  const counts = await Offer.aggregate([{ $project: { n: { $size: "$applied" } } }]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  sendResponse(res, 200, { offers: offers.map((o) => ({ ...o, appliedCount: byId.get(String(o._id)) || 0 })) }, "Offers fetched");
});

// @desc    Create an offer (starts automatically at startsAt)
// @route   POST /api/v1/offers
// @access  Private/Admin
const createOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.create({ ...readBody(req.body), status: "scheduled" });
  await syncOffers();
  sendResponse(res, 201, { offer: await Offer.findById(offer._id).select("-applied") }, "Offer created");
});

// @desc    Update an offer — a running offer is re-applied with the new terms
// @route   PUT /api/v1/offers/:id
// @access  Private/Admin
const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new ApiError(404, "Offer not found");
  const data = readBody(req.body, true);
  if (offer.status === "running") await removeOffer(offer, "scheduled");
  Object.assign(offer, data);
  if (offer.endsAt <= offer.startsAt) throw new ApiError(400, "The offer must end after it starts");
  offer.status = offer.isActive && offer.endsAt > new Date() ? "scheduled" : "ended";
  await offer.save();
  await syncOffers();
  sendResponse(res, 200, { offer: await Offer.findById(offer._id).select("-applied") }, "Offer updated");
});

// @desc    Delete an offer (restores prices first)
// @route   DELETE /api/v1/offers/:id
// @access  Private/Admin
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new ApiError(404, "Offer not found");
  if (offer.status === "running") await removeOffer(offer);
  await offer.deleteOne();
  await syncOffers();
  sendResponse(res, 200, {}, "Offer deleted");
});

module.exports = { getOffers, createOffer, updateOffer, deleteOffer };
