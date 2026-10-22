import 'package:freezed_annotation/freezed_annotation.dart';

import 'json_converters.dart';

part 'common_models.freezed.dart';
part 'common_models.g.dart';

/// Cloudinary asset: { url, publicId }.
@freezed
abstract class ImageModel with _$ImageModel {
  const ImageModel._();

  const factory ImageModel({
    @JsonKey(fromJson: stringFromJson) @Default('') String url,
    @JsonKey(fromJson: stringFromJson) @Default('') String publicId,
  }) = _ImageModel;

  factory ImageModel.fromJson(Map<String, dynamic> json) =>
      _$ImageModelFromJson(json);

  bool get isValid => url.trim().isNotEmpty;
}

/// A lightly-populated reference such as { _id, name, slug }.
@freezed
abstract class RefModel with _$RefModel {
  const factory RefModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: stringFromJson) @Default('') String name,
    @JsonKey(fromJson: stringFromJson) @Default('') String slug,

    /// Brands only: logo and status (Admin > Brands).
    @JsonKey(fromJson: imageFromJson) ImageModel? logo,
    @JsonKey(fromJson: stringFromJson) @Default('active') String status,
  }) = _RefModel;

  factory RefModel.fromJson(Map<String, dynamic> json) =>
      _$RefModelFromJson(json);
}

/// Unit populated as { name, symbol, allowDecimal }.
@freezed
abstract class UnitModel with _$UnitModel {
  const factory UnitModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: stringFromJson) @Default('') String name,
    @JsonKey(fromJson: stringFromJson) @Default('') String symbol,
    @JsonKey(fromJson: boolFromJson) @Default(false) bool allowDecimal,
  }) = _UnitModel;

  factory UnitModel.fromJson(Map<String, dynamic> json) =>
      _$UnitModelFromJson(json);
}

/// { key, value } pair used by Product.attributes and Variant.attributes.
@freezed
abstract class AttributeKV with _$AttributeKV {
  const factory AttributeKV({
    @JsonKey(fromJson: stringFromJson) @Default('') String key,
    @JsonKey(fromJson: stringFromJson) @Default('') String value,
  }) = _AttributeKV;

  factory AttributeKV.fromJson(Map<String, dynamic> json) =>
      _$AttributeKVFromJson(json);
}

@freezed
abstract class Pagination with _$Pagination {
  const Pagination._();

  const factory Pagination({
    @JsonKey(fromJson: intFromJson) @Default(0) int total,
    @JsonKey(fromJson: intFromJson) @Default(1) int page,
    @JsonKey(fromJson: intFromJson) @Default(12) int limit,
    @JsonKey(fromJson: intFromJson) @Default(0) int totalPages,
  }) = _Pagination;

  factory Pagination.fromJson(Map<String, dynamic> json) =>
      _$PaginationFromJson(json);

  bool get hasMore => page < totalPages;
}

// ---- Reference converters (populated object OR bare id) ----

ImageModel? imageFromJson(Object? value) {
  if (value is Map) {
    final img = ImageModel.fromJson(Map<String, dynamic>.from(value));
    return img.isValid ? img : null;
  }
  if (value is String && value.isNotEmpty) return ImageModel(url: value);
  return null;
}

List<ImageModel> imageListFromJson(Object? value) {
  if (value is! List) return const <ImageModel>[];
  return value
      .map(imageFromJson)
      .whereType<ImageModel>()
      .toList(growable: false);
}

RefModel? refFromJson(Object? value) {
  if (value is Map) return RefModel.fromJson(Map<String, dynamic>.from(value));
  if (value is String && value.isNotEmpty) return RefModel(id: value);
  return null;
}

UnitModel? unitFromJson(Object? value) {
  if (value is Map) return UnitModel.fromJson(Map<String, dynamic>.from(value));
  return null;
}

List<AttributeKV> attributeListFromJson(Object? value) {
  if (value is! List) return const <AttributeKV>[];
  return value
      .whereType<Map>()
      .map((e) => AttributeKV.fromJson(Map<String, dynamic>.from(e)))
      .where((a) => a.key.isNotEmpty)
      .toList(growable: false);
}
