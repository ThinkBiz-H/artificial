// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_OrderItemModel _$OrderItemModelFromJson(Map<String, dynamic> json) =>
    _OrderItemModel(
      product: json['product'] == null ? '' : idFromJson(json['product']),
      variant: nullableIdFromJson(json['variant']),
      title: json['title'] == null ? '' : stringFromJson(json['title']),
      sku: json['sku'] == null ? '' : stringFromJson(json['sku']),
      unitValue: nullableStringFromJson(json['unitValue']),
      thumbnail: json['thumbnail'] == null
          ? ''
          : stringFromJson(json['thumbnail']),
      quantity: json['quantity'] == null ? 1 : intFromJson(json['quantity']),
      price: json['price'] == null ? 0 : doubleFromJson(json['price']),
      mrp: nullableDoubleFromJson(json['mrp']),
      discount: json['discount'] == null ? 0 : doubleFromJson(json['discount']),
      gstRate: nullableDoubleFromJson(json['gstRate']),
      gstAmount: nullableDoubleFromJson(json['gstAmount']),
      color: nullableStringFromJson(json['color']),
      colorHex: nullableStringFromJson(json['colorHex']),
      size: nullableStringFromJson(json['size']),
      metal: nullableStringFromJson(json['metal']),
      plating: nullableStringFromJson(json['plating']),
    );

Map<String, dynamic> _$OrderItemModelToJson(_OrderItemModel instance) =>
    <String, dynamic>{
      'product': instance.product,
      'variant': ?instance.variant,
      'title': instance.title,
      'sku': instance.sku,
      'unitValue': ?instance.unitValue,
      'thumbnail': instance.thumbnail,
      'quantity': instance.quantity,
      'price': instance.price,
      'mrp': ?instance.mrp,
      'discount': instance.discount,
      'gstRate': ?instance.gstRate,
      'gstAmount': ?instance.gstAmount,
      'color': ?instance.color,
      'colorHex': ?instance.colorHex,
      'size': ?instance.size,
      'metal': ?instance.metal,
      'plating': ?instance.plating,
    };

_ShippingAddressModel _$ShippingAddressModelFromJson(
  Map<String, dynamic> json,
) => _ShippingAddressModel(
  fullName: json['fullName'] == null ? '' : stringFromJson(json['fullName']),
  email: nullableStringFromJson(json['email']),
  addressLine1: json['addressLine1'] == null
      ? ''
      : stringFromJson(json['addressLine1']),
  addressLine2: json['addressLine2'] == null
      ? ''
      : stringFromJson(json['addressLine2']),
  city: json['city'] == null ? '' : stringFromJson(json['city']),
  state: json['state'] == null ? '' : stringFromJson(json['state']),
  country: json['country'] == null ? 'India' : stringFromJson(json['country']),
  pincode: json['pincode'] == null ? '' : stringFromJson(json['pincode']),
  mobile: json['mobile'] == null ? '' : stringFromJson(json['mobile']),
);

Map<String, dynamic> _$ShippingAddressModelToJson(
  _ShippingAddressModel instance,
) => <String, dynamic>{
  'fullName': instance.fullName,
  'email': ?instance.email,
  'addressLine1': instance.addressLine1,
  'addressLine2': instance.addressLine2,
  'city': instance.city,
  'state': instance.state,
  'country': instance.country,
  'pincode': instance.pincode,
  'mobile': instance.mobile,
};

_StatusHistoryModel _$StatusHistoryModelFromJson(Map<String, dynamic> json) =>
    _StatusHistoryModel(
      status: json['status'] == null ? '' : stringFromJson(json['status']),
      changedAt: json['changedAt'] == null
          ? null
          : DateTime.parse(json['changedAt'] as String),
      note: nullableStringFromJson(json['note']),
    );

Map<String, dynamic> _$StatusHistoryModelToJson(_StatusHistoryModel instance) =>
    <String, dynamic>{
      'status': instance.status,
      'changedAt': ?instance.changedAt?.toIso8601String(),
      'note': ?instance.note,
    };

_CourierModel _$CourierModelFromJson(Map<String, dynamic> json) =>
    _CourierModel(
      partner: nullableStringFromJson(json['partner']),
      courierId: nullableStringFromJson(json['courierId']),
      courierName: nullableStringFromJson(json['courierName']),
    );

Map<String, dynamic> _$CourierModelToJson(_CourierModel instance) =>
    <String, dynamic>{
      'partner': ?instance.partner,
      'courierId': ?instance.courierId,
      'courierName': ?instance.courierName,
    };

_TrackingModel _$TrackingModelFromJson(Map<String, dynamic> json) =>
    _TrackingModel(
      number: nullableStringFromJson(json['number']),
      url: nullableStringFromJson(json['url']),
      estimatedDeliveryDate: json['estimatedDeliveryDate'] == null
          ? null
          : DateTime.parse(json['estimatedDeliveryDate'] as String),
      shipmentStatus: json['shipmentStatus'] == null
          ? 'Not Shipped'
          : stringFromJson(json['shipmentStatus']),
      deliveryAttempts: json['deliveryAttempts'] == null
          ? 0
          : intFromJson(json['deliveryAttempts']),
      lastAttemptNote: nullableStringFromJson(json['lastAttemptNote']),
    );

Map<String, dynamic> _$TrackingModelToJson(
  _TrackingModel instance,
) => <String, dynamic>{
  'number': ?instance.number,
  'url': ?instance.url,
  'estimatedDeliveryDate': ?instance.estimatedDeliveryDate?.toIso8601String(),
  'shipmentStatus': instance.shipmentStatus,
  'deliveryAttempts': instance.deliveryAttempts,
  'lastAttemptNote': ?instance.lastAttemptNote,
};

_CouponAppliedModel _$CouponAppliedModelFromJson(Map<String, dynamic> json) =>
    _CouponAppliedModel(
      code: nullableStringFromJson(json['code']),
      discountAmount: json['discountAmount'] == null
          ? 0
          : doubleFromJson(json['discountAmount']),
    );

Map<String, dynamic> _$CouponAppliedModelToJson(_CouponAppliedModel instance) =>
    <String, dynamic>{
      'code': ?instance.code,
      'discountAmount': instance.discountAmount,
    };

_PaymentInfoModel _$PaymentInfoModelFromJson(Map<String, dynamic> json) =>
    _PaymentInfoModel(
      razorpayOrderId: nullableStringFromJson(json['razorpayOrderId']),
      razorpayPaymentId: nullableStringFromJson(json['razorpayPaymentId']),
      paidAt: json['paidAt'] == null
          ? null
          : DateTime.parse(json['paidAt'] as String),
    );

Map<String, dynamic> _$PaymentInfoModelToJson(_PaymentInfoModel instance) =>
    <String, dynamic>{
      'razorpayOrderId': ?instance.razorpayOrderId,
      'razorpayPaymentId': ?instance.razorpayPaymentId,
      'paidAt': ?instance.paidAt?.toIso8601String(),
    };

_ReturnItemModel _$ReturnItemModelFromJson(Map<String, dynamic> json) =>
    _ReturnItemModel(
      product: json['product'] == null ? '' : idFromJson(json['product']),
      quantity: json['quantity'] == null ? 1 : intFromJson(json['quantity']),
    );

Map<String, dynamic> _$ReturnItemModelToJson(_ReturnItemModel instance) =>
    <String, dynamic>{
      'product': instance.product,
      'quantity': instance.quantity,
    };

_ReturnRequestModel _$ReturnRequestModelFromJson(Map<String, dynamic> json) =>
    _ReturnRequestModel(
      requestedAt: json['requestedAt'] == null
          ? null
          : DateTime.parse(json['requestedAt'] as String),
      items:
          (json['items'] as List<dynamic>?)
              ?.map((e) => ReturnItemModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const <ReturnItemModel>[],
      reason: json['reason'] == null ? '' : stringFromJson(json['reason']),
      comment: nullableStringFromJson(json['comment']),
      status: json['status'] == null
          ? 'Requested'
          : stringFromJson(json['status']),
      adminComment: nullableStringFromJson(json['adminComment']),
      refundStatus: json['refundStatus'] == null
          ? 'Not Applicable'
          : refundStatusFromJson(json['refundStatus']),
      refundAmount: json['refundAmount'] == null
          ? 0
          : refundAmountFromJson(json['refundAmount']),
    );

Map<String, dynamic> _$ReturnRequestModelToJson(_ReturnRequestModel instance) =>
    <String, dynamic>{
      'requestedAt': ?instance.requestedAt?.toIso8601String(),
      'items': instance.items.map((e) => e.toJson()).toList(),
      'reason': instance.reason,
      'comment': ?instance.comment,
      'status': instance.status,
      'adminComment': ?instance.adminComment,
      'refundStatus': instance.refundStatus,
      'refundAmount': instance.refundAmount,
    };

_OrderModel _$OrderModelFromJson(Map<String, dynamic> json) => _OrderModel(
  id: json['_id'] == null ? '' : idFromJson(json['_id']),
  orderNumber: json['orderNumber'] == null
      ? ''
      : stringFromJson(json['orderNumber']),
  user: json['user'] == null ? '' : idFromJson(json['user']),
  items:
      (json['items'] as List<dynamic>?)
          ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <OrderItemModel>[],
  shippingAddress: json['shippingAddress'] == null
      ? null
      : ShippingAddressModel.fromJson(
          json['shippingAddress'] as Map<String, dynamic>,
        ),
  coupon: json['coupon'] == null
      ? null
      : CouponAppliedModel.fromJson(json['coupon'] as Map<String, dynamic>),
  discountAmount: json['discountAmount'] == null
      ? 0
      : doubleFromJson(json['discountAmount']),
  discountPercentage: json['discountPercentage'] == null
      ? 0
      : doubleFromJson(json['discountPercentage']),
  subTotal: json['subTotal'] == null ? 0 : doubleFromJson(json['subTotal']),
  shippingCharge: json['shippingCharge'] == null
      ? 0
      : doubleFromJson(json['shippingCharge']),
  tax: json['tax'] == null ? 0 : doubleFromJson(json['tax']),
  taxIncluded: json['taxIncluded'] == null
      ? false
      : boolFromJson(json['taxIncluded']),
  grandTotal: json['grandTotal'] == null
      ? 0
      : doubleFromJson(json['grandTotal']),
  paymentMethod: json['paymentMethod'] == null
      ? 'cod'
      : stringFromJson(json['paymentMethod']),
  paymentStatus: json['paymentStatus'] == null
      ? 'Pending'
      : stringFromJson(json['paymentStatus']),
  paymentInfo: json['paymentInfo'] == null
      ? null
      : PaymentInfoModel.fromJson(json['paymentInfo'] as Map<String, dynamic>),
  orderStatus: json['orderStatus'] == null
      ? 'Pending'
      : stringFromJson(json['orderStatus']),
  statusHistory:
      (json['statusHistory'] as List<dynamic>?)
          ?.map((e) => StatusHistoryModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <StatusHistoryModel>[],
  courier: json['courier'] == null
      ? null
      : CourierModel.fromJson(json['courier'] as Map<String, dynamic>),
  tracking: json['tracking'] == null
      ? null
      : TrackingModel.fromJson(json['tracking'] as Map<String, dynamic>),
  shippingNotes: nullableStringFromJson(json['shippingNotes']),
  invoiceNumber: nullableStringFromJson(json['invoiceNumber']),
  deliveredAt: json['deliveredAt'] == null
      ? null
      : DateTime.parse(json['deliveredAt'] as String),
  cancelledAt: json['cancelledAt'] == null
      ? null
      : DateTime.parse(json['cancelledAt'] as String),
  cancelReason: nullableStringFromJson(json['cancelReason']),
  returnRequest: json['returnRequest'] == null
      ? null
      : ReturnRequestModel.fromJson(
          json['returnRequest'] as Map<String, dynamic>,
        ),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$OrderModelToJson(_OrderModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'orderNumber': instance.orderNumber,
      'user': instance.user,
      'items': instance.items.map((e) => e.toJson()).toList(),
      'shippingAddress': ?instance.shippingAddress?.toJson(),
      'coupon': ?instance.coupon?.toJson(),
      'discountAmount': instance.discountAmount,
      'discountPercentage': instance.discountPercentage,
      'subTotal': instance.subTotal,
      'shippingCharge': instance.shippingCharge,
      'tax': instance.tax,
      'taxIncluded': instance.taxIncluded,
      'grandTotal': instance.grandTotal,
      'paymentMethod': instance.paymentMethod,
      'paymentStatus': instance.paymentStatus,
      'paymentInfo': ?instance.paymentInfo?.toJson(),
      'orderStatus': instance.orderStatus,
      'statusHistory': instance.statusHistory.map((e) => e.toJson()).toList(),
      'courier': ?instance.courier?.toJson(),
      'tracking': ?instance.tracking?.toJson(),
      'shippingNotes': ?instance.shippingNotes,
      'invoiceNumber': ?instance.invoiceNumber,
      'deliveredAt': ?instance.deliveredAt?.toIso8601String(),
      'cancelledAt': ?instance.cancelledAt?.toIso8601String(),
      'cancelReason': ?instance.cancelReason,
      'returnRequest': ?instance.returnRequest?.toJson(),
      'createdAt': ?instance.createdAt?.toIso8601String(),
    };
