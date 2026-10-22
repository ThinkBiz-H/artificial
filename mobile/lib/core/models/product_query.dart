import 'package:freezed_annotation/freezed_annotation.dart';

part 'product_query.freezed.dart';

/// Sort keys accepted by utils/ApiFeatures.js#sort (any Product field).
enum ProductSort {
  recommended(null, 'Featured'),
  newest('-createdAt', 'Newest'),
  popularity('-salesCount', 'Popular'),
  priceLowHigh('price', 'Price: Low to High'),
  priceHighLow('-price', 'Price: High to Low'),
  rating('-rating', 'Top Rated');

  const ProductSort(this.apiValue, this.label);
  final String? apiValue;
  final String label;
}

/// Filters for GET /products. Field names map 1:1 to ApiFeatures#filter
/// (Mongo comparison operators via bracket syntax: price[gte]=…).
@freezed
abstract class ProductQuery with _$ProductQuery {
  const ProductQuery._();

  const factory ProductQuery({
    String? categoryId,
    String? keyword,
    @Default(ProductSort.recommended) ProductSort sort,
    @Default(false) bool onSale,
    @Default(false) bool inStockOnly,
    double? minPrice,
    double? maxPrice,
    String? color,
    String? size,
    String? brandId,

    /// Minimum average rating (website "4★ & above" / "3★ & above").
    int? minRating,
  }) = _ProductQuery;

  int get activeFilterCount => [
        onSale,
        inStockOnly,
        minPrice != null || maxPrice != null,
        color != null,
        size != null,
        brandId != null,
        minRating != null,
      ].where((e) => e).length;

  ProductQuery clearFilters() => ProductQuery(
        categoryId: categoryId,
        keyword: keyword,
        sort: sort,
      );

  Map<String, dynamic> toQueryParameters({required int page, required int limit}) {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
      'status': 'active',
    };
    if (categoryId != null && categoryId!.isNotEmpty) params['category'] = categoryId;
    if (keyword != null && keyword!.trim().isNotEmpty) params['keyword'] = keyword!.trim();
    if (sort.apiValue != null) params['sort'] = sort.apiValue;
    if (onSale) params['salePrice[gt]'] = 0;
    if (inStockOnly) params['stock[gt]'] = 0;
    if (minPrice != null) params['price[gte]'] = minPrice!.round();
    if (maxPrice != null) params['price[lte]'] = maxPrice!.round();
    if (color != null && color!.isNotEmpty) params['colors'] = color;
    if (size != null && size!.isNotEmpty) params['sizes'] = size;
    if (brandId != null && brandId!.isNotEmpty) params['brand'] = brandId;
    if (minRating != null) params['rating[gte]'] = minRating;
    return params;
  }
}
