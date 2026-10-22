import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/user_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';

/// GET/POST/PUT/DELETE /users/address
class AddressNotifier extends AsyncNotifier<List<AddressModel>> {
  @override
  Future<List<AddressModel>> build() async {
    final authenticated = ref.watch(isAuthenticatedProvider);
    if (!authenticated) return const <AddressModel>[];
    return ref.watch(userRepositoryProvider).addresses();
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  /// Returns the saved address (with its server id).
  Future<AddressModel> save(AddressModel address) async {
    final repo = ref.read(userRepositoryProvider);
    final before = state.valueOrNull ?? const <AddressModel>[];
    final List<AddressModel> list;
    if (address.id.isEmpty) {
      list = await repo.addAddress(address);
    } else {
      list = await repo.updateAddress(address);
    }
    state = AsyncData(list);
    if (address.id.isNotEmpty) {
      return list.firstWhere((a) => a.id == address.id, orElse: () => address);
    }
    final beforeIds = before.map((a) => a.id).toSet();
    return list.firstWhere((a) => !beforeIds.contains(a.id), orElse: () => list.last);
  }

  Future<void> delete(String id) async {
    final list = await ref.read(userRepositoryProvider).deleteAddress(id);
    state = AsyncData(list);
  }

  Future<void> makeDefault(AddressModel address) async {
    await save(address.copyWith(isDefault: true));
  }
}

final addressesProvider =
    AsyncNotifierProvider<AddressNotifier, List<AddressModel>>(AddressNotifier.new);
