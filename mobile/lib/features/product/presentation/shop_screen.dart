import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/category_model.dart';
import '../../../core/providers/app_providers.dart';
import '../../../shared/widgets/app_bottom_nav.dart';
import '../../../shared/widgets/state_views.dart';
import '../../category/presentation/category_screen.dart';
import '../../category/viewmodels/category_viewmodel.dart';

/// Shop tab — the same page a category opened from Home shows: search, main
/// categories, sub-category image cards, then products. Opens on
/// `?category=<slug|id>`, otherwise on the first active main category in the
/// admin's order; picking another category switches in place.
class ShopScreen extends ConsumerStatefulWidget {
  const ShopScreen({super.key, this.initialCategory});

  /// Category slug or id from the URL (/categories?category=earrings).
  final String? initialCategory;

  @override
  ConsumerState<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends ConsumerState<ShopScreen> {
  String? _slug;

  @override
  void didUpdateWidget(ShopScreen old) {
    super.didUpdateWidget(old);
    // A new ?category= in the URL wins over the in-place selection.
    if (old.initialCategory != widget.initialCategory) _slug = null;
  }

  Scaffold _shell(Widget body) => Scaffold(
        appBar: AppBar(leading: const HomeBackButton(), title: const Text('Shop')),
        body: body,
      );

  @override
  Widget build(BuildContext context) {
    final tree = ref.watch(categoryTreeProvider);
    return tree.when(
      loading: () => _shell(const LoadingView()),
      error: (e, _) => _shell(ErrorState(error: e, onRetry: () => ref.invalidate(categoryTreeProvider))),
      data: (nodes) {
        final roots = [...nodes.where((c) => c.isActive)]
          ..sort((a, b) {
            final bySort = a.sortOrder.compareTo(b.sortOrder);
            return bySort != 0 ? bySort : a.name.compareTo(b.name);
          });
        final wanted = widget.initialCategory;
        final fromUrl = (wanted == null || wanted.isEmpty)
            ? null
            : findCategory(nodes, (CategoryModel c) => c.slug == wanted || c.id == wanted)?.slug;
        final slug = _slug ?? fromUrl ?? (roots.isEmpty ? null : roots.first.slug);
        if (slug == null) {
          return _shell(const EmptyState(
            icon: Icons.diamond_outlined,
            title: 'Collections coming soon',
            message: "We're curating something beautiful. Please check back shortly.",
          ));
        }
        return CategoryScreen(
          key: ValueKey(slug),
          slug: slug,
          title: 'Shop',
          leading: const HomeBackButton(),
          onSelectCategory: (s) => setState(() => _slug = s),
        );
      },
    );
  }
}
