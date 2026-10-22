import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/widgets/app_network_image.dart';
import 'image_viewer_screen.dart';

class ProductGallery extends StatefulWidget {
  const ProductGallery({super.key, required this.images, this.badge, this.onWatchVideo});
  final List<String> images;

  /// Top-left badge ("20% off" / "New"), as on the website gallery.
  final Widget? badge;

  /// Shown as a "Watch video" action when the product has a video.
  final VoidCallback? onWatchVideo;

  @override
  State<ProductGallery> createState() => _ProductGalleryState();
}

class _ProductGalleryState extends State<ProductGallery> {
  final PageController _controller = PageController();
  int _index = 0;

  @override
  void didUpdateWidget(covariant ProductGallery oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.images.join() != widget.images.join()) {
      _index = 0;
      if (_controller.hasClients) _controller.jumpToPage(0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final images = widget.images.isEmpty ? <String>[''] : widget.images;
    final width = MediaQuery.sizeOf(context).width;
    return Column(
      children: [
        SizedBox(
          height: (width * 1.1).clamp(300.0, 620.0),
          child: Stack(
            children: [
              PageView.builder(
                controller: _controller,
                itemCount: images.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (_, i) => GestureDetector(
                  onTap: widget.images.isEmpty
                      ? null
                      : () => ImageViewerScreen.open(context, widget.images, i),
                  child: AppNetworkImage(url: images[i], targetWidth: 900),
                ),
              ),
              if (images.length > 1)
                Positioned(
                  bottom: 12,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(images.length, (i) {
                      final active = i == _index;
                      return AnimatedContainer(
                        duration: AppDurations.fast,
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: active ? 18 : 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: active ? AppColors.wine : Colors.white.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(6),
                        ),
                      );
                    }),
                  ),
                ),
              if (widget.badge != null) Positioned(left: 14, top: 14, child: widget.badge!),
              if (widget.onWatchVideo != null)
                Positioned(
                  right: 12,
                  top: 12,
                  child: Material(
                    color: Colors.white.withValues(alpha: 0.92),
                    shape: const StadiumBorder(),
                    child: InkWell(
                      customBorder: const StadiumBorder(),
                      onTap: widget.onWatchVideo,
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.play_circle_outline_rounded, size: 16, color: AppColors.wine),
                            SizedBox(width: 6),
                            Text('WATCH VIDEO',
                                style: TextStyle(
                                    fontSize: 10.5, fontWeight: FontWeight.w600, letterSpacing: 1.4, color: AppColors.wine)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              Positioned(
                right: 12,
                bottom: 12,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.35),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.zoom_out_map_rounded, color: Colors.white, size: 16),
                ),
              ),
            ],
          ),
        ),
        if (images.length > 1)
          SizedBox(
            height: 72,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, 0),
              itemCount: images.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) => GestureDetector(
                onTap: () => _controller.animateToPage(i,
                    duration: AppDurations.medium, curve: Curves.easeOutCubic),
                child: AnimatedContainer(
                  duration: AppDurations.fast,
                  width: 56,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                    border: Border.all(
                      color: i == _index ? AppColors.wine : Colors.transparent,
                      width: 1.6,
                    ),
                  ),
                  child: AppNetworkImage(
                    url: images[i],
                    targetWidth: 120,
                    borderRadius: BorderRadius.circular(AppRadius.sm - 1),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
