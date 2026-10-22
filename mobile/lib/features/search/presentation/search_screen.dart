import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category_model.dart';
import '../../../core/models/product_query.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/debouncer.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/product_grid.dart';
import '../../../shared/widgets/section_header.dart';
import '../../product/presentation/product_listing_view.dart';
import '../../product/viewmodels/product_list_viewmodel.dart';
import '../viewmodels/search_viewmodel.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key, this.initialQuery});
  final String? initialQuery;

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  late final TextEditingController _controller = TextEditingController(text: widget.initialQuery ?? '');
  final Debouncer _debouncer = Debouncer(delay: const Duration(milliseconds: 450));
  String _term = '';

  @override
  void initState() {
    super.initState();
    _term = (widget.initialQuery ?? '').trim();
  }

  @override
  void dispose() {
    _controller.dispose();
    _debouncer.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debouncer.run(() {
      if (!mounted) return;
      final next = value.trim();
      setState(() => _term = next.length >= 2 ? next : '');
    });
  }

  void _submit(String value) {
    final term = value.trim();
    if (term.isEmpty) return;
    _debouncer.cancel();
    ref.read(recentSearchesProvider.notifier).add(term);
    setState(() => _term = term);
    context.hideKeyboard();
  }

  void _useTerm(String term) {
    _controller.text = term;
    _controller.selection = TextSelection.collapsed(offset: term.length);
    _submit(term);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: TextField(
          controller: _controller,
          autofocus: widget.initialQuery == null,
          textInputAction: TextInputAction.search,
          onChanged: _onChanged,
          onSubmitted: _submit,
          decoration: InputDecoration(
            hintText: 'Search jewellery',
            filled: false,
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            suffixIcon: ValueListenableBuilder<TextEditingValue>(
              valueListenable: _controller,
              builder: (_, v, __) => v.text.isEmpty
                  ? const SizedBox.shrink()
                  : IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () {
                        _controller.clear();
                        setState(() => _term = '');
                      },
                    ),
            ),
          ),
        ),
      ),
      body: _term.isEmpty
          ? const _SearchSuggestions()
          : ProductListingView(
              key: ValueKey(_term),
              initialQuery: ProductQuery(keyword: _term),
              emptyTitle: 'No results for “$_term”',
              emptyMessage: 'Check the spelling or try a broader term like “necklace”.',
            ),
    );
  }
}

class _SearchSuggestions extends ConsumerWidget {
  const _SearchSuggestions();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recent = ref.watch(recentSearchesProvider);
    final categories = ref.watch(categoryTreeProvider).valueOrNull ?? const <CategoryModel>[];
    final trending = ref.watch(collectionProductsProvider(CollectionType.trending)).valueOrNull ?? const [];
    final state = context.findAncestorStateOfType<_SearchScreenState>();

    return ListView(
      padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
      children: [
        if (recent.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.xs, 0),
            child: Row(
              children: [
                Expanded(child: Text('RECENT SEARCHES', style: context.text.labelMedium)),
                TextButton(
                  onPressed: () => ref.read(recentSearchesProvider.notifier).clear(),
                  child: const Text('CLEAR'),
                ),
              ],
            ),
          ),
          ...recent.map((term) => ListTile(
                leading: const Icon(Icons.history_rounded),
                title: Text(term),
                trailing: IconButton(
                  icon: const Icon(Icons.close_rounded, size: 18),
                  onPressed: () => ref.read(recentSearchesProvider.notifier).remove(term),
                ),
                onTap: () => state?._useTerm(term),
              )),
        ],
        if (categories.isNotEmpty) ...[
          const SectionHeader(title: 'Popular categories'),
          Padding(
            padding: AppSpacing.screen,
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: categories
                  .map((c) => ActionChip(
                        avatar: c.image == null
                            ? null
                            : CircleAvatar(
                                backgroundColor: Colors.transparent,
                                child: ClipOval(child: AppNetworkImage(url: c.image!.url, targetWidth: 60)),
                              ),
                        label: Text(c.displayTitle),
                        onPressed: () => context.push(RoutePaths.category(c.slug)),
                      ))
                  .toList(),
            ),
          ),
        ],
        if (trending.isNotEmpty) ...[
          const SectionHeader(title: 'Trending now', overline: 'Most viewed'),
          ProductCarousel(products: trending.take(10).toList(), heroPrefix: 'search-trending'),
        ],
      ],
    );
  }
}
