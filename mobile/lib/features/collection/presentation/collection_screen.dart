import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/product_query.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import '../../../shared/widgets/product_grid.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../../category/presentation/categories_screen.dart';
import '../../product/presentation/product_listing_view.dart';
import '../../product/viewmodels/product_list_viewmodel.dart';

/// /collection/:type — curated lists. "sale" is a paginated filtered
/// listing (salePrice[gt]=0); the others use the backend list endpoints.
class CollectionScreen extends ConsumerWidget {
  const CollectionScreen({super.key, required this.slug});
  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final type = CollectionType.fromSlug(slug) ?? CollectionType.newArrivals;
    final header = SliverToBoxAdapter(child: _CollectionHeader(type: type));

    return Scaffold(
      appBar: AppBar(title: Text(type.title), actions: const [CartIconButton()]),
      body: type == CollectionType.sale
          ? ProductListingView(
              initialQuery: const ProductQuery(onSale: true),
              header: [header],
              emptyTitle: 'No offers right now',
              emptyMessage: 'Check back soon for special prices.',
            )
          : _RailCollection(type: type, header: header),
    );
  }
}

class _RailCollection extends ConsumerWidget {
  const _RailCollection({required this.type, required this.header});
  final CollectionType type;
  final Widget header;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(collectionProductsProvider(type));
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(collectionProductsProvider(type));
        try {
          await ref.read(collectionProductsProvider(type).future);
        } catch (_) {}
      },
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          header,
          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.md)),
          ...products.when<List<Widget>>(
            loading: () => [SliverProductGridSkeleton(columns: context.gridColumns)],
            error: (e, _) => [
              SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorState(error: e, onRetry: () => ref.invalidate(collectionProductsProvider(type))),
              ),
            ],
            data: (list) => list.isEmpty
                ? [
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: EmptyState(
                        icon: Icons.diamond_outlined,
                        title: 'Coming soon',
                        message: 'This collection is being curated.',
                      ),
                    ),
                  ]
                : [SliverProductGrid(products: list, heroPrefix: type.slug)],
          ),
          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xxl)),
        ],
      ),
    );
  }
}

class _CollectionHeader extends StatelessWidget {
  const _CollectionHeader({required this.type});
  final CollectionType type;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.xs, AppSpacing.md, 0),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: AppColors.wineGradient,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(type.overline.toUpperCase(), style: AppTypography.overline(AppColors.roseGoldLight)),
          const SizedBox(height: 4),
          Text(type.title, style: context.text.displaySmall?.copyWith(color: Colors.white)),
        ],
      ),
    );
  }
}

/// /collections — index of curated collections.
class CollectionsScreen extends StatelessWidget {
  const CollectionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Collections')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: CollectionType.values
            .map((c) => Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                  child: CollectionTile(type: c),
                ))
            .toList(),
      ),
    );
  }
}
