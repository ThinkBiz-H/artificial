// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AddressModel _$AddressModelFromJson(
  Map<String, dynamic> json,
) => _AddressModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  type: json['type'] == null ? 'Home' : stringFromJson(json['type']),
  firstName: json['firstName'] == null ? '' : stringFromJson(json['firstName']),
  lastName: json['lastName'] == null ? '' : stringFromJson(json['lastName']),
  addressLine1: json['addressLine1'] == null
      ? ''
      : stringFromJson(json['addressLine1']),
  addressLine2: json['addressLine2'] == null
      ? ''
      : stringFromJson(json['addressLine2']),
  city: json['city'] == null ? '' : stringFromJson(json['city']),
  state: json['state'] == null ? '' : stringFromJson(json['state']),
  country: json['country'] == null ? 'India' : stringFromJson(json['country']),
  pincode: json['pincode'] == null ? '' : stringFromJson(json['pincode']),
  phone: json['phone'] == null ? '' : stringFromJson(json['phone']),
  isDefault: json['isDefault'] == null
      ? false
      : boolFromJson(json['isDefault']),
);

Map<String, dynamic> _$AddressModelToJson(_AddressModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'type': instance.type,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'addressLine1': instance.addressLine1,
      'addressLine2': instance.addressLine2,
      'city': instance.city,
      'state': instance.state,
      'country': instance.country,
      'pincode': instance.pincode,
      'phone': instance.phone,
      'isDefault': instance.isDefault,
    };

_UserModel _$UserModelFromJson(Map<String, dynamic> json) => _UserModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  name: json['name'] == null ? '' : stringFromJson(json['name']),
  email: nullableStringFromJson(json['email']),
  mobile: nullableStringFromJson(json['mobile']),
  profileImage: imageFromJson(json['profileImage']),
  addresses: json['address'] == null
      ? const <AddressModel>[]
      : addressListFromJson(json['address']),
  city: nullableStringFromJson(json['city']),
  state: nullableStringFromJson(json['state']),
  country: nullableStringFromJson(json['country']),
  pincode: nullableStringFromJson(json['pincode']),
  role: json['role'] == null ? 'user' : stringFromJson(json['role']),
  isVerified: json['isVerified'] == null
      ? false
      : boolFromJson(json['isVerified']),
  isMobileVerified: json['isMobileVerified'] == null
      ? false
      : boolFromJson(json['isMobileVerified']),
  isActive: json['isActive'] == null ? true : boolFromJson(json['isActive']),
  wishlist: json['wishlist'] == null
      ? const <String>[]
      : stringListFromJson(json['wishlist']),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$UserModelToJson(_UserModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'email': ?instance.email,
      'mobile': ?instance.mobile,
      'profileImage': ?instance.profileImage?.toJson(),
      'address': instance.addresses.map((e) => e.toJson()).toList(),
      'city': ?instance.city,
      'state': ?instance.state,
      'country': ?instance.country,
      'pincode': ?instance.pincode,
      'role': instance.role,
      'isVerified': instance.isVerified,
      'isMobileVerified': instance.isMobileVerified,
      'isActive': instance.isActive,
      'wishlist': instance.wishlist,
      'createdAt': ?instance.createdAt?.toIso8601String(),
    };
