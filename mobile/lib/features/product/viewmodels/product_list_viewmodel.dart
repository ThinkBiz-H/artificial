import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/app_config.dart';
import '../../../core/models/common_models.dart';
import '../../../core/models/product_model.dart';
import '../../../core/models/product_query.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/repositories/catalog_repository.dart';

class ProductListState {
  const ProductListState({
    required this.items,
    required this.pagination,
    this.loadingMore = false,
    this.loadMoreError,
  });

  final List<ProductModel> items;
  final Pagination pagination;
  final bool loadingMore;
  final Object? loadMoreError;

  bool get hasMore => pagination.hasMore;
  int get total => pagination.total;

  /// Facets derived from loaded products (backend has no facet endpoint).
  List<String> get colors => _collect((p) => p.colors);
  List<String> get sizes => _collect((p) => p.sizes);

  List<String> _collect(List<String> Function(ProductModel) pick) {
    final set = <String>{};
    for (final p in items) {
      set.addAll(pick(p).where((e) => e.trim().isNotEmpty));
    }
    final list = set.toList()..sort();
    return list;
  }

  ProductListState copyWith({
    List<ProductModel>? items,
    Pagination? pagination,
    bool? loadingMore,
    Object? loadMoreError,
    bool clearError = false,
  }) =>
      ProductListState(
        items: items ?? this.items,
        pagination: pagination ?? this.pagination,
        loadingMore: loadingMore ?? this.loadingMore,
        loadMoreError: clearError ? null : (loadMoreError ?? this.loadMoreError),
      );
}

/// Paginated GET /products for any [ProductQuery] (infinite scroll).
class ProductListNotifier extends AutoDisposeFamilyAsyncNotifier<ProductListState, ProductQuery> {
  @override
  Future<ProductListState> build(ProductQuery arg) async {
    final page = await ref.watch(catalogRepositoryProvider).products(arg, page: 1);
    return ProductListState(items: page.items, pagination: page.pagination);
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || current.loadingMore || !current.hasMore) return;
    state = AsyncData(current.copyWith(loadingMore: true, clearError: true));
    try {
      final next = await ref
          .read(catalogRepositoryProvider)
          .products(arg, page: current.pagination.page + 1, limit: AppConfig.pageSize);
      final seen = current.items.map((p) => p.id).toSet();
      state = AsyncData(current.copyWith(
        items: [...current.items, ...next.items.where((p) => !seen.contains(p.id))],
        pagination: next.pagination,
        loadingMore: false,
      ));
    } catch (e) {
      state = AsyncData(current.copyWith(loadingMore: false, loadMoreError: e));
    }
  }
}

final productListProvider = AsyncNotifierProvider.autoDispose
    .family<ProductListNotifier, ProductListState, ProductQuery>(ProductListNotifier.new);

/// Curated collections (backend "list" endpoints, capped at 50 server-side).
enum CollectionType {
  newArrivals('new-arrivals', 'New Arrivals', 'Just in'),
  bestSellers('best-sellers', 'Best Sellers', 'Most loved'),
  trending('trending', 'Trending Now', 'In demand'),
  topRated('top-rated', 'Top Rated', 'Five-star picks'),
  featured('featured', 'Featured', 'Curated for you'),
  sale('sale', 'Sale', 'Special prices');

  const CollectionType(this.slug, this.title, this.overline);
  final String slug;
  final String title;
  final String overline;

  static CollectionType? fromSlug(String slug) {
    for (final c in values) {
      if (c.slug == slug) return c;
    }
    return null;
  }

  ProductRail? get rail => switch (this) {
        CollectionType.newArrivals => ProductRail.newArrivals,
        CollectionType.bestSellers => ProductRail.bestSellers,
        CollectionType.trending => ProductRail.trending,
        CollectionType.topRated => ProductRail.topRated,
        CollectionType.featured => ProductRail.featured,
        CollectionType.sale => null,
      };
}

final collectionProductsProvider =
    FutureProvider.autoDispose.family<List<ProductModel>, CollectionType>((ref, type) {
  final rail = type.rail;
  if (rail == null) return Future.value(const <ProductModel>[]);
  return ref.watch(catalogRepositoryProvider).rail(rail, limit: 50);
});

final brandsProvider = FutureProvider<List<RefModel>>(
    (ref) => ref.watch(catalogRepositoryProvider).brands());
