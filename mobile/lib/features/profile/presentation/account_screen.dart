import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_config.dart';
import '../../../core/models/user_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_bottom_nav.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import '../../../shared/widgets/brand_logo.dart';
import '../../../shared/widgets/dialogs.dart';
import '../../notifications/viewmodels/notifications_viewmodel.dart';
import '../../wishlist/viewmodels/wishlist_viewmodel.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  Future<void> _logout(BuildContext context, WidgetRef ref) async {
    final ok = await showConfirmDialog(context,
        title: 'Log out?', message: 'You can log back in any time with your mobile number.', confirmLabel: 'Log out');
    if (!ok) return;
    await ref.read(authProvider.notifier).logout();
    if (context.mounted) {
      context.showSnack('Logged out');
      context.go(RoutePaths.home);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final user = auth.user;
    final unread = auth.isAuthenticated ? ref.watch(unreadNotificationsProvider).valueOrNull ?? 0 : 0;
    final wishCount = ref.watch(wishlistCountProvider);

    void guarded(String route) => auth.isAuthenticated
        ? context.push(route)
        : context.push(RoutePaths.loginWithRedirect(route));

    return Scaffold(
      appBar: AppBar(leading: const HomeBackButton(), title: const Text('Account'), actions: const [CartIconButton()]),
      body: ListView(
        padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
        children: [
          auth.isAuthenticated
              ? _ProfileHeader(user: user)
              : _GuestHeader(onLogin: () => context.push(RoutePaths.login)),
          const SizedBox(height: AppSpacing.md),
          _Group(title: 'Shopping', tiles: [
            _Tile(Icons.receipt_long_outlined, 'My orders', onTap: () => guarded(RoutePaths.orders)),
            _Tile(Icons.favorite_border_rounded, 'Wishlist',
                trailingCount: wishCount, onTap: () => context.go(RoutePaths.wishlist)),
            _Tile(Icons.history_rounded, 'Recently viewed', onTap: () => context.push(RoutePaths.recentlyViewed)),
            _Tile(Icons.auto_awesome_outlined, 'Collections', onTap: () => context.push(RoutePaths.collections)),
            _Tile(Icons.local_offer_outlined, 'Coupons & offers', onTap: () => context.push(RoutePaths.coupons)),
          ]),
          _Group(title: 'Account', tiles: [
            _Tile(Icons.person_outline_rounded, 'Edit profile', onTap: () => guarded(RoutePaths.editProfile)),
            _Tile(Icons.location_on_outlined, 'Saved addresses', onTap: () => guarded(RoutePaths.addresses)),
            _Tile(Icons.notifications_none_rounded, 'Notifications',
                trailingCount: unread, onTap: () => guarded(RoutePaths.notifications)),
            _Tile(Icons.settings_outlined, 'Settings', onTap: () => context.push(RoutePaths.settings)),
          ]),
          _Group(title: 'Help & information', tiles: [
            _Tile(Icons.support_agent_outlined, 'Help & support', onTap: () => context.push(RoutePaths.support)),
            _Tile(Icons.mail_outline_rounded, 'Contact us', onTap: () => context.push(RoutePaths.contact)),
            _Tile(Icons.info_outline_rounded, 'About Swastikala', onTap: () => context.push(RoutePaths.page('about'))),
            _Tile(Icons.local_shipping_outlined, 'Shipping policy',
                onTap: () => context.push(RoutePaths.page('shipping'))),
            _Tile(Icons.assignment_return_outlined, 'Refund policy',
                onTap: () => context.push(RoutePaths.page('refund'))),
            _Tile(Icons.privacy_tip_outlined, 'Privacy policy', onTap: () => context.push(RoutePaths.page('privacy'))),
            _Tile(Icons.description_outlined, 'Terms & conditions', onTap: () => context.push(RoutePaths.page('terms'))),
          ]),
          if (auth.isAuthenticated)
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: OutlinedButton.icon(
                onPressed: () => _logout(context, ref),
                icon: const Icon(Icons.logout_rounded),
                label: const Text('LOG OUT'),
              ),
            ),
          const SizedBox(height: AppSpacing.md),
          const Center(child: BrandWordmark(size: 14)),
          const SizedBox(height: 4),
          Center(child: Text(AppConfig.tagline, style: context.text.bodySmall)),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.user});
  final UserModel? user;

  @override
  Widget build(BuildContext context) {
    final u = user;
    return Container(
      margin: const EdgeInsets.all(AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(gradient: AppColors.wineGradient, borderRadius: BorderRadius.circular(AppRadius.lg)),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(2),
            decoration: const BoxDecoration(shape: BoxShape.circle, gradient: AppColors.roseGoldGradient),
            child: CircleAvatar(
              radius: 32,
              backgroundColor: AppColors.champagne,
              child: (u?.profileImage?.isValid ?? false)
                  ? ClipOval(child: AppNetworkImage(url: u!.profileImage!.url, width: 64, height: 64, targetWidth: 160))
                  : Text(u?.initials ?? 'S',
                      style: AppTypography.wordmark(AppColors.wine, size: 20).copyWith(letterSpacing: 1)),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(u == null || u.name.isEmpty ? 'Welcome' : 'Hello, ${u.firstName}',
                    style: context.text.headlineMedium?.copyWith(color: Colors.white)),
                if (u?.mobile != null)
                  Text('+91 ${Formatters.mobile(u!.mobile)}', style: const TextStyle(color: AppColors.champagne)),
                if (u?.email != null) Text(u!.email!, style: const TextStyle(color: AppColors.roseGoldLight, fontSize: 12.5)),
              ],
            ),
          ),
          IconButton(
            onPressed: () => context.push(RoutePaths.editProfile),
            icon: const Icon(Icons.edit_outlined, color: Colors.white),
          ),
        ],
      ),
    );
  }
}

class _GuestHeader extends StatelessWidget {
  const _GuestHeader({required this.onLogin});
  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(gradient: AppColors.wineGradient, borderRadius: BorderRadius.circular(AppRadius.lg)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Welcome to Swastikala', style: context.text.headlineMedium?.copyWith(color: Colors.white)),
          const SizedBox(height: 4),
          const Text('Login to track orders, sync your wishlist and check out faster.',
              style: TextStyle(color: AppColors.champagne)),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: 200,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.champagne, foregroundColor: AppColors.wine),
              onPressed: onLogin,
              child: const Text('LOGIN / SIGN UP'),
            ),
          ),
        ],
      ),
    );
  }
}

class _Group extends StatelessWidget {
  const _Group({required this.title, required this.tiles});
  final String title;
  final List<Widget> tiles;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.md, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text(title.toUpperCase(), style: AppTypography.overline(AppColors.roseGold)),
          ),
          Card(child: Column(children: tiles)),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile(this.icon, this.title, {required this.onTap, this.trailingCount = 0});
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final int trailingCount;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (trailingCount > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: AppColors.roseGold, borderRadius: BorderRadius.circular(10)),
              child: Text('$trailingCount', style: const TextStyle(color: Colors.white, fontSize: 11)),
            ),
          const Icon(Icons.chevron_right_rounded),
        ],
      ),
      onTap: onTap,
    );
  }
}
