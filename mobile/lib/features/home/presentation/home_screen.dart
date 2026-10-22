import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/category_model.dart';
import '../../../core/models/common_models.dart';
import '../../../core/models/home_models.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/services/launcher_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/announcement_bar.dart';
import '../../../shared/widgets/badge_icon_button.dart';
import '../../../shared/widgets/brand_logo.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../../notifications/viewmodels/notifications_viewmodel.dart';
import '../../product/viewmodels/product_list_viewmodel.dart';
import '../viewmodels/home_viewmodel.dart';
import 'home_blocks.dart';
import 'home_sections.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  Future<void> _refresh(WidgetRef ref) async {
    ref.invalidate(homeProvider);
    ref.invalidate(categoryTreeProvider);
    ref.invalidate(settingsProvider);
    ref.invalidate(brandsProvider);
    try {
      await ref.read(homeProvider.future);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final home = ref.watch(homeProvider);
    final categories = ref.watch(categoryTreeProvider).valueOrNull ?? const <CategoryModel>[];
    final announcements = home.valueOrNull?.announcements.map((a) => a.text).toList() ?? const <String>[];

    return Scaffold(
      body: RefreshIndicator(
        color: context.colors.primary,
        onRefresh: () => _refresh(ref),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            const _HomeAppBar(),
            if (announcements.isNotEmpty)
              SliverToBoxAdapter(child: AnnouncementBar(messages: announcements)),
            SliverToBoxAdapter(child: _SearchPill(onTap: () => context.push(RoutePaths.search))),
            ...home.when<List<Widget>>(
              loading: () => const [
                SliverToBoxAdapter(child: ShimmerBox(height: 380, radius: AppRadius.lg)),
                SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl)),
                SliverToBoxAdapter(child: RailSkeleton()),
                SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl)),
                SliverToBoxAdapter(child: RailSkeleton()),
              ],
              error: (e, _) => [
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: ErrorState(error: e, onRetry: () => _refresh(ref)),
                ),
              ],
              data: (data) => _buildContent(context, ref, data, categories),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xxxl)),
          ],
        ),
      ),
    );
  }

  /// The website's homepage order: hero → categories → collections →
  /// occasions → best sellers → campaign → new arrivals → bridal → everyday →
  /// shop by category → brands → reviews → lookbook → video → reels → promise
  /// → newsletter. Every section hides itself when there is nothing real to show.
  List<Widget> _buildContent(
    BuildContext context,
    WidgetRef ref,
    HomeData data,
    List<CategoryModel> tree,
  ) {
    HomeSectionModel? find(List<String> types) {
      for (final s in data.sections) {
        if (types.contains(s.type)) return s;
      }
      return null;
    }

    final topLevel = [...tree.where((c) => c.isActive)]
      ..sort((a, b) {
        final bySort = a.sortOrder.compareTo(b.sortOrder);
        return bySort != 0 ? bySort : a.name.compareTo(b.name);
      });
    final all = flattenCategories(topLevel);
    final allCategories = all.map((e) => e.$1).toList();
    final collections = pickCollections(all, topLevel.take(8).map((c) => c.id).toSet());
    final bridal = findCategoryByKeyword(allCategories, const ['bridal', 'wedding', 'dulhan']);
    final everyday = findCategoryByKeyword(
      allCategories.where((c) => c.id != bridal?.id),
      const ['everyday', 'daily', 'office', 'minimal', 'casual'],
    );

    // Sales-driven lists are empty on a new store — fall back to other real lists.
    final bestList = data.bestSellers.isNotEmpty
        ? data.bestSellers
        : data.topRated.isNotEmpty
            ? data.topRated
            : data.featured;
    final seen = <String>{};
    final campaignProducts = [...data.featured, ...data.bestSellers, ...data.newArrivals]
        .where((p) => seen.add(p.id))
        .take(3)
        .toList();
    final brands = ref.watch(brandsProvider).valueOrNull ?? const <RefModel>[];
    final reels = find(const ['reels']);

    final blocks = <Widget>[
      HomeHero(section: find(const ['hero']), products: data.newArrivals),
      // Real products straight under the banner.
      HomeProductRail(
        eyebrow: 'Just landed',
        title: 'New Arrivals',
        description: 'Fresh designs, added this season.',
        products: data.newArrivals,
        heroPrefix: 'new',
        viewAll: () => context.push(RoutePaths.collection('new-arrivals')),
      ),
      HomeProductRail(
        eyebrow: 'Most loved',
        title: 'Best Sellers',
        products: bestList,
        heroPrefix: 'best',
        viewAll: () => context.push(RoutePaths.collection('best-sellers')),
      ),
      HomeProductRail(
        eyebrow: 'In demand',
        title: 'Trending Now',
        products: data.trending,
        heroPrefix: 'trending',
        viewAll: () => context.push(RoutePaths.collection('trending')),
      ),
      HomeProductRail(
        eyebrow: 'Curated for you',
        title: 'Featured',
        products: data.featured,
        heroPrefix: 'featured',
        viewAll: () => context.push(RoutePaths.collection('featured')),
      ),
      CategoryShowcase(categories: topLevel),
      FeaturedCollections(collections: collections),
      ShopByOccasion(categories: allCategories),
      CampaignBanner(section: find(const ['cta']), fallbackProducts: campaignProducts),
      CollectionFeature(
        category: bridal,
        eyebrow: 'The bridal edit',
        fallbackTitle: 'For Your Most Memorable Day',
        fallbackText: 'Heirloom-inspired sets designed for every ritual, from haldi to the reception.',
        beige: true,
      ),
      CollectionFeature(
        category: everyday,
        eyebrow: 'Everyday luxe',
        fallbackTitle: 'Effortless, Every Day',
        fallbackText: 'Lightweight pieces that move from desk to dinner with ease.',
      ),
      ShopByCategory(categories: topLevel.where((c) => c.image?.isValid ?? false).toList()),
      FeaturedBrands(brands: brands),
      CustomerReviews(topRated: data.topRated),
      Lookbook(section: find(const ['instagram-gallery']), products: data.newArrivals),
      CampaignBanner(section: find(const ['video-banner'])),
      if (reels != null && reels.activeReels.isNotEmpty) ...[
        SectionHeader(
          title: reels.title.isNotEmpty ? reels.title : 'Watch & Shop',
          subtitle: reels.subtitle,
          overline: 'Reels',
          centered: true,
        ),
        ReelsBlock(reels: reels.activeReels),
        const SizedBox(height: AppSpacing.xl),
      ],
      WhyChooseUs(section: find(const ['why-choose'])),
      const NewsletterSection(),
      _Footer(social: ref.watch(settingsValueProvider).social),
    ];
    return blocks.map((w) => SliverToBoxAdapter(child: w)).toList();
  }
}

class _HomeAppBar extends ConsumerWidget {
  const _HomeAppBar();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authenticated = ref.watch(isAuthenticatedProvider);
    final unread = authenticated ? ref.watch(unreadNotificationsProvider).valueOrNull ?? 0 : 0;
    return SliverAppBar(
      floating: true,
      snap: true,
      titleSpacing: 0,
      leading: IconButton(
        tooltip: 'Notifications',
        icon: CountBadge(count: unread, child: const Icon(Icons.notifications_none_rounded)),
        onPressed: () => authenticated
            ? context.push(RoutePaths.notifications)
            : context.push(RoutePaths.loginWithRedirect(RoutePaths.notifications)),
      ),
      title: const BrandLogo(height: 30),
      actions: [
        IconButton(
          tooltip: 'Search',
          icon: const Icon(Icons.search_rounded),
          onPressed: () => context.push(RoutePaths.search),
        ),
        const CartIconButton(),
      ],
    );
  }
}

class _SearchPill extends StatelessWidget {
  const _SearchPill({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.md),
      child: Material(
        color: context.colors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.pill),
          side: BorderSide(color: context.colors.outline),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.pill),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
            child: Row(
              children: [
                Icon(Icons.search_rounded, color: context.colors.onSurfaceVariant),
                const SizedBox(width: 10),
                Text('Search necklaces, earrings, bangles…',
                    style: context.text.bodyMedium?.copyWith(color: context.colors.onSurfaceVariant)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Footer extends StatelessWidget {
  const _Footer({required this.social});
  final Map<String, String> social;

  IconData _icon(String key) => switch (key) {
        'instagram' => Icons.camera_alt_outlined,
        'facebook' => Icons.facebook_rounded,
        'youtube' => Icons.play_circle_outline_rounded,
        'whatsapp' => Icons.chat_outlined,
        'pinterest' => Icons.push_pin_outlined,
        'linkedin' => Icons.work_outline_rounded,
        _ => Icons.public_rounded,
      };

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.xxl, AppSpacing.md, 0),
      child: Column(
        children: [
          const BrandWordmark(size: 18),
          const SizedBox(height: 8),
          const OrnamentDivider(),
          const SizedBox(height: 8),
          Text('Elegance, everyday.', style: context.text.bodySmall),
          if (social.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: 4,
              children: social.entries
                  .map((e) => IconButton(
                        tooltip: e.key.capitalized,
                        color: AppColors.roseGold,
                        icon: Icon(_icon(e.key)),
                        onPressed: () => LauncherService().openUrl(e.value),
                      ))
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }
}
