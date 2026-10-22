import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:swastikala/features/cart/viewmodels/cart_viewmodel.dart';
import 'package:swastikala/features/wishlist/viewmodels/wishlist_viewmodel.dart';
import 'package:swastikala/shared/widgets/app_bottom_nav.dart';

Widget _screen(String title, {Widget? leading}) =>
    Scaffold(appBar: AppBar(leading: leading, title: Text(title)), body: Text('$title body'));

GoRouter _router() {
  GoRoute page(String path, Widget Function(GoRouterState) b, {List<RouteBase> routes = const []}) => GoRoute(
        path: path,
        routes: routes,
        builder: (_, s) => SecondaryPage(location: s.matchedLocation, child: b(s)),
      );
  return GoRouter(initialLocation: '/home', routes: [
    GoRoute(path: '/home', builder: (_, _) => _screen('Home')),
    // Same shape as the app: order details nested under the orders list.
    page('/orders', (_) => _screen('Orders', leading: const HomeBackButton()), routes: [
      page(':id', (s) => _screen('Order ${s.pathParameters['id']}')),
    ]),
    page('/products', (_) => _screen('Products')),
  ]);
}

Future<GoRouter> _pump(WidgetTester tester) async {
  final router = _router();
  await tester.pumpWidget(ProviderScope(
    overrides: [cartCountProvider.overrideWithValue(0), wishlistCountProvider.overrideWithValue(0)],
    child: MaterialApp.router(routerConfig: router),
  ));
  await tester.pumpAndSettle();
  return router;
}

void main() {
  testWidgets('order details opened directly: Back → orders list → Home', (tester) async {
    final router = await _pump(tester);
    router.go('/orders/42');
    await tester.pumpAndSettle();
    expect(find.text('Order 42'), findsOneWidget);
    expect(find.byType(NavigationBar), findsOneWidget);

    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();
    expect(find.text('Orders'), findsOneWidget);
    expect(find.byType(NavigationBar), findsOneWidget);

    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();
    expect(find.text('Home'), findsOneWidget);
  });

  testWidgets('a secondary screen opened with go() gets a Back button to Home', (tester) async {
    final router = await _pump(tester);
    router.go('/products');
    await tester.pumpAndSettle();
    expect(find.byType(BackButton), findsOneWidget);
    expect(find.byType(NavigationBar), findsOneWidget);

    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();
    expect(find.text('Home'), findsOneWidget);
  });

  testWidgets('bottom bar on a secondary screen switches tabs', (tester) async {
    final router = await _pump(tester);
    router.go('/products');
    await tester.pumpAndSettle();
    await tester.tap(find.text('HOME'));
    await tester.pumpAndSettle();
    expect(find.text('Home'), findsOneWidget);
  });
}
