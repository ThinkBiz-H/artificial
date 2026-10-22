import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category_model.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../../product/viewmodels/product_list_viewmodel.dart';

/// Categories tab: left rail of top-level categories, right pane of
/// sub-categories (Myntra/Nykaa pattern), plus curated collections.
class CategoriesScreen extends ConsumerStatefulWidget {
  const CategoriesScreen({super.key});

  @override
  ConsumerState<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends ConsumerState<CategoriesScreen> {
  int _selected = 0;

  @override
  Widget build(BuildContext context) {
    final tree = ref.watch(categoryTreeProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shop'),
        actions: [
          IconButton(icon: const Icon(Icons.search_rounded), onPressed: () => context.push(RoutePaths.search)),
          const CartIconButton(),
        ],
      ),
      body: tree.when(
        loading: () => const ListTileSkeleton(),
        error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(categoryTreeProvider)),
        data: (roots) {
          final entries = <_RailEntry>[
            const _RailEntry.collections(),
            ...roots.map(_RailEntry.category),
          ];
          final index = _selected.clamp(0, entries.length - 1);
          final selected = entries[index];
          return Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                width: 96,
                color: context.isDark ? AppColors.nightSurface : AppColors.ivoryDeep,
                child: ListView.builder(
                  itemCount: entries.length,
                  itemBuilder: (_, i) => _RailTile(
                    entry: entries[i],
                    selected: i == index,
                    onTap: () => setState(() => _selected = i),
                  ),
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(categoryTreeProvider);
                    try {
                      await ref.read(categoryTreeProvider.future);
                    } catch (_) {}
                  },
                  child: selected.category == null
                      ? const _CollectionsPane()
                      : _CategoryPane(category: selected.category!),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _RailEntry {
  const _RailEntry.collections() : category = null;
  const _RailEntry.category(CategoryModel this.category);
  final CategoryModel? category;
}

class _RailTile extends StatelessWidget {
  const _RailTile({required this.entry, required this.selected, required this.onTap});
  final _RailEntry entry;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = entry.category;
    return InkWell(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppDurations.fast,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 6),
        decoration: BoxDecoration(
          color: selected ? context.colors.surface : Colors.transparent,
          border: Border(
            left: BorderSide(color: selected ? context.colors.primary : Colors.transparent, width: 3),
          ),
        ),
        child: Column(
          children: [
            ClipOval(
              child: SizedBox(
                width: 46,
                height: 46,
                child: c == null
                    ? Container(
                        decoration: const BoxDecoration(gradient: AppColors.roseGoldGradient),
                        child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 22),
                      )
                    : AppNetworkImage(url: c.image?.url, targetWidth: 120),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              c?.displayTitle ?? 'Collections',
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: context.text.labelSmall?.copyWith(
                color: selected ? context.colors.primary : context.colors.onSurface,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryPane extends StatelessWidget {
  const _CategoryPane({required this.category});
  final CategoryModel category;

  @override
  Widget build(BuildContext context) {
    final children = category.activeChildren;
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        GestureDetector(
          onTap: () => context.push(RoutePaths.category(category.slug)),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: AspectRatio(
              aspectRatio: 16 / 8,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  AppNetworkImage(url: category.image?.url, targetWidth: 600),
                  const DecoratedBox(decoration: BoxDecoration(gradient: AppColors.imageScrim)),
                  Positioned(
                    left: 14,
                    bottom: 12,
                    right: 14,
                    child: Row(
                      children: [
                        Expanded(
                          child: Text('All ${category.name}',
                              style: context.text.headlineSmall?.copyWith(color: Colors.white)),
                        ),
                        const Icon(Icons.arrow_forward_rounded, color: Colors.white),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (category.description.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.sm),
          Text(category.description, style: context.text.bodySmall, maxLines: 3),
        ],
        const SizedBox(height: AppSpacing.lg),
        if (children.isEmpty)
          OutlinedButton(
            onPressed: () => context.push(RoutePaths.category(category.slug)),
            child: const Text('VIEW ALL PRODUCTS'),
          )
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: children.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: AppSpacing.md,
              crossAxisSpacing: AppSpacing.sm,
              childAspectRatio: 0.72,
            ),
            itemBuilder: (_, i) {
              final sub = children[i];
              return GestureDetector(
                onTap: () => context.push(RoutePaths.category(sub.slug)),
                child: Column(
                  children: [
                    AspectRatio(
                      aspectRatio: 1,
                      child: AppNetworkImage(
                        url: sub.image?.url,
                        targetWidth: 200,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(sub.displayTitle,
                        maxLines: 2,
                        textAlign: TextAlign.center,
                        overflow: TextOverflow.ellipsis,
                        style: context.text.labelMedium),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }
}

class _CollectionsPane extends StatelessWidget {
  const _CollectionsPane();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      physics: const AlwaysScrollableScrollPhysics(),
      children: CollectionType.values
          .map((c) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: CollectionTile(type: c),
              ))
          .toList(),
    );
  }
}

class CollectionTile extends StatelessWidget {
  const CollectionTile({super.key, required this.type});
  final CollectionType type;

  IconData get _icon => switch (type) {
        CollectionType.newArrivals => Icons.fiber_new_outlined,
        CollectionType.bestSellers => Icons.workspace_premium_outlined,
        CollectionType.trending => Icons.trending_up_rounded,
        CollectionType.topRated => Icons.star_outline_rounded,
        CollectionType.featured => Icons.auto_awesome_outlined,
        CollectionType.sale => Icons.local_offer_outlined,
      };

  @override
  Widget build(BuildContext context) {
    final sale = type == CollectionType.sale;
    return InkWell(
      borderRadius: BorderRadius.circular(AppRadius.md),
      onTap: () => context.push(RoutePaths.collection(type.slug)),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          gradient: sale ? AppColors.wineGradient : null,
          color: sale ? null : context.colors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: sale ? null : Border.all(color: context.colors.outline),
        ),
        child: Row(
          children: [
            Icon(_icon, color: sale ? AppColors.champagne : AppColors.roseGold),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(type.title,
                      style: context.text.titleLarge?.copyWith(color: sale ? Colors.white : null)),
                  Text(type.overline,
                      style: context.text.bodySmall?.copyWith(color: sale ? AppColors.champagne : null)),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: sale ? Colors.white : context.colors.primary),
          ],
        ),
      ),
    );
  }
}
