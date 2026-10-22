import '../network/api_endpoints.dart';
import '../network/api_exception.dart';
import '../models/cart_model.dart';
import '../models/product_model.dart';
import '../services/local_storage_service.dart';
import 'base_repository.dart';

/// Server cart (routes/cart.routes.js, auth required) + a local guest cart
/// persisted in encrypted Hive, merged into the server cart on login.
class CartRepository extends BaseRepository {
  CartRepository(super.api, super.storage);

  // ---------------- Server ----------------

  /// GET /cart — the last bag is served from the offline cache when there is no network.
  Future<CartModel> fetch() => cachedGet(
        cacheKey: LocalStorageService.cartCacheKey,
        request: () => api.get(ApiEndpoints.cart),
        parse: CartModel.fromJson,
      );

  Future<CartModel> add({
    required String productId,
    String? variantId,
    int quantity = 1,
    String? color,
    String? colorHex,
    String? size,
  }) async {
    final res = await api.post(ApiEndpoints.cart, data: {
      'productId': productId,
      'quantity': quantity,
      if (variantId != null) 'variantId': variantId,
      if (color != null) 'color': color,
      if (colorHex != null) 'colorHex': colorHex,
      if (size != null) 'size': size,
    });
    return CartModel.fromJson(res.data);
  }

  /// `lineId` targets exactly one line; without it the server falls back to product (+variant).
  Future<CartModel> updateQuantity({
    required String productId,
    String? variantId,
    String? lineId,
    required int quantity,
  }) async {
    final res = await api.put(ApiEndpoints.cartItem(productId), data: {
      'quantity': quantity,
      if (variantId != null) 'variantId': variantId,
      if (lineId != null) 'lineId': lineId,
    });
    return CartModel.fromJson(res.data);
  }

  /// `lineId` removes exactly one line, `variantId` that variant's line; with
  /// neither, every line of the product.
  Future<CartModel> remove({required String productId, String? variantId, String? lineId}) async {
    final res = await api.delete(ApiEndpoints.cartItem(productId),
        query: lineId != null
            ? {'lineId': lineId}
            : variantId == null
                ? null
                : {'variantId': variantId});
    return CartModel.fromJson(res.data);
  }

  Future<void> clear() async {
    await api.delete(ApiEndpoints.cart);
  }

  Future<CouponResult> applyCoupon(String code) async {
    final res = await api.post(ApiEndpoints.applyCoupon,
        data: {'code': code.trim().toUpperCase()});
    return CouponResult.fromJson(res.data);
  }

  Future<void> removeCoupon() async {
    try {
      await api.delete(ApiEndpoints.removeCoupon);
    } on AppException {
      // Stateless on the server — nothing to roll back.
    }
  }

  // ---------------- Guest (local) ----------------

  CartModel guestCart() {
    final items = storage.guestCart
        .map(CartItemModel.fromJson)
        .where((i) => i.product.id.isNotEmpty)
        .toList(growable: false);
    return CartModel.fromItems(items);
  }

  Future<CartModel> guestAdd({
    required ProductModel product,
    VariantModel? variant,
    int quantity = 1,
    String? color,
    String? colorHex,
    String? size,
  }) async {
    final items = guestCart().items.toList();
    // Same snapshot the server stores (backend utils/itemOptions.js): the
    // variant decides colour/size, metal/plating come from the product.
    final lineColor = (variant?.optionColor.isNotEmpty ?? false) ? variant!.optionColor : color;
    final lineSize = (variant?.optionSize.isNotEmpty ?? false) ? variant!.optionSize : size;
    final candidate = CartItemModel(
      product: product.copyWith(variants: const <VariantModel>[]),
      variant: variant,
      quantity: quantity,
      color: lineColor,
      colorHex: variant?.colorHex ?? colorHex ?? product.findColorOption(lineColor)?.hex,
      size: lineSize,
      metal: product.metal,
      plating: product.plating,
      price: variant?.effectivePrice ?? product.effectivePrice,
    );
    final index = items.indexWhere((i) => i.key == candidate.key);
    if (index >= 0) {
      final existing = items[index];
      items[index] = existing.copyWith(quantity: existing.quantity + quantity);
    } else {
      items.add(candidate);
    }
    return _saveGuest(items);
  }

  Future<CartModel> guestUpdate(String key, int quantity) async {
    final items = guestCart().items.toList();
    final index = items.indexWhere((i) => i.key == key);
    if (index >= 0) items[index] = items[index].copyWith(quantity: quantity);
    return _saveGuest(items);
  }

  Future<CartModel> guestRemove(String key) async {
    final items = guestCart().items.where((i) => i.key != key).toList();
    return _saveGuest(items);
  }

  Future<void> guestClear() => storage.clearGuestCart();

  Future<CartModel> _saveGuest(List<CartItemModel> items) async {
    final cart = CartModel.fromItems(items
        .map((i) => i.copyWith(itemTotal: i.unitPrice * i.quantity))
        .toList());
    await storage.saveGuestCart(cart.items.map((i) => i.toJson()).toList());
    return cart;
  }

  /// Pushes every guest line into the server cart. Lines that fail (out of
  /// stock, unavailable) are skipped; the guest cart is cleared afterwards.
  Future<int> mergeGuestCart() async {
    final guest = guestCart();
    if (guest.isEmpty) return 0;
    var merged = 0;
    for (final item in guest.items) {
      try {
        await add(
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity,
          color: item.color,
          colorHex: item.colorHex,
          size: item.size,
        );
        merged++;
      } on AppException catch (e) {
        if (e.isNetwork) rethrow;
      }
    }
    await guestClear();
    return merged;
  }
}
