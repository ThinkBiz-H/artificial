import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/product_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_bottom_nav.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import '../../../shared/widgets/price_tag.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../viewmodels/wishlist_viewmodel.dart';

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(wishlistProvider);
    final authenticated = ref.watch(isAuthenticatedProvider);
    return Scaffold(
      appBar: AppBar(leading: const HomeBackButton(), title: const Text('Wishlist'), actions: const [CartIconButton()]),
      body: RefreshIndicator(
        onRefresh: () => ref.read(wishlistProvider.notifier).refresh(),
        child: async.when(
          loading: () => const ListTileSkeleton(),
          error: (e, _) => ListView(children: [
            SizedBox(height: 500, child: ErrorState(error: e, onRetry: () => ref.invalidate(wishlistProvider))),
          ]),
          data: (state) {
            if (state.items.isEmpty) {
              return ListView(
                children: [
                  SizedBox(
                    height: MediaQuery.sizeOf(context).height * 0.7,
                    child: EmptyState(
                      icon: Icons.favorite_border_rounded,
                      title: 'Your wishlist is empty',
                      message: 'Tap the heart on any piece to save it for later.',
                      actionLabel: 'Discover jewellery',
                      onAction: () => context.go(RoutePaths.home),
                    ),
                  ),
                ],
              );
            }
            return ListView(
              padding: const EdgeInsets.all(AppSpacing.md),
              children: [
                if (!authenticated)
                  _GuestHint(onLogin: () => context.push(RoutePaths.loginWithRedirect(RoutePaths.wishlist))),
                ...state.items.map((p) => _WishlistTile(product: p)),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _GuestHint extends StatelessWidget {
  const _GuestHint({required this.onLogin});
  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.champagne.withValues(alpha: context.isDark ? 0.1 : 0.7),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        children: [
          const Icon(Icons.cloud_sync_outlined, color: AppColors.wine),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text('Login to save your wishlist across devices and our website.',
                style: context.text.bodySmall),
          ),
          TextButton(onPressed: onLogin, child: const Text('LOGIN')),
        ],
      ),
    );
  }
}

class _WishlistTile extends ConsumerStatefulWidget {
  const _WishlistTile({required this.product});
  final ProductModel product;

  @override
  ConsumerState<_WishlistTile> createState() => _WishlistTileState();
}

class _WishlistTileState extends ConsumerState<_WishlistTile> {
  bool _busy = false;

  Future<void> _moveToCart() async {
    final p = widget.product;
    if (p.hasVariants || p.colors.length > 1 || p.sizes.length > 1) {
      context.push(RoutePaths.product(p.slug));
      return;
    }
    setState(() => _busy = true);
    try {
      await ref.read(wishlistProvider.notifier).moveToCart(p);
      if (mounted) context.showSnack('Moved to your bag');
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<bool> _remove() async {
    try {
      await ref.read(wishlistProvider.notifier).remove(widget.product);
      return true;
    } catch (e) {
      if (mounted) context.showError(e);
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final needsOptions = p.hasVariants || p.colors.length > 1 || p.sizes.length > 1;
    return Dismissible(
      key: ValueKey(p.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        color: AppColors.error.withValues(alpha: 0.12),
        child: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
      ),
      confirmDismiss: (_) => _remove(),
      child: Card(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: InkWell(
          borderRadius: AppRadius.card,
          onTap: () => context.push(RoutePaths.product(p.slug)),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.sm),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 92,
                  height: 110,
                  child: AppNetworkImage(
                    url: p.primaryImage,
                    targetWidth: 200,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(p.title,
                                maxLines: 2, overflow: TextOverflow.ellipsis, style: context.text.titleSmall),
                          ),
                          InkResponse(
                            onTap: _remove,
                            child: const Padding(
                              padding: EdgeInsets.all(4),
                              child: Icon(Icons.close_rounded, size: 18),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      PriceTag(price: p.hasVariants ? p.displayPrice : p.effectivePrice, mrp: p.hasVariants ? null : p.price, size: 14),
                      const SizedBox(height: 10),
                      if (!p.inStock && !p.hasVariants)
                        Text('Out of stock',
                            style: context.text.labelMedium?.copyWith(color: AppColors.error))
                      else
                        SizedBox(
                          height: 38,
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                            onPressed: _busy ? null : _moveToCart,
                            child: _busy
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                : Text(needsOptions ? 'SELECT OPTIONS' : 'MOVE TO BAG'),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
