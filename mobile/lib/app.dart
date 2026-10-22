import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/config/app_config.dart';
import 'core/providers/app_providers.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/core_providers.dart';
import 'core/providers/push_registration_provider.dart';
import 'core/routes/app_router.dart';
import 'core/routes/link_resolver.dart';
import 'core/routes/route_paths.dart';
import 'core/theme/app_theme.dart';
import 'features/notifications/viewmodels/notifications_viewmodel.dart';
import 'shared/widgets/offline_banner.dart';

final scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class SwastikalaApp extends ConsumerStatefulWidget {
  const SwastikalaApp({super.key});

  @override
  ConsumerState<SwastikalaApp> createState() => _SwastikalaAppState();
}

class _SwastikalaAppState extends ConsumerState<SwastikalaApp> {
  @override
  void initState() {
    super.initState();
    final push = ref.read(pushServiceProvider);
    push.onNotificationTap = _openFromNotification;
    push.onTokenRefresh = (token) => ref.read(pushRegistrationProvider).onTokenRefreshed(token);
    push.onForegroundMessage.listen((_) => ref.invalidate(unreadNotificationsProvider));

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (ref.read(isAuthenticatedProvider)) {
        await ref.read(pushRegistrationProvider).register();
      }
      final initial = await push.initialMessageData();
      if (initial != null) {
        // Let the splash finish routing before deep-linking.
        await Future<void>.delayed(const Duration(milliseconds: 1900));
        _openFromNotification(initial);
      }
    });
  }

  /// FCM data payload: { orderId?, link?, type? } (see backend patch).
  void _openFromNotification(Map<String, dynamic> data) {
    final router = ref.read(routerProvider);
    final orderId = data['orderId']?.toString() ?? data['relatedOrder']?.toString();
    final link = data['link']?.toString();
    final authenticated = ref.read(isAuthenticatedProvider);
    ref.invalidate(unreadNotificationsProvider);

    if (orderId != null && orderId.isNotEmpty && authenticated) {
      router.push(RoutePaths.order(orderId));
      return;
    }
    if (link != null && link.isNotEmpty) {
      final route = LinkResolver.toRoute(link);
      if (route != null) {
        router.push(route);
        return;
      }
    }
    router.push(authenticated ? RoutePaths.notifications : RoutePaths.home);
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);

    ref.listen<AuthState>(authProvider, (previous, next) {
      if (next.sessionExpired && (previous?.isAuthenticated ?? false)) {
        scaffoldMessengerKey.currentState?.showSnackBar(
          const SnackBar(content: Text('Your session has expired. Please log in again.')),
        );
      }
    });

    return MaterialApp.router(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      scaffoldMessengerKey: scaffoldMessengerKey,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeMode,
      routerConfig: router,
      builder: (context, child) {
        final media = MediaQuery.of(context);
        return MediaQuery(
          // Respect accessibility scaling but keep layouts intact.
          data: media.copyWith(textScaler: media.textScaler.clamp(minScaleFactor: 0.85, maxScaleFactor: 1.3)),
          child: OfflineBanner(child: child ?? const SizedBox.shrink()),
        );
      },
    );
  }
}
