import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart' show XFile;

import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';

class ProfileEditState {
  const ProfileEditState({this.saving = false, this.uploading = false});
  final bool saving;
  final bool uploading;
}

/// PUT /users/profile, POST /users/profile/image
class ProfileEditViewModel extends AutoDisposeNotifier<ProfileEditState> {
  @override
  ProfileEditState build() => const ProfileEditState();

  Future<void> save({
    required String name,
    String? city,
    String? state,
    String? pincode,
  }) async {
    this.state = ProfileEditState(saving: true, uploading: this.state.uploading);
    try {
      final user = await ref.read(userRepositoryProvider).updateProfile(
            name: name,
            city: city,
            state: state,
            pincode: pincode,
            country: 'India',
          );
      final current = ref.read(currentUserProvider);
      // PUT /users/profile does not return addresses populated differently;
      // keep the richer cached copy for fields the response omits.
      await ref.read(authProvider.notifier).updateUser(
            current == null ? user : user.copyWith(addresses: user.addresses.isEmpty ? current.addresses : user.addresses),
          );
    } finally {
      this.state = ProfileEditState(saving: false, uploading: this.state.uploading);
    }
  }

  Future<void> uploadAvatar(XFile file) async {
    state = ProfileEditState(saving: state.saving, uploading: true);
    try {
      final image = await ref.read(userRepositoryProvider).uploadProfileImage(file);
      final current = ref.read(currentUserProvider);
      if (current != null && image != null) {
        await ref.read(authProvider.notifier).updateUser(current.copyWith(profileImage: image));
      }
    } finally {
      state = ProfileEditState(saving: state.saving, uploading: false);
    }
  }
}

final profileEditProvider =
    AutoDisposeNotifierProvider<ProfileEditViewModel, ProfileEditState>(ProfileEditViewModel.new);
