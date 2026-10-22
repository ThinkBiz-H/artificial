// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'home_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SlideModel _$SlideModelFromJson(Map<String, dynamic> json) => _SlideModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  desktopImage: imageFromJson(json['desktopImage']),
  mobileImage: imageFromJson(json['mobileImage']),
  title: json['title'] == null ? '' : stringFromJson(json['title']),
  subtitle: json['subtitle'] == null ? '' : stringFromJson(json['subtitle']),
  description: json['description'] == null
      ? ''
      : stringFromJson(json['description']),
  buttonText: json['buttonText'] == null
      ? ''
      : stringFromJson(json['buttonText']),
  buttonLink: json['buttonLink'] == null
      ? ''
      : stringFromJson(json['buttonLink']),
  order: json['order'] == null ? 0 : intFromJson(json['order']),
  active: json['active'] as bool? ?? true,
);

Map<String, dynamic> _$SlideModelToJson(_SlideModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'desktopImage': ?instance.desktopImage?.toJson(),
      'mobileImage': ?instance.mobileImage?.toJson(),
      'title': instance.title,
      'subtitle': instance.subtitle,
      'description': instance.description,
      'buttonText': instance.buttonText,
      'buttonLink': instance.buttonLink,
      'order': instance.order,
      'active': instance.active,
    };

_ReelModel _$ReelModelFromJson(Map<String, dynamic> json) => _ReelModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  video: imageFromJson(json['video']),
  thumbnail: imageFromJson(json['thumbnail']),
  title: json['title'] == null ? '' : stringFromJson(json['title']),
  link: json['link'] == null ? '' : stringFromJson(json['link']),
  order: json['order'] == null ? 0 : intFromJson(json['order']),
  active: json['active'] as bool? ?? true,
);

Map<String, dynamic> _$ReelModelToJson(_ReelModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'video': ?instance.video?.toJson(),
      'thumbnail': ?instance.thumbnail?.toJson(),
      'title': instance.title,
      'link': instance.link,
      'order': instance.order,
      'active': instance.active,
    };

_SectionButton _$SectionButtonFromJson(Map<String, dynamic> json) =>
    _SectionButton(
      label: json['label'] == null ? '' : stringFromJson(json['label']),
      link: json['link'] == null ? '' : stringFromJson(json['link']),
    );

Map<String, dynamic> _$SectionButtonToJson(_SectionButton instance) =>
    <String, dynamic>{'label': instance.label, 'link': instance.link};

_HomeSectionModel _$HomeSectionModelFromJson(Map<String, dynamic> json) =>
    _HomeSectionModel(
      id: json['_id'] == null ? '' : idFromJson(json['_id']),
      type: json['type'] == null ? '' : stringFromJson(json['type']),
      title: json['title'] == null ? '' : stringFromJson(json['title']),
      subtitle: json['subtitle'] == null
          ? ''
          : stringFromJson(json['subtitle']),
      content: json['content'] == null ? '' : stringFromJson(json['content']),
      image: imageFromJson(json['image']),
      gallery: json['gallery'] == null
          ? const <ImageModel>[]
          : imageListFromJson(json['gallery']),
      videos: json['videos'] == null
          ? const <ImageModel>[]
          : imageListFromJson(json['videos']),
      button: json['button'] == null
          ? null
          : SectionButton.fromJson(json['button'] as Map<String, dynamic>),
      config: json['config'] == null
          ? const <String, dynamic>{}
          : dynamicMapFromJson(json['config']),
      sortOrder: json['sortOrder'] == null ? 0 : intFromJson(json['sortOrder']),
      slides:
          (json['slides'] as List<dynamic>?)
              ?.map((e) => SlideModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const <SlideModel>[],
      reels:
          (json['reels'] as List<dynamic>?)
              ?.map((e) => ReelModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const <ReelModel>[],
    );

Map<String, dynamic> _$HomeSectionModelToJson(_HomeSectionModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'type': instance.type,
      'title': instance.title,
      'subtitle': instance.subtitle,
      'content': instance.content,
      'image': ?instance.image?.toJson(),
      'gallery': instance.gallery.map((e) => e.toJson()).toList(),
      'videos': instance.videos.map((e) => e.toJson()).toList(),
      'button': ?instance.button?.toJson(),
      'config': instance.config,
      'sortOrder': instance.sortOrder,
      'slides': instance.slides.map((e) => e.toJson()).toList(),
      'reels': instance.reels.map((e) => e.toJson()).toList(),
    };
