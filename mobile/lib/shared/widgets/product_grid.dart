import 'package:flutter/material.dart';

import '../../core/models/product_model.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/utils/extensions.dart';
import 'product_card.dart';

/// Card width / height: a 4:5 image plus the website's info block.
const double kProductCardAspect = 0.5;

class SliverProductGrid extends StatelessWidget {
  const SliverProductGrid({super.key, required this.products, this.heroPrefix = 'grid'});

  final List<ProductModel> products;
  final String heroPrefix;

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      sliver: SliverGrid(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: context.gridColumns,
          mainAxisSpacing: AppSpacing.lg,
          crossAxisSpacing: AppSpacing.sm,
          childAspectRatio: kProductCardAspect,
        ),
        delegate: SliverChildBuilderDelegate(
          (_, i) => ProductCard(product: products[i], heroPrefix: heroPrefix),
          childCount: products.length,
          addAutomaticKeepAlives: false,
        ),
      ),
    );
  }
}

/// Horizontal product carousel used on Home / PDP.
class ProductCarousel extends StatelessWidget {
  const ProductCarousel({super.key, required this.products, this.heroPrefix = 'rail', this.cardWidth = 158});

  final List<ProductModel> products;
  final String heroPrefix;
  final double cardWidth;

  @override
  Widget build(BuildContext context) {
    final height = cardWidth / kProductCardAspect;
    return SizedBox(
      height: height,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: AppSpacing.screen,
        itemCount: products.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
        itemBuilder: (_, i) => ProductCard(
          product: products[i],
          width: cardWidth,
          heroPrefix: '$heroPrefix-$i',
        ),
      ),
    );
  }
}
