import 'package:freezed_annotation/freezed_annotation.dart';

import 'common_models.dart';
import 'json_converters.dart';

part 'category_model.freezed.dart';
part 'category_model.g.dart';

/// models/Category.js — GET /categories?tree=true returns nested `children`.
@freezed
abstract class CategoryModel with _$CategoryModel {
  const CategoryModel._();

  const factory CategoryModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: stringFromJson) @Default('') String name,
    @JsonKey(fromJson: stringFromJson) @Default('') String slug,
    @JsonKey(fromJson: imageFromJson) ImageModel? image,
    @JsonKey(fromJson: stringFromJson) @Default('') String shortTitle,
    @JsonKey(fromJson: stringFromJson) @Default('') String description,
    @JsonKey(fromJson: stringFromJson) @Default('active') String status,
    @JsonKey(fromJson: nullableIdFromJson) String? parent,
    @JsonKey(fromJson: intFromJson) @Default(0) int level,
    @JsonKey(fromJson: intFromJson) @Default(0) int sortOrder,
    @Default(true) bool showInHeader,
    @JsonKey(fromJson: categoryListFromJson)
    @Default(<CategoryModel>[])
    List<CategoryModel> children,
  }) = _CategoryModel;

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);

  bool get isActive => status == 'active';
  bool get hasChildren => activeChildren.isNotEmpty;
  List<CategoryModel> get activeChildren =>
      children.where((c) => c.isActive).toList(growable: false);
  String get displayTitle => shortTitle.isNotEmpty ? shortTitle : name;
}

List<CategoryModel> categoryListFromJson(Object? value) {
  if (value is! List) return const <CategoryModel>[];
  return value
      .whereType<Map>()
      .map((e) => CategoryModel.fromJson(Map<String, dynamic>.from(e)))
      .toList(growable: false);
}
