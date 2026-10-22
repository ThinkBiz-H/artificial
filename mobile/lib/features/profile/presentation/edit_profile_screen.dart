import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/providers/auth_provider.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/indian_states.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/buttons.dart';
import '../../../shared/widgets/dialogs.dart';
import '../viewmodels/profile_viewmodel.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _user = ref.read(currentUserProvider);
  late final _name = TextEditingController(text: _user?.name ?? '');
  late final _city = TextEditingController(text: _user?.city ?? '');
  late final _pincode = TextEditingController(text: _user?.pincode ?? '');
  late String? _state = _user?.state;

  @override
  void dispose() {
    _name.dispose();
    _city.dispose();
    _pincode.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Take a photo'),
              onTap: () => Navigator.of(ctx).pop(ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Choose from gallery'),
              onTap: () => Navigator.of(ctx).pop(ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;
    try {
      final file = await ImagePicker().pickImage(source: source, maxWidth: 1080, imageQuality: 85);
      if (file == null) return;
      await ref.read(profileEditProvider.notifier).uploadAvatar(file);
      if (mounted) context.showSnack('Profile photo updated');
    } catch (e) {
      if (mounted) context.showError(e);
    }
  }

  Future<void> _save() async {
    context.hideKeyboard();
    if (!(_formKey.currentState?.validate() ?? false)) return;
    try {
      await ref.read(profileEditProvider.notifier).save(
            name: _name.text,
            city: _city.text,
            state: _state,
            pincode: _pincode.text,
          );
      if (!mounted) return;
      context.showSnack('Profile updated');
      context.pop();
    } catch (e) {
      if (mounted) context.showError(e);
    }
  }

  Future<void> _deleteAccount() async {
    final ok = await showConfirmDialog(
      context,
      title: 'Delete account?',
      message: 'Your profile, saved addresses, wishlist and bag will be permanently deleted. '
          'Order records are retained for legal and tax purposes. This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    );
    if (!ok) return;
    try {
      await ref.read(authProvider.notifier).deleteAccount();
      if (!mounted) return;
      context.showSnack('Your account has been deleted');
      context.go(RoutePaths.home);
    } catch (e) {
      if (mounted) context.showError(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(profileEditProvider);
    final user = ref.watch(currentUserProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Edit profile')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 52,
                    backgroundColor: AppColors.champagne,
                    child: (user?.profileImage?.isValid ?? false)
                        ? ClipOval(
                            child: AppNetworkImage(
                                url: user!.profileImage!.url, width: 104, height: 104, targetWidth: 260))
                        : Text(user?.initials ?? 'S',
                            style: context.text.displaySmall?.copyWith(color: AppColors.wine)),
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Material(
                      color: context.colors.primary,
                      shape: const CircleBorder(),
                      child: InkWell(
                        customBorder: const CircleBorder(),
                        onTap: state.uploading ? null : _pickImage,
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: state.uploading
                              ? SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: context.colors.onPrimary))
                              : Icon(Icons.camera_alt_outlined, size: 18, color: context.colors.onPrimary),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            AppTextField(
              controller: _name,
              label: 'Full name',
              validator: Validators.name,
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: TextEditingController(text: user?.mobile ?? ''),
              label: 'Mobile number (login ID)',
              prefixText: '+91  ',
              readOnly: true,
              enabled: false,
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: TextEditingController(text: user?.email ?? ''),
              label: 'Email',
              readOnly: true,
              enabled: false,
              hint: 'Added during checkout',
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _city,
              label: 'City',
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: AppSpacing.md),
            DropdownButtonFormField<String>(
              value: kIndianStates.contains(_state) ? _state : null,
              isExpanded: true,
              decoration: const InputDecoration(labelText: 'State'),
              items: kIndianStates.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
              onChanged: (v) => setState(() => _state = v),
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _pincode,
              label: 'Pincode',
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(6)],
              validator: (v) => v == null || v.isEmpty ? null : Validators.pincode(v),
            ),
            const SizedBox(height: AppSpacing.xl),
            PrimaryButton(label: 'Save changes', loading: state.saving, onPressed: _save),
            const SizedBox(height: AppSpacing.xxl),
            TextButton.icon(
              style: TextButton.styleFrom(foregroundColor: context.colors.error),
              onPressed: _deleteAccount,
              icon: const Icon(Icons.delete_forever_outlined),
              label: const Text('DELETE MY ACCOUNT'),
            ),
          ],
        ),
      ),
    );
  }
}
