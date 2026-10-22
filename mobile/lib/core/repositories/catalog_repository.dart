import '../config/app_config.dart';
import '../network/api_endpoints.dart';
import '../network/api_exception.dart';
import '../models/category_model.dart';
import '../models/common_models.dart';
import '../models/content_models.dart';
import '../models/paginated.dart';
import '../models/product_model.dart';
import '../models/product_query.dart';
import 'base_repository.dart';

enum ProductRail { featured, newArrivals, trending, bestSellers, topRated }

/// routes/product.routes.js, category.routes.js, brand.routes.js,
/// categoryBanner.routes.js.
class CatalogRepository extends BaseRepository {
  CatalogRepository(super.api, super.storage);

  Future<Paginated<ProductModel>> products(
    ProductQuery query, {
    int page = 1,
    int limit = AppConfig.pageSize,
  }) async {
    final params = query.toQueryParameters(page: page, limit: limit);
    Paginated<ProductModel> parse(Map<String, dynamic> data) => Paginated(
          items: productListFromJson(data['products']),
          pagination: Pagination.fromJson(
              mapOrNullSafe(data['pagination']) ?? const <String, dynamic>{}),
        );

    // Only the first page of each listing is cached for offline use.
    if (page == 1) {
      return cachedGet(
        cacheKey: 'products:${params.entries.map((e) => '${e.key}=${e.value}').join('&')}',
        request: () => api.get(ApiEndpoints.products, query: params, auth: false),
        parse: parse,
      );
    }
    final res = await api.get(ApiEndpoints.products, query: params, auth: false);
    return parse(res.data);
  }

  Future<List<ProductModel>> rail(ProductRail rail, {int limit = AppConfig.railSize}) {
    final path = switch (rail) {
      ProductRail.featured => ApiEndpoints.featuredProducts,
      ProductRail.newArrivals => ApiEndpoints.newArrivals,
      ProductRail.trending => ApiEndpoints.trendingProducts,
      ProductRail.bestSellers => ApiEndpoints.bestSellers,
      ProductRail.topRated => ApiEndpoints.topRated,
    };
    return cachedGet(
      cacheKey: 'rail:${rail.name}:$limit',
      request: () => api.get(path, query: {'limit': limit}, auth: false),
      parse: (data) => productListFromJson(data['products']),
    );
  }

  Future<ProductModel> productBySlug(String slug) => cachedGet(
        cacheKey: 'product:$slug',
        request: () => api.get(ApiEndpoints.productBySlug(slug), auth: false),
        parse: (data) => ProductModel.fromJson(
            mapOrNullSafe(data['product']) ?? const <String, dynamic>{}),
      );

  Future<ProductModel> productById(String id) async {
    final res = await api.get(ApiEndpoints.productById(id), auth: false);
    return ProductModel.fromJson(res.map('product') ?? const {});
  }

  Future<List<ProductModel>> related(String productId) async {
    try {
      final res = await api.get(ApiEndpoints.relatedProducts(productId), auth: false);
      return productListFromJson(res.data['products']);
    } on AppException catch (e) {
      if (e.isNotFound) return const <ProductModel>[];
      rethrow;
    }
  }

  /// POST /products/:id/view — records the view server-side (logged in).
  Future<void> trackView(String productId) async {
    try {
      await api.post(ApiEndpoints.trackView(productId));
    } on AppException {
      // Analytics only — never surface.
    }
  }

  /// GET /products/me/recently-viewed → { items: [{ product, viewedAt }] }
  Future<List<ProductModel>> recentlyViewedRemote() async {
    final res = await api.get(ApiEndpoints.recentlyViewed);
    return res
        .list('items')
        .map((e) => e['product'])
        .whereType<Map>()
        .map((e) => ProductModel.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  List<ProductModel> recentlyViewedLocal() => storage.recentlyViewed
      .map(ProductModel.fromJson)
      .where((p) => p.id.isNotEmpty)
      .toList(growable: false);

  Future<void> rememberViewed(ProductModel product) =>
      storage.addRecentlyViewed(_compact(product));

  /// Keep the locally stored copy small — no reviews/variants needed.
  Map<String, dynamic> _compact(ProductModel p) {
    final json = p.copyWith(variants: const <VariantModel>[]).toJson();
    json.remove('description');
    return json;
  }

  Future<List<CategoryModel>> categoryTree() => cachedGet(
        cacheKey: 'categories:tree',
        request: () => api.get(ApiEndpoints.categories,
            query: {'tree': 'true', 'status': 'active'}, auth: false),
        parse: (data) => categoryListFromJson(data['categories'])
            .where((c) => c.isActive)
            .toList(growable: false),
      );

  Future<CategoryModel> categoryBySlug(String slug) async {
    final res = await api.get(ApiEndpoints.categoryBySlug(slug), auth: false);
    return CategoryModel.fromJson(res.map('category') ?? const {});
  }

  Future<CategoryBannerModel?> categoryBanner(String categoryId) async {
    try {
      final res = await api.get(ApiEndpoints.categoryBanner(categoryId), auth: false);
      final banner = res.map('banner');
      return banner == null ? null : CategoryBannerModel.fromJson(banner);
    } on AppException {
      return null;
    }
  }

  Future<List<RefModel>> brands() => cachedGet(
        cacheKey: 'brands',
        request: () => api.get(ApiEndpoints.brands, auth: false),
        parse: (data) => (data['brands'] is List ? data['brands'] as List : const [])
            .whereType<Map>()
            .map((e) => RefModel.fromJson(Map<String, dynamic>.from(e)))
            .toList(growable: false),
      );
}

Map<String, dynamic>? mapOrNullSafe(Object? value) =>
    value is Map ? Map<String, dynamic>.from(value) : null;
