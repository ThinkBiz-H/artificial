import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/product_query.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import '../../../shared/widgets/infinite_scroll.dart';
import '../../../shared/widgets/product_grid.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../viewmodels/product_list_viewmodel.dart';
import 'filter_sheets.dart';

/// Reusable infinite-scrolling product grid with sort + filter bar.
/// [header] slivers are placed above the toolbar (banners, chips…).
class ProductListingView extends ConsumerStatefulWidget {
  const ProductListingView({
    super.key,
    required this.initialQuery,
    this.header = const <Widget>[],
    this.emptyTitle = 'No pieces found',
    this.emptyMessage = 'Try removing a filter or browsing another collection.',
    this.showToolbar = true,
  });

  final ProductQuery initialQuery;
  final List<Widget> header;
  final String emptyTitle;
  final String emptyMessage;
  final bool showToolbar;

  @override
  ConsumerState<ProductListingView> createState() => _ProductListingViewState();
}

class _ProductListingViewState extends ConsumerState<ProductListingView> {
  late ProductQuery _query = widget.initialQuery;

  @override
  void didUpdateWidget(covariant ProductListingView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialQuery != widget.initialQuery) {
      _query = widget.initialQuery;
    }
  }

  Future<void> _openSort() async {
    final sort = await showSortSheet(context, _query.sort);
    if (sort != null && mounted) setState(() => _query = _query.copyWith(sort: sort));
  }

  Future<void> _openFilters(ProductListState? data) async {
    final q = await showFilterSheet(
      context,
      query: _query,
      colors: data?.colors ?? const [],
      sizes: data?.sizes ?? const [],
    );
    if (q != null && mounted) setState(() => _query = q);
  }

  @override
  Widget build(BuildContext context) {
    final provider = productListProvider(_query);
    final async = ref.watch(provider);
    final data = async.valueOrNull;

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(provider);
        try {
          await ref.read(provider.future);
        } catch (_) {}
      },
      child: InfiniteScrollListener(
        onLoadMore: () => ref.read(provider.notifier).loadMore(),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            ...widget.header,
            if (widget.showToolbar)
              SliverPersistentHeader(
                pinned: true,
                delegate: _ToolbarDelegate(
                  total: data?.total,
                  sortLabel: _query.sort.label,
                  filterCount: _query.activeFilterCount,
                  onSort: _openSort,
                  onFilter: () => _openFilters(data),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.md)),
            ...async.when<List<Widget>>(
              loading: () => [SliverProductGridSkeleton(columns: context.gridColumns)],
              error: (e, _) => [
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: ErrorState(error: e, onRetry: () => ref.invalidate(provider)),
                ),
              ],
              data: (d) => d.items.isEmpty
                  ? [
                      SliverFillRemaining(
                        hasScrollBody: false,
                        child: EmptyState(
                          icon: Icons.search_off_rounded,
                          title: widget.emptyTitle,
                          message: widget.emptyMessage,
                          actionLabel: _query.activeFilterCount > 0 ? 'Clear filters' : null,
                          onAction: _query.activeFilterCount > 0
                              ? () => setState(() => _query = _query.clearFilters())
                              : null,
                        ),
                      ),
                    ]
                  : [
                      SliverProductGrid(products: d.items),
                      SliverToBoxAdapter(
                        child: LoadMoreFooter(
                          loading: d.loadingMore,
                          hasMore: d.hasMore,
                          error: d.loadMoreError,
                          onRetry: () => ref.read(provider.notifier).loadMore(),
                        ),
                      ),
                    ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ToolbarDelegate extends SliverPersistentHeaderDelegate {
  _ToolbarDelegate({
    required this.total,
    required this.sortLabel,
    required this.filterCount,
    required this.onSort,
    required this.onFilter,
  });

  final int? total;
  final String sortLabel;
  final int filterCount;
  final VoidCallback onSort;
  final VoidCallback onFilter;

  @override
  double get minExtent => 52;
  @override
  double get maxExtent => 52;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    // The child must be exactly maxExtent tall: the header reports 52px of
    // layout, and a shorter child (the TextButtons are 48px) makes the sliver
    // geometry invalid and the whole listing fail to paint.
    return Container(
      height: maxExtent,
      color: context.theme.scaffoldBackgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Row(
        children: [
          Expanded(
            child: Text(total == null ? '' : '$total ${total == 1 ? 'piece' : 'pieces'}',
                style: context.text.bodySmall),
          ),
          TextButton.icon(
            onPressed: onSort,
            icon: const Icon(Icons.swap_vert_rounded, size: 18),
            label: Text(sortLabel.toUpperCase(), overflow: TextOverflow.ellipsis),
          ),
          TextButton.icon(
            onPressed: onFilter,
            icon: CountBadge(count: filterCount, child: const Icon(Icons.tune_rounded, size: 18)),
            label: const Text('FILTER'),
          ),
        ],
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _ToolbarDelegate old) =>
      old.total != total || old.sortLabel != sortLabel || old.filterCount != filterCount;
}
