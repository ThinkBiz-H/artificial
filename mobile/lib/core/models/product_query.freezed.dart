// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'product_query.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$ProductQuery {

 String? get categoryId; String? get keyword; ProductSort get sort; bool get onSale; bool get inStockOnly; double? get minPrice; double? get maxPrice; String? get color; String? get size; String? get brandId;/// Minimum average rating (website "4★ & above" / "3★ & above").
 int? get minRating;
/// Create a copy of ProductQuery
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ProductQueryCopyWith<ProductQuery> get copyWith => _$ProductQueryCopyWithImpl<ProductQuery>(this as ProductQuery, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ProductQuery&&(identical(other.categoryId, categoryId) || other.categoryId == categoryId)&&(identical(other.keyword, keyword) || other.keyword == keyword)&&(identical(other.sort, sort) || other.sort == sort)&&(identical(other.onSale, onSale) || other.onSale == onSale)&&(identical(other.inStockOnly, inStockOnly) || other.inStockOnly == inStockOnly)&&(identical(other.minPrice, minPrice) || other.minPrice == minPrice)&&(identical(other.maxPrice, maxPrice) || other.maxPrice == maxPrice)&&(identical(other.color, color) || other.color == color)&&(identical(other.size, size) || other.size == size)&&(identical(other.brandId, brandId) || other.brandId == brandId)&&(identical(other.minRating, minRating) || other.minRating == minRating));
}


@override
int get hashCode => Object.hash(runtimeType,categoryId,keyword,sort,onSale,inStockOnly,minPrice,maxPrice,color,size,brandId,minRating);

@override
String toString() {
  return 'ProductQuery(categoryId: $categoryId, keyword: $keyword, sort: $sort, onSale: $onSale, inStockOnly: $inStockOnly, minPrice: $minPrice, maxPrice: $maxPrice, color: $color, size: $size, brandId: $brandId, minRating: $minRating)';
}


}

/// @nodoc
abstract mixin class $ProductQueryCopyWith<$Res>  {
  factory $ProductQueryCopyWith(ProductQuery value, $Res Function(ProductQuery) _then) = _$ProductQueryCopyWithImpl;
@useResult
$Res call({
 String? categoryId, String? keyword, ProductSort sort, bool onSale, bool inStockOnly, double? minPrice, double? maxPrice, String? color, String? size, String? brandId, int? minRating
});




}
/// @nodoc
class _$ProductQueryCopyWithImpl<$Res>
    implements $ProductQueryCopyWith<$Res> {
  _$ProductQueryCopyWithImpl(this._self, this._then);

  final ProductQuery _self;
  final $Res Function(ProductQuery) _then;

/// Create a copy of ProductQuery
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? categoryId = freezed,Object? keyword = freezed,Object? sort = null,Object? onSale = null,Object? inStockOnly = null,Object? minPrice = freezed,Object? maxPrice = freezed,Object? color = freezed,Object? size = freezed,Object? brandId = freezed,Object? minRating = freezed,}) {
  return _then(_self.copyWith(
categoryId: freezed == categoryId ? _self.categoryId : categoryId // ignore: cast_nullable_to_non_nullable
as String?,keyword: freezed == keyword ? _self.keyword : keyword // ignore: cast_nullable_to_non_nullable
as String?,sort: null == sort ? _self.sort : sort // ignore: cast_nullable_to_non_nullable
as ProductSort,onSale: null == onSale ? _self.onSale : onSale // ignore: cast_nullable_to_non_nullable
as bool,inStockOnly: null == inStockOnly ? _self.inStockOnly : inStockOnly // ignore: cast_nullable_to_non_nullable
as bool,minPrice: freezed == minPrice ? _self.minPrice : minPrice // ignore: cast_nullable_to_non_nullable
as double?,maxPrice: freezed == maxPrice ? _self.maxPrice : maxPrice // ignore: cast_nullable_to_non_nullable
as double?,color: freezed == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as String?,brandId: freezed == brandId ? _self.brandId : brandId // ignore: cast_nullable_to_non_nullable
as String?,minRating: freezed == minRating ? _self.minRating : minRating // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [ProductQuery].
extension ProductQueryPatterns on ProductQuery {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ProductQuery value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ProductQuery() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ProductQuery value)  $default,){
final _that = this;
switch (_that) {
case _ProductQuery():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ProductQuery value)?  $default,){
final _that = this;
switch (_that) {
case _ProductQuery() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String? categoryId,  String? keyword,  ProductSort sort,  bool onSale,  bool inStockOnly,  double? minPrice,  double? maxPrice,  String? color,  String? size,  String? brandId,  int? minRating)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ProductQuery() when $default != null:
return $default(_that.categoryId,_that.keyword,_that.sort,_that.onSale,_that.inStockOnly,_that.minPrice,_that.maxPrice,_that.color,_that.size,_that.brandId,_that.minRating);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String? categoryId,  String? keyword,  ProductSort sort,  bool onSale,  bool inStockOnly,  double? minPrice,  double? maxPrice,  String? color,  String? size,  String? brandId,  int? minRating)  $default,) {final _that = this;
switch (_that) {
case _ProductQuery():
return $default(_that.categoryId,_that.keyword,_that.sort,_that.onSale,_that.inStockOnly,_that.minPrice,_that.maxPrice,_that.color,_that.size,_that.brandId,_that.minRating);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String? categoryId,  String? keyword,  ProductSort sort,  bool onSale,  bool inStockOnly,  double? minPrice,  double? maxPrice,  String? color,  String? size,  String? brandId,  int? minRating)?  $default,) {final _that = this;
switch (_that) {
case _ProductQuery() when $default != null:
return $default(_that.categoryId,_that.keyword,_that.sort,_that.onSale,_that.inStockOnly,_that.minPrice,_that.maxPrice,_that.color,_that.size,_that.brandId,_that.minRating);case _:
  return null;

}
}

}

/// @nodoc


class _ProductQuery extends ProductQuery {
  const _ProductQuery({this.categoryId, this.keyword, this.sort = ProductSort.recommended, this.onSale = false, this.inStockOnly = false, this.minPrice, this.maxPrice, this.color, this.size, this.brandId, this.minRating}): super._();
  

@override final  String? categoryId;
@override final  String? keyword;
@override@JsonKey() final  ProductSort sort;
@override@JsonKey() final  bool onSale;
@override@JsonKey() final  bool inStockOnly;
@override final  double? minPrice;
@override final  double? maxPrice;
@override final  String? color;
@override final  String? size;
@override final  String? brandId;
/// Minimum average rating (website "4★ & above" / "3★ & above").
@override final  int? minRating;

/// Create a copy of ProductQuery
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ProductQueryCopyWith<_ProductQuery> get copyWith => __$ProductQueryCopyWithImpl<_ProductQuery>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ProductQuery&&(identical(other.categoryId, categoryId) || other.categoryId == categoryId)&&(identical(other.keyword, keyword) || other.keyword == keyword)&&(identical(other.sort, sort) || other.sort == sort)&&(identical(other.onSale, onSale) || other.onSale == onSale)&&(identical(other.inStockOnly, inStockOnly) || other.inStockOnly == inStockOnly)&&(identical(other.minPrice, minPrice) || other.minPrice == minPrice)&&(identical(other.maxPrice, maxPrice) || other.maxPrice == maxPrice)&&(identical(other.color, color) || other.color == color)&&(identical(other.size, size) || other.size == size)&&(identical(other.brandId, brandId) || other.brandId == brandId)&&(identical(other.minRating, minRating) || other.minRating == minRating));
}


@override
int get hashCode => Object.hash(runtimeType,categoryId,keyword,sort,onSale,inStockOnly,minPrice,maxPrice,color,size,brandId,minRating);

@override
String toString() {
  return 'ProductQuery(categoryId: $categoryId, keyword: $keyword, sort: $sort, onSale: $onSale, inStockOnly: $inStockOnly, minPrice: $minPrice, maxPrice: $maxPrice, color: $color, size: $size, brandId: $brandId, minRating: $minRating)';
}


}

/// @nodoc
abstract mixin class _$ProductQueryCopyWith<$Res> implements $ProductQueryCopyWith<$Res> {
  factory _$ProductQueryCopyWith(_ProductQuery value, $Res Function(_ProductQuery) _then) = __$ProductQueryCopyWithImpl;
@override @useResult
$Res call({
 String? categoryId, String? keyword, ProductSort sort, bool onSale, bool inStockOnly, double? minPrice, double? maxPrice, String? color, String? size, String? brandId, int? minRating
});




}
/// @nodoc
class __$ProductQueryCopyWithImpl<$Res>
    implements _$ProductQueryCopyWith<$Res> {
  __$ProductQueryCopyWithImpl(this._self, this._then);

  final _ProductQuery _self;
  final $Res Function(_ProductQuery) _then;

/// Create a copy of ProductQuery
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? categoryId = freezed,Object? keyword = freezed,Object? sort = null,Object? onSale = null,Object? inStockOnly = null,Object? minPrice = freezed,Object? maxPrice = freezed,Object? color = freezed,Object? size = freezed,Object? brandId = freezed,Object? minRating = freezed,}) {
  return _then(_ProductQuery(
categoryId: freezed == categoryId ? _self.categoryId : categoryId // ignore: cast_nullable_to_non_nullable
as String?,keyword: freezed == keyword ? _self.keyword : keyword // ignore: cast_nullable_to_non_nullable
as String?,sort: null == sort ? _self.sort : sort // ignore: cast_nullable_to_non_nullable
as ProductSort,onSale: null == onSale ? _self.onSale : onSale // ignore: cast_nullable_to_non_nullable
as bool,inStockOnly: null == inStockOnly ? _self.inStockOnly : inStockOnly // ignore: cast_nullable_to_non_nullable
as bool,minPrice: freezed == minPrice ? _self.minPrice : minPrice // ignore: cast_nullable_to_non_nullable
as double?,maxPrice: freezed == maxPrice ? _self.maxPrice : maxPrice // ignore: cast_nullable_to_non_nullable
as double?,color: freezed == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as String?,brandId: freezed == brandId ? _self.brandId : brandId // ignore: cast_nullable_to_non_nullable
as String?,minRating: freezed == minRating ? _self.minRating : minRating // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}

// dart format on
