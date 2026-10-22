import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/product_query.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/dialogs.dart';
import '../viewmodels/product_list_viewmodel.dart';

Future<ProductSort?> showSortSheet(BuildContext context, ProductSort current) {
  return showAppSheet<ProductSort>(
    context,
    title: 'Sort by',
    builder: (ctx) => ListView(
      shrinkWrap: true,
      padding: const EdgeInsets.only(bottom: AppSpacing.lg),
      children: ProductSort.values
          .map((s) => ListTile(
                title: Text(s.label),
                trailing: s == current
                    ? Icon(Icons.check_rounded, color: ctx.colors.primary)
                    : null,
                onTap: () => Navigator.of(ctx).pop(s),
              ))
          .toList(),
    ),
  );
}

Future<ProductQuery?> showFilterSheet(
  BuildContext context, {
  required ProductQuery query,
  required List<String> colors,
  required List<String> sizes,
}) {
  return showAppSheet<ProductQuery>(
    context,
    title: 'Filters',
    expand: true,
    builder: (_) => _FilterBody(query: query, colors: colors, sizes: sizes),
  );
}

/// Website price presets (components/catalog/catalogParams.ts PRICE_RANGES).
const _priceRanges = <(String, double?, double?)>[
  ('Under ₹500', null, 500),
  ('₹500 – ₹1,000', 500, 1000),
  ('₹1,000 – ₹2,000', 1000, 2000),
  ('₹2,000 – ₹5,000', 2000, 5000),
  ('Above ₹5,000', 5000, null),
];

class _FilterBody extends ConsumerStatefulWidget {
  const _FilterBody({required this.query, required this.colors, required this.sizes});
  final ProductQuery query;
  final List<String> colors;
  final List<String> sizes;

  @override
  ConsumerState<_FilterBody> createState() => _FilterBodyState();
}

class _FilterBodyState extends ConsumerState<_FilterBody> {
  late ProductQuery _q = widget.query;
  late final _min = TextEditingController(text: widget.query.minPrice?.round().toString() ?? '');
  late final _max = TextEditingController(text: widget.query.maxPrice?.round().toString() ?? '');

  @override
  void dispose() {
    _min.dispose();
    _max.dispose();
    super.dispose();
  }

  void _setPrice(double? min, double? max) {
    _min.text = min?.round().toString() ?? '';
    _max.text = max?.round().toString() ?? '';
    setState(() => _q = _q.copyWith(minPrice: min, maxPrice: max));
  }

  /// Reads the typed min/max (the website's "₹ Min / ₹ Max" fields).
  ProductQuery _withTypedPrice() {
    final min = double.tryParse(_min.text.trim());
    final max = double.tryParse(_max.text.trim());
    return _q.copyWith(minPrice: min != null && min > 0 ? min : null, maxPrice: max != null && max > 0 ? max : null);
  }

  Widget _title(String t) => Padding(
        padding: const EdgeInsets.fromLTRB(0, AppSpacing.lg, 0, AppSpacing.xs),
        child: Text(t.toUpperCase(),
            style: context.text.labelMedium?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 1.9)),
      );

  Widget _chip(String label, bool selected, VoidCallback onTap) => ChoiceChip(
        label: Text(label),
        selected: selected,
        labelStyle: TextStyle(color: selected ? context.colors.onPrimary : null),
        onSelected: (_) => setState(onTap),
      );

  Widget _chips(List<String> options, String? selected, ValueChanged<String?> onSelect) => Wrap(
        spacing: 8,
        runSpacing: 8,
        children: options.map((o) => _chip(o, o == selected, () => onSelect(o == selected ? null : o))).toList(),
      );

  Widget _check(String label, bool value, ValueChanged<bool> onChanged) => CheckboxListTile(
        contentPadding: EdgeInsets.zero,
        dense: true,
        controlAffinity: ListTileControlAffinity.leading,
        title: Text(label, style: context.text.bodyMedium),
        value: value,
        onChanged: (v) => setState(() => onChanged(v ?? false)),
      );

  @override
  Widget build(BuildContext context) {
    final brands = ref.watch(brandsProvider).valueOrNull ?? const [];
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Flexible(
          child: ListView(
            shrinkWrap: true,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            children: [
              _title('Price'),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _priceRanges
                    .map((r) => _chip(r.$1, _q.minPrice == r.$2 && _q.maxPrice == r.$3, () {
                          final active = _q.minPrice == r.$2 && _q.maxPrice == r.$3;
                          active ? _setPrice(null, null) : _setPrice(r.$2, r.$3);
                        }))
                    .toList(),
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _min,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(hintText: '₹ Min', isDense: true),
                    ),
                  ),
                  const Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Text('–')),
                  Expanded(
                    child: TextField(
                      controller: _max,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(hintText: '₹ Max', isDense: true),
                    ),
                  ),
                ],
              ),
              _title('Availability'),
              _check('In stock only', _q.inStockOnly, (v) => _q = _q.copyWith(inStockOnly: v)),
              _check('On sale', _q.onSale, (v) => _q = _q.copyWith(onSale: v)),
              _title('Rating'),
              Wrap(
                spacing: 8,
                children: [4, 3]
                    .map((r) => ChoiceChip(
                          selected: _q.minRating == r,
                          onSelected: (_) => setState(() => _q = _q.copyWith(minRating: _q.minRating == r ? null : r)),
                          label: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('$r', style: TextStyle(color: _q.minRating == r ? context.colors.onPrimary : null)),
                              const SizedBox(width: 3),
                              const Icon(Icons.star_rounded, size: 14, color: AppColors.roseGoldSoft),
                              Text(' & above', style: TextStyle(color: _q.minRating == r ? context.colors.onPrimary : null)),
                            ],
                          ),
                        ))
                    .toList(),
              ),
              if (widget.colors.isNotEmpty) ...[
                _title('Colour'),
                _chips(widget.colors, _q.color, (v) => _q = _q.copyWith(color: v)),
              ],
              if (widget.sizes.isNotEmpty) ...[
                _title('Size'),
                _chips(widget.sizes, _q.size, (v) => _q = _q.copyWith(size: v)),
              ],
              if (brands.length > 1) ...[
                _title('Brand'),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: brands
                      .map((b) => _chip(b.name, _q.brandId == b.id,
                          () => _q = _q.copyWith(brandId: _q.brandId == b.id ? null : b.id)))
                      .toList(),
                ),
              ],
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(widget.query.clearFilters()),
                    child: const Text('CLEAR ALL'),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(_withTypedPrice()),
                    child: const Text('APPLY'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
