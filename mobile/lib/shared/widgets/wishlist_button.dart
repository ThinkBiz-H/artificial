import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/product_model.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/extensions.dart';
import '../../features/wishlist/viewmodels/wishlist_viewmodel.dart';

class WishlistButton extends ConsumerStatefulWidget {
  const WishlistButton({super.key, required this.product, this.size = 20, this.filledBackground = true});

  final ProductModel product;
  final double size;
  final bool filledBackground;

  @override
  ConsumerState<WishlistButton> createState() => _WishlistButtonState();
}

class _WishlistButtonState extends ConsumerState<WishlistButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 260),
    lowerBound: 0.8,
    upperBound: 1.0,
    value: 1.0,
  );
  bool _busy = false;

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_busy) return;
    setState(() => _busy = true);
    HapticFeedback.lightImpact();
    await _pulse.reverse();
    _pulse.forward();
    try {
      final added = await ref.read(wishlistProvider.notifier).toggle(widget.product);
      if (mounted) context.showSnack(added ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final active = ref.watch(isWishlistedProvider(widget.product.id));
    final icon = ScaleTransition(
      scale: _pulse,
      child: Icon(
        active ? Icons.favorite_rounded : Icons.favorite_border_rounded,
        size: widget.size,
        color: active ? AppColors.wine : context.colors.onSurface.withValues(alpha: 0.75),
      ),
    );
    return Semantics(
      button: true,
      label: active ? 'Remove from wishlist' : 'Add to wishlist',
      child: InkResponse(
        onTap: _toggle,
        radius: widget.size + 4,
        child: widget.filledBackground
            ? Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: context.colors.surface.withValues(alpha: 0.92),
                  shape: BoxShape.circle,
                  boxShadow: const [BoxShadow(color: Color(0x14000000), blurRadius: 6)],
                ),
                child: icon,
              )
            : Padding(padding: const EdgeInsets.all(8), child: icon),
      ),
    );
  }
}
