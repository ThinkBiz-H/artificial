// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_NotificationModel _$NotificationModelFromJson(Map<String, dynamic> json) =>
    _NotificationModel(
      id: json['_id'] == null ? '' : idFromJson(json['_id']),
      type: json['type'] == null ? 'system' : stringFromJson(json['type']),
      title: json['title'] == null ? '' : stringFromJson(json['title']),
      message: json['message'] == null ? '' : stringFromJson(json['message']),
      link: nullableStringFromJson(json['link']),
      relatedOrder: nullableIdFromJson(json['relatedOrder']),
      relatedProduct: nullableIdFromJson(json['relatedProduct']),
      isRead: json['isRead'] == null ? false : boolFromJson(json['isRead']),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$NotificationModelToJson(_NotificationModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'type': instance.type,
      'title': instance.title,
      'message': instance.message,
      'link': ?instance.link,
      'relatedOrder': ?instance.relatedOrder,
      'relatedProduct': ?instance.relatedProduct,
      'isRead': instance.isRead,
      'createdAt': ?instance.createdAt?.toIso8601String(),
    };
