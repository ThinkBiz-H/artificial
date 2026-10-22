import 'package:dio/dio.dart';

import 'api_exception.dart';

/// Unwrapped form of the backend envelope: { success, message, data, error }
/// (utils/ApiResponse.js).
class ApiResponse {
  const ApiResponse({
    required this.success,
    required this.message,
    required this.data,
    this.statusCode,
  });

  final bool success;
  final String message;
  final Map<String, dynamic> data;
  final int? statusCode;

  factory ApiResponse.fromBody(dynamic body, {int? statusCode}) {
    if (body is Map) {
      final map = Map<String, dynamic>.from(body);
      final raw = map['data'];
      return ApiResponse(
        success: map['success'] != false,
        message: (map['message'] ?? '').toString(),
        data: raw is Map
            ? Map<String, dynamic>.from(raw)
            : <String, dynamic>{'value': raw},
        statusCode: statusCode,
      );
    }
    return ApiResponse(
      success: true,
      message: '',
      data: <String, dynamic>{'value': body},
      statusCode: statusCode,
    );
  }

  List<Map<String, dynamic>> list(String key) {
    final raw = data[key];
    if (raw is! List) return const [];
    return raw
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList(growable: false);
  }

  Map<String, dynamic>? map(String key) {
    final raw = data[key];
    return raw is Map ? Map<String, dynamic>.from(raw) : null;
  }
}

class ApiClient {
  ApiClient(this._dio);

  final Dio _dio;

  Dio get dio => _dio;

  Options _options({bool auth = true}) =>
      Options(extra: <String, dynamic>{'skipAuth': !auth});

  Future<ApiResponse> get(
    String path, {
    Map<String, dynamic>? query,
    bool auth = true,
    CancelToken? cancelToken,
  }) =>
      _send(() => _dio.get<dynamic>(path,
          queryParameters: query,
          options: _options(auth: auth),
          cancelToken: cancelToken));

  Future<ApiResponse> post(
    String path, {
    Object? data,
    Map<String, dynamic>? query,
    bool auth = true,
  }) =>
      _send(() => _dio.post<dynamic>(path,
          data: data ?? <String, dynamic>{},
          queryParameters: query,
          options: _options(auth: auth)));

  Future<ApiResponse> put(String path, {Object? data, bool auth = true}) =>
      _send(() => _dio.put<dynamic>(path,
          data: data ?? <String, dynamic>{}, options: _options(auth: auth)));

  Future<ApiResponse> patch(String path, {Object? data, bool auth = true}) =>
      _send(() => _dio.patch<dynamic>(path,
          data: data ?? <String, dynamic>{}, options: _options(auth: auth)));

  Future<ApiResponse> delete(
    String path, {
    Object? data,
    Map<String, dynamic>? query,
    bool auth = true,
  }) =>
      _send(() => _dio.delete<dynamic>(path,
          data: data,
          queryParameters: query,
          options: _options(auth: auth)));

  Future<ApiResponse> multipart(String path, FormData form) =>
      _send(() => _dio.post<dynamic>(path,
          data: form,
          options: Options(
              contentType: 'multipart/form-data',
              extra: <String, dynamic>{'skipAuth': false})));

  Future<String> download(String path, String savePath) async {
    try {
      await _dio.download(path, savePath,
          options: Options(extra: <String, dynamic>{'skipAuth': false}));
      return savePath;
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<ApiResponse> _send(Future<Response<dynamic>> Function() call) async {
    try {
      final res = await call();
      final parsed = ApiResponse.fromBody(res.data, statusCode: res.statusCode);
      if (!parsed.success) {
        throw AppException(
          AppErrorType.server,
          parsed.message.isEmpty ? AppException.genericMessage : parsed.message,
          statusCode: res.statusCode,
        );
      }
      return parsed;
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }
}
