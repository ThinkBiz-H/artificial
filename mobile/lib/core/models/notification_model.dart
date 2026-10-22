import 'package:freezed_annotation/freezed_annotation.dart';

import 'json_converters.dart';

part 'notification_model.freezed.dart';
part 'notification_model.g.dart';

/// models/Notification.js
@freezed
abstract class NotificationModel with _$NotificationModel {
  const NotificationModel._();

  const factory NotificationModel({
    @JsonKey(name: '_id', fromJson: idFromJson) @Default('') String id,
    @JsonKey(fromJson: stringFromJson) @Default('system') String type,
    @JsonKey(fromJson: stringFromJson) @Default('') String title,
    @JsonKey(fromJson: stringFromJson) @Default('') String message,
    @JsonKey(fromJson: nullableStringFromJson) String? link,
    @JsonKey(fromJson: nullableIdFromJson) String? relatedOrder,
    @JsonKey(fromJson: nullableIdFromJson) String? relatedProduct,
    @JsonKey(fromJson: boolFromJson) @Default(false) bool isRead,
    DateTime? createdAt,
  }) = _NotificationModel;

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      _$NotificationModelFromJson(json);

  bool get isOrderRelated => relatedOrder != null && relatedOrder!.isNotEmpty;
}
