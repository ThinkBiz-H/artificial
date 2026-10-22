import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/user_model.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/dialogs.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../viewmodels/address_viewmodel.dart';

/// /addresses (?select=1 returns the chosen AddressModel via pop).
class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key, this.selectMode = false, this.selectedId});
  final bool selectMode;
  final String? selectedId;

  Future<void> _openForm(BuildContext context, [AddressModel? existing]) async {
    final saved = await context.push<AddressModel>(RoutePaths.addressForm, extra: existing);
    if (saved != null && selectMode && context.mounted) context.pop(saved);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(addressesProvider);
    return Scaffold(
      appBar: AppBar(title: Text(selectMode ? 'Select address' : 'Saved addresses')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(context),
        icon: const Icon(Icons.add_location_alt_outlined),
        label: const Text('Add address'),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(addressesProvider.notifier).refresh(),
        child: async.when(
          loading: () => const ListTileSkeleton(count: 3),
          error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(addressesProvider)),
          data: (list) => list.isEmpty
              ? ListView(children: [
                  SizedBox(
                    height: MediaQuery.sizeOf(context).height * 0.65,
                    child: EmptyState(
                      icon: Icons.location_on_outlined,
                      title: 'No saved addresses',
                      message: 'Add an address for faster checkout.',
                      actionLabel: 'Add address',
                      onAction: () => _openForm(context),
                    ),
                  ),
                ])
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.md, 100),
                  itemCount: list.length,
                  itemBuilder: (_, i) => AddressCard(
                    address: list[i],
                    selected: selectMode && list[i].id == selectedId,
                    onTap: selectMode ? () => context.pop(list[i]) : null,
                    onEdit: () => _openForm(context, list[i]),
                    onDelete: () async {
                      final ok = await showConfirmDialog(context,
                          title: 'Delete address?',
                          message: list[i].singleLine,
                          confirmLabel: 'Delete',
                          destructive: true);
                      if (!ok) return;
                      try {
                        await ref.read(addressesProvider.notifier).delete(list[i].id);
                      } catch (e) {
                        if (context.mounted) context.showError(e);
                      }
                    },
                    onMakeDefault: list[i].isDefault
                        ? null
                        : () async {
                            try {
                              await ref.read(addressesProvider.notifier).makeDefault(list[i]);
                            } catch (e) {
                              if (context.mounted) context.showError(e);
                            }
                          },
                  ),
                ),
        ),
      ),
    );
  }
}

class AddressCard extends StatelessWidget {
  const AddressCard({
    super.key,
    required this.address,
    this.selected = false,
    this.onTap,
    this.onEdit,
    this.onDelete,
    this.onMakeDefault,
  });

  final AddressModel address;
  final bool selected;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;
  final VoidCallback? onMakeDefault;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.card,
        side: BorderSide(
          color: selected ? context.colors.primary : context.colors.outline,
          width: selected ? 1.6 : 1,
        ),
      ),
      child: InkWell(
        borderRadius: AppRadius.card,
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (onTap != null) ...[
                    Icon(selected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                        color: context.colors.primary, size: 20),
                    const SizedBox(width: 8),
                  ],
                  Expanded(
                    child: Text(address.fullName.isEmpty ? 'Address' : address.fullName,
                        style: context.text.titleMedium),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.roseGoldLight.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(address.type.toUpperCase(), style: context.text.labelSmall),
                  ),
                  if (address.isDefault) ...[
                    const SizedBox(width: 6),
                    Text('DEFAULT',
                        style: context.text.labelSmall?.copyWith(
                            color: AppColors.success, fontWeight: FontWeight.w700)),
                  ],
                ],
              ),
              const SizedBox(height: 6),
              Text(address.singleLine, style: context.text.bodyMedium),
              if (address.phone.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text('Mobile: ${Formatters.mobile(address.phone)}', style: context.text.bodySmall),
              ],
              if (onEdit != null || onDelete != null || onMakeDefault != null)
                Row(
                  children: [
                    if (onEdit != null) TextButton(onPressed: onEdit, child: const Text('EDIT')),
                    if (onDelete != null) TextButton(onPressed: onDelete, child: const Text('DELETE')),
                    const Spacer(),
                    if (onMakeDefault != null)
                      TextButton(onPressed: onMakeDefault, child: const Text('SET DEFAULT')),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
