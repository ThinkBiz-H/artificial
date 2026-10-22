import 'package:flutter/material.dart';

import '../../core/theme/app_spacing.dart';

class QuantityStepper extends StatelessWidget {
  const QuantityStepper({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 1,
    this.max = 10,
    this.compact = false,
    this.busy = false,
  });

  final int value;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;
  final bool compact;
  final bool busy;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final size = compact ? 30.0 : 40.0;
    Widget button(IconData icon, bool enabled, VoidCallback onTap) => InkResponse(
          onTap: enabled && !busy ? onTap : null,
          radius: size / 1.6,
          child: SizedBox(
            width: size,
            height: size,
            child: Icon(icon,
                size: compact ? 16 : 20,
                color: enabled ? scheme.primary : scheme.onSurfaceVariant.withValues(alpha: 0.4)),
          ),
        );

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: scheme.outline),
        borderRadius: BorderRadius.circular(AppRadius.pill),
        color: scheme.surface,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          button(Icons.remove_rounded, value > min, () => onChanged(value - 1)),
          SizedBox(
            width: compact ? 26 : 34,
            child: busy
                ? const Center(
                    child: SizedBox(
                        width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 1.6)))
                : Text('$value',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleMedium),
          ),
          button(Icons.add_rounded, value < max, () => onChanged(value + 1)),
        ],
      ),
    );
  }
}
