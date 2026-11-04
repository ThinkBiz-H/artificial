/**
 * The per-unit price a buyer pays — used by the cart, the checkout quote and
 * order creation, so all three always agree.
 *
 *   base  = wholesale (sale) price, else the list price (variant first)
 *   dealer / distributor accounts (User.customerType) get Product.dealerPrice
 *     (for a variant: the same % saving off the variant's list price)
 *   bulk tiers (Product.bulkPricing [{ minQty, discountPercent }]) take the
 *     best tier the quantity reaches off the base price
 *
 * The buyer gets the lowest of these, never more than the base price.
 */
const round2 = (n) => Math.round(n * 100) / 100;

const basePrice = (product, variant) => {
  const src = variant || product;
  return src.salePrice && src.salePrice > 0 ? src.salePrice : src.price;
};

/** Best bulk tier for a quantity, or null. */
const bulkTierFor = (product, quantity) =>
  (product?.bulkPricing || [])
    .filter((t) => t && t.minQty > 0 && t.discountPercent > 0 && quantity >= t.minQty)
    .sort((a, b) => b.discountPercent - a.discountPercent)[0] || null;

const unitPrice = ({ product, variant = null, quantity = 1, customerType = "wholesale" }) => {
  const base = basePrice(product, variant);
  const candidates = [base];

  const dealerAccount = customerType === "dealer" || customerType === "distributor";
  if (dealerAccount && product.dealerPrice > 0 && product.price > 0) {
    if (!variant) candidates.push(product.dealerPrice);
    else candidates.push(variant.price * (product.dealerPrice / product.price));
  }

  const tier = bulkTierFor(product, quantity);
  if (tier) candidates.push(base * (1 - Math.min(tier.discountPercent, 90) / 100));

  const price = round2(Math.min(...candidates.filter((n) => Number.isFinite(n) && n > 0)));
  return { price, base: round2(base), tier, dealer: dealerAccount && product.dealerPrice > 0 };
};

module.exports = { unitPrice, bulkTierFor, basePrice };
