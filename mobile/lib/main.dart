import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/models/user_model.dart';
import 'core/providers/core_providers.dart';
import 'core/services/local_storage_service.dart';
import 'core/services/push_notification_service.dart';
import 'core/services/secure_storage_service.dart';
import 'core/services/token_manager.dart';

void main() {
  runZonedGuarded<Future<void>>(() async {
    WidgetsFlutterBinding.ensureInitialized();

    FlutterError.onError = (details) {
      FlutterError.presentError(details);
      if (kReleaseMode) debugPrint('FlutterError: ${details.exceptionAsString()}');
    };
    PlatformDispatcher.instance.onError = (error, stack) {
      debugPrint('Uncaught platform error: $error');
      return true;
    };

    await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(statusBarColor: Colors.transparent));

    final secure = SecureStorageService();
    final tokens = TokenManager(secure);
    await tokens.load();
    final storage = await LocalStorageService.init(secure);
    final initialUser = await _cachedUser(secure);

    final firebaseReady = await PushNotificationService.initializeFirebase();
    final push = PushNotificationService();
    await push.init(firebaseReady: firebaseReady);

    runApp(ProviderScope(
      overrides: [
        secureStorageProvider.overrideWithValue(secure),
        tokenManagerProvider.overrideWithValue(tokens),
        localStorageProvider.overrideWithValue(storage),
        pushServiceProvider.overrideWithValue(push),
        initialUserProvider.overrideWithValue(initialUser),
      ],
      child: const SwastikalaApp(),
    ));
  }, (error, stack) {
    debugPrint('Uncaught zone error: $error');
  });
}

Future<UserModel?> _cachedUser(SecureStorageService secure) async {
  final raw = await secure.read(SecureStorageService.userKey);
  if (raw == null || raw.isEmpty) return null;
  try {
    return UserModel.fromJson(Map<String, dynamic>.from(jsonDecode(raw) as Map));
  } catch (_) {
    return null;
  }
}
