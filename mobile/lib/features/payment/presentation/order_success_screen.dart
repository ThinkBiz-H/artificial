import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/order_model.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/line_options.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/start_chat_button.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../orders/viewmodels/orders_viewmodel.dart';

/// Order confirmation — mirrors the website's OrderSuccessPage.
class OrderSuccessScreen extends ConsumerWidget {
  const OrderSuccessScreen({super.key, required this.orderId});
  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(orderDetailProvider(orderId));
    final order = async.valueOrNull;
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) context.go(RoutePaths.home);
      },
      child: Scaffold(
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.xxl, AppSpacing.md, AppSpacing.xl),
            children: [
              Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(color: AppColors.wine, shape: BoxShape.circle),
                    child: const Icon(Icons.check_rounded, size: 30, color: AppColors.ivory),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text('THANK YOU', style: AppTypography.overline(AppColors.roseGold)),
                  const SizedBox(height: 6),
                  Text('Your order is placed', style: context.text.displaySmall, textAlign: TextAlign.center),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    "We've received your order and will notify you at every step — from packing to your doorstep.",
                    style: context.text.bodyLarge?.copyWith(color: context.colors.onSurfaceVariant),
                    textAlign: TextAlign.center,
                  ),
                ],
              ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.06, end: 0, curve: Curves.easeOutCubic),
              const SizedBox(height: AppSpacing.xl),
              if (async.isLoading && order == null)
                const ShimmerBox(height: 224, radius: AppRadius.lg)
              else if (order != null)
                _OrderCard(order: order),
              const SizedBox(height: AppSpacing.xl),
              const _InfoTiles(),
              const SizedBox(height: AppSpacing.xl),
              OutlinedButton(
                onPressed: () => context.go(RoutePaths.order(orderId)),
                child: const Text('VIEW ORDER'),
              ),
              const SizedBox(height: AppSpacing.sm),
              ElevatedButton(
                onPressed: () => context.go(RoutePaths.products),
                child: const Text('CONTINUE SHOPPING'),
              ),
              if (order != null) ...[
                const SizedBox(height: AppSpacing.sm),
                Center(
                  child: StartChatButton(
                    orderNumber: order.orderNumber,
                    customerName: order.shippingAddress?.fullName ?? '',
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    Widget fact(String label, Widget value) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: context.text.bodySmall),
            const SizedBox(height: 2),
            value,
          ],
        );
    final address = order.shippingAddress;
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: context.colors.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Wrap(
              spacing: AppSpacing.xl,
              runSpacing: AppSpacing.md,
              children: [
                fact('Order number', Text('#${order.orderNumber}', style: context.text.titleSmall?.copyWith(fontWeight: FontWeight.w600))),
                fact('Total', Text(Formatters.currency(order.grandTotal), style: context.text.titleSmall?.copyWith(fontWeight: FontWeight.w600))),
                fact(
                  'Payment',
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(order.isCod ? 'Cash on delivery' : 'Online', style: context.text.bodyMedium),
                      if (!order.isCod) ...[
                        const SizedBox(width: 8),
                        StatusChip(label: order.paymentStatus, color: StatusChip.colorForPayment(order.paymentStatus)),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: context.colors.outline),
          for (final item in order.items)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 12),
              child: Row(
                children: [
                  SizedBox(
                    width: 56,
                    height: 64,
                    child: AppNetworkImage(url: item.thumbnail, targetWidth: 140, borderRadius: BorderRadius.circular(AppRadius.lg)),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: context.text.bodyMedium),
                        if (!item.options.isEmpty) LineOptions(options: item.options),
                        Text('Qty ${item.quantity}', style: context.text.bodySmall),
                      ],
                    ),
                  ),
                  Text(Formatters.currency(item.price * item.quantity),
                      style: context.text.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          if (address != null) ...[
            Divider(height: 1, color: context.colors.outline),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Delivering to', style: context.text.bodySmall),
                  const SizedBox(height: 4),
                  Text.rich(TextSpan(
                    children: [
                      TextSpan(text: address.fullName, style: const TextStyle(fontWeight: FontWeight.w500)),
                      TextSpan(text: ', ${address.addressLine1}, ${address.city}, ${address.state} ${address.pincode}'),
                    ],
                    style: context.text.bodyMedium,
                  )),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoTiles extends StatelessWidget {
  const _InfoTiles();

  @override
  Widget build(BuildContext context) {
    const tiles = [
      (Icons.mail_outline_rounded, 'Confirmation sent', 'Order details are on their way to you.'),
      (Icons.inventory_2_outlined, 'Packed with care', "We'll update you once it's packed."),
      (Icons.local_shipping_outlined, 'Track anytime', 'Follow your parcel from My Orders.'),
    ];
    return Column(
      children: [
        for (final (icon, title, text) in tiles)
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: AppSpacing.sm),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.ivoryDeep.withValues(alpha: context.isDark ? 0.08 : 0.6),
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
            child: Column(
              children: [
                Icon(icon, size: 20, color: AppColors.roseGold),
                const SizedBox(height: 6),
                Text(title, style: context.text.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(text, style: context.text.bodySmall, textAlign: TextAlign.center),
              ],
            ),
          ),
      ],
    );
  }
}
