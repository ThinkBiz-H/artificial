import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/product_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';

/// Signed-in: GET /products/me/recently-viewed (synced with the website).
/// Guest or offline: the device-local history.
final recentlyViewedProvider = FutureProvider.autoDispose<List<ProductModel>>((ref) async {
  final repo = ref.watch(catalogRepositoryProvider);
  final authenticated = ref.watch(isAuthenticatedProvider);
  if (authenticated) {
    try {
      final remote = await repo.recentlyViewedRemote();
      if (remote.isNotEmpty) return remote;
    } catch (_) {}
  }
  return repo.recentlyViewedLocal();
});
