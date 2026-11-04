const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');
const streamifier = require('stream');
const logger = require('../utils/logger');

/**
 * Local media fallback. When Cloudinary credentials are missing, uploads are
 * written to backend/uploads/<folder>/ (served at /uploads by app.js) instead
 * of failing, with publicId "local:<relative path>". Run
 * `npm run media:migrate` once Cloudinary is configured to move them there.
 */
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const LOCAL_PREFIX = 'local:';

const isCloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

/** Public origin for locally stored files (PUBLIC_BASE_URL, else this server on PORT). */
const publicBaseUrl = () => (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/+$/, '');

/** File extension from the first bytes (falls back to .bin). */
const sniffExtension = (buffer) => {
  const hex = buffer.subarray(0, 12).toString('hex');
  if (hex.startsWith('ffd8ff')) return 'jpg';
  if (hex.startsWith('89504e47')) return 'png';
  if (hex.startsWith('47494638')) return 'gif';
  if (hex.startsWith('52494646') && buffer.subarray(8, 12).toString() === 'WEBP') return 'webp';
  if (buffer.subarray(4, 8).toString() === 'ftyp') return 'mp4';
  if (hex.startsWith('1a45dfa3')) return 'webm';
  if (buffer.subarray(0, 5).toString().toLowerCase().startsWith('<svg') || buffer.subarray(0, 5).toString() === '<?xml') return 'svg';
  return 'bin';
};

const saveLocally = async (buffer, folder, resourceType) => {
  const ext = sniffExtension(buffer);
  const safeFolder = String(folder || 'ecommerce').replace(/[^\w/-]/g, '').replace(/^\/+|\.\./g, '');
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const relative = path.posix.join(safeFolder, name);
  const target = path.join(UPLOAD_ROOT, relative);
  await fs.promises.mkdir(path.dirname(target), { recursive: true });
  await fs.promises.writeFile(target, buffer);
  return {
    url: `${publicBaseUrl()}/uploads/${relative}`,
    publicId: `${LOCAL_PREFIX}${relative}`,
    format: ext,
    bytes: buffer.length,
    resourceType: resourceType === 'auto' ? (['mp4', 'webm'].includes(ext) ? 'video' : 'image') : resourceType,
    storage: 'local',
  };
};

/**
 * Uploads a file buffer (from multer memoryStorage) to Cloudinary.
 *
 * `options` is new (Phase 12) and fully optional — every existing call
 * site across the app calls this with just (buffer, folder) and destructures
 * only {url, publicId} from the result, so none of it changes behavior for
 * them. The extra returned fields (width/height/format/bytes/resourceType)
 * are additive, used by the new Media Manager for metadata.
 *
 * Without Cloudinary credentials the file is stored locally instead (see above).
 *
 * @param {Buffer} buffer
 * @param {String} folder
 * @param {Object} [options]
 * @param {'image'|'video'|'raw'|'auto'} [options.resourceType='image']
 * @param {Boolean} [options.optimize=true] - applies Cloudinary's automatic
 *   quality + format optimization (q_auto/f_auto) for images — this IS the
 *   "image compression/optimization" feature: real, Cloudinary-side
 *   transformation, not a custom compression pipeline reimplemented here.
 * @param {Boolean} [options.forceCloudinary=false] - never fall back (migration).
 */
const uploadToCloudinary = (buffer, folder = 'ecommerce', options = {}) => {
  const { resourceType = 'image', optimize = true, forceCloudinary = false } = options;

  if (!forceCloudinary && !isCloudinaryConfigured()) {
    logger.warn(`Cloudinary is not configured — storing upload locally in uploads/${folder}`);
    return saveLocally(buffer, folder, resourceType);
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = { folder, resource_type: resourceType };
    if (resourceType === 'image' && optimize) {
      uploadOptions.quality = 'auto';
      uploadOptions.fetch_format = 'auto';
    }

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resourceType: result.resource_type,
      });
    });

    const bufferStream = new streamifier.Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Removes an asset. Never throws: cleaning up an old file must not fail the
 * save/delete that replaced it — a failure is logged and the orphan can be
 * cleaned up later from the Cloudinary console.
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return null;
  if (publicId.startsWith(LOCAL_PREFIX)) {
    const file = path.join(UPLOAD_ROOT, publicId.slice(LOCAL_PREFIX.length));
    if (!file.startsWith(UPLOAD_ROOT)) return null;
    return fs.promises.unlink(file).catch(() => null);
  }
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  } catch (err) {
    logger.warn(`Cloudinary delete failed for ${publicId}: ${err.message}`);
    return null;
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured, LOCAL_PREFIX, UPLOAD_ROOT };
