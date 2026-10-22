import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class RatingBadge extends StatelessWidget {
  const RatingBadge({super.key, required this.rating, this.count, this.dense = false});

  final double rating;
  final int? count;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    if (rating <= 0) return const SizedBox.shrink();
    final text = Theme.of(context).textTheme;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: EdgeInsets.symmetric(horizontal: dense ? 5 : 7, vertical: dense ? 1 : 3),
          decoration: BoxDecoration(
            color: AppColors.success,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(rating.toStringAsFixed(1),
                  style: text.labelSmall?.copyWith(
                      color: Colors.white, fontWeight: FontWeight.w700, letterSpacing: 0.2)),
              const SizedBox(width: 2),
              Icon(Icons.star_rounded, size: dense ? 10 : 12, color: Colors.white),
            ],
          ),
        ),
        if (count != null && count! > 0) ...[
          const SizedBox(width: 6),
          Text('($count)', style: text.bodySmall),
        ],
      ],
    );
  }
}

class StarRow extends StatelessWidget {
  const StarRow({super.key, required this.rating, this.size = 16});
  final double rating;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        // Website RatingStars: filled rose-gold stars up to the rounded rating.
        final filled = i < rating.round();
        return Icon(filled ? Icons.star_rounded : Icons.star_outline_rounded,
            size: size, color: filled ? AppColors.roseGoldSoft : AppColors.borderStrong);
      }),
    );
  }
}
