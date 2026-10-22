import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../models/user_model.dart';
import '../network/api_client.dart';
import '../network/auth_interceptor.dart';
import '../network/retry_interceptor.dart';
import '../services/connectivity_service.dart';
import '../services/file_service.dart';
import '../services/launcher_service.dart';
import '../services/local_storage_service.dart';
import '../services/push_notification_service.dart';
import '../services/razorpay_service.dart';
import '../services/secure_storage_service.dart';
import '../services/token_manager.dart';

/// The following providers are initialised in main.dart (async work) and
/// injected through ProviderScope overrides.
final secureStorageProvider =
    Provider<SecureStorageService>((ref) => SecureStorageService());

final localStorageProvider = Provider<LocalStorageService>(
    (ref) => throw UnimplementedError('localStorageProvider must be overridden in main()'));

final tokenManagerProvider = Provider<TokenManager>(
    (ref) => throw UnimplementedError('tokenManagerProvider must be overridden in main()'));

final pushServiceProvider = Provider<PushNotificationService>(
    (ref) => throw UnimplementedError('pushServiceProvider must be overridden in main()'));

/// The cached user read from secure storage at startup (may be null).
final initialUserProvider = Provider<UserModel?>((ref) => null);

final connectivityServiceProvider =
    Provider<ConnectivityService>((ref) => ConnectivityService());
final razorpayServiceProvider = Provider<RazorpayService>((ref) => RazorpayService());
final fileServiceProvider = Provider<FileService>((ref) => FileService());
final launcherServiceProvider = Provider<LauncherService>((ref) => LauncherService());

final dioProvider = Provider<Dio>((ref) {
  final tokens = ref.watch(tokenManagerProvider);
  final options = BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: AppConfig.connectTimeout,
    receiveTimeout: AppConfig.receiveTimeout,
    sendTimeout: AppConfig.sendTimeout,
    contentType: Headers.jsonContentType,
    responseType: ResponseType.json,
    headers: <String, dynamic>{
      'Accept': 'application/json',
      // Browsers refuse to set User-Agent.
      if (!kIsWeb) 'User-Agent': 'SwastikalaApp/1.0 (Flutter; ${defaultTargetPlatform.name})',
      'X-Client-Platform': 'flutter',
    },
    // Web: send/receive the httpOnly refresh cookie (the backend allows credentials).
    extra: <String, dynamic>{if (kIsWeb) 'withCredentials': true},
  );
  final plain = Dio(options);
  final dio = Dio(options);
  dio.interceptors.add(AuthInterceptor(tokenManager: tokens, plainDio: plain));
  dio.interceptors.add(RetryInterceptor(dio));
  if (kDebugMode) {
    dio.interceptors.add(LogInterceptor(
      requestHeader: false,
      requestBody: false,
      responseHeader: false,
      responseBody: false,
      logPrint: (o) => debugPrint(o.toString()),
    ));
  }
  ref.onDispose(() {
    dio.close();
    plain.close();
  });
  return dio;
});

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient(ref.watch(dioProvider)));

final connectivityProvider = StreamProvider<bool>((ref) async* {
  final service = ref.watch(connectivityServiceProvider);
  yield await service.isOnline();
  yield* service.onStatusChange;
});

final isOnlineProvider = Provider<bool>(
    (ref) => ref.watch(connectivityProvider).valueOrNull ?? true);
