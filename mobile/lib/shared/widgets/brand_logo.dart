import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/app_config.dart';
import '../../core/providers/app_providers.dart';

/// Brand Management logo slots used in the app (admin → Settings → Brand
/// Management). The server already applies fallbacks between slots.
abstract final class BrandSlots {
  static const String app = 'appLogo';
  static const String splash = 'splashLogo';
  static const String login = 'loginLogo';
  static const String register = 'registerLogo';
  static const String drawer = 'drawerLogo';
  static const String appBar = 'appBarLogo';
}

/// The brand logo for [slot] — the admin's logo when one is set (disk-cached,
/// so it also shows offline), otherwise the bundled logo. One image carries
/// both the icon and the brand name, so no text is shown beside it.
class BrandLogo extends ConsumerWidget {
  const BrandLogo({super.key, this.height = 28, this.slot = BrandSlots.app, this.light = false, this.forceWordmark = false});

  final double height;
  final String slot;

  /// Kept for existing call sites; the logo image reads on light and dark.
  final bool light;
  final bool forceWordmark;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final url = ref.watch(brandLogosProvider.select((logos) => logos[slot]));
    return BrandImage(url: url, height: height);
  }
}

/// Network logo with the bundled logo as placeholder and error fallback.
class BrandImage extends StatelessWidget {
  const BrandImage({super.key, required this.url, this.height, this.width, this.fit = BoxFit.contain, this.fallbackAsset = AppConfig.brandLogoAsset});

  final String? url;
  final double? height;
  final double? width;
  final BoxFit fit;
  final String fallbackAsset;

  @override
  Widget build(BuildContext context) {
    final bundled = Image.asset(
      fallbackAsset,
      height: height,
      width: width,
      fit: fit,
      semanticLabel: AppConfig.appName,
      filterQuality: FilterQuality.medium,
    );
    final source = url;
    if (source == null || source.isEmpty) return bundled;
    return Semantics(
      label: AppConfig.appName,
      image: true,
      child: CachedNetworkImage(
        imageUrl: source,
        height: height,
        width: width,
        fit: fit,
        fadeInDuration: const Duration(milliseconds: 150),
        placeholder: (_, _) => bundled,
        errorWidget: (_, _, _) => bundled,
      ),
    );
  }
}

/// Compact brand mark used inline (drawer, onboarding, account footer).
/// [size] is the old wordmark font size; the logo is drawn proportionally.
class BrandWordmark extends StatelessWidget {
  const BrandWordmark({super.key, this.size = 20, this.light = false, this.slot = BrandSlots.drawer});
  final double size;
  final bool light;
  final String slot;

  @override
  Widget build(BuildContext context) => BrandLogo(height: size * 2.6, light: light, slot: slot);
}
