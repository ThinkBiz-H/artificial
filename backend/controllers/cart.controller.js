const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const User = require("../models/User");
const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Coupon = require("../models/Coupon");
const { resolveItemOptions, resolveItemImage } = require("../utils/itemOptions");

const resolveLine = (item) => {
  if (item.variant && item.variant.product) {
    const v = item.variant;
    const price = v.salePrice && v.salePrice > 0 ? v.salePrice : v.price;
    return {
      price,
      stock: v.stock,
      sku: v.sku,
      title: v.product.title,
      thumbnail: v.product.thumbnail?.url,
    };
  }
  const p = item.product;
  const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;
  return {
    price,
    stock: p.stock,
    sku: p.SKU,
    title: p.title,
    thumbnail: p.thumbnail?.url,
  };
};

const computeCartTotals = (cart) => {
  let subTotal = 0;
  const items = cart
    .filter((item) => item.product) // exclude nulls (deleted products)
    .map((item) => {
      const { price } = resolveLine(item);
      const itemTotal = price * item.quantity;
      subTotal += itemTotal;
      // Options come from the live product/variant (falling back to what
      // was stored), so a renamed colour or new swatch shows up in the bag.
      const options = resolveItemOptions({
        product: item.product,
        variant: item.variant,
        color: item.color,
        size: item.size,
        colorHex: item.colorHex,
      });
      return {
        // Stable id of this cart line — lets update/remove target exactly
        // this line even when several lines share a product (different
        // colours/sizes of a simple product).
        lineId: item._id,
        product: item.product,
        variant: item.variant || null,
        quantity: item.quantity,
        color: options.color,
        size: options.size,
        colorHex: options.colorHex,
        metal: options.metal,
        plating: options.plating,
        image: resolveItemImage({ product: item.product, variant: item.variant, color: options.color }),
        price,
        itemTotal,
      };
    });
  return { items, subTotal: Math.round(subTotal * 100) / 100 };
};

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
// const addToCart = asyncHandler(async (req, res) => {
//   const { productId, quantity = 1, color, size, variantId } = req.body;

//   const product = await Product.findOne({
//     _id: productId,
//     isDeleted: false,
//     status: "active",
//   });
//   if (!product) throw new ApiError(404, "Product not found or unavailable");

//   let variant = null;
//   if (variantId) {
//     variant = await Variant.findOne({ _id: variantId, product: productId, status: "active" });
//     if (!variant) throw new ApiError(404, "Selected variant not found or unavailable");
//     if (variant.stock < quantity) throw new ApiError(400, `Only ${variant.stock} units available in stock`);
//   } else if (product.hasVariants) {
//     throw new ApiError(400, "This product has variants — please specify variantId");
//   } else if (product.stock < quantity) {
//     throw new ApiError(400, `Only ${product.stock} units available in stock`);
//   }

//   const user = await User.findById(req.user._id);

//   const existingItem = user.cart.find(
//     (item) =>
//       item.product.toString() === productId &&
//       String(item.variant || "") === String(variantId || "") &&
//       item.color === color &&
//       item.size === size,
//   );

//   if (existingItem) {
//     existingItem.quantity += Number(quantity);
//   } else {
//     user.cart.push({ product: productId, variant: variantId || null, quantity, color, size });
//   }

//   await user.save({ validateBeforeSave: false });
//   await user.populate("cart.product");
//   await user.populate("cart.variant");

//   const { items, subTotal } = computeCartTotals(user.cart);
//   sendResponse(res, 200, { cart: items, subTotal }, "Item added to cart");
// });

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:productId
// @access  Private
// const updateCartItem = asyncHandler(async (req, res) => {
//   const { quantity, variantId } = req.body;
//   if (!quantity || quantity < 1)
//     throw new ApiError(400, "Quantity must be at least 1");

//   const user = await User.findById(req.user._id);
//   const item = user.cart.find(
//     (i) =>
//       i.product.toString() === req.params.productId &&
//       String(i.variant || "") === String(variantId || i.variant || ""),
//   );
//   if (!item) throw new ApiError(404, "Item not found in cart");

//   if (item.variant) {
//     const variant = await Variant.findById(item.variant);
//     if (variant && variant.stock < quantity) {
//       throw new ApiError(400, `Only ${variant.stock} units available in stock`);
//     }
//   } else {
//     const product = await Product.findById(req.params.productId);
//     if (product && product.stock < quantity) {
//       throw new ApiError(400, `Only ${product.stock} units available in stock`);
//     }
//   }

//   item.quantity = quantity;
//   await user.save({ validateBeforeSave: false });
//   await user.populate("cart.product");
//   await user.populate("cart.variant");

//   const { items, subTotal } = computeCartTotals(user.cart);
//   sendResponse(res, 200, { cart: items, subTotal }, "Cart item updated");
// });
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color, size, colorHex, variantId } = req.body;

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    status: "active",
  });

  if (!product) {
    throw new ApiError(404, "Product not found or unavailable");
  }

  let variant = null;

  if (variantId) {
    variant = await Variant.findOne({
      _id: variantId,
      product: productId,
      status: "active",
    });

    if (!variant) {
      throw new ApiError(404, "Selected variant not found or unavailable");
    }

    // ✅ STOCK CHECK REMOVED
  } else if (product.hasVariants) {
    throw new ApiError(
      400,
      "This product has variants — please specify variantId",
    );
  }

  // ✅ PRODUCT STOCK CHECK REMOVED

  // The variant (when there is one) decides colour/size; metal/plating come
  // from the product — the client's values are only a fallback.
  const options = resolveItemOptions({ product, variant, color, size, colorHex });

  const user = await User.findById(req.user._id);

  const existingItem = user.cart.find(
    (item) =>
      item.product.toString() === productId &&
      String(item.variant || "") === String(variantId || "") &&
      (item.color || undefined) === options.color &&
      (item.size || undefined) === options.size,
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    user.cart.push({
      product: productId,
      variant: variantId || null,
      quantity: Number(quantity),
      color: options.color,
      size: options.size,
      colorHex: options.colorHex,
      metal: options.metal,
      plating: options.plating,
    });
  }

  await user.save({ validateBeforeSave: false });

  await user.populate("cart.product");
  await user.populate("cart.variant");

  const { items, subTotal } = computeCartTotals(user.cart);

  sendResponse(
    res,
    200,
    {
      cart: items,
      subTotal,
    },
    "Item added to cart",
  );
});
const updateCartItem = asyncHandler(async (req, res) => {
  const { variantId, lineId } = req.body;
  const quantity = Number(req.body.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError(400, "Quantity must be a whole number of at least 1");
  }

  const user = await User.findById(req.user._id);

  // Prefer the exact line id; fall back to product (+variant) for older clients.
  const item = lineId
    ? user.cart.find((i) => String(i._id) === String(lineId) && i.product.toString() === req.params.productId)
    : user.cart.find(
        (i) =>
          i.product.toString() === req.params.productId &&
          String(i.variant || "") === String(variantId || i.variant || ""),
      );

  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  // ❌ All stock validation removed

  item.quantity = Number(quantity);

  await user.save({ validateBeforeSave: false });

  await user.populate("cart.product");
  await user.populate("cart.variant");

  const { items, subTotal } = computeCartTotals(user.cart);

  sendResponse(res, 200, { cart: items, subTotal }, "Cart item updated");
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:productId
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  // ?lineId= removes exactly one line; ?variantId= removes that variant's
  // line(s); with neither, every line of the product (the original behaviour).
  const { variantId, lineId } = req.query;
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter((i) => {
    if (i.product.toString() !== req.params.productId) return true;
    if (lineId) return String(i._id) !== String(lineId);
    return variantId !== undefined && String(i.variant || "") !== String(variantId || "");
  });
  await user.save({ validateBeforeSave: false });
  await user.populate("cart.product");
  await user.populate("cart.variant");

  const { items, subTotal } = computeCartTotals(user.cart);
  sendResponse(res, 200, { cart: items, subTotal }, "Item removed from cart");
});

// @desc    Clear entire cart
// @route   DELETE /api/v1/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save({ validateBeforeSave: false });
  sendResponse(res, 200, { cart: [] }, "Cart cleared successfully");
});

// @desc    Get cart with computed totals
// @route   GET /api/v1/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("cart.product")
    .populate("cart.variant");
  const { items, subTotal } = computeCartTotals(user.cart);
  sendResponse(
    res,
    200,
    { cart: items, subTotal },
    "Cart fetched successfully",
  );
});

// @desc    Apply coupon to cart (validation only; final calc happens at order time)
// @route   POST /api/v1/cart/apply-coupon
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new ApiError(400, "Coupon code is required");

  const user = await User.findById(req.user._id)
    .populate("cart.product")
    .populate("cart.variant");
  const { subTotal } = computeCartTotals(user.cart);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new ApiError(404, "Invalid coupon code");

  const validity = coupon.isValid(subTotal, req.user._id);
  if (!validity.valid) throw new ApiError(400, validity.reason);

  const discountAmount = coupon.calculateDiscount(subTotal);

  sendResponse(
    res,
    200,
    {
      code: coupon.code,
      discountAmount,
      subTotal,
      total: subTotal - discountAmount,
    },
    "Coupon applied successfully",
  );
});

// @desc    Remove coupon (client-side no-op helper endpoint)
// @route   DELETE /api/v1/cart/remove-coupon
// @access  Private
const removeCoupon = asyncHandler(async (req, res) => {
  sendResponse(res, 200, {}, "Coupon removed");
});

module.exports = {
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCart,
  applyCoupon,
  removeCoupon,
};
