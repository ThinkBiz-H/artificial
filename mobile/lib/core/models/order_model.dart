import 'package:freezed_annotation/freezed_annotation.dart';

import 'cart_model.dart' show ItemOptions;
import 'json_converters.dart';

part 'order_model.freezed.dart';
part 'order_model.g.dart';

/// Order statuses + allowed transitions — utils/orderStatusMachine.js.
class OrderStatus {
  OrderStatus._();
  static const String pending = 'Pending';
  static const String confirmed = 'Confirmed';
  static const String packed = 'Packed';
  static const String shipped = 'Shipped';
  static const String outForDelivery = 'Out For Delivery';
  static const String delivered = 'Delivered';
  static const String cancelled = 'Cancelled';
  static const String returned = 'Returned';
  static const String refunded = 'Refunded';

  static const List<String> journey = [
    pending,
    confirmed,
    packed,
    shipped,
    outForDelivery,
    delivered,
  ];

  static const Map<String, List<String>> transitions = {
    pending: [confirmed, cancelled],
    confirmed: [packed, cancelled],
    packed: [shipped, cancelled],
    shipped: [outForDelivery, returned, cancelled],
    outForDelivery: [delivered, outForDelivery, returned],
    delivered: [returned],
    cancelled: [refunded],
    returned: [refunded],
    refunded: [],
  };

  static bool canTransition(String from, String to) =>
      (transitions[from] ?? const <String>[]).contains(to);
}

@freezed
abstract class OrderItemModel with _$OrderItemModel {
  const OrderItemModel._();

  const factory OrderItemModel({
    @JsonKey(fromJson: idFromJson) @Default('') String product,
    @JsonKey(fromJson: nullableIdFromJson) String? variant,
    @JsonKey(fromJson: stringFromJson) @Default('') String title,
    @JsonKey(fromJson: stringFromJson) @Default('') String sku,
    @JsonKey(fromJson: nullableStringFromJson) String? unitValue,
    @JsonKey(fromJson: stringFromJson) @Default('') String thumbnail,
    @JsonKey(fromJson: intFromJson) @Default(1) int quantity,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double price,
    @JsonKey(fromJson: nullableDoubleFromJson) double? mrp,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double discount,
    @JsonKey(fromJson: nullableDoubleFromJson) double? gstRate,
    @JsonKey(fromJson: nullableDoubleFromJson) double? gstAmount,
    @JsonKey(fromJson: nullableStringFromJson) String? color,
    @JsonKey(fromJson: nullableStringFromJson) String? colorHex,
    @JsonKey(fromJson: nullableStringFromJson) String? size,
    @JsonKey(fromJson: nullableStringFromJson) String? metal,
    @JsonKey(fromJson: nullableStringFromJson) String? plating,
  }) = _OrderItemModel;

  factory OrderItemModel.fromJson(Map<String, dynamic> json) =>
      _$OrderItemModelFromJson(json);

  ItemOptions get options =>
      ItemOptions(color: color, colorHex: colorHex, size: size, metal: metal, plating: plating);
}

@freezed
abstract class ShippingAddressModel with _$ShippingAddressModel {
  const ShippingAddressModel._();

  const factory ShippingAddressModel({
    @JsonKey(fromJson: stringFromJson) @Default('') String fullName,
    @JsonKey(fromJson: nullableStringFromJson) String? email,
    @JsonKey(fromJson: stringFromJson) @Default('') String addressLine1,
    @JsonKey(fromJson: stringFromJson) @Default('') String addressLine2,
    @JsonKey(fromJson: stringFromJson) @Default('') String city,
    @JsonKey(fromJson: stringFromJson) @Default('') String state,
    @JsonKey(fromJson: stringFromJson) @Default('India') String country,
    @JsonKey(fromJson: stringFromJson) @Default('') String pincode,
    @JsonKey(fromJson: stringFromJson) @Default('') String mobile,
  }) = _ShippingAddressModel;

  factory ShippingAddressModel.fromJson(Map<String, dynamic> json) =>
      _$ShippingAddressModelFromJson(json);

  String get singleLine => [
        addressLine1,
        if (addressLine2.isNotEmpty) addressLine2,
        city,
        '$state - $pincode',
      ].where((e) => e.trim().isNotEmpty).join(', ');
}

@freezed
abstract class StatusHistoryModel with _$StatusHistoryModel {
  const factory StatusHistoryModel({
    @JsonKey(fromJson: stringFromJson) @Default('') String status,
    DateTime? changedAt,
    @JsonKey(fromJson: nullableStringFromJson) String? note,
  }) = _StatusHistoryModel;

  factory StatusHistoryModel.fromJson(Map<String, dynamic> json) =>
      _$StatusHistoryModelFromJson(json);
}

@freezed
abstract class CourierModel with _$CourierModel {
  const factory CourierModel({
    @JsonKey(fromJson: nullableStringFromJson) String? partner,
    @JsonKey(fromJson: nullableStringFromJson) String? courierId,
    @JsonKey(fromJson: nullableStringFromJson) String? courierName,
  }) = _CourierModel;

  factory CourierModel.fromJson(Map<String, dynamic> json) =>
      _$CourierModelFromJson(json);
}

@freezed
abstract class TrackingModel with _$TrackingModel {
  const factory TrackingModel({
    @JsonKey(fromJson: nullableStringFromJson) String? number,
    @JsonKey(fromJson: nullableStringFromJson) String? url,
    DateTime? estimatedDeliveryDate,
    @JsonKey(fromJson: stringFromJson) @Default('Not Shipped') String shipmentStatus,
    @JsonKey(fromJson: intFromJson) @Default(0) int deliveryAttempts,
    @JsonKey(fromJson: nullableStringFromJson) String? lastAttemptNote,
  }) = _TrackingModel;

  factory TrackingModel.fromJson(Map<String, dynamic> json) =>
      _$TrackingModelFromJson(json);
}

@freezed
abstract class CouponAppliedModel with _$CouponAppliedModel {
  const factory CouponAppliedModel({
    @JsonKey(fromJson: nullableStringFromJson) String? code,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double discountAmount,
  }) = _CouponAppliedModel;

  factory CouponAppliedModel.fromJson(Map<String, dynamic> json) =>
      _$CouponAppliedModelFromJson(json);
}

@freezed
abstract class PaymentInfoModel with _$PaymentInfoModel {
  const factory PaymentInfoModel({
    @JsonKey(fromJson: nullableStringFromJson) String? razorpayOrderId,
    @JsonKey(fromJson: nullableStringFromJson) String? razorpayPaymentId,
    DateTime? paidAt,
  }) = _PaymentInfoModel;

  factory PaymentInfoModel.fromJson(Map<String, dynamic> json) =>
      _$PaymentInfoModelFromJson(json);
}

@freezed
abstract class ReturnItemModel with _$ReturnItemModel {
  const factory ReturnItemModel({
    @JsonKey(fromJson: idFromJson) @Default('') String product,
    @JsonKey(fromJson: intFromJson) @Default(1) int quantity,
  }) = _ReturnItemModel;

  factory ReturnItemModel.fromJson(Map<String, dynamic> json) => _$ReturnItemModelFromJson(json);
}

/// Order.returnRequest (models/Order.js returnSchema).
@Freezed(fromJson: true, toJson: true)
abstract class ReturnRequestModel with _$ReturnRequestModel {
  const ReturnRequestModel._();

  const factory ReturnRequestModel({
    DateTime? requestedAt,
    @Default(<ReturnItemModel>[]) List<ReturnItemModel> items,
    @JsonKey(fromJson: stringFromJson) @Default('') String reason,
    @JsonKey(fromJson: nullableStringFromJson) String? comment,
    @JsonKey(fromJson: stringFromJson) @Default('Requested') String status,
    @JsonKey(fromJson: nullableStringFromJson) String? adminComment,
    @JsonKey(fromJson: refundStatusFromJson) @Default('Not Applicable') String refundStatus,
    @JsonKey(fromJson: refundAmountFromJson) @Default(0) double refundAmount,
  }) = _ReturnRequestModel;

  /// Flattens `refund.{status,amount}`.
  factory ReturnRequestModel.fromJson(Map<String, dynamic> json) {
    final flat = Map<String, dynamic>.from(json);
    final refund = json['refund'];
    if (refund is Map) {
      flat['refundStatus'] = refund['status'];
      flat['refundAmount'] = refund['amount'];
    }
    return _$ReturnRequestModelFromJson(flat);
  }

  bool get isOpen => status != 'Rejected' && status != 'Completed';
}

String refundStatusFromJson(Object? v) => v == null ? 'Not Applicable' : v.toString();
double refundAmountFromJson(Object? v) => doubleFromJson(v);

/// models/Order.js
@freezed
abstract class OrderModel with _$OrderModel {
  const OrderModel._();

  const factory OrderModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: stringFromJson) @Default('') String orderNumber,
    @JsonKey(fromJson: idFromJson) @Default('') String user,
    @Default(<OrderItemModel>[]) List<OrderItemModel> items,
    ShippingAddressModel? shippingAddress,
    CouponAppliedModel? coupon,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double discountAmount,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double discountPercentage,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double subTotal,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double shippingCharge,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double tax,

    /// true: `tax` is GST already included in the prices (not added to the total).
    @JsonKey(fromJson: boolFromJson) @Default(false) bool taxIncluded,
    @JsonKey(fromJson: doubleFromJson) @Default(0) double grandTotal,
    @JsonKey(fromJson: stringFromJson) @Default('cod') String paymentMethod,
    @JsonKey(fromJson: stringFromJson) @Default('Pending') String paymentStatus,
    PaymentInfoModel? paymentInfo,
    @JsonKey(fromJson: stringFromJson) @Default('Pending') String orderStatus,
    @Default(<StatusHistoryModel>[]) List<StatusHistoryModel> statusHistory,
    CourierModel? courier,
    TrackingModel? tracking,
    @JsonKey(fromJson: nullableStringFromJson) String? shippingNotes,
    @JsonKey(fromJson: nullableStringFromJson) String? invoiceNumber,
    DateTime? deliveredAt,
    DateTime? cancelledAt,
    @JsonKey(fromJson: nullableStringFromJson) String? cancelReason,
    ReturnRequestModel? returnRequest,
    DateTime? createdAt,
  }) = _OrderModel;

  factory OrderModel.fromJson(Map<String, dynamic> json) =>
      _$OrderModelFromJson(json);

  bool get isCod => paymentMethod == 'cod';
  bool get isPaid => paymentStatus == 'Paid';
  bool get canCancel => OrderStatus.canTransition(orderStatus, OrderStatus.cancelled);

  /// payment.controller.js#retryPayment preconditions.
  bool get canRetryPayment =>
      paymentMethod == 'razorpay' &&
      paymentStatus != 'Paid' &&
      (orderStatus == OrderStatus.pending || orderStatus == OrderStatus.confirmed);

  bool get isDelivered => orderStatus == OrderStatus.delivered;
  bool get isCancelled =>
      orderStatus == OrderStatus.cancelled || orderStatus == OrderStatus.refunded;
  bool get isActive => !isDelivered && !isCancelled && orderStatus != OrderStatus.returned;

  /// Matches the backend patch POST /orders/:id/return (default 7 days).
  static const int returnWindowDays = 7;

  bool get canRequestReturn {
    if (!isDelivered || returnRequest != null) return false;
    final at = deliveredAt;
    if (at == null) return true;
    return DateTime.now().difference(at).inDays <= returnWindowDays;
  }

  int get itemCount => items.fold(0, (s, i) => s + i.quantity);
  double get couponDiscount => coupon?.discountAmount ?? 0;
  String? get firstThumbnail =>
      items.isEmpty || items.first.thumbnail.isEmpty ? null : items.first.thumbnail;
}

class Checkpoint {
  const Checkpoint({required this.date, required this.activity, required this.location, required this.status});
  final String date;
  final String activity;
  final String location;
  final String status;

  factory Checkpoint.fromJson(Map<String, dynamic> json) => Checkpoint(
        date: stringFromJson(json['date']),
        activity: stringFromJson(json['activity'] ?? json['sr-status-label']),
        location: stringFromJson(json['location']),
        status: stringFromJson(json['sr-status-label'] ?? json['status']),
      );
}

/// GET /orders/:id/track — `live` comes from shiprocket.service#trackByAWB.
class TrackingInfo {
  const TrackingInfo({
    required this.orderNumber,
    required this.orderStatus,
    required this.statusHistory,
    this.tracking,
    this.courier,
    this.liveStatus,
    this.liveEtd,
    this.checkpoints = const <Checkpoint>[],
  });

  final String orderNumber;
  final String orderStatus;
  final TrackingModel? tracking;
  final CourierModel? courier;
  final List<StatusHistoryModel> statusHistory;
  final String? liveStatus;
  final String? liveEtd;
  final List<Checkpoint> checkpoints;

  factory TrackingInfo.fromJson(Map<String, dynamic> json) {
    final live = mapOrNull(json['live']);
    final tracking = mapOrNull(json['tracking']);
    final courier = mapOrNull(json['courier']);
    return TrackingInfo(
      orderNumber: stringFromJson(json['orderNumber']),
      orderStatus: stringFromJson(json['orderStatus']),
      tracking: tracking == null ? null : TrackingModel.fromJson(tracking),
      courier: courier == null ? null : CourierModel.fromJson(courier),
      statusHistory: mapList(json['statusHistory'])
          .map(StatusHistoryModel.fromJson)
          .toList(growable: false),
      liveStatus: nullableStringFromJson(live?['currentStatus']),
      liveEtd: nullableStringFromJson(live?['etd']),
      checkpoints: mapList(live?['checkpoints'])
          .map(Checkpoint.fromJson)
          .toList(growable: false),
    );
  }
}

/// POST /orders response for online payment and POST /payments/:id/retry.
class RazorpayOrderInfo {
  const RazorpayOrderInfo({
    required this.order,
    required this.razorpayOrderId,
    required this.amountPaise,
    required this.currency,
    required this.keyId,
  });

  final OrderModel order;
  final String razorpayOrderId;
  final int amountPaise;
  final String currency;
  final String keyId;
}

/// Result of POST /orders.
class PlacedOrder {
  const PlacedOrder({required this.order, this.razorpay});
  final OrderModel order;
  final RazorpayOrderInfo? razorpay;

  bool get requiresPayment => razorpay != null;
}
