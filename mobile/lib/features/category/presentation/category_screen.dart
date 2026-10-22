import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category_model.dart';
import '../../../core/models/product_query.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import '../../../shared/widgets/state_views.dart';
import '../../home/presentation/hero_carousel.dart';
import '../../product/presentation/product_listing_view.dart';
import '../viewmodels/category_viewmodel.dart';

/// /category/:slug — banner, sub-category chips and the product grid
/// (backend includes descendant categories automatically).
class CategoryScreen extends ConsumerWidget {
  const CategoryScreen({super.key, required this.slug});
  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final category = ref.watch(categoryBySlugProvider(slug));
    return Scaffold(
      appBar: AppBar(
        title: Text(category.valueOrNull?.name ?? ''),
        actions: [
          IconButton(icon: const Icon(Icons.search_rounded), onPressed: () => context.push(RoutePaths.search)),
          const CartIconButton(),
        ],
      ),
      body: category.when(
        loading: () => const LoadingView(),
        error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(categoryBySlugProvider(slug))),
        data: (c) => ProductListingView(
          initialQuery: ProductQuery(categoryId: c.id),
          header: [
            SliverToBoxAdapter(child: _CategoryBanner(category: c)),
            if (c.hasChildren) SliverToBoxAdapter(child: _SubcategoryChips(category: c)),
          ],
        ),
      ),
    );
  }
}

class _CategoryBanner extends ConsumerWidget {
  const _CategoryBanner({required this.category});
  final CategoryModel category;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final banner = ref.watch(categoryBannerProvider(category.id)).valueOrNull;
    final image = banner?.imageUrl;
    if (image == null || image.isEmpty) {
      if (category.description.isEmpty) return const SizedBox(height: AppSpacing.xs);
      return Padding(
        padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.xs, AppSpacing.md, 0),
        child: Text(category.description, style: context.text.bodySmall, maxLines: 3),
      );
    }
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.xs, AppSpacing.md, 0),
      child: GestureDetector(
        onTap: banner!.buttonLink.isEmpty ? null : () => openCmsLink(context, banner.buttonLink),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: AspectRatio(
            aspectRatio: 16 / 7,
            child: Stack(
              fit: StackFit.expand,
              children: [
                AppNetworkImage(url: image, targetWidth: 900),
                if (banner.title.isNotEmpty)
                  const DecoratedBox(decoration: BoxDecoration(gradient: AppColors.imageScrim)),
                if (banner.title.isNotEmpty)
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 14,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (banner.subtitle.isNotEmpty)
                          Text(banner.subtitle.toUpperCase(),
                              style: AppTypography.overline(AppColors.roseGoldLight)),
                        Text(banner.title,
                            style: context.text.headlineMedium?.copyWith(color: Colors.white)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SubcategoryChips extends StatelessWidget {
  const _SubcategoryChips({required this.category});
  final CategoryModel category;

  @override
  Widget build(BuildContext context) {
    final children = category.activeChildren;
    return SizedBox(
      height: 54,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, 0),
        itemCount: children.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) => ActionChip(
          avatar: children[i].image?.url == null
              ? null
              : CircleAvatar(
                  backgroundColor: Colors.transparent,
                  child: ClipOval(child: AppNetworkImage(url: children[i].image!.url, targetWidth: 60)),
                ),
          label: Text(children[i].displayTitle),
          onPressed: () => context.push(RoutePaths.category(children[i].slug)),
        ),
      ),
    );
  }
}
