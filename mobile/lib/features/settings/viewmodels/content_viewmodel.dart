import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/content_models.dart';
import '../../../core/models/user_model.dart';
import '../../../core/providers/repository_providers.dart';

final faqsProvider = FutureProvider.autoDispose<List<FaqModel>>(
    (ref) => ref.watch(contentRepositoryProvider).faqs());

final pagesProvider = FutureProvider<List<PageModel>>(
    (ref) => ref.watch(contentRepositoryProvider).pages());

/// Friendly keys used by the app → candidate CMS slugs / title keywords.
const Map<String, List<String>> _pageAliases = {
  'about': ['about-us', 'about', 'our-story'],
  'privacy': ['privacy-policy', 'privacy'],
  'terms': ['terms-and-conditions', 'terms-conditions', 'terms-of-service', 'terms'],
  'shipping': ['shipping-policy', 'shipping', 'shipping-and-delivery'],
  'refund': ['refund-policy', 'return-policy', 'returns-and-refunds', 'cancellation-and-refund', 'refund'],
};

/// Resolves a page by friendly key or slug against the published pages,
/// then loads it with GET /pages/:slug.
final pageProvider = FutureProvider.autoDispose.family<PageModel, String>((ref, key) async {
  final repo = ref.watch(contentRepositoryProvider);
  final candidates = _pageAliases[key] ?? [key];
  try {
    final pages = await ref.watch(pagesProvider.future);
    for (final slug in candidates) {
      for (final p in pages) {
        if (p.slug == slug) return repo.page(p.slug);
      }
    }
    final keyword = candidates.last.split('-').first;
    for (final p in pages) {
      if (p.slug.contains(keyword) || p.title.toLowerCase().contains(keyword)) {
        return repo.page(p.slug);
      }
    }
  } catch (_) {}
  return repo.page(candidates.first);
});

final sessionsProvider = FutureProvider.autoDispose<List<SessionInfo>>(
    (ref) => ref.watch(authRepositoryProvider).sessions());
