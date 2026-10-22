import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/providers/core_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/section_header.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _controller =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..forward();
  late final Animation<double> _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
  late final Animation<double> _scale = Tween(begin: 0.92, end: 1.0)
      .animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));

  @override
  void initState() {
    super.initState();
    unawaited(_boot());
  }

  Future<void> _boot() async {
    final minDelay = Future<void>.delayed(const Duration(milliseconds: 1600));
    var maintenance = false;
    try {
      final settings = await ref
          .read(settingsProvider.future)
          .timeout(const Duration(seconds: 6));
      maintenance = settings.maintenanceEnabled;
    } on AppException catch (e) {
      maintenance = e.isMaintenance;
    } catch (_) {
      // Timeout/offline: continue with cached data.
    }
    await minDelay;
    if (!mounted) return;
    if (maintenance) {
      context.go(RoutePaths.maintenance);
    } else if (!ref.read(localStorageProvider).onboardingDone) {
      context.go(RoutePaths.onboarding);
    } else {
      context.go(RoutePaths.home);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.wineGradient),
        child: Center(
          child: FadeTransition(
            opacity: _fade,
            child: ScaleTransition(
              scale: _scale,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 86,
                    height: 86,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.roseGoldLight, width: 1.2),
                    ),
                    child: const Icon(Icons.diamond_outlined, color: AppColors.roseGoldLight, size: 40),
                  ),
                  const SizedBox(height: 28),
                  Text(AppConfig.brandWordmark,
                      style: AppTypography.wordmark(AppColors.champagne, size: 30)),
                  const SizedBox(height: 12),
                  const OrnamentDivider(width: 140),
                  const SizedBox(height: 12),
                  Text(AppConfig.tagline.toUpperCase(),
                      style: AppTypography.overline(AppColors.roseGoldLight)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
