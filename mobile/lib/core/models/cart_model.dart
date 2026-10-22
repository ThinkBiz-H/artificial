import 'package:freezed_annotation/freezed_annotation.dart';

import 'common_models.dart';
import 'json_converters.dart';
import 'product_model.dart';

part 'cart_model.freezed.dart';
part 'cart_model.g.dart';

VariantModel? variantFromJson(Object? value) {
  if (value is Map) {
    return VariantModel.fromJson(Map<String, dynamic>.from(value));
  }
  return null;
}

ProductModel productFromJson(Object? value) {
  if (value is Map) {
    return ProductModel.fromJson(Map<String, dynamic>.from(value));
  }
  return ProductModel(id: idFromJson(value));
}

/// One line of GET /cart (cart.controller.js#computeCartTotals) — also the
/// shape persisted locally for the guest cart.
@freezed
abstract class CartItemModel with _$CartItemModel {
  const CartItemModel._();

  const factory CartItemModel({
    /// Server cart line id (absent on guest-cart lines).
    @JsonKey(fromJson: nullableStringFromJson) String? lineId,
    @JsonKey(fromJson: productFromJson) required ProductModel product,
    @JsonKey(fromJson: variantFromJson) VariantModel? variant,
    @JsonKey(fromJson: intFromJson) @Default(1) int quantity,
    @JsonKey(fromJson: nullableStringFromJson) String? color,
    @JsonKey(fromJson: nullableStringFromJson) String? colorHex,
    @JsonKey(fromJson: nullableStringFromJson) String? size,
    @JsonKey(fromJson: nullableStringFromJson) String? metal,
    @JsonKey(fromJson: nullableStringFromJson) String? plating,

    /// Line image chosen by the server: variant image → colour gallery → thumbnail.
    @JsonKey(name: 'image', fromJson: nullableStringFromJson) String? lineImage,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double price,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double itemTotal,
  }) = _CartItemModel;

  factory CartItemModel.fromJson(Map<String, dynamic> json) =>
      _$CartItemModelFromJson(json);

  /// Identity of a cart line: the server line id, else the backend's
  /// matching rule (product + variant + color + size) for guest lines.
  String get key => (lineId != null && lineId!.isNotEmpty)
      ? lineId!
      : '${product.id}|${variant?.id ?? ''}|${(color ?? '').toLowerCase()}|${(size ?? '').toLowerCase()}';

  double get unitPrice =>
      price > 0 ? price : (variant?.effectivePrice ?? product.effectivePrice);
  double get lineTotal => unitPrice * quantity;
  double get mrpTotal => (variant?.price ?? product.price) * quantity;

  int get availableStock => variant?.stock ?? product.stock;

  /// Variant image → server line image → colour gallery → product image.
  String? get image {
    if (variant != null && variant!.images.isNotEmpty) {
      return variant!.images.first.url;
    }
    if (lineImage != null && lineImage!.isNotEmpty) return lineImage;
    final gallery = product.findColorOption(color)?.images ?? const <ImageModel>[];
    if (gallery.isNotEmpty) return gallery.first.url;
    return product.primaryImage;
  }

  /// The line's options in the website's order (lib/itemOptions.ts optionParts).
  ItemOptions get options => ItemOptions(
        color: color,
        colorHex: colorHex ?? product.findColorOption(color)?.hex,
        size: size,
        metal: metal ?? product.metal,
        plating: plating ?? product.plating,
      );

  String get optionsLabel => options.label;
}

/// Jewellery option values carried by cart lines and order items.
class ItemOptions {
  const ItemOptions({this.color, this.colorHex, this.size, this.metal, this.plating});

  final String? color;
  final String? colorHex;
  final String? size;
  final String? metal;
  final String? plating;

  static bool _has(String? v) => v != null && v.trim().isNotEmpty;

  /// Labelled parts in display order — only the ones that exist.
  List<({String label, String value, String? hex})> get parts => [
        if (_has(color)) (label: 'Color', value: color!, hex: colorHex),
        if (_has(size)) (label: 'Size', value: size!, hex: null),
        if (_has(metal)) (label: 'Metal', value: metal!, hex: null),
        if (_has(plating)) (label: 'Plating', value: plating!, hex: null),
      ];

  bool get isEmpty => parts.isEmpty;
  String get label => parts.map((p) => '${p.label}: ${p.value}').join(' · ');
}

class CartModel {
  const CartModel({required this.items, required this.subTotal});

  const CartModel.empty()
      : items = const <CartItemModel>[],
        subTotal = 0;

  final List<CartItemModel> items;
  final double subTotal;

  bool get isEmpty => items.isEmpty;
  int get count => items.fold(0, (sum, i) => sum + i.quantity);
  double get mrpTotal => items.fold(0, (sum, i) => sum + i.mrpTotal);
  double get savings => (mrpTotal - subTotal).clamp(0, double.infinity).toDouble();

  factory CartModel.fromItems(List<CartItemModel> items) => CartModel(
        items: items,
        subTotal: double.parse(
            items.fold<double>(0, (s, i) => s + i.lineTotal).toStringAsFixed(2)),
      );

  factory CartModel.fromJson(Map<String, dynamic> json) {
    final items = mapList(json['cart'])
        .map(CartItemModel.fromJson)
        .where((i) => i.product.id.isNotEmpty)
        .toList(growable: false);
    return CartModel(items: items, subTotal: doubleFromJson(json['subTotal']));
  }
}

/// POST /cart/apply-coupon response.
class CouponResult {
  const CouponResult({
    required this.code,
    required this.discountAmount,
    required this.subTotal,
    required this.total,
  });

  final String code;
  final double discountAmount;
  final double subTotal;
  final double total;

  factory CouponResult.fromJson(Map<String, dynamic> json) => CouponResult(
        code: stringFromJson(json['code']),
        discountAmount: doubleFromJson(json['discountAmount']),
        subTotal: doubleFromJson(json['subTotal']),
        total: doubleFromJson(json['total']),
      );
}

/// POST /shipping/calculate response (shipping.service.js).
class ShippingQuote {
  const ShippingQuote({
    required this.shippingCharge,
    required this.courierName,
    required this.estimatedDays,
    required this.codCharge,
    required this.freeShipping,
    required this.freeShippingThreshold,
  });

  final double shippingCharge;
  final String courierName;
  final int estimatedDays;
  final double codCharge;
  final bool freeShipping;
  final double freeShippingThreshold;

  factory ShippingQuote.fromJson(Map<String, dynamic> json) => ShippingQuote(
        shippingCharge: doubleFromJson(json['shippingCharge']),
        courierName: stringFromJson(json['courierName']),
        estimatedDays: intFromJson(json['estimatedDays']),
        codCharge: doubleFromJson(json['codCharge']),
        freeShipping: boolFromJson(json['freeShipping']),
        freeShippingThreshold: doubleFromJson(json['freeShippingThreshold']),
      );

  DateTime get estimatedDelivery =>
      DateTime.now().add(Duration(days: estimatedDays <= 0 ? 4 : estimatedDays));
}
