import '../config/app_config.dart';
import '../network/api_client.dart';
import '../network/api_exception.dart';
import '../services/local_storage_service.dart';

/// Shared offline-first helper: successful GET payloads are cached; on a
/// network failure the last cached payload (≤ 7 days old) is served instead.
abstract class BaseRepository {
  BaseRepository(this.api, this.storage);

  final ApiClient api;
  final LocalStorageService storage;

  Future<T> cachedGet<T>({
    required String cacheKey,
    required Future<ApiResponse> Function() request,
    required T Function(Map<String, dynamic> data) parse,
  }) async {
    try {
      final res = await request();
      final parsed = parse(res.data);
      await storage.putCache(cacheKey, res.data);
      return parsed;
    } on AppException catch (e) {
      if (e.isNetwork) {
        final cached =
            storage.getCache(cacheKey, maxAge: AppConfig.offlineCacheMaxAge);
        if (cached is Map) {
          return parse(Map<String, dynamic>.from(cached));
        }
      }
      rethrow;
    }
  }
}
