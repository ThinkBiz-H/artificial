const multer = require("multer");
const ApiError = require("../utils/ApiError");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, "Only image files (jpeg, jpg, png, webp) and videos (mp4, webm, quicktime) are allowed"),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 40,
  },
});

// Files are buffered in memory, so cap the whole request too — otherwise one
// request with many max-size files could hold gigabytes of RAM. Applied to
// every handler this instance creates (single/array/fields), including the
// field sets below.
const MAX_UPLOAD_REQUEST_BYTES = 300 * 1024 * 1024;
const capRequestSize = (req, res, next) =>
  Number(req.headers["content-length"] || 0) > MAX_UPLOAD_REQUEST_BYTES
    ? next(new ApiError(413, "Upload is too large. Please upload fewer or smaller files at a time."))
    : next();
["single", "array", "fields", "any", "none"].forEach((method) => {
  const create = upload[method].bind(upload);
  upload[method] = (...args) => {
    const handler = create(...args);
    return (req, res, next) => capRequestSize(req, res, (err) => (err ? next(err) : handler(req, res, next)));
  };
});

// Customer-facing image uploads (e.g. profile photo): images only, 10MB.
const imageUpload = multer({
  storage,
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/") ? fileFilter(req, file, cb) : cb(new ApiError(400, "Only image files (jpeg, jpg, png, webp) are allowed"), false),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

const homeSectionFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "videos", maxCount: 20 },
  { name: "gallery", maxCount: 12 },
]);

const categoryBannerFields = upload.fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
]);

const heroSlideFields = upload.fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
]);

const reelFields = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

module.exports = upload;
module.exports.homeSectionFields = homeSectionFields;
module.exports.categoryBannerFields = categoryBannerFields;
module.exports.heroSlideFields = heroSlideFields;
module.exports.reelFields = reelFields;
module.exports.imageUpload = imageUpload;
