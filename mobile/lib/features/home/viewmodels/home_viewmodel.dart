import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/content_models.dart';
import '../../../core/models/home_models.dart';
import '../../../core/models/product_model.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/repositories/catalog_repository.dart';

class HomeData {
  const HomeData({
    required this.sections,
    required this.announcements,
    required this.featured,
    required this.newArrivals,
    required this.bestSellers,
    required this.trending,
    required this.topRated,
  });

  final List<HomeSectionModel> sections;
  final List<AnnouncementModel> announcements;
  final List<ProductModel> featured;
  final List<ProductModel> newArrivals;
  final List<ProductModel> bestSellers;
  final List<ProductModel> trending;
  final List<ProductModel> topRated;

  bool get isEmpty =>
      sections.isEmpty &&
      featured.isEmpty &&
      newArrivals.isEmpty &&
      bestSellers.isEmpty &&
      trending.isEmpty &&
      topRated.isEmpty;

  List<ProductModel> rail(ProductRail rail) => switch (rail) {
        ProductRail.featured => featured,
        ProductRail.newArrivals => newArrivals,
        ProductRail.bestSellers => bestSellers,
        ProductRail.trending => trending,
        ProductRail.topRated => topRated,
      };
}

/// Loads every home block in parallel. One failing block never breaks the
/// page; the page errors only if nothing at all could be loaded.
final homeProvider = FutureProvider<HomeData>((ref) async {
  final content = ref.watch(contentRepositoryProvider);
  final catalog = ref.watch(catalogRepositoryProvider);
  Object? firstError;

  Future<List<T>> safe<T>(Future<List<T>> future) async {
    try {
      return await future;
    } catch (e) {
      firstError ??= e;
      return <T>[];
    }
  }

  final results = await Future.wait<List<dynamic>>([
    safe(content.homeSections()),
    safe(content.announcements()),
    safe(catalog.rail(ProductRail.featured)),
    safe(catalog.rail(ProductRail.newArrivals)),
    safe(catalog.rail(ProductRail.bestSellers)),
    safe(catalog.rail(ProductRail.trending)),
    safe(catalog.rail(ProductRail.topRated)),
  ]);

  final data = HomeData(
    sections: (results[0] as List<HomeSectionModel>)..sort((a, b) => a.sortOrder.compareTo(b.sortOrder)),
    announcements: results[1] as List<AnnouncementModel>,
    featured: results[2] as List<ProductModel>,
    newArrivals: results[3] as List<ProductModel>,
    bestSellers: results[4] as List<ProductModel>,
    trending: results[5] as List<ProductModel>,
    topRated: results[6] as List<ProductModel>,
  );

  if (data.isEmpty && firstError != null) {
    throw AppException.from(firstError!);
  }
  return data;
});
