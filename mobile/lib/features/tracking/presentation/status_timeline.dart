import 'package:flutter/material.dart';

import '../../../core/models/order_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';

/// Vertical journey Pending → Delivered, using statusHistory timestamps.
/// Cancelled/Returned/Refunded orders show their actual history instead.
class StatusTimeline extends StatelessWidget {
  const StatusTimeline({super.key, required this.currentStatus, required this.history});
  final String currentStatus;
  final List<StatusHistoryModel> history;

  @override
  Widget build(BuildContext context) {
    final offJourney = !OrderStatus.journey.contains(currentStatus);
    final steps = <_Step>[];
    if (offJourney) {
      final seen = <String>{};
      for (final h in history) {
        if (seen.add('${h.status}|${h.note}')) {
          steps.add(_Step(h.status, h.changedAt, h.note, done: true));
        }
      }
      if (steps.isEmpty) steps.add(_Step(currentStatus, null, null, done: true));
    } else {
      final currentIndex = OrderStatus.journey.indexOf(currentStatus);
      for (var i = 0; i < OrderStatus.journey.length; i++) {
        final status = OrderStatus.journey[i];
        StatusHistoryModel? entry;
        for (final h in history.reversed) {
          if (h.status == status) {
            entry = h;
            break;
          }
        }
        steps.add(_Step(status, entry?.changedAt, entry?.note, done: i <= currentIndex));
      }
    }

    return Column(
      children: List.generate(steps.length, (i) {
        final s = steps[i];
        final isLast = i == steps.length - 1;
        final color = s.done
            ? (s.status == OrderStatus.cancelled || s.status == OrderStatus.returned
                ? AppColors.error
                : AppColors.success)
            : context.colors.outline;
        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(
                width: 28,
                child: Column(
                  children: [
                    Container(
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: s.done ? color : Colors.transparent,
                        border: Border.all(color: color, width: 2),
                      ),
                      child: s.done ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                    ),
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2,
                          color: steps[i + 1].done ? color : context.colors.outline,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(s.status,
                          style: context.text.titleSmall?.copyWith(
                              color: s.done ? null : context.colors.onSurfaceVariant)),
                      if (s.at != null) Text(Formatters.dateTime(s.at), style: context.text.bodySmall),
                      if (s.note != null && s.note!.isNotEmpty)
                        Text(s.note!, style: context.text.bodySmall),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _Step {
  const _Step(this.status, this.at, this.note, {required this.done});
  final String status;
  final DateTime? at;
  final String? note;
  final bool done;
}
