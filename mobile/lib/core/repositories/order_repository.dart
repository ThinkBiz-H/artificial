import '../network/api_client.dart';
import '../network/api_endpoints.dart';
import '../network/api_exception.dart';
import '../models/checkout_quote.dart';
import '../models/json_converters.dart';
import '../models/order_model.dart';
import '../services/razorpay_service.dart';

/// routes/order.routes.js + routes/payment.routes.js + POST /checkout/quote.
///
/// Checkout (same as the website):
///   COD:    POST /orders {paymentMethod:'cod'} → order placed, cart cleared.
///   Online: POST /payments/intent → Razorpay SDK → POST /payments/intent/confirm
///           → order created Paid/Confirmed (no order exists before payment).
/// Retry for older pending online orders: POST /payments/:id/retry → /payments/verify.
class OrderRepository {
  OrderRepository(this._api);

  final ApiClient _api;

  Future<PlacedOrder> createOrder({
    required Map<String, dynamic> shippingAddress,
    required String paymentMethod,
    String? couponCode,
    String? shippingNotes,
  }) async {
    final res = await _api.post(ApiEndpoints.orders, data: {
      'shippingAddress': shippingAddress,
      'paymentMethod': paymentMethod,
      if (couponCode != null && couponCode.isNotEmpty) 'couponCode': couponCode,
      if (shippingNotes != null && shippingNotes.trim().isNotEmpty)
        'shippingNotes': shippingNotes.trim(),
    });
    final order = OrderModel.fromJson(res.map('order') ?? const {});
    if (paymentMethod != 'razorpay') return PlacedOrder(order: order);
    return PlacedOrder(order: order, razorpay: _razorpayInfo(res, order));
  }

  RazorpayOrderInfo _razorpayInfo(ApiResponse res, OrderModel order) {
    final rzp = res.map('razorpayOrder');
    final keyId = stringFromJson(res.data['razorpayKeyId']);
    if (rzp == null || keyId.isEmpty) {
      throw const AppException(AppErrorType.server,
          'Online payment is not available right now. Please choose another method.');
    }
    return RazorpayOrderInfo(
      order: order,
      razorpayOrderId: stringFromJson(rzp['id']),
      amountPaise: intFromJson(rzp['amount']),
      currency: stringFromJson(rzp['currency']).isEmpty ? 'INR' : stringFromJson(rzp['currency']),
      keyId: keyId,
    );
  }

  /// POST /checkout/quote — totals and enabled payment methods, priced by the
  /// backend exactly as the order will be. Signed-in shoppers are priced from
  /// their server bag; guests send [items].
  Future<CheckoutQuote> quote({
    List<Map<String, dynamic>>? items,
    String? pincode,
    String? paymentMethod,
    String? couponCode,
  }) async {
    final res = await _api.post(ApiEndpoints.checkoutQuote, data: {
      if (items != null) 'items': items,
      if (pincode != null && pincode.isNotEmpty) 'pincode': pincode,
      if (paymentMethod != null) 'paymentMethod': paymentMethod,
      if (couponCode != null && couponCode.isNotEmpty) 'couponCode': couponCode,
    });
    return CheckoutQuote.fromJson(res.data);
  }

  /// POST /payments/intent — online checkout step 1.
  Future<PaymentIntentInfo> createPaymentIntent({
    required Map<String, dynamic> shippingAddress,
    String? couponCode,
    String? shippingNotes,
  }) async {
    final res = await _api.post(ApiEndpoints.paymentIntent, data: {
      'shippingAddress': shippingAddress,
      if (couponCode != null && couponCode.isNotEmpty) 'couponCode': couponCode,
      if (shippingNotes != null && shippingNotes.trim().isNotEmpty) 'shippingNotes': shippingNotes.trim(),
    });
    final rzp = res.map('razorpayOrder');
    final keyId = stringFromJson(res.data['razorpayKeyId']);
    if (rzp == null || keyId.isEmpty) {
      throw const AppException(AppErrorType.server,
          'Online payment is not available right now. Please choose another method.');
    }
    final currency = stringFromJson(rzp['currency']);
    return PaymentIntentInfo(
      razorpayOrderId: stringFromJson(rzp['id']),
      amountPaise: intFromJson(rzp['amount']),
      currency: currency.isEmpty ? 'INR' : currency,
      keyId: keyId,
    );
  }

  /// POST /payments/intent/confirm — verifies the signature and creates the order.
  Future<OrderModel> confirmPaymentIntent(RazorpayOutcome outcome) async {
    final res = await _api.post(ApiEndpoints.confirmPaymentIntent, data: {
      'razorpay_order_id': outcome.orderId,
      'razorpay_payment_id': outcome.paymentId,
      'razorpay_signature': outcome.signature,
    });
    return OrderModel.fromJson(res.map('order') ?? const {});
  }

  Future<List<OrderModel>> myOrders() async {
    final res = await _api.get(ApiEndpoints.myOrders);
    return res.list('orders').map(OrderModel.fromJson).toList(growable: false);
  }

  Future<OrderModel> order(String id) async {
    final res = await _api.get(ApiEndpoints.order(id));
    return OrderModel.fromJson(res.map('order') ?? const {});
  }

  Future<OrderModel> cancel(String id, {String? reason}) async {
    final res = await _api.patch(ApiEndpoints.cancelOrder(id), data: {
      if (reason != null && reason.trim().isNotEmpty) 'reason': reason.trim(),
    });
    return OrderModel.fromJson(res.map('order') ?? const {});
  }

  Future<TrackingInfo> track(String id) async {
    final res = await _api.get(ApiEndpoints.trackOrder(id));
    return TrackingInfo.fromJson(res.data);
  }

  Future<String> downloadInvoice(String id, String savePath) =>
      _api.download(ApiEndpoints.invoice(id), savePath);

  // ---------------- Payments ----------------

  Future<OrderModel> verifyPayment({
    required String orderId,
    required RazorpayOutcome outcome,
  }) async {
    final res = await _api.post(ApiEndpoints.verifyPayment, data: {
      'orderId': orderId,
      'razorpay_order_id': outcome.orderId,
      'razorpay_payment_id': outcome.paymentId,
      'razorpay_signature': outcome.signature,
    });
    return OrderModel.fromJson(res.map('order') ?? const {});
  }

  Future<void> reportPaymentFailure({required String orderId, String? reason}) async {
    try {
      await _api.post(ApiEndpoints.paymentFailure,
          data: {'orderId': orderId, if (reason != null) 'reason': reason});
    } on AppException {
      // Best-effort; the Razorpay webhook reconciles server-side as well.
    }
  }

  Future<void> reportPaymentCancelled(String orderId) async {
    try {
      await _api.post(ApiEndpoints.paymentCancelled, data: {'orderId': orderId});
    } on AppException {
      // Best-effort.
    }
  }

  Future<RazorpayOrderInfo> retryPayment(String orderId) async {
    final res = await _api.post(ApiEndpoints.retryPayment(orderId));
    final order = OrderModel.fromJson(res.map('order') ?? const {});
    return _razorpayInfo(res, order);
  }
}
