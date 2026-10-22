import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/html_content.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/widgets/state_views.dart';
import '../viewmodels/content_viewmodel.dart';

/// /page/:key — About, Privacy, Terms, Shipping, Refund or any CMS slug.
class CmsPageScreen extends ConsumerWidget {
  const CmsPageScreen({super.key, required this.pageKey});
  final String pageKey;

  static const Map<String, String> _titles = {
    'about': 'About us',
    'privacy': 'Privacy policy',
    'terms': 'Terms & conditions',
    'shipping': 'Shipping policy',
    'refund': 'Refund policy',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(pageProvider(pageKey));
    return Scaffold(
      appBar: AppBar(title: Text(async.valueOrNull?.title ?? _titles[pageKey] ?? '')),
      body: async.when(
        loading: () => const LoadingView(),
        error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(pageProvider(pageKey))),
        data: (page) => ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            if (page.featuredImage != null) ...[
              AspectRatio(
                aspectRatio: 16 / 9,
                child: AppNetworkImage(
                  url: page.featuredImage!.url,
                  targetWidth: 900,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
            Text(page.title, style: context.text.displaySmall, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.sm),
            const Center(child: OrnamentDivider()),
            const SizedBox(height: AppSpacing.lg),
            HtmlContent(content: page.content),
          ],
        ),
      ),
    );
  }
}
