import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../config/app_config.dart';

/// Background isolate entry point — must be a top-level function.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
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
      await Firebase.initializeApp();
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
          android: AndroidInitializationSettings('@mipmap/ic_launcher'),
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

  Future<void> deleteToken() async {
    if (!_initialized) return;
    try {
      await FirebaseMessaging.instance.deleteToken();
    } catch (_) {}
  }

  void _handleForeground(RemoteMessage message) {
    _foreground.add(message);
    // iOS presents foreground notifications natively (presentation options).
    if (!Platform.isAndroid) return;
    final notification = message.notification;
    if (notification == null) return;
    _local.show(
      message.messageId?.hashCode ?? DateTime.now().millisecondsSinceEpoch ~/ 1000,
      notification.title,
      notification.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          AppConfig.notificationChannelId,
          AppConfig.notificationChannelName,
          channelDescription: AppConfig.notificationChannelDescription,
          importance: Importance.high,
          priority: Priority.high,
          color: Color(0xFF5A1E36),
        ),
      ),
      payload: jsonEncode(message.data),
    );
  }
}
