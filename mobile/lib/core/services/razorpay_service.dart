import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../config/app_config.dart';

enum RazorpayOutcomeType { success, cancelled, failed, externalWallet }

class RazorpayOutcome {
  const RazorpayOutcome._(this.type,
      {this.paymentId, this.orderId, this.signature, this.message, this.wallet});

  factory RazorpayOutcome.success(PaymentSuccessResponse r) => RazorpayOutcome._(
        RazorpayOutcomeType.success,
        paymentId: r.paymentId,
        orderId: r.orderId,
        signature: r.signature,
      );

  factory RazorpayOutcome.failure(PaymentFailureResponse r) {
    final cancelled = r.code == Razorpay.PAYMENT_CANCELLED;
    return RazorpayOutcome._(
      cancelled ? RazorpayOutcomeType.cancelled : RazorpayOutcomeType.failed,
      message: (r.message == null || r.message!.isEmpty)
          ? (cancelled ? 'Payment cancelled' : 'Payment failed')
          : r.message,
    );
  }

  factory RazorpayOutcome.wallet(ExternalWalletResponse r) => RazorpayOutcome._(
        RazorpayOutcomeType.externalWallet,
        wallet: r.walletName,
      );

  final RazorpayOutcomeType type;
  final String? paymentId;
  final String? orderId;
  final String? signature;
  final String? message;
  final String? wallet;

  bool get isSuccess =>
      type == RazorpayOutcomeType.success &&
      paymentId != null &&
      orderId != null &&
      signature != null;
}

class RazorpayCheckoutRequest {
  const RazorpayCheckoutRequest({
    required this.keyId,
    required this.razorpayOrderId,
    required this.amountPaise,
    required this.currency,
    required this.description,
    this.customerName,
    this.customerMobile,
    this.customerEmail,
  });

  final String keyId;
  final String razorpayOrderId;
  final int amountPaise;
  final String currency;
  final String description;
  final String? customerName;
  final String? customerMobile;
  final String? customerEmail;
}

/// Wraps the callback-based Razorpay SDK into a single Future. A fresh
/// Razorpay instance is created per payment and cleared afterwards — no
/// `late` fields, so there is no LateInitializationError path.
class RazorpayService {
  Future<RazorpayOutcome> pay(RazorpayCheckoutRequest request) {
    // razorpay_flutter has no web implementation.
    if (kIsWeb) {
      return Future.value(const RazorpayOutcome._(RazorpayOutcomeType.failed,
          message: 'Online payment is available in the Swastikala app. Please choose Cash on Delivery here.'));
    }
    final completer = Completer<RazorpayOutcome>();
    final razorpay = Razorpay();

    void finish(RazorpayOutcome outcome) {
      if (!completer.isCompleted) completer.complete(outcome);
      razorpay.clear();
    }

    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, (dynamic r) {
      finish(RazorpayOutcome.success(r as PaymentSuccessResponse));
    });
    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, (dynamic r) {
      finish(RazorpayOutcome.failure(r as PaymentFailureResponse));
    });
    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, (dynamic r) {
      // External wallets complete asynchronously through Razorpay's own
      // flow; the final result is reconciled by the backend webhook.
      finish(RazorpayOutcome.wallet(r as ExternalWalletResponse));
    });

    final prefill = <String, dynamic>{
      if (request.customerMobile != null) 'contact': request.customerMobile,
      if (request.customerEmail != null && request.customerEmail!.isNotEmpty)
        'email': request.customerEmail,
      if (request.customerName != null) 'name': request.customerName,
    };

    try {
      razorpay.open(<String, dynamic>{
        'key': request.keyId,
        'amount': request.amountPaise,
        'currency': request.currency,
        'order_id': request.razorpayOrderId,
        'name': AppConfig.razorpayMerchantName,
        'description': request.description,
        'prefill': prefill,
        'theme': <String, dynamic>{'color': AppConfig.razorpayThemeHex},
        'retry': <String, dynamic>{'enabled': true, 'max_count': 2},
        'send_sms_hash': true,
      });
    } catch (e) {
      finish(RazorpayOutcome._(RazorpayOutcomeType.failed,
          message: 'Unable to open payment window. Please try again.'));
    }
    return completer.future;
  }
}
