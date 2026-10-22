import 'package:flutter/material.dart';

import '../../core/models/cart_model.dart';
import '../../core/theme/app_colors.dart';

/// "#d4af37" / "d4af37" / "#fff" → Color; null when not a valid hex.
Color? parseHexColor(String? hex) {
  if (hex == null) return null;
  var h = hex.trim().replaceFirst('#', '');
  if (h.length == 3) h = h.split('').map((c) => '$c$c').join();
  if (h.length != 6) return null;
  final value = int.tryParse(h, radix: 16);
  return value == null ? null : Color(0xFF000000 | value);
}

/// Small round colour swatch; renders nothing without a hex.
class ColorDot extends StatelessWidget {
  const ColorDot({super.key, required this.hex, this.size = 12});
  final String? hex;
  final double size;

  @override
  Widget build(BuildContext context) {
    final color = parseHexColor(hex);
    if (color == null) return const SizedBox.shrink();
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.borderStrong),
      ),
    );
  }
}

/// Selected jewellery options for a cart line / order item — the website's
/// LineOptions: "Color: ● Gold · Size: 2.6 · Metal: Brass · Plating: Gold".
/// [stacked] lists them one per line (checkout summary, order details).
class LineOptions extends StatelessWidget {
  const LineOptions({super.key, required this.options, this.stacked = false});
  final ItemOptions options;
  final bool stacked;

  @override
  Widget build(BuildContext context) {
    final parts = options.parts;
    if (parts.isEmpty) return const SizedBox.shrink();
    final theme = Theme.of(context);
    final labelStyle = theme.textTheme.bodySmall;
    final valueStyle = labelStyle?.copyWith(fontWeight: FontWeight.w500, color: theme.colorScheme.onSurface.withValues(alpha: 0.82));

    Widget part(({String label, String value, String? hex}) p) => Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('${p.label}: ', style: labelStyle),
            if (p.hex != null) ...[ColorDot(hex: p.hex), const SizedBox(width: 4)],
            Flexible(child: Text(p.value, style: valueStyle, overflow: TextOverflow.ellipsis)),
          ],
        );

    if (stacked) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final p in parts) Padding(padding: const EdgeInsets.only(bottom: 2), child: part(p)),
        ],
      );
    }
    return Wrap(
      spacing: 8,
      runSpacing: 2,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        for (var i = 0; i < parts.length; i++)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (i > 0) ...[
                const Text('·', style: TextStyle(color: AppColors.borderStrong)),
                const SizedBox(width: 6),
              ],
              part(parts[i]),
            ],
          ),
      ],
    );
  }
}
