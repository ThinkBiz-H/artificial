import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../shared/widgets/luxury_splash.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  static const _ambientSpan = Duration(seconds: 60);

  /// Brand intro: ~1.8s of animation followed by a ~1s hold.
  late final AnimationController _intro = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2800),
  );

  /// Keeps particles drifting if settings take longer than the intro.
  late final AnimationController _ambient = AnimationController(
    vsync: this,
    duration: _ambientSpan,
  );

  /// Fades the splash into the app's background before Home appears.
  late final AnimationController _exit = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 420),
  );

  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;

    precacheImage(const AssetImage(AppConfig.logoAsset), context);

    final Future<void> introDone;
    if (MediaQuery.disableAnimationsOf(context)) {
      // Reduced motion: show the final frame and keep the brief pause.
      _intro.value = 1;
      introDone = Future<void>.delayed(const Duration(milliseconds: 900));
    } else {
      unawaited(_ambient.forward());
      introDone = _intro.forward().orCancel.catchError((Object _) {});
    }
    unawaited(_boot(introDone));
  }

  Future<void> _boot(Future<void> introDone) async {
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
    await introDone;
    if (!mounted) return;
    try {
      await _exit.forward().orCancel;
    } on TickerCanceled {
      return;
    }
    if (!mounted) return;
    if (maintenance) {
      context.go(RoutePaths.maintenance);
    } else {
      context.go(RoutePaths.home);
    }
  }

  @override
  void dispose() {
    _intro.dispose();
    _ambient.dispose();
    _exit.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light.copyWith(
        statusBarColor: Colors.transparent,
        systemNavigationBarColor: SplashPalette.black,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: SplashPalette.black,
        body: Stack(
          fit: StackFit.expand,
          children: [
            LuxurySplashView(
              logoUrl: ref.watch(brandLogosProvider)['splashLogo'],
              intro: _intro,
              ambient: _ambient,
              ambientSpan: _ambientSpan,
            ),
            // Exit: fade to the app background (light or dark theme) so the
            // hand-off to the next screen is seamless.
            IgnorePointer(
              child: FadeTransition(
                opacity: CurvedAnimation(
                  parent: _exit,
                  curve: Curves.easeInOut,
                ),
                child: ColoredBox(
                  color: Theme.of(context).scaffoldBackgroundColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
