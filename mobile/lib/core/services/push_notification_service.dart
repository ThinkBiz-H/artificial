import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../../firebase_options.dart';
import '../config/app_config.dart';

/// Background isolate entry point — must be a top-level function.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Notification messages are drawn by the system in the background and when
  // the app is closed; this isolate only needs Firebase initialised.
  await _initFirebaseApp();
}

/// Initialises Firebase once (a second call in the same isolate is a no-op).
Future<FirebaseApp> _initFirebaseApp() async {
  if (Firebase.apps.isNotEmpty) return Firebase.app();
  final options = DefaultFirebaseOptions.currentPlatform;
  return options == null ? Firebase.initializeApp() : Firebase.initializeApp(options: options);
}

/// FCM + local notifications. If Firebase is not configured
/// (google-services.json / GoogleService-Info.plist missing) the app keeps
/// working and this service simply reports itself unavailable.
class PushNotificationService {
  final FlutterLocalNotificationsPlugin _local = FlutterLocalNotificationsPlugin();
  final StreamController<RemoteMessage> _foreground =
      StreamController<RemoteMessage>.broadcast();

  bool _initialized = false;
  bool get isAvailable => _initialized;

  /// Set by the app shell: invoked when the user taps a notification.
  void Function(Map<String, dynamic> data)? onNotificationTap;

  /// Set by the auth layer: invoked when FCM rotates the device token.
  void Function(String token)? onTokenRefresh;

  Stream<RemoteMessage> get onForegroundMessage => _foreground.stream;

  static Future<bool> initializeFirebase() async {
    // Web needs explicit FirebaseOptions, which this project doesn't ship.
    if (kIsWeb) return false;
    try {
      await _initFirebaseApp();
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
      return true;
    } catch (e) {
      debugPrint('Firebase not configured — push disabled: $e');
      return false;
    }
  }

  Future<void> init({required bool firebaseReady}) async {
    if (!firebaseReady || _initialized) return;
    try {
      await _local.initialize(
        const InitializationSettings(
          android: AndroidInitializationSettings('@drawable/ic_stat_notification'),
          iOS: DarwinInitializationSettings(
            requestAlertPermission: false,
            requestBadgePermission: false,
            requestSoundPermission: false,
          ),
        ),
        onDidReceiveNotificationResponse: (response) {
          final payload = response.payload;
          if (payload == null || payload.isEmpty) {
            onNotificationTap?.call(<String, dynamic>{});
            return;
          }
          try {
            final decoded = jsonDecode(payload);
            onNotificationTap?.call(decoded is Map
                ? Map<String, dynamic>.from(decoded)
                : <String, dynamic>{});
          } catch (_) {
            onNotificationTap?.call(<String, dynamic>{});
          }
        },
      );

      await _androidPlugin?.createNotificationChannel(
        const AndroidNotificationChannel(
          AppConfig.notificationChannelId,
          AppConfig.notificationChannelName,
          description: AppConfig.notificationChannelDescription,
          importance: Importance.high,
        ),
      );

      final messaging = FirebaseMessaging.instance;
      await messaging.setForegroundNotificationPresentationOptions(
          alert: true, badge: true, sound: true);
      FirebaseMessaging.onMessage.listen(_handleForeground);
      FirebaseMessaging.onMessageOpenedApp
          .listen((m) => onNotificationTap?.call(m.data));
      messaging.onTokenRefresh.listen((t) => onTokenRefresh?.call(t));
      _initialized = true;
    } catch (e) {
      debugPrint('Push init failed: $e');
    }
  }

  AndroidFlutterLocalNotificationsPlugin? get _androidPlugin =>
      _local.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();

  Future<Map<String, dynamic>?> initialMessageData() async {
    if (!_initialized) return null;
    try {
      final message = await FirebaseMessaging.instance.getInitialMessage();
      return message?.data;
    } catch (_) {
      return null;
    }
  }

  Future<bool> requestPermission() async {
    if (!_initialized) return false;
    try {
      final settings = await FirebaseMessaging.instance
          .requestPermission(alert: true, badge: true, sound: true);
      await _androidPlugin?.requestNotificationsPermission();
      return settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional;
    } catch (_) {
      return false;
    }
  }

  Future<String?> getToken() async {
    if (!_initialized) return null;
    try {
      if (Platform.isIOS) {
        final apns = await FirebaseMessaging.instance.getAPNSToken();
        if (apns == null) return null;
      }
      return await FirebaseMessaging.instance.getToken();
    } catch (_) {
      return null;
    }
  }

  /// Subscribes (or unsubscribes) this install to the campaign topics.
  Future<void> setTopicSubscriptions(bool enabled) async {
    if (!_initialized) return;
    final messaging = FirebaseMessaging.instance;
    for (final topic in AppConfig.pushTopics) {
      try {
        if (enabled) {
          await messaging.subscribeToTopic(topic);
        } else {
          await messaging.unsubscribeFromTopic(topic);
        }
      } catch (e) {
        // iOS before an APNs token exists, or offline — retried on next launch.
        debugPrint('Topic $topic ${enabled ? "subscribe" : "unsubscribe"} failed: $e');
      }
    }
  }

  Future<void> deleteToken() async {
    if (!_initialized) return;
    try {
      await FirebaseMessaging.instance.deleteToken();
    } catch (_) {}
  }

  /// Recently shown message ids — FCM can redeliver a message; show it once.
  final List<String> _recentIds = <String>[];

  Future<void> _handleForeground(RemoteMessage message) async {
    final id = message.messageId;
    if (id != null) {
      if (_recentIds.contains(id)) return;
      _recentIds.add(id);
      if (_recentIds.length > 50) _recentIds.removeAt(0);
    }
    _foreground.add(message);
    // iOS presents foreground notifications natively (presentation options).
    if (!Platform.isAndroid) return;
    final notification = message.notification;
    if (notification == null) return;
    // Rich notification: the system draws images itself in the background;
    // in the foreground we download it and use a big-picture style.
    final imageUrl = notification.android?.imageUrl ?? message.data['imageUrl']?.toString();
    final picture = imageUrl == null || imageUrl.isEmpty ? null : await _downloadImage(imageUrl);
    await _local.show(
      message.messageId?.hashCode ?? DateTime.now().millisecondsSinceEpoch ~/ 1000,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          AppConfig.notificationChannelId,
          AppConfig.notificationChannelName,
          channelDescription: AppConfig.notificationChannelDescription,
          importance: Importance.high,
          priority: Priority.high,
          color: const Color(0xFF5A1E36),
          icon: '@drawable/ic_stat_notification',
          playSound: true,
          enableVibration: true,
          number: int.tryParse('${message.data['badge'] ?? ''}'),
          largeIcon: picture == null ? null : ByteArrayAndroidBitmap(picture),
          styleInformation: picture == null
              ? BigTextStyleInformation(notification.body ?? '')
              : BigPictureStyleInformation(
                  ByteArrayAndroidBitmap(picture),
                  hideExpandedLargeIcon: true,
                  contentTitle: notification.title,
                  summaryText: notification.body,
                ),
        ),
      ),
      payload: jsonEncode(message.data),
    );
  }

  /// Fetches a notification image (https only, 6s budget). Null on any failure
  /// — the notification is then shown without it.
  Future<Uint8List?> _downloadImage(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null || uri.scheme != 'https') return null;
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 6);
    try {
      final request = await client.getUrl(uri).timeout(const Duration(seconds: 6));
      final response = await request.close().timeout(const Duration(seconds: 6));
      if (response.statusCode != 200) return null;
      final builder = BytesBuilder(copy: false);
      await for (final chunk in response.timeout(const Duration(seconds: 6))) {
        builder.add(chunk);
        if (builder.length > 5 * 1024 * 1024) return null; // keep it small
      }
      return builder.takeBytes();
    } catch (_) {
      return null;
    } finally {
      client.close(force: true);
    }
  }
}
