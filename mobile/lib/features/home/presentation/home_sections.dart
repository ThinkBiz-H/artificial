import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category_model.dart';
import '../../../core/models/common_models.dart';
import '../../../core/models/home_models.dart';
import '../../../core/models/product_model.dart';
import '../../../core/models/product_query.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/providers/core_providers.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/product_card.dart';
import '../../../shared/widgets/product_grid.dart';
import '../../../shared/widgets/rating_badge.dart';
import '../../product/viewmodels/product_detail_viewmodel.dart';
import 'hero_carousel.dart';

// The website's homepage sections (frontend/src/components/home), in the
// same order and with the same data rules — every section reads live data
// and hides itself when there is nothing real to show.

/// Every category in the tree, depth-first, with its depth.
List<(CategoryModel, int)> flattenCategories(List<CategoryModel> tree, [int depth = 0]) => [
      for (final c in tree) ...[(c, depth), ...flattenCategories(c.children, depth + 1)],
    ];

/// First category whose name or slug contains any keyword.
CategoryModel? findCategoryByKeyword(Iterable<CategoryModel> categories, List<String> keywords) {
  for (final c in categories) {
    final hay = '${c.name} ${c.slug}'.toLowerCase();
    if (keywords.any(hay.contains)) return c;
  }
  return null;
}

bool _hasImage(CategoryModel c) => c.image?.isValid ?? false;

const _collectionKeywords = [
  'kundan', 'pearl', 'american diamond', 'american-diamond', 'ad-', 'temple', 'oxidi', 'polki', 'western', //
  'antique', 'meenakari', 'victorian',
];

/// Collection-style categories: keyword matches (Kundan, Pearl, AD, Temple…)
/// first, then subcategories, then anything else with an image — skipping
/// those already shown in "Shop by Category".
List<CategoryModel> pickCollections(List<(CategoryModel, int)> all, Set<String> exclude, {int max = 5}) {
  final withImage = all.where((e) => _hasImage(e.$1) && e.$1.isActive).toList();
  final keyword = withImage.where((e) => _collectionKeywords.any('${e.$1.name} ${e.$1.slug}'.toLowerCase().contains));
  final sub = withImage.where((e) => e.$2 > 0 && !exclude.contains(e.$1.id));
  final rest = withImage.where((e) => !exclude.contains(e.$1.id));
  final seen = <String>{};
  final out = <CategoryModel>[];
  for (final e in [...keyword, ...sub, ...rest, ...withImage]) {
    if (!seen.add(e.$1.id)) continue;
    out.add(e.$1);
    if (out.length == max) break;
  }
  return out;
}

/// Website SectionHeading: accent eyebrow, display title, optional description and "view all".
class HomeHeading extends StatelessWidget {
  const HomeHeading({
    super.key,
    required this.eyebrow,
    required this.title,
    this.description,
    this.centered = false,
    this.actionLabel,
    this.onAction,
    this.light = false,
  });

  final String eyebrow;
  final String title;
  final String? description;
  final bool centered;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool light;

  @override
  Widget build(BuildContext context) {
    final align = centered ? CrossAxisAlignment.center : CrossAxisAlignment.start;
    final textAlign = centered ? TextAlign.center : TextAlign.start;
    final fg = light ? AppColors.ivory : context.colors.onSurface;
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, 0, AppSpacing.md, AppSpacing.lg),
      child: Column(
        crossAxisAlignment: align,
        children: [
          Text(eyebrow.toUpperCase(),
              style: AppTypography.overline(light ? AppColors.roseGoldLight : AppColors.roseGold), textAlign: textAlign),
          const SizedBox(height: 8),
          Text(title, style: context.text.displaySmall?.copyWith(color: fg, height: 1.08), textAlign: textAlign),
          if (description != null && description!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(description!,
                style: context.text.bodyMedium?.copyWith(color: light ? AppColors.ivory.withValues(alpha: 0.75) : context.colors.onSurfaceVariant),
                textAlign: textAlign),
          ],
          if (onAction != null) ...[
            const SizedBox(height: 6),
            GestureDetector(
              onTap: onAction,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text((actionLabel ?? 'View all').toUpperCase(),
                      style: context.text.labelMedium?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 2.2, color: fg)),
                  const SizedBox(width: 6),
                  Icon(Icons.arrow_forward_rounded, size: 15, color: fg),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Section wrapper with the website's vertical rhythm and optional tone.
class _Band extends StatelessWidget {
  const _Band({required this.child, this.color});
  final Widget child;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: color,
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xxl + 8),
      child: child,
    );
  }
}

/// Two-column product grid (website `grid-cols-2`).
class _ProductGridBox extends StatelessWidget {
  const _ProductGridBox({required this.products, required this.heroPrefix});
  final List<ProductModel> products;
  final String heroPrefix;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: context.gridColumns,
        mainAxisSpacing: AppSpacing.lg,
        crossAxisSpacing: AppSpacing.sm,
        childAspectRatio: kProductCardAspect,
      ),
      itemCount: products.length,
      itemBuilder: (_, i) => ProductCard(product: products[i], heroPrefix: heroPrefix),
    );
  }
}

// ---------------------------------------------------------------- Hero

/// Admin hero slides, else the editorial hero built from new arrivals.
class HomeHero extends StatelessWidget {
  const HomeHero({super.key, required this.section, required this.products});
  final HomeSectionModel? section;
  final List<ProductModel> products;

  @override
  Widget build(BuildContext context) {
    final slides = section?.activeSlides ?? const <SlideModel>[];
    if (slides.isNotEmpty) return HeroCarousel(slides: slides);
    return _EditorialHero(products: products);
  }
}

class _EditorialHero extends StatelessWidget {
  const _EditorialHero({required this.products});
  final List<ProductModel> products;

  @override
  Widget build(BuildContext context) {
    final main = products.where((p) => p.primaryImage != null).firstOrNull;
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 4 / 5,
            child: GestureDetector(
              onTap: main == null ? null : () => context.push(RoutePaths.product(main.slug)),
              child: Container(
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(AppRadius.xl), boxShadow: AppShadows.lifted),
                child: main == null
                    ? Container(
                        decoration: BoxDecoration(color: AppColors.ivoryDeep, borderRadius: BorderRadius.circular(AppRadius.xl)),
                        alignment: Alignment.center,
                        child: Text('S',
                            style: context.text.displayLarge
                                ?.copyWith(fontSize: 96, fontStyle: FontStyle.italic, color: AppColors.roseGold.withValues(alpha: 0.5))),
                      )
                    : AppNetworkImage(url: main.primaryImage, targetWidth: 900, borderRadius: BorderRadius.circular(AppRadius.xl)),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text('THE NEW COLLECTION', style: AppTypography.overline(AppColors.roseGold)),
          const SizedBox(height: 12),
          Text('Discover Timeless Elegance', style: context.text.displayLarge),
          const SizedBox(height: 12),
          Text('Handcrafted artificial jewellery designed to make every moment unforgettable.',
              style: AppTypography.sub(context.colors.onSurface.withValues(alpha: 0.8), size: 17)),
          const SizedBox(height: AppSpacing.xl),
          ElevatedButton(onPressed: () => context.push(RoutePaths.products), child: const Text('SHOP COLLECTION')),
          const SizedBox(height: AppSpacing.sm),
          OutlinedButton(
            onPressed: () => context.push(RoutePaths.collection('new-arrivals')),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [Text('EXPLORE NEW ARRIVALS'), SizedBox(width: 6), Icon(Icons.arrow_forward_rounded, size: 16)],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Wrap(
            spacing: AppSpacing.lg,
            runSpacing: 6,
            children: [
              for (final (icon, label) in const [
                (Icons.diamond_outlined, 'Premium finish'),
                (Icons.verified_user_outlined, 'Secure payments'),
                (Icons.replay_rounded, 'Easy returns'),
              ])
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, size: 14, color: AppColors.roseGold),
                    const SizedBox(width: 6),
                    Text(label, style: context.text.bodySmall),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------- Categories

/// Arch-topped category card (website CategoryCard).
class _ArchCategoryCard extends StatelessWidget {
  const _ArchCategoryCard({required this.category});
  final CategoryModel category;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push(RoutePaths.category(category.slug)),
      child: Column(
        children: [
          AspectRatio(
            aspectRatio: 3 / 4,
            child: LayoutBuilder(builder: (context, c) {
              final radius = BorderRadius.vertical(top: Radius.circular(c.maxWidth / 2));
              return _hasImage(category)
                  ? AppNetworkImage(url: category.image!.url, targetWidth: 400, borderRadius: radius)
                  : Container(
                      decoration: BoxDecoration(color: AppColors.cream, borderRadius: radius),
                      alignment: Alignment.center,
                      child: Text(category.name.isEmpty ? '' : category.name[0],
                          style: context.text.displayLarge?.copyWith(color: AppColors.goldDeep, fontSize: 56)),
                    );
            }),
          ),
          const SizedBox(height: 14),
          Text(category.name,
              style: context.text.headlineMedium, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis),
          if (category.shortTitle.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(category.shortTitle, style: context.text.bodySmall, textAlign: TextAlign.center, maxLines: 2),
          ],
        ],
      ),
    );
  }
}

/// "Shop by Category — Find your signature" (website CategoryShowcase): first six top-level categories.
class CategoryShowcase extends StatelessWidget {
  const CategoryShowcase({super.key, required this.categories});
  final List<CategoryModel> categories;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();
    final width = MediaQuery.sizeOf(context).width * 0.42;
    final items = categories.take(6).toList();
    return _Band(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          HomeHeading(
            eyebrow: 'Shop by Category',
            title: 'Find your signature',
            actionLabel: 'Shop all jewellery',
            onAction: () => context.push(RoutePaths.products),
          ),
          SizedBox(
            height: width / 0.75 + 76,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: AppSpacing.screen,
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.lg),
              itemBuilder: (_, i) => SizedBox(width: width, child: _ArchCategoryCard(category: items[i])),
            ),
          ),
        ],
      ),
    );
  }
}

/// "Curated edits — Featured Collections" (website TrendingCollections). Hidden below three collections.
class FeaturedCollections extends StatelessWidget {
  const FeaturedCollections({super.key, required this.collections});
  final List<CategoryModel> collections;

  @override
  Widget build(BuildContext context) {
    if (collections.length < 3) return const SizedBox.shrink();
    final lead = collections.first;
    final rest = collections.skip(1).toList();
    final others = rest.take(rest.length >= 4 ? 4 : 2).toList();

    Widget tile(CategoryModel c, {bool big = false}) => GestureDetector(
          onTap: () => context.push(RoutePaths.category(c.slug)),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            child: Stack(
              fit: StackFit.expand,
              children: [
                AppNetworkImage(url: c.image?.url, targetWidth: big ? 900 : 450),
                ColoredBox(color: AppColors.ink.withValues(alpha: 0.22)),
                Positioned(
                  left: 16,
                  right: 16,
                  bottom: 16,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(c.name,
                          style: (big ? context.text.displaySmall : context.text.headlineMedium)?.copyWith(color: AppColors.ivory)),
                      if (big && c.shortTitle.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(c.shortTitle, style: context.text.bodyMedium?.copyWith(color: AppColors.ivory.withValues(alpha: 0.85))),
                      ],
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Text('DISCOVER', style: AppTypography.overline(AppColors.ivory).copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(width: 6),
                          const Icon(Icons.arrow_forward_rounded, size: 13, color: AppColors.ivory),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );

    return _Band(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          HomeHeading(
            eyebrow: 'Curated edits',
            title: 'Featured Collections',
            actionLabel: 'All collections',
            onAction: () => context.push(RoutePaths.browse),
          ),
          Padding(
            padding: AppSpacing.screen,
            child: Column(
              children: [
                AspectRatio(aspectRatio: 4 / 5, child: tile(lead, big: true)),
                const SizedBox(height: AppSpacing.sm),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: AppSpacing.sm,
                  crossAxisSpacing: AppSpacing.sm,
                  childAspectRatio: 3 / 4,
                  children: [for (final c in others) tile(c)],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

const _occasions = <(String, List<String>)>[
  ('Wedding', ['bridal', 'wedding', 'dulhan']),
  ('Festive', ['festive', 'festival', 'diwali', 'navratri', 'puja', 'pooja', 'ethnic', 'traditional']),
  ('Party', ['party', 'cocktail', 'evening', 'statement']),
  ('Haldi & Mehendi', ['haldi', 'mehendi', 'mehndi', 'sangeet', 'floral']),
  ('Office', ['office', 'work', 'minimal', 'western']),
  ('Everyday', ['everyday', 'daily', 'casual', 'lightweight']),
  ('Gifting', ['gift', 'combo', 'hamper']),
];

/// "Dressed for the moment — Shop by Occasion": each occasion resolved to a
/// real admin category (first keyword match with an image). Hidden below three.
class ShopByOccasion extends StatelessWidget {
  const ShopByOccasion({super.key, required this.categories});
  final List<CategoryModel> categories;

  @override
  Widget build(BuildContext context) {
    final used = <String>{};
    final picks = <(String, CategoryModel)>[];
    for (final (label, keywords) in _occasions) {
      CategoryModel? match;
      for (final c in categories) {
        if (c.isActive && _hasImage(c) && !used.contains(c.id) && keywords.any('${c.name} ${c.slug}'.toLowerCase().contains)) {
          match = c;
          break;
        }
      }
      if (match == null) continue;
      used.add(match.id);
      picks.add((label, match));
      if (picks.length == 6) break;
    }
    if (picks.length < 3) return const SizedBox.shrink();

    final width = MediaQuery.sizeOf(context).width * 0.44;
    return _Band(
      color: AppColors.ivoryDeep,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const HomeHeading(
            eyebrow: 'Dressed for the moment',
            title: 'Shop by Occasion',
            description: 'From the first ritual to the last dance — find the piece made for it.',
            centered: true,
          ),
          SizedBox(
            height: width / 0.75 + 92,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: AppSpacing.screen,
              itemCount: picks.length,
              separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
              itemBuilder: (_, i) {
                final (label, category) = picks[i];
                return SizedBox(
                  width: width,
                  child: GestureDetector(
                    onTap: () => context.push(RoutePaths.category(category.slug)),
                    child: Column(
                      children: [
                        LayoutBuilder(builder: (context, c) {
                          final top = Radius.circular(c.maxWidth / 2);
                          return Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: context.colors.surface,
                              borderRadius: BorderRadius.vertical(top: top, bottom: const Radius.circular(AppRadius.lg)),
                              boxShadow: AppShadows.soft,
                            ),
                            child: AspectRatio(
                              aspectRatio: 3 / 4,
                              child: AppNetworkImage(
                                url: category.image!.url,
                                targetWidth: 400,
                                borderRadius: BorderRadius.vertical(top: top, bottom: const Radius.circular(16)),
                              ),
                            ),
                          );
                        }),
                        const SizedBox(height: 12),
                        Text(label, style: context.text.headlineMedium, textAlign: TextAlign.center),
                        const SizedBox(height: 2),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Flexible(
                              child: Text(category.name.toUpperCase(),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: context.text.labelSmall?.copyWith(color: AppColors.roseGold, fontWeight: FontWeight.w600)),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.arrow_forward_rounded, size: 12, color: AppColors.roseGold),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// "Shop by Category — Find Your Style" grid of every top-level category.
class ShopByCategory extends StatelessWidget {
  const ShopByCategory({super.key, required this.categories});
  final List<CategoryModel> categories;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();
    return _Band(
      color: AppColors.cream,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const HomeHeading(
            eyebrow: 'Shop by category',
            title: 'Find Your Style',
            description: 'Browse our premium jewellery collection by category.',
            centered: true,
          ),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: AppSpacing.screen,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: AppSpacing.lg,
              crossAxisSpacing: AppSpacing.lg,
              childAspectRatio: 0.6,
            ),
            itemCount: categories.length,
            itemBuilder: (_, i) {
              final c = categories[i];
              return GestureDetector(
                onTap: () => context.push(RoutePaths.category(c.slug)),
                child: Column(
                  children: [
                    AspectRatio(
                      aspectRatio: 4 / 5,
                      child: Container(
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(AppRadius.xl), boxShadow: AppShadows.soft),
                        child: AppNetworkImage(url: c.image?.url, targetWidth: 400, borderRadius: BorderRadius.circular(AppRadius.xl)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(c.name, style: context.text.headlineMedium, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
                    if (c.shortTitle.isNotEmpty)
                      Text(c.shortTitle, style: context.text.bodySmall, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------- Products

/// Product rail with the website heading (eyebrow, title, description, view all).
class HomeProductRail extends StatelessWidget {
  const HomeProductRail({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.products,
    this.description,
    this.viewAll,
    this.heroPrefix = 'rail',
  });

  final String eyebrow;
  final String title;
  final String? description;
  final List<ProductModel> products;
  final VoidCallback? viewAll;
  final String heroPrefix;

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) return const SizedBox.shrink();
    return _Band(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          HomeHeading(eyebrow: eyebrow, title: title, description: description, onAction: viewAll),
          ProductCarousel(products: products, heroPrefix: heroPrefix),
        ],
      ),
    );
  }
}

final _categoryProductsProvider = FutureProvider.autoDispose.family<List<ProductModel>, String>((ref, categoryId) async {
  final page = await ref.watch(catalogRepositoryProvider).products(ProductQuery(categoryId: categoryId), limit: 4);
  return page.items;
});

/// A featured admin category (Bridal, Everyday): image panel beside four of
/// its real products (website CollectionFeature). Hidden without products.
class CollectionFeature extends ConsumerWidget {
  const CollectionFeature({
    super.key,
    required this.category,
    required this.eyebrow,
    required this.fallbackTitle,
    required this.fallbackText,
    this.beige = false,
  });

  final CategoryModel? category;
  final String eyebrow;
  final String fallbackTitle;
  final String fallbackText;
  final bool beige;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = category;
    if (c == null) return const SizedBox.shrink();
    final products = ref.watch(_categoryProductsProvider(c.id)).valueOrNull ?? const <ProductModel>[];
    if (products.isEmpty) return const SizedBox.shrink();
    final image = _hasImage(c) ? c.image!.url : products.first.primaryImage;
    final title = c.name.toLowerCase().contains('collection') ? c.name : '${c.name} Collection';

    return _Band(
      color: beige ? AppColors.ivoryDeep : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: AppSpacing.screen,
            child: GestureDetector(
              onTap: () => context.push(RoutePaths.category(c.slug)),
              child: AspectRatio(
                aspectRatio: 4 / 5,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      AppNetworkImage(url: image, targetWidth: 900),
                      Positioned(
                        left: 16,
                        right: 16,
                        bottom: 16,
                        child: Container(
                          padding: const EdgeInsets.all(AppSpacing.lg),
                          decoration: BoxDecoration(
                            color: AppColors.surface.withValues(alpha: 0.92),
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(eyebrow.toUpperCase(), style: AppTypography.overline(AppColors.roseGold).copyWith(fontSize: 10)),
                              const SizedBox(height: 4),
                              Text(title, style: context.text.headlineLarge?.copyWith(color: AppColors.ink)),
                              const SizedBox(height: 6),
                              const Row(
                                children: [
                                  Text('DISCOVER',
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1.8, color: AppColors.wine)),
                                  SizedBox(width: 6),
                                  Icon(Icons.arrow_forward_rounded, size: 13, color: AppColors.wine),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          HomeHeading(
            eyebrow: eyebrow,
            title: c.shortTitle.isNotEmpty ? c.shortTitle : fallbackTitle,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.md, 0, AppSpacing.md, AppSpacing.lg),
            child: Text(c.description.isNotEmpty ? Formatters.stripHtml(c.description) : fallbackText,
                style: AppTypography.sub(context.colors.onSurface.withValues(alpha: 0.8)).copyWith(fontStyle: FontStyle.italic)),
          ),
          _ProductGridBox(products: products, heroPrefix: 'feature-${c.id}'),
          const SizedBox(height: AppSpacing.lg),
          Padding(
            padding: AppSpacing.screen,
            child: OutlinedButton(
              onPressed: () => context.push(RoutePaths.category(c.slug)),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(child: Text('SHOP ${c.name.toUpperCase()}', overflow: TextOverflow.ellipsis)),
                  const SizedBox(width: 6),
                  const Icon(Icons.arrow_forward_rounded, size: 15),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------- Campaigns

/// Full-width campaign from the admin's "cta" / "video-banner" section, else
/// (cta only) the wine editorial campaign built from real products.
class CampaignBanner extends StatelessWidget {
  const CampaignBanner({super.key, required this.section, this.fallbackProducts = const <ProductModel>[]});
  final HomeSectionModel? section;
  final List<ProductModel> fallbackProducts;

  @override
  Widget build(BuildContext context) {
    final s = section;
    final image = s?.image?.isValid ?? false ? s!.image!.url : null;
    if (s == null || image == null) {
      return fallbackProducts.isEmpty ? const SizedBox.shrink() : _FallbackCampaign(products: fallbackProducts);
    }
    final title = s.title.isNotEmpty ? s.title : 'Elegance Crafted For You';
    final button = (s.button?.label.isNotEmpty ?? false) && (s.button?.link.isNotEmpty ?? false)
        ? s.button!
        : const SectionButton(label: 'Shop the collection', link: '/products');
    final secondary = s.config['secondaryButton'];
    final secondaryLabel = secondary is Map ? secondary['label']?.toString() ?? '' : '';
    final secondaryLink = secondary is Map ? secondary['link']?.toString() ?? '' : '';

    return SizedBox(
      height: 520,
      child: Stack(
        fit: StackFit.expand,
        children: [
          AppNetworkImage(url: image, targetWidth: 1000),
          ColoredBox(color: AppColors.ink.withValues(alpha: 0.4)),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (s.subtitle.isNotEmpty)
                  Text(s.subtitle.toUpperCase(),
                      style: AppTypography.overline(AppColors.ivory.withValues(alpha: 0.85)), textAlign: TextAlign.center),
                const SizedBox(height: 14),
                Text(title,
                    style: context.text.displayLarge?.copyWith(color: AppColors.ivory), textAlign: TextAlign.center),
                if (s.content.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Text(s.content,
                      style: context.text.bodyLarge?.copyWith(color: AppColors.ivory.withValues(alpha: 0.85)),
                      textAlign: TextAlign.center),
                ],
                const SizedBox(height: AppSpacing.xl),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  alignment: WrapAlignment.center,
                  children: [
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.surface, foregroundColor: AppColors.ink, minimumSize: const Size(0, 52)),
                      onPressed: () => openCmsLink(context, button.link),
                      child: Text(button.label.toUpperCase()),
                    ),
                    if (secondaryLabel.isNotEmpty && secondaryLink.isNotEmpty)
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.ivory,
                            side: const BorderSide(color: AppColors.ivory),
                            minimumSize: const Size(0, 52)),
                        onPressed: () => openCmsLink(context, secondaryLink),
                        child: Text(secondaryLabel.toUpperCase()),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FallbackCampaign extends StatelessWidget {
  const _FallbackCampaign({required this.products});
  final List<ProductModel> products;

  @override
  Widget build(BuildContext context) {
    final imgs = products.where((p) => p.primaryImage != null).take(3).toList();
    if (imgs.isEmpty) return const SizedBox.shrink();
    Widget image(ProductModel p) => GestureDetector(
          onTap: () => context.push(RoutePaths.product(p.slug)),
          child: AppNetworkImage(url: p.primaryImage, targetWidth: 500, borderRadius: BorderRadius.circular(AppRadius.lg)),
        );
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.lg),
      child: Container(
        decoration: BoxDecoration(color: AppColors.wine, borderRadius: BorderRadius.circular(AppRadius.xl)),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.xxl, AppSpacing.xl, AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('THE SIGNATURE EDIT', style: AppTypography.overline(AppColors.roseGoldLight).copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 14),
                  Text('Elegance, Crafted For You', style: context.text.displayMedium?.copyWith(color: AppColors.ivory)),
                  const SizedBox(height: 12),
                  Text('Statement pieces and everyday treasures, chosen to make every moment shine.',
                      style: AppTypography.sub(AppColors.ivory.withValues(alpha: 0.75)).copyWith(fontStyle: FontStyle.italic)),
                  const SizedBox(height: AppSpacing.xl),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.surface, foregroundColor: AppColors.ink),
                    onPressed: () => context.push(RoutePaths.products),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [Text('SHOP THE COLLECTION'), SizedBox(width: 6), Icon(Icons.arrow_forward_rounded, size: 16)],
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.md, 0, AppSpacing.md, AppSpacing.md),
              child: SizedBox(
                height: 320,
                child: imgs.length == 1
                    ? image(imgs.first)
                    : Row(
                        children: [
                          Expanded(child: image(imgs.first)),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Column(
                              children: [
                                Expanded(child: image(imgs[1])),
                                if (imgs.length > 2) ...[
                                  const SizedBox(height: AppSpacing.sm),
                                  Expanded(child: image(imgs[2])),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------- Brands & reviews

/// "Makers we love — Featured Brands": logo wall of active brands (two or more).
class FeaturedBrands extends StatelessWidget {
  const FeaturedBrands({super.key, required this.brands});
  final List<RefModel> brands;

  @override
  Widget build(BuildContext context) {
    final active = brands.where((b) => b.status != 'inactive').take(10).toList();
    if (active.length < 2) return const SizedBox.shrink();
    return _Band(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const HomeHeading(eyebrow: 'Makers we love', title: 'Featured Brands'),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: AppSpacing.screen,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: AppSpacing.sm,
              crossAxisSpacing: AppSpacing.sm,
              childAspectRatio: 3 / 2,
            ),
            itemCount: active.length,
            itemBuilder: (_, i) {
              final b = active[i];
              final logo = b.logo?.isValid ?? false ? b.logo!.url : null;
              return Material(
                color: context.colors.surface,
                shape: RoundedRectangleBorder(
                    borderRadius: AppRadius.card, side: BorderSide(color: context.colors.outline)),
                child: InkWell(
                  customBorder: const RoundedRectangleBorder(borderRadius: AppRadius.card),
                  onTap: () => context.push(RoutePaths.productList(brandId: b.id, title: b.name)),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: logo != null
                          ? [
                              SizedBox(
                                height: 44,
                                child: ColorFiltered(
                                  colorFilter: const ColorFilter.matrix(<double>[
                                    0.2126, 0.7152, 0.0722, 0, 0, //
                                    0.2126, 0.7152, 0.0722, 0, 0,
                                    0.2126, 0.7152, 0.0722, 0, 0,
                                    0, 0, 0, 0.8, 0,
                                  ]),
                                  child: AppNetworkImage(url: logo, fit: BoxFit.contain, targetWidth: 240),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(b.name.toUpperCase(),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: context.text.labelSmall?.copyWith(letterSpacing: 1.8)),
                            ]
                          : [
                              Text(b.name,
                                  style: context.text.headlineMedium, textAlign: TextAlign.center, maxLines: 2),
                            ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

/// "Kind words — Loved by Our Customers": real 4★+ written reviews from the
/// top-rated products. Hidden when there are none.
class CustomerReviews extends ConsumerWidget {
  const CustomerReviews({super.key, required this.topRated});
  final List<ProductModel> topRated;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final candidates = topRated.where((p) => p.numReviews > 0).take(4).toList();
    final reviews = <(ReviewModel, ProductModel)>[
      for (final p in candidates)
        ...(ref.watch(productReviewsProvider(p.id)).valueOrNull?.reviews ?? const <ReviewModel>[])
            .where((r) => r.rating >= 4 && r.comment.trim().length >= 12)
            .map((r) => (r, p)),
    ]..sort((a, b) {
        final byRating = b.$1.rating.compareTo(a.$1.rating);
        return byRating != 0 ? byRating : (b.$1.createdAt ?? DateTime(2000)).compareTo(a.$1.createdAt ?? DateTime(2000));
      });
    final shown = reviews.take(6).toList();
    if (shown.isEmpty) return const SizedBox.shrink();
    final avg = candidates.fold<double>(0, (s, p) => s + p.rating) / candidates.length;
    final width = MediaQuery.sizeOf(context).width * 0.84;

    return _Band(
      color: AppColors.ivoryDeep,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          HomeHeading(
            eyebrow: 'Kind words',
            title: 'Loved by Our Customers',
            description: avg > 0 ? 'Rated ${avg.toStringAsFixed(1)} out of 5 on our most-loved pieces.' : null,
            centered: true,
          ),
          SizedBox(
            height: 330,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: AppSpacing.screen,
              itemCount: shown.length,
              separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
              itemBuilder: (_, i) {
                final (review, product) = shown[i];
                return Container(
                  width: width,
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  decoration: BoxDecoration(
                    color: context.colors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    boxShadow: AppShadows.lifted,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.format_quote_rounded, size: 28, color: AppColors.roseGoldSoft),
                      const SizedBox(height: 8),
                      StarRow(rating: review.rating, size: 14),
                      const SizedBox(height: 10),
                      Expanded(
                        child: Text('“${review.comment}”',
                            maxLines: 5,
                            overflow: TextOverflow.ellipsis,
                            style: context.text.headlineSmall?.copyWith(fontStyle: FontStyle.italic, fontWeight: FontWeight.w500)),
                      ),
                      const Divider(height: AppSpacing.lg),
                      Row(
                        children: [
                          Flexible(
                            child: Text(review.userName.isNotEmpty ? review.userName : 'Verified customer',
                                style: context.text.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                          ),
                          if (review.isVerifiedPurchase) ...[
                            const SizedBox(width: 6),
                            const Icon(Icons.verified_rounded, size: 15, color: AppColors.success),
                          ],
                        ],
                      ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () => context.push(RoutePaths.product(product.slug)),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 36,
                              height: 36,
                              child: AppNetworkImage(url: product.primaryImage, targetWidth: 100, borderRadius: BorderRadius.circular(AppRadius.sm)),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text('Purchased: ${product.title}',
                                  maxLines: 1, overflow: TextOverflow.ellipsis, style: context.text.bodySmall),
                            ),
                          ],
                        ),
                      ),
                      if (review.createdAt != null) ...[
                        const SizedBox(height: 6),
                        Text(Formatters.date(review.createdAt), style: context.text.labelSmall),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------- Lookbook, why choose, newsletter

/// "Styled by You" lookbook: the admin's Instagram Gallery (four or more
/// images), otherwise real product photography.
class Lookbook extends ConsumerWidget {
  const Lookbook({super.key, required this.section, required this.products});
  final HomeSectionModel? section;
  final List<ProductModel> products;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final social = ref.watch(settingsValueProvider).social;
    final insta = (social['instagram'] ?? '').trim();
    final instagramUrl = insta.isEmpty
        ? null
        : insta.startsWith('http')
            ? insta
            : 'https://instagram.com/${insta.replaceFirst('@', '')}';
    final handle = insta.isNotEmpty && !insta.startsWith('http') ? '@${insta.replaceFirst('@', '')}' : null;

    final adminTiles = (section?.gallery ?? const <ImageModel>[])
        .where((g) => g.isValid)
        .map((g) => (src: g.url, slug: null as String?))
        .toList();
    final productTiles = products
        .map((p) => (src: p.images.length > 1 && p.images[1].isValid ? p.images[1].url : (p.primaryImage ?? ''), slug: p.slug as String?))
        .where((t) => t.src.isNotEmpty)
        .toList();
    final tiles = (adminTiles.length >= 4 ? adminTiles : productTiles).take(5).toList();
    if (tiles.length < 4) return const SizedBox.shrink();

    void open(({String src, String? slug}) t) {
      if (t.slug != null) {
        context.push(RoutePaths.product(t.slug!));
      } else if (instagramUrl != null) {
        ref.read(launcherServiceProvider).openUrl(instagramUrl);
      }
    }

    Widget tile(({String src, String? slug}) t) => GestureDetector(
          onTap: () => open(t),
          child: AppNetworkImage(url: t.src, targetWidth: 500, borderRadius: BorderRadius.circular(AppRadius.lg)),
        );

    return _Band(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          HomeHeading(
            eyebrow: (section?.subtitle.isNotEmpty ?? false) ? section!.subtitle : 'Jewellery inspiration',
            title: (section?.title.isNotEmpty ?? false) ? section!.title : 'Styled by You',
            centered: true,
          ),
          if (instagramUrl != null)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.lg),
              child: Center(
                child: TextButton.icon(
                  onPressed: () => ref.read(launcherServiceProvider).openUrl(instagramUrl),
                  icon: const Icon(Icons.camera_alt_outlined, size: 16),
                  label: Text(handle ?? 'Follow us on Instagram'),
                ),
              ),
            ),
          Padding(
            padding: AppSpacing.screen,
            child: Column(
              children: [
                SizedBox(height: 320, width: double.infinity, child: tile(tiles.first)),
                const SizedBox(height: 8),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  childAspectRatio: 1.1,
                  children: [for (final t in tiles.skip(1)) tile(t)],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

const _whyIcons = <String, IconData>{
  'Hand': Icons.back_hand_outlined,
  'Droplet': Icons.water_drop_outlined,
  'ShieldCheck': Icons.verified_user_outlined,
  'Gem': Icons.diamond_outlined,
  'Package': Icons.inventory_2_outlined,
  'Heart': Icons.favorite_border_rounded,
  'Sparkles': Icons.auto_awesome_outlined,
  'PenTool': Icons.draw_outlined,
  'Palette': Icons.palette_outlined,
  'Layers': Icons.layers_outlined,
  'PackageCheck': Icons.inventory_outlined,
  'Clock': Icons.schedule_rounded,
  'Flame': Icons.local_fire_department_outlined,
  'Wand2': Icons.auto_fix_high_outlined,
  'Truck': Icons.local_shipping_outlined,
  'SprayCan': Icons.format_paint_outlined,
  'Settings2': Icons.tune_rounded,
  'BadgeCheck': Icons.verified_outlined,
  'RotateCcw': Icons.replay_rounded,
  'Headset': Icons.headset_mic_outlined,
  'Crown': Icons.workspace_premium_outlined,
  'Gift': Icons.card_giftcard_rounded,
  'Star': Icons.star_border_rounded,
  'Award': Icons.emoji_events_outlined,
  'CreditCard': Icons.credit_card_rounded,
  'Leaf': Icons.eco_outlined,
};

/// "The promise — Why Shop With Us": the admin's items, else the store's standard promises.
class WhyChooseUs extends StatelessWidget {
  const WhyChooseUs({super.key, required this.section});
  final HomeSectionModel? section;

  @override
  Widget build(BuildContext context) {
    final raw = section?.config['items'];
    final adminItems = (raw is List ? raw : const [])
        .whereType<Map>()
        .where((i) => (i['title']?.toString() ?? '').isNotEmpty)
        .map((i) => (
              _whyIcons[i['icon']?.toString()] ?? Icons.auto_awesome_outlined,
              i['title'].toString(),
              i['description']?.toString() ?? '',
            ))
        .toList();
    final items = adminItems.isNotEmpty
        ? adminItems
        : const [
            (Icons.diamond_outlined, 'Premium Quality', 'Skin-friendly finishes and stones set to last.'),
            (Icons.verified_user_outlined, 'Secure Payments', 'UPI, cards and net banking via Razorpay.'),
            (Icons.replay_rounded, 'Easy Returns', 'Simple return requests on eligible orders.'),
            (Icons.local_shipping_outlined, 'Fast Shipping', 'Tracked, insured delivery across India.'),
            (Icons.headset_mic_outlined, 'Customer Support', 'Real people, ready to help with every order.'),
          ];
    final shown = items.take(5).toList();
    final itemWidth = (MediaQuery.sizeOf(context).width - AppSpacing.md * 2 - AppSpacing.md) / 2;

    return Container(
      decoration: BoxDecoration(
        border: Border.symmetric(horizontal: BorderSide(color: context.colors.outline)),
      ),
      child: _Band(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            HomeHeading(
              eyebrow: 'The promise',
              title: (section?.title.isNotEmpty ?? false) ? section!.title : 'Why Shop With Us',
              description: section?.subtitle,
              centered: true,
            ),
            Padding(
              padding: AppSpacing.screen,
              child: Wrap(
                alignment: WrapAlignment.center,
                spacing: AppSpacing.md,
                runSpacing: AppSpacing.xl,
                children: [
                  for (final (icon, title, body) in shown)
                    SizedBox(
                      width: itemWidth,
                      child: Column(
                        children: [
                          Icon(icon, size: 30, color: AppColors.roseGold),
                          const SizedBox(height: 12),
                          Text(title, style: context.text.headlineSmall, textAlign: TextAlign.center),
                          if (body.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(body, style: context.text.bodySmall, textAlign: TextAlign.center),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// "The inner circle — Be the First to Know" newsletter (POST /contact, inquiryType Newsletter).
class NewsletterSection extends ConsumerStatefulWidget {
  const NewsletterSection({super.key});

  @override
  ConsumerState<NewsletterSection> createState() => _NewsletterSectionState();
}

class _NewsletterSectionState extends ConsumerState<NewsletterSection> {
  final _email = TextEditingController();
  bool _loading = false;
  bool _done = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final value = _email.text.trim();
    if (value.isEmpty || Validators.optionalEmail(value) != null) {
      setState(() => _error = 'Please enter a valid email address');
      return;
    }
    context.hideKeyboard();
    setState(() {
      _error = null;
      _loading = true;
    });
    try {
      await ref.read(contentRepositoryProvider).submitContact(
            inquiryType: 'Newsletter',
            name: 'Newsletter subscriber',
            email: value,
            phone: 'Not provided',
            subject: 'Newsletter subscription',
            message: 'Please add $value to the newsletter mailing list.',
          );
      if (mounted) setState(() => _done = true);
    } catch (e) {
      if (mounted) context.showError(e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.wine,
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 72, AppSpacing.lg, 72),
      child: Column(
        children: [
          Text('THE INNER CIRCLE', style: AppTypography.overline(AppColors.roseGoldLight).copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 14),
          Text('Be the First to Know',
              style: context.text.displayMedium?.copyWith(color: AppColors.ivory), textAlign: TextAlign.center),
          const SizedBox(height: 14),
          Text(
            'Get updates on new collections, exclusive offers and jewellery inspiration — straight to your inbox.',
            style: context.text.bodyLarge?.copyWith(color: AppColors.ivory.withValues(alpha: 0.7)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xl),
          if (_done)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle_outline_rounded, size: 18, color: AppColors.roseGoldSoft),
                const SizedBox(width: 8),
                Text("Thank you — you're on the list.", style: context.text.bodyMedium?.copyWith(color: AppColors.ivory)),
              ],
            )
          else ...[
            Container(
              decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppColors.ivory.withValues(alpha: 0.4)))),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      onSubmitted: (_) => _submit(),
                      style: context.text.bodyMedium?.copyWith(color: AppColors.ivory),
                      cursorColor: AppColors.ivory,
                      decoration: InputDecoration(
                        hintText: 'Your email address',
                        hintStyle: context.text.bodyMedium?.copyWith(color: AppColors.ivory.withValues(alpha: 0.55)),
                        filled: false,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: _loading ? null : _submit,
                    style: TextButton.styleFrom(foregroundColor: AppColors.ivory),
                    child: _loading
                        ? const SizedBox(
                            width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.ivory))
                        : const Text('SUBSCRIBE', style: TextStyle(letterSpacing: 2.6)),
                  ),
                ],
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: context.text.bodySmall?.copyWith(color: AppColors.roseGoldLight)),
            ],
          ],
          const SizedBox(height: AppSpacing.md),
          Text('No spam — we respect your inbox and your privacy.',
              style: context.text.labelSmall?.copyWith(color: AppColors.ivory.withValues(alpha: 0.45), letterSpacing: 0.4)),
        ],
      ),
    );
  }
}
