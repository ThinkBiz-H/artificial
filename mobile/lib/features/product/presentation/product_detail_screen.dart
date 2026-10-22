import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_config.dart';
import '../../../core/models/product_model.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/providers/core_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import '../../../shared/widgets/html_content.dart';
import '../../../shared/widgets/line_options.dart';
import '../../../shared/widgets/price_tag.dart';
import '../../../shared/widgets/product_grid.dart';
import '../../../shared/widgets/quantity_stepper.dart';
import '../../../shared/widgets/rating_badge.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../../../shared/widgets/wishlist_button.dart';
import '../../cart/viewmodels/cart_viewmodel.dart';
import '../viewmodels/product_detail_viewmodel.dart';
import '../viewmodels/recently_viewed_viewmodel.dart';
import 'product_gallery.dart';
import 'reviews_widgets.dart';

const _careTips = [
  'Put your jewellery on last — after perfume, lotion and hairspray — and take it off first.',
  'Keep it away from water, sweat and chemicals; remove before bathing, swimming or workouts.',
  'Wipe gently with a soft, dry cloth after each wear to keep the finish bright.',
  'Store each piece separately in its pouch or an airtight box, away from humidity.',
];

/// Max cards per recommendation rail (website RAIL_SIZE).
const _railSize = 8;

bool _isNew(DateTime? createdAt) {
  if (createdAt == null) return false;
  final age = DateTime.now().difference(createdAt);
  return !age.isNegative && age.inDays < 30;
}

/// Product page — mirrors the website's ProductDetailsPage.
class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({super.key, required this.slug});
  final String slug;

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  ProductOptions? _options;
  String? _optionsFor;
  int _quantity = 1;
  bool _adding = false;
  bool _buying = false;

  void _ensureOptions(ProductModel product) {
    if (_optionsFor == product.id) return;
    _optionsFor = product.id;
    _options = ProductOptions.initial(product);
    _quantity = product.minOrderQuantity < 1 ? 1 : product.minOrderQuantity;
  }

  Future<bool> _addToCart(ProductModel p, {bool silent = false}) async {
    final o = _options!;
    final problem = o.blocker;
    if (problem != null) {
      context.showSnack(problem, error: true);
      return false;
    }
    try {
      await ref.read(cartProvider.notifier).add(
            product: p,
            variant: o.matchedVariant,
            quantity: _quantity.clamp(1, o.stock < 1 ? 1 : o.stock),
            color: o.color,
            colorHex: o.colorHex,
            size: o.size,
          );
      HapticFeedback.mediumImpact();
      if (mounted && !silent) {
        context.showSnack('Added to your bag',
            action: SnackBarAction(label: 'VIEW', onPressed: () => context.go(RoutePaths.cart)));
      }
      return true;
    } catch (e) {
      if (mounted) context.showError(e);
      return false;
    }
  }

  Future<void> _onAdd(ProductModel p) async {
    setState(() => _adding = true);
    await _addToCart(p);
    if (mounted) setState(() => _adding = false);
  }

  Future<void> _onBuyNow(ProductModel p) async {
    setState(() => _buying = true);
    final ok = await _addToCart(p, silent: true);
    if (!mounted) return;
    setState(() => _buying = false);
    if (ok) context.push(RoutePaths.checkout);
  }

  void _share(ProductModel p) {
    ref.read(launcherServiceProvider).share(
          '${p.title}\n${AppConfig.productShareUrl(p.slug)}',
          subject: p.title,
        );
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(productDetailProvider(widget.slug));
    return async.when(
      loading: () => Scaffold(
        appBar: AppBar(),
        body: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ShimmerBox(height: 420),
              Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ShimmerBox(height: 12, width: 96, radius: 4),
                    SizedBox(height: 12),
                    ShimmerBox(height: 34, width: 280, radius: 6),
                    SizedBox(height: 12),
                    ShimmerBox(height: 16, width: 128, radius: 4),
                    SizedBox(height: 20),
                    ShimmerBox(height: 30, width: 160, radius: 6),
                    SizedBox(height: 20),
                    ShimmerBox(height: 96, radius: 10),
                    SizedBox(height: 16),
                    ShimmerBox(height: 48, radius: 999),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: ErrorState(error: e, onRetry: () => ref.invalidate(productDetailProvider(widget.slug))),
      ),
      data: (product) {
        _ensureOptions(product);
        return _buildProduct(context, product, _options!);
      },
    );
  }

  Widget _buildProduct(BuildContext context, ProductModel p, ProductOptions o) {
    final settings = ref.watch(settingsValueProvider);
    final price = o.price;
    final mrp = o.mrp;
    final stock = o.stock;
    final discount = mrp > price && price > 0 ? (((mrp - price) / mrp) * 100).round() : 0;
    final maxQty = [p.maxQuantity, stock <= 0 ? 1 : stock].reduce((a, b) => a < b ? a : b);
    final category = p.category != null && p.category!.name.isNotEmpty ? p.category : null;
    final brand = p.brand != null && p.brand!.name.isNotEmpty ? p.brand : null;

    final badge = discount > 0
        ? _GalleryBadge(label: '$discount% off', filled: true)
        : _isNew(p.createdAt)
            ? const _GalleryBadge(label: 'New', filled: false)
            : null;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(productDetailProvider(widget.slug));
          ref.invalidate(productReviewsProvider(p.id));
          try {
            await ref.read(productDetailProvider(widget.slug).future);
          } catch (_) {}
        },
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              title: Text(p.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: context.text.titleLarge),
              actions: const [CartIconButton()],
            ),
            SliverToBoxAdapter(
              child: ProductGallery(
                images: o.images,
                badge: badge,
                onWatchVideo: p.videoUrl.isEmpty ? null : () => ref.read(launcherServiceProvider).openUrl(p.videoUrl),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.lg, AppSpacing.md, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Eyebrow · title · share
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (category != null || brand != null)
                                GestureDetector(
                                  onTap: category != null && category.slug.isNotEmpty
                                      ? () => context.push(RoutePaths.category(category.slug))
                                      : null,
                                  child: Text((category ?? brand)!.name.toUpperCase(),
                                      style: AppTypography.overline(AppColors.roseGold)),
                                ),
                              const SizedBox(height: 6),
                              Text(p.title,
                                  style: context.text.displaySmall?.copyWith(fontSize: 32, height: 1.05)),
                            ],
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        _CircleIconButton(icon: Icons.share_outlined, tooltip: 'Share', onTap: () => _share(p)),
                      ],
                    ),
                    if (p.numReviews > 0) ...[
                      const SizedBox(height: 10),
                      GestureDetector(
                        onTap: () => context.push(RoutePaths.reviews(p.id)),
                        child: Row(
                          children: [
                            StarRow(rating: p.rating, size: 15),
                            const SizedBox(width: 8),
                            Text('${p.rating.toStringAsFixed(1)} · ${p.numReviews} review${p.numReviews == 1 ? '' : 's'}',
                                style: context.text.bodySmall),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.md),
                    const Divider(),
                    const SizedBox(height: AppSpacing.md),
                    PriceTag(price: price, mrp: mrp, size: 24),
                    const SizedBox(height: 4),
                    Text(settings.pricesIncludeTax ? 'Inclusive of all taxes' : 'Taxes calculated at checkout',
                        style: context.text.bodySmall),
                    if (p.shortDescription.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.md),
                      Text(p.shortDescription,
                          style: AppTypography.sub(context.colors.onSurface.withValues(alpha: 0.82))),
                    ],
                    if ((p.metal ?? '').isNotEmpty || (p.plating ?? '').isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.lg),
                      _DefinitionList(rows: [
                        if ((p.metal ?? '').isNotEmpty) ('Metal', p.metal!),
                        if ((p.plating ?? '').isNotEmpty) ('Plating', p.plating!),
                      ]),
                    ],
                    if (o.colorChoices.isNotEmpty) _ColorSelector(options: o, onPick: (name) => setState(() => _options = o.pickColor(name))),
                    if (o.sizeChoices.isNotEmpty)
                      _ChoiceGroup(
                        label: 'Size',
                        selected: o.size,
                        values: o.sizeChoices,
                        isAvailable: (v) => !o.usesVariants || o.inStock(color: o.color, size: v),
                        onPick: (v) => setState(() => _options = o.pick('size', v)),
                      ),
                    ...o.otherKeys.map((key) => _ChoiceGroup(
                          label: key,
                          selected: o.selected[key],
                          values: o.otherOptions[key] ?? const <String>[],
                          onPick: (v) => setState(() => _options = o.pick(key, v)),
                        )),
                    if (o.usesVariants && o.matchedVariant == null)
                      Padding(
                        padding: const EdgeInsets.only(top: AppSpacing.sm),
                        child: Text("This combination isn't available — please choose another option.",
                            style: context.text.bodySmall?.copyWith(color: AppColors.error)),
                      ),
                    const SizedBox(height: AppSpacing.lg),
                    _StockLine(stock: stock),
                    const SizedBox(height: AppSpacing.md),
                    Row(
                      children: [
                        QuantityStepper(
                          value: _quantity.clamp(1, maxQty),
                          min: p.minOrderQuantity < 1 ? 1 : p.minOrderQuantity,
                          max: maxQty,
                          onChanged: o.canAddToCart ? (v) => setState(() => _quantity = v) : (_) {},
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: SizedBox(
                            height: 46,
                            child: OutlinedButton(
                              style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(46)),
                              onPressed: !o.canAddToCart || _adding || _buying ? null : () => _onAdd(p),
                              child: _adding
                                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                                  : Text(o.canAddToCart ? 'ADD TO BAG' : 'SOLD OUT'),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Container(
                          width: 46,
                          height: 46,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: context.colors.surface,
                            border: Border.all(color: context.colors.outline),
                          ),
                          alignment: Alignment.center,
                          child: WishlistButton(product: p, size: 20, filledBackground: false),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    ElevatedButton(
                      onPressed: !o.canAddToCart || _adding || _buying ? null : () => _onBuyNow(p),
                      child: _buying
                          ? SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: context.colors.onPrimary))
                          : const Text('BUY IT NOW'),
                    ),
                    _OfferCards(lineTotal: price * _quantity),
                    const SizedBox(height: AppSpacing.md),
                    const Divider(),
                    const SizedBox(height: AppSpacing.sm),
                    Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 6,
                      children: [
                        const Icon(Icons.replay_rounded, size: 15, color: AppColors.roseGold),
                        Text('Easy returns on eligible orders', style: context.text.bodySmall),
                        GestureDetector(
                          onTap: () => context.push(RoutePaths.page('refund')),
                          child: Text('Returns policy',
                              style: context.text.bodySmall?.copyWith(decoration: TextDecoration.underline)),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),
                    _PincodeChecker(amount: price * _quantity),
                    if (o.sku.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.md),
                      Text('SKU: ${o.sku}', style: context.text.bodySmall),
                    ],

                    // ---- Details ----
                    const SizedBox(height: AppSpacing.xxl),
                    const Divider(),
                    const SizedBox(height: AppSpacing.xl),
                    Text('THE DETAILS', style: AppTypography.overline(AppColors.roseGold)),
                    const SizedBox(height: 6),
                    Text('Description', style: context.text.displaySmall),
                    const SizedBox(height: AppSpacing.md),
                    if (p.description.isNotEmpty)
                      HtmlContent(content: p.description)
                    else
                      Text(p.shortDescription.isNotEmpty ? p.shortDescription : 'Details for this piece will be added soon.',
                          style: context.text.bodyLarge),
                    const SizedBox(height: AppSpacing.lg),
                    const Divider(),
                    if (p.attributes.isNotEmpty || o.sku.isNotEmpty || brand != null || category != null || (p.weight ?? 0) > 0)
                      _Accordion(
                        title: 'Product details',
                        initiallyExpanded: true,
                        child: _DefinitionList(rows: [
                          ...p.attributes.map((a) => (a.key, a.value)),
                          if (category != null) ('Category', category.name),
                          if (brand != null) ('Brand', brand.name),
                          if ((p.weight ?? 0) > 0) ('Weight', '${Formatters.trimNumber(p.weight!)} kg'),
                          if (o.sku.isNotEmpty) ('SKU', o.sku),
                          if (p.warranty.isNotEmpty) ('Warranty', p.warranty),
                        ]),
                      ),
                    _Accordion(
                      title: 'Jewellery care',
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: _careTips
                            .map((t) => Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('•  ', style: context.text.bodyMedium),
                                      Expanded(child: Text(t, style: context.text.bodyMedium)),
                                    ],
                                  ),
                                ))
                            .toList(),
                      ),
                    ),
                    _Accordion(
                      title: 'Shipping & delivery',
                      child: _PolicyText(
                        text: 'Every order is packed securely and shipped with tracking. Use the pincode checker above '
                            'for an estimated delivery date to your address.'
                            '${settings.freeShippingEnabled && settings.freeShippingThreshold > 0 ? ' Orders above ${Formatters.currency(settings.freeShippingThreshold)} ship free.' : ''}',
                        linkLabel: 'Shipping policy',
                        onLink: () => context.push(RoutePaths.page('shipping')),
                      ),
                    ),
                    _Accordion(
                      title: 'Returns & exchanges',
                      child: _PolicyText(
                        text: p.returnPolicy.isNotEmpty
                            ? p.returnPolicy
                            : 'Easy returns on eligible orders — raise a request from My Orders after delivery.',
                        linkLabel: 'Returns & refunds policy',
                        onLink: () => context.push(RoutePaths.page('refund')),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    _FrequentlyBoughtTogether(product: p, options: o),
                    const SizedBox(height: AppSpacing.xl),
                    Text('REVIEWS', style: AppTypography.overline(AppColors.roseGold)),
                    const SizedBox(height: 6),
                    Text('Customer Reviews', style: context.text.displaySmall),
                    const SizedBox(height: AppSpacing.md),
                    ReviewsSection(product: p),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(child: _RecommendationRails(product: p)),
            const SliverToBoxAdapter(child: SizedBox(height: 120)),
          ],
        ),
      ),
      bottomNavigationBar: _BottomBar(
        price: price,
        mrp: discount > 0 ? mrp : null,
        enabled: p.isPurchasable && o.canAddToCart,
        adding: _adding,
        buying: _buying,
        onAdd: () => _onAdd(p),
        onBuy: () => _onBuyNow(p),
      ),
    );
  }
}

class _GalleryBadge extends StatelessWidget {
  const _GalleryBadge({required this.label, required this.filled});
  final String label;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: filled ? AppColors.wine : AppColors.ivory,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: filled ? null : Border.all(color: AppColors.gold.withValues(alpha: 0.7)),
      ),
      child: Text(label.toUpperCase(),
          style: TextStyle(
              fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1.2, color: filled ? AppColors.ivory : AppColors.wine)),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({required this.icon, required this.tooltip, required this.onTap});
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkResponse(
        onTap: onTap,
        radius: 24,
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: context.colors.outline)),
          child: Icon(icon, size: 17, color: context.colors.onSurface),
        ),
      ),
    );
  }
}

/// Label / value rows (metal & plating, product details).
class _DefinitionList extends StatelessWidget {
  const _DefinitionList({required this.rows});
  final List<(String, String)> rows;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: rows
          .map((r) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(width: 104, child: Text(r.$1, style: context.text.bodyMedium?.copyWith(color: context.colors.onSurfaceVariant))),
                    Expanded(child: Text(r.$2, style: context.text.bodyMedium?.copyWith(fontWeight: FontWeight.w500))),
                  ],
                ),
              ))
          .toList(),
    );
  }
}

class _OptionLegend extends StatelessWidget {
  const _OptionLegend({required this.label, this.value});
  final String label;
  final String? value;

  @override
  Widget build(BuildContext context) {
    return Text.rich(TextSpan(
      text: label.toUpperCase(),
      style: context.text.labelMedium?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 1.9),
      children: [
        if (value != null && value!.isNotEmpty)
          TextSpan(
            text: '   $value',
            style: context.text.bodySmall?.copyWith(letterSpacing: 0, fontWeight: FontWeight.w400),
          ),
      ],
    ));
  }
}

/// Colour swatches: a filled circle when the colour has a hex, else a pill.
class _ColorSelector extends StatelessWidget {
  const _ColorSelector({required this.options, required this.onPick});
  final ProductOptions options;
  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    final o = options;
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _OptionLegend(label: 'Color', value: o.color),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: o.colorChoices.map((c) {
              final selected = sameOption(c.name, o.color);
              final available = !o.usesVariants || o.inStock(color: c.name);
              final hex = parseHexColor(c.hex);
              if (hex == null) {
                return _Pill(
                  label: c.name,
                  selected: selected,
                  available: available,
                  onTap: () => onPick(c.name),
                );
              }
              return Tooltip(
                message: available ? c.name : '${c.name} — out of stock',
                child: GestureDetector(
                  onTap: () => onPick(c.name),
                  child: AnimatedContainer(
                    duration: AppDurations.fast,
                    width: 40,
                    height: 40,
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: selected ? AppColors.wine : AppColors.borderStrong,
                        width: selected ? 2 : 1,
                      ),
                    ),
                    child: Opacity(
                      opacity: available ? 1 : 0.45,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          DecoratedBox(
                            decoration: BoxDecoration(shape: BoxShape.circle, color: hex),
                            child: const SizedBox.expand(),
                          ),
                          if (!available)
                            Transform.rotate(
                              angle: -0.785,
                              child: Container(width: 44, height: 1, color: AppColors.ink.withValues(alpha: 0.7)),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _ChoiceGroup extends StatelessWidget {
  const _ChoiceGroup({
    required this.label,
    required this.selected,
    required this.values,
    required this.onPick,
    this.isAvailable,
  });

  final String label;
  final String? selected;
  final List<String> values;
  final ValueChanged<String> onPick;
  final bool Function(String value)? isAvailable;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _OptionLegend(label: label, value: selected),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: values
                .map((v) => _Pill(
                      label: v,
                      selected: sameOption(v, selected),
                      available: isAvailable?.call(v) ?? true,
                      showCheck: true,
                      onTap: () => onPick(v),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({
    required this.label,
    required this.selected,
    required this.available,
    required this.onTap,
    this.showCheck = false,
  });

  final String label;
  final bool selected;
  final bool available;
  final bool showCheck;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final fg = selected
        ? AppColors.ivory
        : available
            ? context.colors.onSurface
            : context.colors.onSurfaceVariant;
    return Material(
      color: selected ? AppColors.wine : context.colors.surface,
      shape: StadiumBorder(
        side: BorderSide(color: selected ? AppColors.wine : context.colors.outline),
      ),
      child: InkWell(
        customBorder: const StadiumBorder(),
        onTap: onTap,
        child: Container(
          constraints: const BoxConstraints(minWidth: 48),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(label,
                  style: context.text.bodyMedium?.copyWith(
                    color: fg,
                    fontWeight: FontWeight.w500,
                    decoration: available || selected ? null : TextDecoration.lineThrough,
                  )),
              if (selected && showCheck) ...[
                const SizedBox(width: 6),
                Icon(Icons.check_rounded, size: 14, color: fg),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _StockLine extends StatelessWidget {
  const _StockLine({required this.stock});
  final int stock;

  @override
  Widget build(BuildContext context) {
    final inStock = stock > 0;
    final color = inStock ? AppColors.success : AppColors.error;
    final text = !inStock
        ? 'Out of stock'
        : stock < 10
            ? 'Only $stock left — order soon'
            : 'In stock, ready to ship';
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 8),
        Text(text, style: context.text.bodyMedium?.copyWith(color: color)),
      ],
    );
  }
}

/// Offer cards built only from live store settings (Admin > Settings) — never invented promotions.
class _OfferCards extends ConsumerWidget {
  const _OfferCards({required this.lineTotal});
  final double lineTotal;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(settingsValueProvider);
    final offers = <(IconData, String, String)>[
      if (s.freeShippingEnabled && s.freeShippingThreshold > 0)
        lineTotal >= s.freeShippingThreshold
            ? (
                Icons.local_shipping_outlined,
                'Free shipping unlocked',
                'This order qualifies — on orders above ${Formatters.currency(s.freeShippingThreshold)}.'
              )
            : (
                Icons.local_shipping_outlined,
                'Free shipping',
                'Add ${Formatters.currency(s.freeShippingThreshold - lineTotal)} more to ship free.'
              ),
      (Icons.confirmation_number_outlined, 'Have a coupon?', 'Apply your code at checkout to see your savings.'),
      if (s.onlinePaymentEnabled)
        (Icons.verified_user_outlined, '10% off on prepaid', 'Pay online via Razorpay — UPI, cards, net banking & wallets.'),
      if (s.isCodAvailable) (Icons.payments_outlined, 'Cash on delivery', 'Pay when your order arrives.'),
    ];
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('OFFERS & BENEFITS',
              style: context.text.labelMedium?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 1.9)),
          const SizedBox(height: 12),
          SizedBox(
            height: 92,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: offers.length,
              separatorBuilder: (_, _) => const SizedBox(width: 12),
              itemBuilder: (_, i) {
                final (icon, title, text) = offers[i];
                return Container(
                  width: 240,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.ivory,
                    borderRadius: AppRadius.card,
                    border: Border.all(color: AppColors.roseGoldSoft.withValues(alpha: 0.7)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(color: AppColors.surface, shape: BoxShape.circle, boxShadow: AppShadows.soft),
                        child: Icon(icon, size: 17, color: AppColors.roseGold),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(title, style: context.text.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text(text, style: context.text.bodySmall, maxLines: 3, overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// The website's AccordionItem: uppercase label, chevron, hairline below.
class _Accordion extends StatelessWidget {
  const _Accordion({required this.title, required this.child, this.initiallyExpanded = false});
  final String title;
  final Widget child;
  final bool initiallyExpanded;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: context.colors.outline))),
      child: Theme(
        data: context.theme.copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: EdgeInsets.zero,
          childrenPadding: const EdgeInsets.only(bottom: AppSpacing.lg),
          initiallyExpanded: initiallyExpanded,
          iconColor: context.colors.onSurfaceVariant,
          collapsedIconColor: context.colors.onSurfaceVariant,
          title: Text(title.toUpperCase(),
              style: context.text.titleSmall?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 1.9)),
          expandedCrossAxisAlignment: CrossAxisAlignment.stretch,
          children: [child],
        ),
      ),
    );
  }
}

class _PolicyText extends StatelessWidget {
  const _PolicyText({required this.text, required this.linkLabel, required this.onLink});
  final String text;
  final String linkLabel;
  final VoidCallback onLink;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(text, style: context.text.bodyMedium),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: onLink,
          child: Text(linkLabel, style: context.text.bodyMedium?.copyWith(decoration: TextDecoration.underline)),
        ),
      ],
    );
  }
}

class _PincodeChecker extends ConsumerStatefulWidget {
  const _PincodeChecker({required this.amount});
  final double amount;

  @override
  ConsumerState<_PincodeChecker> createState() => _PincodeCheckerState();
}

class _PincodeCheckerState extends ConsumerState<_PincodeChecker> {
  final _controller = TextEditingController();
  String? _pincode;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _check() {
    final error = Validators.pincode(_controller.text);
    if (error != null) {
      context.showSnack(error, error: true);
      return;
    }
    context.hideKeyboard();
    setState(() => _pincode = _controller.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    final quote = _pincode == null
        ? null
        : ref.watch(pincodeQuoteProvider((pincode: _pincode!, amount: widget.amount)));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('DELIVERY', style: context.text.labelMedium?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 1.9)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                keyboardType: TextInputType.number,
                maxLength: 6,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  hintText: 'Enter pincode',
                  counterText: '',
                  prefixIcon: Icon(Icons.location_on_outlined),
                ),
                onSubmitted: (_) => _check(),
              ),
            ),
            const SizedBox(width: 8),
            TextButton(onPressed: _check, child: const Text('CHECK')),
          ],
        ),
        if (quote != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: quote.when(
              loading: () => const LinearProgressIndicator(),
              error: (e, _) => Text("We couldn't confirm delivery to this pincode right now.",
                  style: context.text.bodySmall?.copyWith(color: context.colors.error)),
              data: (q) => Text(
                '${q.estimatedDays > 0 ? 'Delivery in about ${q.estimatedDays} days' : 'Delivery available'} · '
                '${q.freeShipping || q.shippingCharge == 0 ? 'Free shipping' : 'Shipping ${Formatters.currency(q.shippingCharge)}'}',
                style: context.text.bodySmall?.copyWith(color: AppColors.success, fontWeight: FontWeight.w600),
              ),
            ),
          ),
      ],
    );
  }
}

/// "Frequently bought together" — the current piece plus up to two in-stock,
/// single-option add-ons: the admin's cross-sell picks first, then related.
class _FrequentlyBoughtTogether extends ConsumerStatefulWidget {
  const _FrequentlyBoughtTogether({required this.product, required this.options});
  final ProductModel product;
  final ProductOptions options;

  @override
  ConsumerState<_FrequentlyBoughtTogether> createState() => _FrequentlyBoughtTogetherState();
}

class _FrequentlyBoughtTogetherState extends ConsumerState<_FrequentlyBoughtTogether> {
  final Set<String> _deselected = <String>{};
  bool _adding = false;

  /// Adds the chosen pieces one by one (the current piece with its selected options).
  Future<void> _addAll(List<ProductModel> products) async {
    final o = widget.options;
    setState(() => _adding = true);
    final cart = ref.read(cartProvider.notifier);
    try {
      for (final product in products) {
        if (product.id == widget.product.id) {
          await cart.add(
              product: product, variant: o.matchedVariant, quantity: 1, color: o.color, colorHex: o.colorHex, size: o.size);
        } else {
          await cart.add(product: product, quantity: 1);
        }
      }
      if (!mounted) return;
      context.showSnack('Added to your bag',
          action: SnackBarAction(label: 'VIEW', onPressed: () => context.go(RoutePaths.cart)));
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final o = widget.options;
    final related = ref.watch(relatedProductsProvider(p.id)).valueOrNull ?? const <ProductModel>[];
    final crossIds = p.crossSell.map((c) => c.id).toSet();
    final eligible = related.where((r) => r.id != p.id && !r.hasVariants && r.stock > 0).toList();
    final addOns = [
      ...eligible.where((r) => crossIds.contains(r.id)),
      ...eligible.where((r) => !crossIds.contains(r.id)),
    ].take(2).toList();
    if (addOns.isEmpty) return const SizedBox.shrink();

    final currentImage = o.images.isNotEmpty ? o.images.first : p.primaryImage;
    final items = <({String key, ProductModel product, String? image, double price, bool available})>[
      (key: 'current', product: p, image: currentImage, price: o.price, available: o.canAddToCart),
      ...addOns.map((a) => (key: a.id, product: a, image: a.primaryImage, price: a.effectivePrice, available: true)),
    ];
    final chosen = items.where((i) => i.available && !_deselected.contains(i.key)).toList();
    final total = chosen.fold<double>(0, (s, i) => s + i.price);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: context.colors.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('COMPLETE THE LOOK', style: AppTypography.overline(AppColors.roseGold)),
          const SizedBox(height: 6),
          Text('Frequently Bought Together', style: context.text.headlineLarge),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            height: 186,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              separatorBuilder: (_, _) => const Padding(
                padding: EdgeInsets.only(bottom: 70),
                child: Icon(Icons.add_rounded, size: 18, color: AppColors.roseGold),
              ),
              itemBuilder: (_, idx) {
                final i = items[idx];
                final on = i.available && !_deselected.contains(i.key);
                return SizedBox(
                  width: 112,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      GestureDetector(
                        onTap: i.available
                            ? () => setState(() => on ? _deselected.add(i.key) : _deselected.remove(i.key))
                            : null,
                        child: Stack(
                          children: [
                            AnimatedOpacity(
                              duration: AppDurations.fast,
                              opacity: on ? 1 : 0.45,
                              child: SizedBox(
                                width: 112,
                                height: 112,
                                child: AppNetworkImage(
                                    url: i.image, targetWidth: 240, borderRadius: BorderRadius.circular(AppRadius.lg)),
                              ),
                            ),
                            Positioned(
                              right: 6,
                              top: 6,
                              child: Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: on ? AppColors.wine : Colors.white,
                                  border: Border.all(color: on ? AppColors.wine : AppColors.borderStrong),
                                ),
                                child: on ? const Icon(Icons.check_rounded, size: 14, color: Colors.white) : null,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: i.key == 'current' ? null : () => context.push(RoutePaths.product(i.product.slug)),
                        child: Text(i.key == 'current' ? 'This item: ${i.product.title}' : i.product.title,
                            maxLines: 2, overflow: TextOverflow.ellipsis, style: context.text.bodySmall?.copyWith(color: context.colors.onSurface)),
                      ),
                      const SizedBox(height: 2),
                      Text(Formatters.currency(i.price), style: context.text.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text('Total for ${chosen.length} item${chosen.length == 1 ? '' : 's'}', style: context.text.bodySmall),
          Text(Formatters.currency(total), style: context.text.headlineMedium),
          const SizedBox(height: AppSpacing.sm),
          ElevatedButton(
            onPressed: chosen.isEmpty || _adding ? null : () => _addAll([for (final i in chosen) i.product]),
            child: _adding
                ? SizedBox(
                    width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: context.colors.onPrimary))
                : Text(chosen.length > 1 ? 'ADD ${chosen.length} TO BAG' : 'ADD TO BAG'),
          ),
        ],
      ),
    );
  }
}

/// Recommendation rails in the website's order — each product appears at
/// most once across the page (never the product being viewed); empty rails
/// are skipped.
class _RecommendationRails extends ConsumerWidget {
  const _RecommendationRails({required this.product});
  final ProductModel product;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final related = ref.watch(relatedProductsProvider(product.id));
    final recent = ref.watch(recentlyViewedProvider).valueOrNull ?? const <ProductModel>[];
    final best = ref.watch(pdpBestSellersProvider).valueOrNull ?? const <ProductModel>[];

    final plan = <({String eyebrow, String title, List<ProductModel> products, VoidCallback? viewAll})>[
      (eyebrow: 'Inspired for you', title: 'You May Also Like', products: related.valueOrNull ?? const [], viewAll: null),
      (
        eyebrow: 'Picked up where you left',
        title: 'Recently Viewed',
        products: recent,
        viewAll: () => context.push(RoutePaths.recentlyViewed)
      ),
      (
        eyebrow: 'Most loved',
        title: 'Best Sellers',
        products: best,
        viewAll: () => context.push(RoutePaths.collection('best-sellers'))
      ),
      (eyebrow: 'Complete the look', title: 'Complete the Look', products: product.crossSell, viewAll: null),
    ];
    final seen = <String>{product.id};
    final rails = [
      for (final rail in plan)
        (
          eyebrow: rail.eyebrow,
          title: rail.title,
          viewAll: rail.viewAll,
          products: rail.products.where((p) => seen.add(p.id)).take(_railSize).toList(),
        ),
    ].where((r) => r.products.isNotEmpty).toList();

    if (rails.isEmpty) {
      if (related.isLoading) {
        return const Padding(padding: EdgeInsets.all(AppSpacing.md), child: RailSkeleton());
      }
      return const SizedBox.shrink();
    }
    return Column(
      children: [
        for (var i = 0; i < rails.length; i++)
          ColoredBox(
            color: i.isEven ? context.colors.surface : context.theme.scaffoldBackgroundColor,
            child: Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.lg),
              child: Column(
                children: [
                  SectionHeader(title: rails[i].title, overline: rails[i].eyebrow, onAction: rails[i].viewAll),
                  ProductCarousel(products: rails[i].products, heroPrefix: 'pdp-$i'),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

/// Mobile sticky buy bar (website: price + "Add to bag" + "Buy now").
class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.price,
    required this.mrp,
    required this.enabled,
    required this.adding,
    required this.buying,
    required this.onAdd,
    required this.onBuy,
  });

  final double price;
  final double? mrp;
  final bool enabled;
  final bool adding;
  final bool buying;
  final VoidCallback onAdd;
  final VoidCallback onBuy;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface.withValues(alpha: 0.96),
        border: Border(top: BorderSide(color: context.colors.outline)),
        boxShadow: AppShadows.lifted,
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
                  Text(Formatters.currency(price), style: AppTypography.price(context.colors.onSurface, size: 16)),
                  if (mrp != null)
                    Text(Formatters.currency(mrp!),
                        style: context.text.labelSmall?.copyWith(decoration: TextDecoration.lineThrough, letterSpacing: 0)),
                ],
              ),
            ),
            SizedBox(
              height: 44,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 44), padding: const EdgeInsets.symmetric(horizontal: 16)),
                onPressed: !enabled || adding || buying ? null : onAdd,
                child: adding
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(enabled ? 'ADD TO BAG' : 'SOLD OUT'),
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              height: 44,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                    minimumSize: const Size(0, 44), padding: const EdgeInsets.symmetric(horizontal: 16)),
                onPressed: !enabled || adding || buying ? null : onBuy,
                child: buying
                    ? SizedBox(
                        width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: context.colors.onPrimary))
                    : const Text('BUY NOW'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
