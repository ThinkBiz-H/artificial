// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ColorOptionModel _$ColorOptionModelFromJson(Map<String, dynamic> json) =>
    _ColorOptionModel(
      name: json['name'] == null ? '' : stringFromJson(json['name']),
      hex: nullableStringFromJson(json['hex']),
      images: json['images'] == null
          ? const <ImageModel>[]
          : imageListFromJson(json['images']),
    );

Map<String, dynamic> _$ColorOptionModelToJson(_ColorOptionModel instance) =>
    <String, dynamic>{
      'name': instance.name,
      'hex': ?instance.hex,
      'images': instance.images.map((e) => e.toJson()).toList(),
    };

_VariantModel _$VariantModelFromJson(
  Map<String, dynamic> json,
) => _VariantModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  product: json['product'] == null ? '' : idFromJson(json['product']),
  attributes: json['attributes'] == null
      ? const <AttributeKV>[]
      : attributeListFromJson(json['attributes']),
  color: nullableStringFromJson(json['color']),
  colorHex: nullableStringFromJson(json['colorHex']),
  size: nullableStringFromJson(json['size']),
  sku: json['sku'] == null ? '' : stringFromJson(json['sku']),
  price: json['price'] == null ? 0 : doubleFromJson(json['price']),
  salePrice: nullableDoubleFromJson(json['salePrice']),
  stock: json['stock'] == null ? 0 : intFromJson(json['stock']),
  unit: unitFromJson(json['unit']),
  unitValue: json['unitValue'] == null ? 0 : doubleFromJson(json['unitValue']),
  images: json['images'] == null
      ? const <ImageModel>[]
      : imageListFromJson(json['images']),
  status: json['status'] == null ? 'active' : stringFromJson(json['status']),
  isDefault: json['isDefault'] == null
      ? false
      : boolFromJson(json['isDefault']),
);

Map<String, dynamic> _$VariantModelToJson(_VariantModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'product': instance.product,
      'attributes': instance.attributes.map((e) => e.toJson()).toList(),
      'color': ?instance.color,
      'colorHex': ?instance.colorHex,
      'size': ?instance.size,
      'sku': instance.sku,
      'price': instance.price,
      'salePrice': ?instance.salePrice,
      'stock': instance.stock,
      'unit': ?instance.unit?.toJson(),
      'unitValue': instance.unitValue,
      'images': instance.images.map((e) => e.toJson()).toList(),
      'status': instance.status,
      'isDefault': instance.isDefault,
    };

_ReviewModel _$ReviewModelFromJson(Map<String, dynamic> json) => _ReviewModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  userId: json['userId'] == null ? '' : idFromJson(json['userId']),
  userName: json['userName'] == null
      ? 'Customer'
      : stringFromJson(json['userName']),
  userImage: json['userImage'] == null ? '' : stringFromJson(json['userImage']),
  rating: json['rating'] == null ? 0 : doubleFromJson(json['rating']),
  comment: json['comment'] == null ? '' : stringFromJson(json['comment']),
  images: json['images'] == null
      ? const <ImageModel>[]
      : imageListFromJson(json['images']),
  isVerifiedPurchase: json['isVerifiedPurchase'] == null
      ? false
      : boolFromJson(json['isVerifiedPurchase']),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

_ProductModel _$ProductModelFromJson(
  Map<String, dynamic> json,
) => _ProductModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  title: json['title'] == null ? '' : stringFromJson(json['title']),
  slug: json['slug'] == null ? '' : stringFromJson(json['slug']),
  shortDescription: json['shortDescription'] == null
      ? ''
      : stringFromJson(json['shortDescription']),
  description: json['description'] == null
      ? ''
      : stringFromJson(json['description']),
  sku: json['SKU'] == null ? '' : stringFromJson(json['SKU']),
  category: refFromJson(json['category']),
  brand: refFromJson(json['brand']),
  unit: unitFromJson(json['unit']),
  unitValue: json['unitValue'] == null ? 1 : doubleFromJson(json['unitValue']),
  price: json['price'] == null ? 0 : doubleFromJson(json['price']),
  salePrice: nullableDoubleFromJson(json['salePrice']),
  stock: json['stock'] == null ? 0 : intFromJson(json['stock']),
  basePrice: nullableDoubleFromJson(json['basePrice']),
  gstRate: json['gstRate'] == null ? 18 : doubleFromJson(json['gstRate']),
  gstAmount: nullableDoubleFromJson(json['gstAmount']),
  priceIncludesGST: json['priceIncludesGST'] as bool? ?? true,
  images: json['images'] == null
      ? const <ImageModel>[]
      : imageListFromJson(json['images']),
  thumbnail: imageFromJson(json['thumbnail']),
  videoUrl: json['videoUrl'] == null ? '' : stringFromJson(json['videoUrl']),
  tags: json['tags'] == null
      ? const <String>[]
      : stringListFromJson(json['tags']),
  attributes: json['attributes'] == null
      ? const <AttributeKV>[]
      : attributeListFromJson(json['attributes']),
  colorOptions: json['colorOptions'] == null
      ? const <ColorOptionModel>[]
      : colorOptionListFromJson(json['colorOptions']),
  colors: json['colors'] == null
      ? const <String>[]
      : stringListFromJson(json['colors']),
  sizes: json['sizes'] == null
      ? const <String>[]
      : stringListFromJson(json['sizes']),
  metal: nullableStringFromJson(json['metal']),
  plating: nullableStringFromJson(json['plating']),
  weight: nullableDoubleFromJson(json['weight']),
  hasVariants: json['hasVariants'] == null
      ? false
      : boolFromJson(json['hasVariants']),
  variants: json['variants'] == null
      ? const <VariantModel>[]
      : variantListFromJson(json['variants']),
  crossSell: json['crossSell'] == null
      ? const <ProductModel>[]
      : productRefListFromJson(json['crossSell']),
  minOrderQuantity: json['minOrderQuantity'] == null
      ? 1
      : intFromJson(json['minOrderQuantity']),
  maxOrderQuantity: nullableIntFromJson(json['maxOrderQuantity']),
  warranty: json['warranty'] == null ? '' : stringFromJson(json['warranty']),
  returnPolicy: json['returnPolicy'] == null
      ? ''
      : stringFromJson(json['returnPolicy']),
  rating: json['rating'] == null ? 0 : doubleFromJson(json['rating']),
  numReviews: json['numReviews'] == null ? 0 : intFromJson(json['numReviews']),
  reviews: json['reviews'] == null
      ? const <ReviewModel>[]
      : reviewListFromJson(json['reviews']),
  salesCount: json['salesCount'] == null ? 0 : intFromJson(json['salesCount']),
  featured: json['featured'] == null ? false : boolFromJson(json['featured']),
  status: json['status'] == null ? 'active' : stringFromJson(json['status']),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$ProductModelToJson(_ProductModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'title': instance.title,
      'slug': instance.slug,
      'shortDescription': instance.shortDescription,
      'description': instance.description,
      'SKU': instance.sku,
      'category': ?instance.category?.toJson(),
      'brand': ?instance.brand?.toJson(),
      'unit': ?instance.unit?.toJson(),
      'unitValue': instance.unitValue,
      'price': instance.price,
      'salePrice': ?instance.salePrice,
      'stock': instance.stock,
      'basePrice': ?instance.basePrice,
      'gstRate': instance.gstRate,
      'gstAmount': ?instance.gstAmount,
      'priceIncludesGST': instance.priceIncludesGST,
      'images': instance.images.map((e) => e.toJson()).toList(),
      'thumbnail': ?instance.thumbnail?.toJson(),
      'videoUrl': instance.videoUrl,
      'tags': instance.tags,
      'attributes': instance.attributes.map((e) => e.toJson()).toList(),
      'colorOptions': instance.colorOptions.map((e) => e.toJson()).toList(),
      'colors': instance.colors,
      'sizes': instance.sizes,
      'metal': ?instance.metal,
      'plating': ?instance.plating,
      'weight': ?instance.weight,
      'hasVariants': instance.hasVariants,
      'variants': instance.variants.map((e) => e.toJson()).toList(),
      'minOrderQuantity': instance.minOrderQuantity,
      'maxOrderQuantity': ?instance.maxOrderQuantity,
      'warranty': instance.warranty,
      'returnPolicy': instance.returnPolicy,
      'rating': instance.rating,
      'numReviews': instance.numReviews,
      'salesCount': instance.salesCount,
      'featured': instance.featured,
      'status': instance.status,
      'createdAt': ?instance.createdAt?.toIso8601String(),
    };
