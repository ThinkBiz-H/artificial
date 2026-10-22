import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/maintenance_screen.dart';
import '../../features/auth/presentation/onboarding_screen.dart';
import '../../features/auth/presentation/otp_screen.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/viewmodels/auth_flow_viewmodel.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/category/presentation/categories_screen.dart';
import '../../features/category/presentation/category_screen.dart';
import '../../features/checkout/presentation/checkout_screen.dart';
import '../../features/collection/presentation/collection_screen.dart';
import '../../features/coupons/presentation/coupons_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/orders/presentation/order_detail_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/payment/presentation/order_success_screen.dart';
import '../../features/product/presentation/product_detail_screen.dart';
import '../../features/product/presentation/product_listing_screen.dart';
import '../../features/product/presentation/shop_screen.dart';
import '../../features/product/presentation/recently_viewed_screen.dart';
import '../../features/product/presentation/reviews_widgets.dart';
import '../../features/profile/presentation/account_screen.dart';
import '../../features/profile/presentation/address_form_screen.dart';
import '../../features/profile/presentation/addresses_screen.dart';
import '../../features/profile/presentation/edit_profile_screen.dart';
import '../../features/search/presentation/search_screen.dart';
import '../../features/settings/presentation/cms_page_screen.dart';
import '../../features/settings/presentation/contact_screen.dart';
import '../../features/settings/presentation/sessions_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/settings/presentation/support_screen.dart';
import '../../features/tracking/presentation/track_order_screen.dart';
import '../../features/wishlist/presentation/wishlist_screen.dart';
import '../models/user_model.dart';
import '../providers/auth_provider.dart';
import '../../shared/widgets/app_bottom_nav.dart';
import 'app_shell.dart';
import 'route_paths.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier<int>(0);
  ref.listen<bool>(isAuthenticatedProvider, (_, __) => refresh.value++);

  /// Full-screen route. [chrome] adds the bottom navigation (all screens except
  /// the splash / onboarding / maintenance / login flow).
  GoRoute page(
    String path,
    Widget Function(BuildContext, GoRouterState) builder, {
    bool chrome = true,
    List<RouteBase> routes = const <RouteBase>[],
  }) =>
      GoRoute(
        path: path,
        parentNavigatorKey: rootNavigatorKey,
        routes: routes,
        builder: chrome
            ? (context, state) => SecondaryPage(location: state.matchedLocation, child: builder(context, state))
            : builder,
      );

  final router = GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: RoutePaths.splash,
    refreshListenable: refresh,
    debugLogDiagnostics: false,
    redirect: (context, state) {
      final authenticated = ref.read(isAuthenticatedProvider);
      final location = state.matchedLocation;
      final protected = RoutePaths.protectedPrefixes
          .any((p) => location == p || location.startsWith('$p/'));
      if (!authenticated && protected) {
        return RoutePaths.loginWithRedirect(state.uri.toString());
      }
      if (authenticated && location == RoutePaths.login) {
        final from = state.uri.queryParameters['from'];
        return (from == null || from.isEmpty) ? RoutePaths.home : from;
      }
      return null;
    },
    errorBuilder: (context, state) => const _NotFoundScreen(),
    routes: [
      page(RoutePaths.splash, (_, __) => const SplashScreen(), chrome: false),
      page(RoutePaths.onboarding, (_, __) => const OnboardingScreen(), chrome: false),
      page(RoutePaths.maintenance, (_, __) => const MaintenanceScreen(), chrome: false),
      page(RoutePaths.login, (_, s) => LoginScreen(redirectTo: s.uri.queryParameters['from']), chrome: false),
      page(RoutePaths.otp, (_, s) {
        final args = s.extra;
        return args is OtpArgs ? OtpScreen(args: args) : const LoginScreen();
      }, chrome: false),
      StatefulShellRoute.indexedStack(
        builder: (_, __, shell) => AppShell(shell: shell),
        branches: [
          StatefulShellBranch(routes: [GoRoute(path: RoutePaths.home, builder: (_, __) => const HomeScreen())]),
          StatefulShellBranch(
              routes: [GoRoute(path: RoutePaths.categories, builder: (_, __) => const ShopScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: RoutePaths.wishlist, builder: (_, __) => const WishlistScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: RoutePaths.cart, builder: (_, __) => const CartScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: RoutePaths.account, builder: (_, __) => const AccountScreen())]),
        ],
      ),
      page(RoutePaths.search, (_, s) => SearchScreen(initialQuery: s.uri.queryParameters['q'])),
      page(RoutePaths.products, (_, s) {
        final q = s.uri.queryParameters;
        return ProductListingScreen(
          categoryId: q['category'],
          brandId: q['brand'],
          title: q['title'],
          keyword: q['q'],
          onSale: q['sale'] == '1',
        );
      }),
      page('/product/:slug', (_, s) => ProductDetailScreen(slug: s.pathParameters['slug']!)),
      page('/reviews/:productId', (_, s) => ReviewsScreen(productId: s.pathParameters['productId']!)),
      page('/category/:slug', (_, s) => CategoryScreen(slug: s.pathParameters['slug']!)),
      page('/collection/:type', (_, s) => CollectionScreen(slug: s.pathParameters['type']!)),
      page(RoutePaths.collections, (_, __) => const CollectionsScreen()),
      page(RoutePaths.browse, (_, __) => const CategoriesScreen()),
      page(RoutePaths.recentlyViewed, (_, __) => const RecentlyViewedScreen()),
      page(RoutePaths.coupons, (_, s) => CouponsScreen(pickMode: s.uri.queryParameters['pick'] == '1')),
      page(RoutePaths.checkout, (_, s) => CheckoutScreen(couponCode: s.extra is String ? s.extra as String : null)),
      page('/order-success/:id', (_, s) => OrderSuccessScreen(orderId: s.pathParameters['id']!)),
      // Nested so /orders/:id always sits on top of the orders list (Back returns to it).
      page(RoutePaths.orders, (_, __) => const OrdersScreen(), routes: [
        page(':id', (_, s) => OrderDetailScreen(orderId: s.pathParameters['id']!), routes: [
          page('track', (_, s) => TrackOrderScreen(orderId: s.pathParameters['id']!)),
        ]),
      ]),
      page(RoutePaths.addresses, (_, s) => AddressesScreen(
            selectMode: s.uri.queryParameters['select'] == '1',
            selectedId: s.uri.queryParameters['selected'],
          )),
      page(RoutePaths.addressForm, (_, s) {
        final extra = s.extra;
        return AddressFormScreen(existing: extra is AddressModel ? extra : null);
      }),
      page(RoutePaths.notifications, (_, __) => const NotificationsScreen()),
      page(RoutePaths.editProfile, (_, __) => const EditProfileScreen()),
      page(RoutePaths.settings, (_, __) => const SettingsScreen()),
      page(RoutePaths.sessions, (_, __) => const SessionsScreen()),
      page(RoutePaths.help, (_, __) => const SupportScreen()),
      page(RoutePaths.support, (_, __) => const SupportScreen()),
      page(RoutePaths.contact, (_, s) => ContactScreen(orderNumber: s.uri.queryParameters['order'])),
      page('/page/:key', (_, s) => CmsPageScreen(pageKey: s.pathParameters['key']!)),
    ],
  );

  ref.onDispose(() {
    refresh.dispose();
    router.dispose();
  });
  return router;
});

class _NotFoundScreen extends StatelessWidget {
  const _NotFoundScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.diamond_outlined, size: 56, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 16),
              Text('Page not found', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: () => context.go(RoutePaths.home), child: const Text('GO HOME')),
            ],
          ),
        ),
      ),
    );
  }
}
