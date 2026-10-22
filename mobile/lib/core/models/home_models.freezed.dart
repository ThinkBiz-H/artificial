// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'home_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$SlideModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: imageFromJson) ImageModel? get desktopImage;@JsonKey(fromJson: imageFromJson) ImageModel? get mobileImage;@JsonKey(fromJson: stringFromJson) String get title;@JsonKey(fromJson: stringFromJson) String get subtitle;@JsonKey(fromJson: stringFromJson) String get description;@JsonKey(fromJson: stringFromJson) String get buttonText;@JsonKey(fromJson: stringFromJson) String get buttonLink;@JsonKey(fromJson: intFromJson) int get order; bool get active;
/// Create a copy of SlideModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SlideModelCopyWith<SlideModel> get copyWith => _$SlideModelCopyWithImpl<SlideModel>(this as SlideModel, _$identity);

  /// Serializes this SlideModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SlideModel&&(identical(other.id, id) || other.id == id)&&(identical(other.desktopImage, desktopImage) || other.desktopImage == desktopImage)&&(identical(other.mobileImage, mobileImage) || other.mobileImage == mobileImage)&&(identical(other.title, title) || other.title == title)&&(identical(other.subtitle, subtitle) || other.subtitle == subtitle)&&(identical(other.description, description) || other.description == description)&&(identical(other.buttonText, buttonText) || other.buttonText == buttonText)&&(identical(other.buttonLink, buttonLink) || other.buttonLink == buttonLink)&&(identical(other.order, order) || other.order == order)&&(identical(other.active, active) || other.active == active));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,desktopImage,mobileImage,title,subtitle,description,buttonText,buttonLink,order,active);

@override
String toString() {
  return 'SlideModel(id: $id, desktopImage: $desktopImage, mobileImage: $mobileImage, title: $title, subtitle: $subtitle, description: $description, buttonText: $buttonText, buttonLink: $buttonLink, order: $order, active: $active)';
}


}

/// @nodoc
abstract mixin class $SlideModelCopyWith<$Res>  {
  factory $SlideModelCopyWith(SlideModel value, $Res Function(SlideModel) _then) = _$SlideModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: imageFromJson) ImageModel? desktopImage,@JsonKey(fromJson: imageFromJson) ImageModel? mobileImage,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String subtitle,@JsonKey(fromJson: stringFromJson) String description,@JsonKey(fromJson: stringFromJson) String buttonText,@JsonKey(fromJson: stringFromJson) String buttonLink,@JsonKey(fromJson: intFromJson) int order, bool active
});


$ImageModelCopyWith<$Res>? get desktopImage;$ImageModelCopyWith<$Res>? get mobileImage;

}
/// @nodoc
class _$SlideModelCopyWithImpl<$Res>
    implements $SlideModelCopyWith<$Res> {
  _$SlideModelCopyWithImpl(this._self, this._then);

  final SlideModel _self;
  final $Res Function(SlideModel) _then;

/// Create a copy of SlideModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? desktopImage = freezed,Object? mobileImage = freezed,Object? title = null,Object? subtitle = null,Object? description = null,Object? buttonText = null,Object? buttonLink = null,Object? order = null,Object? active = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,desktopImage: freezed == desktopImage ? _self.desktopImage : desktopImage // ignore: cast_nullable_to_non_nullable
as ImageModel?,mobileImage: freezed == mobileImage ? _self.mobileImage : mobileImage // ignore: cast_nullable_to_non_nullable
as ImageModel?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,subtitle: null == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,buttonText: null == buttonText ? _self.buttonText : buttonText // ignore: cast_nullable_to_non_nullable
as String,buttonLink: null == buttonLink ? _self.buttonLink : buttonLink // ignore: cast_nullable_to_non_nullable
as String,order: null == order ? _self.order : order // ignore: cast_nullable_to_non_nullable
as int,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}
/// Create a copy of SlideModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get desktopImage {
    if (_self.desktopImage == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.desktopImage!, (value) {
    return _then(_self.copyWith(desktopImage: value));
  });
}/// Create a copy of SlideModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get mobileImage {
    if (_self.mobileImage == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.mobileImage!, (value) {
    return _then(_self.copyWith(mobileImage: value));
  });
}
}


/// Adds pattern-matching-related methods to [SlideModel].
extension SlideModelPatterns on SlideModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SlideModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SlideModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SlideModel value)  $default,){
final _that = this;
switch (_that) {
case _SlideModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SlideModel value)?  $default,){
final _that = this;
switch (_that) {
case _SlideModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: imageFromJson)  ImageModel? desktopImage, @JsonKey(fromJson: imageFromJson)  ImageModel? mobileImage, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String subtitle, @JsonKey(fromJson: stringFromJson)  String description, @JsonKey(fromJson: stringFromJson)  String buttonText, @JsonKey(fromJson: stringFromJson)  String buttonLink, @JsonKey(fromJson: intFromJson)  int order,  bool active)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SlideModel() when $default != null:
return $default(_that.id,_that.desktopImage,_that.mobileImage,_that.title,_that.subtitle,_that.description,_that.buttonText,_that.buttonLink,_that.order,_that.active);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: imageFromJson)  ImageModel? desktopImage, @JsonKey(fromJson: imageFromJson)  ImageModel? mobileImage, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String subtitle, @JsonKey(fromJson: stringFromJson)  String description, @JsonKey(fromJson: stringFromJson)  String buttonText, @JsonKey(fromJson: stringFromJson)  String buttonLink, @JsonKey(fromJson: intFromJson)  int order,  bool active)  $default,) {final _that = this;
switch (_that) {
case _SlideModel():
return $default(_that.id,_that.desktopImage,_that.mobileImage,_that.title,_that.subtitle,_that.description,_that.buttonText,_that.buttonLink,_that.order,_that.active);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: imageFromJson)  ImageModel? desktopImage, @JsonKey(fromJson: imageFromJson)  ImageModel? mobileImage, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String subtitle, @JsonKey(fromJson: stringFromJson)  String description, @JsonKey(fromJson: stringFromJson)  String buttonText, @JsonKey(fromJson: stringFromJson)  String buttonLink, @JsonKey(fromJson: intFromJson)  int order,  bool active)?  $default,) {final _that = this;
switch (_that) {
case _SlideModel() when $default != null:
return $default(_that.id,_that.desktopImage,_that.mobileImage,_that.title,_that.subtitle,_that.description,_that.buttonText,_that.buttonLink,_that.order,_that.active);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SlideModel extends SlideModel {
  const _SlideModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: imageFromJson) this.desktopImage, @JsonKey(fromJson: imageFromJson) this.mobileImage, @JsonKey(fromJson: stringFromJson) this.title = '', @JsonKey(fromJson: stringFromJson) this.subtitle = '', @JsonKey(fromJson: stringFromJson) this.description = '', @JsonKey(fromJson: stringFromJson) this.buttonText = '', @JsonKey(fromJson: stringFromJson) this.buttonLink = '', @JsonKey(fromJson: intFromJson) this.order = 0, this.active = true}): super._();
  factory _SlideModel.fromJson(Map<String, dynamic> json) => _$SlideModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: imageFromJson) final  ImageModel? desktopImage;
@override@JsonKey(fromJson: imageFromJson) final  ImageModel? mobileImage;
@override@JsonKey(fromJson: stringFromJson) final  String title;
@override@JsonKey(fromJson: stringFromJson) final  String subtitle;
@override@JsonKey(fromJson: stringFromJson) final  String description;
@override@JsonKey(fromJson: stringFromJson) final  String buttonText;
@override@JsonKey(fromJson: stringFromJson) final  String buttonLink;
@override@JsonKey(fromJson: intFromJson) final  int order;
@override@JsonKey() final  bool active;

/// Create a copy of SlideModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SlideModelCopyWith<_SlideModel> get copyWith => __$SlideModelCopyWithImpl<_SlideModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SlideModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SlideModel&&(identical(other.id, id) || other.id == id)&&(identical(other.desktopImage, desktopImage) || other.desktopImage == desktopImage)&&(identical(other.mobileImage, mobileImage) || other.mobileImage == mobileImage)&&(identical(other.title, title) || other.title == title)&&(identical(other.subtitle, subtitle) || other.subtitle == subtitle)&&(identical(other.description, description) || other.description == description)&&(identical(other.buttonText, buttonText) || other.buttonText == buttonText)&&(identical(other.buttonLink, buttonLink) || other.buttonLink == buttonLink)&&(identical(other.order, order) || other.order == order)&&(identical(other.active, active) || other.active == active));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,desktopImage,mobileImage,title,subtitle,description,buttonText,buttonLink,order,active);

@override
String toString() {
  return 'SlideModel(id: $id, desktopImage: $desktopImage, mobileImage: $mobileImage, title: $title, subtitle: $subtitle, description: $description, buttonText: $buttonText, buttonLink: $buttonLink, order: $order, active: $active)';
}


}

/// @nodoc
abstract mixin class _$SlideModelCopyWith<$Res> implements $SlideModelCopyWith<$Res> {
  factory _$SlideModelCopyWith(_SlideModel value, $Res Function(_SlideModel) _then) = __$SlideModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: imageFromJson) ImageModel? desktopImage,@JsonKey(fromJson: imageFromJson) ImageModel? mobileImage,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String subtitle,@JsonKey(fromJson: stringFromJson) String description,@JsonKey(fromJson: stringFromJson) String buttonText,@JsonKey(fromJson: stringFromJson) String buttonLink,@JsonKey(fromJson: intFromJson) int order, bool active
});


@override $ImageModelCopyWith<$Res>? get desktopImage;@override $ImageModelCopyWith<$Res>? get mobileImage;

}
/// @nodoc
class __$SlideModelCopyWithImpl<$Res>
    implements _$SlideModelCopyWith<$Res> {
  __$SlideModelCopyWithImpl(this._self, this._then);

  final _SlideModel _self;
  final $Res Function(_SlideModel) _then;

/// Create a copy of SlideModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? desktopImage = freezed,Object? mobileImage = freezed,Object? title = null,Object? subtitle = null,Object? description = null,Object? buttonText = null,Object? buttonLink = null,Object? order = null,Object? active = null,}) {
  return _then(_SlideModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,desktopImage: freezed == desktopImage ? _self.desktopImage : desktopImage // ignore: cast_nullable_to_non_nullable
as ImageModel?,mobileImage: freezed == mobileImage ? _self.mobileImage : mobileImage // ignore: cast_nullable_to_non_nullable
as ImageModel?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,subtitle: null == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,buttonText: null == buttonText ? _self.buttonText : buttonText // ignore: cast_nullable_to_non_nullable
as String,buttonLink: null == buttonLink ? _self.buttonLink : buttonLink // ignore: cast_nullable_to_non_nullable
as String,order: null == order ? _self.order : order // ignore: cast_nullable_to_non_nullable
as int,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

/// Create a copy of SlideModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get desktopImage {
    if (_self.desktopImage == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.desktopImage!, (value) {
    return _then(_self.copyWith(desktopImage: value));
  });
}/// Create a copy of SlideModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get mobileImage {
    if (_self.mobileImage == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.mobileImage!, (value) {
    return _then(_self.copyWith(mobileImage: value));
  });
}
}


/// @nodoc
mixin _$ReelModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: imageFromJson) ImageModel? get video;@JsonKey(fromJson: imageFromJson) ImageModel? get thumbnail;@JsonKey(fromJson: stringFromJson) String get title;@JsonKey(fromJson: stringFromJson) String get link;@JsonKey(fromJson: intFromJson) int get order; bool get active;
/// Create a copy of ReelModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelModelCopyWith<ReelModel> get copyWith => _$ReelModelCopyWithImpl<ReelModel>(this as ReelModel, _$identity);

  /// Serializes this ReelModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelModel&&(identical(other.id, id) || other.id == id)&&(identical(other.video, video) || other.video == video)&&(identical(other.thumbnail, thumbnail) || other.thumbnail == thumbnail)&&(identical(other.title, title) || other.title == title)&&(identical(other.link, link) || other.link == link)&&(identical(other.order, order) || other.order == order)&&(identical(other.active, active) || other.active == active));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,video,thumbnail,title,link,order,active);

@override
String toString() {
  return 'ReelModel(id: $id, video: $video, thumbnail: $thumbnail, title: $title, link: $link, order: $order, active: $active)';
}


}

/// @nodoc
abstract mixin class $ReelModelCopyWith<$Res>  {
  factory $ReelModelCopyWith(ReelModel value, $Res Function(ReelModel) _then) = _$ReelModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: imageFromJson) ImageModel? video,@JsonKey(fromJson: imageFromJson) ImageModel? thumbnail,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String link,@JsonKey(fromJson: intFromJson) int order, bool active
});


$ImageModelCopyWith<$Res>? get video;$ImageModelCopyWith<$Res>? get thumbnail;

}
/// @nodoc
class _$ReelModelCopyWithImpl<$Res>
    implements $ReelModelCopyWith<$Res> {
  _$ReelModelCopyWithImpl(this._self, this._then);

  final ReelModel _self;
  final $Res Function(ReelModel) _then;

/// Create a copy of ReelModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? video = freezed,Object? thumbnail = freezed,Object? title = null,Object? link = null,Object? order = null,Object? active = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,video: freezed == video ? _self.video : video // ignore: cast_nullable_to_non_nullable
as ImageModel?,thumbnail: freezed == thumbnail ? _self.thumbnail : thumbnail // ignore: cast_nullable_to_non_nullable
as ImageModel?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,link: null == link ? _self.link : link // ignore: cast_nullable_to_non_nullable
as String,order: null == order ? _self.order : order // ignore: cast_nullable_to_non_nullable
as int,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}
/// Create a copy of ReelModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get video {
    if (_self.video == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.video!, (value) {
    return _then(_self.copyWith(video: value));
  });
}/// Create a copy of ReelModel
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


/// Adds pattern-matching-related methods to [ReelModel].
extension ReelModelPatterns on ReelModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReelModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReelModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReelModel value)  $default,){
final _that = this;
switch (_that) {
case _ReelModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReelModel value)?  $default,){
final _that = this;
switch (_that) {
case _ReelModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: imageFromJson)  ImageModel? video, @JsonKey(fromJson: imageFromJson)  ImageModel? thumbnail, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String link, @JsonKey(fromJson: intFromJson)  int order,  bool active)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReelModel() when $default != null:
return $default(_that.id,_that.video,_that.thumbnail,_that.title,_that.link,_that.order,_that.active);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: imageFromJson)  ImageModel? video, @JsonKey(fromJson: imageFromJson)  ImageModel? thumbnail, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String link, @JsonKey(fromJson: intFromJson)  int order,  bool active)  $default,) {final _that = this;
switch (_that) {
case _ReelModel():
return $default(_that.id,_that.video,_that.thumbnail,_that.title,_that.link,_that.order,_that.active);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: imageFromJson)  ImageModel? video, @JsonKey(fromJson: imageFromJson)  ImageModel? thumbnail, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String link, @JsonKey(fromJson: intFromJson)  int order,  bool active)?  $default,) {final _that = this;
switch (_that) {
case _ReelModel() when $default != null:
return $default(_that.id,_that.video,_that.thumbnail,_that.title,_that.link,_that.order,_that.active);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ReelModel implements ReelModel {
  const _ReelModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: imageFromJson) this.video, @JsonKey(fromJson: imageFromJson) this.thumbnail, @JsonKey(fromJson: stringFromJson) this.title = '', @JsonKey(fromJson: stringFromJson) this.link = '', @JsonKey(fromJson: intFromJson) this.order = 0, this.active = true});
  factory _ReelModel.fromJson(Map<String, dynamic> json) => _$ReelModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: imageFromJson) final  ImageModel? video;
@override@JsonKey(fromJson: imageFromJson) final  ImageModel? thumbnail;
@override@JsonKey(fromJson: stringFromJson) final  String title;
@override@JsonKey(fromJson: stringFromJson) final  String link;
@override@JsonKey(fromJson: intFromJson) final  int order;
@override@JsonKey() final  bool active;

/// Create a copy of ReelModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReelModelCopyWith<_ReelModel> get copyWith => __$ReelModelCopyWithImpl<_ReelModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ReelModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReelModel&&(identical(other.id, id) || other.id == id)&&(identical(other.video, video) || other.video == video)&&(identical(other.thumbnail, thumbnail) || other.thumbnail == thumbnail)&&(identical(other.title, title) || other.title == title)&&(identical(other.link, link) || other.link == link)&&(identical(other.order, order) || other.order == order)&&(identical(other.active, active) || other.active == active));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,video,thumbnail,title,link,order,active);

@override
String toString() {
  return 'ReelModel(id: $id, video: $video, thumbnail: $thumbnail, title: $title, link: $link, order: $order, active: $active)';
}


}

/// @nodoc
abstract mixin class _$ReelModelCopyWith<$Res> implements $ReelModelCopyWith<$Res> {
  factory _$ReelModelCopyWith(_ReelModel value, $Res Function(_ReelModel) _then) = __$ReelModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: imageFromJson) ImageModel? video,@JsonKey(fromJson: imageFromJson) ImageModel? thumbnail,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String link,@JsonKey(fromJson: intFromJson) int order, bool active
});


@override $ImageModelCopyWith<$Res>? get video;@override $ImageModelCopyWith<$Res>? get thumbnail;

}
/// @nodoc
class __$ReelModelCopyWithImpl<$Res>
    implements _$ReelModelCopyWith<$Res> {
  __$ReelModelCopyWithImpl(this._self, this._then);

  final _ReelModel _self;
  final $Res Function(_ReelModel) _then;

/// Create a copy of ReelModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? video = freezed,Object? thumbnail = freezed,Object? title = null,Object? link = null,Object? order = null,Object? active = null,}) {
  return _then(_ReelModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,video: freezed == video ? _self.video : video // ignore: cast_nullable_to_non_nullable
as ImageModel?,thumbnail: freezed == thumbnail ? _self.thumbnail : thumbnail // ignore: cast_nullable_to_non_nullable
as ImageModel?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,link: null == link ? _self.link : link // ignore: cast_nullable_to_non_nullable
as String,order: null == order ? _self.order : order // ignore: cast_nullable_to_non_nullable
as int,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

/// Create a copy of ReelModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get video {
    if (_self.video == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.video!, (value) {
    return _then(_self.copyWith(video: value));
  });
}/// Create a copy of ReelModel
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


/// @nodoc
mixin _$SectionButton {

@JsonKey(fromJson: stringFromJson) String get label;@JsonKey(fromJson: stringFromJson) String get link;
/// Create a copy of SectionButton
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SectionButtonCopyWith<SectionButton> get copyWith => _$SectionButtonCopyWithImpl<SectionButton>(this as SectionButton, _$identity);

  /// Serializes this SectionButton to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SectionButton&&(identical(other.label, label) || other.label == label)&&(identical(other.link, link) || other.link == link));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,label,link);

@override
String toString() {
  return 'SectionButton(label: $label, link: $link)';
}


}

/// @nodoc
abstract mixin class $SectionButtonCopyWith<$Res>  {
  factory $SectionButtonCopyWith(SectionButton value, $Res Function(SectionButton) _then) = _$SectionButtonCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String label,@JsonKey(fromJson: stringFromJson) String link
});




}
/// @nodoc
class _$SectionButtonCopyWithImpl<$Res>
    implements $SectionButtonCopyWith<$Res> {
  _$SectionButtonCopyWithImpl(this._self, this._then);

  final SectionButton _self;
  final $Res Function(SectionButton) _then;

/// Create a copy of SectionButton
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? label = null,Object? link = null,}) {
  return _then(_self.copyWith(
label: null == label ? _self.label : label // ignore: cast_nullable_to_non_nullable
as String,link: null == link ? _self.link : link // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [SectionButton].
extension SectionButtonPatterns on SectionButton {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SectionButton value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SectionButton() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SectionButton value)  $default,){
final _that = this;
switch (_that) {
case _SectionButton():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SectionButton value)?  $default,){
final _that = this;
switch (_that) {
case _SectionButton() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String label, @JsonKey(fromJson: stringFromJson)  String link)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SectionButton() when $default != null:
return $default(_that.label,_that.link);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: stringFromJson)  String label, @JsonKey(fromJson: stringFromJson)  String link)  $default,) {final _that = this;
switch (_that) {
case _SectionButton():
return $default(_that.label,_that.link);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: stringFromJson)  String label, @JsonKey(fromJson: stringFromJson)  String link)?  $default,) {final _that = this;
switch (_that) {
case _SectionButton() when $default != null:
return $default(_that.label,_that.link);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SectionButton implements SectionButton {
  const _SectionButton({@JsonKey(fromJson: stringFromJson) this.label = '', @JsonKey(fromJson: stringFromJson) this.link = ''});
  factory _SectionButton.fromJson(Map<String, dynamic> json) => _$SectionButtonFromJson(json);

@override@JsonKey(fromJson: stringFromJson) final  String label;
@override@JsonKey(fromJson: stringFromJson) final  String link;

/// Create a copy of SectionButton
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SectionButtonCopyWith<_SectionButton> get copyWith => __$SectionButtonCopyWithImpl<_SectionButton>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SectionButtonToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SectionButton&&(identical(other.label, label) || other.label == label)&&(identical(other.link, link) || other.link == link));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,label,link);

@override
String toString() {
  return 'SectionButton(label: $label, link: $link)';
}


}

/// @nodoc
abstract mixin class _$SectionButtonCopyWith<$Res> implements $SectionButtonCopyWith<$Res> {
  factory _$SectionButtonCopyWith(_SectionButton value, $Res Function(_SectionButton) _then) = __$SectionButtonCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: stringFromJson) String label,@JsonKey(fromJson: stringFromJson) String link
});




}
/// @nodoc
class __$SectionButtonCopyWithImpl<$Res>
    implements _$SectionButtonCopyWith<$Res> {
  __$SectionButtonCopyWithImpl(this._self, this._then);

  final _SectionButton _self;
  final $Res Function(_SectionButton) _then;

/// Create a copy of SectionButton
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? label = null,Object? link = null,}) {
  return _then(_SectionButton(
label: null == label ? _self.label : label // ignore: cast_nullable_to_non_nullable
as String,link: null == link ? _self.link : link // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$HomeSectionModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: stringFromJson) String get type;@JsonKey(fromJson: stringFromJson) String get title;@JsonKey(fromJson: stringFromJson) String get subtitle;@JsonKey(fromJson: stringFromJson) String get content;@JsonKey(fromJson: imageFromJson) ImageModel? get image;@JsonKey(fromJson: imageListFromJson) List<ImageModel> get gallery;@JsonKey(fromJson: imageListFromJson) List<ImageModel> get videos; SectionButton? get button;@JsonKey(fromJson: dynamicMapFromJson) Map<String, dynamic> get config;@JsonKey(fromJson: intFromJson) int get sortOrder; List<SlideModel> get slides; List<ReelModel> get reels;
/// Create a copy of HomeSectionModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$HomeSectionModelCopyWith<HomeSectionModel> get copyWith => _$HomeSectionModelCopyWithImpl<HomeSectionModel>(this as HomeSectionModel, _$identity);

  /// Serializes this HomeSectionModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is HomeSectionModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.title, title) || other.title == title)&&(identical(other.subtitle, subtitle) || other.subtitle == subtitle)&&(identical(other.content, content) || other.content == content)&&(identical(other.image, image) || other.image == image)&&const DeepCollectionEquality().equals(other.gallery, gallery)&&const DeepCollectionEquality().equals(other.videos, videos)&&(identical(other.button, button) || other.button == button)&&const DeepCollectionEquality().equals(other.config, config)&&(identical(other.sortOrder, sortOrder) || other.sortOrder == sortOrder)&&const DeepCollectionEquality().equals(other.slides, slides)&&const DeepCollectionEquality().equals(other.reels, reels));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,title,subtitle,content,image,const DeepCollectionEquality().hash(gallery),const DeepCollectionEquality().hash(videos),button,const DeepCollectionEquality().hash(config),sortOrder,const DeepCollectionEquality().hash(slides),const DeepCollectionEquality().hash(reels));

@override
String toString() {
  return 'HomeSectionModel(id: $id, type: $type, title: $title, subtitle: $subtitle, content: $content, image: $image, gallery: $gallery, videos: $videos, button: $button, config: $config, sortOrder: $sortOrder, slides: $slides, reels: $reels)';
}


}

/// @nodoc
abstract mixin class $HomeSectionModelCopyWith<$Res>  {
  factory $HomeSectionModelCopyWith(HomeSectionModel value, $Res Function(HomeSectionModel) _then) = _$HomeSectionModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String type,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String subtitle,@JsonKey(fromJson: stringFromJson) String content,@JsonKey(fromJson: imageFromJson) ImageModel? image,@JsonKey(fromJson: imageListFromJson) List<ImageModel> gallery,@JsonKey(fromJson: imageListFromJson) List<ImageModel> videos, SectionButton? button,@JsonKey(fromJson: dynamicMapFromJson) Map<String, dynamic> config,@JsonKey(fromJson: intFromJson) int sortOrder, List<SlideModel> slides, List<ReelModel> reels
});


$ImageModelCopyWith<$Res>? get image;$SectionButtonCopyWith<$Res>? get button;

}
/// @nodoc
class _$HomeSectionModelCopyWithImpl<$Res>
    implements $HomeSectionModelCopyWith<$Res> {
  _$HomeSectionModelCopyWithImpl(this._self, this._then);

  final HomeSectionModel _self;
  final $Res Function(HomeSectionModel) _then;

/// Create a copy of HomeSectionModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? type = null,Object? title = null,Object? subtitle = null,Object? content = null,Object? image = freezed,Object? gallery = null,Object? videos = null,Object? button = freezed,Object? config = null,Object? sortOrder = null,Object? slides = null,Object? reels = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,subtitle: null == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String,content: null == content ? _self.content : content // ignore: cast_nullable_to_non_nullable
as String,image: freezed == image ? _self.image : image // ignore: cast_nullable_to_non_nullable
as ImageModel?,gallery: null == gallery ? _self.gallery : gallery // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,videos: null == videos ? _self.videos : videos // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,button: freezed == button ? _self.button : button // ignore: cast_nullable_to_non_nullable
as SectionButton?,config: null == config ? _self.config : config // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>,sortOrder: null == sortOrder ? _self.sortOrder : sortOrder // ignore: cast_nullable_to_non_nullable
as int,slides: null == slides ? _self.slides : slides // ignore: cast_nullable_to_non_nullable
as List<SlideModel>,reels: null == reels ? _self.reels : reels // ignore: cast_nullable_to_non_nullable
as List<ReelModel>,
  ));
}
/// Create a copy of HomeSectionModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get image {
    if (_self.image == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.image!, (value) {
    return _then(_self.copyWith(image: value));
  });
}/// Create a copy of HomeSectionModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$SectionButtonCopyWith<$Res>? get button {
    if (_self.button == null) {
    return null;
  }

  return $SectionButtonCopyWith<$Res>(_self.button!, (value) {
    return _then(_self.copyWith(button: value));
  });
}
}


/// Adds pattern-matching-related methods to [HomeSectionModel].
extension HomeSectionModelPatterns on HomeSectionModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _HomeSectionModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _HomeSectionModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _HomeSectionModel value)  $default,){
final _that = this;
switch (_that) {
case _HomeSectionModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _HomeSectionModel value)?  $default,){
final _that = this;
switch (_that) {
case _HomeSectionModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String type, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String subtitle, @JsonKey(fromJson: stringFromJson)  String content, @JsonKey(fromJson: imageFromJson)  ImageModel? image, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> gallery, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> videos,  SectionButton? button, @JsonKey(fromJson: dynamicMapFromJson)  Map<String, dynamic> config, @JsonKey(fromJson: intFromJson)  int sortOrder,  List<SlideModel> slides,  List<ReelModel> reels)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _HomeSectionModel() when $default != null:
return $default(_that.id,_that.type,_that.title,_that.subtitle,_that.content,_that.image,_that.gallery,_that.videos,_that.button,_that.config,_that.sortOrder,_that.slides,_that.reels);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String type, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String subtitle, @JsonKey(fromJson: stringFromJson)  String content, @JsonKey(fromJson: imageFromJson)  ImageModel? image, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> gallery, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> videos,  SectionButton? button, @JsonKey(fromJson: dynamicMapFromJson)  Map<String, dynamic> config, @JsonKey(fromJson: intFromJson)  int sortOrder,  List<SlideModel> slides,  List<ReelModel> reels)  $default,) {final _that = this;
switch (_that) {
case _HomeSectionModel():
return $default(_that.id,_that.type,_that.title,_that.subtitle,_that.content,_that.image,_that.gallery,_that.videos,_that.button,_that.config,_that.sortOrder,_that.slides,_that.reels);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String type, @JsonKey(fromJson: stringFromJson)  String title, @JsonKey(fromJson: stringFromJson)  String subtitle, @JsonKey(fromJson: stringFromJson)  String content, @JsonKey(fromJson: imageFromJson)  ImageModel? image, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> gallery, @JsonKey(fromJson: imageListFromJson)  List<ImageModel> videos,  SectionButton? button, @JsonKey(fromJson: dynamicMapFromJson)  Map<String, dynamic> config, @JsonKey(fromJson: intFromJson)  int sortOrder,  List<SlideModel> slides,  List<ReelModel> reels)?  $default,) {final _that = this;
switch (_that) {
case _HomeSectionModel() when $default != null:
return $default(_that.id,_that.type,_that.title,_that.subtitle,_that.content,_that.image,_that.gallery,_that.videos,_that.button,_that.config,_that.sortOrder,_that.slides,_that.reels);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _HomeSectionModel extends HomeSectionModel {
  const _HomeSectionModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: stringFromJson) this.type = '', @JsonKey(fromJson: stringFromJson) this.title = '', @JsonKey(fromJson: stringFromJson) this.subtitle = '', @JsonKey(fromJson: stringFromJson) this.content = '', @JsonKey(fromJson: imageFromJson) this.image, @JsonKey(fromJson: imageListFromJson) final  List<ImageModel> gallery = const <ImageModel>[], @JsonKey(fromJson: imageListFromJson) final  List<ImageModel> videos = const <ImageModel>[], this.button, @JsonKey(fromJson: dynamicMapFromJson) final  Map<String, dynamic> config = const <String, dynamic>{}, @JsonKey(fromJson: intFromJson) this.sortOrder = 0, final  List<SlideModel> slides = const <SlideModel>[], final  List<ReelModel> reels = const <ReelModel>[]}): _gallery = gallery,_videos = videos,_config = config,_slides = slides,_reels = reels,super._();
  factory _HomeSectionModel.fromJson(Map<String, dynamic> json) => _$HomeSectionModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: stringFromJson) final  String type;
@override@JsonKey(fromJson: stringFromJson) final  String title;
@override@JsonKey(fromJson: stringFromJson) final  String subtitle;
@override@JsonKey(fromJson: stringFromJson) final  String content;
@override@JsonKey(fromJson: imageFromJson) final  ImageModel? image;
 final  List<ImageModel> _gallery;
@override@JsonKey(fromJson: imageListFromJson) List<ImageModel> get gallery {
  if (_gallery is EqualUnmodifiableListView) return _gallery;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_gallery);
}

 final  List<ImageModel> _videos;
@override@JsonKey(fromJson: imageListFromJson) List<ImageModel> get videos {
  if (_videos is EqualUnmodifiableListView) return _videos;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_videos);
}

@override final  SectionButton? button;
 final  Map<String, dynamic> _config;
@override@JsonKey(fromJson: dynamicMapFromJson) Map<String, dynamic> get config {
  if (_config is EqualUnmodifiableMapView) return _config;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(_config);
}

@override@JsonKey(fromJson: intFromJson) final  int sortOrder;
 final  List<SlideModel> _slides;
@override@JsonKey() List<SlideModel> get slides {
  if (_slides is EqualUnmodifiableListView) return _slides;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_slides);
}

 final  List<ReelModel> _reels;
@override@JsonKey() List<ReelModel> get reels {
  if (_reels is EqualUnmodifiableListView) return _reels;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_reels);
}


/// Create a copy of HomeSectionModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$HomeSectionModelCopyWith<_HomeSectionModel> get copyWith => __$HomeSectionModelCopyWithImpl<_HomeSectionModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$HomeSectionModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _HomeSectionModel&&(identical(other.id, id) || other.id == id)&&(identical(other.type, type) || other.type == type)&&(identical(other.title, title) || other.title == title)&&(identical(other.subtitle, subtitle) || other.subtitle == subtitle)&&(identical(other.content, content) || other.content == content)&&(identical(other.image, image) || other.image == image)&&const DeepCollectionEquality().equals(other._gallery, _gallery)&&const DeepCollectionEquality().equals(other._videos, _videos)&&(identical(other.button, button) || other.button == button)&&const DeepCollectionEquality().equals(other._config, _config)&&(identical(other.sortOrder, sortOrder) || other.sortOrder == sortOrder)&&const DeepCollectionEquality().equals(other._slides, _slides)&&const DeepCollectionEquality().equals(other._reels, _reels));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,type,title,subtitle,content,image,const DeepCollectionEquality().hash(_gallery),const DeepCollectionEquality().hash(_videos),button,const DeepCollectionEquality().hash(_config),sortOrder,const DeepCollectionEquality().hash(_slides),const DeepCollectionEquality().hash(_reels));

@override
String toString() {
  return 'HomeSectionModel(id: $id, type: $type, title: $title, subtitle: $subtitle, content: $content, image: $image, gallery: $gallery, videos: $videos, button: $button, config: $config, sortOrder: $sortOrder, slides: $slides, reels: $reels)';
}


}

/// @nodoc
abstract mixin class _$HomeSectionModelCopyWith<$Res> implements $HomeSectionModelCopyWith<$Res> {
  factory _$HomeSectionModelCopyWith(_HomeSectionModel value, $Res Function(_HomeSectionModel) _then) = __$HomeSectionModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String type,@JsonKey(fromJson: stringFromJson) String title,@JsonKey(fromJson: stringFromJson) String subtitle,@JsonKey(fromJson: stringFromJson) String content,@JsonKey(fromJson: imageFromJson) ImageModel? image,@JsonKey(fromJson: imageListFromJson) List<ImageModel> gallery,@JsonKey(fromJson: imageListFromJson) List<ImageModel> videos, SectionButton? button,@JsonKey(fromJson: dynamicMapFromJson) Map<String, dynamic> config,@JsonKey(fromJson: intFromJson) int sortOrder, List<SlideModel> slides, List<ReelModel> reels
});


@override $ImageModelCopyWith<$Res>? get image;@override $SectionButtonCopyWith<$Res>? get button;

}
/// @nodoc
class __$HomeSectionModelCopyWithImpl<$Res>
    implements _$HomeSectionModelCopyWith<$Res> {
  __$HomeSectionModelCopyWithImpl(this._self, this._then);

  final _HomeSectionModel _self;
  final $Res Function(_HomeSectionModel) _then;

/// Create a copy of HomeSectionModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? type = null,Object? title = null,Object? subtitle = null,Object? content = null,Object? image = freezed,Object? gallery = null,Object? videos = null,Object? button = freezed,Object? config = null,Object? sortOrder = null,Object? slides = null,Object? reels = null,}) {
  return _then(_HomeSectionModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,subtitle: null == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String,content: null == content ? _self.content : content // ignore: cast_nullable_to_non_nullable
as String,image: freezed == image ? _self.image : image // ignore: cast_nullable_to_non_nullable
as ImageModel?,gallery: null == gallery ? _self._gallery : gallery // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,videos: null == videos ? _self._videos : videos // ignore: cast_nullable_to_non_nullable
as List<ImageModel>,button: freezed == button ? _self.button : button // ignore: cast_nullable_to_non_nullable
as SectionButton?,config: null == config ? _self._config : config // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>,sortOrder: null == sortOrder ? _self.sortOrder : sortOrder // ignore: cast_nullable_to_non_nullable
as int,slides: null == slides ? _self._slides : slides // ignore: cast_nullable_to_non_nullable
as List<SlideModel>,reels: null == reels ? _self._reels : reels // ignore: cast_nullable_to_non_nullable
as List<ReelModel>,
  ));
}

/// Create a copy of HomeSectionModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ImageModelCopyWith<$Res>? get image {
    if (_self.image == null) {
    return null;
  }

  return $ImageModelCopyWith<$Res>(_self.image!, (value) {
    return _then(_self.copyWith(image: value));
  });
}/// Create a copy of HomeSectionModel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$SectionButtonCopyWith<$Res>? get button {
    if (_self.button == null) {
    return null;
  }

  return $SectionButtonCopyWith<$Res>(_self.button!, (value) {
    return _then(_self.copyWith(button: value));
  });
}
}

// dart format on
