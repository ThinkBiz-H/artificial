import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:swastikala/core/models/category_model.dart';
import 'package:swastikala/core/models/common_models.dart';
import 'package:swastikala/core/models/content_models.dart';
import 'package:swastikala/core/models/paginated.dart';
import 'package:swastikala/core/models/product_model.dart';
import 'package:swastikala/core/models/product_query.dart';
import 'package:swastikala/core/providers/app_providers.dart';
import 'package:swastikala/core/providers/repository_providers.dart';
import 'package:swastikala/core/repositories/catalog_repository.dart';
import 'package:swastikala/core/theme/app_theme.dart';
import 'package:swastikala/features/cart/viewmodels/cart_viewmodel.dart';
import 'package:swastikala/features/product/presentation/shop_screen.dart';
import 'package:swastikala/features/wishlist/viewmodels/wishlist_viewmodel.dart';

Map<String, dynamic> _fixture(String name) =>
    (jsonDecode(File('test/fixtures/$name').readAsStringSync()) as Map<String, dynamic>)['data'] as Map<String, dynamic>;

/// Serves the recorded GET /products response (live backend payload).
class _FakeCatalog implements CatalogRepository {
  @override
  Future<Paginated<ProductModel>> products(ProductQuery query, {int page = 1, int limit = 12}) async {
    final data = _fixture('products.json');
    return Paginated(
      items: productListFromJson(data['products']),
      pagination: Pagination.fromJson(Map<String, dynamic>.from(data['pagination'] as Map)),
    );
  }

  @override
  Future<({List<ProductModel> items, int total})> categoryPreview(String categoryId, {int limit = 10}) async {
    final items = productListFromJson(_fixture('products.json')['products']);
    return (items: items, total: items.length);
  }

  @override
  Future<CategoryBannerModel?> categoryBanner(String categoryId) async => null;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  testWidgets('Shop opens on the first main category with its products', (tester) async {
    final products = productListFromJson(_fixture('products.json')['products']);
    expect(products, isNotEmpty);

    await tester.pumpWidget(ProviderScope(
      overrides: [
        catalogRepositoryProvider.overrideWithValue(_FakeCatalog()),
        categoryTreeProvider.overrideWith((ref) async => categoryListFromJson(_fixture('categories.json')['categories'])),
        cartCountProvider.overrideWithValue(0),
        isWishlistedProvider.overrideWith((ref, id) => false),
      ],
      child: MaterialApp(theme: AppTheme.light, home: const ShopScreen()),
    ));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(tester.takeException(), isNull);
    // Same layout as a category opened from Home: search, then every active
    // main category (first one selected), then that category's products.
    expect(find.text('Search necklaces, earrings, bangles…'), findsOneWidget);
    expect(find.text('Marriage'), findsWidgets);
    expect(find.text('Resin'), findsWidgets);
    for (final p in products) {
      expect(find.text(p.title), findsWidgets, reason: 'card for ${p.title}');
    }
  });
}
