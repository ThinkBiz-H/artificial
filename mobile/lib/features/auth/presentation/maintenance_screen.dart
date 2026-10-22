import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/app_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/brand_logo.dart';
import '../../../shared/widgets/buttons.dart';

class MaintenanceScreen extends ConsumerStatefulWidget {
  const MaintenanceScreen({super.key});

  @override
  ConsumerState<MaintenanceScreen> createState() => _MaintenanceScreenState();
}

class _MaintenanceScreenState extends ConsumerState<MaintenanceScreen> {
  bool _checking = false;

  Future<void> _retry() async {
    setState(() => _checking = true);
    ref.invalidate(settingsProvider);
    try {
      final s = await ref.read(settingsProvider.future);
      if (!mounted) return;
      if (!s.maintenanceEnabled) {
        context.go(RoutePaths.home);
        return;
      }
    } catch (_) {}
    if (mounted) {
      setState(() => _checking = false);
      context.showSnack('We are still polishing things. Please check back soon.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsValueProvider);
    final message = settings.maintenanceMessage.isNotEmpty
        ? settings.maintenanceMessage
        : 'We are currently performing scheduled maintenance. Please check back soon.';
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const BrandLogo(height: 40),
              const SizedBox(height: AppSpacing.xxl),
              Icon(Icons.construction_rounded, size: 56, color: context.colors.primary),
              const SizedBox(height: AppSpacing.lg),
              Text('Back very soon', style: context.text.displaySmall),
              const SizedBox(height: AppSpacing.sm),
              Text(message, textAlign: TextAlign.center, style: context.text.bodyLarge),
              const SizedBox(height: AppSpacing.xxl),
              PrimaryButton(label: 'Try again', loading: _checking, onPressed: _retry),
            ],
          ),
        ),
      ),
    );
  }
}
