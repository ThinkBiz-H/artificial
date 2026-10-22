import 'json_converters.dart';

/// A payment method the admin has enabled (Admin > Settings > Payment),
/// as returned by POST /checkout/quote.
class CheckoutPaymentMethod {
  const CheckoutPaymentMethod({
    required this.id,
    required this.label,
    required this.description,
    this.offer,
  });

  /// `razorpay` or `cod` — the value POST /orders expects as paymentMethod.
  final String id;
  final String label;
  final String description;
  final String? offer;

  bool get isCod => id == 'cod';

  factory CheckoutPaymentMethod.fromJson(Map<String, dynamic> json) => CheckoutPaymentMethod(
        id: stringFromJson(json['id']),
        label: stringFromJson(json['label']),
        description: stringFromJson(json['description']),
        offer: nullableStringFromJson(json['offer']),
      );
}

/// The checkout summary, priced by the backend exactly as the order will be
/// (services/checkout.service.js#quoteCheckout).
class CheckoutQuote {
  const CheckoutQuote({
    required this.subTotal,
    required this.couponCode,
    required this.couponDiscount,
    required this.couponError,
    required this.prepaidDiscount,
    required this.prepaidDiscountPercent,
    required this.shippingQuoted,
    required this.shippingCharge,
    required this.freeShipping,
    required this.estimatedDays,
    required this.tax,
    required this.taxIncluded,
    required this.grandTotal,
    required this.paymentMethods,
  });

  final double subTotal;
  final String? couponCode;
  final double couponDiscount;
  final String? couponError;
  final double prepaidDiscount;
  final double prepaidDiscountPercent;
  final bool shippingQuoted;
  final double shippingCharge;
  final bool freeShipping;
  final int? estimatedDays;
  final double tax;

  /// true: [tax] is GST already included in the prices (not added to the total).
  final bool taxIncluded;
  final double grandTotal;
  final List<CheckoutPaymentMethod> paymentMethods;

  bool get isFreeShipping => shippingQuoted && (freeShipping || shippingCharge == 0);

  factory CheckoutQuote.fromJson(Map<String, dynamic> json) {
    final shipping = mapOrNull(json['shipping']) ?? const <String, dynamic>{};
    final days = shipping['estimatedDays'];
    return CheckoutQuote(
      subTotal: doubleFromJson(json['subTotal']),
      couponCode: nullableStringFromJson(json['couponCode']),
      couponDiscount: doubleFromJson(json['couponDiscount']),
      couponError: nullableStringFromJson(json['couponError']),
      prepaidDiscount: doubleFromJson(json['prepaidDiscount']),
      prepaidDiscountPercent: doubleFromJson(json['prepaidDiscountPercent']),
      shippingQuoted: boolFromJson(shipping['quoted']),
      shippingCharge: doubleFromJson(shipping['charge']),
      freeShipping: boolFromJson(shipping['free']),
      estimatedDays: days == null ? null : intFromJson(days),
      tax: doubleFromJson(json['tax']),
      taxIncluded: boolFromJson(json['taxIncluded']),
      grandTotal: doubleFromJson(json['grandTotal']),
      paymentMethods: mapList(json['paymentMethods'])
          .map(CheckoutPaymentMethod.fromJson)
          .where((m) => m.id.isNotEmpty)
          .toList(growable: false),
    );
  }
}

/// POST /payments/intent — a Razorpay order for the checkout; the shop order
/// is created only after the payment is confirmed.
class PaymentIntentInfo {
  const PaymentIntentInfo({
    required this.razorpayOrderId,
    required this.amountPaise,
    required this.currency,
    required this.keyId,
  });

  final String razorpayOrderId;
  final int amountPaise;
  final String currency;
  final String keyId;
}
