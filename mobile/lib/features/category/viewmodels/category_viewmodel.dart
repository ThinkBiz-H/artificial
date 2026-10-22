import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/category_model.dart';
import '../../../core/models/content_models.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/providers/repository_providers.dart';

CategoryModel? findCategory(List<CategoryModel> nodes, bool Function(CategoryModel) test) {
  for (final node in nodes) {
    if (test(node)) return node;
    final hit = findCategory(node.children, test);
    if (hit != null) return hit;
  }
  return null;
}

/// Resolves a category (with children) from the cached tree, falling back
/// to GET /categories/:slug.
final categoryBySlugProvider =
    FutureProvider.autoDispose.family<CategoryModel, String>((ref, slug) async {
  try {
    final tree = await ref.watch(categoryTreeProvider.future);
    final hit = findCategory(tree, (c) => c.slug == slug || c.id == slug);
    if (hit != null) return hit;
  } catch (_) {}
  return ref.watch(catalogRepositoryProvider).categoryBySlug(slug);
});

/// GET /category-banners/by-category/:categoryId
final categoryBannerProvider = FutureProvider.autoDispose
    .family<CategoryBannerModel?, String>(
        (ref, categoryId) => ref.watch(catalogRepositoryProvider).categoryBanner(categoryId));
