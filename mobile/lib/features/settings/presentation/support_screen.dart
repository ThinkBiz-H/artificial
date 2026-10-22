import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/content_models.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/providers/core_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../shared/widgets/html_content.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../viewmodels/content_viewmodel.dart';

/// /help and /support — contact channels + FAQs grouped by category.
class SupportScreen extends ConsumerStatefulWidget {
  const SupportScreen({super.key});

  @override
  ConsumerState<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends ConsumerState<SupportScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsValueProvider);
    final launcher = ref.read(launcherServiceProvider);
    final faqs = ref.watch(faqsProvider);

    final channels = <Widget>[
      if (settings.effectiveWhatsapp.isNotEmpty)
        _Channel(
          icon: Icons.chat_outlined,
          label: 'WhatsApp',
          onTap: () => launcher.whatsapp(settings.effectiveWhatsapp, message: 'Hi Swastikala, I need help with'),
        ),
      if (settings.effectiveSupportPhone.isNotEmpty)
        _Channel(icon: Icons.call_outlined, label: 'Call us', onTap: () => launcher.call(settings.effectiveSupportPhone)),
      if (settings.effectiveSupportEmail.isNotEmpty)
        _Channel(
          icon: Icons.mail_outline_rounded,
          label: 'Email',
          onTap: () => launcher.email(settings.effectiveSupportEmail, subject: 'Support request'),
        ),
      _Channel(icon: Icons.edit_note_rounded, label: 'Write to us', onTap: () => context.push(RoutePaths.contact)),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Help & Support')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(faqsProvider);
          try {
            await ref.read(faqsProvider.future);
          } catch (_) {}
        },
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.md),
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(gradient: AppColors.wineGradient, borderRadius: BorderRadius.circular(AppRadius.lg)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('How can we help?', style: context.text.headlineMedium?.copyWith(color: Colors.white)),
                  const SizedBox(height: 4),
                  const Text('Our team usually replies within a few hours.',
                      style: TextStyle(color: AppColors.champagne)),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(spacing: AppSpacing.sm, runSpacing: AppSpacing.sm, children: channels),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.receipt_long_outlined),
                    title: const Text('Track or manage an order'),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push(RoutePaths.orders),
                  ),
                  ListTile(
                    leading: const Icon(Icons.local_shipping_outlined),
                    title: const Text('Shipping policy'),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push(RoutePaths.page('shipping')),
                  ),
                  ListTile(
                    leading: const Icon(Icons.assignment_return_outlined),
                    title: const Text('Returns & refunds'),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push(RoutePaths.page('refund')),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Frequently asked questions', style: context.text.headlineSmall),
            const SizedBox(height: AppSpacing.sm),
            TextField(
              decoration: const InputDecoration(prefixIcon: Icon(Icons.search_rounded), hintText: 'Search FAQs'),
              onChanged: (v) => setState(() => _query = v.trim().toLowerCase()),
            ),
            const SizedBox(height: AppSpacing.sm),
            faqs.when(
              loading: () => const SizedBox(height: 300, child: ListTileSkeleton(count: 4)),
              error: (e, _) => ErrorState(error: e, compact: true, onRetry: () => ref.invalidate(faqsProvider)),
              data: (list) {
                final filtered = _query.isEmpty
                    ? list
                    : list.where((f) =>
                        f.question.toLowerCase().contains(_query) || f.answer.toLowerCase().contains(_query)).toList();
                if (filtered.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Text('No matching questions. Write to us and we will help.',
                        style: context.text.bodySmall, textAlign: TextAlign.center),
                  );
                }
                final groups = <String, List<FaqModel>>{};
                for (final f in filtered) {
                  groups.putIfAbsent(f.category.isEmpty ? 'General' : f.category, () => []).add(f);
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: groups.entries
                      .expand((g) => [
                            Padding(
                              padding: const EdgeInsets.only(top: AppSpacing.md, bottom: 4),
                              child: Text(g.key.toUpperCase(), style: context.text.labelMedium),
                            ),
                            Card(
                              child: Column(
                                children: g.value
                                    .map((f) => ExpansionTile(
                                          shape: const Border(),
                                          title: Text(f.question, style: context.text.titleSmall),
                                          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                                          expandedCrossAxisAlignment: CrossAxisAlignment.start,
                                          children: [HtmlContent(content: f.answer)],
                                        ))
                                    .toList(),
                              ),
                            ),
                          ])
                      .toList(),
                );
              },
            ),
            const SizedBox(height: AppSpacing.xxl),
          ],
        ),
      ),
    );
  }
}

class _Channel extends StatelessWidget {
  const _Channel({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withValues(alpha: 0.12),
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.pill),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: AppColors.champagne, size: 18),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }
}
