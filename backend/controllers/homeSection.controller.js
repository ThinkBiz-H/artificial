const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const HomeSection = require("../models/HomeSection");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinary.service");
const { invalidate } = require("../services/cache.service");

// ======================
// Get Active Sections
// ======================
const getActiveSections = asyncHandler(async (req, res) => {
  const sections = await HomeSection.find({ isActive: true }).sort("sortOrder");

  sendResponse(
    res,
    200,
    { sections, count: sections.length },
    "Home sections fetched successfully",
  );
});

// ======================
// Get All Sections
// ======================
const getAllSections = asyncHandler(async (req, res) => {
  const sections = await HomeSection.find().sort("sortOrder");

  sendResponse(
    res,
    200,
    { sections, count: sections.length },
    "Home sections fetched successfully",
  );
});

// ======================
// Parse Config
// ======================
const parseConfig = (raw) => {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") return raw;

  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "config must be valid JSON");
  }
};

// ======================
// Create Section
// ======================
const createSection = asyncHandler(async (req, res) => {
  const { type, title, subtitle, content, sortOrder, isActive } = req.body;

  const config = parseConfig(req.body.config) || {};

  const button = req.body.button
    ? typeof req.body.button === "string"
      ? JSON.parse(req.body.button)
      : req.body.button
    : undefined;

  let image;
  let videos = [];
  let gallery = [];

  // Upload Image
  if (req.files?.image?.[0]) {
    const result = await uploadToCloudinary(
      req.files.image[0].buffer,
      "ecommerce/home-sections",
    );

    image = {
      url: result.url,
      publicId: result.publicId,
    };
  }

  // Upload Videos
  if (req.files?.videos?.length) {
    for (const file of req.files.videos) {
      const result = await uploadToCloudinary(
        file.buffer,
        "ecommerce/home-sections",
        {
          resourceType: "video",
        },
      );

      videos.push({
        url: result.url,
        publicId: result.publicId,
      });
    }
  }

  // Upload Gallery Images
  if (req.files?.gallery?.length) {
    for (const file of req.files.gallery) {
      const result = await uploadToCloudinary(
        file.buffer,
        "ecommerce/home-sections",
      );

      gallery.push({
        url: result.url,
        publicId: result.publicId,
      });
    }
  }

  const section = await HomeSection.create({
    type,
    title,
    subtitle,
    content,
    sortOrder,
    isActive,
    config,
    button,
    image,
    videos,
    gallery,
  });

  await invalidate("home-sections:*");

  sendResponse(res, 201, { section }, "Home section created successfully");
});

// ======================
// Update Section
// ======================
const updateSection = asyncHandler(async (req, res) => {
  const section = await HomeSection.findById(req.params.id);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  // Update Image
  if (req.files?.image?.[0]) {
    if (section.image?.publicId) {
      await deleteFromCloudinary(section.image.publicId);
    }

    const result = await uploadToCloudinary(
      req.files.image[0].buffer,
      "ecommerce/home-sections",
    );

    section.image = {
      url: result.url,
      publicId: result.publicId,
    };
  }

  // Update Videos
  if (req.files?.videos?.length) {
    if (section.videos?.length) {
      for (const video of section.videos) {
        if (video.publicId) {
          await deleteFromCloudinary(video.publicId, "video");
        }
      }
    }

    const uploadedVideos = [];

    for (const file of req.files.videos) {
      const result = await uploadToCloudinary(
        file.buffer,
        "ecommerce/home-sections",
        {
          resourceType: "video",
        },
      );

      uploadedVideos.push({
        url: result.url,
        publicId: result.publicId,
      });
    }

    section.videos = uploadedVideos;
  }

  // Update Gallery
  if (req.files?.gallery?.length) {
    if (section.gallery?.length) {
      for (const item of section.gallery) {
        if (item.publicId) {
          await deleteFromCloudinary(item.publicId);
        }
      }
    }

    const uploadedGallery = [];

    for (const file of req.files.gallery) {
      const result = await uploadToCloudinary(
        file.buffer,
        "ecommerce/home-sections",
      );

      uploadedGallery.push({
        url: result.url,
        publicId: result.publicId,
      });
    }

    section.gallery = uploadedGallery;
  }

  // Update Fields
  ["type", "title", "subtitle", "content", "sortOrder", "isActive"].forEach(
    (field) => {
      if (req.body[field] !== undefined) {
        section[field] = req.body[field];
      }
    },
  );

  // Config
  const config = parseConfig(req.body.config);
  if (config !== undefined) {
    section.config = config;
  }

  // Button
  if (req.body.button !== undefined) {
    section.button =
      typeof req.body.button === "string"
        ? JSON.parse(req.body.button)
        : req.body.button;
  }

  await section.save();

  await invalidate("home-sections:*");

  sendResponse(res, 200, { section }, "Home section updated successfully");
});

// ======================
// Reorder
// ======================
const reorderSections = asyncHandler(async (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    throw new ApiError(400, "order must be a non-empty array of ids");
  }

  await Promise.all(
    order.map((id, index) =>
      HomeSection.findByIdAndUpdate(id, {
        sortOrder: index,
      }),
    ),
  );

  const sections = await HomeSection.find().sort("sortOrder");

  await invalidate("home-sections:*");

  sendResponse(res, 200, { sections }, "Home sections reordered successfully");
});

// ======================
// Delete Section
// ======================
const deleteSection = asyncHandler(async (req, res) => {
  const section = await HomeSection.findById(req.params.id);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  if (section.image?.publicId) {
    await deleteFromCloudinary(section.image.publicId);
  }

  if (section.videos?.length) {
    for (const video of section.videos) {
      if (video.publicId) {
        await deleteFromCloudinary(video.publicId, "video");
      }
    }
  }

  if (section.gallery?.length) {
    for (const item of section.gallery) {
      if (item.publicId) {
        await deleteFromCloudinary(item.publicId);
      }
    }
  }

  if (section.slides?.length) {
    for (const slide of section.slides) {
      if (slide.desktopImage?.publicId) {
        await deleteFromCloudinary(slide.desktopImage.publicId);
      }
      if (slide.mobileImage?.publicId) {
        await deleteFromCloudinary(slide.mobileImage.publicId);
      }
    }
  }

  if (section.reels?.length) {
    for (const reel of section.reels) {
      if (reel.video?.publicId) {
        await deleteFromCloudinary(reel.video.publicId, "video");
      }
      if (reel.thumbnail?.publicId) {
        await deleteFromCloudinary(reel.thumbnail.publicId);
      }
    }
  }

  await section.deleteOne();

  await invalidate("home-sections:*");

  sendResponse(res, 200, {}, "Home section deleted successfully");
});

// ======================
// Hero Slides
// ======================
const addSlide = asyncHandler(async (req, res) => {
  const section = await HomeSection.findById(req.params.sectionId);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  if (!req.files?.desktopImage?.[0]) {
    throw new ApiError(400, "Desktop image is required");
  }

  const desktopResult = await uploadToCloudinary(
    req.files.desktopImage[0].buffer,
    "ecommerce/home-sections/slides",
  );

  let mobileImage;
  if (req.files?.mobileImage?.[0]) {
    const mobileResult = await uploadToCloudinary(
      req.files.mobileImage[0].buffer,
      "ecommerce/home-sections/slides",
    );
    mobileImage = { url: mobileResult.url, publicId: mobileResult.publicId };
  }

  section.slides.push({
    desktopImage: { url: desktopResult.url, publicId: desktopResult.publicId },
    mobileImage,
    title: req.body.title,
    subtitle: req.body.subtitle,
    description: req.body.description,
    buttonText: req.body.buttonText,
    buttonLink: req.body.buttonLink,
    order: req.body.order !== undefined ? Number(req.body.order) : section.slides.length,
    active: req.body.active !== undefined ? req.body.active === "true" || req.body.active === true : true,
  });

  await section.save();

  await invalidate("home-sections:*");

  sendResponse(res, 201, { section }, "Slide added successfully");
});

const updateSlide = asyncHandler(async (req, res) => {
  const section = await HomeSection.findById(req.params.sectionId);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  const slide = section.slides.id(req.params.slideId);

  if (!slide) {
    throw new ApiError(404, "Slide not found");
  }

  if (req.files?.desktopImage?.[0]) {
    if (slide.desktopImage?.publicId) {
      await deleteFromCloudinary(slide.desktopImage.publicId);
    }
    const result = await uploadToCloudinary(
      req.files.desktopImage[0].buffer,
      "ecommerce/home-sections/slides",
    );
    slide.desktopImage = { url: result.url, publicId: result.publicId };
  }

  if (req.files?.mobileImage?.[0]) {
    if (slide.mobileImage?.publicId) {
      await deleteFromCloudinary(slide.mobileImage.publicId);
    }
    const result = await uploadToCloudinary(
      req.files.mobileImage[0].buffer,
      "ecommerce/home-sections/slides",
    );
    slide.mobileImage = { url: result.url, publicId: result.publicId };
  }

  ["title", "subtitle", "description", "buttonText", "buttonLink"].forEach((field) => {
    if (req.body[field] !== undefined) {
      slide[field] = req.body[field];
    }
  });

  if (req.body.order !== undefined) {
    slide.order = Number(req.body.order);
  }

  if (req.body.active !== undefined) {
    slide.active = req.body.active === "true" || req.body.active === true;
  }

  await section.save();

  await invalidate("home-sections:*");

  sendResponse(res, 200, { section }, "Slide updated successfully");
});

const deleteSlide = asyncHandler(async (req, res) => {
  const section = await HomeSection.findById(req.params.sectionId);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  const slide = section.slides.id(req.params.slideId);

  if (!slide) {
    throw new ApiError(404, "Slide not found");
  }

  if (slide.desktopImage?.publicId) {
    await deleteFromCloudinary(slide.desktopImage.publicId);
  }
  if (slide.mobileImage?.publicId) {
    await deleteFromCloudinary(slide.mobileImage.publicId);
  }

  slide.deleteOne();

  await section.save();

  await invalidate("home-sections:*");

  sendResponse(res, 200, { section }, "Slide deleted successfully");
});

const reorderSlides = asyncHandler(async (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    throw new ApiError(400, "order must be a non-empty array of ids");
  }

  const section = await HomeSection.findById(req.params.sectionId);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  order.forEach((id, index) => {
    const slide = section.slides.id(id);
    if (slide) {
      slide.order = index;
    }
  });

  await section.save();

  await invalidate("home-sections:*");

  sendResponse(res, 200, { section }, "Slides reordered successfully");
});

// ======================
// Reels
// ======================
const addReel = asyncHandler(async (req, res) => {
  const section = await HomeSection.findById(req.params.sectionId);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  if (!req.files?.video?.[0]) {
    throw new ApiError(400, "Reel video is required");
  }

  const videoResult = await uploadToCloudinary(
    req.files.video[0].buffer,
    "ecommerce/home-sections/reels",
    { resourceType: "video" },
  );

  let thumbnail;
  if (req.files?.thumbnail?.[0]) {
    const thumbResult = await uploadToCloudinary(
      req.files.thumbnail[0].buffer,
      "ecommerce/home-sections/reels",
    );
    thumbnail = { url: thumbResult.url, publicId: thumbResult.publicId };
  }

  section.reels.push({
    video: { url: videoResult.url, publicId: videoResult.publicId },
    thumbnail,
    title: req.body.title,
    link: req.body.link,
    order: req.body.order !== undefined ? Number(req.body.order) : section.reels.length,
    active: req.body.active !== undefined ? req.body.active === "true" || req.body.active === true : true,
  });

  await section.save();

  await invalidate("home-sections:*");

  sendResponse(res, 201, { section }, "Reel added successfully");
});

const updateReel = asyncHandler(async (req, res) => {
  const section = await HomeSection.findById(req.params.sectionId);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  const reel = section.reels.id(req.params.reelId);

  if (!reel) {
    throw new ApiError(404, "Reel not found");
  }

  if (req.files?.video?.[0]) {
    if (reel.video?.publicId) {
      await deleteFromCloudinary(reel.video.publicId, "video");
    }
    const result = await uploadToCloudinary(
      req.files.video[0].buffer,
      "ecommerce/home-sections/reels",
      { resourceType: "video" },
    );
    reel.video = { url: result.url, publicId: result.publicId };
  }

  if (req.files?.thumbnail?.[0]) {
    if (reel.thumbnail?.publicId) {
      await deleteFromCloudinary(reel.thumbnail.publicId);
    }
    const result = await uploadToCloudinary(
      req.files.thumbnail[0].buffer,
      "ecommerce/home-sections/reels",
    );
    reel.thumbnail = { url: result.url, publicId: result.publicId };
  }

  ["title", "link"].forEach((field) => {
    if (req.body[field] !== undefined) {
      reel[field] = req.body[field];
    }
  });

  if (req.body.order !== undefined) {
    reel.order = Number(req.body.order);
  }

  if (req.body.active !== undefined) {
    reel.active = req.body.active === "true" || req.body.active === true;
  }

  await section.save();

  await invalidate("home-sections:*");

  sendResponse(res, 200, { section }, "Reel updated successfully");
});

const deleteReel = asyncHandler(async (req, res) => {
  const section = await HomeSection.findById(req.params.sectionId);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  const reel = section.reels.id(req.params.reelId);

  if (!reel) {
    throw new ApiError(404, "Reel not found");
  }

  if (reel.video?.publicId) {
    await deleteFromCloudinary(reel.video.publicId, "video");
  }
  if (reel.thumbnail?.publicId) {
    await deleteFromCloudinary(reel.thumbnail.publicId);
  }

  reel.deleteOne();

  await section.save();

  await invalidate("home-sections:*");

  sendResponse(res, 200, { section }, "Reel deleted successfully");
});

const reorderReels = asyncHandler(async (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    throw new ApiError(400, "order must be a non-empty array of ids");
  }

  const section = await HomeSection.findById(req.params.sectionId);

  if (!section) {
    throw new ApiError(404, "Home section not found");
  }

  order.forEach((id, index) => {
    const reel = section.reels.id(id);
    if (reel) {
      reel.order = index;
    }
  });

  await section.save();

  await invalidate("home-sections:*");

  sendResponse(res, 200, { section }, "Reels reordered successfully");
});

module.exports = {
  getActiveSections,
  getAllSections,
  createSection,
  updateSection,
  reorderSections,
  deleteSection,
  addSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
  addReel,
  updateReel,
  deleteReel,
  reorderReels,
};
