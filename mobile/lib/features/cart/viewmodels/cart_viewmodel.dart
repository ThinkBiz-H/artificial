import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/cart_model.dart';
import '../../../core/models/product_model.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';

/// Single source of truth for the cart. Guests use the encrypted local
/// cart; signed-in customers use the server cart (GET/POST/PUT/DELETE /cart).
class CartNotifier extends AsyncNotifier<CartModel> {
  @override
  Future<CartModel> build() async {
    final authenticated = ref.watch(isAuthenticatedProvider);
    final repo = ref.watch(cartRepositoryProvider);
    if (!authenticated) return repo.guestCart();
    return repo.fetch();
  }

  bool get _authenticated => ref.read(isAuthenticatedProvider);

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  Future<void> add({
    required ProductModel product,
    VariantModel? variant,
    int quantity = 1,
    String? color,
    String? colorHex,
    String? size,
  }) async {
    if (product.hasVariants && variant == null) {
      throw const AppException(AppErrorType.validation, 'Please select an option first.');
    }
    final stock = variant?.stock ?? product.stock;
    final inCart = (state.valueOrNull?.items ?? const <CartItemModel>[])
        .where((i) =>
            i.product.id == product.id &&
            i.variant?.id == variant?.id &&
            (i.color ?? '') == (color ?? '') &&
            (i.size ?? '') == (size ?? ''))
        .fold<int>(0, (s, i) => s + i.quantity);
    if (stock <= 0) {
      throw const AppException(AppErrorType.validation, 'This item is currently out of stock.');
    }
    if (inCart + quantity > stock) {
      throw AppException(AppErrorType.validation,
          'Only $stock left in stock${inCart > 0 ? ' — $inCart already in your bag' : ''}.');
    }

    final repo = ref.read(cartRepositoryProvider);
    final cart = _authenticated
        ? await repo.add(
            productId: product.id,
            variantId: variant?.id,
            quantity: quantity,
            color: color,
            colorHex: colorHex,
            size: size,
          )
        : await repo.guestAdd(
            product: product,
            variant: variant,
            quantity: quantity,
            color: color,
            colorHex: colorHex,
            size: size,
          );
    state = AsyncData(cart);
  }

  Future<void> updateQuantity(CartItemModel item, int quantity) async {
    if (quantity < 1) return remove(item);
    if (quantity > item.availableStock && item.availableStock > 0) {
      throw AppException(AppErrorType.validation, 'Only ${item.availableStock} left in stock.');
    }
    final previous = state.valueOrNull;
    if (previous != null) {
      final optimistic = previous.items
          .map((i) => i.key == item.key ? i.copyWith(quantity: quantity, itemTotal: i.unitPrice * quantity) : i)
          .toList();
      state = AsyncData(CartModel.fromItems(optimistic));
    }
    try {
      final repo = ref.read(cartRepositoryProvider);
      final cart = _authenticated
          ? await repo.updateQuantity(
              productId: item.product.id,
              variantId: item.variant?.id,
              lineId: item.lineId,
              quantity: quantity)
          : await repo.guestUpdate(item.key, quantity);
      state = AsyncData(cart);
    } catch (e) {
      if (previous != null) state = AsyncData(previous);
      rethrow;
    }
  }

  Future<void> remove(CartItemModel item) async {
    final previous = state.valueOrNull;
    if (previous != null) {
      state = AsyncData(CartModel.fromItems(
          previous.items.where((i) => i.key != item.key).toList()));
    }
    try {
      final repo = ref.read(cartRepositoryProvider);
      final cart = _authenticated
          ? await repo.remove(productId: item.product.id, variantId: item.variant?.id, lineId: item.lineId)
          : await repo.guestRemove(item.key);
      state = AsyncData(cart);
    } catch (e) {
      if (previous != null) state = AsyncData(previous);
      rethrow;
    }
  }

  /// The backend empties the cart once an order is placed/paid.
  void markCleared() => state = const AsyncData(CartModel.empty());
}

final cartProvider = AsyncNotifierProvider<CartNotifier, CartModel>(CartNotifier.new);

final cartCountProvider =
    Provider<int>((ref) => ref.watch(cartProvider).valueOrNull?.count ?? 0);
