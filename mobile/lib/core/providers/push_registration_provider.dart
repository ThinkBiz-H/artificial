import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core_providers.dart';
import 'repository_providers.dart';

/// Keeps the backend's User.pushTokens in sync with this device's FCM token
/// (POST/DELETE /notifications/push-token).
class PushRegistration {
  PushRegistration(this._ref);

  final Ref _ref;

  Future<void> register() async {
    final storage = _ref.read(localStorageProvider);
    final push = _ref.read(pushServiceProvider);
    if (!storage.pushEnabled || !push.isAvailable) return;
    try {
      await push.requestPermission();
      final token = await push.getToken();
      if (token == null) return;
      await _ref.read(notificationRepositoryProvider).registerPushToken(token);
      await storage.setLastPushToken(token);
    } catch (_) {
      // Push is a nice-to-have; never block login on it.
    }
  }

  Future<void> onTokenRefreshed(String token) async {
    final storage = _ref.read(localStorageProvider);
    if (!storage.pushEnabled) return;
    try {
      final previous = storage.lastPushToken;
      final repo = _ref.read(notificationRepositoryProvider);
      if (previous != null && previous != token) {
        await repo.unregisterPushToken(previous);
      }
      await repo.registerPushToken(token);
      await storage.setLastPushToken(token);
    } catch (_) {}
  }

  Future<void> unregister() async {
    final storage = _ref.read(localStorageProvider);
    final token = storage.lastPushToken;
    if (token == null) return;
    await _ref.read(notificationRepositoryProvider).unregisterPushToken(token);
    await storage.setLastPushToken(null);
  }
}

final pushRegistrationProvider = Provider<PushRegistration>((ref) => PushRegistration(ref));
