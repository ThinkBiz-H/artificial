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
import '../../../shared/widgets/product_grid.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
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
  const CategoryScreen({super.key, required this.slug, this.onSelectCategory, this.title, this.leading});
  final String slug;

  /// Shop tab: switches category in place instead of opening a new page.
  final ValueChanged<String>? onSelectCategory;
  final String? title;
  final Widget? leading;

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
    final roots = tree.where((r) => r.isActive).toList(growable: false);
    return Scaffold(
      appBar: AppBar(
        leading: widget.leading,
        title: Text(widget.title ?? category.valueOrNull?.name ?? ''),
        actions: const [CartIconButton()],
      ),
      body: category.when(
        loading: () => const LoadingView(),
        error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(categoryBySlugProvider(slug))),
        data: (c) {
          final browse = c.activeChildren.isNotEmpty;
          final group = browse ? c : _parentOf(tree, c.id);
          final chips = group?.activeChildren ?? const <CategoryModel>[];
          final groupTitle = (group ?? c).name;
          // Full listing of a whole main category ("All …").
          void openAll(CategoryModel g) =>
              context.push(RoutePaths.productList(categoryId: g.id, title: 'All ${g.name}'));

          // Search → main categories → sub-category image cards.
          final header = <Widget>[
            SliverToBoxAdapter(child: _SearchPill(onTap: () => context.push(RoutePaths.search))),
            if (roots.isNotEmpty)
              SliverToBoxAdapter(
                child: _MainCategoryStrip(roots: roots, selectedId: (group ?? c).id, onSelect: widget.onSelectCategory),
              ),
          ];

          if (!browse) {
            // Sub-category page: every product of this sub-category; the
            // sibling cards open their own pages.
            return ProductListingView(
              key: ValueKey(c.id),
              initialQuery: ProductQuery(categoryId: c.id),
              header: [
                ...header,
                if (chips.isNotEmpty)
                  SliverToBoxAdapter(
                    child: _SubcategoryChips(
                      allLabel: 'All $groupTitle',
                      allImageUrl: group?.image?.url,
                      children: chips,
                      selectedId: c.id,
                      onSelect: (id) {
                        if (id == c.id) return;
                        if (id == null) return openAll(group!);
                        final sib = chips.firstWhere((x) => x.id == id);
                        final open = widget.onSelectCategory;
                        open != null ? open(sib.slug) : context.pushReplacement(RoutePaths.category(sib.slug));
                      },
                    ),
                  ),
                SliverToBoxAdapter(child: _CategoryBanner(category: c)),
              ],
            );
          }

          // Main category page: 6–10 featured products of the selected card,
          // refreshed in place. Tapping the selected card again or "View all"
          // opens the full listing.
          final selected = _selectedId == null ? null : chips.where((x) => x.id == _selectedId).firstOrNull;
          final previewId = selected?.id ?? c.id;
          final heading = selected?.name ?? 'All $groupTitle';
          void viewAll() => selected == null ? openAll(c) : context.push(RoutePaths.category(selected.slug));
          final preview = ref.watch(categoryPreviewProvider(previewId));
          final items = preview.valueOrNull?.items;

          return RefreshIndicator(
            onRefresh: () => ref.refresh(categoryPreviewProvider(previewId).future),
            child: CustomScrollView(
              slivers: [
                ...header,
                SliverToBoxAdapter(
                  child: _SubcategoryChips(
                    allLabel: 'All $groupTitle',
                    allImageUrl: c.image?.url,
                    children: chips,
                    selectedId: selected?.id,
                    onSelect: (id) => id == selected?.id ? viewAll() : setState(() => _selectedId = id),
                  ),
                ),
                SliverToBoxAdapter(child: _CategoryBanner(category: c)),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.lg, AppSpacing.md, AppSpacing.md),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('FEATURED DESIGNS', style: AppTypography.overline(AppColors.wine)),
                              const SizedBox(height: 4),
                              AnimatedSwitcher(
                                duration: const Duration(milliseconds: 220),
                                child: Text(heading, key: ValueKey(heading), style: context.text.headlineSmall),
                              ),
                            ],
                          ),
                        ),
                        TextButton(
                          onPressed: viewAll,
                          child: Text(preview.valueOrNull == null ? 'View all' : 'View all ${preview.value!.total}'),
                        ),
                      ],
                    ),
                  ),
                ),
                if (preview.hasError && items == null)
                  SliverToBoxAdapter(
                    child: ErrorState(error: preview.error!, onRetry: () => ref.invalidate(categoryPreviewProvider(previewId))),
                  )
                else if (items == null)
                  SliverProductGridSkeleton(columns: context.gridColumns)
                else if (items.isEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: Text('No pieces here yet — explore another style meanwhile.',
                          textAlign: TextAlign.center, style: context.text.bodyMedium),
                    ),
                  )
                else
                  SliverProductGrid(key: ValueKey(previewId), products: items, heroPrefix: 'cat-$previewId'),
                if (items != null && items.isNotEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.lg, AppSpacing.md, AppSpacing.xl),
                      child: OutlinedButton(onPressed: viewAll, child: Text('View all $heading')),
                    ),
                  ),
              ],
            ),
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
  const _SubcategoryChips({required this.allLabel, this.allImageUrl, required this.children, required this.selectedId, required this.onSelect});
  final String allLabel;
  final String? allImageUrl;
  final List<CategoryModel> children;
  final String? selectedId;
  final ValueChanged<String?> onSelect;

  @override
  Widget build(BuildContext context) {
    // Image cards (Yes Madam style): rounded image + name; "All" first.
    Widget card({required String label, String? imageUrl, required bool selected, required VoidCallback onTap}) {
      return GestureDetector(
        onTap: onTap,
        child: SizedBox(
          width: 76,
          child: Column(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: selected ? AppColors.wine : context.colors.outline, width: selected ? 2 : 1),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.md - 2),
                  child: SizedBox(
                    width: 68,
                    height: 68,
                    child: imageUrl == null
                        ? ColoredBox(
                            color: AppColors.ivoryDeep,
                            child: Center(child: Text(label.isEmpty ? '' : label[0], style: context.text.titleLarge)),
                          )
                        : AppNetworkImage(url: imageUrl, targetWidth: 160),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                maxLines: 2,
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                style: context.text.labelSmall?.copyWith(
                  height: 1.15,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                  color: selected ? AppColors.wine : null,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return SizedBox(
      height: 124,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.md, 0),
        itemCount: children.length + 1,
        separatorBuilder: (_, _) => const SizedBox(width: 10),
        itemBuilder: (_, i) {
          if (i == 0) return card(label: allLabel, imageUrl: allImageUrl, selected: selectedId == null, onTap: () => onSelect(null));
          final c = children[i - 1];
          return card(label: c.name, imageUrl: c.image?.url, selected: c.id == selectedId, onTap: () => onSelect(c.id));
        },
      ),
    );
  }
}

/// Search bar at the top of the category flow (opens the search screen).
class _SearchPill extends StatelessWidget {
  const _SearchPill({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, 0),
      child: Material(
        color: context.colors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.pill),
          side: BorderSide(color: context.colors.outline),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.pill),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
            child: Row(
              children: [
                Icon(Icons.search_rounded, color: context.colors.onSurfaceVariant),
                const SizedBox(width: 10),
                Text('Search necklaces, earrings, bangles…', style: context.text.bodyMedium?.copyWith(color: context.colors.onSurfaceVariant)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Horizontal round images of every main category (Admin > Categories).
class _MainCategoryStrip extends StatelessWidget {
  const _MainCategoryStrip({required this.roots, required this.selectedId, this.onSelect});
  final List<CategoryModel> roots;
  final String selectedId;
  final ValueChanged<String>? onSelect;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 104,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.md, 0),
        itemCount: roots.length,
        separatorBuilder: (_, _) => const SizedBox(width: 14),
        itemBuilder: (_, i) {
          final c = roots[i];
          final selected = c.id == selectedId;
          return GestureDetector(
            onTap: selected
                ? null
                : () => onSelect != null ? onSelect!(c.slug) : context.pushReplacement(RoutePaths.category(c.slug)),
            child: SizedBox(
              width: 66,
              child: Column(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    padding: const EdgeInsets.all(2.5),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: selected ? AppColors.wine : context.colors.outline, width: selected ? 2 : 1),
                    ),
                    child: ClipOval(
                      child: SizedBox(
                        width: 54,
                        height: 54,
                        child: c.image?.url == null
                            ? ColoredBox(
                                color: AppColors.ivoryDeep,
                                child: Center(child: Text(c.name.isEmpty ? '' : c.name[0], style: context.text.titleLarge)),
                              )
                            : AppNetworkImage(url: c.image!.url, targetWidth: 120),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    c.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: context.text.labelSmall?.copyWith(
                      fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                      color: selected ? AppColors.wine : null,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
