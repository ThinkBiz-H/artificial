// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'category_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CategoryModel {

@JsonKey(name: '_id', fromJson: idFromJson) String get id;@JsonKey(fromJson: stringFromJson) String get name;@JsonKey(fromJson: stringFromJson) String get slug;@JsonKey(fromJson: imageFromJson) ImageModel? get image;@JsonKey(fromJson: stringFromJson) String get shortTitle;@JsonKey(fromJson: stringFromJson) String get description;@JsonKey(fromJson: stringFromJson) String get status;@JsonKey(fromJson: nullableIdFromJson) String? get parent;@JsonKey(fromJson: intFromJson) int get level;@JsonKey(fromJson: intFromJson) int get sortOrder; bool get showInHeader;@JsonKey(fromJson: categoryListFromJson) List<CategoryModel> get children;
/// Create a copy of CategoryModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CategoryModelCopyWith<CategoryModel> get copyWith => _$CategoryModelCopyWithImpl<CategoryModel>(this as CategoryModel, _$identity);

  /// Serializes this CategoryModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CategoryModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.image, image) || other.image == image)&&(identical(other.shortTitle, shortTitle) || other.shortTitle == shortTitle)&&(identical(other.description, description) || other.description == description)&&(identical(other.status, status) || other.status == status)&&(identical(other.parent, parent) || other.parent == parent)&&(identical(other.level, level) || other.level == level)&&(identical(other.sortOrder, sortOrder) || other.sortOrder == sortOrder)&&(identical(other.showInHeader, showInHeader) || other.showInHeader == showInHeader)&&const DeepCollectionEquality().equals(other.children, children));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,image,shortTitle,description,status,parent,level,sortOrder,showInHeader,const DeepCollectionEquality().hash(children));

@override
String toString() {
  return 'CategoryModel(id: $id, name: $name, slug: $slug, image: $image, shortTitle: $shortTitle, description: $description, status: $status, parent: $parent, level: $level, sortOrder: $sortOrder, showInHeader: $showInHeader, children: $children)';
}


}

/// @nodoc
abstract mixin class $CategoryModelCopyWith<$Res>  {
  factory $CategoryModelCopyWith(CategoryModel value, $Res Function(CategoryModel) _then) = _$CategoryModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: stringFromJson) String slug,@JsonKey(fromJson: imageFromJson) ImageModel? image,@JsonKey(fromJson: stringFromJson) String shortTitle,@JsonKey(fromJson: stringFromJson) String description,@JsonKey(fromJson: stringFromJson) String status,@JsonKey(fromJson: nullableIdFromJson) String? parent,@JsonKey(fromJson: intFromJson) int level,@JsonKey(fromJson: intFromJson) int sortOrder, bool showInHeader,@JsonKey(fromJson: categoryListFromJson) List<CategoryModel> children
});


$ImageModelCopyWith<$Res>? get image;

}
/// @nodoc
class _$CategoryModelCopyWithImpl<$Res>
    implements $CategoryModelCopyWith<$Res> {
  _$CategoryModelCopyWithImpl(this._self, this._then);

  final CategoryModel _self;
  final $Res Function(CategoryModel) _then;

/// Create a copy of CategoryModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? image = freezed,Object? shortTitle = null,Object? description = null,Object? status = null,Object? parent = freezed,Object? level = null,Object? sortOrder = null,Object? showInHeader = null,Object? children = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,image: freezed == image ? _self.image : image // ignore: cast_nullable_to_non_nullable
as ImageModel?,shortTitle: null == shortTitle ? _self.shortTitle : shortTitle // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,parent: freezed == parent ? _self.parent : parent // ignore: cast_nullable_to_non_nullable
as String?,level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,sortOrder: null == sortOrder ? _self.sortOrder : sortOrder // ignore: cast_nullable_to_non_nullable
as int,showInHeader: null == showInHeader ? _self.showInHeader : showInHeader // ignore: cast_nullable_to_non_nullable
as bool,children: null == children ? _self.children : children // ignore: cast_nullable_to_non_nullable
as List<CategoryModel>,
  ));
}
/// Create a copy of CategoryModel
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
}
}


/// Adds pattern-matching-related methods to [CategoryModel].
extension CategoryModelPatterns on CategoryModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CategoryModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CategoryModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CategoryModel value)  $default,){
final _that = this;
switch (_that) {
case _CategoryModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CategoryModel value)?  $default,){
final _that = this;
switch (_that) {
case _CategoryModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: stringFromJson)  String slug, @JsonKey(fromJson: imageFromJson)  ImageModel? image, @JsonKey(fromJson: stringFromJson)  String shortTitle, @JsonKey(fromJson: stringFromJson)  String description, @JsonKey(fromJson: stringFromJson)  String status, @JsonKey(fromJson: nullableIdFromJson)  String? parent, @JsonKey(fromJson: intFromJson)  int level, @JsonKey(fromJson: intFromJson)  int sortOrder,  bool showInHeader, @JsonKey(fromJson: categoryListFromJson)  List<CategoryModel> children)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CategoryModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.image,_that.shortTitle,_that.description,_that.status,_that.parent,_that.level,_that.sortOrder,_that.showInHeader,_that.children);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: stringFromJson)  String slug, @JsonKey(fromJson: imageFromJson)  ImageModel? image, @JsonKey(fromJson: stringFromJson)  String shortTitle, @JsonKey(fromJson: stringFromJson)  String description, @JsonKey(fromJson: stringFromJson)  String status, @JsonKey(fromJson: nullableIdFromJson)  String? parent, @JsonKey(fromJson: intFromJson)  int level, @JsonKey(fromJson: intFromJson)  int sortOrder,  bool showInHeader, @JsonKey(fromJson: categoryListFromJson)  List<CategoryModel> children)  $default,) {final _that = this;
switch (_that) {
case _CategoryModel():
return $default(_that.id,_that.name,_that.slug,_that.image,_that.shortTitle,_that.description,_that.status,_that.parent,_that.level,_that.sortOrder,_that.showInHeader,_that.children);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id', fromJson: idFromJson)  String id, @JsonKey(fromJson: stringFromJson)  String name, @JsonKey(fromJson: stringFromJson)  String slug, @JsonKey(fromJson: imageFromJson)  ImageModel? image, @JsonKey(fromJson: stringFromJson)  String shortTitle, @JsonKey(fromJson: stringFromJson)  String description, @JsonKey(fromJson: stringFromJson)  String status, @JsonKey(fromJson: nullableIdFromJson)  String? parent, @JsonKey(fromJson: intFromJson)  int level, @JsonKey(fromJson: intFromJson)  int sortOrder,  bool showInHeader, @JsonKey(fromJson: categoryListFromJson)  List<CategoryModel> children)?  $default,) {final _that = this;
switch (_that) {
case _CategoryModel() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.image,_that.shortTitle,_that.description,_that.status,_that.parent,_that.level,_that.sortOrder,_that.showInHeader,_that.children);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CategoryModel extends CategoryModel {
  const _CategoryModel({@JsonKey(name: '_id', fromJson: idFromJson) this.id = '', @JsonKey(fromJson: stringFromJson) this.name = '', @JsonKey(fromJson: stringFromJson) this.slug = '', @JsonKey(fromJson: imageFromJson) this.image, @JsonKey(fromJson: stringFromJson) this.shortTitle = '', @JsonKey(fromJson: stringFromJson) this.description = '', @JsonKey(fromJson: stringFromJson) this.status = 'active', @JsonKey(fromJson: nullableIdFromJson) this.parent, @JsonKey(fromJson: intFromJson) this.level = 0, @JsonKey(fromJson: intFromJson) this.sortOrder = 0, this.showInHeader = true, @JsonKey(fromJson: categoryListFromJson) final  List<CategoryModel> children = const <CategoryModel>[]}): _children = children,super._();
  factory _CategoryModel.fromJson(Map<String, dynamic> json) => _$CategoryModelFromJson(json);

@override@JsonKey(name: '_id', fromJson: idFromJson) final  String id;
@override@JsonKey(fromJson: stringFromJson) final  String name;
@override@JsonKey(fromJson: stringFromJson) final  String slug;
@override@JsonKey(fromJson: imageFromJson) final  ImageModel? image;
@override@JsonKey(fromJson: stringFromJson) final  String shortTitle;
@override@JsonKey(fromJson: stringFromJson) final  String description;
@override@JsonKey(fromJson: stringFromJson) final  String status;
@override@JsonKey(fromJson: nullableIdFromJson) final  String? parent;
@override@JsonKey(fromJson: intFromJson) final  int level;
@override@JsonKey(fromJson: intFromJson) final  int sortOrder;
@override@JsonKey() final  bool showInHeader;
 final  List<CategoryModel> _children;
@override@JsonKey(fromJson: categoryListFromJson) List<CategoryModel> get children {
  if (_children is EqualUnmodifiableListView) return _children;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_children);
}


/// Create a copy of CategoryModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CategoryModelCopyWith<_CategoryModel> get copyWith => __$CategoryModelCopyWithImpl<_CategoryModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CategoryModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CategoryModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.image, image) || other.image == image)&&(identical(other.shortTitle, shortTitle) || other.shortTitle == shortTitle)&&(identical(other.description, description) || other.description == description)&&(identical(other.status, status) || other.status == status)&&(identical(other.parent, parent) || other.parent == parent)&&(identical(other.level, level) || other.level == level)&&(identical(other.sortOrder, sortOrder) || other.sortOrder == sortOrder)&&(identical(other.showInHeader, showInHeader) || other.showInHeader == showInHeader)&&const DeepCollectionEquality().equals(other._children, _children));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,image,shortTitle,description,status,parent,level,sortOrder,showInHeader,const DeepCollectionEquality().hash(_children));

@override
String toString() {
  return 'CategoryModel(id: $id, name: $name, slug: $slug, image: $image, shortTitle: $shortTitle, description: $description, status: $status, parent: $parent, level: $level, sortOrder: $sortOrder, showInHeader: $showInHeader, children: $children)';
}


}

/// @nodoc
abstract mixin class _$CategoryModelCopyWith<$Res> implements $CategoryModelCopyWith<$Res> {
  factory _$CategoryModelCopyWith(_CategoryModel value, $Res Function(_CategoryModel) _then) = __$CategoryModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id', fromJson: idFromJson) String id,@JsonKey(fromJson: stringFromJson) String name,@JsonKey(fromJson: stringFromJson) String slug,@JsonKey(fromJson: imageFromJson) ImageModel? image,@JsonKey(fromJson: stringFromJson) String shortTitle,@JsonKey(fromJson: stringFromJson) String description,@JsonKey(fromJson: stringFromJson) String status,@JsonKey(fromJson: nullableIdFromJson) String? parent,@JsonKey(fromJson: intFromJson) int level,@JsonKey(fromJson: intFromJson) int sortOrder, bool showInHeader,@JsonKey(fromJson: categoryListFromJson) List<CategoryModel> children
});


@override $ImageModelCopyWith<$Res>? get image;

}
/// @nodoc
class __$CategoryModelCopyWithImpl<$Res>
    implements _$CategoryModelCopyWith<$Res> {
  __$CategoryModelCopyWithImpl(this._self, this._then);

  final _CategoryModel _self;
  final $Res Function(_CategoryModel) _then;

/// Create a copy of CategoryModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? image = freezed,Object? shortTitle = null,Object? description = null,Object? status = null,Object? parent = freezed,Object? level = null,Object? sortOrder = null,Object? showInHeader = null,Object? children = null,}) {
  return _then(_CategoryModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,image: freezed == image ? _self.image : image // ignore: cast_nullable_to_non_nullable
as ImageModel?,shortTitle: null == shortTitle ? _self.shortTitle : shortTitle // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,parent: freezed == parent ? _self.parent : parent // ignore: cast_nullable_to_non_nullable
as String?,level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,sortOrder: null == sortOrder ? _self.sortOrder : sortOrder // ignore: cast_nullable_to_non_nullable
as int,showInHeader: null == showInHeader ? _self.showInHeader : showInHeader // ignore: cast_nullable_to_non_nullable
as bool,children: null == children ? _self._children : children // ignore: cast_nullable_to_non_nullable
as List<CategoryModel>,
  ));
}

/// Create a copy of CategoryModel
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
}
}

// dart format on
