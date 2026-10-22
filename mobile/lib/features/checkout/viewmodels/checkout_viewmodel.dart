import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/auth_models.dart';
import '../../../core/models/cart_model.dart';
import '../../../core/models/checkout_quote.dart';
import '../../../core/models/order_model.dart';
import '../../../core/models/user_model.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/core_providers.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/services/razorpay_service.dart';
import '../../cart/viewmodels/cart_viewmodel.dart';

/// Contact + delivery details collected on the checkout screen.
class CheckoutContact {
  const CheckoutContact({
    required this.firstName,
    required this.lastName,
    required this.mobile,
    required this.email,
    required this.addressLine1,
    required this.addressLine2,
    required this.city,
    required this.state,
    required this.pincode,
    this.country = 'India',
  });

  factory CheckoutContact.fromAddress(AddressModel a, UserModel? user) => CheckoutContact(
        firstName: a.firstName.isNotEmpty ? a.firstName : (user?.firstName ?? ''),
        lastName: a.firstName.isNotEmpty ? a.lastName : (user?.lastName ?? ''),
        mobile: a.phone.isNotEmpty ? a.phone : (user?.mobile ?? ''),
        email: user?.email ?? '',
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        country: a.country,
      );

  final String firstName;
  final String lastName;
  final String mobile;
  final String email;
  final String addressLine1;
  final String addressLine2;
  final String city;
  final String state;
  final String pincode;
  final String country;

  String get fullName => '$firstName $lastName'.trim();

  /// Order.shippingAddress (models/Order.js).
  Map<String, dynamic> toOrderAddress() => {
        'fullName': fullName.isEmpty ? 'Customer' : fullName,
        if (email.trim().isNotEmpty) 'email': email.trim(),
        'addressLine1': addressLine1.trim(),
        'addressLine2': addressLine2.trim(),
        'city': city.trim(),
        'state': state.trim(),
        'country': country,
        'pincode': pincode.trim(),
        'mobile': mobile,
      };

  /// checkout.controller.js#mapShippingAddress input.
  Map<String, dynamic> toCheckoutAddress() => {
        'firstName': firstName.trim(),
        'lastName': lastName.trim(),
        'addressLine1': addressLine1.trim(),
        'addressLine2': addressLine2.trim(),
        'city': city.trim(),
        'state': state.trim(),
        'country': country,
        'pincode': pincode.trim(),
        'phone': mobile,
      };
}

class CheckoutState {
  const CheckoutState({
    this.method,
    this.addressId,
    this.couponCode,
    this.couponError,
    this.quote,
    this.quoteLoading = false,
    this.quoteError,
    this.pincode,
    this.placing = false,
    this.progress,
  });

  /// Payment method id from the backend (`razorpay` / `cod`).
  final String? method;
  final String? addressId;
  final String? couponCode;
  final String? couponError;
  final CheckoutQuote? quote;
  final bool quoteLoading;
  final String? quoteError;
  final String? pincode;
  final bool placing;
  final String? progress;

  List<CheckoutPaymentMethod> get paymentMethods =>
      quote?.paymentMethods ?? const <CheckoutPaymentMethod>[];

  CheckoutState copyWith({
    String? method,
    String? addressId,
    String? couponCode,
    bool clearCoupon = false,
    String? couponError,
    bool clearCouponError = false,
    CheckoutQuote? quote,
    bool? quoteLoading,
    String? quoteError,
    bool clearQuoteError = false,
    String? pincode,
    bool? placing,
    String? progress,
    bool clearProgress = false,
  }) =>
      CheckoutState(
        method: method ?? this.method,
        addressId: addressId ?? this.addressId,
        couponCode: clearCoupon ? null : (couponCode ?? this.couponCode),
        couponError: clearCouponError ? null : (couponError ?? this.couponError),
        quote: quote ?? this.quote,
        quoteLoading: quoteLoading ?? this.quoteLoading,
        quoteError: clearQuoteError ? null : (quoteError ?? this.quoteError),
        pincode: pincode ?? this.pincode,
        placing: placing ?? this.placing,
        progress: clearProgress ? null : (progress ?? this.progress),
      );
}

/// Outcome of a checkout attempt, consumed by the screen for navigation.
sealed class CheckoutResult {
  const CheckoutResult();
}

class CheckoutSucceeded extends CheckoutResult {
  const CheckoutSucceeded(this.order);
  final OrderModel order;
}

/// Online payment was cancelled or failed — no order exists.
class CheckoutNotPlaced extends CheckoutResult {
  const CheckoutNotPlaced(this.message);
  final String message;
}

/// An existing order whose payment is still pending (retry from order details).
class CheckoutPaymentIncomplete extends CheckoutResult {
  const CheckoutPaymentIncomplete(this.order, this.message);
  final OrderModel order;
  final String message;
}

/// Result of verifying the checkout OTP.
enum OtpVerification {
  /// Signed in — continue to the order.
  verified,

  /// A guest's bag joined items already saved in their account, so the total
  /// changed; the shopper reviews the bag before placing the order again.
  bagChanged,
}

class CheckoutViewModel extends AutoDisposeNotifier<CheckoutState> {
  int _quoteRequest = 0;

  @override
  CheckoutState build() => const CheckoutState();

  void selectAddress(String id) => state = state.copyWith(addressId: id);

  void selectMethod(String method) {
    if (method == state.method) return;
    state = state.copyWith(method: method);
    refreshQuote();
  }

  /// POST /checkout/quote — totals and payment methods, priced by the backend.
  /// Called whenever the bag, pincode, payment method or coupon changes.
  Future<void> refreshQuote({String? pincode}) async {
    if (pincode != null) state = state.copyWith(pincode: pincode);
    final cart = ref.read(cartProvider).valueOrNull;
    if (cart == null || cart.isEmpty) return;
    final request = ++_quoteRequest;
    state = state.copyWith(quoteLoading: true, clearQuoteError: true);
    try {
      final authenticated = ref.read(isAuthenticatedProvider);
      final quote = await ref.read(orderRepositoryProvider).quote(
            items: authenticated ? null : _guestItems(cart),
            pincode: state.pincode,
            paymentMethod: state.method,
            couponCode: state.couponCode,
          );
      if (request != _quoteRequest) return;

      // Keep the chosen method valid for what the admin has enabled.
      final methods = quote.paymentMethods;
      final methodValid = methods.any((m) => m.id == state.method);
      if (!methodValid && methods.isNotEmpty) {
        state = state.copyWith(method: methods.first.id, quote: quote);
        await refreshQuote();
        return;
      }

      // A rejected coupon is dropped so it can't block the order.
      if (quote.couponError != null && state.couponCode != null) {
        state = state.copyWith(clearCoupon: true, couponError: quote.couponError);
        await refreshQuote();
        return;
      }
      state = state.copyWith(quote: quote, quoteLoading: false);
    } on AppException catch (e) {
      if (request != _quoteRequest) return;
      state = state.copyWith(quoteLoading: false, quoteError: e.message);
    }
  }

  List<Map<String, dynamic>> _guestItems(CartModel cart) => cart.items
      .map((i) => {
            'productId': i.product.id,
            if (i.variant != null) 'variantId': i.variant!.id,
            'quantity': i.quantity,
            if (i.color != null && i.color!.isNotEmpty) 'color': i.color,
            if (i.size != null && i.size!.isNotEmpty) 'size': i.size,
          })
      .toList(growable: false);

  Future<void> applyCoupon(String code) async {
    final clean = code.trim().toUpperCase();
    if (clean.isEmpty) return;
    state = state.copyWith(couponCode: clean, clearCouponError: true);
    await refreshQuote();
  }

  Future<void> removeCoupon() async {
    state = state.copyWith(clearCoupon: true, clearCouponError: true);
    await refreshQuote();
  }

  /// "Place order" step 1: POST /checkout/request-otp.
  Future<OtpRequestResult> requestOtp({required String mobile, String? email}) =>
      ref.read(authRepositoryProvider).requestCheckoutOtp(mobile: mobile, email: email);

  /// "Place order" step 2: POST /checkout/verify-otp → session. A guest's
  /// account is created (or signed in) and their address saved; the guest
  /// bag is merged into the server bag by AuthNotifier.completeLogin.
  Future<OtpVerification> verifyOtp({
    required String mobile,
    required String otp,
    CheckoutContact? guest,
  }) async {
    final guestSubTotal = guest == null ? null : ref.read(cartProvider).valueOrNull?.subTotal;
    final session = await ref.read(authRepositoryProvider).verifyCheckoutOtp(
          mobile: mobile,
          otp: otp,
          name: guest?.fullName,
          email: guest?.email,
          shippingAddress: guest?.toCheckoutAddress(),
          saveAddress: guest != null,
        );
    await ref.read(authProvider.notifier).completeLogin(session);
    await ref.read(cartProvider.notifier).refresh();
    if (guestSubTotal != null) {
      final merged = ref.read(cartProvider).valueOrNull?.subTotal ?? guestSubTotal;
      if ((merged - guestSubTotal).abs() > 0.009) {
        await refreshQuote();
        return OtpVerification.bagChanged;
      }
    }
    return OtpVerification.verified;
  }

  /// "Place order" step 3 — COD: POST /orders. Online: POST /payments/intent →
  /// Razorpay → POST /payments/intent/confirm (the order is created only
  /// after the payment is verified).
  Future<CheckoutResult> placeOrder(CheckoutContact contact, {String? notes}) async {
    final method = state.method;
    if (method == null) {
      throw const AppException(AppErrorType.validation, 'Please choose a payment method.');
    }
    state = state.copyWith(placing: true, progress: 'Placing your order…');
    final orders = ref.read(orderRepositoryProvider);
    try {
      final cart = await ref.read(cartProvider.future);
      if (cart.isEmpty) {
        throw const AppException(AppErrorType.validation, 'Your bag is empty.');
      }

      if (method == 'cod') {
        final placed = await orders.createOrder(
          shippingAddress: contact.toOrderAddress(),
          paymentMethod: method,
          couponCode: state.couponCode,
          shippingNotes: notes,
        );
        _finish();
        return CheckoutSucceeded(placed.order);
      }

      state = state.copyWith(progress: 'Opening secure payment…');
      final intent = await orders.createPaymentIntent(
        shippingAddress: contact.toOrderAddress(),
        couponCode: state.couponCode,
        shippingNotes: notes,
      );
      final outcome = await ref.read(razorpayServiceProvider).pay(RazorpayCheckoutRequest(
            keyId: intent.keyId,
            razorpayOrderId: intent.razorpayOrderId,
            amountPaise: intent.amountPaise,
            currency: intent.currency,
            description: 'Order payment',
            customerName: contact.fullName,
            customerMobile: contact.mobile,
            customerEmail: contact.email,
          ));

      switch (outcome.type) {
        case RazorpayOutcomeType.success:
          state = state.copyWith(progress: 'Confirming your payment…');
          final order = await orders.confirmPaymentIntent(outcome);
          _finish();
          return CheckoutSucceeded(order);
        case RazorpayOutcomeType.cancelled:
          _stop();
          return const CheckoutNotPlaced('Payment cancelled — no order was placed.');
        case RazorpayOutcomeType.failed:
          _stop();
          return CheckoutNotPlaced(
              outcome.message ?? 'Payment failed — no order was placed. You can try again.');
        case RazorpayOutcomeType.externalWallet:
          _stop();
          return CheckoutNotPlaced(
              'Complete the payment in ${outcome.wallet ?? 'your wallet app'}. Your order appears in My Orders once the payment is confirmed.');
      }
    } catch (e) {
      _stop();
      rethrow;
    }
  }

  void _finish() {
    ref.read(cartProvider.notifier).markCleared();
    _stop();
  }

  void _stop() => state = state.copyWith(placing: false, clearProgress: true);

  /// "Retry payment" for an existing pending online order (order details):
  /// POST /payments/:orderId/retry → Razorpay → POST /payments/verify.
  Future<CheckoutResult> retryPayment(OrderModel order) async {
    state = state.copyWith(placing: true, progress: 'Preparing payment…');
    final orders = ref.read(orderRepositoryProvider);
    try {
      final info = await orders.retryPayment(order.id);
      state = state.copyWith(progress: 'Opening secure payment…');
      final outcome = await ref.read(razorpayServiceProvider).pay(RazorpayCheckoutRequest(
            keyId: info.keyId,
            razorpayOrderId: info.razorpayOrderId,
            amountPaise: info.amountPaise,
            currency: info.currency,
            description: 'Order #${info.order.orderNumber}',
            customerName: info.order.shippingAddress?.fullName,
            customerMobile: info.order.shippingAddress?.mobile,
            customerEmail: info.order.shippingAddress?.email,
          ));
      switch (outcome.type) {
        case RazorpayOutcomeType.success:
          state = state.copyWith(progress: 'Confirming your payment…');
          try {
            final paid = await orders.verifyPayment(orderId: info.order.id, outcome: outcome);
            _stop();
            return CheckoutSucceeded(paid);
          } on AppException catch (e) {
            _stop();
            return CheckoutPaymentIncomplete(info.order,
                'We could not confirm your payment yet (${e.message}). If money was debited it will be reconciled automatically.');
          }
        case RazorpayOutcomeType.cancelled:
          await orders.reportPaymentCancelled(info.order.id);
          _stop();
          return CheckoutPaymentIncomplete(info.order, 'Payment was cancelled. You can retry payment from your order.');
        case RazorpayOutcomeType.failed:
          await orders.reportPaymentFailure(orderId: info.order.id, reason: outcome.message);
          _stop();
          return CheckoutPaymentIncomplete(info.order, outcome.message ?? 'Payment failed. Please retry from your order.');
        case RazorpayOutcomeType.externalWallet:
          _stop();
          return CheckoutPaymentIncomplete(info.order,
              'Complete the payment in ${outcome.wallet ?? 'your wallet app'}. Your order updates automatically.');
      }
    } catch (e) {
      _stop();
      rethrow;
    }
  }
}

final checkoutProvider =
    AutoDisposeNotifierProvider<CheckoutViewModel, CheckoutState>(CheckoutViewModel.new);

/// In-flight flag without rebuilding on every checkout state change.
final checkoutPlacingProvider =
    Provider.autoDispose<bool>((ref) => ref.watch(checkoutProvider.select((s) => s.placing)));
