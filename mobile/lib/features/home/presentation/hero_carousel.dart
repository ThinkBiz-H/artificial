import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/home_models.dart';
import '../../../core/routes/link_resolver.dart';
import '../../../core/services/launcher_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_network_image.dart';

void openCmsLink(BuildContext context, String link) {
  if (link.trim().isEmpty) return;
  final route = LinkResolver.toRoute(link);
  if (route != null) {
    context.push(route);
  } else {
    LauncherService().openUrl(link);
  }
}

class HeroCarousel extends StatefulWidget {
  const HeroCarousel({super.key, required this.slides});
  final List<SlideModel> slides;

  @override
  State<HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends State<HeroCarousel> {
  final PageController _controller = PageController(viewportFraction: 0.92);
  Timer? _timer;
  int _index = 0;

  @override
  void initState() {
    super.initState();
    if (widget.slides.length > 1) {
      _timer = Timer.periodic(const Duration(seconds: 5), (_) {
        if (!mounted || !_controller.hasClients) return;
        final next = (_index + 1) % widget.slides.length;
        _controller.animateToPage(next, duration: AppDurations.slow, curve: Curves.easeInOutCubic);
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final width = MediaQuery.sizeOf(context).width;
    // Portrait frame only when every slide has a mobile crop; desktop artwork
    // keeps a wide frame so it isn't cropped away (or stretched on web).
    final portrait = width < 700 && widget.slides.every((s) => s.mobileImage?.isValid ?? false);
    final height = portrait ? (width * 1.05).clamp(300.0, 520.0) : (width * 0.56).clamp(200.0, 560.0);
    return Column(
      children: [
        SizedBox(
          height: height,
          child: PageView.builder(
            controller: _controller,
            itemCount: widget.slides.length,
            onPageChanged: (i) => setState(() => _index = i),
            itemBuilder: (_, i) {
              final s = widget.slides[i];
              final hasCopy = s.title.isNotEmpty || s.subtitle.isNotEmpty || s.buttonText.isNotEmpty;
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 5),
                child: GestureDetector(
                  onTap: s.buttonLink.isEmpty ? null : () => openCmsLink(context, s.buttonLink),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        AppNetworkImage(
                            url: portrait ? s.imageUrl : (s.desktopImage?.isValid ?? false) ? s.desktopImage!.url : s.imageUrl,
                            targetWidth: portrait ? 900 : 1400),
                        if (hasCopy)
                          const DecoratedBox(decoration: BoxDecoration(gradient: AppColors.imageScrim)),
                        if (hasCopy)
                          Positioned(
                            left: 20,
                            right: 20,
                            bottom: 26,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (s.subtitle.isNotEmpty)
                                  Text(s.subtitle.toUpperCase(),
                                      style: AppTypography.overline(AppColors.roseGoldLight)),
                                if (s.title.isNotEmpty)
                                  Text(s.title,
                                      maxLines: 2,
                                      style: text.displaySmall?.copyWith(color: Colors.white)),
                                if (s.description.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 6),
                                    child: Text(s.description,
                                        maxLines: 2,
                                        style: text.bodyMedium?.copyWith(color: AppColors.champagne)),
                                  ),
                                if (s.buttonText.isNotEmpty) ...[
                                  const SizedBox(height: 14),
                                  OutlinedButton(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: Colors.white,
                                      side: const BorderSide(color: Colors.white),
                                      minimumSize: const Size(140, 44),
                                    ),
                                    onPressed: () => openCmsLink(context, s.buttonLink),
                                    child: Text(s.buttonText.toUpperCase()),
                                  ),
                                ],
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        if (widget.slides.length > 1)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(widget.slides.length, (i) {
                final active = i == _index;
                return AnimatedContainer(
                  duration: AppDurations.medium,
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: active ? 22 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: active ? AppColors.wine : AppColors.roseGoldLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                );
              }),
            ),
          ),
      ],
    );
  }
}
