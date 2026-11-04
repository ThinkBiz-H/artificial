import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/app_providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/utils/extensions.dart';
import '../../core/utils/formatters.dart';

/// Where a bag stands against the wholesale minimum (Admin > Settings > Wholesale).
class MinimumOrderStatus {
  const MinimumOrderStatus({required this.value, required this.subTotal});
  final double value;
  final double subTotal;

  bool get enabled => value > 0;
  double get remaining => (value - subTotal).clamp(0, double.infinity).toDouble();
  bool get met => remaining <= 0;
  double get progress => value <= 0 ? 1 : (subTotal / value).clamp(0.0, 1.0);
}

MinimumOrderStatus minimumOrderStatus(WidgetRef ref, double subTotal) =>
    MinimumOrderStatus(value: ref.watch(settingsValueProvider).effectiveMinOrder, subTotal: subTotal);

/// Wholesale minimum bar — styled exactly like the cart's free-shipping bar.
/// Display only: checkout enforces the same minimum on the server.
class MinimumOrderProgress extends ConsumerWidget {
  const MinimumOrderProgress({super.key, required this.subTotal});
  final double subTotal;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsValueProvider);
    final status = minimumOrderStatus(ref, subTotal);
    if (!status.enabled) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.champagne.withValues(alpha: context.isDark ? 0.08 : 0.6),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.local_shipping_outlined, size: 18, color: AppColors.wine),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  status.met
                      ? (settings.freeDeliveryAlways ? 'Yay! Your order ships free' : 'Minimum order reached')
                      : 'Minimum wholesale order is ${Formatters.currency(status.value)} — add ${Formatters.currency(status.remaining)} more',
                  style: context.text.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: status.progress,
              minHeight: 6,
              backgroundColor: AppColors.roseGoldLight.withValues(alpha: 0.4),
              color: status.met ? AppColors.success : AppColors.roseGold,
            ),
          ),
        ],
      ),
    );
  }
}
