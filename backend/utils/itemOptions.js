/**
 * Jewellery option helpers shared by the cart, order creation, the order
 * confirmation email and the invoice — one place that decides a line's
 * colour / size / metal / plating and image.
 */

const attr = (variant, key) =>
  (variant?.attributes || []).find((a) => String(a.key).toLowerCase() === key)?.value || "";

const sameName = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

/** The product colour option matching a colour name (for its swatch + gallery). */
const findColorOption = (product, colorName) =>
  colorName ? (product?.colorOptions || []).find((c) => sameName(c.name, colorName)) : undefined;

/**
 * Options for a line. The variant is authoritative (it is what is actually
 * being bought); then what the shopper picked; metal/plating come from the
 * product. Variants saved before color/size fields existed fall back to
 * their `attributes`.
 */
const resolveItemOptions = ({ product, variant, color, size, colorHex }) => {
  const colorName = variant?.color || attr(variant, "color") || color || "";
  const option = findColorOption(product, colorName);
  return {
    color: colorName || undefined,
    colorHex: variant?.colorHex || option?.hex || colorHex || undefined,
    size: variant?.size || attr(variant, "size") || size || undefined,
    metal: product?.metal || undefined,
    plating: product?.plating || undefined,
  };
};

/** Line image: the variant's own image, else the colour's gallery, else the product thumbnail. */
const resolveItemImage = ({ product, variant, color }) => {
  const colorName = variant?.color || attr(variant, "color") || color;
  return (
    variant?.images?.[0]?.url ||
    findColorOption(product, colorName)?.images?.[0]?.url ||
    product?.thumbnail?.url ||
    product?.images?.[0]?.url ||
    ""
  );
};

/** "Color: Gold · Size: 2.6 · Metal: Brass · Plating: Gold Plated" (only the parts that exist). */
const formatItemOptions = (item, separator = " · ") =>
  [
    item.color && `Color: ${item.color}`,
    item.size && `Size: ${item.size}`,
    item.metal && `Metal: ${item.metal}`,
    item.plating && `Plating: ${item.plating}`,
  ]
    .filter(Boolean)
    .join(separator);

module.exports = { resolveItemOptions, resolveItemImage, formatItemOptions, findColorOption };
