// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$OrderItemModel {

@JsonKey(fromJson: idFromJson) String get product;@JsonKey(fromJson: nullableIdFromJson) String? get variant;@JsonKey(fromJson: stringFromJson) String get title;@JsonKey(fromJson: stringFromJson) String get sku;@JsonKey(fromJson: nullableStringFromJson) String? get unitValue;@JsonKey(fromJson: stringFromJson) String get thumbnail;@JsonKey(fromJson: intFromJson) int get quantity;@JsonKey(fromJson: doubleFromJson) double get price;@JsonKey(fromJson: nullableDoubleFromJson) double? get mrp;@JsonKey(fromJson: doubleFromJson) double get discount;@JsonKey(fromJson: nullableDoubleFromJson) double? get gstRate;@JsonKey(fromJson: nullableDoubleFromJson) double? get gstAmount;@JsonKey(fromJson: nullableStringFromJson) String? get color;@JsonKey(fromJson: nullableStringFromJson) String? get colorHex;@JsonKey(fromJson: nullableStringFromJson) String? get size;@JsonKey(fromJson: nullableStringFromJson) String? get metal;@JsonKey(fromJson: nullableStringFromJson) String? get plating;
/// Create a copy of OrderItemModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderItemModelCopyWith<OrderItemModel> get copyWith => _$OrderItemModelCopyWithImpl<OrderItemModel>(this as OrderItemModel, _$identity);

  /// Serializes this OrderItemModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderItemModel&&(identical(other.product, product) || other.product == product)&&(identical(other.variant, variant) || other.variant == variant)&&(identical(other.title, title) || other.title == title)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.unitValue, unitValue) || other.unitValue == unitValue)&&(identical(other.thumbnail, thumbnail) || other.thumbnail == thumbnail)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.price, price) || other.price == price)&&(identical(other.mrp, mrp) || other.mrp == mrp)&&(identical(other.discount, discount) || other.discount == discount)&&(identical(other.gstRate, gstRate) || other.gstRate == gstRate)&&(identical(other.gstAmount, gstAmount) || other.gstAmount == gstAmount)&&(identical(other.color, color) || other.color == color)&&(identical(other.colorHex, colorHex) || other.colorHex == colorHex)&&(identical(other.size, size) || other.size == size)&&(identical(other.metal, metal) || other.metal == metal)&&(identical(other.plating, plating) || other.plating == plating));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,product,variant,title,sku,unitValue,thumbnail,quantity,price,mrp,discount,gstRate,gstAmount,color,colorHex,size,metal,plating);

@override
String toString() {
  return 'OrderItemModel(product: $product, variant: $variant, title: $title, sku: $sku, unitValue: $unitValue, thumbnail: $thumbnail, quantity: $quantity, price: $price, mrp: $mrp, discount: $discount, gstRate: $gstRate, gstAmount: $gstAmount, color: $color, colorHex: $colorHex, size: $size, metal: $metal, plating: $plating)';
}


}

/// @nodoc
abstract mixin class $OrderItemModelCopyWith<$Res>  {
  factory $OrderItemModelCopyWith(OrderItemModel value, $Res Function(OrderItemModel) _then) = _$OrderItemModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: idFromJson) String product,@JsonKey(fromJson: nullableIdFromJson) String? variant,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String sku,@JsonKey(fromJson: nullableStringFromJson) String? unitValue,@JsonKey(fromJson: stringFromJson) String thumbnail,@JsonKey(fromJson: intFromJson) int quantity,@JsonKey(fromJson: doubleFromJson) double price,@JsonKey(fromJson: nullableDoubleFromJson) double? mrp,@JsonKey(fromJson: doubleFromJson) double discount,@JsonKey(fromJson: nullableDoubleFromJson) double? gstRate,@JsonKey(fromJson: nullableDoubleFromJson) double? gstAmount,@JsonKey(fromJson: nullableStringFromJson) String? color,@JsonKey(fromJson: nullableStringFromJson) String? colorHex,@JsonKey(fromJson: nullableStringFromJson) String? size,@JsonKey(fromJson: nullableStringFromJson) String? metal,@JsonKey(fromJson: nullableStringFromJson) String? plating
});




}
/// @nodoc
class _$OrderItemModelCopyWithImpl<$Res>
    implements $OrderItemModelCopyWith<$Res> {
  _$OrderItemModelCopyWithImpl(this._self, this._then);

  final OrderItemModel _self;
  final $Res Function(OrderItemModel) _then;

/// Create a copy of OrderItemModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? product = null,Object? variant = freezed,Object? title = null,Object? sku = null,Object? unitValue = freezed,Object? thumbnail = null,Object? quantity = null,Object? price = null,Object? mrp = freezed,Object? discount = null,Object? gstRate = freezed,Object? gstAmount = freezed,Object? color = freezed,Object? colorHex = freezed,Object? size = freezed,Object? metal = freezed,Object? plating = freezed,}) {
  return _then(_self.copyWith(
product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as String,variant: freezed == variant ? _self.variant : variant // ignore: cast_nullable_to_non_nullable
as String?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,unitValue: freezed == unitValue ? _self.unitValue : unitValue // ignore: cast_nullable_to_non_nullable
as String?,thumbnail: null == thumbnail ? _self.thumbnail : thumbnail // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,mrp: freezed == mrp ? _self.mrp : mrp // ignore: cast_nullable_to_non_nullable
as double?,discount: null == discount ? _self.discount : discount // ignore: cast_nullable_to_non_nullable
as double,gstRate: freezed == gstRate ? _self.gstRate : gstRate // ignore: cast_nullable_to_non_nullable
as double?,gstAmount: freezed == gstAmount ? _self.gstAmount : gstAmount // ignore: cast_nullable_to_non_nullable
as double?,color: freezed == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String?,colorHex: freezed == colorHex ? _self.colorHex : colorHex // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as String?,metal: freezed == metal ? _self.metal : metal // ignore: cast_nullable_to_non_nullable
as String?,plating: freezed == plating ? _self.plating : plating // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [OrderItemModel].
extension OrderItemModelPatterns on OrderItemModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderItemModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderItemModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderItemModel value)  $default,){
final _that = this;
switch (_that) {
case _OrderItemModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderItemModel value)?  $default,){
final _that = this;
switch (_that) {
case _OrderItemModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: idFromJson)  String product, @JsonKey(fromJson: nullableIdFromJson)  String? variant, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String sku, @JsonKey(fromJson: nullableStringFromJson)  String? unitValue, @JsonKey(fromJson: stringFromJson)  String thumbnail, @JsonKey(fromJson: intFromJson)  int quantity, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: nullableDoubleFromJson)  double? mrp, @JsonKey(fromJson: doubleFromJson)  double discount, @JsonKey(fromJson: nullableDoubleFromJson)  double? gstRate, @JsonKey(fromJson: nullableDoubleFromJson)  double? gstAmount, @JsonKey(fromJson: nullableStringFromJson)  String? color, @JsonKey(fromJson: nullableStringFromJson)  String? colorHex, @JsonKey(fromJson: nullableStringFromJson)  String? size, @JsonKey(fromJson: nullableStringFromJson)  String? metal, @JsonKey(fromJson: nullableStringFromJson)  String? plating)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderItemModel() when $default != null:
return $default(_that.product,_that.variant,_that.title,_that.sku,_that.unitValue,_that.thumbnail,_that.quantity,_that.price,_that.mrp,_that.discount,_that.gstRate,_that.gstAmount,_that.color,_that.colorHex,_that.size,_that.metal,_that.plating);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: idFromJson)  String product, @JsonKey(fromJson: nullableIdFromJson)  String? variant, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String sku, @JsonKey(fromJson: nullableStringFromJson)  String? unitValue, @JsonKey(fromJson: stringFromJson)  String thumbnail, @JsonKey(fromJson: intFromJson)  int quantity, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: nullableDoubleFromJson)  double? mrp, @JsonKey(fromJson: doubleFromJson)  double discount, @JsonKey(fromJson: nullableDoubleFromJson)  double? gstRate, @JsonKey(fromJson: nullableDoubleFromJson)  double? gstAmount, @JsonKey(fromJson: nullableStringFromJson)  String? color, @JsonKey(fromJson: nullableStringFromJson)  String? colorHex, @JsonKey(fromJson: nullableStringFromJson)  String? size, @JsonKey(fromJson: nullableStringFromJson)  String? metal, @JsonKey(fromJson: nullableStringFromJson)  String? plating)  $default,) {final _that = this;
switch (_that) {
case _OrderItemModel():
return $default(_that.product,_that.variant,_that.title,_that.sku,_that.unitValue,_that.thumbnail,_that.quantity,_that.price,_that.mrp,_that.discount,_that.gstRate,_that.gstAmount,_that.color,_that.colorHex,_that.size,_that.metal,_that.plating);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: idFromJson)  String product, @JsonKey(fromJson: nullableIdFromJson)  String? variant, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String sku, @JsonKey(fromJson: nullableStringFromJson)  String? unitValue, @JsonKey(fromJson: stringFromJson)  String thumbnail, @JsonKey(fromJson: intFromJson)  int quantity, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: nullableDoubleFromJson)  double? mrp, @JsonKey(fromJson: doubleFromJson)  double discount, @JsonKey(fromJson: nullableDoubleFromJson)  double? gstRate, @JsonKey(fromJson: nullableDoubleFromJson)  double? gstAmount, @JsonKey(fromJson: nullableStringFromJson)  String? color, @JsonKey(fromJson: nullableStringFromJson)  String? colorHex, @JsonKey(fromJson: nullableStringFromJson)  String? size, @JsonKey(fromJson: nullableStringFromJson)  String? metal, @JsonKey(fromJson: nullableStringFromJson)  String? plating)?  $default,) {final _that = this;
switch (_that) {
case _OrderItemModel() when $default != null:
return $default(_that.product,_that.variant,_that.title,_that.sku,_that.unitValue,_that.thumbnail,_that.quantity,_that.price,_that.mrp,_that.discount,_that.gstRate,_that.gstAmount,_that.color,_that.colorHex,_that.size,_that.metal,_that.plating);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderItemModel extends OrderItemModel {
  const _OrderItemModel({@JsonKey(fromJson: idFromJson) this.product = '', @JsonKey(fromJson: nullableIdFromJson) this.variant, @JsonKey(fromJson: stringFromJson) this.title = '', @JsonKey(fromJson: stringFromJson) this.sku = '', @JsonKey(fromJson: nullableStringFromJson) this.unitValue, @JsonKey(fromJson: stringFromJson) this.thumbnail = '', @JsonKey(fromJson: intFromJson) this.quantity = 1, @JsonKey(fromJson: doubleFromJson) this.price = 0, @JsonKey(fromJson: nullableDoubleFromJson) this.mrp, @JsonKey(fromJson: doubleFromJson) this.discount = 0, @JsonKey(fromJson: nullableDoubleFromJson) this.gstRate, @JsonKey(fromJson: nullableDoubleFromJson) this.gstAmount, @JsonKey(fromJson: nullableStringFromJson) this.color, @JsonKey(fromJson: nullableStringFromJson) this.colorHex, @JsonKey(fromJson: nullableStringFromJson) this.size, @JsonKey(fromJson: nullableStringFromJson) this.metal, @JsonKey(fromJson: nullableStringFromJson) this.plating}): super._();
  factory _OrderItemModel.fromJson(Map<String, dynamic> json) => _$OrderItemModelFromJson(json);

@override@JsonKey(fromJson: idFromJson) final  String product;
@override@JsonKey(fromJson: nullableIdFromJson) final  String? variant;
@override@JsonKey(fromJson: stringFromJson) final  String title;
@override@JsonKey(fromJson: stringFromJson) final  String sku;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? unitValue;
@override@JsonKey(fromJson: stringFromJson) final  String thumbnail;
@override@JsonKey(fromJson: intFromJson) final  int quantity;
@override@JsonKey(fromJson: doubleFromJson) final  double price;
@override@JsonKey(fromJson: nullableDoubleFromJson) final  double? mrp;
@override@JsonKey(fromJson: doubleFromJson) final  double discount;
@override@JsonKey(fromJson: nullableDoubleFromJson) final  double? gstRate;
@override@JsonKey(fromJson: nullableDoubleFromJson) final  double? gstAmount;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? color;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? colorHex;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? size;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? metal;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? plating;

/// Create a copy of OrderItemModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderItemModelCopyWith<_OrderItemModel> get copyWith => __$OrderItemModelCopyWithImpl<_OrderItemModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderItemModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderItemModel&&(identical(other.product, product) || other.product == product)&&(identical(other.variant, variant) || other.variant == variant)&&(identical(other.title, title) || other.title == title)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.unitValue, unitValue) || other.unitValue == unitValue)&&(identical(other.thumbnail, thumbnail) || other.thumbnail == thumbnail)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.price, price) || other.price == price)&&(identical(other.mrp, mrp) || other.mrp == mrp)&&(identical(other.discount, discount) || other.discount == discount)&&(identical(other.gstRate, gstRate) || other.gstRate == gstRate)&&(identical(other.gstAmount, gstAmount) || other.gstAmount == gstAmount)&&(identical(other.color, color) || other.color == color)&&(identical(other.colorHex, colorHex) || other.colorHex == colorHex)&&(identical(other.size, size) || other.size == size)&&(identical(other.metal, metal) || other.metal == metal)&&(identical(other.plating, plating) || other.plating == plating));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,product,variant,title,sku,unitValue,thumbnail,quantity,price,mrp,discount,gstRate,gstAmount,color,colorHex,size,metal,plating);

@override
String toString() {
  return 'OrderItemModel(product: $product, variant: $variant, title: $title, sku: $sku, unitValue: $unitValue, thumbnail: $thumbnail, quantity: $quantity, price: $price, mrp: $mrp, discount: $discount, gstRate: $gstRate, gstAmount: $gstAmount, color: $color, colorHex: $colorHex, size: $size, metal: $metal, plating: $plating)';
}


}

/// @nodoc
abstract mixin class _$OrderItemModelCopyWith<$Res> implements $OrderItemModelCopyWith<$Res> {
  factory _$OrderItemModelCopyWith(_OrderItemModel value, $Res Function(_OrderItemModel) _then) = __$OrderItemModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: idFromJson) String product,@JsonKey(fromJson: nullableIdFromJson) String? variant,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String sku,@JsonKey(fromJson: nullableStringFromJson) String? unitValue,@JsonKey(fromJson: stringFromJson) String thumbnail,@JsonKey(fromJson: intFromJson) int quantity,@JsonKey(fromJson: doubleFromJson) double price,@JsonKey(fromJson: nullableDoubleFromJson) double? mrp,@JsonKey(fromJson: doubleFromJson) double discount,@JsonKey(fromJson: nullableDoubleFromJson) double? gstRate,@JsonKey(fromJson: nullableDoubleFromJson) double? gstAmount,@JsonKey(fromJson: nullableStringFromJson) String? color,@JsonKey(fromJson: nullableStringFromJson) String? colorHex,@JsonKey(fromJson: nullableStringFromJson) String? size,@JsonKey(fromJson: nullableStringFromJson) String? metal,@JsonKey(fromJson: nullableStringFromJson) String? plating
});




}
/// @nodoc
class __$OrderItemModelCopyWithImpl<$Res>
    implements _$OrderItemModelCopyWith<$Res> {
  __$OrderItemModelCopyWithImpl(this._self, this._then);

  final _OrderItemModel _self;
  final $Res Function(_OrderItemModel) _then;

/// Create a copy of OrderItemModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? product = null,Object? variant = freezed,Object? title = null,Object? sku = null,Object? unitValue = freezed,Object? thumbnail = null,Object? quantity = null,Object? price = null,Object? mrp = freezed,Object? discount = null,Object? gstRate = freezed,Object? gstAmount = freezed,Object? color = freezed,Object? colorHex = freezed,Object? size = freezed,Object? metal = freezed,Object? plating = freezed,}) {
  return _then(_OrderItemModel(
product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as String,variant: freezed == variant ? _self.variant : variant // ignore: cast_nullable_to_non_nullable
as String?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,unitValue: freezed == unitValue ? _self.unitValue : unitValue // ignore: cast_nullable_to_non_nullable
as String?,thumbnail: null == thumbnail ? _self.thumbnail : thumbnail // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,mrp: freezed == mrp ? _self.mrp : mrp // ignore: cast_nullable_to_non_nullable
as double?,discount: null == discount ? _self.discount : discount // ignore: cast_nullable_to_non_nullable
as double,gstRate: freezed == gstRate ? _self.gstRate : gstRate // ignore: cast_nullable_to_non_nullable
as double?,gstAmount: freezed == gstAmount ? _self.gstAmount : gstAmount // ignore: cast_nullable_to_non_nullable
as double?,color: freezed == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String?,colorHex: freezed == colorHex ? _self.colorHex : colorHex // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as String?,metal: freezed == metal ? _self.metal : metal // ignore: cast_nullable_to_non_nullable
as String?,plating: freezed == plating ? _self.plating : plating // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$ShippingAddressModel {

@JsonKey(fromJson: stringFromJson) String get fullName;@JsonKey(fromJson: nullableStringFromJson) String? get email;@JsonKey(fromJson: stringFromJson) String get addressLine1;@JsonKey(fromJson: stringFromJson) String get addressLine2;@JsonKey(fromJson: stringFromJson) String get city;@JsonKey(fromJson: stringFromJson) String get state;@JsonKey(fromJson: stringFromJson) String get country;@JsonKey(fromJson: stringFromJson) String get pincode;@JsonKey(fromJson: stringFromJson) String get mobile;
/// Create a copy of ShippingAddressModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ShippingAddressModelCopyWith<ShippingAddressModel> get copyWith => _$ShippingAddressModelCopyWithImpl<ShippingAddressModel>(this as ShippingAddressModel, _$identity);

  /// Serializes this ShippingAddressModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ShippingAddressModel&&(identical(other.fullName, fullName) || other.fullName == fullName)&&(identical(other.email, email) || other.email == email)&&(identical(other.addressLine1, addressLine1) || other.addressLine1 == addressLine1)&&(identical(other.addressLine2, addressLine2) || other.addressLine2 == addressLine2)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.country, country) || other.country == country)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.mobile, mobile) || other.mobile == mobile));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,fullName,email,addressLine1,addressLine2,city,state,country,pincode,mobile);

@override
String toString() {
  return 'ShippingAddressModel(fullName: $fullName, email: $email, addressLine1: $addressLine1, addressLine2: $addressLine2, city: $city, state: $state, country: $country, pincode: $pincode, mobile: $mobile)';
}


}

/// @nodoc
abstract mixin class $ShippingAddressModelCopyWith<$Res>  {
  factory $ShippingAddressModelCopyWith(ShippingAddressModel value, $Res Function(ShippingAddressModel) _then) = _$ShippingAddressModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String fullName,@JsonKey(fromJson: nullableStringFromJson) String? email,@JsonKey(fromJson: stringFromJson) String addressLine1,@JsonKey(fromJson: stringFromJson) String addressLine2,@JsonKey(fromJson: stringFromJson) String city,@JsonKey(fromJson: stringFromJson) String state,@JsonKey(fromJson: stringFromJson) String country,@JsonKey(fromJson: stringFromJson) String pincode,@JsonKey(fromJson: stringFromJson) String mobile
});




}
/// @nodoc
class _$ShippingAddressModelCopyWithImpl<$Res>
    implements $ShippingAddressModelCopyWith<$Res> {
  _$ShippingAddressModelCopyWithImpl(this._self, this._then);

  final ShippingAddressModel _self;
  final $Res Function(ShippingAddressModel) _then;

/// Create a copy of ShippingAddressModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? fullName = null,Object? email = freezed,Object? addressLine1 = null,Object? addressLine2 = null,Object? city = null,Object? state = null,Object? country = null,Object? pincode = null,Object? mobile = null,}) {
  return _then(_self.copyWith(
fullName: null == fullName ? _self.fullName : fullName // ignore: cast_nullable_to_non_nullable
as String,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,addressLine1: null == addressLine1 ? _self.addressLine1 : addressLine1 // ignore: cast_nullable_to_non_nullable
as String,addressLine2: null == addressLine2 ? _self.addressLine2 : addressLine2 // ignore: cast_nullable_to_non_nullable
as String,city: null == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String,state: null == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String,country: null == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String,pincode: null == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String,mobile: null == mobile ? _self.mobile : mobile // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [ShippingAddressModel].
extension ShippingAddressModelPatterns on ShippingAddressModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ShippingAddressModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ShippingAddressModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ShippingAddressModel value)  $default,){
final _that = this;
switch (_that) {
case _ShippingAddressModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ShippingAddressModel value)?  $default,){
final _that = this;
switch (_that) {
case _ShippingAddressModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String fullName, @JsonKey(fromJson: nullableStringFromJson)  String? email, @JsonKey(fromJson: stringFromJson)  String addressLine1, @JsonKey(fromJson: stringFromJson)  String addressLine2, @JsonKey(fromJson: stringFromJson)  String city, @JsonKey(fromJson: stringFromJson)  String state, @JsonKey(fromJson: stringFromJson)  String country, @JsonKey(fromJson: stringFromJson)  String pincode, @JsonKey(fromJson: stringFromJson)  String mobile)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ShippingAddressModel() when $default != null:
return $default(_that.fullName,_that.email,_that.addressLine1,_that.addressLine2,_that.city,_that.state,_that.country,_that.pincode,_that.mobile);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String fullName, @JsonKey(fromJson: nullableStringFromJson)  String? email, @JsonKey(fromJson: stringFromJson)  String addressLine1, @JsonKey(fromJson: stringFromJson)  String addressLine2, @JsonKey(fromJson: stringFromJson)  String city, @JsonKey(fromJson: stringFromJson)  String state, @JsonKey(fromJson: stringFromJson)  String country, @JsonKey(fromJson: stringFromJson)  String pincode, @JsonKey(fromJson: stringFromJson)  String mobile)  $default,) {final _that = this;
switch (_that) {
case _ShippingAddressModel():
return $default(_that.fullName,_that.email,_that.addressLine1,_that.addressLine2,_that.city,_that.state,_that.country,_that.pincode,_that.mobile);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: stringFromJson)  String fullName, @JsonKey(fromJson: nullableStringFromJson)  String? email, @JsonKey(fromJson: stringFromJson)  String addressLine1, @JsonKey(fromJson: stringFromJson)  String addressLine2, @JsonKey(fromJson: stringFromJson)  String city, @JsonKey(fromJson: stringFromJson)  String state, @JsonKey(fromJson: stringFromJson)  String country, @JsonKey(fromJson: stringFromJson)  String pincode, @JsonKey(fromJson: stringFromJson)  String mobile)?  $default,) {final _that = this;
switch (_that) {
case _ShippingAddressModel() when $default != null:
return $default(_that.fullName,_that.email,_that.addressLine1,_that.addressLine2,_that.city,_that.state,_that.country,_that.pincode,_that.mobile);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ShippingAddressModel extends ShippingAddressModel {
  const _ShippingAddressModel({@JsonKey(fromJson: stringFromJson) this.fullName = '', @JsonKey(fromJson: nullableStringFromJson) this.email, @JsonKey(fromJson: stringFromJson) this.addressLine1 = '', @JsonKey(fromJson: stringFromJson) this.addressLine2 = '', @JsonKey(fromJson: stringFromJson) this.city = '', @JsonKey(fromJson: stringFromJson) this.state = '', @JsonKey(fromJson: stringFromJson) this.country = 'India', @JsonKey(fromJson: stringFromJson) this.pincode = '', @JsonKey(fromJson: stringFromJson) this.mobile = ''}): super._();
  factory _ShippingAddressModel.fromJson(Map<String, dynamic> json) => _$ShippingAddressModelFromJson(json);

@override@JsonKey(fromJson: stringFromJson) final  String fullName;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? email;
@override@JsonKey(fromJson: stringFromJson) final  String addressLine1;
@override@JsonKey(fromJson: stringFromJson) final  String addressLine2;
@override@JsonKey(fromJson: stringFromJson) final  String city;
@override@JsonKey(fromJson: stringFromJson) final  String state;
@override@JsonKey(fromJson: stringFromJson) final  String country;
@override@JsonKey(fromJson: stringFromJson) final  String pincode;
@override@JsonKey(fromJson: stringFromJson) final  String mobile;

/// Create a copy of ShippingAddressModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ShippingAddressModelCopyWith<_ShippingAddressModel> get copyWith => __$ShippingAddressModelCopyWithImpl<_ShippingAddressModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ShippingAddressModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ShippingAddressModel&&(identical(other.fullName, fullName) || other.fullName == fullName)&&(identical(other.email, email) || other.email == email)&&(identical(other.addressLine1, addressLine1) || other.addressLine1 == addressLine1)&&(identical(other.addressLine2, addressLine2) || other.addressLine2 == addressLine2)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.country, country) || other.country == country)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.mobile, mobile) || other.mobile == mobile));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,fullName,email,addressLine1,addressLine2,city,state,country,pincode,mobile);

@override
String toString() {
  return 'ShippingAddressModel(fullName: $fullName, email: $email, addressLine1: $addressLine1, addressLine2: $addressLine2, city: $city, state: $state, country: $country, pincode: $pincode, mobile: $mobile)';
}


}

/// @nodoc
abstract mixin class _$ShippingAddressModelCopyWith<$Res> implements $ShippingAddressModelCopyWith<$Res> {
  factory _$ShippingAddressModelCopyWith(_ShippingAddressModel value, $Res Function(_ShippingAddressModel) _then) = __$ShippingAddressModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String fullName,@JsonKey(fromJson: nullableStringFromJson) String? email,@JsonKey(fromJson: stringFromJson) String addressLine1,@JsonKey(fromJson: stringFromJson) String addressLine2,@JsonKey(fromJson: stringFromJson) String city,@JsonKey(fromJson: stringFromJson) String state,@JsonKey(fromJson: stringFromJson) String country,@JsonKey(fromJson: stringFromJson) String pincode,@JsonKey(fromJson: stringFromJson) String mobile
});




}
/// @nodoc
class __$ShippingAddressModelCopyWithImpl<$Res>
    implements _$ShippingAddressModelCopyWith<$Res> {
  __$ShippingAddressModelCopyWithImpl(this._self, this._then);

  final _ShippingAddressModel _self;
  final $Res Function(_ShippingAddressModel) _then;

/// Create a copy of ShippingAddressModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? fullName = null,Object? email = freezed,Object? addressLine1 = null,Object? addressLine2 = null,Object? city = null,Object? state = null,Object? country = null,Object? pincode = null,Object? mobile = null,}) {
  return _then(_ShippingAddressModel(
fullName: null == fullName ? _self.fullName : fullName // ignore: cast_nullable_to_non_nullable
as String,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,addressLine1: null == addressLine1 ? _self.addressLine1 : addressLine1 // ignore: cast_nullable_to_non_nullable
as String,addressLine2: null == addressLine2 ? _self.addressLine2 : addressLine2 // ignore: cast_nullable_to_non_nullable
as String,city: null == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String,state: null == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String,country: null == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String,pincode: null == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String,mobile: null == mobile ? _self.mobile : mobile // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$StatusHistoryModel {

@JsonKey(fromJson: stringFromJson) String get status; DateTime? get changedAt;@JsonKey(fromJson: nullableStringFromJson) String? get note;
/// Create a copy of StatusHistoryModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$StatusHistoryModelCopyWith<StatusHistoryModel> get copyWith => _$StatusHistoryModelCopyWithImpl<StatusHistoryModel>(this as StatusHistoryModel, _$identity);

  /// Serializes this StatusHistoryModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is StatusHistoryModel&&(identical(other.status, status) || other.status == status)&&(identical(other.changedAt, changedAt) || other.changedAt == changedAt)&&(identical(other.note, note) || other.note == note));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,status,changedAt,note);

@override
String toString() {
  return 'StatusHistoryModel(status: $status, changedAt: $changedAt, note: $note)';
}


}

/// @nodoc
abstract mixin class $StatusHistoryModelCopyWith<$Res>  {
  factory $StatusHistoryModelCopyWith(StatusHistoryModel value, $Res Function(StatusHistoryModel) _then) = _$StatusHistoryModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String status, DateTime? changedAt,@JsonKey(fromJson: nullableStringFromJson) String? note
});




}
/// @nodoc
class _$StatusHistoryModelCopyWithImpl<$Res>
    implements $StatusHistoryModelCopyWith<$Res> {
  _$StatusHistoryModelCopyWithImpl(this._self, this._then);

  final StatusHistoryModel _self;
  final $Res Function(StatusHistoryModel) _then;

/// Create a copy of StatusHistoryModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? status = null,Object? changedAt = freezed,Object? note = freezed,}) {
  return _then(_self.copyWith(
status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,changedAt: freezed == changedAt ? _self.changedAt : changedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,note: freezed == note ? _self.note : note // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [StatusHistoryModel].
extension StatusHistoryModelPatterns on StatusHistoryModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _StatusHistoryModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _StatusHistoryModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _StatusHistoryModel value)  $default,){
final _that = this;
switch (_that) {
case _StatusHistoryModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _StatusHistoryModel value)?  $default,){
final _that = this;
switch (_that) {
case _StatusHistoryModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String status,  DateTime? changedAt, @JsonKey(fromJson: nullableStringFromJson)  String? note)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _StatusHistoryModel() when $default != null:
return $default(_that.status,_that.changedAt,_that.note);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String status,  DateTime? changedAt, @JsonKey(fromJson: nullableStringFromJson)  String? note)  $default,) {final _that = this;
switch (_that) {
case _StatusHistoryModel():
return $default(_that.status,_that.changedAt,_that.note);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: stringFromJson)  String status,  DateTime? changedAt, @JsonKey(fromJson: nullableStringFromJson)  String? note)?  $default,) {final _that = this;
switch (_that) {
case _StatusHistoryModel() when $default != null:
return $default(_that.status,_that.changedAt,_that.note);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _StatusHistoryModel implements StatusHistoryModel {
  const _StatusHistoryModel({@JsonKey(fromJson: stringFromJson) this.status = '', this.changedAt, @JsonKey(fromJson: nullableStringFromJson) this.note});
  factory _StatusHistoryModel.fromJson(Map<String, dynamic> json) => _$StatusHistoryModelFromJson(json);

@override@JsonKey(fromJson: stringFromJson) final  String status;
@override final  DateTime? changedAt;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? note;

/// Create a copy of StatusHistoryModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$StatusHistoryModelCopyWith<_StatusHistoryModel> get copyWith => __$StatusHistoryModelCopyWithImpl<_StatusHistoryModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$StatusHistoryModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _StatusHistoryModel&&(identical(other.status, status) || other.status == status)&&(identical(other.changedAt, changedAt) || other.changedAt == changedAt)&&(identical(other.note, note) || other.note == note));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,status,changedAt,note);

@override
String toString() {
  return 'StatusHistoryModel(status: $status, changedAt: $changedAt, note: $note)';
}


}

/// @nodoc
abstract mixin class _$StatusHistoryModelCopyWith<$Res> implements $StatusHistoryModelCopyWith<$Res> {
  factory _$StatusHistoryModelCopyWith(_StatusHistoryModel value, $Res Function(_StatusHistoryModel) _then) = __$StatusHistoryModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String status, DateTime? changedAt,@JsonKey(fromJson: nullableStringFromJson) String? note
});




}
/// @nodoc
class __$StatusHistoryModelCopyWithImpl<$Res>
    implements _$StatusHistoryModelCopyWith<$Res> {
  __$StatusHistoryModelCopyWithImpl(this._self, this._then);

  final _StatusHistoryModel _self;
  final $Res Function(_StatusHistoryModel) _then;

/// Create a copy of StatusHistoryModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? status = null,Object? changedAt = freezed,Object? note = freezed,}) {
  return _then(_StatusHistoryModel(
status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,changedAt: freezed == changedAt ? _self.changedAt : changedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,note: freezed == note ? _self.note : note // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$CourierModel {

@JsonKey(fromJson: nullableStringFromJson) String? get partner;@JsonKey(fromJson: nullableStringFromJson) String? get courierId;@JsonKey(fromJson: nullableStringFromJson) String? get courierName;
/// Create a copy of CourierModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CourierModelCopyWith<CourierModel> get copyWith => _$CourierModelCopyWithImpl<CourierModel>(this as CourierModel, _$identity);

  /// Serializes this CourierModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CourierModel&&(identical(other.partner, partner) || other.partner == partner)&&(identical(other.courierId, courierId) || other.courierId == courierId)&&(identical(other.courierName, courierName) || other.courierName == courierName));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,partner,courierId,courierName);

@override
String toString() {
  return 'CourierModel(partner: $partner, courierId: $courierId, courierName: $courierName)';
}


}

/// @nodoc
abstract mixin class $CourierModelCopyWith<$Res>  {
  factory $CourierModelCopyWith(CourierModel value, $Res Function(CourierModel) _then) = _$CourierModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? partner,@JsonKey(fromJson: nullableStringFromJson) String? courierId,@JsonKey(fromJson: nullableStringFromJson) String? courierName
});




}
/// @nodoc
class _$CourierModelCopyWithImpl<$Res>
    implements $CourierModelCopyWith<$Res> {
  _$CourierModelCopyWithImpl(this._self, this._then);

  final CourierModel _self;
  final $Res Function(CourierModel) _then;

/// Create a copy of CourierModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? partner = freezed,Object? courierId = freezed,Object? courierName = freezed,}) {
  return _then(_self.copyWith(
partner: freezed == partner ? _self.partner : partner // ignore: cast_nullable_to_non_nullable
as String?,courierId: freezed == courierId ? _self.courierId : courierId // ignore: cast_nullable_to_non_nullable
as String?,courierName: freezed == courierName ? _self.courierName : courierName // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [CourierModel].
extension CourierModelPatterns on CourierModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CourierModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CourierModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CourierModel value)  $default,){
final _that = this;
switch (_that) {
case _CourierModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CourierModel value)?  $default,){
final _that = this;
switch (_that) {
case _CourierModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? partner, @JsonKey(fromJson: nullableStringFromJson)  String? courierId, @JsonKey(fromJson: nullableStringFromJson)  String? courierName)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CourierModel() when $default != null:
return $default(_that.partner,_that.courierId,_that.courierName);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? partner, @JsonKey(fromJson: nullableStringFromJson)  String? courierId, @JsonKey(fromJson: nullableStringFromJson)  String? courierName)  $default,) {final _that = this;
switch (_that) {
case _CourierModel():
return $default(_that.partner,_that.courierId,_that.courierName);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: nullableStringFromJson)  String? partner, @JsonKey(fromJson: nullableStringFromJson)  String? courierId, @JsonKey(fromJson: nullableStringFromJson)  String? courierName)?  $default,) {final _that = this;
switch (_that) {
case _CourierModel() when $default != null:
return $default(_that.partner,_that.courierId,_that.courierName);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CourierModel implements CourierModel {
  const _CourierModel({@JsonKey(fromJson: nullableStringFromJson) this.partner, @JsonKey(fromJson: nullableStringFromJson) this.courierId, @JsonKey(fromJson: nullableStringFromJson) this.courierName});
  factory _CourierModel.fromJson(Map<String, dynamic> json) => _$CourierModelFromJson(json);

@override@JsonKey(fromJson: nullableStringFromJson) final  String? partner;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? courierId;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? courierName;

/// Create a copy of CourierModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CourierModelCopyWith<_CourierModel> get copyWith => __$CourierModelCopyWithImpl<_CourierModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CourierModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CourierModel&&(identical(other.partner, partner) || other.partner == partner)&&(identical(other.courierId, courierId) || other.courierId == courierId)&&(identical(other.courierName, courierName) || other.courierName == courierName));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,partner,courierId,courierName);

@override
String toString() {
  return 'CourierModel(partner: $partner, courierId: $courierId, courierName: $courierName)';
}


}

/// @nodoc
abstract mixin class _$CourierModelCopyWith<$Res> implements $CourierModelCopyWith<$Res> {
  factory _$CourierModelCopyWith(_CourierModel value, $Res Function(_CourierModel) _then) = __$CourierModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? partner,@JsonKey(fromJson: nullableStringFromJson) String? courierId,@JsonKey(fromJson: nullableStringFromJson) String? courierName
});




}
/// @nodoc
class __$CourierModelCopyWithImpl<$Res>
    implements _$CourierModelCopyWith<$Res> {
  __$CourierModelCopyWithImpl(this._self, this._then);

  final _CourierModel _self;
  final $Res Function(_CourierModel) _then;

/// Create a copy of CourierModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? partner = freezed,Object? courierId = freezed,Object? courierName = freezed,}) {
  return _then(_CourierModel(
partner: freezed == partner ? _self.partner : partner // ignore: cast_nullable_to_non_nullable
as String?,courierId: freezed == courierId ? _self.courierId : courierId // ignore: cast_nullable_to_non_nullable
as String?,courierName: freezed == courierName ? _self.courierName : courierName // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$TrackingModel {

@JsonKey(fromJson: nullableStringFromJson) String? get number;@JsonKey(fromJson: nullableStringFromJson) String? get url; DateTime? get estimatedDeliveryDate;@JsonKey(fromJson: stringFromJson) String get shipmentStatus;@JsonKey(fromJson: intFromJson) int get deliveryAttempts;@JsonKey(fromJson: nullableStringFromJson) String? get lastAttemptNote;
/// Create a copy of TrackingModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TrackingModelCopyWith<TrackingModel> get copyWith => _$TrackingModelCopyWithImpl<TrackingModel>(this as TrackingModel, _$identity);

  /// Serializes this TrackingModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TrackingModel&&(identical(other.number, number) || other.number == number)&&(identical(other.url, url) || other.url == url)&&(identical(other.estimatedDeliveryDate, estimatedDeliveryDate) || other.estimatedDeliveryDate == estimatedDeliveryDate)&&(identical(other.shipmentStatus, shipmentStatus) || other.shipmentStatus == shipmentStatus)&&(identical(other.deliveryAttempts, deliveryAttempts) || other.deliveryAttempts == deliveryAttempts)&&(identical(other.lastAttemptNote, lastAttemptNote) || other.lastAttemptNote == lastAttemptNote));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,number,url,estimatedDeliveryDate,shipmentStatus,deliveryAttempts,lastAttemptNote);

@override
String toString() {
  return 'TrackingModel(number: $number, url: $url, estimatedDeliveryDate: $estimatedDeliveryDate, shipmentStatus: $shipmentStatus, deliveryAttempts: $deliveryAttempts, lastAttemptNote: $lastAttemptNote)';
}


}

/// @nodoc
abstract mixin class $TrackingModelCopyWith<$Res>  {
  factory $TrackingModelCopyWith(TrackingModel value, $Res Function(TrackingModel) _then) = _$TrackingModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? number,@JsonKey(fromJson: nullableStringFromJson) String? url, DateTime? estimatedDeliveryDate,@JsonKey(fromJson: stringFromJson) String shipmentStatus,@JsonKey(fromJson: intFromJson) int deliveryAttempts,@JsonKey(fromJson: nullableStringFromJson) String? lastAttemptNote
});




}
/// @nodoc
class _$TrackingModelCopyWithImpl<$Res>
    implements $TrackingModelCopyWith<$Res> {
  _$TrackingModelCopyWithImpl(this._self, this._then);

  final TrackingModel _self;
  final $Res Function(TrackingModel) _then;

/// Create a copy of TrackingModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? number = freezed,Object? url = freezed,Object? estimatedDeliveryDate = freezed,Object? shipmentStatus = null,Object? deliveryAttempts = null,Object? lastAttemptNote = freezed,}) {
  return _then(_self.copyWith(
number: freezed == number ? _self.number : number // ignore: cast_nullable_to_non_nullable
as String?,url: freezed == url ? _self.url : url // ignore: cast_nullable_to_non_nullable
as String?,estimatedDeliveryDate: freezed == estimatedDeliveryDate ? _self.estimatedDeliveryDate : estimatedDeliveryDate // ignore: cast_nullable_to_non_nullable
as DateTime?,shipmentStatus: null == shipmentStatus ? _self.shipmentStatus : shipmentStatus // ignore: cast_nullable_to_non_nullable
as String,deliveryAttempts: null == deliveryAttempts ? _self.deliveryAttempts : deliveryAttempts // ignore: cast_nullable_to_non_nullable
as int,lastAttemptNote: freezed == lastAttemptNote ? _self.lastAttemptNote : lastAttemptNote // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [TrackingModel].
extension TrackingModelPatterns on TrackingModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TrackingModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TrackingModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TrackingModel value)  $default,){
final _that = this;
switch (_that) {
case _TrackingModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TrackingModel value)?  $default,){
final _that = this;
switch (_that) {
case _TrackingModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? number, @JsonKey(fromJson: nullableStringFromJson)  String? url,  DateTime? estimatedDeliveryDate, @JsonKey(fromJson: stringFromJson)  String shipmentStatus, @JsonKey(fromJson: intFromJson)  int deliveryAttempts, @JsonKey(fromJson: nullableStringFromJson)  String? lastAttemptNote)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TrackingModel() when $default != null:
return $default(_that.number,_that.url,_that.estimatedDeliveryDate,_that.shipmentStatus,_that.deliveryAttempts,_that.lastAttemptNote);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? number, @JsonKey(fromJson: nullableStringFromJson)  String? url,  DateTime? estimatedDeliveryDate, @JsonKey(fromJson: stringFromJson)  String shipmentStatus, @JsonKey(fromJson: intFromJson)  int deliveryAttempts, @JsonKey(fromJson: nullableStringFromJson)  String? lastAttemptNote)  $default,) {final _that = this;
switch (_that) {
case _TrackingModel():
return $default(_that.number,_that.url,_that.estimatedDeliveryDate,_that.shipmentStatus,_that.deliveryAttempts,_that.lastAttemptNote);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: nullableStringFromJson)  String? number, @JsonKey(fromJson: nullableStringFromJson)  String? url,  DateTime? estimatedDeliveryDate, @JsonKey(fromJson: stringFromJson)  String shipmentStatus, @JsonKey(fromJson: intFromJson)  int deliveryAttempts, @JsonKey(fromJson: nullableStringFromJson)  String? lastAttemptNote)?  $default,) {final _that = this;
switch (_that) {
case _TrackingModel() when $default != null:
return $default(_that.number,_that.url,_that.estimatedDeliveryDate,_that.shipmentStatus,_that.deliveryAttempts,_that.lastAttemptNote);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TrackingModel implements TrackingModel {
  const _TrackingModel({@JsonKey(fromJson: nullableStringFromJson) this.number, @JsonKey(fromJson: nullableStringFromJson) this.url, this.estimatedDeliveryDate, @JsonKey(fromJson: stringFromJson) this.shipmentStatus = 'Not Shipped', @JsonKey(fromJson: intFromJson) this.deliveryAttempts = 0, @JsonKey(fromJson: nullableStringFromJson) this.lastAttemptNote});
  factory _TrackingModel.fromJson(Map<String, dynamic> json) => _$TrackingModelFromJson(json);

@override@JsonKey(fromJson: nullableStringFromJson) final  String? number;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? url;
@override final  DateTime? estimatedDeliveryDate;
@override@JsonKey(fromJson: stringFromJson) final  String shipmentStatus;
@override@JsonKey(fromJson: intFromJson) final  int deliveryAttempts;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? lastAttemptNote;

/// Create a copy of TrackingModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TrackingModelCopyWith<_TrackingModel> get copyWith => __$TrackingModelCopyWithImpl<_TrackingModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TrackingModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TrackingModel&&(identical(other.number, number) || other.number == number)&&(identical(other.url, url) || other.url == url)&&(identical(other.estimatedDeliveryDate, estimatedDeliveryDate) || other.estimatedDeliveryDate == estimatedDeliveryDate)&&(identical(other.shipmentStatus, shipmentStatus) || other.shipmentStatus == shipmentStatus)&&(identical(other.deliveryAttempts, deliveryAttempts) || other.deliveryAttempts == deliveryAttempts)&&(identical(other.lastAttemptNote, lastAttemptNote) || other.lastAttemptNote == lastAttemptNote));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,number,url,estimatedDeliveryDate,shipmentStatus,deliveryAttempts,lastAttemptNote);

@override
String toString() {
  return 'TrackingModel(number: $number, url: $url, estimatedDeliveryDate: $estimatedDeliveryDate, shipmentStatus: $shipmentStatus, deliveryAttempts: $deliveryAttempts, lastAttemptNote: $lastAttemptNote)';
}


}

/// @nodoc
abstract mixin class _$TrackingModelCopyWith<$Res> implements $TrackingModelCopyWith<$Res> {
  factory _$TrackingModelCopyWith(_TrackingModel value, $Res Function(_TrackingModel) _then) = __$TrackingModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? number,@JsonKey(fromJson: nullableStringFromJson) String? url, DateTime? estimatedDeliveryDate,@JsonKey(fromJson: stringFromJson) String shipmentStatus,@JsonKey(fromJson: intFromJson) int deliveryAttempts,@JsonKey(fromJson: nullableStringFromJson) String? lastAttemptNote
});




}
/// @nodoc
class __$TrackingModelCopyWithImpl<$Res>
    implements _$TrackingModelCopyWith<$Res> {
  __$TrackingModelCopyWithImpl(this._self, this._then);

  final _TrackingModel _self;
  final $Res Function(_TrackingModel) _then;

/// Create a copy of TrackingModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? number = freezed,Object? url = freezed,Object? estimatedDeliveryDate = freezed,Object? shipmentStatus = null,Object? deliveryAttempts = null,Object? lastAttemptNote = freezed,}) {
  return _then(_TrackingModel(
number: freezed == number ? _self.number : number // ignore: cast_nullable_to_non_nullable
as String?,url: freezed == url ? _self.url : url // ignore: cast_nullable_to_non_nullable
as String?,estimatedDeliveryDate: freezed == estimatedDeliveryDate ? _self.estimatedDeliveryDate : estimatedDeliveryDate // ignore: cast_nullable_to_non_nullable
as DateTime?,shipmentStatus: null == shipmentStatus ? _self.shipmentStatus : shipmentStatus // ignore: cast_nullable_to_non_nullable
as String,deliveryAttempts: null == deliveryAttempts ? _self.deliveryAttempts : deliveryAttempts // ignore: cast_nullable_to_non_nullable
as int,lastAttemptNote: freezed == lastAttemptNote ? _self.lastAttemptNote : lastAttemptNote // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$CouponAppliedModel {

@JsonKey(fromJson: nullableStringFromJson) String? get code;@JsonKey(fromJson: doubleFromJson) double get discountAmount;
/// Create a copy of CouponAppliedModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CouponAppliedModelCopyWith<CouponAppliedModel> get copyWith => _$CouponAppliedModelCopyWithImpl<CouponAppliedModel>(this as CouponAppliedModel, _$identity);

  /// Serializes this CouponAppliedModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CouponAppliedModel&&(identical(other.code, code) || other.code == code)&&(identical(other.discountAmount, discountAmount) || other.discountAmount == discountAmount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,code,discountAmount);

@override
String toString() {
  return 'CouponAppliedModel(code: $code, discountAmount: $discountAmount)';
}


}

/// @nodoc
abstract mixin class $CouponAppliedModelCopyWith<$Res>  {
  factory $CouponAppliedModelCopyWith(CouponAppliedModel value, $Res Function(CouponAppliedModel) _then) = _$CouponAppliedModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? code,@JsonKey(fromJson: doubleFromJson) double discountAmount
});




}
/// @nodoc
class _$CouponAppliedModelCopyWithImpl<$Res>
    implements $CouponAppliedModelCopyWith<$Res> {
  _$CouponAppliedModelCopyWithImpl(this._self, this._then);

  final CouponAppliedModel _self;
  final $Res Function(CouponAppliedModel) _then;

/// Create a copy of CouponAppliedModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? code = freezed,Object? discountAmount = null,}) {
  return _then(_self.copyWith(
code: freezed == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String?,discountAmount: null == discountAmount ? _self.discountAmount : discountAmount // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [CouponAppliedModel].
extension CouponAppliedModelPatterns on CouponAppliedModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CouponAppliedModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CouponAppliedModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CouponAppliedModel value)  $default,){
final _that = this;
switch (_that) {
case _CouponAppliedModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CouponAppliedModel value)?  $default,){
final _that = this;
switch (_that) {
case _CouponAppliedModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? code, @JsonKey(fromJson: doubleFromJson)  double discountAmount)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CouponAppliedModel() when $default != null:
return $default(_that.code,_that.discountAmount);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? code, @JsonKey(fromJson: doubleFromJson)  double discountAmount)  $default,) {final _that = this;
switch (_that) {
case _CouponAppliedModel():
return $default(_that.code,_that.discountAmount);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: nullableStringFromJson)  String? code, @JsonKey(fromJson: doubleFromJson)  double discountAmount)?  $default,) {final _that = this;
switch (_that) {
case _CouponAppliedModel() when $default != null:
return $default(_that.code,_that.discountAmount);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CouponAppliedModel implements CouponAppliedModel {
  const _CouponAppliedModel({@JsonKey(fromJson: nullableStringFromJson) this.code, @JsonKey(fromJson: doubleFromJson) this.discountAmount = 0});
  factory _CouponAppliedModel.fromJson(Map<String, dynamic> json) => _$CouponAppliedModelFromJson(json);

@override@JsonKey(fromJson: nullableStringFromJson) final  String? code;
@override@JsonKey(fromJson: doubleFromJson) final  double discountAmount;

/// Create a copy of CouponAppliedModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CouponAppliedModelCopyWith<_CouponAppliedModel> get copyWith => __$CouponAppliedModelCopyWithImpl<_CouponAppliedModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CouponAppliedModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CouponAppliedModel&&(identical(other.code, code) || other.code == code)&&(identical(other.discountAmount, discountAmount) || other.discountAmount == discountAmount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,code,discountAmount);

@override
String toString() {
  return 'CouponAppliedModel(code: $code, discountAmount: $discountAmount)';
}


}

/// @nodoc
abstract mixin class _$CouponAppliedModelCopyWith<$Res> implements $CouponAppliedModelCopyWith<$Res> {
  factory _$CouponAppliedModelCopyWith(_CouponAppliedModel value, $Res Function(_CouponAppliedModel) _then) = __$CouponAppliedModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? code,@JsonKey(fromJson: doubleFromJson) double discountAmount
});




}
/// @nodoc
class __$CouponAppliedModelCopyWithImpl<$Res>
    implements _$CouponAppliedModelCopyWith<$Res> {
  __$CouponAppliedModelCopyWithImpl(this._self, this._then);

  final _CouponAppliedModel _self;
  final $Res Function(_CouponAppliedModel) _then;

/// Create a copy of CouponAppliedModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? code = freezed,Object? discountAmount = null,}) {
  return _then(_CouponAppliedModel(
code: freezed == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String?,discountAmount: null == discountAmount ? _self.discountAmount : discountAmount // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}


/// @nodoc
mixin _$PaymentInfoModel {

@JsonKey(fromJson: nullableStringFromJson) String? get razorpayOrderId;@JsonKey(fromJson: nullableStringFromJson) String? get razorpayPaymentId; DateTime? get paidAt;
/// Create a copy of PaymentInfoModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PaymentInfoModelCopyWith<PaymentInfoModel> get copyWith => _$PaymentInfoModelCopyWithImpl<PaymentInfoModel>(this as PaymentInfoModel, _$identity);

  /// Serializes this PaymentInfoModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PaymentInfoModel&&(identical(other.razorpayOrderId, razorpayOrderId) || other.razorpayOrderId == razorpayOrderId)&&(identical(other.razorpayPaymentId, razorpayPaymentId) || other.razorpayPaymentId == razorpayPaymentId)&&(identical(other.paidAt, paidAt) || other.paidAt == paidAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,razorpayOrderId,razorpayPaymentId,paidAt);

@override
String toString() {
  return 'PaymentInfoModel(razorpayOrderId: $razorpayOrderId, razorpayPaymentId: $razorpayPaymentId, paidAt: $paidAt)';
}


}

/// @nodoc
abstract mixin class $PaymentInfoModelCopyWith<$Res>  {
  factory $PaymentInfoModelCopyWith(PaymentInfoModel value, $Res Function(PaymentInfoModel) _then) = _$PaymentInfoModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? razorpayOrderId,@JsonKey(fromJson: nullableStringFromJson) String? razorpayPaymentId, DateTime? paidAt
});




}
/// @nodoc
class _$PaymentInfoModelCopyWithImpl<$Res>
    implements $PaymentInfoModelCopyWith<$Res> {
  _$PaymentInfoModelCopyWithImpl(this._self, this._then);

  final PaymentInfoModel _self;
  final $Res Function(PaymentInfoModel) _then;

/// Create a copy of PaymentInfoModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? razorpayOrderId = freezed,Object? razorpayPaymentId = freezed,Object? paidAt = freezed,}) {
  return _then(_self.copyWith(
razorpayOrderId: freezed == razorpayOrderId ? _self.razorpayOrderId : razorpayOrderId // ignore: cast_nullable_to_non_nullable
as String?,razorpayPaymentId: freezed == razorpayPaymentId ? _self.razorpayPaymentId : razorpayPaymentId // ignore: cast_nullable_to_non_nullable
as String?,paidAt: freezed == paidAt ? _self.paidAt : paidAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [PaymentInfoModel].
extension PaymentInfoModelPatterns on PaymentInfoModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PaymentInfoModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PaymentInfoModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PaymentInfoModel value)  $default,){
final _that = this;
switch (_that) {
case _PaymentInfoModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PaymentInfoModel value)?  $default,){
final _that = this;
switch (_that) {
case _PaymentInfoModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? razorpayOrderId, @JsonKey(fromJson: nullableStringFromJson)  String? razorpayPaymentId,  DateTime? paidAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PaymentInfoModel() when $default != null:
return $default(_that.razorpayOrderId,_that.razorpayPaymentId,_that.paidAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? razorpayOrderId, @JsonKey(fromJson: nullableStringFromJson)  String? razorpayPaymentId,  DateTime? paidAt)  $default,) {final _that = this;
switch (_that) {
case _PaymentInfoModel():
return $default(_that.razorpayOrderId,_that.razorpayPaymentId,_that.paidAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: nullableStringFromJson)  String? razorpayOrderId, @JsonKey(fromJson: nullableStringFromJson)  String? razorpayPaymentId,  DateTime? paidAt)?  $default,) {final _that = this;
switch (_that) {
case _PaymentInfoModel() when $default != null:
return $default(_that.razorpayOrderId,_that.razorpayPaymentId,_that.paidAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PaymentInfoModel implements PaymentInfoModel {
  const _PaymentInfoModel({@JsonKey(fromJson: nullableStringFromJson) this.razorpayOrderId, @JsonKey(fromJson: nullableStringFromJson) this.razorpayPaymentId, this.paidAt});
  factory _PaymentInfoModel.fromJson(Map<String, dynamic> json) => _$PaymentInfoModelFromJson(json);

@override@JsonKey(fromJson: nullableStringFromJson) final  String? razorpayOrderId;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? razorpayPaymentId;
@override final  DateTime? paidAt;

/// Create a copy of PaymentInfoModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PaymentInfoModelCopyWith<_PaymentInfoModel> get copyWith => __$PaymentInfoModelCopyWithImpl<_PaymentInfoModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PaymentInfoModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PaymentInfoModel&&(identical(other.razorpayOrderId, razorpayOrderId) || other.razorpayOrderId == razorpayOrderId)&&(identical(other.razorpayPaymentId, razorpayPaymentId) || other.razorpayPaymentId == razorpayPaymentId)&&(identical(other.paidAt, paidAt) || other.paidAt == paidAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,razorpayOrderId,razorpayPaymentId,paidAt);

@override
String toString() {
  return 'PaymentInfoModel(razorpayOrderId: $razorpayOrderId, razorpayPaymentId: $razorpayPaymentId, paidAt: $paidAt)';
}


}

/// @nodoc
abstract mixin class _$PaymentInfoModelCopyWith<$Res> implements $PaymentInfoModelCopyWith<$Res> {
  factory _$PaymentInfoModelCopyWith(_PaymentInfoModel value, $Res Function(_PaymentInfoModel) _then) = __$PaymentInfoModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? razorpayOrderId,@JsonKey(fromJson: nullableStringFromJson) String? razorpayPaymentId, DateTime? paidAt
});




}
/// @nodoc
class __$PaymentInfoModelCopyWithImpl<$Res>
    implements _$PaymentInfoModelCopyWith<$Res> {
  __$PaymentInfoModelCopyWithImpl(this._self, this._then);

  final _PaymentInfoModel _self;
  final $Res Function(_PaymentInfoModel) _then;

/// Create a copy of PaymentInfoModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? razorpayOrderId = freezed,Object? razorpayPaymentId = freezed,Object? paidAt = freezed,}) {
  return _then(_PaymentInfoModel(
razorpayOrderId: freezed == razorpayOrderId ? _self.razorpayOrderId : razorpayOrderId // ignore: cast_nullable_to_non_nullable
as String?,razorpayPaymentId: freezed == razorpayPaymentId ? _self.razorpayPaymentId : razorpayPaymentId // ignore: cast_nullable_to_non_nullable
as String?,paidAt: freezed == paidAt ? _self.paidAt : paidAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}


/// @nodoc
mixin _$ReturnItemModel {

@JsonKey(fromJson: idFromJson) String get product;@JsonKey(fromJson: intFromJson) int get quantity;
/// Create a copy of ReturnItemModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReturnItemModelCopyWith<ReturnItemModel> get copyWith => _$ReturnItemModelCopyWithImpl<ReturnItemModel>(this as ReturnItemModel, _$identity);

  /// Serializes this ReturnItemModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReturnItemModel&&(identical(other.product, product) || other.product == product)&&(identical(other.quantity, quantity) || other.quantity == quantity));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,product,quantity);

@override
String toString() {
  return 'ReturnItemModel(product: $product, quantity: $quantity)';
}


}

/// @nodoc
abstract mixin class $ReturnItemModelCopyWith<$Res>  {
  factory $ReturnItemModelCopyWith(ReturnItemModel value, $Res Function(ReturnItemModel) _then) = _$ReturnItemModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: idFromJson) String product,@JsonKey(fromJson: intFromJson) int quantity
});




}
/// @nodoc
class _$ReturnItemModelCopyWithImpl<$Res>
    implements $ReturnItemModelCopyWith<$Res> {
  _$ReturnItemModelCopyWithImpl(this._self, this._then);

  final ReturnItemModel _self;
  final $Res Function(ReturnItemModel) _then;

/// Create a copy of ReturnItemModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? product = null,Object? quantity = null,}) {
  return _then(_self.copyWith(
product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [ReturnItemModel].
extension ReturnItemModelPatterns on ReturnItemModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReturnItemModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReturnItemModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReturnItemModel value)  $default,){
final _that = this;
switch (_that) {
case _ReturnItemModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReturnItemModel value)?  $default,){
final _that = this;
switch (_that) {
case _ReturnItemModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: idFromJson)  String product, @JsonKey(fromJson: intFromJson)  int quantity)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReturnItemModel() when $default != null:
return $default(_that.product,_that.quantity);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: idFromJson)  String product, @JsonKey(fromJson: intFromJson)  int quantity)  $default,) {final _that = this;
switch (_that) {
case _ReturnItemModel():
return $default(_that.product,_that.quantity);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: idFromJson)  String product, @JsonKey(fromJson: intFromJson)  int quantity)?  $default,) {final _that = this;
switch (_that) {
case _ReturnItemModel() when $default != null:
return $default(_that.product,_that.quantity);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ReturnItemModel implements ReturnItemModel {
  const _ReturnItemModel({@JsonKey(fromJson: idFromJson) this.product = '', @JsonKey(fromJson: intFromJson) this.quantity = 1});
  factory _ReturnItemModel.fromJson(Map<String, dynamic> json) => _$ReturnItemModelFromJson(json);

@override@JsonKey(fromJson: idFromJson) final  String product;
@override@JsonKey(fromJson: intFromJson) final  int quantity;

/// Create a copy of ReturnItemModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReturnItemModelCopyWith<_ReturnItemModel> get copyWith => __$ReturnItemModelCopyWithImpl<_ReturnItemModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ReturnItemModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReturnItemModel&&(identical(other.product, product) || other.product == product)&&(identical(other.quantity, quantity) || other.quantity == quantity));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,product,quantity);

@override
String toString() {
  return 'ReturnItemModel(product: $product, quantity: $quantity)';
}


}

/// @nodoc
abstract mixin class _$ReturnItemModelCopyWith<$Res> implements $ReturnItemModelCopyWith<$Res> {
  factory _$ReturnItemModelCopyWith(_ReturnItemModel value, $Res Function(_ReturnItemModel) _then) = __$ReturnItemModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: idFromJson) String product,@JsonKey(fromJson: intFromJson) int quantity
});




}
/// @nodoc
class __$ReturnItemModelCopyWithImpl<$Res>
    implements _$ReturnItemModelCopyWith<$Res> {
  __$ReturnItemModelCopyWithImpl(this._self, this._then);

  final _ReturnItemModel _self;
  final $Res Function(_ReturnItemModel) _then;

/// Create a copy of ReturnItemModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? product = null,Object? quantity = null,}) {
  return _then(_ReturnItemModel(
product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$ReturnRequestModel {

 DateTime? get requestedAt; List<ReturnItemModel> get items;@JsonKey(fromJson: stringFromJson) String get reason;@JsonKey(fromJson: nullableStringFromJson) String? get comment;@JsonKey(fromJson: stringFromJson) String get status;@JsonKey(fromJson: nullableStringFromJson) String? get adminComment;@JsonKey(fromJson: refundStatusFromJson) String get refundStatus;@JsonKey(fromJson: refundAmountFromJson) double get refundAmount;
/// Create a copy of ReturnRequestModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReturnRequestModelCopyWith<ReturnRequestModel> get copyWith => _$ReturnRequestModelCopyWithImpl<ReturnRequestModel>(this as ReturnRequestModel, _$identity);

  /// Serializes this ReturnRequestModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReturnRequestModel&&(identical(other.requestedAt, requestedAt) || other.requestedAt == requestedAt)&&const DeepCollectionEquality().equals(other.items, items)&&(identical(other.reason, reason) || other.reason == reason)&&(identical(other.comment, comment) || other.comment == comment)&&(identical(other.status, status) || other.status == status)&&(identical(other.adminComment, adminComment) || other.adminComment == adminComment)&&(identical(other.refundStatus, refundStatus) || other.refundStatus == refundStatus)&&(identical(other.refundAmount, refundAmount) || other.refundAmount == refundAmount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,requestedAt,const DeepCollectionEquality().hash(items),reason,comment,status,adminComment,refundStatus,refundAmount);

@override
String toString() {
  return 'ReturnRequestModel(requestedAt: $requestedAt, items: $items, reason: $reason, comment: $comment, status: $status, adminComment: $adminComment, refundStatus: $refundStatus, refundAmount: $refundAmount)';
}


}

/// @nodoc
abstract mixin class $ReturnRequestModelCopyWith<$Res>  {
  factory $ReturnRequestModelCopyWith(ReturnRequestModel value, $Res Function(ReturnRequestModel) _then) = _$ReturnRequestModelCopyWithImpl;
@useResult
$Res call({
 DateTime? requestedAt, List<ReturnItemModel> items,@JsonKey(fromJson: stringFromJson) String reason,@JsonKey(fromJson: nullableStringFromJson) String? comment,@JsonKey(fromJson: stringFromJson) String status,@JsonKey(fromJson: nullableStringFromJson) String? adminComment,@JsonKey(fromJson: refundStatusFromJson) String refundStatus,@JsonKey(fromJson: refundAmountFromJson) double refundAmount
});




}
/// @nodoc
class _$ReturnRequestModelCopyWithImpl<$Res>
    implements $ReturnRequestModelCopyWith<$Res> {
  _$ReturnRequestModelCopyWithImpl(this._self, this._then);

  final ReturnRequestModel _self;
  final $Res Function(ReturnRequestModel) _then;

/// Create a copy of ReturnRequestModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? requestedAt = freezed,Object? items = null,Object? reason = null,Object? comment = freezed,Object? status = null,Object? adminComment = freezed,Object? refundStatus = null,Object? refundAmount = null,}) {
  return _then(_self.copyWith(
requestedAt: freezed == requestedAt ? _self.requestedAt : requestedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,items: null == items ? _self.items : items // ignore: cast_nullable_to_non_nullable
as List<ReturnItemModel>,reason: null == reason ? _self.reason : reason // ignore: cast_nullable_to_non_nullable
as String,comment: freezed == comment ? _self.comment : comment // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,adminComment: freezed == adminComment ? _self.adminComment : adminComment // ignore: cast_nullable_to_non_nullable
as String?,refundStatus: null == refundStatus ? _self.refundStatus : refundStatus // ignore: cast_nullable_to_non_nullable
as String,refundAmount: null == refundAmount ? _self.refundAmount : refundAmount // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [ReturnRequestModel].
extension ReturnRequestModelPatterns on ReturnRequestModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReturnRequestModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReturnRequestModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReturnRequestModel value)  $default,){
final _that = this;
switch (_that) {
case _ReturnRequestModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReturnRequestModel value)?  $default,){
final _that = this;
switch (_that) {
case _ReturnRequestModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( DateTime? requestedAt,  List<ReturnItemModel> items, @JsonKey(fromJson: stringFromJson)  String reason, @JsonKey(fromJson: nullableStringFromJson)  String? comment, @JsonKey(fromJson: stringFromJson)  String status, @JsonKey(fromJson: nullableStringFromJson)  String? adminComment, @JsonKey(fromJson: refundStatusFromJson)  String refundStatus, @JsonKey(fromJson: refundAmountFromJson)  double refundAmount)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReturnRequestModel() when $default != null:
return $default(_that.requestedAt,_that.items,_that.reason,_that.comment,_that.status,_that.adminComment,_that.refundStatus,_that.refundAmount);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( DateTime? requestedAt,  List<ReturnItemModel> items, @JsonKey(fromJson: stringFromJson)  String reason, @JsonKey(fromJson: nullableStringFromJson)  String? comment, @JsonKey(fromJson: stringFromJson)  String status, @JsonKey(fromJson: nullableStringFromJson)  String? adminComment, @JsonKey(fromJson: refundStatusFromJson)  String refundStatus, @JsonKey(fromJson: refundAmountFromJson)  double refundAmount)  $default,) {final _that = this;
switch (_that) {
case _ReturnRequestModel():
return $default(_that.requestedAt,_that.items,_that.reason,_that.comment,_that.status,_that.adminComment,_that.refundStatus,_that.refundAmount);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( DateTime? requestedAt,  List<ReturnItemModel> items, @JsonKey(fromJson: stringFromJson)  String reason, @JsonKey(fromJson: nullableStringFromJson)  String? comment, @JsonKey(fromJson: stringFromJson)  String status, @JsonKey(fromJson: nullableStringFromJson)  String? adminComment, @JsonKey(fromJson: refundStatusFromJson)  String refundStatus, @JsonKey(fromJson: refundAmountFromJson)  double refundAmount)?  $default,) {final _that = this;
switch (_that) {
case _ReturnRequestModel() when $default != null:
return $default(_that.requestedAt,_that.items,_that.reason,_that.comment,_that.status,_that.adminComment,_that.refundStatus,_that.refundAmount);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ReturnRequestModel extends ReturnRequestModel {
  const _ReturnRequestModel({this.requestedAt, final  List<ReturnItemModel> items = const <ReturnItemModel>[], @JsonKey(fromJson: stringFromJson) this.reason = '', @JsonKey(fromJson: nullableStringFromJson) this.comment, @JsonKey(fromJson: stringFromJson) this.status = 'Requested', @JsonKey(fromJson: nullableStringFromJson) this.adminComment, @JsonKey(fromJson: refundStatusFromJson) this.refundStatus = 'Not Applicable', @JsonKey(fromJson: refundAmountFromJson) this.refundAmount = 0}): _items = items,super._();
  factory _ReturnRequestModel.fromJson(Map<String, dynamic> json) => _$ReturnRequestModelFromJson(json);

@override final  DateTime? requestedAt;
 final  List<ReturnItemModel> _items;
@override@JsonKey() List<ReturnItemModel> get items {
  if (_items is EqualUnmodifiableListView) return _items;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_items);
}

@override@JsonKey(fromJson: stringFromJson) final  String reason;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? comment;
@override@JsonKey(fromJson: stringFromJson) final  String status;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? adminComment;
@override@JsonKey(fromJson: refundStatusFromJson) final  String refundStatus;
@override@JsonKey(fromJson: refundAmountFromJson) final  double refundAmount;

/// Create a copy of ReturnRequestModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReturnRequestModelCopyWith<_ReturnRequestModel> get copyWith => __$ReturnRequestModelCopyWithImpl<_ReturnRequestModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ReturnRequestModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReturnRequestModel&&(identical(other.requestedAt, requestedAt) || other.requestedAt == requestedAt)&&const DeepCollectionEquality().equals(other._items, _items)&&(identical(other.reason, reason) || other.reason == reason)&&(identical(other.comment, comment) || other.comment == comment)&&(identical(other.status, status) || other.status == status)&&(identical(other.adminComment, adminComment) || other.adminComment == adminComment)&&(identical(other.refundStatus, refundStatus) || other.refundStatus == refundStatus)&&(identical(other.refundAmount, refundAmount) || other.refundAmount == refundAmount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,requestedAt,const DeepCollectionEquality().hash(_items),reason,comment,status,adminComment,refundStatus,refundAmount);

@override
String toString() {
  return 'ReturnRequestModel(requestedAt: $requestedAt, items: $items, reason: $reason, comment: $comment, status: $status, adminComment: $adminComment, refundStatus: $refundStatus, refundAmount: $refundAmount)';
}


}

/// @nodoc
abstract mixin class _$ReturnRequestModelCopyWith<$Res> implements $ReturnRequestModelCopyWith<$Res> {
  factory _$ReturnRequestModelCopyWith(_ReturnRequestModel value, $Res Function(_ReturnRequestModel) _then) = __$ReturnRequestModelCopyWithImpl;
@override @useResult
$Res call({
 DateTime? requestedAt, List<ReturnItemModel> items,@JsonKey(fromJson: stringFromJson) String reason,@JsonKey(fromJson: nullableStringFromJson) String? comment,@JsonKey(fromJson: stringFromJson) String status,@JsonKey(fromJson: nullableStringFromJson) String? adminComment,@JsonKey(fromJson: refundStatusFromJson) String refundStatus,@JsonKey(fromJson: refundAmountFromJson) double refundAmount
});




}
/// @nodoc
class __$ReturnRequestModelCopyWithImpl<$Res>
    implements _$ReturnRequestModelCopyWith<$Res> {
  __$ReturnRequestModelCopyWithImpl(this._self, this._then);

  final _ReturnRequestModel _self;
  final $Res Function(_ReturnRequestModel) _then;

/// Create a copy of ReturnRequestModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? requestedAt = freezed,Object? items = null,Object? reason = null,Object? comment = freezed,Object? status = null,Object? adminComment = freezed,Object? refundStatus = null,Object? refundAmount = null,}) {
  return _then(_ReturnRequestModel(
requestedAt: freezed == requestedAt ? _self.requestedAt : requestedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,items: null == items ? _self._items : items // ignore: cast_nullable_to_non_nullable
as List<ReturnItemModel>,reason: null == reason ? _self.reason : reason // ignore: cast_nullable_to_non_nullable
as String,comment: freezed == comment ? _self.comment : comment // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,adminComment: freezed == adminComment ? _self.adminComment : adminComment // ignore: cast_nullable_to_non_nullable
as String?,refundStatus: null == refundStatus ? _self.refundStatus : refundStatus // ignore: cast_nullable_to_non_nullable
as String,refundAmount: null == refundAmount ? _self.refundAmount : refundAmount // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}


/// @nodoc
mixin _$OrderModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: stringFromJson) String get orderNumber;@JsonKey(fromJson: idFromJson) String get user; List<OrderItemModel> get items; ShippingAddressModel? get shippingAddress; CouponAppliedModel? get coupon;@JsonKey(fromJson: doubleFromJson) double get discountAmount;@JsonKey(fromJson: doubleFromJson) double get discountPercentage;@JsonKey(fromJson: doubleFromJson) double get subTotal;@JsonKey(fromJson: doubleFromJson) double get shippingCharge;@JsonKey(fromJson: doubleFromJson) double get tax;/// true: `tax` is GST already included in the prices (not added to the total).
@JsonKey(fromJson: boolFromJson) bool get taxIncluded;@JsonKey(fromJson: doubleFromJson) double get grandTotal;@JsonKey(fromJson: stringFromJson) String get paymentMethod;@JsonKey(fromJson: stringFromJson) String get paymentStatus; PaymentInfoModel? get paymentInfo;@JsonKey(fromJson: stringFromJson) String get orderStatus; List<StatusHistoryModel> get statusHistory; CourierModel? get courier; TrackingModel? get tracking;@JsonKey(fromJson: nullableStringFromJson) String? get shippingNotes;@JsonKey(fromJson: nullableStringFromJson) String? get invoiceNumber; DateTime? get deliveredAt; DateTime? get cancelledAt;@JsonKey(fromJson: nullableStringFromJson) String? get cancelReason; ReturnRequestModel? get returnRequest; DateTime? get createdAt;
/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderModelCopyWith<OrderModel> get copyWith => _$OrderModelCopyWithImpl<OrderModel>(this as OrderModel, _$identity);

  /// Serializes this OrderModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderModel&&(identical(other.id, id) || other.id == id)&&(identical(other.orderNumber, orderNumber) || other.orderNumber == orderNumber)&&(identical(other.user, user) || other.user == user)&&const DeepCollectionEquality().equals(other.items, items)&&(identical(other.shippingAddress, shippingAddress) || other.shippingAddress == shippingAddress)&&(identical(other.coupon, coupon) || other.coupon == coupon)&&(identical(other.discountAmount, discountAmount) || other.discountAmount == discountAmount)&&(identical(other.discountPercentage, discountPercentage) || other.discountPercentage == discountPercentage)&&(identical(other.subTotal, subTotal) || other.subTotal == subTotal)&&(identical(other.shippingCharge, shippingCharge) || other.shippingCharge == shippingCharge)&&(identical(other.tax, tax) || other.tax == tax)&&(identical(other.taxIncluded, taxIncluded) || other.taxIncluded == taxIncluded)&&(identical(other.grandTotal, grandTotal) || other.grandTotal == grandTotal)&&(identical(other.paymentMethod, paymentMethod) || other.paymentMethod == paymentMethod)&&(identical(other.paymentStatus, paymentStatus) || other.paymentStatus == paymentStatus)&&(identical(other.paymentInfo, paymentInfo) || other.paymentInfo == paymentInfo)&&(identical(other.orderStatus, orderStatus) || other.orderStatus == orderStatus)&&const DeepCollectionEquality().equals(other.statusHistory, statusHistory)&&(identical(other.courier, courier) || other.courier == courier)&&(identical(other.tracking, tracking) || other.tracking == tracking)&&(identical(other.shippingNotes, shippingNotes) || other.shippingNotes == shippingNotes)&&(identical(other.invoiceNumber, invoiceNumber) || other.invoiceNumber == invoiceNumber)&&(identical(other.deliveredAt, deliveredAt) || other.deliveredAt == deliveredAt)&&(identical(other.cancelledAt, cancelledAt) || other.cancelledAt == cancelledAt)&&(identical(other.cancelReason, cancelReason) || other.cancelReason == cancelReason)&&(identical(other.returnRequest, returnRequest) || other.returnRequest == returnRequest)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,orderNumber,user,const DeepCollectionEquality().hash(items),shippingAddress,coupon,discountAmount,discountPercentage,subTotal,shippingCharge,tax,taxIncluded,grandTotal,paymentMethod,paymentStatus,paymentInfo,orderStatus,const DeepCollectionEquality().hash(statusHistory),courier,tracking,shippingNotes,invoiceNumber,deliveredAt,cancelledAt,cancelReason,returnRequest,createdAt]);

@override
String toString() {
  return 'OrderModel(id: $id, orderNumber: $orderNumber, user: $user, items: $items, shippingAddress: $shippingAddress, coupon: $coupon, discountAmount: $discountAmount, discountPercentage: $discountPercentage, subTotal: $subTotal, shippingCharge: $shippingCharge, tax: $tax, taxIncluded: $taxIncluded, grandTotal: $grandTotal, paymentMethod: $paymentMethod, paymentStatus: $paymentStatus, paymentInfo: $paymentInfo, orderStatus: $orderStatus, statusHistory: $statusHistory, courier: $courier, tracking: $tracking, shippingNotes: $shippingNotes, invoiceNumber: $invoiceNumber, deliveredAt: $deliveredAt, cancelledAt: $cancelledAt, cancelReason: $cancelReason, returnRequest: $returnRequest, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $OrderModelCopyWith<$Res>  {
  factory $OrderModelCopyWith(OrderModel value, $Res Function(OrderModel) _then) = _$OrderModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String orderNumber,@JsonKey(fromJson: idFromJson) String user, List<OrderItemModel> items, ShippingAddressModel? shippingAddress, CouponAppliedModel? coupon,@JsonKey(fromJson: doubleFromJson) double discountAmount,@JsonKey(fromJson: doubleFromJson) double discountPercentage,@JsonKey(fromJson: doubleFromJson) double subTotal,@JsonKey(fromJson: doubleFromJson) double shippingCharge,@JsonKey(fromJson: doubleFromJson) double tax,@JsonKey(fromJson: boolFromJson) bool taxIncluded,@JsonKey(fromJson: doubleFromJson) double grandTotal,@JsonKey(fromJson: stringFromJson) String paymentMethod,@JsonKey(fromJson: stringFromJson) String paymentStatus, PaymentInfoModel? paymentInfo,@JsonKey(fromJson: stringFromJson) String orderStatus, List<StatusHistoryModel> statusHistory, CourierModel? courier, TrackingModel? tracking,@JsonKey(fromJson: nullableStringFromJson) String? shippingNotes,@JsonKey(fromJson: nullableStringFromJson) String? invoiceNumber, DateTime? deliveredAt, DateTime? cancelledAt,@JsonKey(fromJson: nullableStringFromJson) String? cancelReason, ReturnRequestModel? returnRequest, DateTime? createdAt
});


$ShippingAddressModelCopyWith<$Res>? get shippingAddress;$CouponAppliedModelCopyWith<$Res>? get coupon;$PaymentInfoModelCopyWith<$Res>? get paymentInfo;$CourierModelCopyWith<$Res>? get courier;$TrackingModelCopyWith<$Res>? get tracking;$ReturnRequestModelCopyWith<$Res>? get returnRequest;

}
/// @nodoc
class _$OrderModelCopyWithImpl<$Res>
    implements $OrderModelCopyWith<$Res> {
  _$OrderModelCopyWithImpl(this._self, this._then);

  final OrderModel _self;
  final $Res Function(OrderModel) _then;

/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? orderNumber = null,Object? user = null,Object? items = null,Object? shippingAddress = freezed,Object? coupon = freezed,Object? discountAmount = null,Object? discountPercentage = null,Object? subTotal = null,Object? shippingCharge = null,Object? tax = null,Object? taxIncluded = null,Object? grandTotal = null,Object? paymentMethod = null,Object? paymentStatus = null,Object? paymentInfo = freezed,Object? orderStatus = null,Object? statusHistory = null,Object? courier = freezed,Object? tracking = freezed,Object? shippingNotes = freezed,Object? invoiceNumber = freezed,Object? deliveredAt = freezed,Object? cancelledAt = freezed,Object? cancelReason = freezed,Object? returnRequest = freezed,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,orderNumber: null == orderNumber ? _self.orderNumber : orderNumber // ignore: cast_nullable_to_non_nullable
as String,user: null == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as String,items: null == items ? _self.items : items // ignore: cast_nullable_to_non_nullable
as List<OrderItemModel>,shippingAddress: freezed == shippingAddress ? _self.shippingAddress : shippingAddress // ignore: cast_nullable_to_non_nullable
as ShippingAddressModel?,coupon: freezed == coupon ? _self.coupon : coupon // ignore: cast_nullable_to_non_nullable
as CouponAppliedModel?,discountAmount: null == discountAmount ? _self.discountAmount : discountAmount // ignore: cast_nullable_to_non_nullable
as double,discountPercentage: null == discountPercentage ? _self.discountPercentage : discountPercentage // ignore: cast_nullable_to_non_nullable
as double,subTotal: null == subTotal ? _self.subTotal : subTotal // ignore: cast_nullable_to_non_nullable
as double,shippingCharge: null == shippingCharge ? _self.shippingCharge : shippingCharge // ignore: cast_nullable_to_non_nullable
as double,tax: null == tax ? _self.tax : tax // ignore: cast_nullable_to_non_nullable
as double,taxIncluded: null == taxIncluded ? _self.taxIncluded : taxIncluded // ignore: cast_nullable_to_non_nullable
as bool,grandTotal: null == grandTotal ? _self.grandTotal : grandTotal // ignore: cast_nullable_to_non_nullable
as double,paymentMethod: null == paymentMethod ? _self.paymentMethod : paymentMethod // ignore: cast_nullable_to_non_nullable
as String,paymentStatus: null == paymentStatus ? _self.paymentStatus : paymentStatus // ignore: cast_nullable_to_non_nullable
as String,paymentInfo: freezed == paymentInfo ? _self.paymentInfo : paymentInfo // ignore: cast_nullable_to_non_nullable
as PaymentInfoModel?,orderStatus: null == orderStatus ? _self.orderStatus : orderStatus // ignore: cast_nullable_to_non_nullable
as String,statusHistory: null == statusHistory ? _self.statusHistory : statusHistory // ignore: cast_nullable_to_non_nullable
as List<StatusHistoryModel>,courier: freezed == courier ? _self.courier : courier // ignore: cast_nullable_to_non_nullable
as CourierModel?,tracking: freezed == tracking ? _self.tracking : tracking // ignore: cast_nullable_to_non_nullable
as TrackingModel?,shippingNotes: freezed == shippingNotes ? _self.shippingNotes : shippingNotes // ignore: cast_nullable_to_non_nullable
as String?,invoiceNumber: freezed == invoiceNumber ? _self.invoiceNumber : invoiceNumber // ignore: cast_nullable_to_non_nullable
as String?,deliveredAt: freezed == deliveredAt ? _self.deliveredAt : deliveredAt // ignore: cast_nullable_to_non_nullable
as DateTime?,cancelledAt: freezed == cancelledAt ? _self.cancelledAt : cancelledAt // ignore: cast_nullable_to_non_nullable
as DateTime?,cancelReason: freezed == cancelReason ? _self.cancelReason : cancelReason // ignore: cast_nullable_to_non_nullable
as String?,returnRequest: freezed == returnRequest ? _self.returnRequest : returnRequest // ignore: cast_nullable_to_non_nullable
as ReturnRequestModel?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}
/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ShippingAddressModelCopyWith<$Res>? get shippingAddress {
    if (_self.shippingAddress == null) {
    return null;
  }

  return $ShippingAddressModelCopyWith<$Res>(_self.shippingAddress!, (value) {
    return _then(_self.copyWith(shippingAddress: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$CouponAppliedModelCopyWith<$Res>? get coupon {
    if (_self.coupon == null) {
    return null;
  }

  return $CouponAppliedModelCopyWith<$Res>(_self.coupon!, (value) {
    return _then(_self.copyWith(coupon: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PaymentInfoModelCopyWith<$Res>? get paymentInfo {
    if (_self.paymentInfo == null) {
    return null;
  }

  return $PaymentInfoModelCopyWith<$Res>(_self.paymentInfo!, (value) {
    return _then(_self.copyWith(paymentInfo: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$CourierModelCopyWith<$Res>? get courier {
    if (_self.courier == null) {
    return null;
  }

  return $CourierModelCopyWith<$Res>(_self.courier!, (value) {
    return _then(_self.copyWith(courier: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TrackingModelCopyWith<$Res>? get tracking {
    if (_self.tracking == null) {
    return null;
  }

  return $TrackingModelCopyWith<$Res>(_self.tracking!, (value) {
    return _then(_self.copyWith(tracking: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReturnRequestModelCopyWith<$Res>? get returnRequest {
    if (_self.returnRequest == null) {
    return null;
  }

  return $ReturnRequestModelCopyWith<$Res>(_self.returnRequest!, (value) {
    return _then(_self.copyWith(returnRequest: value));
  });
}
}


/// Adds pattern-matching-related methods to [OrderModel].
extension OrderModelPatterns on OrderModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderModel value)  $default,){
final _that = this;
switch (_that) {
case _OrderModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderModel value)?  $default,){
final _that = this;
switch (_that) {
case _OrderModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String orderNumber, @JsonKey(fromJson: idFromJson)  String user,  List<OrderItemModel> items,  ShippingAddressModel? shippingAddress,  CouponAppliedModel? coupon, @JsonKey(fromJson: doubleFromJson)  double discountAmount, @JsonKey(fromJson: doubleFromJson)  double discountPercentage, @JsonKey(fromJson: doubleFromJson)  double subTotal, @JsonKey(fromJson: doubleFromJson)  double shippingCharge, @JsonKey(fromJson: doubleFromJson)  double tax, @JsonKey(fromJson: boolFromJson)  bool taxIncluded, @JsonKey(fromJson: doubleFromJson)  double grandTotal, @JsonKey(fromJson: stringFromJson)  String paymentMethod, @JsonKey(fromJson: stringFromJson)  String paymentStatus,  PaymentInfoModel? paymentInfo, @JsonKey(fromJson: stringFromJson)  String orderStatus,  List<StatusHistoryModel> statusHistory,  CourierModel? courier,  TrackingModel? tracking, @JsonKey(fromJson: nullableStringFromJson)  String? shippingNotes, @JsonKey(fromJson: nullableStringFromJson)  String? invoiceNumber,  DateTime? deliveredAt,  DateTime? cancelledAt, @JsonKey(fromJson: nullableStringFromJson)  String? cancelReason,  ReturnRequestModel? returnRequest,  DateTime? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderModel() when $default != null:
return $default(_that.id,_that.orderNumber,_that.user,_that.items,_that.shippingAddress,_that.coupon,_that.discountAmount,_that.discountPercentage,_that.subTotal,_that.shippingCharge,_that.tax,_that.taxIncluded,_that.grandTotal,_that.paymentMethod,_that.paymentStatus,_that.paymentInfo,_that.orderStatus,_that.statusHistory,_that.courier,_that.tracking,_that.shippingNotes,_that.invoiceNumber,_that.deliveredAt,_that.cancelledAt,_that.cancelReason,_that.returnRequest,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String orderNumber, @JsonKey(fromJson: idFromJson)  String user,  List<OrderItemModel> items,  ShippingAddressModel? shippingAddress,  CouponAppliedModel? coupon, @JsonKey(fromJson: doubleFromJson)  double discountAmount, @JsonKey(fromJson: doubleFromJson)  double discountPercentage, @JsonKey(fromJson: doubleFromJson)  double subTotal, @JsonKey(fromJson: doubleFromJson)  double shippingCharge, @JsonKey(fromJson: doubleFromJson)  double tax, @JsonKey(fromJson: boolFromJson)  bool taxIncluded, @JsonKey(fromJson: doubleFromJson)  double grandTotal, @JsonKey(fromJson: stringFromJson)  String paymentMethod, @JsonKey(fromJson: stringFromJson)  String paymentStatus,  PaymentInfoModel? paymentInfo, @JsonKey(fromJson: stringFromJson)  String orderStatus,  List<StatusHistoryModel> statusHistory,  CourierModel? courier,  TrackingModel? tracking, @JsonKey(fromJson: nullableStringFromJson)  String? shippingNotes, @JsonKey(fromJson: nullableStringFromJson)  String? invoiceNumber,  DateTime? deliveredAt,  DateTime? cancelledAt, @JsonKey(fromJson: nullableStringFromJson)  String? cancelReason,  ReturnRequestModel? returnRequest,  DateTime? createdAt)  $default,) {final _that = this;
switch (_that) {
case _OrderModel():
return $default(_that.id,_that.orderNumber,_that.user,_that.items,_that.shippingAddress,_that.coupon,_that.discountAmount,_that.discountPercentage,_that.subTotal,_that.shippingCharge,_that.tax,_that.taxIncluded,_that.grandTotal,_that.paymentMethod,_that.paymentStatus,_that.paymentInfo,_that.orderStatus,_that.statusHistory,_that.courier,_that.tracking,_that.shippingNotes,_that.invoiceNumber,_that.deliveredAt,_that.cancelledAt,_that.cancelReason,_that.returnRequest,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String orderNumber, @JsonKey(fromJson: idFromJson)  String user,  List<OrderItemModel> items,  ShippingAddressModel? shippingAddress,  CouponAppliedModel? coupon, @JsonKey(fromJson: doubleFromJson)  double discountAmount, @JsonKey(fromJson: doubleFromJson)  double discountPercentage, @JsonKey(fromJson: doubleFromJson)  double subTotal, @JsonKey(fromJson: doubleFromJson)  double shippingCharge, @JsonKey(fromJson: doubleFromJson)  double tax, @JsonKey(fromJson: boolFromJson)  bool taxIncluded, @JsonKey(fromJson: doubleFromJson)  double grandTotal, @JsonKey(fromJson: stringFromJson)  String paymentMethod, @JsonKey(fromJson: stringFromJson)  String paymentStatus,  PaymentInfoModel? paymentInfo, @JsonKey(fromJson: stringFromJson)  String orderStatus,  List<StatusHistoryModel> statusHistory,  CourierModel? courier,  TrackingModel? tracking, @JsonKey(fromJson: nullableStringFromJson)  String? shippingNotes, @JsonKey(fromJson: nullableStringFromJson)  String? invoiceNumber,  DateTime? deliveredAt,  DateTime? cancelledAt, @JsonKey(fromJson: nullableStringFromJson)  String? cancelReason,  ReturnRequestModel? returnRequest,  DateTime? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _OrderModel() when $default != null:
return $default(_that.id,_that.orderNumber,_that.user,_that.items,_that.shippingAddress,_that.coupon,_that.discountAmount,_that.discountPercentage,_that.subTotal,_that.shippingCharge,_that.tax,_that.taxIncluded,_that.grandTotal,_that.paymentMethod,_that.paymentStatus,_that.paymentInfo,_that.orderStatus,_that.statusHistory,_that.courier,_that.tracking,_that.shippingNotes,_that.invoiceNumber,_that.deliveredAt,_that.cancelledAt,_that.cancelReason,_that.returnRequest,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderModel extends OrderModel {
  const _OrderModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: stringFromJson) this.orderNumber = '', @JsonKey(fromJson: idFromJson) this.user = '', final  List<OrderItemModel> items = const <OrderItemModel>[], this.shippingAddress, this.coupon, @JsonKey(fromJson: doubleFromJson) this.discountAmount = 0, @JsonKey(fromJson: doubleFromJson) this.discountPercentage = 0, @JsonKey(fromJson: doubleFromJson) this.subTotal = 0, @JsonKey(fromJson: doubleFromJson) this.shippingCharge = 0, @JsonKey(fromJson: doubleFromJson) this.tax = 0, @JsonKey(fromJson: boolFromJson) this.taxIncluded = false, @JsonKey(fromJson: doubleFromJson) this.grandTotal = 0, @JsonKey(fromJson: stringFromJson) this.paymentMethod = 'cod', @JsonKey(fromJson: stringFromJson) this.paymentStatus = 'Pending', this.paymentInfo, @JsonKey(fromJson: stringFromJson) this.orderStatus = 'Pending', final  List<StatusHistoryModel> statusHistory = const <StatusHistoryModel>[], this.courier, this.tracking, @JsonKey(fromJson: nullableStringFromJson) this.shippingNotes, @JsonKey(fromJson: nullableStringFromJson) this.invoiceNumber, this.deliveredAt, this.cancelledAt, @JsonKey(fromJson: nullableStringFromJson) this.cancelReason, this.returnRequest, this.createdAt}): _items = items,_statusHistory = statusHistory,super._();
  factory _OrderModel.fromJson(Map<String, dynamic> json) => _$OrderModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: stringFromJson) final  String orderNumber;
@override@JsonKey(fromJson: idFromJson) final  String user;
 final  List<OrderItemModel> _items;
@override@JsonKey() List<OrderItemModel> get items {
  if (_items is EqualUnmodifiableListView) return _items;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_items);
}

@override final  ShippingAddressModel? shippingAddress;
@override final  CouponAppliedModel? coupon;
@override@JsonKey(fromJson: doubleFromJson) final  double discountAmount;
@override@JsonKey(fromJson: doubleFromJson) final  double discountPercentage;
@override@JsonKey(fromJson: doubleFromJson) final  double subTotal;
@override@JsonKey(fromJson: doubleFromJson) final  double shippingCharge;
@override@JsonKey(fromJson: doubleFromJson) final  double tax;
/// true: `tax` is GST already included in the prices (not added to the total).
@override@JsonKey(fromJson: boolFromJson) final  bool taxIncluded;
@override@JsonKey(fromJson: doubleFromJson) final  double grandTotal;
@override@JsonKey(fromJson: stringFromJson) final  String paymentMethod;
@override@JsonKey(fromJson: stringFromJson) final  String paymentStatus;
@override final  PaymentInfoModel? paymentInfo;
@override@JsonKey(fromJson: stringFromJson) final  String orderStatus;
 final  List<StatusHistoryModel> _statusHistory;
@override@JsonKey() List<StatusHistoryModel> get statusHistory {
  if (_statusHistory is EqualUnmodifiableListView) return _statusHistory;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_statusHistory);
}

@override final  CourierModel? courier;
@override final  TrackingModel? tracking;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? shippingNotes;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? invoiceNumber;
@override final  DateTime? deliveredAt;
@override final  DateTime? cancelledAt;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? cancelReason;
@override final  ReturnRequestModel? returnRequest;
@override final  DateTime? createdAt;

/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderModelCopyWith<_OrderModel> get copyWith => __$OrderModelCopyWithImpl<_OrderModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderModel&&(identical(other.id, id) || other.id == id)&&(identical(other.orderNumber, orderNumber) || other.orderNumber == orderNumber)&&(identical(other.user, user) || other.user == user)&&const DeepCollectionEquality().equals(other._items, _items)&&(identical(other.shippingAddress, shippingAddress) || other.shippingAddress == shippingAddress)&&(identical(other.coupon, coupon) || other.coupon == coupon)&&(identical(other.discountAmount, discountAmount) || other.discountAmount == discountAmount)&&(identical(other.discountPercentage, discountPercentage) || other.discountPercentage == discountPercentage)&&(identical(other.subTotal, subTotal) || other.subTotal == subTotal)&&(identical(other.shippingCharge, shippingCharge) || other.shippingCharge == shippingCharge)&&(identical(other.tax, tax) || other.tax == tax)&&(identical(other.taxIncluded, taxIncluded) || other.taxIncluded == taxIncluded)&&(identical(other.grandTotal, grandTotal) || other.grandTotal == grandTotal)&&(identical(other.paymentMethod, paymentMethod) || other.paymentMethod == paymentMethod)&&(identical(other.paymentStatus, paymentStatus) || other.paymentStatus == paymentStatus)&&(identical(other.paymentInfo, paymentInfo) || other.paymentInfo == paymentInfo)&&(identical(other.orderStatus, orderStatus) || other.orderStatus == orderStatus)&&const DeepCollectionEquality().equals(other._statusHistory, _statusHistory)&&(identical(other.courier, courier) || other.courier == courier)&&(identical(other.tracking, tracking) || other.tracking == tracking)&&(identical(other.shippingNotes, shippingNotes) || other.shippingNotes == shippingNotes)&&(identical(other.invoiceNumber, invoiceNumber) || other.invoiceNumber == invoiceNumber)&&(identical(other.deliveredAt, deliveredAt) || other.deliveredAt == deliveredAt)&&(identical(other.cancelledAt, cancelledAt) || other.cancelledAt == cancelledAt)&&(identical(other.cancelReason, cancelReason) || other.cancelReason == cancelReason)&&(identical(other.returnRequest, returnRequest) || other.returnRequest == returnRequest)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,orderNumber,user,const DeepCollectionEquality().hash(_items),shippingAddress,coupon,discountAmount,discountPercentage,subTotal,shippingCharge,tax,taxIncluded,grandTotal,paymentMethod,paymentStatus,paymentInfo,orderStatus,const DeepCollectionEquality().hash(_statusHistory),courier,tracking,shippingNotes,invoiceNumber,deliveredAt,cancelledAt,cancelReason,returnRequest,createdAt]);

@override
String toString() {
  return 'OrderModel(id: $id, orderNumber: $orderNumber, user: $user, items: $items, shippingAddress: $shippingAddress, coupon: $coupon, discountAmount: $discountAmount, discountPercentage: $discountPercentage, subTotal: $subTotal, shippingCharge: $shippingCharge, tax: $tax, taxIncluded: $taxIncluded, grandTotal: $grandTotal, paymentMethod: $paymentMethod, paymentStatus: $paymentStatus, paymentInfo: $paymentInfo, orderStatus: $orderStatus, statusHistory: $statusHistory, courier: $courier, tracking: $tracking, shippingNotes: $shippingNotes, invoiceNumber: $invoiceNumber, deliveredAt: $deliveredAt, cancelledAt: $cancelledAt, cancelReason: $cancelReason, returnRequest: $returnRequest, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$OrderModelCopyWith<$Res> implements $OrderModelCopyWith<$Res> {
  factory _$OrderModelCopyWith(_OrderModel value, $Res Function(_OrderModel) _then) = __$OrderModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String orderNumber,@JsonKey(fromJson: idFromJson) String user, List<OrderItemModel> items, ShippingAddressModel? shippingAddress, CouponAppliedModel? coupon,@JsonKey(fromJson: doubleFromJson) double discountAmount,@JsonKey(fromJson: doubleFromJson) double discountPercentage,@JsonKey(fromJson: doubleFromJson) double subTotal,@JsonKey(fromJson: doubleFromJson) double shippingCharge,@JsonKey(fromJson: doubleFromJson) double tax,@JsonKey(fromJson: boolFromJson) bool taxIncluded,@JsonKey(fromJson: doubleFromJson) double grandTotal,@JsonKey(fromJson: stringFromJson) String paymentMethod,@JsonKey(fromJson: stringFromJson) String paymentStatus, PaymentInfoModel? paymentInfo,@JsonKey(fromJson: stringFromJson) String orderStatus, List<StatusHistoryModel> statusHistory, CourierModel? courier, TrackingModel? tracking,@JsonKey(fromJson: nullableStringFromJson) String? shippingNotes,@JsonKey(fromJson: nullableStringFromJson) String? invoiceNumber, DateTime? deliveredAt, DateTime? cancelledAt,@JsonKey(fromJson: nullableStringFromJson) String? cancelReason, ReturnRequestModel? returnRequest, DateTime? createdAt
});


@override $ShippingAddressModelCopyWith<$Res>? get shippingAddress;@override $CouponAppliedModelCopyWith<$Res>? get coupon;@override $PaymentInfoModelCopyWith<$Res>? get paymentInfo;@override $CourierModelCopyWith<$Res>? get courier;@override $TrackingModelCopyWith<$Res>? get tracking;@override $ReturnRequestModelCopyWith<$Res>? get returnRequest;

}
/// @nodoc
class __$OrderModelCopyWithImpl<$Res>
    implements _$OrderModelCopyWith<$Res> {
  __$OrderModelCopyWithImpl(this._self, this._then);

  final _OrderModel _self;
  final $Res Function(_OrderModel) _then;

/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? orderNumber = null,Object? user = null,Object? items = null,Object? shippingAddress = freezed,Object? coupon = freezed,Object? discountAmount = null,Object? discountPercentage = null,Object? subTotal = null,Object? shippingCharge = null,Object? tax = null,Object? taxIncluded = null,Object? grandTotal = null,Object? paymentMethod = null,Object? paymentStatus = null,Object? paymentInfo = freezed,Object? orderStatus = null,Object? statusHistory = null,Object? courier = freezed,Object? tracking = freezed,Object? shippingNotes = freezed,Object? invoiceNumber = freezed,Object? deliveredAt = freezed,Object? cancelledAt = freezed,Object? cancelReason = freezed,Object? returnRequest = freezed,Object? createdAt = freezed,}) {
  return _then(_OrderModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,orderNumber: null == orderNumber ? _self.orderNumber : orderNumber // ignore: cast_nullable_to_non_nullable
as String,user: null == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as String,items: null == items ? _self._items : items // ignore: cast_nullable_to_non_nullable
as List<OrderItemModel>,shippingAddress: freezed == shippingAddress ? _self.shippingAddress : shippingAddress // ignore: cast_nullable_to_non_nullable
as ShippingAddressModel?,coupon: freezed == coupon ? _self.coupon : coupon // ignore: cast_nullable_to_non_nullable
as CouponAppliedModel?,discountAmount: null == discountAmount ? _self.discountAmount : discountAmount // ignore: cast_nullable_to_non_nullable
as double,discountPercentage: null == discountPercentage ? _self.discountPercentage : discountPercentage // ignore: cast_nullable_to_non_nullable
as double,subTotal: null == subTotal ? _self.subTotal : subTotal // ignore: cast_nullable_to_non_nullable
as double,shippingCharge: null == shippingCharge ? _self.shippingCharge : shippingCharge // ignore: cast_nullable_to_non_nullable
as double,tax: null == tax ? _self.tax : tax // ignore: cast_nullable_to_non_nullable
as double,taxIncluded: null == taxIncluded ? _self.taxIncluded : taxIncluded // ignore: cast_nullable_to_non_nullable
as bool,grandTotal: null == grandTotal ? _self.grandTotal : grandTotal // ignore: cast_nullable_to_non_nullable
as double,paymentMethod: null == paymentMethod ? _self.paymentMethod : paymentMethod // ignore: cast_nullable_to_non_nullable
as String,paymentStatus: null == paymentStatus ? _self.paymentStatus : paymentStatus // ignore: cast_nullable_to_non_nullable
as String,paymentInfo: freezed == paymentInfo ? _self.paymentInfo : paymentInfo // ignore: cast_nullable_to_non_nullable
as PaymentInfoModel?,orderStatus: null == orderStatus ? _self.orderStatus : orderStatus // ignore: cast_nullable_to_non_nullable
as String,statusHistory: null == statusHistory ? _self._statusHistory : statusHistory // ignore: cast_nullable_to_non_nullable
as List<StatusHistoryModel>,courier: freezed == courier ? _self.courier : courier // ignore: cast_nullable_to_non_nullable
as CourierModel?,tracking: freezed == tracking ? _self.tracking : tracking // ignore: cast_nullable_to_non_nullable
as TrackingModel?,shippingNotes: freezed == shippingNotes ? _self.shippingNotes : shippingNotes // ignore: cast_nullable_to_non_nullable
as String?,invoiceNumber: freezed == invoiceNumber ? _self.invoiceNumber : invoiceNumber // ignore: cast_nullable_to_non_nullable
as String?,deliveredAt: freezed == deliveredAt ? _self.deliveredAt : deliveredAt // ignore: cast_nullable_to_non_nullable
as DateTime?,cancelledAt: freezed == cancelledAt ? _self.cancelledAt : cancelledAt // ignore: cast_nullable_to_non_nullable
as DateTime?,cancelReason: freezed == cancelReason ? _self.cancelReason : cancelReason // ignore: cast_nullable_to_non_nullable
as String?,returnRequest: freezed == returnRequest ? _self.returnRequest : returnRequest // ignore: cast_nullable_to_non_nullable
as ReturnRequestModel?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ShippingAddressModelCopyWith<$Res>? get shippingAddress {
    if (_self.shippingAddress == null) {
    return null;
  }

  return $ShippingAddressModelCopyWith<$Res>(_self.shippingAddress!, (value) {
    return _then(_self.copyWith(shippingAddress: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$CouponAppliedModelCopyWith<$Res>? get coupon {
    if (_self.coupon == null) {
    return null;
  }

  return $CouponAppliedModelCopyWith<$Res>(_self.coupon!, (value) {
    return _then(_self.copyWith(coupon: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PaymentInfoModelCopyWith<$Res>? get paymentInfo {
    if (_self.paymentInfo == null) {
    return null;
  }

  return $PaymentInfoModelCopyWith<$Res>(_self.paymentInfo!, (value) {
    return _then(_self.copyWith(paymentInfo: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$CourierModelCopyWith<$Res>? get courier {
    if (_self.courier == null) {
    return null;
  }

  return $CourierModelCopyWith<$Res>(_self.courier!, (value) {
    return _then(_self.copyWith(courier: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TrackingModelCopyWith<$Res>? get tracking {
    if (_self.tracking == null) {
    return null;
  }

  return $TrackingModelCopyWith<$Res>(_self.tracking!, (value) {
    return _then(_self.copyWith(tracking: value));
  });
}/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReturnRequestModelCopyWith<$Res>? get returnRequest {
    if (_self.returnRequest == null) {
    return null;
  }

  return $ReturnRequestModelCopyWith<$Res>(_self.returnRequest!, (value) {
    return _then(_self.copyWith(returnRequest: value));
  });
}
}

// dart format on
