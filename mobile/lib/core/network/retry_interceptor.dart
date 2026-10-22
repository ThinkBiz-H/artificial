import 'dart:io';

import 'package:dio/dio.dart';

/// Retries idempotent GET requests on transient network failures with a
/// short quadratic back-off. Mutations are never retried automatically.
class RetryInterceptor extends Interceptor {
  RetryInterceptor(this.dio, {this.maxRetries = 2});

  final Dio dio;
  final int maxRetries;

  bool _isTransient(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionError:
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
        return true;
      case DioExceptionType.unknown:
        return e.error is SocketException;
      default:
        return false;
    }
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final request = err.requestOptions;
    final attempt = (request.extra['retryAttempt'] as int?) ?? 0;
    if (request.method.toUpperCase() != 'GET' ||
        !_isTransient(err) ||
        attempt >= maxRetries ||
        request.responseType == ResponseType.stream) {
      handler.next(err);
      return;
    }
    await Future<void>.delayed(
        Duration(milliseconds: 400 * (attempt + 1) * (attempt + 1)));
    request.extra['retryAttempt'] = attempt + 1;
    try {
      final response = await dio.fetch<dynamic>(request);
      handler.resolve(response);
    } on DioException catch (e) {
      handler.next(e);
    }
  }
}
