import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/order_model.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/line_options.dart';
import '../../../shared/widgets/start_chat_button.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/buttons.dart';
import '../../../shared/widgets/dialogs.dart';
import '../../../shared/widgets/state_views.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../checkout/viewmodels/checkout_viewmodel.dart';
import '../../product/presentation/reviews_widgets.dart';
import '../../tracking/presentation/status_timeline.dart';
import '../viewmodels/orders_viewmodel.dart';
import 'return_request_sheet.dart';

class OrderDetailScreen extends ConsumerStatefulWidget {
  const OrderDetailScreen({super.key, required this.orderId});
  final String orderId;

  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  bool _invoiceLoading = false;
  bool _cancelling = false;

  Future<void> _cancel(OrderModel order) async {
    final reason = await showAppSheet<String>(
      context,
      title: 'Cancel order',
      builder: (_) => const _CancelReasonPicker(),
    );
    if (reason == null || !mounted) return;
    setState(() => _cancelling = true);
    try {
      await ref.read(orderActionsProvider).cancel(order.id, reason);
      if (mounted) context.showSnack('Order cancelled');
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  Future<void> _invoice(OrderModel order) async {
    setState(() => _invoiceLoading = true);
    try {
      final error = await ref.read(orderActionsProvider).openInvoice(order);
      if (error != null && mounted) context.showSnack(error, error: true);
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _invoiceLoading = false);
    }
  }

  Future<void> _retryPayment(OrderModel order) async {
    try {
      final result = await ref.read(checkoutProvider.notifier).retryPayment(order);
      if (!mounted) return;
      switch (result) {
        case CheckoutSucceeded(:final order):
          context.go(RoutePaths.orderSuccess(order.id));
        case CheckoutPaymentIncomplete(:final message):
        case CheckoutNotPlaced(:final message):
          context.showSnack(message, error: true);
          ref.invalidate(orderDetailProvider(widget.orderId));
      }
    } catch (e) {
      if (mounted) context.showError(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(orderDetailProvider(widget.orderId));
    final paying = ref.watch(checkoutPlacingProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Order details')),
      body: async.when(
        loading: () => const LoadingView(),
        error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(orderDetailProvider(widget.orderId))),
        data: (order) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(orderDetailProvider(widget.orderId));
            try {
              await ref.read(orderDetailProvider(widget.orderId).future);
            } catch (_) {}
          },
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              _Header(order: order),
              if (order.canRetryPayment) ...[
                const SizedBox(height: AppSpacing.md),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Payment ${order.paymentStatus.toLowerCase()}',
                          style: context.text.titleMedium?.copyWith(color: AppColors.warning)),
                      const SizedBox(height: 4),
                      Text('Complete the payment to confirm this order.', style: context.text.bodySmall),
                      const SizedBox(height: AppSpacing.sm),
                      PrimaryButton(
                        label: 'Retry payment · ${Formatters.currency(order.grandTotal)}',
                        loading: paying,
                        onPressed: () => _retryPayment(order),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: AppSpacing.lg),
              Text('Status', style: context.text.headlineSmall),
              const SizedBox(height: AppSpacing.sm),
              StatusTimeline(currentStatus: order.orderStatus, history: order.statusHistory),
              if (!order.isCancelled)
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton.icon(
                    onPressed: () => context.push(RoutePaths.trackOrder(order.id)),
                    icon: const Icon(Icons.local_shipping_outlined),
                    label: const Text('TRACK SHIPMENT'),
                  ),
                ),
              const Divider(height: AppSpacing.xl),
              Text('Items', style: context.text.headlineSmall),
              ...order.items.map((i) => _ItemRow(item: i, delivered: order.isDelivered)),
              const Divider(height: AppSpacing.xl),
              Text('Delivery address', style: context.text.headlineSmall),
              const SizedBox(height: 6),
              if (order.shippingAddress != null) ...[
                Text(order.shippingAddress!.fullName, style: context.text.titleMedium),
                Text(order.shippingAddress!.singleLine, style: context.text.bodyMedium),
                if (order.shippingAddress!.mobile.isNotEmpty)
                  Text('Mobile: ${Formatters.mobile(order.shippingAddress!.mobile)}', style: context.text.bodySmall),
              ],
              if (order.shippingNotes != null && order.shippingNotes!.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text('Note: ${order.shippingNotes}', style: context.text.bodySmall),
              ],
              const Divider(height: AppSpacing.xl),
              _Totals(order: order),
              const SizedBox(height: AppSpacing.lg),
              SecondaryButton(
                label: 'Download invoice',
                icon: Icons.receipt_long_outlined,
                loading: _invoiceLoading,
                onPressed: () => _invoice(order),
              ),
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.sm),
                  child: StartChatButton(
                    orderNumber: order.orderNumber,
                    customerName: order.shippingAddress?.fullName ?? '',
                  ),
                ),
              ),
              if (order.returnRequest != null) ...[
                const SizedBox(height: AppSpacing.md),
                ReturnStatusCard(request: order.returnRequest!),
              ],
              if (order.canRequestReturn) ...[
                const SizedBox(height: AppSpacing.sm),
                SecondaryButton(
                  label: 'Request return',
                  icon: Icons.assignment_return_outlined,
                  onPressed: () => context.push(RoutePaths.contactAboutOrder(order.orderNumber)),
                ),
              ],
              if (order.canCancel) ...[
                const SizedBox(height: AppSpacing.sm),
                TextButton(
                  onPressed: _cancelling ? null : () => _cancel(order),
                  style: TextButton.styleFrom(foregroundColor: context.colors.error),
                  child: Text(_cancelling ? 'CANCELLING…' : 'CANCEL ORDER'),
                ),
              ],
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text('#${order.orderNumber}', style: context.text.headlineSmall)),
                StatusChip(label: order.orderStatus),
              ],
            ),
            const SizedBox(height: 4),
            Text('Placed on ${Formatters.dateTime(order.createdAt)}', style: context.text.bodySmall),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                StatusChip(
                  label: order.isCod ? 'Cash on delivery' : 'Online payment',
                  color: AppColors.info,
                ),
                StatusChip(
                  label: 'Payment ${order.paymentStatus}',
                  color: StatusChip.colorForPayment(order.paymentStatus),
                ),
              ],
            ),
            if (order.tracking?.estimatedDeliveryDate != null && order.isActive) ...[
              const SizedBox(height: 8),
              Text('Estimated delivery: ${Formatters.date(order.tracking!.estimatedDeliveryDate)}',
                  style: context.text.bodyMedium?.copyWith(color: AppColors.success, fontWeight: FontWeight.w600)),
            ],
            if (order.cancelReason != null && order.isCancelled) ...[
              const SizedBox(height: 8),
              Text('Reason: ${order.cancelReason}', style: context.text.bodySmall),
            ],
          ],
        ),
      ),
    );
  }
}

class _ItemRow extends StatelessWidget {
  const _ItemRow({required this.item, required this.delivered});
  final OrderItemModel item;
  final bool delivered;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 64,
            height: 76,
            child: AppNetworkImage(url: item.thumbnail, targetWidth: 140, borderRadius: BorderRadius.circular(8)),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.title, style: context.text.titleSmall, maxLines: 2, overflow: TextOverflow.ellipsis),
                if (!item.options.isEmpty) ...[
                  const SizedBox(height: 2),
                  LineOptions(options: item.options, stacked: true),
                ],
                if (item.sku.isNotEmpty) Text('SKU ${item.sku}', style: context.text.bodySmall),
                Text('Qty ${item.quantity} × ${Formatters.currency(item.price)}', style: context.text.bodySmall),
                if (delivered && item.product.isNotEmpty)
                  TextButton(
                    style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 32)),
                    onPressed: () => showReviewForm(context, productId: item.product),
                    child: const Text('RATE & REVIEW'),
                  ),
              ],
            ),
          ),
          Text(Formatters.currency(item.price * item.quantity), style: context.text.titleSmall),
        ],
      ),
    );
  }
}

class _Totals extends StatelessWidget {
  const _Totals({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    Widget row(String l, String v, {Color? color, bool bold = false}) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 3),
          child: Row(
            children: [
              Expanded(child: Text(l, style: bold ? context.text.titleMedium : context.text.bodyMedium)),
              Text(v, style: (bold ? context.text.titleLarge : context.text.bodyMedium)?.copyWith(color: color)),
            ],
          ),
        );
    return Column(
      children: [
        row('Subtotal', Formatters.currency(order.subTotal)),
        if (order.couponDiscount > 0)
          row('Coupon ${order.coupon?.code ?? ''}', '− ${Formatters.currency(order.couponDiscount)}',
              color: AppColors.success),
        if (order.discountAmount > 0)
          row(
              order.discountPercentage > 0
                  ? 'Prepaid discount (${Formatters.trimNumber(order.discountPercentage)}%)'
                  : 'Prepaid discount',
              '− ${Formatters.currency(order.discountAmount)}',
              color: AppColors.success),
        row('Shipping', order.shippingCharge == 0 ? 'FREE' : Formatters.currency(order.shippingCharge)),
        if (order.tax > 0) row(order.taxIncluded ? 'GST (included)' : 'GST', Formatters.currency(order.tax)),
        const Divider(),
        row('Total', Formatters.currency(order.grandTotal), bold: true),
      ],
    );
  }
}

class _CancelReasonPicker extends StatefulWidget {
  const _CancelReasonPicker();

  @override
  State<_CancelReasonPicker> createState() => _CancelReasonPickerState();
}

class _CancelReasonPickerState extends State<_CancelReasonPicker> {
  static const _reasons = [
    'Ordered by mistake',
    'Found a better price',
    'Delivery is taking too long',
    'Want to change size / colour',
    'Changed my mind',
    'Other',
  ];
  String? _reason;
  final _other = TextEditingController();

  @override
  void dispose() {
    _other.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ..._reasons.map((r) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(
                  r == _reason ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                  color: context.colors.primary,
                ),
                title: Text(r),
                onTap: () => setState(() => _reason = r),
              )),
          if (_reason == 'Other')
            TextField(
              controller: _other,
              maxLength: 200,
              decoration: const InputDecoration(hintText: 'Tell us more'),
            ),
          const SizedBox(height: AppSpacing.md),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: context.colors.error),
            onPressed: _reason == null
                ? null
                : () => Navigator.of(context).pop(
                    _reason == 'Other' && _other.text.trim().isNotEmpty ? _other.text.trim() : _reason),
            child: const Text('CANCEL ORDER'),
          ),
        ],
      ),
    );
  }
}
