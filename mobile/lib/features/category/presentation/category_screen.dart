import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category_model.dart';
import '../../../core/models/product_query.dart';
import '../../../core/providers/app_providers.dart';
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
/// (backend includes descendant categories automatically). Tapping a chip
/// switches the grid below to that sub-category in place (Main category →
/// Sub category → Products); a sub-category opened directly shows its
/// sibling sub-categories with itself selected.
class CategoryScreen extends ConsumerStatefulWidget {
  const CategoryScreen({super.key, required this.slug});
  final String slug;

  @override
  ConsumerState<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends ConsumerState<CategoryScreen> {
  /// Chip picked on this screen; null = the opened category itself.
  String? _selectedId;

  /// The parent of [id] in the cached category tree, if any.
  CategoryModel? _parentOf(List<CategoryModel> nodes, String id) {
    for (final n in nodes) {
      if (n.children.any((c) => c.id == id)) return n;
      final hit = _parentOf(n.children, id);
      if (hit != null) return hit;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final slug = widget.slug;
    final category = ref.watch(categoryBySlugProvider(slug));
    final tree = ref.watch(categoryTreeProvider).valueOrNull ?? const <CategoryModel>[];
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
        data: (c) {
          // Chips: this category's sub-categories, or (for a sub-category) its siblings.
          final parent = c.hasChildren ? null : _parentOf(tree, c.id);
          final group = c.hasChildren ? c : parent;
          final chips = group?.activeChildren ?? const <CategoryModel>[];
          final selectedId = _selectedId ?? (c.hasChildren ? null : c.id);
          final listingId = selectedId ?? c.id;
          return ProductListingView(
            key: ValueKey(listingId),
            initialQuery: ProductQuery(categoryId: listingId),
            header: [
              SliverToBoxAdapter(child: _CategoryBanner(category: c)),
              if (chips.isNotEmpty)
                SliverToBoxAdapter(
                  child: _SubcategoryChips(
                    allLabel: 'All ${(group ?? c).displayTitle}',
                    children: chips,
                    // 'All' is highlighted whenever the grid shows the whole group.
                    selectedId: listingId == (group ?? c).id ? null : listingId,
                    onSelect: (id) => setState(() => _selectedId = id ?? (c.hasChildren ? null : group?.id)),
                  ),
                ),
            ],
          );
        },
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

/// Horizontal sub-category chips (same chip style as before); the selected
/// chip filters the grid below without leaving the screen.
class _SubcategoryChips extends StatelessWidget {
  const _SubcategoryChips({required this.allLabel, required this.children, required this.selectedId, required this.onSelect});
  final String allLabel;
  final List<CategoryModel> children;
  final String? selectedId;
  final ValueChanged<String?> onSelect;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 54,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, 0),
        itemCount: children.length + 1,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          if (i == 0) {
            return ChoiceChip(
              label: Text(allLabel),
              selected: selectedId == null,
              onSelected: (_) => onSelect(null),
            );
          }
          final c = children[i - 1];
          return ChoiceChip(
            avatar: c.image?.url == null
                ? null
                : CircleAvatar(
                    backgroundColor: Colors.transparent,
                    child: ClipOval(child: AppNetworkImage(url: c.image!.url, targetWidth: 60)),
                  ),
            label: Text(c.displayTitle),
            selected: c.id == selectedId,
            onSelected: (_) => onSelect(c.id),
          );
        },
      ),
    );
  }
}
