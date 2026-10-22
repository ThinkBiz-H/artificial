// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$AddressModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: stringFromJson) String get type;@JsonKey(fromJson: stringFromJson) String get firstName;@JsonKey(fromJson: stringFromJson) String get lastName;@JsonKey(fromJson: stringFromJson) String get addressLine1;@JsonKey(fromJson: stringFromJson) String get addressLine2;@JsonKey(fromJson: stringFromJson) String get city;@JsonKey(fromJson: stringFromJson) String get state;@JsonKey(fromJson: stringFromJson) String get country;@JsonKey(fromJson: stringFromJson) String get pincode;@JsonKey(fromJson: stringFromJson) String get phone;@JsonKey(fromJson: boolFromJson) bool get isDefault;
/// Create a copy of AddressModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AddressModelCopyWith<AddressModel> get copyWith => _$AddressModelCopyWithImpl<AddressModel>(this as AddressModel, _$identity);

  /// Serializes this AddressModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AddressModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.addressLine1, addressLine1) || other.addressLine1 == addressLine1)&&(identical(other.addressLine2, addressLine2) || other.addressLine2 == addressLine2)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.country, country) || other.country == country)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.isDefault, isDefault) || other.isDefault == isDefault));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,firstName,lastName,addressLine1,addressLine2,city,state,country,pincode,phone,isDefault);

@override
String toString() {
  return 'AddressModel(id: $id, type: $type, firstName: $firstName, lastName: $lastName, addressLine1: $addressLine1, addressLine2: $addressLine2, city: $city, state: $state, country: $country, pincode: $pincode, phone: $phone, isDefault: $isDefault)';
}


}

/// @nodoc
abstract mixin class $AddressModelCopyWith<$Res>  {
  factory $AddressModelCopyWith(AddressModel value, $Res Function(AddressModel) _then) = _$AddressModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String type,@JsonKey(fromJson: stringFromJson) String firstName,@JsonKey(fromJson: stringFromJson) String lastName,@JsonKey(fromJson: stringFromJson) String addressLine1,@JsonKey(fromJson: stringFromJson) String addressLine2,@JsonKey(fromJson: stringFromJson) String city,@JsonKey(fromJson: stringFromJson) String state,@JsonKey(fromJson: stringFromJson) String country,@JsonKey(fromJson: stringFromJson) String pincode,@JsonKey(fromJson: stringFromJson) String phone,@JsonKey(fromJson: boolFromJson) bool isDefault
});




}
/// @nodoc
class _$AddressModelCopyWithImpl<$Res>
    implements $AddressModelCopyWith<$Res> {
  _$AddressModelCopyWithImpl(this._self, this._then);

  final AddressModel _self;
  final $Res Function(AddressModel) _then;

/// Create a copy of AddressModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? type = null,Object? firstName = null,Object? lastName = null,Object? addressLine1 = null,Object? addressLine2 = null,Object? city = null,Object? state = null,Object? country = null,Object? pincode = null,Object? phone = null,Object? isDefault = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,firstName: null == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String,lastName: null == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String,addressLine1: null == addressLine1 ? _self.addressLine1 : addressLine1 // ignore: cast_nullable_to_non_nullable
as String,addressLine2: null == addressLine2 ? _self.addressLine2 : addressLine2 // ignore: cast_nullable_to_non_nullable
as String,city: null == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String,state: null == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String,country: null == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String,pincode: null == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,isDefault: null == isDefault ? _self.isDefault : isDefault // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [AddressModel].
extension AddressModelPatterns on AddressModel {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AddressModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AddressModel() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AddressModel value)  $default,){
final _that = this;
switch (_that) {
case _AddressModel():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AddressModel value)?  $default,){
final _that = this;
switch (_that) {
case _AddressModel() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String type, @JsonKey(fromJson: stringFromJson)  String firstName, @JsonKey(fromJson: stringFromJson)  String lastName, @JsonKey(fromJson: stringFromJson)  String addressLine1, @JsonKey(fromJson: stringFromJson)  String addressLine2, @JsonKey(fromJson: stringFromJson)  String city, @JsonKey(fromJson: stringFromJson)  String state, @JsonKey(fromJson: stringFromJson)  String country, @JsonKey(fromJson: stringFromJson)  String pincode, @JsonKey(fromJson: stringFromJson)  String phone, @JsonKey(fromJson: boolFromJson)  bool isDefault)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AddressModel() when $default != null:
return $default(_that.id,_that.type,_that.firstName,_that.lastName,_that.addressLine1,_that.addressLine2,_that.city,_that.state,_that.country,_that.pincode,_that.phone,_that.isDefault);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String type, @JsonKey(fromJson: stringFromJson)  String firstName, @JsonKey(fromJson: stringFromJson)  String lastName, @JsonKey(fromJson: stringFromJson)  String addressLine1, @JsonKey(fromJson: stringFromJson)  String addressLine2, @JsonKey(fromJson: stringFromJson)  String city, @JsonKey(fromJson: stringFromJson)  String state, @JsonKey(fromJson: stringFromJson)  String country, @JsonKey(fromJson: stringFromJson)  String pincode, @JsonKey(fromJson: stringFromJson)  String phone, @JsonKey(fromJson: boolFromJson)  bool isDefault)  $default,) {final _that = this;
switch (_that) {
case _AddressModel():
return $default(_that.id,_that.type,_that.firstName,_that.lastName,_that.addressLine1,_that.addressLine2,_that.city,_that.state,_that.country,_that.pincode,_that.phone,_that.isDefault);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String type, @JsonKey(fromJson: stringFromJson)  String firstName, @JsonKey(fromJson: stringFromJson)  String lastName, @JsonKey(fromJson: stringFromJson)  String addressLine1, @JsonKey(fromJson: stringFromJson)  String addressLine2, @JsonKey(fromJson: stringFromJson)  String city, @JsonKey(fromJson: stringFromJson)  String state, @JsonKey(fromJson: stringFromJson)  String country, @JsonKey(fromJson: stringFromJson)  String pincode, @JsonKey(fromJson: stringFromJson)  String phone, @JsonKey(fromJson: boolFromJson)  bool isDefault)?  $default,) {final _that = this;
switch (_that) {
case _AddressModel() when $default != null:
return $default(_that.id,_that.type,_that.firstName,_that.lastName,_that.addressLine1,_that.addressLine2,_that.city,_that.state,_that.country,_that.pincode,_that.phone,_that.isDefault);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AddressModel extends AddressModel {
  const _AddressModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: stringFromJson) this.type = 'Home', @JsonKey(fromJson: stringFromJson) this.firstName = '', @JsonKey(fromJson: stringFromJson) this.lastName = '', @JsonKey(fromJson: stringFromJson) this.addressLine1 = '', @JsonKey(fromJson: stringFromJson) this.addressLine2 = '', @JsonKey(fromJson: stringFromJson) this.city = '', @JsonKey(fromJson: stringFromJson) this.state = '', @JsonKey(fromJson: stringFromJson) this.country = 'India', @JsonKey(fromJson: stringFromJson) this.pincode = '', @JsonKey(fromJson: stringFromJson) this.phone = '', @JsonKey(fromJson: boolFromJson) this.isDefault = false}): super._();
  factory _AddressModel.fromJson(Map<String, dynamic> json) => _$AddressModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: stringFromJson) final  String type;
@override@JsonKey(fromJson: stringFromJson) final  String firstName;
@override@JsonKey(fromJson: stringFromJson) final  String lastName;
@override@JsonKey(fromJson: stringFromJson) final  String addressLine1;
@override@JsonKey(fromJson: stringFromJson) final  String addressLine2;
@override@JsonKey(fromJson: stringFromJson) final  String city;
@override@JsonKey(fromJson: stringFromJson) final  String state;
@override@JsonKey(fromJson: stringFromJson) final  String country;
@override@JsonKey(fromJson: stringFromJson) final  String pincode;
@override@JsonKey(fromJson: stringFromJson) final  String phone;
@override@JsonKey(fromJson: boolFromJson) final  bool isDefault;

/// Create a copy of AddressModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AddressModelCopyWith<_AddressModel> get copyWith => __$AddressModelCopyWithImpl<_AddressModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AddressModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AddressModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.addressLine1, addressLine1) || other.addressLine1 == addressLine1)&&(identical(other.addressLine2, addressLine2) || other.addressLine2 == addressLine2)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.country, country) || other.country == country)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.isDefault, isDefault) || other.isDefault == isDefault));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,firstName,lastName,addressLine1,addressLine2,city,state,country,pincode,phone,isDefault);

@override
String toString() {
  return 'AddressModel(id: $id, type: $type, firstName: $firstName, lastName: $lastName, addressLine1: $addressLine1, addressLine2: $addressLine2, city: $city, state: $state, country: $country, pincode: $pincode, phone: $phone, isDefault: $isDefault)';
}


}

/// @nodoc
abstract mixin class _$AddressModelCopyWith<$Res> implements $AddressModelCopyWith<$Res> {
  factory _$AddressModelCopyWith(_AddressModel value, $Res Function(_AddressModel) _then) = __$AddressModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String type,@JsonKey(fromJson: stringFromJson) String firstName,@JsonKey(fromJson: stringFromJson) String lastName,@JsonKey(fromJson: stringFromJson) String addressLine1,@JsonKey(fromJson: stringFromJson) String addressLine2,@JsonKey(fromJson: stringFromJson) String city,@JsonKey(fromJson: stringFromJson) String state,@JsonKey(fromJson: stringFromJson) String country,@JsonKey(fromJson: stringFromJson) String pincode,@JsonKey(fromJson: stringFromJson) String phone,@JsonKey(fromJson: boolFromJson) bool isDefault
});




}
/// @nodoc
class __$AddressModelCopyWithImpl<$Res>
    implements _$AddressModelCopyWith<$Res> {
  __$AddressModelCopyWithImpl(this._self, this._then);

  final _AddressModel _self;
  final $Res Function(_AddressModel) _then;

/// Create a copy of AddressModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? type = null,Object? firstName = null,Object? lastName = null,Object? addressLine1 = null,Object? addressLine2 = null,Object? city = null,Object? state = null,Object? country = null,Object? pincode = null,Object? phone = null,Object? isDefault = null,}) {
  return _then(_AddressModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,firstName: null == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String,lastName: null == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String,addressLine1: null == addressLine1 ? _self.addressLine1 : addressLine1 // ignore: cast_nullable_to_non_nullable
as String,addressLine2: null == addressLine2 ? _self.addressLine2 : addressLine2 // ignore: cast_nullable_to_non_nullable
as String,city: null == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String,state: null == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String,country: null == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String,pincode: null == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,isDefault: null == isDefault ? _self.isDefault : isDefault // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$UserModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: stringFromJson) String get name;@JsonKey(fromJson: nullableStringFromJson) String? get email;@JsonKey(fromJson: nullableStringFromJson) String? get mobile;@JsonKey(fromJson: imageFromJson) ImageModel? get profileImage;@JsonKey(name: 'address', fromJson: addressListFromJson) List<AddressModel> get addresses;@JsonKey(fromJson: nullableStringFromJson) String? get city;@JsonKey(fromJson: nullableStringFromJson) String? get state;@JsonKey(fromJson: nullableStringFromJson) String? get country;@JsonKey(fromJson: nullableStringFromJson) String? get pincode;@JsonKey(fromJson: stringFromJson) String get role;@JsonKey(fromJson: boolFromJson) bool get isVerified;@JsonKey(fromJson: boolFromJson) bool get isMobileVerified;@JsonKey(fromJson: boolFromJson) bool get isActive;@JsonKey(fromJson: stringListFromJson) List<String> get wishlist; DateTime? get createdAt;
/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UserModelCopyWith<UserModel> get copyWith => _$UserModelCopyWithImpl<UserModel>(this as UserModel, _$identity);

  /// Serializes this UserModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UserModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.email, email) || other.email == email)&&(identical(other.mobile, mobile) || other.mobile == mobile)&&(identical(other.profileImage, profileImage) || other.profileImage == profileImage)&&const DeepCollectionEquality().equals(other.addresses, addresses)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.country, country) || other.country == country)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.role, role) || other.role == role)&&(identical(other.isVerified, isVerified) || other.isVerified == isVerified)&&(identical(other.isMobileVerified, isMobileVerified) || other.isMobileVerified == isMobileVerified)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&const DeepCollectionEquality().equals(other.wishlist, wishlist)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,email,mobile,profileImage,const DeepCollectionEquality().hash(addresses),city,state,country,pincode,role,isVerified,isMobileVerified,isActive,const DeepCollectionEquality().hash(wishlist),createdAt);

@override
String toString() {
  return 'UserModel(id: $id, name: $name, email: $email, mobile: $mobile, profileImage: $profileImage, addresses: $addresses, city: $city, state: $state, country: $country, pincode: $pincode, role: $role, isVerified: $isVerified, isMobileVerified: $isMobileVerified, isActive: $isActive, wishlist: $wishlist, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $UserModelCopyWith<$Res>  {
  factory $UserModelCopyWith(UserModel value, $Res Function(UserModel) _then) = _$UserModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: nullableStringFromJson) String? email,@JsonKey(fromJson: nullableStringFromJson) String? mobile,@JsonKey(fromJson: imageFromJson) ImageModel? profileImage,@JsonKey(name: 'address', fromJson: addressListFromJson) List<AddressModel> addresses,@JsonKey(fromJson: nullableStringFromJson) String? city,@JsonKey(fromJson: nullableStringFromJson) String? state,@JsonKey(fromJson: nullableStringFromJson) String? country,@JsonKey(fromJson: nullableStringFromJson) String? pincode,@JsonKey(fromJson: stringFromJson) String role,@JsonKey(fromJson: boolFromJson) bool isVerified,@JsonKey(fromJson: boolFromJson) bool isMobileVerified,@JsonKey(fromJson: boolFromJson) bool isActive,@JsonKey(fromJson: stringListFromJson) List<String> wishlist, DateTime? createdAt
});


$ImageModelCopyWith<$Res>? get profileImage;

}
/// @nodoc
class _$UserModelCopyWithImpl<$Res>
    implements $UserModelCopyWith<$Res> {
  _$UserModelCopyWithImpl(this._self, this._then);

  final UserModel _self;
  final $Res Function(UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? email = freezed,Object? mobile = freezed,Object? profileImage = freezed,Object? addresses = null,Object? city = freezed,Object? state = freezed,Object? country = freezed,Object? pincode = freezed,Object? role = null,Object? isVerified = null,Object? isMobileVerified = null,Object? isActive = null,Object? wishlist = null,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,mobile: freezed == mobile ? _self.mobile : mobile // ignore: cast_nullable_to_non_nullable
as String?,profileImage: freezed == profileImage ? _self.profileImage : profileImage // ignore: cast_nullable_to_non_nullable
as ImageModel?,addresses: null == addresses ? _self.addresses : addresses // ignore: cast_nullable_to_non_nullable
as List<AddressModel>,city: freezed == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String?,state: freezed == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String?,country: freezed == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String?,pincode: freezed == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String?,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,isVerified: null == isVerified ? _self.isVerified : isVerified // ignore: cast_nullable_to_non_nullable
as bool,isMobileVerified: null == isMobileVerified ? _self.isMobileVerified : isMobileVerified // ignore: cast_nullable_to_non_nullable
as bool,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,wishlist: null == wishlist ? _self.wishlist : wishlist // ignore: cast_nullable_to_non_nullable
as List<String>,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}
/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get profileImage {
    if (_self.profileImage == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.profileImage!, (value) {
    return _then(_self.copyWith(profileImage: value));
  });
}
}


/// Adds pattern-matching-related methods to [UserModel].
extension UserModelPatterns on UserModel {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UserModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UserModel value)  $default,){
final _that = this;
switch (_that) {
case _UserModel():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UserModel value)?  $default,){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: nullableStringFromJson)  String? email, @JsonKey(fromJson: nullableStringFromJson)  String? mobile, @JsonKey(fromJson: imageFromJson)  ImageModel? profileImage, @JsonKey(name: 'address', fromJson: addressListFromJson)  List<AddressModel> addresses, @JsonKey(fromJson: nullableStringFromJson)  String? city, @JsonKey(fromJson: nullableStringFromJson)  String? state, @JsonKey(fromJson: nullableStringFromJson)  String? country, @JsonKey(fromJson: nullableStringFromJson)  String? pincode, @JsonKey(fromJson: stringFromJson)  String role, @JsonKey(fromJson: boolFromJson)  bool isVerified, @JsonKey(fromJson: boolFromJson)  bool isMobileVerified, @JsonKey(fromJson: boolFromJson)  bool isActive, @JsonKey(fromJson: stringListFromJson)  List<String> wishlist,  DateTime? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.id,_that.name,_that.email,_that.mobile,_that.profileImage,_that.addresses,_that.city,_that.state,_that.country,_that.pincode,_that.role,_that.isVerified,_that.isMobileVerified,_that.isActive,_that.wishlist,_that.createdAt);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: nullableStringFromJson)  String? email, @JsonKey(fromJson: nullableStringFromJson)  String? mobile, @JsonKey(fromJson: imageFromJson)  ImageModel? profileImage, @JsonKey(name: 'address', fromJson: addressListFromJson)  List<AddressModel> addresses, @JsonKey(fromJson: nullableStringFromJson)  String? city, @JsonKey(fromJson: nullableStringFromJson)  String? state, @JsonKey(fromJson: nullableStringFromJson)  String? country, @JsonKey(fromJson: nullableStringFromJson)  String? pincode, @JsonKey(fromJson: stringFromJson)  String role, @JsonKey(fromJson: boolFromJson)  bool isVerified, @JsonKey(fromJson: boolFromJson)  bool isMobileVerified, @JsonKey(fromJson: boolFromJson)  bool isActive, @JsonKey(fromJson: stringListFromJson)  List<String> wishlist,  DateTime? createdAt)  $default,) {final _that = this;
switch (_that) {
case _UserModel():
return $default(_that.id,_that.name,_that.email,_that.mobile,_that.profileImage,_that.addresses,_that.city,_that.state,_that.country,_that.pincode,_that.role,_that.isVerified,_that.isMobileVerified,_that.isActive,_that.wishlist,_that.createdAt);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: nullableStringFromJson)  String? email, @JsonKey(fromJson: nullableStringFromJson)  String? mobile, @JsonKey(fromJson: imageFromJson)  ImageModel? profileImage, @JsonKey(name: 'address', fromJson: addressListFromJson)  List<AddressModel> addresses, @JsonKey(fromJson: nullableStringFromJson)  String? city, @JsonKey(fromJson: nullableStringFromJson)  String? state, @JsonKey(fromJson: nullableStringFromJson)  String? country, @JsonKey(fromJson: nullableStringFromJson)  String? pincode, @JsonKey(fromJson: stringFromJson)  String role, @JsonKey(fromJson: boolFromJson)  bool isVerified, @JsonKey(fromJson: boolFromJson)  bool isMobileVerified, @JsonKey(fromJson: boolFromJson)  bool isActive, @JsonKey(fromJson: stringListFromJson)  List<String> wishlist,  DateTime? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.id,_that.name,_that.email,_that.mobile,_that.profileImage,_that.addresses,_that.city,_that.state,_that.country,_that.pincode,_that.role,_that.isVerified,_that.isMobileVerified,_that.isActive,_that.wishlist,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _UserModel extends UserModel {
  const _UserModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: stringFromJson) this.name = '', @JsonKey(fromJson: nullableStringFromJson) this.email, @JsonKey(fromJson: nullableStringFromJson) this.mobile, @JsonKey(fromJson: imageFromJson) this.profileImage, @JsonKey(name: 'address', fromJson: addressListFromJson) final  List<AddressModel> addresses = const <AddressModel>[], @JsonKey(fromJson: nullableStringFromJson) this.city, @JsonKey(fromJson: nullableStringFromJson) this.state, @JsonKey(fromJson: nullableStringFromJson) this.country, @JsonKey(fromJson: nullableStringFromJson) this.pincode, @JsonKey(fromJson: stringFromJson) this.role = 'user', @JsonKey(fromJson: boolFromJson) this.isVerified = false, @JsonKey(fromJson: boolFromJson) this.isMobileVerified = false, @JsonKey(fromJson: boolFromJson) this.isActive = true, @JsonKey(fromJson: stringListFromJson) final  List<String> wishlist = const <String>[], this.createdAt}): _addresses = addresses,_wishlist = wishlist,super._();
  factory _UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: stringFromJson) final  String name;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? email;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? mobile;
@override@JsonKey(fromJson: imageFromJson) final  ImageModel? profileImage;
 final  List<AddressModel> _addresses;
@override@JsonKey(name: 'address', fromJson: addressListFromJson) List<AddressModel> get addresses {
  if (_addresses is EqualUnmodifiableListView) return _addresses;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_addresses);
}

@override@JsonKey(fromJson: nullableStringFromJson) final  String? city;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? state;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? country;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? pincode;
@override@JsonKey(fromJson: stringFromJson) final  String role;
@override@JsonKey(fromJson: boolFromJson) final  bool isVerified;
@override@JsonKey(fromJson: boolFromJson) final  bool isMobileVerified;
@override@JsonKey(fromJson: boolFromJson) final  bool isActive;
 final  List<String> _wishlist;
@override@JsonKey(fromJson: stringListFromJson) List<String> get wishlist {
  if (_wishlist is EqualUnmodifiableListView) return _wishlist;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_wishlist);
}

@override final  DateTime? createdAt;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UserModelCopyWith<_UserModel> get copyWith => __$UserModelCopyWithImpl<_UserModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$UserModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UserModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.email, email) || other.email == email)&&(identical(other.mobile, mobile) || other.mobile == mobile)&&(identical(other.profileImage, profileImage) || other.profileImage == profileImage)&&const DeepCollectionEquality().equals(other._addresses, _addresses)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.country, country) || other.country == country)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.role, role) || other.role == role)&&(identical(other.isVerified, isVerified) || other.isVerified == isVerified)&&(identical(other.isMobileVerified, isMobileVerified) || other.isMobileVerified == isMobileVerified)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&const DeepCollectionEquality().equals(other._wishlist, _wishlist)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,email,mobile,profileImage,const DeepCollectionEquality().hash(_addresses),city,state,country,pincode,role,isVerified,isMobileVerified,isActive,const DeepCollectionEquality().hash(_wishlist),createdAt);

@override
String toString() {
  return 'UserModel(id: $id, name: $name, email: $email, mobile: $mobile, profileImage: $profileImage, addresses: $addresses, city: $city, state: $state, country: $country, pincode: $pincode, role: $role, isVerified: $isVerified, isMobileVerified: $isMobileVerified, isActive: $isActive, wishlist: $wishlist, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$UserModelCopyWith<$Res> implements $UserModelCopyWith<$Res> {
  factory _$UserModelCopyWith(_UserModel value, $Res Function(_UserModel) _then) = __$UserModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: nullableStringFromJson) String? email,@JsonKey(fromJson: nullableStringFromJson) String? mobile,@JsonKey(fromJson: imageFromJson) ImageModel? profileImage,@JsonKey(name: 'address', fromJson: addressListFromJson) List<AddressModel> addresses,@JsonKey(fromJson: nullableStringFromJson) String? city,@JsonKey(fromJson: nullableStringFromJson) String? state,@JsonKey(fromJson: nullableStringFromJson) String? country,@JsonKey(fromJson: nullableStringFromJson) String? pincode,@JsonKey(fromJson: stringFromJson) String role,@JsonKey(fromJson: boolFromJson) bool isVerified,@JsonKey(fromJson: boolFromJson) bool isMobileVerified,@JsonKey(fromJson: boolFromJson) bool isActive,@JsonKey(fromJson: stringListFromJson) List<String> wishlist, DateTime? createdAt
});


@override $ImageModelCopyWith<$Res>? get profileImage;

}
/// @nodoc
class __$UserModelCopyWithImpl<$Res>
    implements _$UserModelCopyWith<$Res> {
  __$UserModelCopyWithImpl(this._self, this._then);

  final _UserModel _self;
  final $Res Function(_UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? email = freezed,Object? mobile = freezed,Object? profileImage = freezed,Object? addresses = null,Object? city = freezed,Object? state = freezed,Object? country = freezed,Object? pincode = freezed,Object? role = null,Object? isVerified = null,Object? isMobileVerified = null,Object? isActive = null,Object? wishlist = null,Object? createdAt = freezed,}) {
  return _then(_UserModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,mobile: freezed == mobile ? _self.mobile : mobile // ignore: cast_nullable_to_non_nullable
as String?,profileImage: freezed == profileImage ? _self.profileImage : profileImage // ignore: cast_nullable_to_non_nullable
as ImageModel?,addresses: null == addresses ? _self._addresses : addresses // ignore: cast_nullable_to_non_nullable
as List<AddressModel>,city: freezed == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String?,state: freezed == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String?,country: freezed == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String?,pincode: freezed == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String?,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,isVerified: null == isVerified ? _self.isVerified : isVerified // ignore: cast_nullable_to_non_nullable
as bool,isMobileVerified: null == isMobileVerified ? _self.isMobileVerified : isMobileVerified // ignore: cast_nullable_to_non_nullable
as bool,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,wishlist: null == wishlist ? _self._wishlist : wishlist // ignore: cast_nullable_to_non_nullable
as List<String>,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get profileImage {
    if (_self.profileImage == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.profileImage!, (value) {
    return _then(_self.copyWith(profileImage: value));
  });
}
}

// dart format on
