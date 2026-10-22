// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CartItemModel _$CartItemModelFromJson(Map<String, dynamic> json) =>
    _CartItemModel(
      lineId: nullableStringFromJson(json['lineId']),
      product: productFromJson(json['product']),
      variant: variantFromJson(json['variant']),
      quantity: json['quantity'] == null ? 1 : intFromJson(json['quantity']),
      color: nullableStringFromJson(json['color']),
      colorHex: nullableStringFromJson(json['colorHex']),
      size: nullableStringFromJson(json['size']),
      metal: nullableStringFromJson(json['metal']),
      plating: nullableStringFromJson(json['plating']),
      lineImage: nullableStringFromJson(json['image']),
      price: json['price'] == null ? 0 : doubleFromJson(json['price']),
      itemTotal: json['itemTotal'] == null
          ? 0
          : doubleFromJson(json['itemTotal']),
    );

Map<String, dynamic> _$CartItemModelToJson(_CartItemModel instance) =>
    <String, dynamic>{
      'lineId': ?instance.lineId,
      'product': instance.product.toJson(),
      'variant': ?instance.variant?.toJson(),
      'quantity': instance.quantity,
      'color': ?instance.color,
      'colorHex': ?instance.colorHex,
      'size': ?instance.size,
      'metal': ?instance.metal,
      'plating': ?instance.plating,
      'image': ?instance.lineImage,
      'price': instance.price,
      'itemTotal': instance.itemTotal,
    };
