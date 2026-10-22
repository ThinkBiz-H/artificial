import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/app_config.dart';
import '../../core/providers/app_providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import 'app_network_image.dart';

/// Uses the logo uploaded in Admin > Settings when present, otherwise the
/// typographic wordmark.
class BrandLogo extends ConsumerWidget {
  const BrandLogo({super.key, this.height = 28, this.light = false, this.forceWordmark = false});

  final double height;
  final bool light;
  final bool forceWordmark;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logo = ref.watch(settingsValueProvider).logo;
    if (!forceWordmark && logo != null && logo.isValid) {
      return SizedBox(
        height: height,
        child: AppNetworkImage(url: logo.url, fit: BoxFit.contain, targetWidth: 300),
      );
    }
    return BrandWordmark(size: height * 0.72, light: light);
  }
}

class BrandWordmark extends StatelessWidget {
  const BrandWordmark({super.key, this.size = 20, this.light = false});
  final double size;
  final bool light;

  @override
  Widget build(BuildContext context) {
    final color = light
        ? AppColors.champagne
        : Theme.of(context).brightness == Brightness.dark
            ? AppColors.roseGoldLight
            : AppColors.wine;
    return FittedBox(
      fit: BoxFit.scaleDown,
      child: Text(AppConfig.brandWordmark, style: AppTypography.wordmark(color, size: size)),
    );
  }
}
