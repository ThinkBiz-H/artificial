import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

/// Centered luxury section title with overline and ornamental divider.
class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.overline,
    this.subtitle,
    this.actionLabel = 'View all',
    this.onAction,
    this.centered = false,
  });

  final String title;
  final String? overline;
  final String? subtitle;
  final String actionLabel;
  final VoidCallback? onAction;
  final bool centered;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;

    if (centered) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.xl, AppSpacing.md, AppSpacing.md),
        child: Column(
          children: [
            if (overline != null)
              Text(overline!.toUpperCase(), style: AppTypography.overline(AppColors.roseGold)),
            const SizedBox(height: 4),
            Text(title, style: text.headlineMedium, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            const OrnamentDivider(),
            if (subtitle != null && subtitle!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(subtitle!,
                  style: text.bodySmall, textAlign: TextAlign.center, maxLines: 2),
            ],
            if (onAction != null)
              TextButton(onPressed: onAction, child: Text(actionLabel.toUpperCase())),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.xl, AppSpacing.xs, AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (overline != null)
                  Text(overline!.toUpperCase(), style: AppTypography.overline(AppColors.roseGold)),
                Text(title, style: text.headlineMedium),
                if (subtitle != null && subtitle!.isNotEmpty)
                  Text(subtitle!, style: text.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          if (onAction != null)
            TextButton(
              onPressed: onAction,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(actionLabel.toUpperCase()),
                  Icon(Icons.chevron_right_rounded, size: 18, color: scheme.primary),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class OrnamentDivider extends StatelessWidget {
  const OrnamentDivider({super.key, this.width = 120});
  final double width;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: Row(
        children: [
          Expanded(child: Container(height: 1, color: AppColors.roseGold.withValues(alpha: 0.5))),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 6),
            child: Icon(Icons.diamond_outlined, size: 12, color: AppColors.roseGold),
          ),
          Expanded(child: Container(height: 1, color: AppColors.roseGold.withValues(alpha: 0.5))),
        ],
      ),
    );
  }
}
