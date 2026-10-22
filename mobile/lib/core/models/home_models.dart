import 'package:freezed_annotation/freezed_annotation.dart';

import 'common_models.dart';
import 'json_converters.dart';

part 'home_models.freezed.dart';
part 'home_models.g.dart';

/// models/HomeSection.js slideSchema
@freezed
abstract class SlideModel with _$SlideModel {
  const SlideModel._();

  const factory SlideModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: imageFromJson) ImageModel? desktopImage,
    @JsonKey(fromJson: imageFromJson) ImageModel? mobileImage,
    @JsonKey(fromJson: stringFromJson) @Default('') String title,
    @JsonKey(fromJson: stringFromJson) @Default('') String subtitle,
    @JsonKey(fromJson: stringFromJson) @Default('') String description,
    @JsonKey(fromJson: stringFromJson) @Default('') String buttonText,
    @JsonKey(fromJson: stringFromJson) @Default('') String buttonLink,
    @JsonKey(fromJson: intFromJson) @Default(0) int order,
    @Default(true) bool active,
  }) = _SlideModel;

  factory SlideModel.fromJson(Map<String, dynamic> json) =>
      _$SlideModelFromJson(json);

  /// Mobile app prefers the mobile crop, falling back to desktop.
  String? get imageUrl => (mobileImage?.isValid ?? false)
      ? mobileImage!.url
      : (desktopImage?.isValid ?? false)
          ? desktopImage!.url
          : null;
}

/// models/HomeSection.js reelSchema
@freezed
abstract class ReelModel with _$ReelModel {
  const factory ReelModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: imageFromJson) ImageModel? video,
    @JsonKey(fromJson: imageFromJson) ImageModel? thumbnail,
    @JsonKey(fromJson: stringFromJson) @Default('') String title,
    @JsonKey(fromJson: stringFromJson) @Default('') String link,
    @JsonKey(fromJson: intFromJson) @Default(0) int order,
    @Default(true) bool active,
  }) = _ReelModel;

  factory ReelModel.fromJson(Map<String, dynamic> json) =>
      _$ReelModelFromJson(json);
}

@freezed
abstract class SectionButton with _$SectionButton {
  const factory SectionButton({
    @JsonKey(fromJson: stringFromJson) @Default('') String label,
    @JsonKey(fromJson: stringFromJson) @Default('') String link,
  }) = _SectionButton;

  factory SectionButton.fromJson(Map<String, dynamic> json) =>
      _$SectionButtonFromJson(json);
}

/// models/HomeSection.js — `type` is free text agreed with the frontend
/// ("hero", "banner", "featured_products", "categories", "reels", ...).
@freezed
abstract class HomeSectionModel with _$HomeSectionModel {
  const HomeSectionModel._();

  const factory HomeSectionModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: stringFromJson) @Default('') String type,
    @JsonKey(fromJson: stringFromJson) @Default('') String title,
    @JsonKey(fromJson: stringFromJson) @Default('') String subtitle,
    @JsonKey(fromJson: stringFromJson) @Default('') String content,
    @JsonKey(fromJson: imageFromJson) ImageModel? image,
    @JsonKey(fromJson: imageListFromJson)
    @Default(<ImageModel>[])
    List<ImageModel> gallery,
    @JsonKey(fromJson: imageListFromJson)
    @Default(<ImageModel>[])
    List<ImageModel> videos,
    SectionButton? button,
    @JsonKey(fromJson: dynamicMapFromJson)
    @Default(<String, dynamic>{})
    Map<String, dynamic> config,
    @JsonKey(fromJson: intFromJson) @Default(0) int sortOrder,
    @Default(<SlideModel>[]) List<SlideModel> slides,
    @Default(<ReelModel>[]) List<ReelModel> reels,
  }) = _HomeSectionModel;

  factory HomeSectionModel.fromJson(Map<String, dynamic> json) =>
      _$HomeSectionModelFromJson(json);

  String get normalizedType =>
      type.toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');

  List<SlideModel> get activeSlides {
    final list = slides.where((s) => s.active && s.imageUrl != null).toList()
      ..sort((a, b) => a.order.compareTo(b.order));
    return list;
  }

  List<ReelModel> get activeReels {
    final list = reels.where((r) => r.active && (r.video?.isValid ?? false)).toList()
      ..sort((a, b) => a.order.compareTo(b.order));
    return list;
  }

  String? configString(String key) {
    final v = config[key];
    return v == null ? null : v.toString();
  }
}
