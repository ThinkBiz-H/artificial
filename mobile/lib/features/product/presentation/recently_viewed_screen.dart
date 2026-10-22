import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/core_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/product_grid.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../viewmodels/recently_viewed_viewmodel.dart';

class RecentlyViewedScreen extends ConsumerWidget {
  const RecentlyViewedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(recentlyViewedProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recently Viewed'),
        actions: [
          IconButton(
            tooltip: 'Clear on this device',
            icon: const Icon(Icons.delete_sweep_outlined),
            onPressed: () async {
              await ref.read(localStorageProvider).clearRecentlyViewed();
              ref.invalidate(recentlyViewedProvider);
            },
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.md)),
          ...async.when<List<Widget>>(
            loading: () => [SliverProductGridSkeleton(columns: context.gridColumns)],
            error: (e, _) => [
              SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorState(error: e, onRetry: () => ref.invalidate(recentlyViewedProvider)),
              ),
            ],
            data: (items) => items.isEmpty
                ? [
                    SliverFillRemaining(
                      hasScrollBody: false,
                      child: EmptyState(
                        icon: Icons.history_rounded,
                        title: 'Nothing here yet',
                        message: 'Pieces you view will appear here.',
                        actionLabel: 'Explore',
                        onAction: () => context.go(RoutePaths.home),
                      ),
                    ),
                  ]
                : [SliverProductGrid(products: items, heroPrefix: 'recently')],
          ),
          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xxl)),
        ],
      ),
    );
  }
}
