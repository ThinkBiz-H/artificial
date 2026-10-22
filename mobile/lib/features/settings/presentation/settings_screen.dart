import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../../core/providers/app_providers.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/core_providers.dart';
import '../../../core/providers/push_registration_provider.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/dialogs.dart';

final _packageInfoProvider = FutureProvider<PackageInfo>((ref) => PackageInfo.fromPlatform());

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  late bool _push = ref.read(localStorageProvider).pushEnabled;

  Future<void> _togglePush(bool value) async {
    setState(() => _push = value);
    final storage = ref.read(localStorageProvider);
    await storage.setPushEnabled(value);
    final registration = ref.read(pushRegistrationProvider);
    if (!ref.read(isAuthenticatedProvider)) return;
    if (value) {
      await registration.register();
      if (!ref.read(pushServiceProvider).isAvailable && mounted) {
        context.showSnack('Push notifications are not configured on this build', error: true);
      }
    } else {
      await registration.unregister();
    }
  }

  Future<void> _clearCache() async {
    final ok = await showConfirmDialog(context,
        title: 'Clear cache?',
        message: 'Saved images and offline data will be removed. Your bag, wishlist and login stay intact.',
        confirmLabel: 'Clear');
    if (!ok) return;
    await ref.read(localStorageProvider).clearCache();
    await DefaultCacheManager().emptyCache();
    PaintingBinding.instance.imageCache.clear();
    if (mounted) context.showSnack('Cache cleared');
  }

  @override
  Widget build(BuildContext context) {
    final mode = ref.watch(themeModeProvider);
    final authenticated = ref.watch(isAuthenticatedProvider);
    final info = ref.watch(_packageInfoProvider).valueOrNull;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: [
          Text('APPEARANCE', style: context.text.labelMedium),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: SegmentedButton<ThemeMode>(
                showSelectedIcon: false,
                segments: const [
                  ButtonSegment(value: ThemeMode.system, icon: Icon(Icons.brightness_auto_outlined), label: Text('System')),
                  ButtonSegment(value: ThemeMode.light, icon: Icon(Icons.light_mode_outlined), label: Text('Light')),
                  ButtonSegment(value: ThemeMode.dark, icon: Icon(Icons.dark_mode_outlined), label: Text('Dark')),
                ],
                selected: {mode},
                onSelectionChanged: (s) => ref.read(themeModeProvider.notifier).set(s.first),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text('NOTIFICATIONS', style: context.text.labelMedium),
          const SizedBox(height: 8),
          Card(
            child: SwitchListTile(
              title: const Text('Order & offer notifications'),
              subtitle: Text(authenticated ? 'Delivery updates, payment status and offers' : 'Login to receive order updates'),
              value: _push,
              onChanged: _togglePush,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text('PRIVACY & SECURITY', style: context.text.labelMedium),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                if (authenticated)
                  ListTile(
                    leading: const Icon(Icons.devices_outlined),
                    title: const Text('Logged-in devices'),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push(RoutePaths.sessions),
                  ),
                ListTile(
                  leading: const Icon(Icons.cleaning_services_outlined),
                  title: const Text('Clear cache'),
                  onTap: _clearCache,
                ),
                ListTile(
                  leading: const Icon(Icons.history_toggle_off_rounded),
                  title: const Text('Clear search history'),
                  onTap: () async {
                    await ref.read(localStorageProvider).clearRecentSearches();
                    if (context.mounted) context.showSnack('Search history cleared');
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.privacy_tip_outlined),
                  title: const Text('Privacy policy'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push(RoutePaths.page('privacy')),
                ),
                ListTile(
                  leading: const Icon(Icons.description_outlined),
                  title: const Text('Terms & conditions'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push(RoutePaths.page('terms')),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Center(
            child: Text(
              info == null ? '' : 'Version ${info.version} (${info.buildNumber})',
              style: context.text.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}
