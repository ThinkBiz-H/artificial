/**
 * Moves media stored locally (uploads/…, publicId "local:…") to Cloudinary
 * and rewrites every reference, in every collection — products, variants,
 * categories, banners, blog, settings… Run after CLOUDINARY_* is set:
 *
 *   npm run media:migrate            # dry run: counts what would move
 *   npm run media:migrate -- --apply # uploads + rewrites (safe to re-run)
 *   ... --apply --delete-local       # also removes the local files afterwards
 *   npm run media:migrate -- --rebase=https://api.example.com
 *                                    # no Cloudinary: just point local URLs at another origin
 *
 * The same migration is available in Admin > Settings > Cloudinary.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { migrateLocalMedia } = require("../services/mediaMigration.service");

const APPLY = process.argv.includes("--apply");
const DELETE_LOCAL = process.argv.includes("--delete-local");
const REBASE = process.argv.find((a) => a.startsWith("--rebase="))?.slice("--rebase=".length);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const mode = REBASE ? "rebase" : APPLY ? "migrate" : "count";
  const stats = await migrateLocalMedia({ mode, rebase: REBASE, deleteLocal: DELETE_LOCAL });
  console.log(mode === "rebase" ? `Re-based local media to ${REBASE}:` : mode === "migrate" ? "Migrated:" : "Dry run — would migrate:", stats);
  if (mode === "count") console.log("Re-run with --apply to upload to Cloudinary and update the database.");
  await mongoose.disconnect();
  process.exit(0);
})().catch(async (err) => {
  console.error("Migration failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
