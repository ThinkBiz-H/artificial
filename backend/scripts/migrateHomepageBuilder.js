/**
 * One-time, idempotent migration for the Homepage Builder upgrade
 * (Hero Slider + Reels Management).
 *
 * Moves legacy single-hero-image / single-reels-videos data into the new
 * `HomeSection.slides[]` / `HomeSection.reels[]` subdocument arrays, then
 * clears the legacy fields on the same document (move, not copy) so each
 * Cloudinary asset always has exactly one owner going forward.
 *
 * Safe to re-run: a hero doc is only touched while `slides.length === 0`,
 * a reels doc only while `reels.length === 0`.
 *
 * Usage: node scripts/migrateHomepageBuilder.js
 *   (or: npm run migrate:homepage-builder, from backend/)
 *
 * Do NOT run this against production data without first running it against
 * a dev/staging copy of the database and verifying the storefront still
 * renders correctly.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const HomeSection = require("../models/HomeSection");

async function migrateHero(section) {
  if (section.slides.length > 0) return false;

  const legacySlides = Array.isArray(section.config?.slides) ? section.config.slides : [];

  if (legacySlides.length > 0) {
    legacySlides.forEach((slide, index) => {
      if (!slide?.image && !slide?.video) return;
      section.slides.push({
        desktopImage: { url: slide.image || slide.video || "", publicId: "" },
        title: slide.title || "",
        order: index,
        active: true,
      });
    });
  } else if (section.image?.url) {
    section.slides.push({
      desktopImage: { url: section.image.url, publicId: section.image.publicId || "" },
      title: section.title || "",
      subtitle: section.subtitle || "",
      buttonText: section.button?.label || "",
      buttonLink: section.button?.link || "",
      order: 0,
      active: true,
    });
    // Move, not copy: the slide now owns this Cloudinary asset.
    section.image = { url: "", publicId: "" };
  } else {
    return false;
  }

  await section.save();
  return true;
}

async function migrateReels(section) {
  if (section.reels.length > 0 || !section.videos?.length) return false;

  section.videos.forEach((video, index) => {
    if (!video?.url) return;
    section.reels.push({
      video: { url: video.url, publicId: video.publicId || "" },
      order: index,
      active: true,
    });
  });

  // Move, not copy: the reels now own these Cloudinary assets.
  section.videos = [];

  await section.save();
  return true;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const heroSections = await HomeSection.find({ type: "hero" });
  let heroMigrated = 0;
  for (const section of heroSections) {
    if (await migrateHero(section)) heroMigrated += 1;
  }

  const reelsSections = await HomeSection.find({ type: "reels" });
  let reelsMigrated = 0;
  for (const section of reelsSections) {
    if (await migrateReels(section)) reelsMigrated += 1;
  }

  console.log(`Hero sections migrated: ${heroMigrated}/${heroSections.length}`);
  console.log(`Reels sections migrated: ${reelsMigrated}/${reelsSections.length}`);

  await mongoose.disconnect();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
