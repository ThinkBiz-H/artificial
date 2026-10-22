// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'common_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$ImageModel {

@JsonKey(fromJson: stringFromJson) String get url;@JsonKey(fromJson: stringFromJson) String get publicId;
/// Create a copy of ImageModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ImageModelCopyWith<ImageModel> get copyWith => _$ImageModelCopyWithImpl<ImageModel>(this as ImageModel, _$identity);

  /// Serializes this ImageModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ImageModel&&(identical(other.url, url) || other.url == url)&&(identical(other.publicId, publicId) || other.publicId == publicId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,url,publicId);

@override
String toString() {
  return 'ImageModel(url: $url, publicId: $publicId)';
}


}

/// @nodoc
abstract mixin class $ImageModelCopyWith<$Res>  {
  factory $ImageModelCopyWith(ImageModel value, $Res Function(ImageModel) _then) = _$ImageModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String url,@JsonKey(fromJson: stringFromJson) String publicId
});




}
/// @nodoc
class _$ImageModelCopyWithImpl<$Res>
    implements $ImageModelCopyWith<$Res> {
  _$ImageModelCopyWithImpl(this._self, this._then);

  final ImageModel _self;
  final $Res Function(ImageModel) _then;

/// Create a copy of ImageModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? url = null,Object? publicId = null,}) {
  return _then(_self.copyWith(
url: null == url ? _self.url : url // ignore: cast_nullable_to_non_nullable
as String,publicId: null == publicId ? _self.publicId : publicId // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [ImageModel].
extension ImageModelPatterns on ImageModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ImageModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ImageModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ImageModel value)  $default,){
final _that = this;
switch (_that) {
case _ImageModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ImageModel value)?  $default,){
final _that = this;
switch (_that) {
case _ImageModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String url, @JsonKey(fromJson: stringFromJson)  String publicId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ImageModel() when $default != null:
return $default(_that.url,_that.publicId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String url, @JsonKey(fromJson: stringFromJson)  String publicId)  $default,) {final _that = this;
switch (_that) {
case _ImageModel():
return $default(_that.url,_that.publicId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: stringFromJson)  String url, @JsonKey(fromJson: stringFromJson)  String publicId)?  $default,) {final _that = this;
switch (_that) {
case _ImageModel() when $default != null:
return $default(_that.url,_that.publicId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ImageModel extends ImageModel {
  const _ImageModel({@JsonKey(fromJson: stringFromJson) this.url = '', @JsonKey(fromJson: stringFromJson) this.publicId = ''}): super._();
  factory _ImageModel.fromJson(Map<String, dynamic> json) => _$ImageModelFromJson(json);

@override@JsonKey(fromJson: stringFromJson) final  String url;
@override@JsonKey(fromJson: stringFromJson) final  String publicId;

/// Create a copy of ImageModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ImageModelCopyWith<_ImageModel> get copyWith => __$ImageModelCopyWithImpl<_ImageModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ImageModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ImageModel&&(identical(other.url, url) || other.url == url)&&(identical(other.publicId, publicId) || other.publicId == publicId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,url,publicId);

@override
String toString() {
  return 'ImageModel(url: $url, publicId: $publicId)';
}


}

/// @nodoc
abstract mixin class _$ImageModelCopyWith<$Res> implements $ImageModelCopyWith<$Res> {
  factory _$ImageModelCopyWith(_ImageModel value, $Res Function(_ImageModel) _then) = __$ImageModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String url,@JsonKey(fromJson: stringFromJson) String publicId
});




}
/// @nodoc
class __$ImageModelCopyWithImpl<$Res>
    implements _$ImageModelCopyWith<$Res> {
  __$ImageModelCopyWithImpl(this._self, this._then);

  final _ImageModel _self;
  final $Res Function(_ImageModel) _then;

/// Create a copy of ImageModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? url = null,Object? publicId = null,}) {
  return _then(_ImageModel(
url: null == url ? _self.url : url // ignore: cast_nullable_to_non_nullable
as String,publicId: null == publicId ? _self.publicId : publicId // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$RefModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: stringFromJson) String get name;@JsonKey(fromJson: stringFromJson) String get slug;/// Brands only: logo and status (Admin > Brands).
@JsonKey(fromJson: imageFromJson) ImageModel? get logo;@JsonKey(fromJson: stringFromJson) String get status;
/// Create a copy of RefModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RefModelCopyWith<RefModel> get copyWith => _$RefModelCopyWithImpl<RefModel>(this as RefModel, _$identity);

  /// Serializes this RefModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RefModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.logo, logo) || other.logo == logo)&&(identical(other.status, status) || other.status == status));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,logo,status);

@override
String toString() {
  return 'RefModel(id: $id, name: $name, slug: $slug, logo: $logo, status: $status)';
}


}

/// @nodoc
abstract mixin class $RefModelCopyWith<$Res>  {
  factory $RefModelCopyWith(RefModel value, $Res Function(RefModel) _then) = _$RefModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: stringFromJson) String slug,@JsonKey(fromJson: imageFromJson) ImageModel? logo,@JsonKey(fromJson: stringFromJson) String status
});


$ImageModelCopyWith<$Res>? get logo;

}
/// @nodoc
class _$RefModelCopyWithImpl<$Res>
    implements $RefModelCopyWith<$Res> {
  _$RefModelCopyWithImpl(this._self, this._then);

  final RefModel _self;
  final $Res Function(RefModel) _then;

/// Create a copy of RefModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? logo = freezed,Object? status = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,logo: freezed == logo ? _self.logo : logo // ignore: cast_nullable_to_non_nullable
as ImageModel?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,
  ));
}
/// Create a copy of RefModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get logo {
    if (_self.logo == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.logo!, (value) {
    return _then(_self.copyWith(logo: value));
  });
}
}


/// Adds pattern-matching-related methods to [RefModel].
extension RefModelPatterns on RefModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RefModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RefModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RefModel value)  $default,){
final _that = this;
switch (_that) {
case _RefModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RefModel value)?  $default,){
final _that = this;
switch (_that) {
case _RefModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: stringFromJson)  String slug, @JsonKey(fromJson: imageFromJson)  ImageModel? logo, @JsonKey(fromJson: stringFromJson)  String status)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RefModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.logo,_that.status);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: stringFromJson)  String slug, @JsonKey(fromJson: imageFromJson)  ImageModel? logo, @JsonKey(fromJson: stringFromJson)  String status)  $default,) {final _that = this;
switch (_that) {
case _RefModel():
return $default(_that.id,_that.name,_that.slug,_that.logo,_that.status);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: stringFromJson)  String slug, @JsonKey(fromJson: imageFromJson)  ImageModel? logo, @JsonKey(fromJson: stringFromJson)  String status)?  $default,) {final _that = this;
switch (_that) {
case _RefModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.logo,_that.status);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _RefModel implements RefModel {
  const _RefModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: stringFromJson) this.name = '', @JsonKey(fromJson: stringFromJson) this.slug = '', @JsonKey(fromJson: imageFromJson) this.logo, @JsonKey(fromJson: stringFromJson) this.status = 'active'});
  factory _RefModel.fromJson(Map<String, dynamic> json) => _$RefModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: stringFromJson) final  String name;
@override@JsonKey(fromJson: stringFromJson) final  String slug;
/// Brands only: logo and status (Admin > Brands).
@override@JsonKey(fromJson: imageFromJson) final  ImageModel? logo;
@override@JsonKey(fromJson: stringFromJson) final  String status;

/// Create a copy of RefModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RefModelCopyWith<_RefModel> get copyWith => __$RefModelCopyWithImpl<_RefModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$RefModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _RefModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.logo, logo) || other.logo == logo)&&(identical(other.status, status) || other.status == status));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,logo,status);

@override
String toString() {
  return 'RefModel(id: $id, name: $name, slug: $slug, logo: $logo, status: $status)';
}


}

/// @nodoc
abstract mixin class _$RefModelCopyWith<$Res> implements $RefModelCopyWith<$Res> {
  factory _$RefModelCopyWith(_RefModel value, $Res Function(_RefModel) _then) = __$RefModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: stringFromJson) String slug,@JsonKey(fromJson: imageFromJson) ImageModel? logo,@JsonKey(fromJson: stringFromJson) String status
});


@override $ImageModelCopyWith<$Res>? get logo;

}
/// @nodoc
class __$RefModelCopyWithImpl<$Res>
    implements _$RefModelCopyWith<$Res> {
  __$RefModelCopyWithImpl(this._self, this._then);

  final _RefModel _self;
  final $Res Function(_RefModel) _then;

/// Create a copy of RefModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? logo = freezed,Object? status = null,}) {
  return _then(_RefModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,logo: freezed == logo ? _self.logo : logo // ignore: cast_nullable_to_non_nullable
as ImageModel?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

/// Create a copy of RefModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get logo {
    if (_self.logo == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.logo!, (value) {
    return _then(_self.copyWith(logo: value));
  });
}
}


/// @nodoc
mixin _$UnitModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: stringFromJson) String get name;@JsonKey(fromJson: stringFromJson) String get symbol;@JsonKey(fromJson: boolFromJson) bool get allowDecimal;
/// Create a copy of UnitModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UnitModelCopyWith<UnitModel> get copyWith => _$UnitModelCopyWithImpl<UnitModel>(this as UnitModel, _$identity);

  /// Serializes this UnitModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UnitModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.symbol, symbol) || other.symbol == symbol)&&(identical(other.allowDecimal, allowDecimal) || other.allowDecimal == allowDecimal));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,symbol,allowDecimal);

@override
String toString() {
  return 'UnitModel(id: $id, name: $name, symbol: $symbol, allowDecimal: $allowDecimal)';
}


}

/// @nodoc
abstract mixin class $UnitModelCopyWith<$Res>  {
  factory $UnitModelCopyWith(UnitModel value, $Res Function(UnitModel) _then) = _$UnitModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: stringFromJson) String symbol,@JsonKey(fromJson: boolFromJson) bool allowDecimal
});




}
/// @nodoc
class _$UnitModelCopyWithImpl<$Res>
    implements $UnitModelCopyWith<$Res> {
  _$UnitModelCopyWithImpl(this._self, this._then);

  final UnitModel _self;
  final $Res Function(UnitModel) _then;

/// Create a copy of UnitModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? symbol = null,Object? allowDecimal = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,symbol: null == symbol ? _self.symbol : symbol // ignore: cast_nullable_to_non_nullable
as String,allowDecimal: null == allowDecimal ? _self.allowDecimal : allowDecimal // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [UnitModel].
extension UnitModelPatterns on UnitModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UnitModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UnitModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UnitModel value)  $default,){
final _that = this;
switch (_that) {
case _UnitModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UnitModel value)?  $default,){
final _that = this;
switch (_that) {
case _UnitModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: stringFromJson)  String symbol, @JsonKey(fromJson: boolFromJson)  bool allowDecimal)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UnitModel() when $default != null:
return $default(_that.id,_that.name,_that.symbol,_that.allowDecimal);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: stringFromJson)  String symbol, @JsonKey(fromJson: boolFromJson)  bool allowDecimal)  $default,) {final _that = this;
switch (_that) {
case _UnitModel():
return $default(_that.id,_that.name,_that.symbol,_that.allowDecimal);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: stringFromJson)  String symbol, @JsonKey(fromJson: boolFromJson)  bool allowDecimal)?  $default,) {final _that = this;
switch (_that) {
case _UnitModel() when $default != null:
return $default(_that.id,_that.name,_that.symbol,_that.allowDecimal);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _UnitModel implements UnitModel {
  const _UnitModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: stringFromJson) this.name = '', @JsonKey(fromJson: stringFromJson) this.symbol = '', @JsonKey(fromJson: boolFromJson) this.allowDecimal = false});
  factory _UnitModel.fromJson(Map<String, dynamic> json) => _$UnitModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: stringFromJson) final  String name;
@override@JsonKey(fromJson: stringFromJson) final  String symbol;
@override@JsonKey(fromJson: boolFromJson) final  bool allowDecimal;

/// Create a copy of UnitModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UnitModelCopyWith<_UnitModel> get copyWith => __$UnitModelCopyWithImpl<_UnitModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$UnitModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UnitModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.symbol, symbol) || other.symbol == symbol)&&(identical(other.allowDecimal, allowDecimal) || other.allowDecimal == allowDecimal));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,symbol,allowDecimal);

@override
String toString() {
  return 'UnitModel(id: $id, name: $name, symbol: $symbol, allowDecimal: $allowDecimal)';
}


}

/// @nodoc
abstract mixin class _$UnitModelCopyWith<$Res> implements $UnitModelCopyWith<$Res> {
  factory _$UnitModelCopyWith(_UnitModel value, $Res Function(_UnitModel) _then) = __$UnitModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: stringFromJson) String symbol,@JsonKey(fromJson: boolFromJson) bool allowDecimal
});




}
/// @nodoc
class __$UnitModelCopyWithImpl<$Res>
    implements _$UnitModelCopyWith<$Res> {
  __$UnitModelCopyWithImpl(this._self, this._then);

  final _UnitModel _self;
  final $Res Function(_UnitModel) _then;

/// Create a copy of UnitModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? symbol = null,Object? allowDecimal = null,}) {
  return _then(_UnitModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,symbol: null == symbol ? _self.symbol : symbol // ignore: cast_nullable_to_non_nullable
as String,allowDecimal: null == allowDecimal ? _self.allowDecimal : allowDecimal // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$AttributeKV {

@JsonKey(fromJson: stringFromJson) String get key;@JsonKey(fromJson: stringFromJson) String get value;
/// Create a copy of AttributeKV
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AttributeKVCopyWith<AttributeKV> get copyWith => _$AttributeKVCopyWithImpl<AttributeKV>(this as AttributeKV, _$identity);

  /// Serializes this AttributeKV to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AttributeKV&&(identical(other.key, key) || other.key == key)&&(identical(other.value, value) || other.value == value));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,key,value);

@override
String toString() {
  return 'AttributeKV(key: $key, value: $value)';
}


}

/// @nodoc
abstract mixin class $AttributeKVCopyWith<$Res>  {
  factory $AttributeKVCopyWith(AttributeKV value, $Res Function(AttributeKV) _then) = _$AttributeKVCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String key,@JsonKey(fromJson: stringFromJson) String value
});




}
/// @nodoc
class _$AttributeKVCopyWithImpl<$Res>
    implements $AttributeKVCopyWith<$Res> {
  _$AttributeKVCopyWithImpl(this._self, this._then);

  final AttributeKV _self;
  final $Res Function(AttributeKV) _then;

/// Create a copy of AttributeKV
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? key = null,Object? value = null,}) {
  return _then(_self.copyWith(
key: null == key ? _self.key : key // ignore: cast_nullable_to_non_nullable
as String,value: null == value ? _self.value : value // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [AttributeKV].
extension AttributeKVPatterns on AttributeKV {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AttributeKV value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AttributeKV() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AttributeKV value)  $default,){
final _that = this;
switch (_that) {
case _AttributeKV():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AttributeKV value)?  $default,){
final _that = this;
switch (_that) {
case _AttributeKV() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String key, @JsonKey(fromJson: stringFromJson)  String value)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AttributeKV() when $default != null:
return $default(_that.key,_that.value);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String key, @JsonKey(fromJson: stringFromJson)  String value)  $default,) {final _that = this;
switch (_that) {
case _AttributeKV():
return $default(_that.key,_that.value);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: stringFromJson)  String key, @JsonKey(fromJson: stringFromJson)  String value)?  $default,) {final _that = this;
switch (_that) {
case _AttributeKV() when $default != null:
return $default(_that.key,_that.value);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AttributeKV implements AttributeKV {
  const _AttributeKV({@JsonKey(fromJson: stringFromJson) this.key = '', @JsonKey(fromJson: stringFromJson) this.value = ''});
  factory _AttributeKV.fromJson(Map<String, dynamic> json) => _$AttributeKVFromJson(json);

@override@JsonKey(fromJson: stringFromJson) final  String key;
@override@JsonKey(fromJson: stringFromJson) final  String value;

/// Create a copy of AttributeKV
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AttributeKVCopyWith<_AttributeKV> get copyWith => __$AttributeKVCopyWithImpl<_AttributeKV>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AttributeKVToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AttributeKV&&(identical(other.key, key) || other.key == key)&&(identical(other.value, value) || other.value == value));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,key,value);

@override
String toString() {
  return 'AttributeKV(key: $key, value: $value)';
}


}

/// @nodoc
abstract mixin class _$AttributeKVCopyWith<$Res> implements $AttributeKVCopyWith<$Res> {
  factory _$AttributeKVCopyWith(_AttributeKV value, $Res Function(_AttributeKV) _then) = __$AttributeKVCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String key,@JsonKey(fromJson: stringFromJson) String value
});




}
/// @nodoc
class __$AttributeKVCopyWithImpl<$Res>
    implements _$AttributeKVCopyWith<$Res> {
  __$AttributeKVCopyWithImpl(this._self, this._then);

  final _AttributeKV _self;
  final $Res Function(_AttributeKV) _then;

/// Create a copy of AttributeKV
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? key = null,Object? value = null,}) {
  return _then(_AttributeKV(
key: null == key ? _self.key : key // ignore: cast_nullable_to_non_nullable
as String,value: null == value ? _self.value : value // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$Pagination {

@JsonKey(fromJson: intFromJson) int get total;@JsonKey(fromJson: intFromJson) int get page;@JsonKey(fromJson: intFromJson) int get limit;@JsonKey(fromJson: intFromJson) int get totalPages;
/// Create a copy of Pagination
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PaginationCopyWith<Pagination> get copyWith => _$PaginationCopyWithImpl<Pagination>(this as Pagination, _$identity);

  /// Serializes this Pagination to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Pagination&&(identical(other.total, total) || other.total == total)&&(identical(other.page, page) || other.page == page)&&(identical(other.limit, limit) || other.limit == limit)&&(identical(other.totalPages, totalPages) || other.totalPages == totalPages));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,total,page,limit,totalPages);

@override
String toString() {
  return 'Pagination(total: $total, page: $page, limit: $limit, totalPages: $totalPages)';
}


}

/// @nodoc
abstract mixin class $PaginationCopyWith<$Res>  {
  factory $PaginationCopyWith(Pagination value, $Res Function(Pagination) _then) = _$PaginationCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: intFromJson) int total,@JsonKey(fromJson: intFromJson) int page,@JsonKey(fromJson: intFromJson) int limit,@JsonKey(fromJson: intFromJson) int totalPages
});




}
/// @nodoc
class _$PaginationCopyWithImpl<$Res>
    implements $PaginationCopyWith<$Res> {
  _$PaginationCopyWithImpl(this._self, this._then);

  final Pagination _self;
  final $Res Function(Pagination) _then;

/// Create a copy of Pagination
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? total = null,Object? page = null,Object? limit = null,Object? totalPages = null,}) {
  return _then(_self.copyWith(
total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,totalPages: null == totalPages ? _self.totalPages : totalPages // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [Pagination].
extension PaginationPatterns on Pagination {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Pagination value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Pagination() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Pagination value)  $default,){
final _that = this;
switch (_that) {
case _Pagination():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Pagination value)?  $default,){
final _that = this;
switch (_that) {
case _Pagination() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: intFromJson)  int total, @JsonKey(fromJson: intFromJson)  int page, @JsonKey(fromJson: intFromJson)  int limit, @JsonKey(fromJson: intFromJson)  int totalPages)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Pagination() when $default != null:
return $default(_that.total,_that.page,_that.limit,_that.totalPages);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: intFromJson)  int total, @JsonKey(fromJson: intFromJson)  int page, @JsonKey(fromJson: intFromJson)  int limit, @JsonKey(fromJson: intFromJson)  int totalPages)  $default,) {final _that = this;
switch (_that) {
case _Pagination():
return $default(_that.total,_that.page,_that.limit,_that.totalPages);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: intFromJson)  int total, @JsonKey(fromJson: intFromJson)  int page, @JsonKey(fromJson: intFromJson)  int limit, @JsonKey(fromJson: intFromJson)  int totalPages)?  $default,) {final _that = this;
switch (_that) {
case _Pagination() when $default != null:
return $default(_that.total,_that.page,_that.limit,_that.totalPages);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Pagination extends Pagination {
  const _Pagination({@JsonKey(fromJson: intFromJson) this.total = 0, @JsonKey(fromJson: intFromJson) this.page = 1, @JsonKey(fromJson: intFromJson) this.limit = 12, @JsonKey(fromJson: intFromJson) this.totalPages = 0}): super._();
  factory _Pagination.fromJson(Map<String, dynamic> json) => _$PaginationFromJson(json);

@override@JsonKey(fromJson: intFromJson) final  int total;
@override@JsonKey(fromJson: intFromJson) final  int page;
@override@JsonKey(fromJson: intFromJson) final  int limit;
@override@JsonKey(fromJson: intFromJson) final  int totalPages;

/// Create a copy of Pagination
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PaginationCopyWith<_Pagination> get copyWith => __$PaginationCopyWithImpl<_Pagination>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PaginationToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Pagination&&(identical(other.total, total) || other.total == total)&&(identical(other.page, page) || other.page == page)&&(identical(other.limit, limit) || other.limit == limit)&&(identical(other.totalPages, totalPages) || other.totalPages == totalPages));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,total,page,limit,totalPages);

@override
String toString() {
  return 'Pagination(total: $total, page: $page, limit: $limit, totalPages: $totalPages)';
}


}

/// @nodoc
abstract mixin class _$PaginationCopyWith<$Res> implements $PaginationCopyWith<$Res> {
  factory _$PaginationCopyWith(_Pagination value, $Res Function(_Pagination) _then) = __$PaginationCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: intFromJson) int total,@JsonKey(fromJson: intFromJson) int page,@JsonKey(fromJson: intFromJson) int limit,@JsonKey(fromJson: intFromJson) int totalPages
});




}
/// @nodoc
class __$PaginationCopyWithImpl<$Res>
    implements _$PaginationCopyWith<$Res> {
  __$PaginationCopyWithImpl(this._self, this._then);

  final _Pagination _self;
  final $Res Function(_Pagination) _then;

/// Create a copy of Pagination
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? total = null,Object? page = null,Object? limit = null,Object? totalPages = null,}) {
  return _then(_Pagination(
total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,totalPages: null == totalPages ? _self.totalPages : totalPages // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
