import '../network/api_client.dart';
import '../network/api_endpoints.dart';
import '../models/product_model.dart';

/// controllers/review.controller.js — reviews require a Delivered order.
class ReviewRepository {
  ReviewRepository(this._api);

  final ApiClient _api;

  Future<ProductReviews> reviews(String productId) async {
    final res = await _api.get(ApiEndpoints.reviews(productId), auth: false);
    return ProductReviews.fromJson(res.data);
  }

  Future<void> addReview({required String productId, required int rating, required String comment}) async {
    await _api.post(ApiEndpoints.reviews(productId),
        data: {'rating': rating, 'comment': comment.trim()});
  }

  Future<void> editReview({
    required String productId,
    required String reviewId,
    required int rating,
    required String comment,
  }) async {
    await _api.put(ApiEndpoints.review(productId, reviewId),
        data: {'rating': rating, 'comment': comment.trim()});
  }

  Future<void> deleteReview({required String productId, required String reviewId}) async {
    await _api.delete(ApiEndpoints.review(productId, reviewId));
  }
}
