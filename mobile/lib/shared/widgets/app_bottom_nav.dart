import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/routes/route_paths.dart';
import '../../features/cart/viewmodels/cart_viewmodel.dart';
import '../../features/wishlist/viewmodels/wishlist_viewmodel.dart';
import 'badge_icon_button.dart';

/// The five primary tabs, in bottom-bar order.
const List<String> kTabPaths = [
  RoutePaths.home,
  RoutePaths.categories,
  RoutePaths.wishlist,
  RoutePaths.cart,
  RoutePaths.account,
];

/// Which tab a secondary screen belongs to (highlighted in its bottom bar).
int tabIndexForLocation(String location) {
  bool under(List<String> prefixes) => prefixes.any((p) => location == p || location.startsWith('$p/'));
  if (under(const ['/wishlist'])) return 2;
  if (under(const ['/cart', RoutePaths.checkout, '/order-success', RoutePaths.coupons])) return 3;
  if (under(const [
    RoutePaths.orders,
    RoutePaths.addresses,
    RoutePaths.notifications,
    '/profile',
    RoutePaths.settings,
    RoutePaths.help,
    RoutePaths.support,
    RoutePaths.contact,
    '/page',
  ])) {
    return 4;
  }
  if (location == RoutePaths.home) return 0;
  return 1; // product, listing, category, collection, search…
}

/// Bottom navigation bar shared by the tab shell and every secondary screen.
class AppBottomNav extends ConsumerWidget {
  const AppBottomNav({super.key, required this.currentIndex, required this.onTap});
  final int currentIndex;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref.watch(cartCountProvider);
    final wishCount = ref.watch(wishlistCountProvider);
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: Theme.of(context).colorScheme.outline)),
      ),
      child: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: onTap,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'HOME',
          ),
          const NavigationDestination(
            icon: Icon(Icons.grid_view_outlined),
            selectedIcon: Icon(Icons.grid_view_rounded),
            label: 'SHOP',
          ),
          NavigationDestination(
            icon: CountBadge(count: wishCount, child: const Icon(Icons.favorite_border_rounded)),
            selectedIcon: CountBadge(count: wishCount, child: const Icon(Icons.favorite_rounded)),
            label: 'WISHLIST',
          ),
          NavigationDestination(
            icon: CountBadge(count: cartCount, child: const Icon(Icons.shopping_bag_outlined)),
            selectedIcon: CountBadge(count: cartCount, child: const Icon(Icons.shopping_bag_rounded)),
            label: 'BAG',
          ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'ACCOUNT',
          ),
        ],
      ),
    );
  }
}

/// Back button for screens that should return to the Home tab.
class HomeBackButton extends StatelessWidget {
  const HomeBackButton({super.key});

  @override
  Widget build(BuildContext context) => BackButton(onPressed: () => context.go(RoutePaths.home));
}

/// Wraps every non-tab screen: keeps the bottom navigation visible and, when
/// the screen is the first on the stack (opened with `go` or a deep link),
/// gives its AppBar a back button that returns to the Home tab instead of
/// leaving the app.
class SecondaryPage extends StatefulWidget {
  const SecondaryPage({super.key, required this.location, required this.child});
  final String location;
  final Widget child;

  @override
  State<SecondaryPage> createState() => _SecondaryPageState();
}

class _SecondaryPageState extends State<SecondaryPage> {
  LocalHistoryEntry? _toHome;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final route = ModalRoute.of(context);
    if (_toHome != null || route == null || !route.isFirst) return;
    // A local history entry makes AppBar show a back button and is what the
    // system back gesture pops first; removing it sends the user Home.
    _toHome = LocalHistoryEntry(
      impliesAppBarDismissal: true,
      onRemove: () {
        _toHome = null;
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) context.go(RoutePaths.home);
        });
      },
    );
    route.addLocalHistoryEntry(_toHome!);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // The inner screen's Scaffold handles the keyboard; the bar stays put.
      resizeToAvoidBottomInset: false,
      body: widget.child,
      bottomNavigationBar: AppBottomNav(
        currentIndex: tabIndexForLocation(widget.location),
        onTap: (i) => context.go(kTabPaths[i]),
      ),
    );
  }
}
