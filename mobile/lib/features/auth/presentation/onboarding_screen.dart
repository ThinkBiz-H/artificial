import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/core_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/brand_logo.dart';
import '../../../shared/widgets/section_header.dart';

class _Slide {
  const _Slide(this.icon, this.overline, this.title, this.body);
  final IconData icon;
  final String overline;
  final String title;
  final String body;
}

const _slides = [
  _Slide(Icons.diamond_outlined, 'Handpicked', 'Jewellery that\ntells your story',
      'Premium artificial jewellery crafted for every celebration — bridal, festive and everyday elegance.'),
  _Slide(Icons.local_shipping_outlined, 'Delivered with care', 'Pan-India\nsecure delivery',
      'Track every order live, pay online for an instant extra discount or choose Cash on Delivery.'),
  _Slide(Icons.favorite_outline_rounded, 'Made for you', 'Save, compare\nand shop faster',
      'One account across our website and app — your bag, wishlist and orders stay in sync.'),
];

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _controller = PageController();
  int _index = 0;

  Future<void> _finish({bool login = false}) async {
    await ref.read(localStorageProvider).setOnboardingDone();
    if (!mounted) return;
    final router = GoRouter.of(context);
    router.go(RoutePaths.home);
    if (login) router.push(RoutePaths.login);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final last = _index == _slides.length - 1;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.xs, 0),
              child: Row(
                children: [
                  const BrandWordmark(size: 18),
                  const Spacer(),
                  TextButton(onPressed: _finish, child: const Text('SKIP')),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _slides.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (_, i) {
                  final s = _slides[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 220,
                          height: 220,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppColors.roseGoldGradient,
                            boxShadow: AppShadows.lifted,
                          ),
                          child: Icon(s.icon, size: 92, color: Colors.white),
                        ),
                        const SizedBox(height: AppSpacing.xxl),
                        Text(s.overline.toUpperCase(), style: AppTypography.overline(AppColors.roseGold)),
                        const SizedBox(height: AppSpacing.xs),
                        Text(s.title, style: text.displaySmall, textAlign: TextAlign.center),
                        const SizedBox(height: AppSpacing.sm),
                        const OrnamentDivider(),
                        const SizedBox(height: AppSpacing.md),
                        Text(s.body,
                            style: text.bodyLarge?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant),
                            textAlign: TextAlign.center),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_slides.length, (i) {
                final active = i == _index;
                return AnimatedContainer(
                  duration: AppDurations.medium,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: active ? 26 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: active ? AppColors.wine : AppColors.roseGoldLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                );
              }),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                children: [
                  ElevatedButton(
                    onPressed: () => last
                        ? _finish()
                        : _controller.nextPage(duration: AppDurations.medium, curve: Curves.easeOutCubic),
                    child: Text(last ? 'START SHOPPING' : 'NEXT'),
                  ),
                  if (last) ...[
                    const SizedBox(height: AppSpacing.sm),
                    OutlinedButton(onPressed: () => _finish(login: true), child: const Text('LOGIN / SIGN UP')),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
