import 'package:freezed_annotation/freezed_annotation.dart';

import 'common_models.dart';
import 'json_converters.dart';

part 'product_model.freezed.dart';
part 'product_model.g.dart';

double _effective(double price, double? salePrice) =>
    (salePrice != null && salePrice > 0) ? salePrice : price;

/// Case- and space-insensitive equality for option values (backend utils/itemOptions.js).
bool sameOption(String? a, String? b) =>
    (a ?? '').trim().toLowerCase() == (b ?? '').trim().toLowerCase();

/// Product.colorOptions — a colour swatch with an optional gallery.
@freezed
abstract class ColorOptionModel with _$ColorOptionModel {
  const factory ColorOptionModel({
    @JsonKey(fromJson: stringFromJson) @Default('') String name,
    @JsonKey(fromJson: nullableStringFromJson) String? hex,
    @JsonKey(fromJson: imageListFromJson)
    @Default(<ImageModel>[])
    List<ImageModel> images,
  }) = _ColorOptionModel;

  factory ColorOptionModel.fromJson(Map<String, dynamic> json) =>
      _$ColorOptionModelFromJson(json);
}

List<ColorOptionModel> colorOptionListFromJson(Object? value) {
  if (value is! List) return const <ColorOptionModel>[];
  return value
      .whereType<Map>()
      .map((e) => ColorOptionModel.fromJson(Map<String, dynamic>.from(e)))
      .where((c) => c.name.trim().isNotEmpty)
      .toList(growable: false);
}

/// models/Variant.js
@freezed
abstract class VariantModel with _$VariantModel {
  const VariantModel._();

  const factory VariantModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: idFromJson) @Default('') String product,
    @JsonKey(fromJson: attributeListFromJson)
    @Default(<AttributeKV>[])
    List<AttributeKV> attributes,
    @JsonKey(fromJson: nullableStringFromJson) String? color,
    @JsonKey(fromJson: nullableStringFromJson) String? colorHex,
    @JsonKey(fromJson: nullableStringFromJson) String? size,
    @JsonKey(fromJson: stringFromJson) @Default('') String sku,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double price,
    @JsonKey(fromJson: nullableDoubleFromJson) double? salePrice,
    @JsonKey(fromJson: intFromJson) @Default(0) int stock,
    @JsonKey(fromJson: unitFromJson) UnitModel? unit,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double unitValue,
    @JsonKey(fromJson: imageListFromJson)
    @Default(<ImageModel>[])
    List<ImageModel> images,
    @JsonKey(fromJson: stringFromJson) @Default('active') String status,
    @JsonKey(fromJson: boolFromJson) @Default(false) bool isDefault,
  }) = _VariantModel;

  factory VariantModel.fromJson(Map<String, dynamic> json) =>
      _$VariantModelFromJson(json);

  bool get isActive => status == 'active';
  bool get inStock => stock > 0;
  double get effectivePrice => _effective(price, salePrice);
  bool get hasDiscount => salePrice != null && salePrice! > 0 && salePrice! < price;

  String? attribute(String key) {
    for (final a in attributes) {
      if (a.key.toLowerCase() == key.toLowerCase()) return a.value;
    }
    return null;
  }

  String get label => attributes.map((a) => a.value).join(' · ');

  /// Colour / size — variants saved before the explicit fields keep them in attributes.
  String get optionColor => (color ?? '').isNotEmpty ? color! : (attribute('color') ?? attribute('colour') ?? '');
  String get optionSize => (size ?? '').isNotEmpty ? size! : (attribute('size') ?? '');
}

/// Review embedded in Product.reviews; `user` is populated (name, image).
@Freezed(fromJson: true)
abstract class ReviewModel with _$ReviewModel {
  const ReviewModel._();

  const factory ReviewModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: idFromJson) @Default('') String userId,
    @JsonKey(fromJson: stringFromJson) @Default('Customer') String userName,
    @JsonKey(fromJson: stringFromJson) @Default('') String userImage,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double rating,
    @JsonKey(fromJson: stringFromJson) @Default('') String comment,
    @JsonKey(fromJson: imageListFromJson)
    @Default(<ImageModel>[])
    List<ImageModel> images,
    @JsonKey(fromJson: boolFromJson) @Default(false) bool isVerifiedPurchase,
    DateTime? createdAt,
  }) = _ReviewModel;

  /// Flattens the populated `user` object into userId/userName/userImage.
  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'];
    final flat = Map<String, dynamic>.from(json);
    if (user is Map) {
      flat['userId'] = user['_id'];
      flat['userName'] = user['name'];
      final img = user['profileImage'];
      flat['userImage'] = img is Map ? img['url'] : null;
    } else {
      flat['userId'] = flat['userId'] ?? user;
    }
    return _$ReviewModelFromJson(flat);
  }
}

List<ReviewModel> reviewListFromJson(Object? value) {
  if (value is! List) return const <ReviewModel>[];
  return value
      .whereType<Map>()
      .map((e) => ReviewModel.fromJson(Map<String, dynamic>.from(e)))
      .toList(growable: false);
}

List<VariantModel> variantListFromJson(Object? value) {
  if (value is! List) return const <VariantModel>[];
  return value
      .whereType<Map>()
      .map((e) => VariantModel.fromJson(Map<String, dynamic>.from(e)))
      .toList(growable: false);
}

/// models/Product.js
@freezed
abstract class ProductModel with _$ProductModel {
  const ProductModel._();

  const factory ProductModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: stringFromJson) @Default('') String title,
    @JsonKey(fromJson: stringFromJson) @Default('') String slug,
    @JsonKey(fromJson: stringFromJson) @Default('') String shortDescription,
    @JsonKey(fromJson: stringFromJson) @Default('') String description,
    @JsonKey(name: 'SKU', fromJson: stringFromJson) @Default('') String sku,
    @JsonKey(fromJson: refFromJson) RefModel? category,
    @JsonKey(fromJson: refFromJson) RefModel? brand,
    @JsonKey(fromJson: unitFromJson) UnitModel? unit,
    @JsonKey(fromJson: doubleFromJson) @Default(1) double unitValue,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double price,
    @JsonKey(fromJson: nullableDoubleFromJson) double? salePrice,
    @JsonKey(fromJson: intFromJson) @Default(0) int stock,
    @JsonKey(fromJson: nullableDoubleFromJson) double? basePrice,
    @JsonKey(fromJson: doubleFromJson) @Default(18) double gstRate,
    @JsonKey(fromJson: nullableDoubleFromJson) double? gstAmount,
    @Default(true) bool priceIncludesGST,
    @JsonKey(fromJson: imageListFromJson)
    @Default(<ImageModel>[])
    List<ImageModel> images,
    @JsonKey(fromJson: imageFromJson) ImageModel? thumbnail,
    @JsonKey(fromJson: stringFromJson) @Default('') String videoUrl,
    @JsonKey(fromJson: stringListFromJson) @Default(<String>[]) List<String> tags,
    @JsonKey(fromJson: attributeListFromJson)
    @Default(<AttributeKV>[])
    List<AttributeKV> attributes,
    @JsonKey(fromJson: colorOptionListFromJson)
    @Default(<ColorOptionModel>[])
    List<ColorOptionModel> colorOptions,
    @JsonKey(fromJson: stringListFromJson) @Default(<String>[]) List<String> colors,
    @JsonKey(fromJson: stringListFromJson) @Default(<String>[]) List<String> sizes,
    @JsonKey(fromJson: nullableStringFromJson) String? metal,
    @JsonKey(fromJson: nullableStringFromJson) String? plating,
    @JsonKey(fromJson: nullableDoubleFromJson) double? weight,
    @JsonKey(fromJson: boolFromJson) @Default(false) bool hasVariants,
    @JsonKey(fromJson: variantListFromJson)
    @Default(<VariantModel>[])
    List<VariantModel> variants,
    @JsonKey(fromJson: productRefListFromJson, includeToJson: false)
    @Default(<ProductModel>[])
    List<ProductModel> crossSell,
    @JsonKey(fromJson: intFromJson) @Default(1) int minOrderQuantity,
    @JsonKey(fromJson: nullableIntFromJson) int? maxOrderQuantity,
    @JsonKey(fromJson: stringFromJson) @Default('') String warranty,
    @JsonKey(fromJson: stringFromJson) @Default('') String returnPolicy,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double rating,
    @JsonKey(fromJson: intFromJson) @Default(0) int numReviews,
    @JsonKey(fromJson: reviewListFromJson, includeToJson: false)
    @Default(<ReviewModel>[])
    List<ReviewModel> reviews,
    @JsonKey(fromJson: intFromJson) @Default(0) int salesCount,
    @JsonKey(fromJson: boolFromJson) @Default(false) bool featured,
    @JsonKey(fromJson: stringFromJson) @Default('active') String status,
    DateTime? createdAt,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);

  double get effectivePrice => _effective(price, salePrice);
  bool get hasDiscount => salePrice != null && salePrice! > 0 && salePrice! < price;
  int get discountPercent =>
      hasDiscount ? (((price - salePrice!) / price) * 100).round() : 0;

  bool get isPurchasable => status == 'active';

  List<VariantModel> get activeVariants =>
      variants.where((v) => v.isActive).toList(growable: false);

  bool get inStock => hasVariants
      ? activeVariants.any((v) => v.inStock)
      : stock > 0;

  /// Lowest effective price across active variants (for "From ₹x").
  double get displayPrice {
    if (!hasVariants || activeVariants.isEmpty) return effectivePrice;
    return activeVariants
        .map((v) => v.effectivePrice)
        .reduce((a, b) => a < b ? a : b);
  }

  String? get primaryImage {
    if (thumbnail != null && thumbnail!.isValid) return thumbnail!.url;
    if (images.isNotEmpty) return images.first.url;
    return null;
  }

  List<String> get gallery {
    final urls = <String>[];
    if (thumbnail != null && thumbnail!.isValid) urls.add(thumbnail!.url);
    for (final img in images) {
      if (img.isValid && !urls.contains(img.url)) urls.add(img.url);
    }
    return urls;
  }

  int get maxQuantity => maxOrderQuantity ?? 10;

  /// Colour options, falling back to the legacy name list (no swatch).
  List<ColorOptionModel> get productColorOptions => colorOptions.isNotEmpty
      ? colorOptions
      : colors.where((c) => c.trim().isNotEmpty).map((c) => ColorOptionModel(name: c)).toList(growable: false);

  ColorOptionModel? findColorOption(String? name) {
    if (name == null || name.isEmpty) return null;
    for (final c in productColorOptions) {
      if (sameOption(c.name, name)) return c;
    }
    return null;
  }
}

/// Populated product references only (ids-only entries are dropped).
List<ProductModel> productRefListFromJson(Object? value) {
  if (value is! List) return const <ProductModel>[];
  return value
      .whereType<Map>()
      .map((e) => ProductModel.fromJson(Map<String, dynamic>.from(e)))
      .where((p) => p.id.isNotEmpty && p.slug.isNotEmpty)
      .toList(growable: false);
}

int? nullableIntFromJson(Object? value) {
  if (value == null) return null;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value);
  return null;
}

List<ProductModel> productListFromJson(Object? value) {
  if (value is! List) return const <ProductModel>[];
  return value
      .whereType<Map>()
      .map((e) => ProductModel.fromJson(Map<String, dynamic>.from(e)))
      .toList(growable: false);
}

/// GET /products/:id/reviews (+ rating-distribution)
class RatingBucket {
  const RatingBucket({required this.star, required this.count, required this.percentage});
  final int star;
  final int count;
  final double percentage;

  factory RatingBucket.fromJson(Map<String, dynamic> json) => RatingBucket(
        star: intFromJson(json['star']),
        count: intFromJson(json['count']),
        percentage: doubleFromJson(json['percentage']),
      );
}

class ProductReviews {
  const ProductReviews({
    required this.reviews,
    required this.rating,
    required this.numReviews,
    required this.distribution,
  });

  final List<ReviewModel> reviews;
  final double rating;
  final int numReviews;
  final List<RatingBucket> distribution;

  factory ProductReviews.fromJson(Map<String, dynamic> json) => ProductReviews(
        reviews: reviewListFromJson(json['reviews']),
        rating: doubleFromJson(json['rating']),
        numReviews: intFromJson(json['numReviews']),
        distribution: mapList(json['distribution'])
            .map(RatingBucket.fromJson)
            .toList(growable: false),
      );
}
