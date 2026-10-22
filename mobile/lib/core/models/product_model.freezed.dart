// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'product_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$ColorOptionModel {

@JsonKey(fromJson: stringFromJson) String get name;@JsonKey(fromJson: nullableStringFromJson) String? get hex;@JsonKey(fromJson: imageListFromJson) List<ImageModel> get images;
/// Create a copy of ColorOptionModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ColorOptionModelCopyWith<ColorOptionModel> get copyWith => _$ColorOptionModelCopyWithImpl<ColorOptionModel>(this as ColorOptionModel, _$identity);

  /// Serializes this ColorOptionModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ColorOptionModel&&(identical(other.name, name) || other.name == name)&&(identical(other.hex, hex) || other.hex == hex)&&const DeepCollectionEquality().equals(other.images, images));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,name,hex,const DeepCollectionEquality().hash(images));

@override
String toString() {
  return 'ColorOptionModel(name: $name, hex: $hex, images: $images)';
}


}

/// @nodoc
abstract mixin class $ColorOptionModelCopyWith<$Res>  {
  factory $ColorOptionModelCopyWith(ColorOptionModel value, $Res Function(ColorOptionModel) _then) = _$ColorOptionModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: nullableStringFromJson) String? hex,@JsonKey(fromJson: imageListFromJson) List<ImageModel> images
});




}
/// @nodoc
class _$ColorOptionModelCopyWithImpl<$Res>
    implements $ColorOptionModelCopyWith<$Res> {
  _$ColorOptionModelCopyWithImpl(this._self, this._then);

  final ColorOptionModel _self;
  final $Res Function(ColorOptionModel) _then;

/// Create a copy of ColorOptionModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? name = null,Object? hex = freezed,Object? images = null,}) {
  return _then(_self.copyWith(
name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,hex: freezed == hex ? _self.hex : hex // ignore: cast_nullable_to_non_nullable
as String?,images: null == images ? _self.images : images // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,
  ));
}

}


/// Adds pattern-matching-related methods to [ColorOptionModel].
extension ColorOptionModelPatterns on ColorOptionModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ColorOptionModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ColorOptionModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ColorOptionModel value)  $default,){
final _that = this;
switch (_that) {
case _ColorOptionModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ColorOptionModel value)?  $default,){
final _that = this;
switch (_that) {
case _ColorOptionModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: nullableStringFromJson)  String? hex, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ColorOptionModel() when $default != null:
return $default(_that.name,_that.hex,_that.images);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: nullableStringFromJson)  String? hex, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images)  $default,) {final _that = this;
switch (_that) {
case _ColorOptionModel():
return $default(_that.name,_that.hex,_that.images);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: nullableStringFromJson)  String? hex, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images)?  $default,) {final _that = this;
switch (_that) {
case _ColorOptionModel() when $default != null:
return $default(_that.name,_that.hex,_that.images);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ColorOptionModel implements ColorOptionModel {
  const _ColorOptionModel({@JsonKey(fromJson: stringFromJson) this.name = '', @JsonKey(fromJson: nullableStringFromJson) this.hex, @JsonKey(fromJson: imageListFromJson) final  List<ImageModel> images = const <ImageModel>[]}): _images = images;
  factory _ColorOptionModel.fromJson(Map<String, dynamic> json) => _$ColorOptionModelFromJson(json);

@override@JsonKey(fromJson: stringFromJson) final  String name;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? hex;
 final  List<ImageModel> _images;
@override@JsonKey(fromJson: imageListFromJson) List<ImageModel> get images {
  if (_images is EqualUnmodifiableListView) return _images;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_images);
}


/// Create a copy of ColorOptionModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ColorOptionModelCopyWith<_ColorOptionModel> get copyWith => __$ColorOptionModelCopyWithImpl<_ColorOptionModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ColorOptionModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ColorOptionModel&&(identical(other.name, name) || other.name == name)&&(identical(other.hex, hex) || other.hex == hex)&&const DeepCollectionEquality().equals(other._images, _images));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,name,hex,const DeepCollectionEquality().hash(_images));

@override
String toString() {
  return 'ColorOptionModel(name: $name, hex: $hex, images: $images)';
}


}

/// @nodoc
abstract mixin class _$ColorOptionModelCopyWith<$Res> implements $ColorOptionModelCopyWith<$Res> {
  factory _$ColorOptionModelCopyWith(_ColorOptionModel value, $Res Function(_ColorOptionModel) _then) = __$ColorOptionModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: nullableStringFromJson) String? hex,@JsonKey(fromJson: imageListFromJson) List<ImageModel> images
});




}
/// @nodoc
class __$ColorOptionModelCopyWithImpl<$Res>
    implements _$ColorOptionModelCopyWith<$Res> {
  __$ColorOptionModelCopyWithImpl(this._self, this._then);

  final _ColorOptionModel _self;
  final $Res Function(_ColorOptionModel) _then;

/// Create a copy of ColorOptionModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? name = null,Object? hex = freezed,Object? images = null,}) {
  return _then(_ColorOptionModel(
name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,hex: freezed == hex ? _self.hex : hex // ignore: cast_nullable_to_non_nullable
as String?,images: null == images ? _self._images : images // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,
  ));
}


}


/// @nodoc
mixin _$VariantModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: idFromJson) String get product;@JsonKey(fromJson: attributeListFromJson) List<AttributeKV> get attributes;@JsonKey(fromJson: nullableStringFromJson) String? get color;@JsonKey(fromJson: nullableStringFromJson) String? get colorHex;@JsonKey(fromJson: nullableStringFromJson) String? get size;@JsonKey(fromJson: stringFromJson) String get sku;@JsonKey(fromJson: doubleFromJson) double get price;@JsonKey(fromJson: nullableDoubleFromJson) double? get salePrice;@JsonKey(fromJson: intFromJson) int get stock;@JsonKey(fromJson: unitFromJson) UnitModel? get unit;@JsonKey(fromJson: doubleFromJson) double get unitValue;@JsonKey(fromJson: imageListFromJson) List<ImageModel> get images;@JsonKey(fromJson: stringFromJson) String get status;@JsonKey(fromJson: boolFromJson) bool get isDefault;
/// Create a copy of VariantModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$VariantModelCopyWith<VariantModel> get copyWith => _$VariantModelCopyWithImpl<VariantModel>(this as VariantModel, _$identity);

  /// Serializes this VariantModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is VariantModel&&(identical(other.id, id) || other.id == id)&&(identical(other.product, product) || other.product == product)&&const DeepCollectionEquality().equals(other.attributes, attributes)&&(identical(other.color, color) || other.color == color)&&(identical(other.colorHex, colorHex) || other.colorHex == colorHex)&&(identical(other.size, size) || other.size == size)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.price, price) || other.price == price)&&(identical(other.salePrice, salePrice) || other.salePrice == salePrice)&&(identical(other.stock, stock) || other.stock == stock)&&(identical(other.unit, unit) || other.unit == unit)&&(identical(other.unitValue, unitValue) || other.unitValue == unitValue)&&const DeepCollectionEquality().equals(other.images, images)&&(identical(other.status, status) || other.status == status)&&(identical(other.isDefault, isDefault) || other.isDefault == isDefault));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,product,const DeepCollectionEquality().hash(attributes),color,colorHex,size,sku,price,salePrice,stock,unit,unitValue,const DeepCollectionEquality().hash(images),status,isDefault);

@override
String toString() {
  return 'VariantModel(id: $id, product: $product, attributes: $attributes, color: $color, colorHex: $colorHex, size: $size, sku: $sku, price: $price, salePrice: $salePrice, stock: $stock, unit: $unit, unitValue: $unitValue, images: $images, status: $status, isDefault: $isDefault)';
}


}

/// @nodoc
abstract mixin class $VariantModelCopyWith<$Res>  {
  factory $VariantModelCopyWith(VariantModel value, $Res Function(VariantModel) _then) = _$VariantModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: idFromJson) String product,@JsonKey(fromJson: attributeListFromJson) List<AttributeKV> attributes,@JsonKey(fromJson: nullableStringFromJson) String? color,@JsonKey(fromJson: nullableStringFromJson) String? colorHex,@JsonKey(fromJson: nullableStringFromJson) String? size,@JsonKey(fromJson: stringFromJson) String sku,@JsonKey(fromJson: doubleFromJson) double price,@JsonKey(fromJson: nullableDoubleFromJson) double? salePrice,@JsonKey(fromJson: intFromJson) int stock,@JsonKey(fromJson: unitFromJson) UnitModel? unit,@JsonKey(fromJson: doubleFromJson) double unitValue,@JsonKey(fromJson: imageListFromJson) List<ImageModel> images,@JsonKey(fromJson: stringFromJson) String status,@JsonKey(fromJson: boolFromJson) bool isDefault
});


$UnitModelCopyWith<$Res>? get unit;

}
/// @nodoc
class _$VariantModelCopyWithImpl<$Res>
    implements $VariantModelCopyWith<$Res> {
  _$VariantModelCopyWithImpl(this._self, this._then);

  final VariantModel _self;
  final $Res Function(VariantModel) _then;

/// Create a copy of VariantModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? product = null,Object? attributes = null,Object? color = freezed,Object? colorHex = freezed,Object? size = freezed,Object? sku = null,Object? price = null,Object? salePrice = freezed,Object? stock = null,Object? unit = freezed,Object? unitValue = null,Object? images = null,Object? status = null,Object? isDefault = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as String,attributes: null == attributes ? _self.attributes : attributes // ignore: cast_nullable_to_non_nullable
as List<AttributeKV>,color: freezed == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String?,colorHex: freezed == colorHex ? _self.colorHex : colorHex // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as String?,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,salePrice: freezed == salePrice ? _self.salePrice : salePrice // ignore: cast_nullable_to_non_nullable
as double?,stock: null == stock ? _self.stock : stock // ignore: cast_nullable_to_non_nullable
as int,unit: freezed == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as UnitModel?,unitValue: null == unitValue ? _self.unitValue : unitValue // ignore: cast_nullable_to_non_nullable
as double,images: null == images ? _self.images : images // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,isDefault: null == isDefault ? _self.isDefault : isDefault // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}
/// Create a copy of VariantModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UnitModelCopyWith<$Res>? get unit {
    if (_self.unit == null) {
    return null;
  }

  return $UnitModelCopyWith<$Res>(_self.unit!, (value) {
    return _then(_self.copyWith(unit: value));
  });
}
}


/// Adds pattern-matching-related methods to [VariantModel].
extension VariantModelPatterns on VariantModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _VariantModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _VariantModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _VariantModel value)  $default,){
final _that = this;
switch (_that) {
case _VariantModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _VariantModel value)?  $default,){
final _that = this;
switch (_that) {
case _VariantModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: idFromJson)  String product, @JsonKey(fromJson: attributeListFromJson)  List<AttributeKV> attributes, @JsonKey(fromJson: nullableStringFromJson)  String? color, @JsonKey(fromJson: nullableStringFromJson)  String? colorHex, @JsonKey(fromJson: nullableStringFromJson)  String? size, @JsonKey(fromJson: stringFromJson)  String sku, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: nullableDoubleFromJson)  double? salePrice, @JsonKey(fromJson: intFromJson)  int stock, @JsonKey(fromJson: unitFromJson)  UnitModel? unit, @JsonKey(fromJson: doubleFromJson)  double unitValue, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images, @JsonKey(fromJson: stringFromJson)  String status, @JsonKey(fromJson: boolFromJson)  bool isDefault)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _VariantModel() when $default != null:
return $default(_that.id,_that.product,_that.attributes,_that.color,_that.colorHex,_that.size,_that.sku,_that.price,_that.salePrice,_that.stock,_that.unit,_that.unitValue,_that.images,_that.status,_that.isDefault);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: idFromJson)  String product, @JsonKey(fromJson: attributeListFromJson)  List<AttributeKV> attributes, @JsonKey(fromJson: nullableStringFromJson)  String? color, @JsonKey(fromJson: nullableStringFromJson)  String? colorHex, @JsonKey(fromJson: nullableStringFromJson)  String? size, @JsonKey(fromJson: stringFromJson)  String sku, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: nullableDoubleFromJson)  double? salePrice, @JsonKey(fromJson: intFromJson)  int stock, @JsonKey(fromJson: unitFromJson)  UnitModel? unit, @JsonKey(fromJson: doubleFromJson)  double unitValue, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images, @JsonKey(fromJson: stringFromJson)  String status, @JsonKey(fromJson: boolFromJson)  bool isDefault)  $default,) {final _that = this;
switch (_that) {
case _VariantModel():
return $default(_that.id,_that.product,_that.attributes,_that.color,_that.colorHex,_that.size,_that.sku,_that.price,_that.salePrice,_that.stock,_that.unit,_that.unitValue,_that.images,_that.status,_that.isDefault);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: idFromJson)  String product, @JsonKey(fromJson: attributeListFromJson)  List<AttributeKV> attributes, @JsonKey(fromJson: nullableStringFromJson)  String? color, @JsonKey(fromJson: nullableStringFromJson)  String? colorHex, @JsonKey(fromJson: nullableStringFromJson)  String? size, @JsonKey(fromJson: stringFromJson)  String sku, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: nullableDoubleFromJson)  double? salePrice, @JsonKey(fromJson: intFromJson)  int stock, @JsonKey(fromJson: unitFromJson)  UnitModel? unit, @JsonKey(fromJson: doubleFromJson)  double unitValue, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images, @JsonKey(fromJson: stringFromJson)  String status, @JsonKey(fromJson: boolFromJson)  bool isDefault)?  $default,) {final _that = this;
switch (_that) {
case _VariantModel() when $default != null:
return $default(_that.id,_that.product,_that.attributes,_that.color,_that.colorHex,_that.size,_that.sku,_that.price,_that.salePrice,_that.stock,_that.unit,_that.unitValue,_that.images,_that.status,_that.isDefault);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _VariantModel extends VariantModel {
  const _VariantModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: idFromJson) this.product = '', @JsonKey(fromJson: attributeListFromJson) final  List<AttributeKV> attributes = const <AttributeKV>[], @JsonKey(fromJson: nullableStringFromJson) this.color, @JsonKey(fromJson: nullableStringFromJson) this.colorHex, @JsonKey(fromJson: nullableStringFromJson) this.size, @JsonKey(fromJson: stringFromJson) this.sku = '', @JsonKey(fromJson: doubleFromJson) this.price = 0, @JsonKey(fromJson: nullableDoubleFromJson) this.salePrice, @JsonKey(fromJson: intFromJson) this.stock = 0, @JsonKey(fromJson: unitFromJson) this.unit, @JsonKey(fromJson: doubleFromJson) this.unitValue = 0, @JsonKey(fromJson: imageListFromJson) final  List<ImageModel> images = const <ImageModel>[], @JsonKey(fromJson: stringFromJson) this.status = 'active', @JsonKey(fromJson: boolFromJson) this.isDefault = false}): _attributes = attributes,_images = images,super._();
  factory _VariantModel.fromJson(Map<String, dynamic> json) => _$VariantModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: idFromJson) final  String product;
 final  List<AttributeKV> _attributes;
@override@JsonKey(fromJson: attributeListFromJson) List<AttributeKV> get attributes {
  if (_attributes is EqualUnmodifiableListView) return _attributes;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_attributes);
}

@override@JsonKey(fromJson: nullableStringFromJson) final  String? color;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? colorHex;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? size;
@override@JsonKey(fromJson: stringFromJson) final  String sku;
@override@JsonKey(fromJson: doubleFromJson) final  double price;
@override@JsonKey(fromJson: nullableDoubleFromJson) final  double? salePrice;
@override@JsonKey(fromJson: intFromJson) final  int stock;
@override@JsonKey(fromJson: unitFromJson) final  UnitModel? unit;
@override@JsonKey(fromJson: doubleFromJson) final  double unitValue;
 final  List<ImageModel> _images;
@override@JsonKey(fromJson: imageListFromJson) List<ImageModel> get images {
  if (_images is EqualUnmodifiableListView) return _images;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_images);
}

@override@JsonKey(fromJson: stringFromJson) final  String status;
@override@JsonKey(fromJson: boolFromJson) final  bool isDefault;

/// Create a copy of VariantModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$VariantModelCopyWith<_VariantModel> get copyWith => __$VariantModelCopyWithImpl<_VariantModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$VariantModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _VariantModel&&(identical(other.id, id) || other.id == id)&&(identical(other.product, product) || other.product == product)&&const DeepCollectionEquality().equals(other._attributes, _attributes)&&(identical(other.color, color) || other.color == color)&&(identical(other.colorHex, colorHex) || other.colorHex == colorHex)&&(identical(other.size, size) || other.size == size)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.price, price) || other.price == price)&&(identical(other.salePrice, salePrice) || other.salePrice == salePrice)&&(identical(other.stock, stock) || other.stock == stock)&&(identical(other.unit, unit) || other.unit == unit)&&(identical(other.unitValue, unitValue) || other.unitValue == unitValue)&&const DeepCollectionEquality().equals(other._images, _images)&&(identical(other.status, status) || other.status == status)&&(identical(other.isDefault, isDefault) || other.isDefault == isDefault));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,product,const DeepCollectionEquality().hash(_attributes),color,colorHex,size,sku,price,salePrice,stock,unit,unitValue,const DeepCollectionEquality().hash(_images),status,isDefault);

@override
String toString() {
  return 'VariantModel(id: $id, product: $product, attributes: $attributes, color: $color, colorHex: $colorHex, size: $size, sku: $sku, price: $price, salePrice: $salePrice, stock: $stock, unit: $unit, unitValue: $unitValue, images: $images, status: $status, isDefault: $isDefault)';
}


}

/// @nodoc
abstract mixin class _$VariantModelCopyWith<$Res> implements $VariantModelCopyWith<$Res> {
  factory _$VariantModelCopyWith(_VariantModel value, $Res Function(_VariantModel) _then) = __$VariantModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: idFromJson) String product,@JsonKey(fromJson: attributeListFromJson) List<AttributeKV> attributes,@JsonKey(fromJson: nullableStringFromJson) String? color,@JsonKey(fromJson: nullableStringFromJson) String? colorHex,@JsonKey(fromJson: nullableStringFromJson) String? size,@JsonKey(fromJson: stringFromJson) String sku,@JsonKey(fromJson: doubleFromJson) double price,@JsonKey(fromJson: nullableDoubleFromJson) double? salePrice,@JsonKey(fromJson: intFromJson) int stock,@JsonKey(fromJson: unitFromJson) UnitModel? unit,@JsonKey(fromJson: doubleFromJson) double unitValue,@JsonKey(fromJson: imageListFromJson) List<ImageModel> images,@JsonKey(fromJson: stringFromJson) String status,@JsonKey(fromJson: boolFromJson) bool isDefault
});


@override $UnitModelCopyWith<$Res>? get unit;

}
/// @nodoc
class __$VariantModelCopyWithImpl<$Res>
    implements _$VariantModelCopyWith<$Res> {
  __$VariantModelCopyWithImpl(this._self, this._then);

  final _VariantModel _self;
  final $Res Function(_VariantModel) _then;

/// Create a copy of VariantModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? product = null,Object? attributes = null,Object? color = freezed,Object? colorHex = freezed,Object? size = freezed,Object? sku = null,Object? price = null,Object? salePrice = freezed,Object? stock = null,Object? unit = freezed,Object? unitValue = null,Object? images = null,Object? status = null,Object? isDefault = null,}) {
  return _then(_VariantModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as String,attributes: null == attributes ? _self._attributes : attributes // ignore: cast_nullable_to_non_nullable
as List<AttributeKV>,color: freezed == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String?,colorHex: freezed == colorHex ? _self.colorHex : colorHex // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as String?,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,salePrice: freezed == salePrice ? _self.salePrice : salePrice // ignore: cast_nullable_to_non_nullable
as double?,stock: null == stock ? _self.stock : stock // ignore: cast_nullable_to_non_nullable
as int,unit: freezed == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as UnitModel?,unitValue: null == unitValue ? _self.unitValue : unitValue // ignore: cast_nullable_to_non_nullable
as double,images: null == images ? _self._images : images // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,isDefault: null == isDefault ? _self.isDefault : isDefault // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

/// Create a copy of VariantModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UnitModelCopyWith<$Res>? get unit {
    if (_self.unit == null) {
    return null;
  }

  return $UnitModelCopyWith<$Res>(_self.unit!, (value) {
    return _then(_self.copyWith(unit: value));
  });
}
}


/// @nodoc
mixin _$ReviewModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: idFromJson) String get userId;@JsonKey(fromJson: stringFromJson) String get userName;@JsonKey(fromJson: stringFromJson) String get userImage;@JsonKey(fromJson: doubleFromJson) double get rating;@JsonKey(fromJson: stringFromJson) String get comment;@JsonKey(fromJson: imageListFromJson) List<ImageModel> get images;@JsonKey(fromJson: boolFromJson) bool get isVerifiedPurchase; DateTime? get createdAt;
/// Create a copy of ReviewModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReviewModelCopyWith<ReviewModel> get copyWith => _$ReviewModelCopyWithImpl<ReviewModel>(this as ReviewModel, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReviewModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.userName, userName) || other.userName == userName)&&(identical(other.userImage, userImage) || other.userImage == userImage)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.comment, comment) || other.comment == comment)&&const DeepCollectionEquality().equals(other.images, images)&&(identical(other.isVerifiedPurchase, isVerifiedPurchase) || other.isVerifiedPurchase == isVerifiedPurchase)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,userName,userImage,rating,comment,const DeepCollectionEquality().hash(images),isVerifiedPurchase,createdAt);

@override
String toString() {
  return 'ReviewModel(id: $id, userId: $userId, userName: $userName, userImage: $userImage, rating: $rating, comment: $comment, images: $images, isVerifiedPurchase: $isVerifiedPurchase, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $ReviewModelCopyWith<$Res>  {
  factory $ReviewModelCopyWith(ReviewModel value, $Res Function(ReviewModel) _then) = _$ReviewModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: idFromJson) String userId,@JsonKey(fromJson: stringFromJson) String userName,@JsonKey(fromJson: stringFromJson) String userImage,@JsonKey(fromJson: doubleFromJson) double rating,@JsonKey(fromJson: stringFromJson) String comment,@JsonKey(fromJson: imageListFromJson) List<ImageModel> images,@JsonKey(fromJson: boolFromJson) bool isVerifiedPurchase, DateTime? createdAt
});




}
/// @nodoc
class _$ReviewModelCopyWithImpl<$Res>
    implements $ReviewModelCopyWith<$Res> {
  _$ReviewModelCopyWithImpl(this._self, this._then);

  final ReviewModel _self;
  final $Res Function(ReviewModel) _then;

/// Create a copy of ReviewModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? userId = null,Object? userName = null,Object? userImage = null,Object? rating = null,Object? comment = null,Object? images = null,Object? isVerifiedPurchase = null,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,userName: null == userName ? _self.userName : userName // ignore: cast_nullable_to_non_nullable
as String,userImage: null == userImage ? _self.userImage : userImage // ignore: cast_nullable_to_non_nullable
as String,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as double,comment: null == comment ? _self.comment : comment // ignore: cast_nullable_to_non_nullable
as String,images: null == images ? _self.images : images // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,isVerifiedPurchase: null == isVerifiedPurchase ? _self.isVerifiedPurchase : isVerifiedPurchase // ignore: cast_nullable_to_non_nullable
as bool,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [ReviewModel].
extension ReviewModelPatterns on ReviewModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReviewModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReviewModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReviewModel value)  $default,){
final _that = this;
switch (_that) {
case _ReviewModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReviewModel value)?  $default,){
final _that = this;
switch (_that) {
case _ReviewModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: idFromJson)  String userId, @JsonKey(fromJson: stringFromJson)  String userName, @JsonKey(fromJson: stringFromJson)  String userImage, @JsonKey(fromJson: doubleFromJson)  double rating, @JsonKey(fromJson: stringFromJson)  String comment, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images, @JsonKey(fromJson: boolFromJson)  bool isVerifiedPurchase,  DateTime? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReviewModel() when $default != null:
return $default(_that.id,_that.userId,_that.userName,_that.userImage,_that.rating,_that.comment,_that.images,_that.isVerifiedPurchase,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: idFromJson)  String userId, @JsonKey(fromJson: stringFromJson)  String userName, @JsonKey(fromJson: stringFromJson)  String userImage, @JsonKey(fromJson: doubleFromJson)  double rating, @JsonKey(fromJson: stringFromJson)  String comment, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images, @JsonKey(fromJson: boolFromJson)  bool isVerifiedPurchase,  DateTime? createdAt)  $default,) {final _that = this;
switch (_that) {
case _ReviewModel():
return $default(_that.id,_that.userId,_that.userName,_that.userImage,_that.rating,_that.comment,_that.images,_that.isVerifiedPurchase,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: idFromJson)  String userId, @JsonKey(fromJson: stringFromJson)  String userName, @JsonKey(fromJson: stringFromJson)  String userImage, @JsonKey(fromJson: doubleFromJson)  double rating, @JsonKey(fromJson: stringFromJson)  String comment, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images, @JsonKey(fromJson: boolFromJson)  bool isVerifiedPurchase,  DateTime? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _ReviewModel() when $default != null:
return $default(_that.id,_that.userId,_that.userName,_that.userImage,_that.rating,_that.comment,_that.images,_that.isVerifiedPurchase,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable(createToJson: false)

class _ReviewModel extends ReviewModel {
  const _ReviewModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: idFromJson) this.userId = '', @JsonKey(fromJson: stringFromJson) this.userName = 'Customer', @JsonKey(fromJson: stringFromJson) this.userImage = '', @JsonKey(fromJson: doubleFromJson) this.rating = 0, @JsonKey(fromJson: stringFromJson) this.comment = '', @JsonKey(fromJson: imageListFromJson) final  List<ImageModel> images = const <ImageModel>[], @JsonKey(fromJson: boolFromJson) this.isVerifiedPurchase = false, this.createdAt}): _images = images,super._();
  factory _ReviewModel.fromJson(Map<String, dynamic> json) => _$ReviewModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: idFromJson) final  String userId;
@override@JsonKey(fromJson: stringFromJson) final  String userName;
@override@JsonKey(fromJson: stringFromJson) final  String userImage;
@override@JsonKey(fromJson: doubleFromJson) final  double rating;
@override@JsonKey(fromJson: stringFromJson) final  String comment;
 final  List<ImageModel> _images;
@override@JsonKey(fromJson: imageListFromJson) List<ImageModel> get images {
  if (_images is EqualUnmodifiableListView) return _images;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_images);
}

@override@JsonKey(fromJson: boolFromJson) final  bool isVerifiedPurchase;
@override final  DateTime? createdAt;

/// Create a copy of ReviewModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReviewModelCopyWith<_ReviewModel> get copyWith => __$ReviewModelCopyWithImpl<_ReviewModel>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReviewModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.userName, userName) || other.userName == userName)&&(identical(other.userImage, userImage) || other.userImage == userImage)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.comment, comment) || other.comment == comment)&&const DeepCollectionEquality().equals(other._images, _images)&&(identical(other.isVerifiedPurchase, isVerifiedPurchase) || other.isVerifiedPurchase == isVerifiedPurchase)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,userName,userImage,rating,comment,const DeepCollectionEquality().hash(_images),isVerifiedPurchase,createdAt);

@override
String toString() {
  return 'ReviewModel(id: $id, userId: $userId, userName: $userName, userImage: $userImage, rating: $rating, comment: $comment, images: $images, isVerifiedPurchase: $isVerifiedPurchase, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$ReviewModelCopyWith<$Res> implements $ReviewModelCopyWith<$Res> {
  factory _$ReviewModelCopyWith(_ReviewModel value, $Res Function(_ReviewModel) _then) = __$ReviewModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: idFromJson) String userId,@JsonKey(fromJson: stringFromJson) String userName,@JsonKey(fromJson: stringFromJson) String userImage,@JsonKey(fromJson: doubleFromJson) double rating,@JsonKey(fromJson: stringFromJson) String comment,@JsonKey(fromJson: imageListFromJson) List<ImageModel> images,@JsonKey(fromJson: boolFromJson) bool isVerifiedPurchase, DateTime? createdAt
});




}
/// @nodoc
class __$ReviewModelCopyWithImpl<$Res>
    implements _$ReviewModelCopyWith<$Res> {
  __$ReviewModelCopyWithImpl(this._self, this._then);

  final _ReviewModel _self;
  final $Res Function(_ReviewModel) _then;

/// Create a copy of ReviewModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? userId = null,Object? userName = null,Object? userImage = null,Object? rating = null,Object? comment = null,Object? images = null,Object? isVerifiedPurchase = null,Object? createdAt = freezed,}) {
  return _then(_ReviewModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,userName: null == userName ? _self.userName : userName // ignore: cast_nullable_to_non_nullable
as String,userImage: null == userImage ? _self.userImage : userImage // ignore: cast_nullable_to_non_nullable
as String,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as double,comment: null == comment ? _self.comment : comment // ignore: cast_nullable_to_non_nullable
as String,images: null == images ? _self._images : images // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,isVerifiedPurchase: null == isVerifiedPurchase ? _self.isVerifiedPurchase : isVerifiedPurchase // ignore: cast_nullable_to_non_nullable
as bool,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}


/// @nodoc
mixin _$ProductModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: stringFromJson) String get title;@JsonKey(fromJson: stringFromJson) String get slug;@JsonKey(fromJson: stringFromJson) String get shortDescription;@JsonKey(fromJson: stringFromJson) String get description;@JsonKey(name: 'SKU', fromJson: stringFromJson) String get sku;@JsonKey(fromJson: refFromJson) RefModel? get category;@JsonKey(fromJson: refFromJson) RefModel? get brand;@JsonKey(fromJson: unitFromJson) UnitModel? get unit;@JsonKey(fromJson: doubleFromJson) double get unitValue;@JsonKey(fromJson: doubleFromJson) double get price;@JsonKey(fromJson: nullableDoubleFromJson) double? get salePrice;@JsonKey(fromJson: intFromJson) int get stock;@JsonKey(fromJson: nullableDoubleFromJson) double? get basePrice;@JsonKey(fromJson: doubleFromJson) double get gstRate;@JsonKey(fromJson: nullableDoubleFromJson) double? get gstAmount; bool get priceIncludesGST;@JsonKey(fromJson: imageListFromJson) List<ImageModel> get images;@JsonKey(fromJson: imageFromJson) ImageModel? get thumbnail;@JsonKey(fromJson: stringFromJson) String get videoUrl;@JsonKey(fromJson: stringListFromJson) List<String> get tags;@JsonKey(fromJson: attributeListFromJson) List<AttributeKV> get attributes;@JsonKey(fromJson: colorOptionListFromJson) List<ColorOptionModel> get colorOptions;@JsonKey(fromJson: stringListFromJson) List<String> get colors;@JsonKey(fromJson: stringListFromJson) List<String> get sizes;@JsonKey(fromJson: nullableStringFromJson) String? get metal;@JsonKey(fromJson: nullableStringFromJson) String? get plating;@JsonKey(fromJson: nullableDoubleFromJson) double? get weight;@JsonKey(fromJson: boolFromJson) bool get hasVariants;@JsonKey(fromJson: variantListFromJson) List<VariantModel> get variants;@JsonKey(fromJson: productRefListFromJson, includeToJson: false) List<ProductModel> get crossSell;@JsonKey(fromJson: intFromJson) int get minOrderQuantity;@JsonKey(fromJson: nullableIntFromJson) int? get maxOrderQuantity;@JsonKey(fromJson: stringFromJson) String get warranty;@JsonKey(fromJson: stringFromJson) String get returnPolicy;@JsonKey(fromJson: doubleFromJson) double get rating;@JsonKey(fromJson: intFromJson) int get numReviews;@JsonKey(fromJson: reviewListFromJson, includeToJson: false) List<ReviewModel> get reviews;@JsonKey(fromJson: intFromJson) int get salesCount;@JsonKey(fromJson: boolFromJson) bool get featured;@JsonKey(fromJson: stringFromJson) String get status; DateTime? get createdAt;
/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ProductModelCopyWith<ProductModel> get copyWith => _$ProductModelCopyWithImpl<ProductModel>(this as ProductModel, _$identity);

  /// Serializes this ProductModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ProductModel&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.shortDescription, shortDescription) || other.shortDescription == shortDescription)&&(identical(other.description, description) || other.description == description)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.category, category) || other.category == category)&&(identical(other.brand, brand) || other.brand == brand)&&(identical(other.unit, unit) || other.unit == unit)&&(identical(other.unitValue, unitValue) || other.unitValue == unitValue)&&(identical(other.price, price) || other.price == price)&&(identical(other.salePrice, salePrice) || other.salePrice == salePrice)&&(identical(other.stock, stock) || other.stock == stock)&&(identical(other.basePrice, basePrice) || other.basePrice == basePrice)&&(identical(other.gstRate, gstRate) || other.gstRate == gstRate)&&(identical(other.gstAmount, gstAmount) || other.gstAmount == gstAmount)&&(identical(other.priceIncludesGST, priceIncludesGST) || other.priceIncludesGST == priceIncludesGST)&&const DeepCollectionEquality().equals(other.images, images)&&(identical(other.thumbnail, thumbnail) || other.thumbnail == thumbnail)&&(identical(other.videoUrl, videoUrl) || other.videoUrl == videoUrl)&&const DeepCollectionEquality().equals(other.tags, tags)&&const DeepCollectionEquality().equals(other.attributes, attributes)&&const DeepCollectionEquality().equals(other.colorOptions, colorOptions)&&const DeepCollectionEquality().equals(other.colors, colors)&&const DeepCollectionEquality().equals(other.sizes, sizes)&&(identical(other.metal, metal) || other.metal == metal)&&(identical(other.plating, plating) || other.plating == plating)&&(identical(other.weight, weight) || other.weight == weight)&&(identical(other.hasVariants, hasVariants) || other.hasVariants == hasVariants)&&const DeepCollectionEquality().equals(other.variants, variants)&&const DeepCollectionEquality().equals(other.crossSell, crossSell)&&(identical(other.minOrderQuantity, minOrderQuantity) || other.minOrderQuantity == minOrderQuantity)&&(identical(other.maxOrderQuantity, maxOrderQuantity) || other.maxOrderQuantity == maxOrderQuantity)&&(identical(other.warranty, warranty) || other.warranty == warranty)&&(identical(other.returnPolicy, returnPolicy) || other.returnPolicy == returnPolicy)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.numReviews, numReviews) || other.numReviews == numReviews)&&const DeepCollectionEquality().equals(other.reviews, reviews)&&(identical(other.salesCount, salesCount) || other.salesCount == salesCount)&&(identical(other.featured, featured) || other.featured == featured)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,title,slug,shortDescription,description,sku,category,brand,unit,unitValue,price,salePrice,stock,basePrice,gstRate,gstAmount,priceIncludesGST,const DeepCollectionEquality().hash(images),thumbnail,videoUrl,const DeepCollectionEquality().hash(tags),const DeepCollectionEquality().hash(attributes),const DeepCollectionEquality().hash(colorOptions),const DeepCollectionEquality().hash(colors),const DeepCollectionEquality().hash(sizes),metal,plating,weight,hasVariants,const DeepCollectionEquality().hash(variants),const DeepCollectionEquality().hash(crossSell),minOrderQuantity,maxOrderQuantity,warranty,returnPolicy,rating,numReviews,const DeepCollectionEquality().hash(reviews),salesCount,featured,status,createdAt]);

@override
String toString() {
  return 'ProductModel(id: $id, title: $title, slug: $slug, shortDescription: $shortDescription, description: $description, sku: $sku, category: $category, brand: $brand, unit: $unit, unitValue: $unitValue, price: $price, salePrice: $salePrice, stock: $stock, basePrice: $basePrice, gstRate: $gstRate, gstAmount: $gstAmount, priceIncludesGST: $priceIncludesGST, images: $images, thumbnail: $thumbnail, videoUrl: $videoUrl, tags: $tags, attributes: $attributes, colorOptions: $colorOptions, colors: $colors, sizes: $sizes, metal: $metal, plating: $plating, weight: $weight, hasVariants: $hasVariants, variants: $variants, crossSell: $crossSell, minOrderQuantity: $minOrderQuantity, maxOrderQuantity: $maxOrderQuantity, warranty: $warranty, returnPolicy: $returnPolicy, rating: $rating, numReviews: $numReviews, reviews: $reviews, salesCount: $salesCount, featured: $featured, status: $status, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $ProductModelCopyWith<$Res>  {
  factory $ProductModelCopyWith(ProductModel value, $Res Function(ProductModel) _then) = _$ProductModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String slug,@JsonKey(fromJson: stringFromJson) String shortDescription,@JsonKey(fromJson: stringFromJson) String description,@JsonKey(name: 'SKU', fromJson: stringFromJson) String sku,@JsonKey(fromJson: refFromJson) RefModel? category,@JsonKey(fromJson: refFromJson) RefModel? brand,@JsonKey(fromJson: unitFromJson) UnitModel? unit,@JsonKey(fromJson: doubleFromJson) double unitValue,@JsonKey(fromJson: doubleFromJson) double price,@JsonKey(fromJson: nullableDoubleFromJson) double? salePrice,@JsonKey(fromJson: intFromJson) int stock,@JsonKey(fromJson: nullableDoubleFromJson) double? basePrice,@JsonKey(fromJson: doubleFromJson) double gstRate,@JsonKey(fromJson: nullableDoubleFromJson) double? gstAmount, bool priceIncludesGST,@JsonKey(fromJson: imageListFromJson) List<ImageModel> images,@JsonKey(fromJson: imageFromJson) ImageModel? thumbnail,@JsonKey(fromJson: stringFromJson) String videoUrl,@JsonKey(fromJson: stringListFromJson) List<String> tags,@JsonKey(fromJson: attributeListFromJson) List<AttributeKV> attributes,@JsonKey(fromJson: colorOptionListFromJson) List<ColorOptionModel> colorOptions,@JsonKey(fromJson: stringListFromJson) List<String> colors,@JsonKey(fromJson: stringListFromJson) List<String> sizes,@JsonKey(fromJson: nullableStringFromJson) String? metal,@JsonKey(fromJson: nullableStringFromJson) String? plating,@JsonKey(fromJson: nullableDoubleFromJson) double? weight,@JsonKey(fromJson: boolFromJson) bool hasVariants,@JsonKey(fromJson: variantListFromJson) List<VariantModel> variants,@JsonKey(fromJson: productRefListFromJson, includeToJson: false) List<ProductModel> crossSell,@JsonKey(fromJson: intFromJson) int minOrderQuantity,@JsonKey(fromJson: nullableIntFromJson) int? maxOrderQuantity,@JsonKey(fromJson: stringFromJson) String warranty,@JsonKey(fromJson: stringFromJson) String returnPolicy,@JsonKey(fromJson: doubleFromJson) double rating,@JsonKey(fromJson: intFromJson) int numReviews,@JsonKey(fromJson: reviewListFromJson, includeToJson: false) List<ReviewModel> reviews,@JsonKey(fromJson: intFromJson) int salesCount,@JsonKey(fromJson: boolFromJson) bool featured,@JsonKey(fromJson: stringFromJson) String status, DateTime? createdAt
});


$RefModelCopyWith<$Res>? get category;$RefModelCopyWith<$Res>? get brand;$UnitModelCopyWith<$Res>? get unit;$ImageModelCopyWith<$Res>? get thumbnail;

}
/// @nodoc
class _$ProductModelCopyWithImpl<$Res>
    implements $ProductModelCopyWith<$Res> {
  _$ProductModelCopyWithImpl(this._self, this._then);

  final ProductModel _self;
  final $Res Function(ProductModel) _then;

/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? slug = null,Object? shortDescription = null,Object? description = null,Object? sku = null,Object? category = freezed,Object? brand = freezed,Object? unit = freezed,Object? unitValue = null,Object? price = null,Object? salePrice = freezed,Object? stock = null,Object? basePrice = freezed,Object? gstRate = null,Object? gstAmount = freezed,Object? priceIncludesGST = null,Object? images = null,Object? thumbnail = freezed,Object? videoUrl = null,Object? tags = null,Object? attributes = null,Object? colorOptions = null,Object? colors = null,Object? sizes = null,Object? metal = freezed,Object? plating = freezed,Object? weight = freezed,Object? hasVariants = null,Object? variants = null,Object? crossSell = null,Object? minOrderQuantity = null,Object? maxOrderQuantity = freezed,Object? warranty = null,Object? returnPolicy = null,Object? rating = null,Object? numReviews = null,Object? reviews = null,Object? salesCount = null,Object? featured = null,Object? status = null,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,shortDescription: null == shortDescription ? _self.shortDescription : shortDescription // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as RefModel?,brand: freezed == brand ? _self.brand : brand // ignore: cast_nullable_to_non_nullable
as RefModel?,unit: freezed == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as UnitModel?,unitValue: null == unitValue ? _self.unitValue : unitValue // ignore: cast_nullable_to_non_nullable
as double,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,salePrice: freezed == salePrice ? _self.salePrice : salePrice // ignore: cast_nullable_to_non_nullable
as double?,stock: null == stock ? _self.stock : stock // ignore: cast_nullable_to_non_nullable
as int,basePrice: freezed == basePrice ? _self.basePrice : basePrice // ignore: cast_nullable_to_non_nullable
as double?,gstRate: null == gstRate ? _self.gstRate : gstRate // ignore: cast_nullable_to_non_nullable
as double,gstAmount: freezed == gstAmount ? _self.gstAmount : gstAmount // ignore: cast_nullable_to_non_nullable
as double?,priceIncludesGST: null == priceIncludesGST ? _self.priceIncludesGST : priceIncludesGST // ignore: cast_nullable_to_non_nullable
as bool,images: null == images ? _self.images : images // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,thumbnail: freezed == thumbnail ? _self.thumbnail : thumbnail // ignore: cast_nullable_to_non_nullable
as ImageModel?,videoUrl: null == videoUrl ? _self.videoUrl : videoUrl // ignore: cast_nullable_to_non_nullable
as String,tags: null == tags ? _self.tags : tags // ignore: cast_nullable_to_non_nullable
as List<String>,attributes: null == attributes ? _self.attributes : attributes // ignore: cast_nullable_to_non_nullable
as List<AttributeKV>,colorOptions: null == colorOptions ? _self.colorOptions : colorOptions // ignore: cast_nullable_to_non_nullable
as List<ColorOptionModel>,colors: null == colors ? _self.colors : colors // ignore: cast_nullable_to_non_nullable
as List<String>,sizes: null == sizes ? _self.sizes : sizes // ignore: cast_nullable_to_non_nullable
as List<String>,metal: freezed == metal ? _self.metal : metal // ignore: cast_nullable_to_non_nullable
as String?,plating: freezed == plating ? _self.plating : plating // ignore: cast_nullable_to_non_nullable
as String?,weight: freezed == weight ? _self.weight : weight // ignore: cast_nullable_to_non_nullable
as double?,hasVariants: null == hasVariants ? _self.hasVariants : hasVariants // ignore: cast_nullable_to_non_nullable
as bool,variants: null == variants ? _self.variants : variants // ignore: cast_nullable_to_non_nullable
as List<VariantModel>,crossSell: null == crossSell ? _self.crossSell : crossSell // ignore: cast_nullable_to_non_nullable
as List<ProductModel>,minOrderQuantity: null == minOrderQuantity ? _self.minOrderQuantity : minOrderQuantity // ignore: cast_nullable_to_non_nullable
as int,maxOrderQuantity: freezed == maxOrderQuantity ? _self.maxOrderQuantity : maxOrderQuantity // ignore: cast_nullable_to_non_nullable
as int?,warranty: null == warranty ? _self.warranty : warranty // ignore: cast_nullable_to_non_nullable
as String,returnPolicy: null == returnPolicy ? _self.returnPolicy : returnPolicy // ignore: cast_nullable_to_non_nullable
as String,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as double,numReviews: null == numReviews ? _self.numReviews : numReviews // ignore: cast_nullable_to_non_nullable
as int,reviews: null == reviews ? _self.reviews : reviews // ignore: cast_nullable_to_non_nullable
as List<ReviewModel>,salesCount: null == salesCount ? _self.salesCount : salesCount // ignore: cast_nullable_to_non_nullable
as int,featured: null == featured ? _self.featured : featured // ignore: cast_nullable_to_non_nullable
as bool,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}
/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$RefModelCopyWith<$Res>? get category {
    if (_self.category == null) {
    return null;
  }

  return $RefModelCopyWith<$Res>(_self.category!, (value) {
    return _then(_self.copyWith(category: value));
  });
}/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$RefModelCopyWith<$Res>? get brand {
    if (_self.brand == null) {
    return null;
  }

  return $RefModelCopyWith<$Res>(_self.brand!, (value) {
    return _then(_self.copyWith(brand: value));
  });
}/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UnitModelCopyWith<$Res>? get unit {
    if (_self.unit == null) {
    return null;
  }

  return $UnitModelCopyWith<$Res>(_self.unit!, (value) {
    return _then(_self.copyWith(unit: value));
  });
}/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get thumbnail {
    if (_self.thumbnail == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.thumbnail!, (value) {
    return _then(_self.copyWith(thumbnail: value));
  });
}
}


/// Adds pattern-matching-related methods to [ProductModel].
extension ProductModelPatterns on ProductModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ProductModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ProductModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ProductModel value)  $default,){
final _that = this;
switch (_that) {
case _ProductModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ProductModel value)?  $default,){
final _that = this;
switch (_that) {
case _ProductModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String slug, @JsonKey(fromJson: stringFromJson)  String shortDescription, @JsonKey(fromJson: stringFromJson)  String description, @JsonKey(name: 'SKU', fromJson: stringFromJson)  String sku, @JsonKey(fromJson: refFromJson)  RefModel? category, @JsonKey(fromJson: refFromJson)  RefModel? brand, @JsonKey(fromJson: unitFromJson)  UnitModel? unit, @JsonKey(fromJson: doubleFromJson)  double unitValue, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: nullableDoubleFromJson)  double? salePrice, @JsonKey(fromJson: intFromJson)  int stock, @JsonKey(fromJson: nullableDoubleFromJson)  double? basePrice, @JsonKey(fromJson: doubleFromJson)  double gstRate, @JsonKey(fromJson: nullableDoubleFromJson)  double? gstAmount,  bool priceIncludesGST, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images, @JsonKey(fromJson: imageFromJson)  ImageModel? thumbnail, @JsonKey(fromJson: stringFromJson)  String videoUrl, @JsonKey(fromJson: stringListFromJson)  List<String> tags, @JsonKey(fromJson: attributeListFromJson)  List<AttributeKV> attributes, @JsonKey(fromJson: colorOptionListFromJson)  List<ColorOptionModel> colorOptions, @JsonKey(fromJson: stringListFromJson)  List<String> colors, @JsonKey(fromJson: stringListFromJson)  List<String> sizes, @JsonKey(fromJson: nullableStringFromJson)  String? metal, @JsonKey(fromJson: nullableStringFromJson)  String? plating, @JsonKey(fromJson: nullableDoubleFromJson)  double? weight, @JsonKey(fromJson: boolFromJson)  bool hasVariants, @JsonKey(fromJson: variantListFromJson)  List<VariantModel> variants, @JsonKey(fromJson: productRefListFromJson, includeToJson: false)  List<ProductModel> crossSell, @JsonKey(fromJson: intFromJson)  int minOrderQuantity, @JsonKey(fromJson: nullableIntFromJson)  int? maxOrderQuantity, @JsonKey(fromJson: stringFromJson)  String warranty, @JsonKey(fromJson: stringFromJson)  String returnPolicy, @JsonKey(fromJson: doubleFromJson)  double rating, @JsonKey(fromJson: intFromJson)  int numReviews, @JsonKey(fromJson: reviewListFromJson, includeToJson: false)  List<ReviewModel> reviews, @JsonKey(fromJson: intFromJson)  int salesCount, @JsonKey(fromJson: boolFromJson)  bool featured, @JsonKey(fromJson: stringFromJson)  String status,  DateTime? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ProductModel() when $default != null:
return $default(_that.id,_that.title,_that.slug,_that.shortDescription,_that.description,_that.sku,_that.category,_that.brand,_that.unit,_that.unitValue,_that.price,_that.salePrice,_that.stock,_that.basePrice,_that.gstRate,_that.gstAmount,_that.priceIncludesGST,_that.images,_that.thumbnail,_that.videoUrl,_that.tags,_that.attributes,_that.colorOptions,_that.colors,_that.sizes,_that.metal,_that.plating,_that.weight,_that.hasVariants,_that.variants,_that.crossSell,_that.minOrderQuantity,_that.maxOrderQuantity,_that.warranty,_that.returnPolicy,_that.rating,_that.numReviews,_that.reviews,_that.salesCount,_that.featured,_that.status,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String slug, @JsonKey(fromJson: stringFromJson)  String shortDescription, @JsonKey(fromJson: stringFromJson)  String description, @JsonKey(name: 'SKU', fromJson: stringFromJson)  String sku, @JsonKey(fromJson: refFromJson)  RefModel? category, @JsonKey(fromJson: refFromJson)  RefModel? brand, @JsonKey(fromJson: unitFromJson)  UnitModel? unit, @JsonKey(fromJson: doubleFromJson)  double unitValue, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: nullableDoubleFromJson)  double? salePrice, @JsonKey(fromJson: intFromJson)  int stock, @JsonKey(fromJson: nullableDoubleFromJson)  double? basePrice, @JsonKey(fromJson: doubleFromJson)  double gstRate, @JsonKey(fromJson: nullableDoubleFromJson)  double? gstAmount,  bool priceIncludesGST, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images, @JsonKey(fromJson: imageFromJson)  ImageModel? thumbnail, @JsonKey(fromJson: stringFromJson)  String videoUrl, @JsonKey(fromJson: stringListFromJson)  List<String> tags, @JsonKey(fromJson: attributeListFromJson)  List<AttributeKV> attributes, @JsonKey(fromJson: colorOptionListFromJson)  List<ColorOptionModel> colorOptions, @JsonKey(fromJson: stringListFromJson)  List<String> colors, @JsonKey(fromJson: stringListFromJson)  List<String> sizes, @JsonKey(fromJson: nullableStringFromJson)  String? metal, @JsonKey(fromJson: nullableStringFromJson)  String? plating, @JsonKey(fromJson: nullableDoubleFromJson)  double? weight, @JsonKey(fromJson: boolFromJson)  bool hasVariants, @JsonKey(fromJson: variantListFromJson)  List<VariantModel> variants, @JsonKey(fromJson: productRefListFromJson, includeToJson: false)  List<ProductModel> crossSell, @JsonKey(fromJson: intFromJson)  int minOrderQuantity, @JsonKey(fromJson: nullableIntFromJson)  int? maxOrderQuantity, @JsonKey(fromJson: stringFromJson)  String warranty, @JsonKey(fromJson: stringFromJson)  String returnPolicy, @JsonKey(fromJson: doubleFromJson)  double rating, @JsonKey(fromJson: intFromJson)  int numReviews, @JsonKey(fromJson: reviewListFromJson, includeToJson: false)  List<ReviewModel> reviews, @JsonKey(fromJson: intFromJson)  int salesCount, @JsonKey(fromJson: boolFromJson)  bool featured, @JsonKey(fromJson: stringFromJson)  String status,  DateTime? createdAt)  $default,) {final _that = this;
switch (_that) {
case _ProductModel():
return $default(_that.id,_that.title,_that.slug,_that.shortDescription,_that.description,_that.sku,_that.category,_that.brand,_that.unit,_that.unitValue,_that.price,_that.salePrice,_that.stock,_that.basePrice,_that.gstRate,_that.gstAmount,_that.priceIncludesGST,_that.images,_that.thumbnail,_that.videoUrl,_that.tags,_that.attributes,_that.colorOptions,_that.colors,_that.sizes,_that.metal,_that.plating,_that.weight,_that.hasVariants,_that.variants,_that.crossSell,_that.minOrderQuantity,_that.maxOrderQuantity,_that.warranty,_that.returnPolicy,_that.rating,_that.numReviews,_that.reviews,_that.salesCount,_that.featured,_that.status,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String slug, @JsonKey(fromJson: stringFromJson)  String shortDescription, @JsonKey(fromJson: stringFromJson)  String description, @JsonKey(name: 'SKU', fromJson: stringFromJson)  String sku, @JsonKey(fromJson: refFromJson)  RefModel? category, @JsonKey(fromJson: refFromJson)  RefModel? brand, @JsonKey(fromJson: unitFromJson)  UnitModel? unit, @JsonKey(fromJson: doubleFromJson)  double unitValue, @JsonKey(fromJson: doubleFromJson)  double price, @JsonKey(fromJson: nullableDoubleFromJson)  double? salePrice, @JsonKey(fromJson: intFromJson)  int stock, @JsonKey(fromJson: nullableDoubleFromJson)  double? basePrice, @JsonKey(fromJson: doubleFromJson)  double gstRate, @JsonKey(fromJson: nullableDoubleFromJson)  double? gstAmount,  bool priceIncludesGST, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> images, @JsonKey(fromJson: imageFromJson)  ImageModel? thumbnail, @JsonKey(fromJson: stringFromJson)  String videoUrl, @JsonKey(fromJson: stringListFromJson)  List<String> tags, @JsonKey(fromJson: attributeListFromJson)  List<AttributeKV> attributes, @JsonKey(fromJson: colorOptionListFromJson)  List<ColorOptionModel> colorOptions, @JsonKey(fromJson: stringListFromJson)  List<String> colors, @JsonKey(fromJson: stringListFromJson)  List<String> sizes, @JsonKey(fromJson: nullableStringFromJson)  String? metal, @JsonKey(fromJson: nullableStringFromJson)  String? plating, @JsonKey(fromJson: nullableDoubleFromJson)  double? weight, @JsonKey(fromJson: boolFromJson)  bool hasVariants, @JsonKey(fromJson: variantListFromJson)  List<VariantModel> variants, @JsonKey(fromJson: productRefListFromJson, includeToJson: false)  List<ProductModel> crossSell, @JsonKey(fromJson: intFromJson)  int minOrderQuantity, @JsonKey(fromJson: nullableIntFromJson)  int? maxOrderQuantity, @JsonKey(fromJson: stringFromJson)  String warranty, @JsonKey(fromJson: stringFromJson)  String returnPolicy, @JsonKey(fromJson: doubleFromJson)  double rating, @JsonKey(fromJson: intFromJson)  int numReviews, @JsonKey(fromJson: reviewListFromJson, includeToJson: false)  List<ReviewModel> reviews, @JsonKey(fromJson: intFromJson)  int salesCount, @JsonKey(fromJson: boolFromJson)  bool featured, @JsonKey(fromJson: stringFromJson)  String status,  DateTime? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _ProductModel() when $default != null:
return $default(_that.id,_that.title,_that.slug,_that.shortDescription,_that.description,_that.sku,_that.category,_that.brand,_that.unit,_that.unitValue,_that.price,_that.salePrice,_that.stock,_that.basePrice,_that.gstRate,_that.gstAmount,_that.priceIncludesGST,_that.images,_that.thumbnail,_that.videoUrl,_that.tags,_that.attributes,_that.colorOptions,_that.colors,_that.sizes,_that.metal,_that.plating,_that.weight,_that.hasVariants,_that.variants,_that.crossSell,_that.minOrderQuantity,_that.maxOrderQuantity,_that.warranty,_that.returnPolicy,_that.rating,_that.numReviews,_that.reviews,_that.salesCount,_that.featured,_that.status,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ProductModel extends ProductModel {
  const _ProductModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: stringFromJson) this.title = '', @JsonKey(fromJson: stringFromJson) this.slug = '', @JsonKey(fromJson: stringFromJson) this.shortDescription = '', @JsonKey(fromJson: stringFromJson) this.description = '', @JsonKey(name: 'SKU', fromJson: stringFromJson) this.sku = '', @JsonKey(fromJson: refFromJson) this.category, @JsonKey(fromJson: refFromJson) this.brand, @JsonKey(fromJson: unitFromJson) this.unit, @JsonKey(fromJson: doubleFromJson) this.unitValue = 1, @JsonKey(fromJson: doubleFromJson) this.price = 0, @JsonKey(fromJson: nullableDoubleFromJson) this.salePrice, @JsonKey(fromJson: intFromJson) this.stock = 0, @JsonKey(fromJson: nullableDoubleFromJson) this.basePrice, @JsonKey(fromJson: doubleFromJson) this.gstRate = 18, @JsonKey(fromJson: nullableDoubleFromJson) this.gstAmount, this.priceIncludesGST = true, @JsonKey(fromJson: imageListFromJson) final  List<ImageModel> images = const <ImageModel>[], @JsonKey(fromJson: imageFromJson) this.thumbnail, @JsonKey(fromJson: stringFromJson) this.videoUrl = '', @JsonKey(fromJson: stringListFromJson) final  List<String> tags = const <String>[], @JsonKey(fromJson: attributeListFromJson) final  List<AttributeKV> attributes = const <AttributeKV>[], @JsonKey(fromJson: colorOptionListFromJson) final  List<ColorOptionModel> colorOptions = const <ColorOptionModel>[], @JsonKey(fromJson: stringListFromJson) final  List<String> colors = const <String>[], @JsonKey(fromJson: stringListFromJson) final  List<String> sizes = const <String>[], @JsonKey(fromJson: nullableStringFromJson) this.metal, @JsonKey(fromJson: nullableStringFromJson) this.plating, @JsonKey(fromJson: nullableDoubleFromJson) this.weight, @JsonKey(fromJson: boolFromJson) this.hasVariants = false, @JsonKey(fromJson: variantListFromJson) final  List<VariantModel> variants = const <VariantModel>[], @JsonKey(fromJson: productRefListFromJson, includeToJson: false) final  List<ProductModel> crossSell = const <ProductModel>[], @JsonKey(fromJson: intFromJson) this.minOrderQuantity = 1, @JsonKey(fromJson: nullableIntFromJson) this.maxOrderQuantity, @JsonKey(fromJson: stringFromJson) this.warranty = '', @JsonKey(fromJson: stringFromJson) this.returnPolicy = '', @JsonKey(fromJson: doubleFromJson) this.rating = 0, @JsonKey(fromJson: intFromJson) this.numReviews = 0, @JsonKey(fromJson: reviewListFromJson, includeToJson: false) final  List<ReviewModel> reviews = const <ReviewModel>[], @JsonKey(fromJson: intFromJson) this.salesCount = 0, @JsonKey(fromJson: boolFromJson) this.featured = false, @JsonKey(fromJson: stringFromJson) this.status = 'active', this.createdAt}): _images = images,_tags = tags,_attributes = attributes,_colorOptions = colorOptions,_colors = colors,_sizes = sizes,_variants = variants,_crossSell = crossSell,_reviews = reviews,super._();
  factory _ProductModel.fromJson(Map<String, dynamic> json) => _$ProductModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: stringFromJson) final  String title;
@override@JsonKey(fromJson: stringFromJson) final  String slug;
@override@JsonKey(fromJson: stringFromJson) final  String shortDescription;
@override@JsonKey(fromJson: stringFromJson) final  String description;
@override@JsonKey(name: 'SKU', fromJson: stringFromJson) final  String sku;
@override@JsonKey(fromJson: refFromJson) final  RefModel? category;
@override@JsonKey(fromJson: refFromJson) final  RefModel? brand;
@override@JsonKey(fromJson: unitFromJson) final  UnitModel? unit;
@override@JsonKey(fromJson: doubleFromJson) final  double unitValue;
@override@JsonKey(fromJson: doubleFromJson) final  double price;
@override@JsonKey(fromJson: nullableDoubleFromJson) final  double? salePrice;
@override@JsonKey(fromJson: intFromJson) final  int stock;
@override@JsonKey(fromJson: nullableDoubleFromJson) final  double? basePrice;
@override@JsonKey(fromJson: doubleFromJson) final  double gstRate;
@override@JsonKey(fromJson: nullableDoubleFromJson) final  double? gstAmount;
@override@JsonKey() final  bool priceIncludesGST;
 final  List<ImageModel> _images;
@override@JsonKey(fromJson: imageListFromJson) List<ImageModel> get images {
  if (_images is EqualUnmodifiableListView) return _images;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_images);
}

@override@JsonKey(fromJson: imageFromJson) final  ImageModel? thumbnail;
@override@JsonKey(fromJson: stringFromJson) final  String videoUrl;
 final  List<String> _tags;
@override@JsonKey(fromJson: stringListFromJson) List<String> get tags {
  if (_tags is EqualUnmodifiableListView) return _tags;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_tags);
}

 final  List<AttributeKV> _attributes;
@override@JsonKey(fromJson: attributeListFromJson) List<AttributeKV> get attributes {
  if (_attributes is EqualUnmodifiableListView) return _attributes;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_attributes);
}

 final  List<ColorOptionModel> _colorOptions;
@override@JsonKey(fromJson: colorOptionListFromJson) List<ColorOptionModel> get colorOptions {
  if (_colorOptions is EqualUnmodifiableListView) return _colorOptions;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_colorOptions);
}

 final  List<String> _colors;
@override@JsonKey(fromJson: stringListFromJson) List<String> get colors {
  if (_colors is EqualUnmodifiableListView) return _colors;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_colors);
}

 final  List<String> _sizes;
@override@JsonKey(fromJson: stringListFromJson) List<String> get sizes {
  if (_sizes is EqualUnmodifiableListView) return _sizes;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_sizes);
}

@override@JsonKey(fromJson: nullableStringFromJson) final  String? metal;
@override@JsonKey(fromJson: nullableStringFromJson) final  String? plating;
@override@JsonKey(fromJson: nullableDoubleFromJson) final  double? weight;
@override@JsonKey(fromJson: boolFromJson) final  bool hasVariants;
 final  List<VariantModel> _variants;
@override@JsonKey(fromJson: variantListFromJson) List<VariantModel> get variants {
  if (_variants is EqualUnmodifiableListView) return _variants;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_variants);
}

 final  List<ProductModel> _crossSell;
@override@JsonKey(fromJson: productRefListFromJson, includeToJson: false) List<ProductModel> get crossSell {
  if (_crossSell is EqualUnmodifiableListView) return _crossSell;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_crossSell);
}

@override@JsonKey(fromJson: intFromJson) final  int minOrderQuantity;
@override@JsonKey(fromJson: nullableIntFromJson) final  int? maxOrderQuantity;
@override@JsonKey(fromJson: stringFromJson) final  String warranty;
@override@JsonKey(fromJson: stringFromJson) final  String returnPolicy;
@override@JsonKey(fromJson: doubleFromJson) final  double rating;
@override@JsonKey(fromJson: intFromJson) final  int numReviews;
 final  List<ReviewModel> _reviews;
@override@JsonKey(fromJson: reviewListFromJson, includeToJson: false) List<ReviewModel> get reviews {
  if (_reviews is EqualUnmodifiableListView) return _reviews;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_reviews);
}

@override@JsonKey(fromJson: intFromJson) final  int salesCount;
@override@JsonKey(fromJson: boolFromJson) final  bool featured;
@override@JsonKey(fromJson: stringFromJson) final  String status;
@override final  DateTime? createdAt;

/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ProductModelCopyWith<_ProductModel> get copyWith => __$ProductModelCopyWithImpl<_ProductModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ProductModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ProductModel&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.shortDescription, shortDescription) || other.shortDescription == shortDescription)&&(identical(other.description, description) || other.description == description)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.category, category) || other.category == category)&&(identical(other.brand, brand) || other.brand == brand)&&(identical(other.unit, unit) || other.unit == unit)&&(identical(other.unitValue, unitValue) || other.unitValue == unitValue)&&(identical(other.price, price) || other.price == price)&&(identical(other.salePrice, salePrice) || other.salePrice == salePrice)&&(identical(other.stock, stock) || other.stock == stock)&&(identical(other.basePrice, basePrice) || other.basePrice == basePrice)&&(identical(other.gstRate, gstRate) || other.gstRate == gstRate)&&(identical(other.gstAmount, gstAmount) || other.gstAmount == gstAmount)&&(identical(other.priceIncludesGST, priceIncludesGST) || other.priceIncludesGST == priceIncludesGST)&&const DeepCollectionEquality().equals(other._images, _images)&&(identical(other.thumbnail, thumbnail) || other.thumbnail == thumbnail)&&(identical(other.videoUrl, videoUrl) || other.videoUrl == videoUrl)&&const DeepCollectionEquality().equals(other._tags, _tags)&&const DeepCollectionEquality().equals(other._attributes, _attributes)&&const DeepCollectionEquality().equals(other._colorOptions, _colorOptions)&&const DeepCollectionEquality().equals(other._colors, _colors)&&const DeepCollectionEquality().equals(other._sizes, _sizes)&&(identical(other.metal, metal) || other.metal == metal)&&(identical(other.plating, plating) || other.plating == plating)&&(identical(other.weight, weight) || other.weight == weight)&&(identical(other.hasVariants, hasVariants) || other.hasVariants == hasVariants)&&const DeepCollectionEquality().equals(other._variants, _variants)&&const DeepCollectionEquality().equals(other._crossSell, _crossSell)&&(identical(other.minOrderQuantity, minOrderQuantity) || other.minOrderQuantity == minOrderQuantity)&&(identical(other.maxOrderQuantity, maxOrderQuantity) || other.maxOrderQuantity == maxOrderQuantity)&&(identical(other.warranty, warranty) || other.warranty == warranty)&&(identical(other.returnPolicy, returnPolicy) || other.returnPolicy == returnPolicy)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.numReviews, numReviews) || other.numReviews == numReviews)&&const DeepCollectionEquality().equals(other._reviews, _reviews)&&(identical(other.salesCount, salesCount) || other.salesCount == salesCount)&&(identical(other.featured, featured) || other.featured == featured)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,title,slug,shortDescription,description,sku,category,brand,unit,unitValue,price,salePrice,stock,basePrice,gstRate,gstAmount,priceIncludesGST,const DeepCollectionEquality().hash(_images),thumbnail,videoUrl,const DeepCollectionEquality().hash(_tags),const DeepCollectionEquality().hash(_attributes),const DeepCollectionEquality().hash(_colorOptions),const DeepCollectionEquality().hash(_colors),const DeepCollectionEquality().hash(_sizes),metal,plating,weight,hasVariants,const DeepCollectionEquality().hash(_variants),const DeepCollectionEquality().hash(_crossSell),minOrderQuantity,maxOrderQuantity,warranty,returnPolicy,rating,numReviews,const DeepCollectionEquality().hash(_reviews),salesCount,featured,status,createdAt]);

@override
String toString() {
  return 'ProductModel(id: $id, title: $title, slug: $slug, shortDescription: $shortDescription, description: $description, sku: $sku, category: $category, brand: $brand, unit: $unit, unitValue: $unitValue, price: $price, salePrice: $salePrice, stock: $stock, basePrice: $basePrice, gstRate: $gstRate, gstAmount: $gstAmount, priceIncludesGST: $priceIncludesGST, images: $images, thumbnail: $thumbnail, videoUrl: $videoUrl, tags: $tags, attributes: $attributes, colorOptions: $colorOptions, colors: $colors, sizes: $sizes, metal: $metal, plating: $plating, weight: $weight, hasVariants: $hasVariants, variants: $variants, crossSell: $crossSell, minOrderQuantity: $minOrderQuantity, maxOrderQuantity: $maxOrderQuantity, warranty: $warranty, returnPolicy: $returnPolicy, rating: $rating, numReviews: $numReviews, reviews: $reviews, salesCount: $salesCount, featured: $featured, status: $status, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$ProductModelCopyWith<$Res> implements $ProductModelCopyWith<$Res> {
  factory _$ProductModelCopyWith(_ProductModel value, $Res Function(_ProductModel) _then) = __$ProductModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String slug,@JsonKey(fromJson: stringFromJson) String shortDescription,@JsonKey(fromJson: stringFromJson) String description,@JsonKey(name: 'SKU', fromJson: stringFromJson) String sku,@JsonKey(fromJson: refFromJson) RefModel? category,@JsonKey(fromJson: refFromJson) RefModel? brand,@JsonKey(fromJson: unitFromJson) UnitModel? unit,@JsonKey(fromJson: doubleFromJson) double unitValue,@JsonKey(fromJson: doubleFromJson) double price,@JsonKey(fromJson: nullableDoubleFromJson) double? salePrice,@JsonKey(fromJson: intFromJson) int stock,@JsonKey(fromJson: nullableDoubleFromJson) double? basePrice,@JsonKey(fromJson: doubleFromJson) double gstRate,@JsonKey(fromJson: nullableDoubleFromJson) double? gstAmount, bool priceIncludesGST,@JsonKey(fromJson: imageListFromJson) List<ImageModel> images,@JsonKey(fromJson: imageFromJson) ImageModel? thumbnail,@JsonKey(fromJson: stringFromJson) String videoUrl,@JsonKey(fromJson: stringListFromJson) List<String> tags,@JsonKey(fromJson: attributeListFromJson) List<AttributeKV> attributes,@JsonKey(fromJson: colorOptionListFromJson) List<ColorOptionModel> colorOptions,@JsonKey(fromJson: stringListFromJson) List<String> colors,@JsonKey(fromJson: stringListFromJson) List<String> sizes,@JsonKey(fromJson: nullableStringFromJson) String? metal,@JsonKey(fromJson: nullableStringFromJson) String? plating,@JsonKey(fromJson: nullableDoubleFromJson) double? weight,@JsonKey(fromJson: boolFromJson) bool hasVariants,@JsonKey(fromJson: variantListFromJson) List<VariantModel> variants,@JsonKey(fromJson: productRefListFromJson, includeToJson: false) List<ProductModel> crossSell,@JsonKey(fromJson: intFromJson) int minOrderQuantity,@JsonKey(fromJson: nullableIntFromJson) int? maxOrderQuantity,@JsonKey(fromJson: stringFromJson) String warranty,@JsonKey(fromJson: stringFromJson) String returnPolicy,@JsonKey(fromJson: doubleFromJson) double rating,@JsonKey(fromJson: intFromJson) int numReviews,@JsonKey(fromJson: reviewListFromJson, includeToJson: false) List<ReviewModel> reviews,@JsonKey(fromJson: intFromJson) int salesCount,@JsonKey(fromJson: boolFromJson) bool featured,@JsonKey(fromJson: stringFromJson) String status, DateTime? createdAt
});


@override $RefModelCopyWith<$Res>? get category;@override $RefModelCopyWith<$Res>? get brand;@override $UnitModelCopyWith<$Res>? get unit;@override $ImageModelCopyWith<$Res>? get thumbnail;

}
/// @nodoc
class __$ProductModelCopyWithImpl<$Res>
    implements _$ProductModelCopyWith<$Res> {
  __$ProductModelCopyWithImpl(this._self, this._then);

  final _ProductModel _self;
  final $Res Function(_ProductModel) _then;

/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? slug = null,Object? shortDescription = null,Object? description = null,Object? sku = null,Object? category = freezed,Object? brand = freezed,Object? unit = freezed,Object? unitValue = null,Object? price = null,Object? salePrice = freezed,Object? stock = null,Object? basePrice = freezed,Object? gstRate = null,Object? gstAmount = freezed,Object? priceIncludesGST = null,Object? images = null,Object? thumbnail = freezed,Object? videoUrl = null,Object? tags = null,Object? attributes = null,Object? colorOptions = null,Object? colors = null,Object? sizes = null,Object? metal = freezed,Object? plating = freezed,Object? weight = freezed,Object? hasVariants = null,Object? variants = null,Object? crossSell = null,Object? minOrderQuantity = null,Object? maxOrderQuantity = freezed,Object? warranty = null,Object? returnPolicy = null,Object? rating = null,Object? numReviews = null,Object? reviews = null,Object? salesCount = null,Object? featured = null,Object? status = null,Object? createdAt = freezed,}) {
  return _then(_ProductModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,shortDescription: null == shortDescription ? _self.shortDescription : shortDescription // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as RefModel?,brand: freezed == brand ? _self.brand : brand // ignore: cast_nullable_to_non_nullable
as RefModel?,unit: freezed == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as UnitModel?,unitValue: null == unitValue ? _self.unitValue : unitValue // ignore: cast_nullable_to_non_nullable
as double,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,salePrice: freezed == salePrice ? _self.salePrice : salePrice // ignore: cast_nullable_to_non_nullable
as double?,stock: null == stock ? _self.stock : stock // ignore: cast_nullable_to_non_nullable
as int,basePrice: freezed == basePrice ? _self.basePrice : basePrice // ignore: cast_nullable_to_non_nullable
as double?,gstRate: null == gstRate ? _self.gstRate : gstRate // ignore: cast_nullable_to_non_nullable
as double,gstAmount: freezed == gstAmount ? _self.gstAmount : gstAmount // ignore: cast_nullable_to_non_nullable
as double?,priceIncludesGST: null == priceIncludesGST ? _self.priceIncludesGST : priceIncludesGST // ignore: cast_nullable_to_non_nullable
as bool,images: null == images ? _self._images : images // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,thumbnail: freezed == thumbnail ? _self.thumbnail : thumbnail // ignore: cast_nullable_to_non_nullable
as ImageModel?,videoUrl: null == videoUrl ? _self.videoUrl : videoUrl // ignore: cast_nullable_to_non_nullable
as String,tags: null == tags ? _self._tags : tags // ignore: cast_nullable_to_non_nullable
as List<String>,attributes: null == attributes ? _self._attributes : attributes // ignore: cast_nullable_to_non_nullable
as List<AttributeKV>,colorOptions: null == colorOptions ? _self._colorOptions : colorOptions // ignore: cast_nullable_to_non_nullable
as List<ColorOptionModel>,colors: null == colors ? _self._colors : colors // ignore: cast_nullable_to_non_nullable
as List<String>,sizes: null == sizes ? _self._sizes : sizes // ignore: cast_nullable_to_non_nullable
as List<String>,metal: freezed == metal ? _self.metal : metal // ignore: cast_nullable_to_non_nullable
as String?,plating: freezed == plating ? _self.plating : plating // ignore: cast_nullable_to_non_nullable
as String?,weight: freezed == weight ? _self.weight : weight // ignore: cast_nullable_to_non_nullable
as double?,hasVariants: null == hasVariants ? _self.hasVariants : hasVariants // ignore: cast_nullable_to_non_nullable
as bool,variants: null == variants ? _self._variants : variants // ignore: cast_nullable_to_non_nullable
as List<VariantModel>,crossSell: null == crossSell ? _self._crossSell : crossSell // ignore: cast_nullable_to_non_nullable
as List<ProductModel>,minOrderQuantity: null == minOrderQuantity ? _self.minOrderQuantity : minOrderQuantity // ignore: cast_nullable_to_non_nullable
as int,maxOrderQuantity: freezed == maxOrderQuantity ? _self.maxOrderQuantity : maxOrderQuantity // ignore: cast_nullable_to_non_nullable
as int?,warranty: null == warranty ? _self.warranty : warranty // ignore: cast_nullable_to_non_nullable
as String,returnPolicy: null == returnPolicy ? _self.returnPolicy : returnPolicy // ignore: cast_nullable_to_non_nullable
as String,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as double,numReviews: null == numReviews ? _self.numReviews : numReviews // ignore: cast_nullable_to_non_nullable
as int,reviews: null == reviews ? _self._reviews : reviews // ignore: cast_nullable_to_non_nullable
as List<ReviewModel>,salesCount: null == salesCount ? _self.salesCount : salesCount // ignore: cast_nullable_to_non_nullable
as int,featured: null == featured ? _self.featured : featured // ignore: cast_nullable_to_non_nullable
as bool,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$RefModelCopyWith<$Res>? get category {
    if (_self.category == null) {
    return null;
  }

  return $RefModelCopyWith<$Res>(_self.category!, (value) {
    return _then(_self.copyWith(category: value));
  });
}/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$RefModelCopyWith<$Res>? get brand {
    if (_self.brand == null) {
    return null;
  }

  return $RefModelCopyWith<$Res>(_self.brand!, (value) {
    return _then(_self.copyWith(brand: value));
  });
}/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UnitModelCopyWith<$Res>? get unit {
    if (_self.unit == null) {
    return null;
  }

  return $UnitModelCopyWith<$Res>(_self.unit!, (value) {
    return _then(_self.copyWith(unit: value));
  });
}/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get thumbnail {
    if (_self.thumbnail == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.thumbnail!, (value) {
    return _then(_self.copyWith(thumbnail: value));
  });
}
}

// dart format on
