import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/notification_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';

/// Badge count (GET /notifications?unreadOnly=true&limit=1 → unreadCount).
final unreadNotificationsProvider = FutureProvider<int>((ref) async {
  if (!ref.watch(isAuthenticatedProvider)) return 0;
  try {
    return await ref.watch(notificationRepositoryProvider).unreadCount();
  } catch (_) {
    return 0;
  }
});

class NotificationsState {
  const NotificationsState({
    required this.items,
    required this.page,
    required this.hasMore,
    required this.unread,
    this.loadingMore = false,
  });

  final List<NotificationModel> items;
  final int page;
  final bool hasMore;
  final int unread;
  final bool loadingMore;

  NotificationsState copyWith({List<NotificationModel>? items, int? page, bool? hasMore, int? unread, bool? loadingMore}) =>
      NotificationsState(
        items: items ?? this.items,
        page: page ?? this.page,
        hasMore: hasMore ?? this.hasMore,
        unread: unread ?? this.unread,
        loadingMore: loadingMore ?? this.loadingMore,
      );
}

class NotificationsNotifier extends AutoDisposeAsyncNotifier<NotificationsState> {
  static const _limit = 20;

  @override
  Future<NotificationsState> build() async {
    final res = await ref.watch(notificationRepositoryProvider).list(page: 1, limit: _limit);
    return NotificationsState(
      items: res.page.items,
      page: 1,
      hasMore: res.page.hasMore,
      unread: res.unreadCount,
    );
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
    ref.invalidate(unreadNotificationsProvider);
  }

  Future<void> loadMore() async {
    final s = state.valueOrNull;
    if (s == null || s.loadingMore || !s.hasMore) return;
    state = AsyncData(s.copyWith(loadingMore: true));
    try {
      final res = await ref.read(notificationRepositoryProvider).list(page: s.page + 1, limit: _limit);
      state = AsyncData(s.copyWith(
        items: [...s.items, ...res.page.items],
        page: s.page + 1,
        hasMore: res.page.hasMore,
        unread: res.unreadCount,
        loadingMore: false,
      ));
    } catch (_) {
      state = AsyncData(s.copyWith(loadingMore: false));
    }
  }

  Future<void> markRead(NotificationModel n) async {
    if (n.isRead) return;
    final s = state.valueOrNull;
    if (s != null) {
      state = AsyncData(s.copyWith(
        items: s.items.map((e) => e.id == n.id ? e.copyWith(isRead: true) : e).toList(),
        unread: (s.unread - 1).clamp(0, 1 << 30),
      ));
    }
    try {
      await ref.read(notificationRepositoryProvider).markRead(n.id);
    } catch (_) {}
    ref.invalidate(unreadNotificationsProvider);
  }

  Future<void> markAllRead() async {
    await ref.read(notificationRepositoryProvider).markAllRead();
    final s = state.valueOrNull;
    if (s != null) {
      state = AsyncData(s.copyWith(items: s.items.map((e) => e.copyWith(isRead: true)).toList(), unread: 0));
    }
    ref.invalidate(unreadNotificationsProvider);
  }

  Future<void> delete(NotificationModel n) async {
    final s = state.valueOrNull;
    if (s != null) {
      state = AsyncData(s.copyWith(items: s.items.where((e) => e.id != n.id).toList()));
    }
    await ref.read(notificationRepositoryProvider).delete(n.id);
    ref.invalidate(unreadNotificationsProvider);
  }

  Future<void> clearAll() async {
    await ref.read(notificationRepositoryProvider).clearAll();
    state = const AsyncData(NotificationsState(items: [], page: 1, hasMore: false, unread: 0));
    ref.invalidate(unreadNotificationsProvider);
  }
}

final notificationsProvider =
    AsyncNotifierProvider.autoDispose<NotificationsNotifier, NotificationsState>(NotificationsNotifier.new);
