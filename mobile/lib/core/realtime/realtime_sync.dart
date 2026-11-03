import 'dart:async';
import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/cart/presentation/cart_screen.dart' show cartNewArrivalsProvider;
import '../../features/cart/viewmodels/cart_viewmodel.dart';
import '../../features/category/viewmodels/category_viewmodel.dart';
import '../../features/home/presentation/home_sections.dart' show categoryProductsProvider;
import '../../features/home/viewmodels/home_viewmodel.dart';
import '../../features/notifications/viewmodels/notifications_viewmodel.dart';
import '../../features/orders/viewmodels/orders_viewmodel.dart';
import '../../features/product/viewmodels/product_detail_viewmodel.dart';
import '../../features/product/viewmodels/product_list_viewmodel.dart';
import '../../features/product/viewmodels/recently_viewed_viewmodel.dart';
import '../../features/settings/viewmodels/content_viewmodel.dart';
import '../../features/wishlist/viewmodels/wishlist_viewmodel.dart';
import '../providers/app_providers.dart';
import '../providers/auth_provider.dart';
import '../providers/core_providers.dart';
import 'socket_service.dart';

/// The app's single realtime connection.
final socketServiceProvider = Provider<SocketService>((ref) {
  final tokens = ref.watch(tokenManagerProvider);
  final service = SocketService(accessToken: () => tokens.accessToken);
  ref.onDispose(service.dispose);
  return service;
});

/// Keeps Riverpod state in sync with server changes. Read once at app start
/// (app.dart); lives for the whole app session.
final realtimeSyncProvider = Provider<RealtimeSync>((ref) {
  final sync = RealtimeSync(ref);
  ref.onDispose(sync.dispose);
  sync.start();
  return sync;
});

/// Maps realtime events to the providers they make stale.
///
/// Uses `ref.invalidate`, which is lazy: only providers currently on screen
/// refetch (keeping their current data visible while they do — no loading
/// flash); everything else just refetches the next time it's opened. Product
/// lists are refreshed in place so infinite scroll keeps its position.
class RealtimeSync {
  RealtimeSync(this._ref);

  final Ref _ref;
  final Random _random = Random();
  final List<StreamSubscription<Object?>> _subs = [];
  final Set<Timer> _timers = {};
  bool _started = false;

  /// Shows an in-app banner for a new notification. Set by the app shell;
  /// only used when system push isn't available (otherwise push shows it).
  void Function(String title, String message)? onInAppNotification;

  static const Duration _resyncAfterOutage = Duration(seconds: 10);

  /// Product fields that change what cart / wishlist rows show.
  static const Set<String> _cartVisibleFields = {
    'price', 'salePrice', 'stock', 'status', 'isDeleted', 'title', 'images', 'thumbnail', 'variants', 'colorVariants',
  };
  static const Set<String> _reviewFields = {'reviews', 'rating', 'numReviews'};

  SocketService get _socket => _ref.read(socketServiceProvider);

  void start() {
    if (_started) return;
    _started = true;
    final socket = _socket..connect();

    _subs.add(socket.events.listen(_onEvent));
    _subs.add(socket.status.listen((status) {
      final outage = socket.lastOutage;
      if (status == SocketStatus.connected && outage != null && outage >= _resyncAfterOutage) {
        _resyncAfterReconnect();
      }
    }));

    final tokens = _ref.read(tokenManagerProvider);
    // Same account, new access token (refresh): re-authenticate in place.
    _subs.add(tokens.onAccessTokenChanged.listen((token) {
      if (token != null && _ref.read(isAuthenticatedProvider)) socket.reauthenticate();
    }));
    // Login / logout: fresh connection under the new identity.
    _ref.listen<bool>(isAuthenticatedProvider, (previous, next) {
      if (previous != next) socket.restart();
    });
  }

  void _onEvent(RealtimeEvent event) {
    final data = event.data;
    switch (event.name) {
      case 'catalog:changed':
        final entity = data['entity']?.toString() ?? '';
        final fields = <String>{...?(data['fields'] as List?)?.map((f) => f.toString())};
        // Every connected app gets this at once — spread the refetches.
        _later(Duration(milliseconds: _random.nextInt(2000)), () => _onCatalogChanged(entity, fields));
      case 'order:updated':
        final id = data['id']?.toString();
        _ref.invalidate(myOrdersProvider);
        if (id != null && id.isNotEmpty) {
          _ref.invalidate(orderDetailProvider(id));
          _ref.invalidate(trackingProvider(id));
        }
      case 'notification:new':
        _ref.invalidate(notificationsProvider);
        _ref.invalidate(unreadNotificationsProvider);
        final title = data['title']?.toString() ?? '';
        if (title.isNotEmpty && !_ref.read(pushServiceProvider).isAvailable) {
          onInAppNotification?.call(title, data['message']?.toString() ?? '');
        }
      case 'notification:changed':
        _ref.invalidate(notificationsProvider);
        _ref.invalidate(unreadNotificationsProvider);
      case 'cart:updated':
        // Skip the refetch when this device already shows that cart (it made the change).
        final local = _ref.read(cartProvider).valueOrNull;
        final items = (data['items'] as num?)?.toInt();
        final quantity = (data['quantity'] as num?)?.toInt();
        if (local != null && local.items.length == items && local.count == quantity) return;
        _ref.invalidate(cartProvider);
      case 'brand.updated':
      case 'logo.updated':
      case 'theme.updated':
        // Logos and company details live in settings — refetch them now.
        _ref.invalidate(settingsProvider);
      case 'wishlist:updated':
        final local = _ref.read(wishlistProvider).valueOrNull;
        if (local != null && local.ids.length == (data['count'] as num?)?.toInt()) return;
        _ref.invalidate(wishlistProvider);
    }
  }

  void _onCatalogChanged(String entity, Set<String> fields) {
    switch (entity) {
      case 'product':
        _ref
          ..invalidate(homeProvider)
          ..invalidate(collectionProductsProvider)
          ..invalidate(categoryProductsProvider)
          ..invalidate(productDetailProvider)
          ..invalidate(relatedProductsProvider)
          ..invalidate(pdpBestSellersProvider)
          ..invalidate(cartNewArrivalsProvider)
          ..invalidate(recentlyViewedProvider);
        if (fields.isEmpty || fields.any(_reviewFields.contains)) _ref.invalidate(productReviewsProvider);
        ProductListNotifier.syncAllLoaded();
        if (fields.isEmpty || fields.any(_cartVisibleFields.contains)) {
          if ((_ref.read(cartProvider).valueOrNull?.items.isNotEmpty ?? false)) _ref.invalidate(cartProvider);
          if ((_ref.read(wishlistProvider).valueOrNull?.ids.isNotEmpty ?? false)) _ref.invalidate(wishlistProvider);
        }
      case 'brand':
        _ref
          ..invalidate(brandsProvider)
          ..invalidate(productDetailProvider);
        ProductListNotifier.syncAllLoaded();
      case 'category':
        _ref
          ..invalidate(categoryTreeProvider)
          ..invalidate(categoryBySlugProvider)
          ..invalidate(categoryProductsProvider)
          ..invalidate(homeProvider);
      case 'banner':
        _ref.invalidate(categoryBannerProvider);
      case 'home':
      case 'announcement':
        _ref.invalidate(homeProvider);
      case 'settings':
        _ref.invalidate(settingsProvider);
      case 'page':
        _ref
          ..invalidate(pagesProvider)
          ..invalidate(pageProvider);
      case 'faq':
        _ref.invalidate(faqsProvider);
    }
  }

  /// After a real outage, events may have been missed — refresh what's on screen.
  void _resyncAfterReconnect() {
    _ref
      ..invalidate(homeProvider)
      ..invalidate(settingsProvider)
      ..invalidate(productDetailProvider)
      ..invalidate(unreadNotificationsProvider);
    ProductListNotifier.syncAllLoaded();
    if (_ref.read(isAuthenticatedProvider)) {
      _ref
        ..invalidate(cartProvider)
        ..invalidate(wishlistProvider)
        ..invalidate(myOrdersProvider)
        ..invalidate(notificationsProvider);
    }
  }

  void _later(Duration delay, void Function() action) {
    late final Timer timer;
    timer = Timer(delay, () {
      _timers.remove(timer);
      action();
    });
    _timers.add(timer);
  }

  void dispose() {
    for (final timer in _timers) {
      timer.cancel();
    }
    _timers.clear();
    for (final sub in _subs) {
      sub.cancel();
    }
    _subs.clear();
  }
}
