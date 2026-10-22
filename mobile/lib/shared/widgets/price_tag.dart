import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/formatters.dart';

class PriceTag extends StatelessWidget {
  const PriceTag({
    super.key,
    required this.price,
    this.mrp,
    this.size = 15,
    this.showDiscount = true,
    this.prefix,
  });

  /// Effective selling price.
  final double price;

  /// Original price (shown struck-through when higher than [price]).
  final double? mrp;
  final double size;
  final bool showDiscount;
  final String? prefix;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final hasDiscount = mrp != null && mrp! > price && price > 0;
    final pct = hasDiscount ? (((mrp! - price) / mrp!) * 100).round() : 0;
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 6,
      runSpacing: 2,
      children: [
        Text('${prefix ?? ''}${Formatters.currency(price)}',
            style: AppTypography.price(scheme.onSurface, size: size)),
        if (hasDiscount)
          Text(
            Formatters.currency(mrp!),
            style: AppTypography.price(scheme.onSurfaceVariant, size: size * 0.8).copyWith(
              decoration: TextDecoration.lineThrough,
              fontWeight: FontWeight.w400,
            ),
          ),
        if (hasDiscount && showDiscount && pct > 0)
          Text('$pct% off',
              style: AppTypography.price(AppColors.success, size: size * 0.78)
                  .copyWith(fontWeight: FontWeight.w600)),
      ],
    );
  }
}
