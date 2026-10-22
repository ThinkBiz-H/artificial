import 'package:flutter/material.dart';

/// Fires [onLoadMore] when the user scrolls near the bottom.
class InfiniteScrollListener extends StatelessWidget {
  const InfiniteScrollListener({
    super.key,
    required this.child,
    required this.onLoadMore,
    this.threshold = 600,
  });

  final Widget child;
  final VoidCallback onLoadMore;
  final double threshold;

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: (n) {
        if (n.metrics.axis == Axis.vertical &&
            n.metrics.extentAfter < threshold &&
            (n is ScrollUpdateNotification || n is OverscrollNotification)) {
          onLoadMore();
        }
        return false;
      },
      child: child,
    );
  }
}

class LoadMoreFooter extends StatelessWidget {
  const LoadMoreFooter({super.key, required this.loading, required this.hasMore, this.error, this.onRetry});

  final bool loading;
  final bool hasMore;
  final Object? error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    if (error != null && onRetry != null) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Center(child: TextButton.icon(
          onPressed: onRetry,
          icon: const Icon(Icons.refresh_rounded),
          label: const Text('COULD NOT LOAD MORE — RETRY'),
        )),
      );
    }
    if (loading) {
      return const Padding(
        padding: EdgeInsets.all(20),
        child: Center(child: SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2))),
      );
    }
    if (!hasMore) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Center(
          child: Text('— You have seen it all —', style: Theme.of(context).textTheme.bodySmall),
        ),
      );
    }
    return const SizedBox(height: 24);
  }
}
