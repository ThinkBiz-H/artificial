import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/cart_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../cart/viewmodels/cart_viewmodel.dart';
import '../../orders/viewmodels/orders_viewmodel.dart';

/// /coupons — the website's Coupons page: check a code against the bag
/// (POST /cart/apply-coupon) and the coupons used on past orders. With
/// [pickMode] the checked code is returned to the caller (checkout).
class CouponsScreen extends ConsumerStatefulWidget {
  const CouponsScreen({super.key, this.pickMode = false});
  final bool pickMode;

  @override
  ConsumerState<CouponsScreen> createState() => _CouponsScreenState();
}

class _CouponsScreenState extends ConsumerState<CouponsScreen> {
  final _code = TextEditingController();
  bool _checking = false;
  CouponResult? _result;

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  Future<void> _check() async {
    final code = _code.text.trim().toUpperCase();
    if (code.isEmpty) return;
    context.hideKeyboard();
    setState(() {
      _checking = true;
      _result = null;
    });
    try {
      final result = await ref.read(cartRepositoryProvider).applyCoupon(code);
      if (mounted) setState(() => _result = result);
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _checking = false);
    }
  }

  void _use(String code) {
    if (widget.pickMode) {
      context.pop(code);
    } else {
      context.push(RoutePaths.checkout, extra: code);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authenticated = ref.watch(isAuthenticatedProvider);
    final bagEmpty = ref.watch(cartProvider).valueOrNull?.isEmpty ?? true;
    final orders = ref.watch(myOrdersProvider);
    final used = (orders.valueOrNull ?? const [])
        .where((o) => (o.coupon?.code ?? '').isNotEmpty)
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Coupons')),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(myOrdersProvider),
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.md),
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(color: AppColors.wine, borderRadius: AppRadius.card),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('HAVE A CODE?', style: AppTypography.overline(AppColors.roseGoldLight).copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Text('Check your savings', style: context.text.headlineLarge?.copyWith(color: AppColors.ivory)),
                  const SizedBox(height: 4),
                  Text(
                    !authenticated
                        ? 'Log in to check a coupon against your bag.'
                        : bagEmpty
                            ? "Add pieces to your bag, then enter a coupon to see what you'll save."
                            : "We'll check the code against the items in your bag.",
                    style: context.text.bodySmall?.copyWith(color: AppColors.ivory.withValues(alpha: 0.7)),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  if (!authenticated)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.surface, foregroundColor: AppColors.ink),
                      onPressed: () => context.push(RoutePaths.loginWithRedirect(RoutePaths.coupons)),
                      child: const Text('LOG IN'),
                    )
                  else ...[
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _code,
                            enabled: !bagEmpty,
                            textCapitalization: TextCapitalization.characters,
                            textInputAction: TextInputAction.done,
                            onSubmitted: (_) => _check(),
                            style: const TextStyle(color: AppColors.ivory, letterSpacing: 1.6),
                            decoration: InputDecoration(
                              hintText: 'Enter coupon code',
                              hintStyle: TextStyle(color: AppColors.ivory.withValues(alpha: 0.55)),
                              filled: true,
                              fillColor: AppColors.ivory.withValues(alpha: 0.1),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(AppRadius.md),
                                borderSide: BorderSide(color: AppColors.ivory.withValues(alpha: 0.3)),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(AppRadius.md),
                                borderSide: const BorderSide(color: AppColors.ivory),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          height: 50,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.surface,
                              foregroundColor: AppColors.ink,
                              minimumSize: const Size(92, 50),
                            ),
                            onPressed: bagEmpty || _checking ? null : _check,
                            child: _checking
                                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                                : const Text('CHECK'),
                          ),
                        ),
                      ],
                    ),
                    if (_result != null) ...[
                      const SizedBox(height: AppSpacing.md),
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(AppRadius.lg)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text.rich(TextSpan(
                                    style: context.text.bodyMedium?.copyWith(color: AppColors.ink),
                                    children: [
                                      TextSpan(text: _result!.code, style: const TextStyle(fontWeight: FontWeight.w700)),
                                      const TextSpan(text: ' saves you '),
                                      TextSpan(
                                        text: Formatters.currency(_result!.discountAmount),
                                        style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.success),
                                      ),
                                      const TextSpan(text: ' on your bag'),
                                    ],
                                  )),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            SizedBox(
                              height: 40,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(minimumSize: const Size(0, 40)),
                                onPressed: () => _use(_result!.code),
                                child: const Text('USE AT CHECKOUT'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (bagEmpty) ...[
                      const SizedBox(height: AppSpacing.md),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.surface, foregroundColor: AppColors.ink),
                        onPressed: () => context.go(RoutePaths.home),
                        child: const Text('START SHOPPING'),
                      ),
                    ],
                  ],
                ],
              ),
            ),
            if (authenticated) ...[
              const SizedBox(height: AppSpacing.xl),
              Text("COUPONS YOU'VE USED",
                  style: context.text.labelMedium?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 1.9)),
              const SizedBox(height: AppSpacing.md),
              if (orders.isLoading && !orders.hasValue)
                const ShimmerBox(height: 96, radius: AppRadius.lg)
              else if (used.isEmpty)
                Container(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  decoration: BoxDecoration(
                    color: context.colors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(color: context.colors.outline),
                  ),
                  child: Text('No coupons used yet.', style: context.text.bodySmall, textAlign: TextAlign.center),
                )
              else
                ...used.map((o) => Container(
                      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: context.colors.surface,
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                        border: Border.all(color: context.colors.outline),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: const BoxDecoration(color: AppColors.ivoryDeep, shape: BoxShape.circle),
                            child: const Icon(Icons.sell_outlined, size: 17, color: AppColors.wine),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(o.coupon!.code!,
                                    style: context.text.titleSmall?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 1.4)),
                                const SizedBox(height: 2),
                                GestureDetector(
                                  onTap: () => context.push(RoutePaths.order(o.id)),
                                  child: Text(
                                    'Saved ${Formatters.currency(o.couponDiscount)} · #${o.orderNumber} · ${Formatters.date(o.createdAt)}',
                                    style: context.text.bodySmall,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )),
            ],
          ],
        ),
      ),
    );
  }
}
