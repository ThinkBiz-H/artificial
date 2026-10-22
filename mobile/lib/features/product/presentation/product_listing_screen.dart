import 'package:flutter/material.dart';

import '../../../core/models/product_query.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import 'product_listing_view.dart';

/// /products?category=&brand=&title=&q=&sale=1
class ProductListingScreen extends StatelessWidget {
  const ProductListingScreen({
    super.key,
    this.categoryId,
    this.brandId,
    this.title,
    this.keyword,
    this.onSale = false,
  });

  final String? categoryId;
  final String? brandId;
  final String? title;
  final String? keyword;
  final bool onSale;

  @override
  Widget build(BuildContext context) {
    final heading = title ??
        (keyword != null && keyword!.isNotEmpty
            ? '“$keyword”'
            : onSale
                ? 'Sale'
                : 'All Jewellery');
    return Scaffold(
      appBar: AppBar(title: Text(heading), actions: const [CartIconButton()]),
      body: ProductListingView(
        initialQuery: ProductQuery(
          categoryId: categoryId,
          brandId: brandId,
          keyword: keyword,
          onSale: onSale,
        ),
      ),
    );
  }
}
