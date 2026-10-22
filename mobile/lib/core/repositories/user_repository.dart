import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart' show XFile;

import '../network/api_client.dart';
import '../network/api_endpoints.dart';
import '../models/common_models.dart';
import '../models/user_model.dart';

/// routes/user.routes.js — profile + saved addresses.
class UserRepository {
  UserRepository(this._api);

  final ApiClient _api;

  Future<UserModel> profile() async {
    final res = await _api.get(ApiEndpoints.profile);
    return UserModel.fromJson(res.map('user') ?? const {});
  }

  /// Backend allow-list: name, mobile, city, state, country, pincode.
  Future<UserModel> updateProfile({
    String? name,
    String? city,
    String? state,
    String? country,
    String? pincode,
  }) async {
    final res = await _api.put(ApiEndpoints.profile, data: {
      if (name != null) 'name': name.trim(),
      if (city != null) 'city': city.trim(),
      if (state != null) 'state': state.trim(),
      if (country != null) 'country': country.trim(),
      if (pincode != null) 'pincode': pincode.trim(),
    });
    return UserModel.fromJson(res.map('user') ?? const {});
  }

  /// POST /users/profile/image (multer field "image"). Sends bytes so it
  /// works on web too, where the picker returns a blob URL, not a file path.
  Future<ImageModel?> uploadProfileImage(XFile file) async {
    final lower = file.name.toLowerCase();
    final subtype = lower.endsWith('.png')
        ? 'png'
        : lower.endsWith('.webp')
            ? 'webp'
            : 'jpeg';
    final form = FormData.fromMap({
      'image': MultipartFile.fromBytes(
        await file.readAsBytes(),
        filename: 'avatar.$subtype',
        contentType: DioMediaType('image', subtype),
      ),
    });
    final res = await _api.multipart(ApiEndpoints.profileImage, form);
    return imageFromJson(res.data['profileImage']);
  }

  Future<void> deleteAccount() async {
    await _api.delete(ApiEndpoints.deleteAccount);
  }

  Future<List<AddressModel>> addresses() async {
    final res = await _api.get(ApiEndpoints.addresses);
    return addressListFromJson(res.data['addresses']);
  }

  Future<List<AddressModel>> addAddress(AddressModel address) async {
    final res = await _api.post(ApiEndpoints.addresses, data: address.toRequest());
    return addressListFromJson(res.data['address']);
  }

  Future<List<AddressModel>> updateAddress(AddressModel address) async {
    final res = await _api.put(ApiEndpoints.address(address.id), data: address.toRequest());
    return addressListFromJson(res.data['address']);
  }

  Future<List<AddressModel>> deleteAddress(String id) async {
    final res = await _api.delete(ApiEndpoints.address(id));
    return addressListFromJson(res.data['address']);
  }
}
