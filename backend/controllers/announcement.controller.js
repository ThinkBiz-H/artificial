const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const Announcement = require("../models/Announcement");
const { invalidate } = require("../services/cache.service");

// ======================
// Get Active Announcements (public marquee feed)
// ======================
const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ isActive: true }).sort(
    "sortOrder",
  );

  sendResponse(
    res,
    200,
    { announcements, count: announcements.length },
    "Announcements fetched successfully",
  );
});

// ======================
// Get All Announcements (admin)
// ======================
const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().sort("sortOrder");

  sendResponse(
    res,
    200,
    { announcements, count: announcements.length },
    "Announcements fetched successfully",
  );
});

// ======================
// Create Announcement
// ======================
const createAnnouncement = asyncHandler(async (req, res) => {
  const { text, sortOrder, isActive, scrollSpeed, repeat } = req.body;

  const announcement = await Announcement.create({
    text,
    sortOrder,
    isActive,
    scrollSpeed,
    repeat,
  });

  await invalidate("announcements:*");

  sendResponse(
    res,
    201,
    { announcement },
    "Announcement created successfully",
  );
});

// ======================
// Update Announcement
// ======================
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, "Announcement not found");

  ["text", "sortOrder", "isActive", "scrollSpeed", "repeat"].forEach(
    (field) => {
      if (req.body[field] !== undefined) announcement[field] = req.body[field];
    },
  );

  await announcement.save();
  await invalidate("announcements:*");

  sendResponse(
    res,
    200,
    { announcement },
    "Announcement updated successfully",
  );
});

// ======================
// Reorder
// ======================
const reorderAnnouncements = asyncHandler(async (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    throw new ApiError(400, "order must be a non-empty array of ids");
  }

  await Promise.all(
    order.map((id, index) =>
      Announcement.findByIdAndUpdate(id, { sortOrder: index }),
    ),
  );

  const announcements = await Announcement.find().sort("sortOrder");

  await invalidate("announcements:*");

  sendResponse(
    res,
    200,
    { announcements },
    "Announcements reordered successfully",
  );
});

// ======================
// Delete Announcement
// ======================
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, "Announcement not found");

  await announcement.deleteOne();
  await invalidate("announcements:*");

  sendResponse(res, 200, {}, "Announcement deleted successfully");
});

module.exports = {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  reorderAnnouncements,
  deleteAnnouncement,
};
