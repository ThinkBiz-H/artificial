// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'cart_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CartItemModel {

/// Server cart line id (absent on guest-cart lines).
@JsonKey(fromJson: nullableStringFromJson) String? get lineId;@JsonKey(fromJson: productFromJson) ProductModel get product;@JsonKey(fromJson: variantFromJson) VariantModel? get variant;@JsonKey(fromJson: intFromJson) int get quantity;@JsonKey(fromJson: nullableStringFromJson) String? get color;@JsonKey(fromJson: nullableStringFromJson) String? get colorHex;@JsonKey(fromJson: nullableStringFromJson) String? get size;@JsonKey(fromJson: nullableStringFromJson) String? get metal;@JsonKey(fromJson: nullableStringFromJson) String? get plating;/// Line image chosen by the server: variant image → colour gallery → thumbnail.
@JsonKey(name: 'image', fromJson: nullableStringFromJson) String? get lineImage;@JsonKey(fromJson: doubleFromJson) double get price;@JsonKey(fromJson: doubleFromJson) double get itemTotal;
/// Create a copy of CartItemModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CartItemModelCopyWith<CartItemModel> get copyWith => _$CartItemModelCopyWithImpl<CartItemModel>(this as CartItemModel, _$identity);

  /// Serializes this CartItemModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CartItemModel&&(identical(other.lineId, lineId) || other.lineId == lineId)&&(identical(other.product, product) || other.product == product)&&(identical(other.variant, variant) || other.variant == variant)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.color, color) || other.color == color)&&(identical(other.colorHex, colorHex) || other.colorHex == colorHex)&&(identical(other.size, size) || other.size == size)&&(identical(other.metal, metal) || other.metal == metal)&&(identical(other.plating, plating) || other.plating == plating)&&(identical(other.lineImage, lineImage) || other.lineImage == lineImage)&&(identical(other.price, price) || other.price == price)&&(identical(other.itemTotal, itemTotal) || other.itemTotal == itemTotal));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,lineId,product,variant,quantity,color,colorHex,size,metal,plating,lineImage,price,itemTotal);

@override
String toString() {
  return 'CartItemModel(lineId: $lineId, product: $product, variant: $variant, quantity: $quantity, color: $color, colorHex: $colorHex, size: $size, metal: $metal, plating: $plating, lineImage: $lineImage, price: $price, itemTotal: $itemTotal)';
}


}

/// @nodoc
abstract mixin class $CartItemModelCopyWith<$Res>  {
  factory $CartItemModelCopyWith(CartItemModel value, $Res Function(CartItemModel) _then) = _$CartItemModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? lineId,@JsonKey(fromJson: productFromJson) ProductModel product,@JsonKey(fromJson: variantFromJson) VariantModel? variant,@JsonKey(fromJson: intFromJson) int quantity,@JsonKey(fromJson: nullableStringFromJson) String? color,@JsonKey(fromJson: nullableStringFromJson) String? colorHex,@JsonKey(fromJson: nullableStringFromJson) String? size,@JsonKey(fromJson: nullableStringFromJson) String? metal,@JsonKey(fromJson: nullableStringFromJson) String? plating,@JsonKey(name: 'image', fromJson: nullableStringFromJson) String? lineImage,@JsonKey(fromJson: doubleFromJson) double price,@JsonKey(fromJson: doubleFromJson) double itemTotal
});


$ProductModelCopyWith<$Res> get product;$VariantModelCopyWith<$Res>? get variant;

}
/// @nodoc
class _$CartItemModelCopyWithImpl<$Res>
    implements $CartItemModelCopyWith<$Res> {
  _$CartItemModelCopyWithImpl(this._self, this._then);

  final CartItemModel _self;
  final $Res Function(CartItemModel) _then;

/// Create a copy of CartItemModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? lineId = freezed,Object? product = null,Object? variant = freezed,Object? quantity = null,Object? color = freezed,Object? colorHex = freezed,Object? size = freezed,Object? metal = freezed,Object? plating = freezed,Object? lineImage = freezed,Object? price = null,Object? itemTotal = null,}) {
  return _then(_self.copyWith(
lineId: freezed == lineId ? _self.lineId : lineId // ignore: cast_nullable_to_non_nullable
as String?,product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as ProductModel,variant: freezed == variant ? _self.variant : variant // ignore: cast_nullable_to_non_nullable
as VariantModel?,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,color: freezed == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String?,colorHex: freezed == colorHex ? _self.colorHex : colorHex // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as String?,metal: freezed == metal ? _self.metal : metal // ignore: cast_nullable_to_non_nullable
as String?,plating: freezed == plating ? _self.plating : plating // ignore: cast_nullable_to_non_nullable
as String?,lineImage: freezed == lineImage ? _self.lineImage : lineImage // ignore: cast_nullable_to_non_nullable
as String?,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,itemTotal: null == itemTotal ? _self.itemTotal : itemTotal // ignore: cast_nullable_to_non_nullable
as double,
  ));
}
/// Create a copy of CartItemModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ProductModelCopyWith<$Res> get product {
  
  return $ProductModelCopyWith<$Res>(_self.product, (value) {
    return _then(_self.copyWith(product: value));
  });
}/// Create a copy of CartItemModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$VariantModelCopyWith<$Res>? get variant {
    if (_self.variant == null) {
    return null;
  }

  return $VariantModelCopyWith<$Res>(_self.variant!, (value) {
    return _then(_self.copyWith(variant: value));
  });
}
}


/// Adds pattern-matching-related methods to [CartItemModel].
extension CartItemModelPatterns on CartItemModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CartItemModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CartItemModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CartItemModel value)  $default,){
final _that = this;
switch (_that) {
case _CartItemModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CartItemModel value)?  $default,){
final _that = this;
switch (_that) {
case _CartItemModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? lineId, @JsonKey(fromJson: productFromJson)  ProductModel product, @JsonKey(fromJson: variantFromJson)  VariantModel? variant, @JsonKey(fromJson: intFromJson)  int quantity, @JsonKey(fromJson: nullableStringFromJson)  String? color, @JsonKey(fromJson: nullableStringFromJson)  String? colorHex, @JsonKey(fromJson: nullableStringFromJson)  String? size, @JsonKey(fromJson: nullableStringFromJson)  String? metal, @JsonKey(fromJson: nullableStringFromJson)  String? plating, @JsonKey(name: 'image', fromJson: nullableStringFromJson)  String? lineImage, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: doubleFromJson)  double itemTotal)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CartItemModel() when $default != null:
return $default(_that.lineId,_that.product,_that.variant,_that.quantity,_that.color,_that.colorHex,_that.size,_that.metal,_that.plating,_that.lineImage,_that.price,_that.itemTotal);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: nullableStringFromJson)  String? lineId, @JsonKey(fromJson: productFromJson)  ProductModel product, @JsonKey(fromJson: variantFromJson)  VariantModel? variant, @JsonKey(fromJson: intFromJson)  int quantity, @JsonKey(fromJson: nullableStringFromJson)  String? color, @JsonKey(fromJson: nullableStringFromJson)  String? colorHex, @JsonKey(fromJson: nullableStringFromJson)  String? size, @JsonKey(fromJson: nullableStringFromJson)  String? metal, @JsonKey(fromJson: nullableStringFromJson)  String? plating, @JsonKey(name: 'image', fromJson: nullableStringFromJson)  String? lineImage, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: doubleFromJson)  double itemTotal)  $default,) {final _that = this;
switch (_that) {
case _CartItemModel():
return $default(_that.lineId,_that.product,_that.variant,_that.quantity,_that.color,_that.colorHex,_that.size,_that.metal,_that.plating,_that.lineImage,_that.price,_that.itemTotal);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: nullableStringFromJson)  String? lineId, @JsonKey(fromJson: productFromJson)  ProductModel product, @JsonKey(fromJson: variantFromJson)  VariantModel? variant, @JsonKey(fromJson: intFromJson)  int quantity, @JsonKey(fromJson: nullableStringFromJson)  String? color, @JsonKey(fromJson: nullableStringFromJson)  String? colorHex, @JsonKey(fromJson: nullableStringFromJson)  String? size, @JsonKey(fromJson: nullableStringFromJson)  String? metal, @JsonKey(fromJson: nullableStringFromJson)  String? plating, @JsonKey(name: 'image', fromJson: nullableStringFromJson)  String? lineImage, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: doubleFromJson)  double itemTotal)?  $default,) {final _that = this;
switch (_that) {
case _CartItemModel() when $default != null:
return $default(_that.lineId,_that.product,_that.variant,_that.quantity,_that.color,_that.colorHex,_that.size,_that.metal,_that.plating,_that.lineImage,_that.price,_that.itemTotal);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CartItemModel extends CartItemModel {
  const _CartItemModel({@JsonKey(fromJson: nullableStringFromJson) this.lineId, @JsonKey(fromJson: productFromJson) required this.product, @JsonKey(fromJson: variantFromJson) this.variant, @JsonKey(fromJson: intFromJson) this.quantity = 1, @JsonKey(fromJson: nullableStringFromJson) this.color, @JsonKey(fromJson: nullableStringFromJson) this.colorHex, @JsonKey(fromJson: nullableStringFromJson) this.size, @JsonKey(fromJson: nullableStringFromJson) this.metal, @JsonKey(fromJson: nullableStringFromJson) this.plating, @JsonKey(name: 'image', fromJson: nullableStringFromJson) this.lineImage, @JsonKey(fromJson: doubleFromJson) this.price = 0, @JsonKey(fromJson: doubleFromJson) this.itemTotal = 0}): super._();
  factory _CartItemModel.fromJson(Map<String, dynamic> json) => _$CartItemModelFromJson(json);

/// Server cart line id (absent on guest-cart lines).
@override@JsonKey(fromJson: nullableStringFromJson) final  String? lineId;
@override@JsonKey(fromJson: productFromJson) final  ProductModel product;
@override@JsonKey(fromJson: variantFromJson) final  VariantModel? variant;
@override@JsonKey(fromJson: intFromJson) final  int quantity;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? color;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? colorHex;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? size;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? metal;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? plating;
/// Line image chosen by the server: variant image → colour gallery → thumbnail.
@override@JsonKey(name: 'image', fromJson: nullableStringFromJson) final  String? lineImage;
@override@JsonKey(fromJson: doubleFromJson) final  double price;
@override@JsonKey(fromJson: doubleFromJson) final  double itemTotal;

/// Create a copy of CartItemModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CartItemModelCopyWith<_CartItemModel> get copyWith => __$CartItemModelCopyWithImpl<_CartItemModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CartItemModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CartItemModel&&(identical(other.lineId, lineId) || other.lineId == lineId)&&(identical(other.product, product) || other.product == product)&&(identical(other.variant, variant) || other.variant == variant)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.color, color) || other.color == color)&&(identical(other.colorHex, colorHex) || other.colorHex == colorHex)&&(identical(other.size, size) || other.size == size)&&(identical(other.metal, metal) || other.metal == metal)&&(identical(other.plating, plating) || other.plating == plating)&&(identical(other.lineImage, lineImage) || other.lineImage == lineImage)&&(identical(other.price, price) || other.price == price)&&(identical(other.itemTotal, itemTotal) || other.itemTotal == itemTotal));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,lineId,product,variant,quantity,color,colorHex,size,metal,plating,lineImage,price,itemTotal);

@override
String toString() {
  return 'CartItemModel(lineId: $lineId, product: $product, variant: $variant, quantity: $quantity, color: $color, colorHex: $colorHex, size: $size, metal: $metal, plating: $plating, lineImage: $lineImage, price: $price, itemTotal: $itemTotal)';
}


}

/// @nodoc
abstract mixin class _$CartItemModelCopyWith<$Res> implements $CartItemModelCopyWith<$Res> {
  factory _$CartItemModelCopyWith(_CartItemModel value, $Res Function(_CartItemModel) _then) = __$CartItemModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: nullableStringFromJson) String? lineId,@JsonKey(fromJson: productFromJson) ProductModel product,@JsonKey(fromJson: variantFromJson) VariantModel? variant,@JsonKey(fromJson: intFromJson) int quantity,@JsonKey(fromJson: nullableStringFromJson) String? color,@JsonKey(fromJson: nullableStringFromJson) String? colorHex,@JsonKey(fromJson: nullableStringFromJson) String? size,@JsonKey(fromJson: nullableStringFromJson) String? metal,@JsonKey(fromJson: nullableStringFromJson) String? plating,@JsonKey(name: 'image', fromJson: nullableStringFromJson) String? lineImage,@JsonKey(fromJson: doubleFromJson) double price,@JsonKey(fromJson: doubleFromJson) double itemTotal
});


@override $ProductModelCopyWith<$Res> get product;@override $VariantModelCopyWith<$Res>? get variant;

}
/// @nodoc
class __$CartItemModelCopyWithImpl<$Res>
    implements _$CartItemModelCopyWith<$Res> {
  __$CartItemModelCopyWithImpl(this._self, this._then);

  final _CartItemModel _self;
  final $Res Function(_CartItemModel) _then;

/// Create a copy of CartItemModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? lineId = freezed,Object? product = null,Object? variant = freezed,Object? quantity = null,Object? color = freezed,Object? colorHex = freezed,Object? size = freezed,Object? metal = freezed,Object? plating = freezed,Object? lineImage = freezed,Object? price = null,Object? itemTotal = null,}) {
  return _then(_CartItemModel(
lineId: freezed == lineId ? _self.lineId : lineId // ignore: cast_nullable_to_non_nullable
as String?,product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as ProductModel,variant: freezed == variant ? _self.variant : variant // ignore: cast_nullable_to_non_nullable
as VariantModel?,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,color: freezed == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String?,colorHex: freezed == colorHex ? _self.colorHex : colorHex // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as String?,metal: freezed == metal ? _self.metal : metal // ignore: cast_nullable_to_non_nullable
as String?,plating: freezed == plating ? _self.plating : plating // ignore: cast_nullable_to_non_nullable
as String?,lineImage: freezed == lineImage ? _self.lineImage : lineImage // ignore: cast_nullable_to_non_nullable
as String?,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,itemTotal: null == itemTotal ? _self.itemTotal : itemTotal // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

/// Create a copy of CartItemModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ProductModelCopyWith<$Res> get product {
  
  return $ProductModelCopyWith<$Res>(_self.product, (value) {
    return _then(_self.copyWith(product: value));
  });
}/// Create a copy of CartItemModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$VariantModelCopyWith<$Res>? get variant {
    if (_self.variant == null) {
    return null;
  }

  return $VariantModelCopyWith<$Res>(_self.variant!, (value) {
    return _then(_self.copyWith(variant: value));
  });
}
}

// dart format on
