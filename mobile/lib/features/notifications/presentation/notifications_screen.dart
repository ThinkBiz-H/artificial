import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/notification_model.dart';
import '../../../core/routes/link_resolver.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/dialogs.dart';
import '../../../shared/widgets/infinite_scroll.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../viewmodels/notifications_viewmodel.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  IconData _icon(String type) {
    if (type.startsWith('order_')) return Icons.inventory_2_outlined;
    if (type.startsWith('payment')) return Icons.payments_outlined;
    if (type.contains('refund') || type.contains('return')) return Icons.assignment_return_outlined;
    if (type == 'coupon' || type.contains('price')) return Icons.local_offer_outlined;
    return Icons.notifications_none_rounded;
  }

  void _open(BuildContext context, WidgetRef ref, NotificationModel n) {
    ref.read(notificationsProvider.notifier).markRead(n);
    if (n.isOrderRelated) {
      context.push(RoutePaths.order(n.relatedOrder!));
    } else if (n.link != null && n.link!.isNotEmpty) {
      final route = LinkResolver.toRoute(n.link!);
      if (route != null) context.push(route);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(notificationsProvider);
    final hasItems = async.valueOrNull?.items.isNotEmpty ?? false;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (hasItems)
            PopupMenuButton<String>(
              onSelected: (v) async {
                try {
                  if (v == 'read') {
                    await ref.read(notificationsProvider.notifier).markAllRead();
                  } else {
                    final ok = await showConfirmDialog(context,
                        title: 'Clear all notifications?',
                        message: 'This removes every notification.',
                        confirmLabel: 'Clear',
                        destructive: true);
                    if (ok) await ref.read(notificationsProvider.notifier).clearAll();
                  }
                } catch (e) {
                  if (context.mounted) context.showError(e);
                }
              },
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'read', child: Text('Mark all as read')),
                PopupMenuItem(value: 'clear', child: Text('Clear all')),
              ],
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(notificationsProvider.notifier).refresh(),
        child: async.when(
          loading: () => const ListTileSkeleton(),
          error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(notificationsProvider)),
          data: (s) => s.items.isEmpty
              ? ListView(children: const [
                  SizedBox(
                    height: 480,
                    child: EmptyState(
                      icon: Icons.notifications_none_rounded,
                      title: 'All caught up',
                      message: 'Order updates and offers will appear here.',
                    ),
                  ),
                ])
              : InfiniteScrollListener(
                  onLoadMore: () => ref.read(notificationsProvider.notifier).loadMore(),
                  child: ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: s.items.length + 1,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (_, i) {
                      if (i == s.items.length) {
                        return LoadMoreFooter(loading: s.loadingMore, hasMore: s.hasMore);
                      }
                      final n = s.items[i];
                      return Dismissible(
                        key: ValueKey(n.id),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 24),
                          color: AppColors.error.withValues(alpha: 0.12),
                          child: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
                        ),
                        confirmDismiss: (_) async {
                          try {
                            await ref.read(notificationsProvider.notifier).delete(n);
                            return true;
                          } catch (e) {
                            if (context.mounted) context.showError(e);
                            return false;
                          }
                        },
                        child: Container(
                          color: n.isRead ? null : AppColors.roseGoldLight.withValues(alpha: context.isDark ? 0.08 : 0.25),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
                            leading: CircleAvatar(
                              backgroundColor: AppColors.champagne,
                              child: Icon(_icon(n.type), color: AppColors.wine, size: 20),
                            ),
                            title: Text(n.title,
                                style: context.text.titleSmall
                                    ?.copyWith(fontWeight: n.isRead ? FontWeight.w500 : FontWeight.w700)),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 2),
                                Text(n.message, style: context.text.bodySmall?.copyWith(color: context.colors.onSurface)),
                                const SizedBox(height: 2),
                                Text(Formatters.relative(n.createdAt), style: context.text.bodySmall),
                              ],
                            ),
                            onTap: () => _open(context, ref, n),
                          ),
                        ),
                      );
                    },
                  ),
                ),
        ),
      ),
    );
  }
}
