import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/cart_model.dart';
import '../../../core/models/product_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/repositories/catalog_repository.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_bottom_nav.dart';
import '../../../shared/widgets/line_options.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/dialogs.dart';
import '../../../shared/widgets/price_tag.dart';
import '../../../shared/widgets/product_grid.dart';
import '../../../shared/widgets/quantity_stepper.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../../product/viewmodels/product_detail_viewmodel.dart';
import '../../wishlist/viewmodels/wishlist_viewmodel.dart';
import '../viewmodels/cart_viewmodel.dart';

/// New arrivals for the bag's "You May Also Like" rail.
final cartNewArrivalsProvider = FutureProvider.autoDispose<List<ProductModel>>(
    (ref) => ref.watch(catalogRepositoryProvider).rail(ProductRail.newArrivals, limit: 10));

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  /// Applied on this page (POST /cart/apply-coupon) and handed to checkout.
  CouponResult? _coupon;

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(cartProvider);
    final cart = async.valueOrNull;
    // A coupon is priced against the bag it was applied to.
    ref.listen(cartProvider.select((c) => c.valueOrNull?.subTotal), (prev, next) {
      if (prev != next && _coupon != null) setState(() => _coupon = null);
    });
    return Scaffold(
      appBar: AppBar(
        leading: const HomeBackButton(),
        title: Text(cart == null || cart.isEmpty ? 'Your Bag' : 'Your Bag (${cart.count})'),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border_rounded),
            onPressed: () => context.go(RoutePaths.wishlist),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(cartProvider.notifier).refresh(),
        child: async.when(
          loading: () => const ListTileSkeleton(count: 3),
          error: (e, _) => ListView(children: [
            SizedBox(height: 500, child: ErrorState(error: e, onRetry: () => ref.invalidate(cartProvider))),
          ]),
          data: (cart) => cart.isEmpty
              ? ListView(children: [
                  SizedBox(
                    height: MediaQuery.sizeOf(context).height * 0.7,
                    child: EmptyState(
                      icon: Icons.shopping_bag_outlined,
                      title: 'Your bag is empty',
                      message: 'Find something beautiful to add.',
                      actionLabel: 'Start shopping',
                      onAction: () => context.go(RoutePaths.home),
                    ),
                  ),
                ])
              : ListView(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  children: [
                    ...cart.items.map((i) => _CartLine(item: i)),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton(
                        onPressed: () => context.go(RoutePaths.home),
                        child: const Text('CONTINUE SHOPPING'),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    _Summary(cart: cart, coupon: _coupon, onCoupon: (c) => setState(() => _coupon = c)),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.lock_outline_rounded, size: 13, color: context.colors.onSurfaceVariant),
                        const SizedBox(width: 6),
                        Text('Secure, encrypted checkout', style: context.text.bodySmall),
                      ],
                    ),
                    _Recommendations(cart: cart),
                    const SizedBox(height: 100),
                  ],
                ),
        ),
      ),
      bottomNavigationBar: cart == null || cart.isEmpty
          ? null
          : Container(
              decoration: BoxDecoration(
                color: context.colors.surface,
                boxShadow: const [BoxShadow(color: Color(0x1A000000), blurRadius: 16, offset: Offset(0, -4))],
              ),
              padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.sm),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(Formatters.currency(_coupon?.total ?? cart.subTotal), style: context.text.headlineSmall),
                          Text('Shipping calculated at checkout', style: context.text.bodySmall),
                        ],
                      ),
                    ),
                    SizedBox(
                      width: 200,
                      child: ElevatedButton(
                        onPressed: () => context.push(RoutePaths.checkout, extra: _coupon?.code),
                        child: const Text('PROCEED TO CHECKOUT'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _FreeShippingProgress extends ConsumerWidget {
  const _FreeShippingProgress({required this.subTotal});
  final double subTotal;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(settingsValueProvider);
    if (!s.freeShippingEnabled || s.freeShippingThreshold <= 0) return const SizedBox.shrink();
    final remaining = s.freeShippingThreshold - subTotal;
    final progress = (subTotal / s.freeShippingThreshold).clamp(0.0, 1.0);
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.champagne.withValues(alpha: context.isDark ? 0.08 : 0.6),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.local_shipping_outlined, size: 18, color: AppColors.wine),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  remaining > 0
                      ? 'Add ${Formatters.currency(remaining)} more for FREE shipping'
                      : 'Yay! Your order ships free',
                  style: context.text.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppColors.roseGoldLight.withValues(alpha: 0.4),
              color: remaining > 0 ? AppColors.roseGold : AppColors.success,
            ),
          ),
        ],
      ),
    );
  }
}

class _CartLine extends ConsumerStatefulWidget {
  const _CartLine({required this.item});
  final CartItemModel item;

  @override
  ConsumerState<_CartLine> createState() => _CartLineState();
}

class _CartLineState extends ConsumerState<_CartLine> {
  bool _busy = false;

  Future<void> _run(Future<void> Function() action) async {
    setState(() => _busy = true);
    try {
      await action();
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _remove() async {
    final ok = await showConfirmDialog(context,
        title: 'Remove item?',
        message: 'Remove ${widget.item.product.title} from your bag?',
        confirmLabel: 'Remove',
        destructive: true);
    if (ok) await _run(() => ref.read(cartProvider.notifier).remove(widget.item));
  }

  Future<void> _saveForLater() => _run(() async {
        final item = widget.item;
        if (!ref.read(isWishlistedProvider(item.product.id))) {
          await ref.read(wishlistProvider.notifier).toggle(item.product);
        }
        await ref.read(cartProvider.notifier).remove(item);
        if (mounted) context.showSnack('Moved to wishlist');
      });

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    final stock = item.availableStock;
    final unavailable = !item.product.isPurchasable || stock <= 0;
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GestureDetector(
                  onTap: () => context.push(RoutePaths.product(item.product.slug)),
                  child: SizedBox(
                    width: 88,
                    height: 104,
                    child: AppNetworkImage(
                      url: item.image,
                      targetWidth: 200,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.product.title,
                          maxLines: 2, overflow: TextOverflow.ellipsis, style: context.text.titleSmall),
                      if (!item.options.isEmpty) ...[
                        const SizedBox(height: 4),
                        LineOptions(options: item.options),
                      ],
                      const SizedBox(height: 6),
                      PriceTag(
                          price: item.unitPrice,
                          mrp: item.variant?.price ?? item.product.price,
                          size: 14),
                      const SizedBox(height: 8),
                      if (unavailable)
                        Text('Out of stock — remove to continue',
                            style: context.text.labelMedium?.copyWith(color: AppColors.error))
                      else
                        Row(
                          children: [
                            QuantityStepper(
                              compact: true,
                              busy: _busy,
                              value: item.quantity,
                              max: stock < item.product.maxQuantity ? stock : item.product.maxQuantity,
                              onChanged: (v) =>
                                  _run(() => ref.read(cartProvider.notifier).updateQuantity(item, v)),
                            ),
                            const Spacer(),
                            Text(Formatters.currency(item.lineTotal), style: context.text.titleMedium),
                          ],
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: AppSpacing.lg),
            Row(
              children: [
                Expanded(
                  child: TextButton.icon(
                    onPressed: _busy ? null : _saveForLater,
                    icon: const Icon(Icons.favorite_border_rounded, size: 18),
                    label: const Text('MOVE TO WISHLIST'),
                  ),
                ),
                Container(width: 1, height: 22, color: context.colors.outline),
                Expanded(
                  child: TextButton.icon(
                    onPressed: _busy ? null : _remove,
                    icon: const Icon(Icons.delete_outline_rounded, size: 18),
                    label: const Text('REMOVE'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Order summary — the website's cart aside: free-shipping progress, coupon
/// (signed-in shoppers; guests are asked to log in), subtotal, coupon saving,
/// shipping at checkout, total and the MRP saving.
class _Summary extends ConsumerStatefulWidget {
  const _Summary({required this.cart, required this.coupon, required this.onCoupon});
  final CartModel cart;
  final CouponResult? coupon;
  final ValueChanged<CouponResult?> onCoupon;

  @override
  ConsumerState<_Summary> createState() => _SummaryState();
}

class _SummaryState extends ConsumerState<_Summary> {
  final _code = TextEditingController();
  bool _applying = false;

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  Future<void> _apply() async {
    final code = _code.text.trim().toUpperCase();
    if (code.isEmpty) return;
    context.hideKeyboard();
    setState(() => _applying = true);
    try {
      final result = await ref.read(cartRepositoryProvider).applyCoupon(code);
      widget.onCoupon(result);
      if (mounted) context.showSnack('Coupon applied — you saved ${Formatters.currency(result.discountAmount)}');
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _applying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = widget.cart;
    final coupon = widget.coupon;
    final authenticated = ref.watch(isAuthenticatedProvider);
    final total = coupon?.total ?? cart.subTotal;
    Widget row(String label, String value, {Color? color, bool bold = false}) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 5),
          child: Row(
            children: [
              Expanded(
                  child: Text(label,
                      style: bold
                          ? context.text.titleMedium
                          : context.text.bodyMedium?.copyWith(color: color ?? context.colors.onSurfaceVariant))),
              Text(value, style: (bold ? context.text.titleMedium : context.text.bodyMedium)?.copyWith(color: color)),
            ],
          ),
        );

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: context.colors.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Order Summary', style: context.text.headlineMedium),
          const SizedBox(height: AppSpacing.md),
          _FreeShippingProgress(subTotal: cart.subTotal),
          if (!authenticated)
            Text.rich(
              TextSpan(
                text: 'Have a coupon? ',
                style: context.text.bodyMedium?.copyWith(color: context.colors.onSurfaceVariant),
                children: [
                  WidgetSpan(
                    alignment: PlaceholderAlignment.baseline,
                    baseline: TextBaseline.alphabetic,
                    child: GestureDetector(
                      onTap: () => context.push(RoutePaths.loginWithRedirect(RoutePaths.cart)),
                      child: Text('Log in',
                          style: context.text.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600, decoration: TextDecoration.underline)),
                    ),
                  ),
                  const TextSpan(text: ' to apply it.'),
                ],
              ),
            )
          else if (coupon != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.successSoft,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: AppColors.success.withValues(alpha: 0.5)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.sell_outlined, size: 15, color: AppColors.success),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text('${coupon.code} applied',
                        style: context.text.bodyMedium?.copyWith(color: AppColors.success, fontWeight: FontWeight.w600)),
                  ),
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    tooltip: 'Remove coupon',
                    icon: const Icon(Icons.close_rounded, size: 16),
                    onPressed: () => widget.onCoupon(null),
                  ),
                ],
              ),
            )
          else
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _code,
                    textCapitalization: TextCapitalization.characters,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _apply(),
                    decoration: const InputDecoration(hintText: 'Coupon code', isDense: true),
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  height: 46,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(minimumSize: const Size(96, 46)),
                    onPressed: _applying ? null : _apply,
                    child: _applying
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Text('APPLY'),
                  ),
                ),
              ],
            ),
          const SizedBox(height: AppSpacing.md),
          const Divider(),
          const SizedBox(height: AppSpacing.xs),
          row('Subtotal', Formatters.currency(cart.subTotal)),
          if (coupon != null)
            row('Coupon (${coupon.code})', '− ${Formatters.currency(coupon.discountAmount)}', color: AppColors.success),
          row('Shipping', 'Calculated at checkout'),
          const Divider(height: AppSpacing.lg),
          row('Total', Formatters.currency(total), bold: true),
          if (cart.savings > 0) ...[
            const SizedBox(height: 6),
            Text("You're saving ${Formatters.currency(cart.savings)} on MRP",
                style: context.text.bodyMedium?.copyWith(color: AppColors.success)),
          ],
        ],
      ),
    );
  }
}

/// "You May Also Like" — related to the first piece in the bag plus new
/// arrivals, without anything already in the bag (website CartPage).
class _Recommendations extends ConsumerWidget {
  const _Recommendations({required this.cart});
  final CartModel cart;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final firstId = cart.items.isEmpty ? null : cart.items.first.product.id;
    final related = firstId == null
        ? const <ProductModel>[]
        : ref.watch(relatedProductsProvider(firstId)).valueOrNull ?? const <ProductModel>[];
    final arrivals = ref.watch(cartNewArrivalsProvider).valueOrNull ?? const <ProductModel>[];
    final inBag = cart.items.map((i) => i.product.id).toSet();
    final seen = <String>{};
    final products = [...related, ...arrivals]
        .where((p) => !inBag.contains(p.id) && seen.add(p.id))
        .take(10)
        .toList();
    if (products.isEmpty) return const SizedBox.shrink();
    return Column(
      children: [
        const SectionHeader(title: 'You May Also Like', overline: 'Complete the look'),
        ProductCarousel(products: products, heroPrefix: 'bag'),
      ],
    );
  }
}

