import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category_model.dart';
import '../../../core/models/product_query.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_bottom_nav.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import 'product_listing_view.dart';

/// Shop tab — the full catalogue as a product grid, with category chips,
/// sort and filters (website /products).
class ShopScreen extends ConsumerStatefulWidget {
  const ShopScreen({super.key});

  @override
  ConsumerState<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends ConsumerState<ShopScreen> {
  String? _categoryId;

  @override
  Widget build(BuildContext context) {
    final categories = [...(ref.watch(categoryTreeProvider).valueOrNull ?? const <CategoryModel>[]).where((c) => c.isActive)]
      ..sort((a, b) {
        final bySort = a.sortOrder.compareTo(b.sortOrder);
        return bySort != 0 ? bySort : a.name.compareTo(b.name);
      });

    return Scaffold(
      appBar: AppBar(
        leading: const HomeBackButton(),
        title: const Text('Shop'),
        actions: [
          IconButton(
            tooltip: 'Search',
            icon: const Icon(Icons.search_rounded),
            onPressed: () => context.push(RoutePaths.search),
          ),
          IconButton(
            tooltip: 'All collections',
            icon: const Icon(Icons.grid_view_outlined),
            onPressed: () => context.push(RoutePaths.browse),
          ),
          const CartIconButton(),
        ],
      ),
      body: ProductListingView(
        initialQuery: ProductQuery(categoryId: _categoryId),
        header: [
          if (categories.isNotEmpty)
            SliverToBoxAdapter(
              child: SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, 0),
                  children: [
                    _chip(context, 'All', _categoryId == null, () => setState(() => _categoryId = null)),
                    for (final c in categories)
                      _chip(context, c.name, _categoryId == c.id, () => setState(() => _categoryId = c.id)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _chip(BuildContext context, String label, bool selected, VoidCallback onTap) => Padding(
        padding: const EdgeInsets.only(right: 8),
        child: ChoiceChip(
          label: Text(label),
          selected: selected,
          labelStyle: TextStyle(color: selected ? context.colors.onPrimary : null),
          onSelected: (_) => onTap(),
        ),
      );
}
