/**
 * Publishes draft products that are ready to sell — e.g. the catalogue
 * imported by `npm run catalog:import -- <site> --apply` (which imports as
 * drafts). Until published, the storefront (website + app) hides them and
 * every category that only contains them.
 *
 *   npm run catalog:publish            # dry run — lists what would be published
 *   npm run catalog:publish -- --apply # publishes them
 *
 * A draft is published only when it is complete: not deleted, price > 0,
 * at least one image, and assigned to an active category. Inactive products
 * and incomplete drafts are left untouched (finish them in Admin > Products).
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const { invalidate } = require("../services/cache.service");

const APPLY = process.argv.includes("--apply");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const activeCategoryIds = await Category.find({ status: "active", isDeleted: { $ne: true } }).distinct("_id");
  const ready = {
    status: "draft",
    isDeleted: false,
    price: { $gt: 0 },
    "images.0": { $exists: true },
    category: { $in: activeCategoryIds },
  };

  const drafts = await Product.find({ status: "draft", isDeleted: false }).select("title price images category").lean();
  const readyIds = new Set((await Product.find(ready).distinct("_id")).map(String));

  for (const p of drafts) console.log(`${readyIds.has(String(p._id)) ? "publish" : "skip   "}  ${p.title}`);
  console.log(`\n${readyIds.size} of ${drafts.length} draft product(s) ready to publish.`);

  if (!APPLY) {
    console.log("Dry run — re-run with --apply to publish.");
  } else if (readyIds.size) {
    const { modifiedCount } = await Product.updateMany(ready, { $set: { status: "active" } });
    await Promise.all([invalidate("products:*"), invalidate("categories:*"), invalidate("home:*")]);
    console.log(`Published ${modifiedCount} product(s).`);
  }

  await mongoose.disconnect();
})().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
