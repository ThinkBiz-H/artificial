// Tolerant JSON readers for the Mongo/Express payloads. The same field can
// arrive populated ({_id, name, ...}) or as a bare ObjectId string depending
// on the endpoint, and numbers can arrive as int, double or string.

String idFromJson(Object? value) {
  if (value == null) return '';
  if (value is String) return value;
  if (value is Map) return (value['_id'] ?? value['id'] ?? '').toString();
  return value.toString();
}

String? nullableIdFromJson(Object? value) {
  final id = idFromJson(value);
  return id.isEmpty ? null : id;
}

String stringFromJson(Object? value) => value == null ? '' : value.toString();

String? nullableStringFromJson(Object? value) {
  if (value == null) return null;
  final s = value.toString();
  return s.isEmpty ? null : s;
}

double doubleFromJson(Object? value) {
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}

double? nullableDoubleFromJson(Object? value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value);
  return null;
}

int intFromJson(Object? value) {
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? double.tryParse(value)?.toInt() ?? 0;
  return 0;
}

bool boolFromJson(Object? value) {
  if (value is bool) return value;
  if (value is String) return value == 'true';
  if (value is num) return value != 0;
  return false;
}

List<String> stringListFromJson(Object? value) {
  if (value is! List) return const <String>[];
  return value
      .where((e) => e != null)
      .map((e) => e is Map ? idFromJson(e) : e.toString())
      .where((e) => e.isNotEmpty)
      .toList();
}

Map<String, dynamic>? mapOrNull(Object? value) =>
    value is Map ? Map<String, dynamic>.from(value) : null;

List<Map<String, dynamic>> mapList(Object? value) {
  if (value is! List) return const <Map<String, dynamic>>[];
  return value.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
}

Map<String, dynamic> dynamicMapFromJson(Object? value) =>
    value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};
