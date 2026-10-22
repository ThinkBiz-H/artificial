import '../network/api_endpoints.dart';
import '../network/api_exception.dart';
import '../models/json_converters.dart';
import '../models/product_model.dart';
import 'base_repository.dart';

/// routes/wishlist.routes.js + local guest wishlist.
class WishlistRepository extends BaseRepository {
  WishlistRepository(super.api, super.storage);

  Future<List<ProductModel>> fetch() async {
    final res = await api.get(ApiEndpoints.wishlist);
    final products = productListFromJson(res.data['wishlist']);
    await storage.saveWishlistIds(products.map((p) => p.id).toSet());
    return products;
  }

  Future<Set<String>> add(String productId) async {
    try {
      final res = await api.post(ApiEndpoints.wishlistItem(productId));
      return stringListFromJson(res.data['wishlist']).toSet();
    } on AppException catch (e) {
      // 409 "already in wishlist" is success for our purposes.
      if (e.type == AppErrorType.conflict) return {productId};
      rethrow;
    }
  }

  Future<Set<String>> remove(String productId) async {
    final res = await api.delete(ApiEndpoints.wishlistItem(productId));
    return stringListFromJson(res.data['wishlist']).toSet();
  }

  Future<void> moveToCart({
    required String productId,
    String? variantId,
    int quantity = 1,
    String? color,
    String? size,
  }) async {
    await api.post(ApiEndpoints.wishlistMoveToCart(productId), data: {
      'quantity': quantity,
      if (variantId != null) 'variantId': variantId,
      if (color != null) 'color': color,
      if (size != null) 'size': size,
    });
  }

  // ---------------- Guest ----------------

  List<ProductModel> guestWishlist() => storage.guestWishlist
      .map(ProductModel.fromJson)
      .where((p) => p.id.isNotEmpty)
      .toList(growable: false);

  Future<List<ProductModel>> guestToggle(ProductModel product) async {
    final list = guestWishlist().toList();
    final exists = list.any((p) => p.id == product.id);
    if (exists) {
      list.removeWhere((p) => p.id == product.id);
    } else {
      list.insert(0, product.copyWith(variants: const <VariantModel>[]));
    }
    await storage.saveGuestWishlist(list.map((p) => p.toJson()).toList());
    return list;
  }

  Future<void> mergeGuestWishlist() async {
    final guest = guestWishlist();
    if (guest.isEmpty) return;
    for (final p in guest) {
      try {
        await add(p.id);
      } on AppException catch (e) {
        if (e.isNetwork) rethrow;
      }
    }
    await storage.clearGuestWishlist();
  }
}
