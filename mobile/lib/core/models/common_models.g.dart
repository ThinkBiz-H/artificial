// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'common_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ImageModel _$ImageModelFromJson(Map<String, dynamic> json) => _ImageModel(
  url: json['url'] == null ? '' : stringFromJson(json['url']),
  publicId: json['publicId'] == null ? '' : stringFromJson(json['publicId']),
);

Map<String, dynamic> _$ImageModelToJson(_ImageModel instance) =>
    <String, dynamic>{'url': instance.url, 'publicId': instance.publicId};

_RefModel _$RefModelFromJson(Map<String, dynamic> json) => _RefModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  name: json['name'] == null ? '' : stringFromJson(json['name']),
  slug: json['slug'] == null ? '' : stringFromJson(json['slug']),
  logo: imageFromJson(json['logo']),
  status: json['status'] == null ? 'active' : stringFromJson(json['status']),
);

Map<String, dynamic> _$RefModelToJson(_RefModel instance) => <String, dynamic>{
  '_id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
  'logo': ?instance.logo?.toJson(),
  'status': instance.status,
};

_UnitModel _$UnitModelFromJson(Map<String, dynamic> json) => _UnitModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  name: json['name'] == null ? '' : stringFromJson(json['name']),
  symbol: json['symbol'] == null ? '' : stringFromJson(json['symbol']),
  allowDecimal: json['allowDecimal'] == null
      ? false
      : boolFromJson(json['allowDecimal']),
);

Map<String, dynamic> _$UnitModelToJson(_UnitModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'symbol': instance.symbol,
      'allowDecimal': instance.allowDecimal,
    };

_AttributeKV _$AttributeKVFromJson(Map<String, dynamic> json) => _AttributeKV(
  key: json['key'] == null ? '' : stringFromJson(json['key']),
  value: json['value'] == null ? '' : stringFromJson(json['value']),
);

Map<String, dynamic> _$AttributeKVToJson(_AttributeKV instance) =>
    <String, dynamic>{'key': instance.key, 'value': instance.value};

_Pagination _$PaginationFromJson(Map<String, dynamic> json) => _Pagination(
  total: json['total'] == null ? 0 : intFromJson(json['total']),
  page: json['page'] == null ? 1 : intFromJson(json['page']),
  limit: json['limit'] == null ? 12 : intFromJson(json['limit']),
  totalPages: json['totalPages'] == null ? 0 : intFromJson(json['totalPages']),
);

Map<String, dynamic> _$PaginationToJson(_Pagination instance) =>
    <String, dynamic>{
      'total': instance.total,
      'page': instance.page,
      'limit': instance.limit,
      'totalPages': instance.totalPages,
    };
