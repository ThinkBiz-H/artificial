const Offer = require("../models/Offer");
const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Category = require("../models/Category");
const { invalidate } = require("./cache.service");
const logger = require("../utils/logger");

/** Discounted price for a list price (never below 1, whole rupees). */
const discounted = (offer, listPrice) => {
  const price = Number(listPrice) || 0;
  const off = offer.discountType === "flat" ? offer.value : (price * offer.value) / 100;
  return Math.max(1, Math.round(price - off));
};

/** Active, non-deleted products the offer targets (store-wide when none are chosen). */
const targetProducts = async (offer) => {
  const filter = { isDeleted: false, status: "active" };
  const or = [];
  if (offer.products?.length) or.push({ _id: { $in: offer.products } });
  if (offer.categories?.length) {
    const ids = (await Promise.all(offer.categories.map((c) => Category.getSelfAndDescendantIds(c)))).flat();
    or.push({ category: { $in: ids } });
  }
  if (or.length) filter.$or = or;
  else if (offer.kind !== "store" && offer.kind !== "festival") return [];
  // A product already in another running offer keeps that one.
  filter.$and = [{ $or: [{ "offer.id": null }, { "offer.id": { $exists: false } }, { "offer.id": offer._id }] }];
  return Product.find(filter).select("_id price salePrice hasVariants offer");
};

/** Starts an offer: writes discounted sale prices and remembers the old ones. */
const applyOffer = async (offer) => {
  const products = await targetProducts(offer);
  const applied = [];
  for (const product of products) {
    const next = discounted(offer, product.price);
    // Only discount when the offer beats the current price.
    const current = product.salePrice > 0 ? product.salePrice : product.price;
    const badge = { id: offer._id, name: offer.name, endsAt: offer.endsAt };
    if (next < current) {
      // Only prices that actually change are recorded (and restored later).
      applied.push({ product: product._id, variant: null, previousSalePrice: product.salePrice > 0 ? product.salePrice : null });
      await Product.updateOne({ _id: product._id }, { $set: { salePrice: next, offer: badge } });
    } else {
      await Product.updateOne({ _id: product._id }, { $set: { offer: badge } });
    }
    if (product.hasVariants) {
      const variants = await Variant.find({ product: product._id }).select("_id price salePrice");
      for (const v of variants) {
        const vNext = discounted(offer, v.price);
        const vCurrent = v.salePrice > 0 ? v.salePrice : v.price;
        if (vNext < vCurrent) {
          applied.push({ product: product._id, variant: v._id, previousSalePrice: v.salePrice > 0 ? v.salePrice : null });
          await Variant.updateOne({ _id: v._id }, { $set: { salePrice: vNext } });
        }
      }
    }
  }
  offer.applied = applied;
  offer.status = "running";
  offer.appliedAt = new Date();
  await offer.save();
  return applied.length;
};

/** Ends an offer: restores every price it changed and clears the badge. */
const removeOffer = async (offer, status = "ended") => {
  for (const a of offer.applied || []) {
    // null = there was no sale price before the offer.
    const update = a.previousSalePrice == null ? { $unset: { salePrice: 1 } } : { $set: { salePrice: a.previousSalePrice } };
    if (a.variant) await Variant.updateOne({ _id: a.variant }, update);
    else await Product.updateOne({ _id: a.product }, update);
  }
  await Product.updateMany({ "offer.id": offer._id }, { $set: { offer: null } });
  offer.applied = [];
  offer.status = status;
  await offer.save();
};

/** Starts due offers and ends expired / disabled ones. Safe to call repeatedly. */
const syncOffers = async () => {
  const now = new Date();
  let changed = 0;
  const toEnd = await Offer.find({ status: "running", $or: [{ isActive: false }, { endsAt: { $lte: now } }, { startsAt: { $gt: now } }] });
  for (const offer of toEnd) {
    // Moved to a later start → back to scheduled; disabled or expired → ended.
    await removeOffer(offer, offer.isActive && offer.endsAt > now ? "scheduled" : "ended");
    changed++;
  }
  const toStart = await Offer.find({ status: "scheduled", isActive: true, startsAt: { $lte: now }, endsAt: { $gt: now } });
  for (const offer of toStart) {
    await applyOffer(offer);
    changed++;
  }
  if (changed) {
    await invalidate("products:*");
    logger.info(`Offers synced: ${changed} started/ended`);
  }
  return changed;
};

module.exports = { applyOffer, removeOffer, syncOffers, discounted };
