import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import 'shimmer_widgets.dart';

/// Cached image with shimmer placeholder, branded error state, Cloudinary
/// on-the-fly optimisation (f_auto,q_auto,w_*) and a memory-cache cap.
class AppNetworkImage extends StatelessWidget {
  const AppNetworkImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.width,
    this.height,
    this.targetWidth = 600,
    this.alignment = Alignment.center,
  });

  final String? url;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final double? width;
  final double? height;

  /// Logical width requested from Cloudinary / decoded in memory.
  final int targetWidth;
  final Alignment alignment;

  /// Media saved by a backend running on a developer PC is stored as
  /// http://localhost:5001/uploads/… — on a phone "localhost" is the phone,
  /// so point such URLs at the backend host the app talks to.
  static String resolve(String url) {
    final uri = Uri.tryParse(url.trim());
    if (uri == null || !uri.hasScheme) return url.trim();
    const local = {'localhost', '127.0.0.1', '0.0.0.0', '::1'};
    if (!local.contains(uri.host)) return url.trim();
    final api = Uri.tryParse(AppConfig.apiBaseUrl);
    if (api == null || api.host.isEmpty || local.contains(api.host)) return url.trim();
    return uri.replace(scheme: api.scheme, host: api.host, port: api.hasPort ? api.port : null).toString();
  }

  static String optimize(String url, int width) {
    url = resolve(url);
    if (!url.contains('res.cloudinary.com') || !url.contains('/upload/')) return url;
    if (RegExp(r'/upload/[^/]*(f_auto|q_auto|w_\d+)').hasMatch(url)) return url;
    return url.replaceFirst('/upload/', '/upload/f_auto,q_auto,w_$width/');
  }

  @override
  Widget build(BuildContext context) {
    final dpr = MediaQuery.devicePixelRatioOf(context);
    final pixelWidth = (targetWidth * dpr).clamp(200, 1600).round();
    final source = url;
    Widget child;
    if (source == null || source.trim().isEmpty) {
      child = const _ImageFallback();
    } else {
      child = CachedNetworkImage(
        imageUrl: optimize(source, pixelWidth),
        fit: fit,
        width: width,
        height: height,
        alignment: alignment,
        memCacheWidth: pixelWidth,
        fadeInDuration: const Duration(milliseconds: 220),
        placeholder: (_, __) => const ShimmerBox(),
        errorWidget: (_, __, ___) => const _ImageFallback(),
      );
    }
    if (borderRadius != null) {
      child = ClipRRect(borderRadius: borderRadius!, child: child);
    }
    return SizedBox(width: width, height: height, child: child);
  }
}

class _ImageFallback extends StatelessWidget {
  const _ImageFallback();

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      color: dark ? AppColors.nightSurfaceHigh : AppColors.ivoryDeep,
      alignment: Alignment.center,
      child: Icon(Icons.diamond_outlined,
          color: AppColors.roseGold.withValues(alpha: 0.6), size: 28),
    );
  }
}
