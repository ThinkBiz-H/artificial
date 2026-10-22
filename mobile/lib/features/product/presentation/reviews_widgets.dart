import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/product_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/buttons.dart';
import '../../../shared/widgets/dialogs.dart';
import '../../../shared/widgets/rating_badge.dart';
import '../../../shared/widgets/state_views.dart';
import '../viewmodels/product_detail_viewmodel.dart';

class RatingSummary extends StatelessWidget {
  const RatingSummary({super.key, required this.reviews});
  final ProductReviews reviews;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Column(
          children: [
            Text(reviews.rating.toStringAsFixed(1), style: context.text.displayMedium),
            StarRow(rating: reviews.rating),
            const SizedBox(height: 4),
            Text('${reviews.numReviews} reviews', style: context.text.bodySmall),
          ],
        ),
        const SizedBox(width: AppSpacing.lg),
        Expanded(
          child: Column(
            children: reviews.distribution
                .map((b) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          SizedBox(width: 14, child: Text('${b.star}', style: context.text.bodySmall)),
                          const Icon(Icons.star_rounded, size: 12, color: AppColors.gold),
                          const SizedBox(width: 6),
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: b.percentage / 100,
                                minHeight: 6,
                                backgroundColor: context.colors.outline,
                                color: b.star >= 3 ? AppColors.success : AppColors.warning,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          SizedBox(
                              width: 28,
                              child: Text('${b.count}',
                                  style: context.text.bodySmall, textAlign: TextAlign.right)),
                        ],
                      ),
                    ))
                .toList(),
          ),
        ),
      ],
    );
  }
}

class ReviewTile extends ConsumerWidget {
  const ReviewTile({super.key, required this.review, required this.productId});
  final ReviewModel review;
  final String productId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(currentUserProvider);
    final mine = me != null && me.id == review.userId;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.roseGoldLight,
                child: review.userImage.isEmpty
                    ? Text(review.userName.isEmpty ? 'C' : review.userName[0].toUpperCase(),
                        style: const TextStyle(color: AppColors.wine, fontWeight: FontWeight.w600))
                    : ClipOval(child: AppNetworkImage(url: review.userImage, targetWidth: 64)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(review.userName, style: context.text.titleSmall),
                    Row(
                      children: [
                        StarRow(rating: review.rating, size: 13),
                        const SizedBox(width: 6),
                        Text(Formatters.date(review.createdAt), style: context.text.bodySmall),
                      ],
                    ),
                  ],
                ),
              ),
              if (review.isVerifiedPurchase)
                const Tooltip(
                  message: 'Verified purchase',
                  child: Icon(Icons.verified_rounded, size: 18, color: AppColors.success),
                ),
              if (mine)
                PopupMenuButton<String>(
                  onSelected: (v) async {
                    if (v == 'edit') {
                      await showReviewForm(context, productId: productId, existing: review);
                    } else {
                      final ok = await showConfirmDialog(context,
                          title: 'Delete review?',
                          message: 'This cannot be undone.',
                          confirmLabel: 'Delete',
                          destructive: true);
                      if (!ok) return;
                      try {
                        await ref.read(reviewRepositoryProvider).deleteReview(
                            productId: productId, reviewId: review.id);
                        ref.invalidate(productReviewsProvider(productId));
                        if (context.mounted) context.showSnack('Review deleted');
                      } catch (e) {
                        if (context.mounted) context.showError(e);
                      }
                    }
                  },
                  itemBuilder: (_) => const [
                    PopupMenuItem(value: 'edit', child: Text('Edit')),
                    PopupMenuItem(value: 'delete', child: Text('Delete')),
                  ],
                ),
            ],
          ),
          if (review.comment.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(review.comment, style: context.text.bodyMedium),
          ],
        ],
      ),
    );
  }
}

/// PDP block: summary + three latest reviews + actions.
class ReviewsSection extends ConsumerWidget {
  const ReviewsSection({super.key, required this.product});
  final ProductModel product;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(productReviewsProvider(product.id));
    return async.when(
      loading: () => const Padding(padding: EdgeInsets.all(AppSpacing.lg), child: LinearProgressIndicator()),
      error: (e, _) => ErrorState(
          error: e, compact: true, onRetry: () => ref.invalidate(productReviewsProvider(product.id))),
      data: (r) {
        final latest = [...r.reviews]
          ..sort((a, b) => (b.createdAt ?? DateTime(2000)).compareTo(a.createdAt ?? DateTime(2000)));
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (r.numReviews > 0) RatingSummary(reviews: r) else
              Text('No reviews yet. Bought this piece? Share your thoughts.',
                  style: context.text.bodySmall),
            ...latest.take(3).map((rev) => ReviewTile(review: rev, productId: product.id)),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                if (r.numReviews > 3)
                  Expanded(
                    child: TextButton(
                      onPressed: () => context.push(RoutePaths.reviews(product.id)),
                      child: Text('SEE ALL ${r.numReviews} REVIEWS'),
                    ),
                  ),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.rate_review_outlined, size: 18),
                    label: const Text('WRITE A REVIEW'),
                    onPressed: () => showReviewForm(context, productId: product.id),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}

/// Add/edit review. Backend only accepts reviews for Delivered orders and
/// returns a 403 with a clear message otherwise.
Future<void> showReviewForm(BuildContext context, {required String productId, ReviewModel? existing}) {
  final container = ProviderScope.containerOf(context);
  if (!container.read(isAuthenticatedProvider)) {
    context.push(RoutePaths.loginWithRedirect(GoRouterState.of(context).uri.toString()));
    return Future.value();
  }
  return showAppSheet<void>(
    context,
    title: existing == null ? 'Write a review' : 'Edit your review',
    builder: (_) => _ReviewForm(productId: productId, existing: existing),
  );
}

class _ReviewForm extends ConsumerStatefulWidget {
  const _ReviewForm({required this.productId, this.existing});
  final String productId;
  final ReviewModel? existing;

  @override
  ConsumerState<_ReviewForm> createState() => _ReviewFormState();
}

class _ReviewFormState extends ConsumerState<_ReviewForm> {
  late int _rating = widget.existing?.rating.round() ?? 0;
  late final TextEditingController _comment =
      TextEditingController(text: widget.existing?.comment ?? '');
  bool _saving = false;

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_rating == 0) {
      context.showSnack('Please choose a star rating', error: true);
      return;
    }
    setState(() => _saving = true);
    try {
      final repo = ref.read(reviewRepositoryProvider);
      if (widget.existing == null) {
        await repo.addReview(productId: widget.productId, rating: _rating, comment: _comment.text);
      } else {
        await repo.editReview(
            productId: widget.productId,
            reviewId: widget.existing!.id,
            rating: _rating,
            comment: _comment.text);
      }
      ref.invalidate(productReviewsProvider(widget.productId));
      if (!mounted) return;
      Navigator.of(context).pop();
      context.showSnack('Thank you for your review');
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        context.showError(e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (i) {
              final filled = i < _rating;
              return IconButton(
                iconSize: 38,
                onPressed: () => setState(() => _rating = i + 1),
                icon: Icon(filled ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: AppColors.gold),
              );
            }),
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _comment,
            maxLines: 4,
            maxLength: 1000,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              hintText: 'How did you like the piece? Finish, comfort, packaging…',
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          PrimaryButton(label: 'Submit review', loading: _saving, onPressed: _save),
        ],
      ),
    );
  }
}

/// /reviews/:productId — all reviews.
class ReviewsScreen extends ConsumerWidget {
  const ReviewsScreen({super.key, required this.productId});
  final String productId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(productReviewsProvider(productId));
    return Scaffold(
      appBar: AppBar(title: const Text('Ratings & Reviews')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showReviewForm(context, productId: productId),
        icon: const Icon(Icons.rate_review_outlined),
        label: const Text('Write a review'),
      ),
      body: async.when(
        loading: () => const LoadingView(),
        error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(productReviewsProvider(productId))),
        data: (r) => r.reviews.isEmpty
            ? const EmptyState(icon: Icons.reviews_outlined, title: 'No reviews yet')
            : ListView(
                padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.md, 96),
                children: [
                  RatingSummary(reviews: r),
                  const Divider(height: AppSpacing.xxl),
                  ...([...r.reviews]
                        ..sort((a, b) =>
                            (b.createdAt ?? DateTime(2000)).compareTo(a.createdAt ?? DateTime(2000))))
                      .map((rev) => ReviewTile(review: rev, productId: productId)),
                ],
              ),
      ),
    );
  }
}
