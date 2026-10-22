import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/order_model.dart';
import '../../../core/providers/core_providers.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/state_views.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../orders/viewmodels/orders_viewmodel.dart';
import 'status_timeline.dart';

/// /orders/:id/track — order journey + live Shiprocket checkpoints.
class TrackOrderScreen extends ConsumerWidget {
  const TrackOrderScreen({super.key, required this.orderId});
  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(trackingProvider(orderId));
    return Scaffold(
      appBar: AppBar(title: const Text('Track order')),
      body: async.when(
        loading: () => const LoadingView(message: 'Fetching live status…'),
        error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(trackingProvider(orderId))),
        data: (t) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(trackingProvider(orderId));
            try {
              await ref.read(trackingProvider(orderId).future);
            } catch (_) {}
          },
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              _Summary(info: t),
              const SizedBox(height: AppSpacing.lg),
              Text('Order journey', style: context.text.headlineSmall),
              const SizedBox(height: AppSpacing.sm),
              StatusTimeline(currentStatus: t.orderStatus, history: t.statusHistory),
              if (t.checkpoints.isNotEmpty) ...[
                const Divider(height: AppSpacing.xl),
                Text('Courier updates', style: context.text.headlineSmall),
                const SizedBox(height: AppSpacing.sm),
                ...t.checkpoints.map((c) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.location_on_outlined, color: AppColors.roseGold),
                      title: Text(c.activity.isEmpty ? c.status : c.activity),
                      subtitle: Text([c.location, c.date].where((e) => e.isNotEmpty).join(' · ')),
                    )),
              ],
              if (t.tracking?.url != null && t.tracking!.url!.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.lg),
                OutlinedButton.icon(
                  icon: const Icon(Icons.open_in_new_rounded),
                  label: const Text('OPEN COURIER TRACKING'),
                  onPressed: () => ref.read(launcherServiceProvider).openUrl(t.tracking!.url!),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({required this.info});
  final TrackingInfo info;

  @override
  Widget build(BuildContext context) {
    final tracking = info.tracking;
    final courier = info.courier;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        gradient: AppColors.wineGradient,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('#${info.orderNumber}',
                    style: context.text.headlineSmall?.copyWith(color: Colors.white)),
              ),
              StatusChip(label: info.orderStatus, color: AppColors.champagne),
            ],
          ),
          const SizedBox(height: 8),
          _line('Shipment', info.liveStatus ?? tracking?.shipmentStatus ?? 'Not shipped'),
          if (courier?.courierName != null) _line('Courier', courier!.courierName!),
          if (tracking?.number != null) _line('AWB / Tracking no.', tracking!.number!),
          if (tracking?.estimatedDeliveryDate != null)
            _line('Expected by', Formatters.date(tracking!.estimatedDeliveryDate))
          else if (info.liveEtd != null)
            _line('Expected by', info.liveEtd!),
          if ((tracking?.deliveryAttempts ?? 0) > 0)
            _line('Delivery attempts', '${tracking!.deliveryAttempts}'),
        ],
      ),
    );
  }

  Widget _line(String label, String value) => Padding(
        padding: const EdgeInsets.only(top: 4),
        child: Row(
          children: [
            SizedBox(
              width: 140,
              child: Text(label, style: const TextStyle(color: AppColors.roseGoldLight, fontSize: 12.5)),
            ),
            Expanded(child: Text(value, style: const TextStyle(color: Colors.white, fontSize: 13.5))),
          ],
        ),
      );
}
