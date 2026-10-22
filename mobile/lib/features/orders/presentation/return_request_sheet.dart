import 'package:flutter/material.dart';

import '../../../core/models/order_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/status_chip.dart';

/// Status of a return the store team has opened on the order (Order.returnRequest).
class ReturnStatusCard extends StatelessWidget {
  const ReturnStatusCard({super.key, required this.request});
  final ReturnRequestModel request;

  @override
  Widget build(BuildContext context) {
    final color = switch (request.status) {
      'Rejected' => AppColors.error,
      'Completed' => AppColors.success,
      _ => AppColors.info,
    };
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text('Return request', style: context.text.titleMedium)),
              StatusChip(label: request.status, color: color),
            ],
          ),
          const SizedBox(height: 6),
          Text('Reason: ${request.reason}', style: context.text.bodySmall),
          if (request.requestedAt != null)
            Text('Requested on ${Formatters.date(request.requestedAt)}', style: context.text.bodySmall),
          if (request.adminComment != null && request.adminComment!.isNotEmpty)
            Text('Update: ${request.adminComment}', style: context.text.bodySmall),
          if (request.refundStatus != 'Not Applicable')
            Text(
              'Refund: ${request.refundStatus}${request.refundAmount > 0 ? ' · ${Formatters.currency(request.refundAmount)}' : ''}',
              style: context.text.bodySmall?.copyWith(fontWeight: FontWeight.w600),
            ),
        ],
      ),
    );
  }
}
