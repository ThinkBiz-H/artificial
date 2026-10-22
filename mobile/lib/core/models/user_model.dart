import 'package:freezed_annotation/freezed_annotation.dart';

import 'common_models.dart';
import 'json_converters.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

/// Embedded address — models/User.js addressSchema.
@freezed
abstract class AddressModel with _$AddressModel {
  const AddressModel._();

  const factory AddressModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: stringFromJson) @Default('Home') String type,
    @JsonKey(fromJson: stringFromJson) @Default('') String firstName,
    @JsonKey(fromJson: stringFromJson) @Default('') String lastName,
    @JsonKey(fromJson: stringFromJson) @Default('') String addressLine1,
    @JsonKey(fromJson: stringFromJson) @Default('') String addressLine2,
    @JsonKey(fromJson: stringFromJson) @Default('') String city,
    @JsonKey(fromJson: stringFromJson) @Default('') String state,
    @JsonKey(fromJson: stringFromJson) @Default('India') String country,
    @JsonKey(fromJson: stringFromJson) @Default('') String pincode,
    @JsonKey(fromJson: stringFromJson) @Default('') String phone,
    @JsonKey(fromJson: boolFromJson) @Default(false) bool isDefault,
  }) = _AddressModel;

  factory AddressModel.fromJson(Map<String, dynamic> json) =>
      _$AddressModelFromJson(json);

  String get fullName => '$firstName $lastName'.trim();

  String get singleLine => [
        addressLine1,
        if (addressLine2.isNotEmpty) addressLine2,
        city,
        '$state - $pincode',
      ].where((e) => e.trim().isNotEmpty).join(', ');

  /// Body for POST/PUT /users/address — never sends _id.
  Map<String, dynamic> toRequest() => <String, dynamic>{
        'type': type,
        'firstName': firstName.trim(),
        'lastName': lastName.trim(),
        'addressLine1': addressLine1.trim(),
        'addressLine2': addressLine2.trim(),
        'city': city.trim(),
        'state': state.trim(),
        'country': country.trim().isEmpty ? 'India' : country.trim(),
        'pincode': pincode.trim(),
        'phone': phone.trim(),
        'isDefault': isDefault,
      };
}

List<AddressModel> addressListFromJson(Object? value) {
  if (value is! List) return const <AddressModel>[];
  return value
      .whereType<Map>()
      .map((e) => AddressModel.fromJson(Map<String, dynamic>.from(e)))
      .toList(growable: false);
}

/// models/User.js (customer-facing subset).
@freezed
abstract class UserModel with _$UserModel {
  const UserModel._();

  const factory UserModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: stringFromJson) @Default('') String name,
    @JsonKey(fromJson: nullableStringFromJson) String? email,
    @JsonKey(fromJson: nullableStringFromJson) String? mobile,
    @JsonKey(fromJson: imageFromJson) ImageModel? profileImage,
    @JsonKey(name: 'address', fromJson: addressListFromJson)
    @Default(<AddressModel>[])
    List<AddressModel> addresses,
    @JsonKey(fromJson: nullableStringFromJson) String? city,
    @JsonKey(fromJson: nullableStringFromJson) String? state,
    @JsonKey(fromJson: nullableStringFromJson) String? country,
    @JsonKey(fromJson: nullableStringFromJson) String? pincode,
    @JsonKey(fromJson: stringFromJson) @Default('user') String role,
    @JsonKey(fromJson: boolFromJson) @Default(false) bool isVerified,
    @JsonKey(fromJson: boolFromJson) @Default(false) bool isMobileVerified,
    @JsonKey(fromJson: boolFromJson) @Default(true) bool isActive,
    @JsonKey(fromJson: stringListFromJson) @Default(<String>[]) List<String> wishlist,
    DateTime? createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  String get firstName => name.trim().split(RegExp(r'\s+')).first;
  String get lastName {
    final parts = name.trim().split(RegExp(r'\s+'));
    return parts.length > 1 ? parts.sublist(1).join(' ') : '';
  }

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+')).where((e) => e.isNotEmpty);
    if (parts.isEmpty) return 'S';
    return parts.take(2).map((e) => e[0].toUpperCase()).join();
  }

  AddressModel? get defaultAddress {
    if (addresses.isEmpty) return null;
    for (final a in addresses) {
      if (a.isDefault) return a;
    }
    return addresses.last;
  }
}

/// GET /auth/sessions entry (models/Session.js).
class SessionInfo {
  const SessionInfo({
    required this.id,
    required this.userAgent,
    required this.ip,
    required this.isCurrent,
    this.createdAt,
    this.lastUsedAt,
  });

  final String id;
  final String userAgent;
  final String ip;
  final bool isCurrent;
  final DateTime? createdAt;
  final DateTime? lastUsedAt;

  factory SessionInfo.fromJson(Map<String, dynamic> json) => SessionInfo(
        id: idFromJson(json['_id']),
        userAgent: stringFromJson(json['userAgent']),
        ip: stringFromJson(json['ip']),
        isCurrent: boolFromJson(json['isCurrent']),
        createdAt: DateTime.tryParse(stringFromJson(json['createdAt'])),
        lastUsedAt: DateTime.tryParse(
            stringFromJson(json['lastUsedAt'] ?? json['updatedAt'])),
      );
}
