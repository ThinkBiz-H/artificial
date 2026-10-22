import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/product_model.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/core_providers.dart';
import '../../../core/providers/repository_providers.dart';
import '../../cart/viewmodels/cart_viewmodel.dart';

class WishlistState {
  const WishlistState({required this.items, required this.ids});

  const WishlistState.empty()
      : items = const <ProductModel>[],
        ids = const <String>{};

  final List<ProductModel> items;
  final Set<String> ids;

  bool contains(String productId) => ids.contains(productId);

  WishlistState withItems(List<ProductModel> items) =>
      WishlistState(items: items, ids: items.map((p) => p.id).toSet());
}

class WishlistNotifier extends AsyncNotifier<WishlistState> {
  @override
  Future<WishlistState> build() async {
    final authenticated = ref.watch(isAuthenticatedProvider);
    final repo = ref.watch(wishlistRepositoryProvider);
    if (!authenticated) {
      final guest = repo.guestWishlist();
      return const WishlistState.empty().withItems(guest);
    }
    try {
      final items = await repo.fetch();
      return const WishlistState.empty().withItems(items);
    } on AppException catch (e) {
      if (e.isNetwork) {
        // Offline: keep heart icons correct from the last synced ids.
        final ids = ref.read(localStorageProvider).wishlistIds;
        return WishlistState(items: const <ProductModel>[], ids: ids);
      }
      rethrow;
    }
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  /// Returns true if the product is now wishlisted.
  Future<bool> toggle(ProductModel product) async {
    final repo = ref.read(wishlistRepositoryProvider);
    final current = state.valueOrNull ?? const WishlistState.empty();
    final wasIn = current.contains(product.id);

    if (!ref.read(isAuthenticatedProvider)) {
      final list = await repo.guestToggle(product);
      state = AsyncData(current.withItems(list));
      return !wasIn;
    }

    // Optimistic update, rolled back on failure.
    final optimisticItems = wasIn
        ? current.items.where((p) => p.id != product.id).toList()
        : [product, ...current.items];
    final optimisticIds = {...current.ids};
    wasIn ? optimisticIds.remove(product.id) : optimisticIds.add(product.id);
    state = AsyncData(WishlistState(items: optimisticItems, ids: optimisticIds));

    try {
      final ids = wasIn ? await repo.remove(product.id) : await repo.add(product.id);
      final merged = {...ids};
      if (!wasIn) merged.add(product.id);
      state = AsyncData(WishlistState(
          items: optimisticItems.where((p) => merged.contains(p.id)).toList(),
          ids: merged));
      await ref.read(localStorageProvider).saveWishlistIds(merged);
      return !wasIn;
    } catch (e) {
      state = AsyncData(current);
      rethrow;
    }
  }

  Future<void> remove(ProductModel product) async {
    if (state.valueOrNull?.contains(product.id) ?? false) {
      await toggle(product);
    }
  }

  /// Simple (variant-less) products only — variant products open the PDP.
  Future<void> moveToCart(ProductModel product) async {
    if (!ref.read(isAuthenticatedProvider)) {
      await ref.read(cartProvider.notifier).add(product: product);
      await toggle(product);
      return;
    }
    await ref.read(wishlistRepositoryProvider).moveToCart(productId: product.id);
    final current = state.valueOrNull ?? const WishlistState.empty();
    state = AsyncData(current.withItems(
        current.items.where((p) => p.id != product.id).toList()));
    await ref.read(cartProvider.notifier).refresh();
  }
}

final wishlistProvider =
    AsyncNotifierProvider<WishlistNotifier, WishlistState>(WishlistNotifier.new);

final isWishlistedProvider = Provider.family<bool, String>((ref, productId) =>
    ref.watch(wishlistProvider).valueOrNull?.contains(productId) ?? false);

final wishlistCountProvider =
    Provider<int>((ref) => ref.watch(wishlistProvider).valueOrNull?.ids.length ?? 0);
