import 'package:flutter_test/flutter_test.dart';
import 'package:swastikala/core/models/cart_model.dart';
import 'package:swastikala/core/models/common_models.dart';
import 'package:swastikala/core/models/product_model.dart';
import 'package:swastikala/features/product/viewmodels/product_detail_viewmodel.dart';

VariantModel _v(String id, String color, String size, int stock, {bool isDefault = false, String? image}) => VariantModel(
      id: id,
      color: color,
      colorHex: color == 'Gold' ? '#d4af37' : '#c0c0c0',
      size: size,
      price: 1000,
      salePrice: 900,
      stock: stock,
      isDefault: isDefault,
      images: image == null ? const <ImageModel>[] : [ImageModel(url: image)],
    );

void main() {
  final product = ProductModel(
    id: 'p1',
    slug: 'ring',
    title: 'Ring',
    price: 1200,
    hasVariants: true,
    images: const [ImageModel(url: 'base.jpg')],
    colorOptions: const [
      ColorOptionModel(name: 'Gold', hex: '#d4af37', images: [ImageModel(url: 'gold.jpg')]),
      ColorOptionModel(name: 'Silver', hex: '#c0c0c0'),
    ],
    metal: 'Brass',
    plating: '18K Gold',
    variants: [
      _v('g6', 'Gold', '6', 3, isDefault: true),
      _v('g7', 'Gold', '7', 0),
      _v('s7', 'Silver', '7', 5, image: 'silver-7.jpg'),
    ],
  );

  group('ProductOptions mirrors the website product page', () {
    test('preselects the default variant and lists colours/sizes from variants', () {
      final o = ProductOptions.initial(product);
      expect(o.colorChoices.map((c) => c.name), ['Gold', 'Silver']);
      expect(o.sizeChoices, ['6', '7']);
      expect(o.color, 'Gold');
      expect(o.size, '6');
      expect(o.matchedVariant?.id, 'g6');
      expect(o.price, 900);
      expect(o.mrp, 1000);
      expect(o.canAddToCart, isTrue);
      expect(o.images, ['gold.jpg']); // colour gallery when the variant has no images
    });

    test('picking a colour without the current size jumps to an in-stock size', () {
      final o = ProductOptions.initial(product).pickColor('Silver');
      expect(o.size, '7');
      expect(o.matchedVariant?.id, 's7');
      expect(o.images, ['silver-7.jpg']);
    });

    test('out-of-stock combinations are reported and block add to bag', () {
      final o = ProductOptions.initial(product).pick('size', '7');
      expect(o.matchedVariant?.id, 'g7');
      expect(o.inStock(color: 'Gold', size: '7'), isFalse);
      expect(o.canAddToCart, isFalse);
      expect(o.blocker, isNotNull);
    });

    test('simple products with several colours need a choice', () {
      const simple = ProductModel(id: 'p2', stock: 4, colors: ['Red', 'Blue']);
      final o = ProductOptions.initial(simple);
      expect(o.color, 'Red'); // first colour preselected, as on the website
      expect(o.usesVariants, isFalse);
      expect(o.canAddToCart, isTrue);
    });
  });

  test('cart line options fall back to the product for metal and plating', () {
    final line = CartItemModel(product: product, color: 'Gold', size: '6');
    final parts = line.options.parts;
    expect(parts.map((p) => p.label), ['Color', 'Size', 'Metal', 'Plating']);
    expect(parts.first.hex, '#d4af37');
    expect(line.options.label, 'Color: Gold · Size: 6 · Metal: Brass · Plating: 18K Gold');
  });

  test('server cart lines are identified by lineId', () {
    final line = CartItemModel.fromJson({
      'lineId': 'abc',
      'product': {'_id': 'p1', 'title': 'Ring'},
      'quantity': 2,
      'price': 900,
      'image': 'line.jpg',
    });
    expect(line.key, 'abc');
    expect(line.image, 'line.jpg');
  });
}
