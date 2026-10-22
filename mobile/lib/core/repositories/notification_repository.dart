import '../network/api_client.dart';
import '../network/api_endpoints.dart';
import '../network/api_exception.dart';
import '../models/common_models.dart';
import '../models/json_converters.dart';
import '../models/notification_model.dart';
import '../models/paginated.dart';

class NotificationPage {
  const NotificationPage({required this.page, required this.unreadCount});
  final Paginated<NotificationModel> page;
  final int unreadCount;
}

/// routes/notification.routes.js
class NotificationRepository {
  NotificationRepository(this._api);

  final ApiClient _api;

  Future<NotificationPage> list({int page = 1, int limit = 20, bool unreadOnly = false}) async {
    final res = await _api.get(ApiEndpoints.notifications, query: {
      'page': page,
      'limit': limit,
      if (unreadOnly) 'unreadOnly': 'true',
    });
    return NotificationPage(
      page: Paginated(
        items: res.list('notifications').map(NotificationModel.fromJson).toList(),
        pagination: Pagination.fromJson(res.map('pagination') ?? const {}),
      ),
      unreadCount: intFromJson(res.data['unreadCount']),
    );
  }

  Future<int> unreadCount() async {
    final res = await _api.get(ApiEndpoints.notifications,
        query: {'page': 1, 'limit': 1, 'unreadOnly': 'true'});
    return intFromJson(res.data['unreadCount']);
  }

  Future<void> markRead(String id) async {
    await _api.patch(ApiEndpoints.notificationRead(id));
  }

  Future<void> markAllRead() async {
    await _api.patch(ApiEndpoints.notificationsReadAll);
  }

  Future<void> delete(String id) async {
    await _api.delete(ApiEndpoints.notification(id));
  }

  Future<void> clearAll() async {
    await _api.delete(ApiEndpoints.notifications);
  }

  Future<void> registerPushToken(String token) async {
    await _api.post(ApiEndpoints.pushToken, data: {'token': token});
  }

  Future<void> unregisterPushToken(String token) async {
    try {
      await _api.delete(ApiEndpoints.pushToken, data: {'token': token});
    } on AppException {
      // Best-effort during logout.
    }
  }
}
