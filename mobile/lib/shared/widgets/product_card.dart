import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/product_model.dart';
import '../../core/routes/route_paths.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/extensions.dart';
import '../../features/cart/viewmodels/cart_viewmodel.dart';
import 'app_network_image.dart';
import 'price_tag.dart';
import 'rating_badge.dart';
import 'wishlist_button.dart';

final _materialKey = RegExp('material|metal|plating|finish', caseSensitive: false);

/// Product card — the website's ProductCard (touch layout): a 4:5 image with
/// "Sale · x%" / "New" badges, wishlist and quick-add circles, then the
/// material or category, serif title, rating and price.
class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, this.width, this.heroPrefix = 'p'});

  final ProductModel product;
  final double? width;
  final String heroPrefix;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final outOfStock = product.stock <= 0 && !product.hasVariants;
    final isNew = product.createdAt != null &&
        !DateTime.now().difference(product.createdAt!).isNegative &&
        DateTime.now().difference(product.createdAt!).inDays < 30;
    String? eyebrow;
    for (final a in product.attributes) {
      if (_materialKey.hasMatch(a.key) && a.value.isNotEmpty) {
        eyebrow = a.value;
        break;
      }
    }
    eyebrow ??= (product.category?.name.isNotEmpty ?? false) ? product.category!.name : null;
    void open() => context.push(RoutePaths.product(product.slug));

    return SizedBox(
      width: width,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: GestureDetector(
              onTap: product.slug.isEmpty ? null : open,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ColoredBox(
                    color: AppColors.ivoryDeep,
                    child: AppNetworkImage(url: product.primaryImage, targetWidth: 400),
                  ),
                  if (outOfStock)
                    ColoredBox(
                      color: context.colors.surface.withValues(alpha: 0.55),
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          color: context.colors.surface,
                          child: Text('SOLD OUT', style: text.labelSmall?.copyWith(color: AppColors.ink, letterSpacing: 2, fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ),
                  Positioned(
                    left: 10,
                    top: 10,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (product.hasDiscount) _Badge(label: 'Sale · ${product.discountPercent}%', filled: true),
                        if (product.hasDiscount && isNew) const SizedBox(height: 6),
                        if (isNew) const _Badge(label: 'New', filled: false),
                      ],
                    ),
                  ),
                  Positioned(right: 8, top: 8, child: WishlistButton(product: product, size: 17)),
                  if (!outOfStock) Positioned(right: 8, bottom: 8, child: _QuickAdd(product: product, onChoose: open)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (eyebrow != null)
            Text(eyebrow.toUpperCase(),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: text.labelSmall?.copyWith(fontSize: 10.5, letterSpacing: 2.1, fontWeight: FontWeight.w500)),
          const SizedBox(height: 4),
          GestureDetector(
            onTap: product.slug.isEmpty ? null : open,
            child: Text(product.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: text.titleLarge?.copyWith(fontSize: 17, fontWeight: FontWeight.w500, height: 1.25)),
          ),
          if (product.numReviews > 0) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                StarRow(rating: product.rating, size: 12),
                const SizedBox(width: 4),
                Text('(${product.numReviews})', style: text.labelSmall?.copyWith(letterSpacing: 0)),
              ],
            ),
          ],
          const SizedBox(height: 4),
          PriceTag(price: product.effectivePrice, mrp: product.price, size: 14),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.filled});
  final String label;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      color: filled ? AppColors.wine : AppColors.surface,
      child: Text(label.toUpperCase(),
          style: TextStyle(
              fontSize: 9.5,
              height: 1,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.7,
              color: filled ? AppColors.ivory : AppColors.ink)),
    );
  }
}

/// Bag circle: adds simple products in one tap; products with options open the product page.
class _QuickAdd extends ConsumerStatefulWidget {
  const _QuickAdd({required this.product, required this.onChoose});
  final ProductModel product;
  final VoidCallback onChoose;

  @override
  ConsumerState<_QuickAdd> createState() => _QuickAddState();
}

class _QuickAddState extends ConsumerState<_QuickAdd> {
  bool _busy = false;

  Future<void> _add() async {
    final p = widget.product;
    if (p.hasVariants) return widget.onChoose();
    setState(() => _busy = true);
    try {
      await ref.read(cartProvider.notifier).add(product: p, quantity: 1);
      if (mounted) context.showSnack('Added to your bag');
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final label = widget.product.hasVariants ? 'Choose options' : 'Add to bag';
    return Semantics(
      button: true,
      label: '$label: ${widget.product.title}',
      child: Material(
        color: context.colors.surface,
        shape: const CircleBorder(),
        elevation: 1,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: _busy ? null : _add,
          child: SizedBox(
            width: 40,
            height: 40,
            child: _busy
                ? const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(strokeWidth: 1.6))
                : Icon(Icons.shopping_bag_outlined, size: 18, color: context.colors.onSurface),
          ),
        ),
      ),
    );
  }
}
