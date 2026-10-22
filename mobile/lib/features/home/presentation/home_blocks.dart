import 'package:flutter/material.dart';

import '../../../core/models/home_models.dart';
import '../../../core/services/launcher_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/widgets/app_network_image.dart';
import 'hero_carousel.dart';

/// Reels: thumbnail cards; tapping opens the link (in-app) or the video.
class ReelsBlock extends StatelessWidget {
  const ReelsBlock({super.key, required this.reels});
  final List<ReelModel> reels;

  @override
  Widget build(BuildContext context) {
    if (reels.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 250,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: AppSpacing.screen,
        itemCount: reels.length,
        separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
        itemBuilder: (_, i) {
          final r = reels[i];
          return GestureDetector(
            onTap: () => r.link.isNotEmpty
                ? openCmsLink(context, r.link)
                : LauncherService().openUrl(r.video?.url ?? ''),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.md),
              child: SizedBox(
                width: 145,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    AppNetworkImage(
                      url: (r.thumbnail?.isValid ?? false) ? r.thumbnail!.url : null,
                      targetWidth: 300,
                    ),
                    const DecoratedBox(decoration: BoxDecoration(gradient: AppColors.imageScrim)),
                    const Center(
                      child: Icon(Icons.play_circle_outline_rounded, color: Colors.white, size: 44),
                    ),
                    if (r.title.isNotEmpty)
                      Positioned(
                        left: 10,
                        right: 10,
                        bottom: 10,
                        child: Text(r.title,
                            maxLines: 2,
                            style: Theme.of(context)
                                .textTheme
                                .labelMedium
                                ?.copyWith(color: Colors.white)),
                      ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
