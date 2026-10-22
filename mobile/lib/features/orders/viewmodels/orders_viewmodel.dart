import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/order_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/core_providers.dart';
import '../../../core/providers/repository_providers.dart';

/// GET /orders/my-orders
final myOrdersProvider = FutureProvider.autoDispose<List<OrderModel>>((ref) {
  if (!ref.watch(isAuthenticatedProvider)) return Future.value(const <OrderModel>[]);
  return ref.watch(orderRepositoryProvider).myOrders();
});

/// GET /orders/:id
final orderDetailProvider = FutureProvider.autoDispose.family<OrderModel, String>(
    (ref, id) => ref.watch(orderRepositoryProvider).order(id));

/// GET /orders/:id/track
final trackingProvider = FutureProvider.autoDispose.family<TrackingInfo, String>(
    (ref, id) => ref.watch(orderRepositoryProvider).track(id));

class OrderActions {
  OrderActions(this._ref);
  final Ref _ref;

  Future<OrderModel> cancel(String orderId, String reason) async {
    final order = await _ref.read(orderRepositoryProvider).cancel(orderId, reason: reason);
    _ref.invalidate(orderDetailProvider(orderId));
    _ref.invalidate(myOrdersProvider);
    _ref.invalidate(trackingProvider(orderId));
    return order;
  }

  /// GET /orders/:id/invoice → temp PDF → opens it. Returns a message when it can't be opened.
  Future<String?> openInvoice(OrderModel order) async {
    // Saving and opening files needs the mobile file system.
    if (kIsWeb) return 'Invoice download is available in the Swastikala app.';
    final files = _ref.read(fileServiceProvider);
    final path = await files.tempPath('invoice-${order.orderNumber.isEmpty ? order.id : order.orderNumber}.pdf');
    await _ref.read(orderRepositoryProvider).downloadInvoice(order.id, path);
    return files.open(path);
  }
}

final orderActionsProvider = Provider<OrderActions>((ref) => OrderActions(ref));
