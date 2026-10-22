import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/user_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/dialogs.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../viewmodels/content_viewmodel.dart';

/// GET /auth/sessions, DELETE /auth/sessions/:id, POST /auth/logout-all
class SessionsScreen extends ConsumerWidget {
  const SessionsScreen({super.key});

  IconData _icon(String ua) {
    final s = ua.toLowerCase();
    if (s.contains('swastikalaapp') || s.contains('android') || s.contains('iphone')) return Icons.phone_iphone_rounded;
    if (s.contains('ipad') || s.contains('tablet')) return Icons.tablet_mac_rounded;
    return Icons.laptop_mac_rounded;
  }

  String _label(String ua) {
    final s = ua.toLowerCase();
    if (s.contains('swastikalaapp')) return 'Swastikala app';
    if (s.contains('iphone')) return 'iPhone · Browser';
    if (s.contains('android')) return 'Android · Browser';
    if (s.contains('windows')) return 'Windows · Browser';
    if (s.contains('mac os')) return 'Mac · Browser';
    return ua.isEmpty ? 'Unknown device' : ua.split(' ').first;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(sessionsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Logged-in devices')),
      body: async.when(
        loading: () => const ListTileSkeleton(count: 3),
        error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(sessionsProvider)),
        data: (list) => ListView(
          padding: const EdgeInsets.all(AppSpacing.md),
          children: [
            ...list.map((SessionInfo s) => Card(
                  margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                  child: ListTile(
                    leading: Icon(_icon(s.userAgent)),
                    title: Row(
                      children: [
                        Flexible(child: Text(_label(s.userAgent), overflow: TextOverflow.ellipsis)),
                        if (s.isCurrent) ...[
                          const SizedBox(width: 6),
                          Text('THIS DEVICE',
                              style: context.text.labelSmall?.copyWith(color: AppColors.success, fontWeight: FontWeight.w700)),
                        ],
                      ],
                    ),
                    subtitle: Text([
                      if (s.ip.isNotEmpty) s.ip,
                      if (s.lastUsedAt != null) 'Active ${Formatters.relative(s.lastUsedAt)}',
                    ].join(' · ')),
                    trailing: s.isCurrent
                        ? null
                        : IconButton(
                            tooltip: 'Log out this device',
                            icon: const Icon(Icons.logout_rounded),
                            onPressed: () async {
                              try {
                                await ref.read(authRepositoryProvider).revokeSession(s.id);
                                ref.invalidate(sessionsProvider);
                              } catch (e) {
                                if (context.mounted) context.showError(e);
                              }
                            },
                          ),
                  ),
                )),
            const SizedBox(height: AppSpacing.lg),
            OutlinedButton(
              onPressed: () async {
                final ok = await showConfirmDialog(context,
                    title: 'Log out other devices?',
                    message: 'You will stay logged in on this phone.',
                    confirmLabel: 'Log out others');
                if (!ok) return;
                try {
                  await ref.read(authRepositoryProvider).logoutAllDevices(keepCurrent: true);
                  ref.invalidate(sessionsProvider);
                  if (context.mounted) context.showSnack('Other devices logged out');
                } catch (e) {
                  if (context.mounted) context.showError(e);
                }
              },
              child: const Text('LOG OUT ALL OTHER DEVICES'),
            ),
            const SizedBox(height: AppSpacing.sm),
            TextButton(
              style: TextButton.styleFrom(foregroundColor: context.colors.error),
              onPressed: () async {
                final ok = await showConfirmDialog(context,
                    title: 'Log out everywhere?',
                    message: 'This includes this phone.',
                    confirmLabel: 'Log out',
                    destructive: true);
                if (!ok) return;
                try {
                  await ref.read(authRepositoryProvider).logoutAllDevices(keepCurrent: true);
                } catch (_) {}
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) context.go(RoutePaths.home);
              },
              child: const Text('LOG OUT EVERYWHERE'),
            ),
          ],
        ),
      ),
    );
  }
}
