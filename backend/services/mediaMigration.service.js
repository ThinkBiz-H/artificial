const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { uploadToCloudinary, isCloudinaryConfigured, LOCAL_PREFIX, UPLOAD_ROOT } = require("./cloudinary.service");
const { invalidate } = require("./cache.service");

/** Every {url, publicId: "local:…"} object inside a raw document, with its path. */
function collectLocal(value, at = [], out = []) {
  if (Array.isArray(value)) value.forEach((v, i) => collectLocal(v, [...at, i], out));
  else if (
    value &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    !(value instanceof mongoose.Types.ObjectId) &&
    !ArrayBuffer.isView(value) &&
    value._bsontype !== "Binary"
  ) {
    if (typeof value.publicId === "string" && value.publicId.startsWith(LOCAL_PREFIX)) out.push({ path: at, ref: value });
    else for (const [k, v] of Object.entries(value)) if (k !== "_id") collectLocal(v, [...at, k], out);
  }
  return out;
}

/**
 * Finds media stored locally (Cloudinary fallback) across every collection.
 *   mode "count"   → just counts
 *   mode "migrate" → uploads each file to Cloudinary once and rewrites every reference
 *   mode "rebase"  → points local URLs at another origin (no Cloudinary needed)
 */
async function migrateLocalMedia({ mode = "count", rebase = "", deleteLocal = false } = {}) {
  if (mode === "migrate" && !isCloudinaryConfigured()) {
    const err = new Error("Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET first.");
    err.statusCode = 400;
    throw err;
  }
  const base = String(rebase || "").replace(/\/+$/, "");
  if (mode === "rebase" && !/^https?:\/\/[^/]+/.test(base)) {
    const err = new Error("Give a full origin, e.g. https://api.example.com");
    err.statusCode = 400;
    throw err;
  }
  const db = mongoose.connection.db;
  const moved = new Map();
  const stats = { documents: 0, references: 0, files: 0, missing: 0 };

  for (const { name } of await db.listCollections().toArray()) {
    const col = db.collection(name);
    for await (const doc of col.find({}, { batchSize: 200 })) {
      const refs = collectLocal(doc);
      if (!refs.length) continue;
      stats.documents++;
      stats.references += refs.length;
      if (mode === "count") continue;

      const $set = {};
      for (const { path: at, ref } of refs) {
        const relative = ref.publicId.slice(LOCAL_PREFIX.length);
        if (mode === "rebase") {
          $set[[...at, "url"].join(".")] = `${base}/uploads/${relative}`;
          continue;
        }
        let target = moved.get(ref.publicId);
        if (!target) {
          const file = path.join(UPLOAD_ROOT, relative);
          if (!fs.existsSync(file)) {
            stats.missing++;
            continue;
          }
          const video = /\.(mp4|webm|mov)$/i.test(file);
          const up = await uploadToCloudinary(fs.readFileSync(file), path.posix.dirname(relative), { resourceType: video ? "video" : "image", forceCloudinary: true });
          target = { url: up.url, publicId: up.publicId };
          moved.set(ref.publicId, target);
          stats.files++;
        }
        $set[[...at, "url"].join(".")] = target.url;
        $set[[...at, "publicId"].join(".")] = target.publicId;
      }
      if (Object.keys($set).length) await col.updateOne({ _id: doc._id }, { $set });
    }
  }

  if (mode === "migrate" && deleteLocal) {
    for (const id of moved.keys()) fs.rmSync(path.join(UPLOAD_ROOT, id.slice(LOCAL_PREFIX.length)), { force: true });
  }
  if (mode !== "count") await invalidate("*").catch(() => {});
  return stats;
}

module.exports = { migrateLocalMedia, collectLocal };
