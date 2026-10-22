// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CategoryModel _$CategoryModelFromJson(Map<String, dynamic> json) =>
    _CategoryModel(
      id: json['_id'] == null ? '' : idFromJson(json['_id']),
      name: json['name'] == null ? '' : stringFromJson(json['name']),
      slug: json['slug'] == null ? '' : stringFromJson(json['slug']),
      image: imageFromJson(json['image']),
      shortTitle: json['shortTitle'] == null
          ? ''
          : stringFromJson(json['shortTitle']),
      description: json['description'] == null
          ? ''
          : stringFromJson(json['description']),
      status: json['status'] == null
          ? 'active'
          : stringFromJson(json['status']),
      parent: nullableIdFromJson(json['parent']),
      level: json['level'] == null ? 0 : intFromJson(json['level']),
      sortOrder: json['sortOrder'] == null ? 0 : intFromJson(json['sortOrder']),
      showInHeader: json['showInHeader'] as bool? ?? true,
      children: json['children'] == null
          ? const <CategoryModel>[]
          : categoryListFromJson(json['children']),
    );

Map<String, dynamic> _$CategoryModelToJson(_CategoryModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'image': ?instance.image?.toJson(),
      'shortTitle': instance.shortTitle,
      'description': instance.description,
      'status': instance.status,
      'parent': ?instance.parent,
      'level': instance.level,
      'sortOrder': instance.sortOrder,
      'showInHeader': instance.showInHeader,
      'children': instance.children.map((e) => e.toJson()).toList(),
    };
