import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/cart_model.dart';
import '../../../core/models/common_models.dart';
import '../../../core/models/product_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/repositories/catalog_repository.dart';

/// GET /products/:slug (with variants & reviews populated). Also records
/// the view locally and, when signed in, on the server.
final productDetailProvider =
    FutureProvider.autoDispose.family<ProductModel, String>((ref, slug) async {
  final repo = ref.watch(catalogRepositoryProvider);
  final product = await repo.productBySlug(slug);
  await repo.rememberViewed(product);
  if (ref.read(isAuthenticatedProvider)) {
    await repo.trackView(product.id);
  }
  return product;
});

final relatedProductsProvider = FutureProvider.autoDispose
    .family<List<ProductModel>, String>((ref, productId) => ref.watch(catalogRepositoryProvider).related(productId));

/// "Best Sellers" rail on the product page (same list as the homepage rail).
final pdpBestSellersProvider = FutureProvider.autoDispose<List<ProductModel>>(
    (ref) => ref.watch(catalogRepositoryProvider).rail(ProductRail.bestSellers, limit: 8));

final productReviewsProvider = FutureProvider.autoDispose
    .family<ProductReviews, String>((ref, productId) => ref.watch(reviewRepositoryProvider).reviews(productId));

/// Pincode serviceability / delivery estimate for the PDP.
final pincodeQuoteProvider = FutureProvider.autoDispose
    .family<ShippingQuote, ({String pincode, double amount})>((ref, args) => ref
        .watch(shippingRepositoryProvider)
        .quote(pincode: args.pincode, subTotal: args.amount));

/// Colour / size / other-attribute selection — the website's product page
/// logic (ProductDetailsPage.tsx): colour swatches and sizes come from the
/// active variants (or the product's own options for simple products), and
/// any other variant attribute gets its own selector.
class ProductOptions {
  ProductOptions._(this.product, this.selected, this.activeVariants, this.colorChoices,
      this.sizeChoices, this.otherKeys, this.otherOptions);

  factory ProductOptions.initial(ProductModel product) {
    final active = product.activeVariants;
    final usesVariants = product.hasVariants && active.isNotEmpty;

    final colors = <ColorOptionModel>[];
    final sizes = <String>[];
    final otherKeys = <String>[];
    final otherOptions = <String, List<String>>{};
    if (usesVariants) {
      for (final v in active) {
        final name = v.optionColor;
        if (name.isNotEmpty && !colors.any((c) => sameOption(c.name, name))) {
          final option = product.findColorOption(name);
          String? hex;
          for (final w in active) {
            if (sameOption(w.optionColor, name) && (w.colorHex ?? '').isNotEmpty) {
              hex = w.colorHex;
              break;
            }
          }
          colors.add(ColorOptionModel(name: name, hex: hex ?? option?.hex, images: option?.images ?? const <ImageModel>[]));
        }
        final size = v.optionSize;
        if (size.isNotEmpty && !sizes.any((s) => sameOption(s, size))) sizes.add(size);
        for (final a in v.attributes) {
          if (_isColorOrSize(a.key)) continue;
          if (!otherKeys.contains(a.key)) otherKeys.add(a.key);
          final list = otherOptions.putIfAbsent(a.key, () => <String>[]);
          if (a.value.isNotEmpty && !list.contains(a.value)) list.add(a.value);
        }
      }
    } else {
      colors.addAll(product.productColorOptions);
      sizes.addAll(product.sizes.where((s) => s.trim().isNotEmpty));
    }

    // Preselect the default variant (or, for simple products, the first colour / the only size).
    final selected = <String, String>{};
    if (usesVariants) {
      VariantModel def = active.first;
      for (final v in active) {
        if (v.isDefault) {
          def = v;
          break;
        }
      }
      if (def.optionColor.isNotEmpty) selected['color'] = def.optionColor;
      if (def.optionSize.isNotEmpty) selected['size'] = def.optionSize;
      for (final a in def.attributes) {
        if (!_isColorOrSize(a.key)) selected[a.key] = a.value;
      }
    } else {
      if (colors.isNotEmpty) selected['color'] = colors.first.name;
      if (sizes.length == 1) selected['size'] = sizes.first;
    }
    return ProductOptions._(product, selected, active, colors, sizes, otherKeys, otherOptions);
  }

  final ProductModel product;
  final Map<String, String> selected;
  final List<VariantModel> activeVariants;
  final List<ColorOptionModel> colorChoices;
  final List<String> sizeChoices;
  final List<String> otherKeys;
  final Map<String, List<String>> otherOptions;

  static bool _isColorOrSize(String key) => const ['color', 'colour', 'size'].contains(key.trim().toLowerCase());

  bool get usesVariants => product.hasVariants && activeVariants.isNotEmpty;
  String? get color => selected['color'];
  String? get size => selected['size'];
  String? get colorHex {
    for (final c in colorChoices) {
      if (sameOption(c.name, color)) return c.hex;
    }
    return null;
  }

  ProductOptions _with(Map<String, String> next) =>
      ProductOptions._(product, next, activeVariants, colorChoices, sizeChoices, otherKeys, otherOptions);

  bool _otherKeysMatch(VariantModel v, {bool onlySelected = false}) => otherKeys.every((k) {
        final want = selected[k];
        if (onlySelected && (want == null || want.isEmpty)) return true;
        return v.attribute(k) == want;
      });

  /// Does an in-stock variant exist for this colour/size (others as currently selected)?
  bool inStock({String? color, String? size}) => activeVariants.any((v) =>
      v.stock > 0 &&
      (color == null || sameOption(v.optionColor, color)) &&
      (size == null || sameOption(v.optionSize, size)) &&
      _otherKeysMatch(v, onlySelected: true));

  VariantModel? get matchedVariant {
    if (!usesVariants) return null;
    if (colorChoices.isNotEmpty && (color ?? '').isEmpty) return null;
    if (sizeChoices.isNotEmpty && (size ?? '').isEmpty) return null;
    if (otherKeys.any((k) => (selected[k] ?? '').isEmpty)) return null;
    for (final v in activeVariants) {
      if ((colorChoices.isEmpty || sameOption(v.optionColor, color)) &&
          (sizeChoices.isEmpty || sameOption(v.optionSize, size)) &&
          _otherKeysMatch(v)) {
        return v;
      }
    }
    return null;
  }

  /// Picking a colour keeps the size when that combination exists, else jumps to an in-stock size.
  ProductOptions pickColor(String name) {
    final next = {...selected, 'color': name};
    final current = size;
    if (usesVariants &&
        sizeChoices.isNotEmpty &&
        current != null &&
        !activeVariants.any((v) => sameOption(v.optionColor, name) && sameOption(v.optionSize, current))) {
      String? fallback;
      for (final sz in sizeChoices) {
        if (inStock(color: name, size: sz)) {
          fallback = sz;
          break;
        }
      }
      if (fallback == null) {
        for (final sz in sizeChoices) {
          if (activeVariants.any((v) => sameOption(v.optionColor, name) && sameOption(v.optionSize, sz))) {
            fallback = sz;
            break;
          }
        }
      }
      if (fallback != null) next['size'] = fallback;
    }
    return _with(next);
  }

  ProductOptions pick(String key, String value) => _with({...selected, key: value});

  /// Gallery: variant image → colour gallery → any variant of that colour → product images.
  List<String> get images {
    List<String> urls(List<ImageModel> list) => list.where((i) => i.isValid).map((i) => i.url).toList();
    final variant = matchedVariant;
    if (variant != null && urls(variant.images).isNotEmpty) return urls(variant.images);
    for (final c in colorChoices) {
      if (sameOption(c.name, color) && urls(c.images).isNotEmpty) return urls(c.images);
    }
    for (final v in activeVariants) {
      if (sameOption(v.optionColor, color) && urls(v.images).isNotEmpty) return urls(v.images);
    }
    return product.gallery;
  }

  double get price => matchedVariant?.effectivePrice ?? product.effectivePrice;
  double get mrp => matchedVariant?.price ?? product.price;
  int get stock => usesVariants ? (matchedVariant?.stock ?? 0) : product.stock;
  bool get canAddToCart => usesVariants ? matchedVariant != null && stock > 0 : stock > 0;
  String get sku => (matchedVariant?.sku ?? '').isNotEmpty ? matchedVariant!.sku : product.sku;

  /// Simple (variant-less) products with several colours/sizes still need a choice.
  String? get missingChoice {
    if (usesVariants) return null;
    if (colorChoices.length > 1 && (color ?? '').isEmpty) return 'colour';
    if (sizeChoices.length > 1 && (size ?? '').isEmpty) return 'size';
    return null;
  }

  /// Why the shopper can't add to bag yet, or null when they can.
  String? get blocker {
    if (usesVariants && matchedVariant == null) return 'Please select all options';
    final missing = missingChoice;
    if (missing != null) return 'Please select a $missing';
    if (stock <= 0) return 'This option is out of stock';
    return null;
  }
}
