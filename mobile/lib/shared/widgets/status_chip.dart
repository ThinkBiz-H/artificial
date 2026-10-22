import 'package:flutter/material.dart';

import '../../core/models/order_model.dart';
import '../../core/theme/app_colors.dart';

class StatusChip extends StatelessWidget {
  const StatusChip({super.key, required this.label, this.color});
  final String label;
  final Color? color;

  static Color colorForOrder(String status) {
    switch (status) {
      case OrderStatus.delivered:
        return AppColors.success;
      case OrderStatus.cancelled:
      case OrderStatus.refunded:
      case OrderStatus.returned:
        return AppColors.error;
      case OrderStatus.shipped:
      case OrderStatus.outForDelivery:
        return AppColors.info;
      case OrderStatus.pending:
        return AppColors.warning;
      default:
        return AppColors.roseGold;
    }
  }

  static Color colorForPayment(String status) {
    switch (status) {
      case 'Paid':
        return AppColors.success;
      case 'Failed':
        return AppColors.error;
      case 'Refunded':
      case 'Partially Refunded':
        return AppColors.info;
      default:
        return AppColors.warning;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = color ?? colorForOrder(label);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label,
          style: Theme.of(context)
              .textTheme
              .labelSmall
              ?.copyWith(color: c, fontWeight: FontWeight.w700, letterSpacing: 0.4)),
    );
  }
}
