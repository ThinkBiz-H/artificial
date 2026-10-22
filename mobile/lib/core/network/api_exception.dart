import 'dart:io';

import 'package:dio/dio.dart';

enum AppErrorType {
  network,
  timeout,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validation,
  rateLimited,
  maintenance,
  server,
  cancelled,
  unknown,
}

/// The single error type every repository throws. UI code never sees a
/// DioException — only this, with a customer-presentable [message].
class AppException implements Exception {
  const AppException(this.type, this.message, {this.statusCode});

  final AppErrorType type;
  final String message;
  final int? statusCode;

  bool get isNetwork =>
      type == AppErrorType.network || type == AppErrorType.timeout;
  bool get isUnauthorized => type == AppErrorType.unauthorized;
  bool get isMaintenance => type == AppErrorType.maintenance;
  bool get isNotFound => type == AppErrorType.notFound;

  static const String genericMessage =
      'Something went wrong. Please try again.';
  static const String offlineMessage =
      'No internet connection. Please check your network.';

  static AppException from(Object error) {
    if (error is AppException) return error;
    if (error is DioException) return AppException.fromDio(error);
    if (error is SocketException) {
      return const AppException(AppErrorType.network, offlineMessage);
    }
    return const AppException(AppErrorType.unknown, genericMessage);
  }

  factory AppException.fromDio(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.transformTimeout:
        return const AppException(AppErrorType.timeout,
            'The connection timed out. Please try again.');
      case DioExceptionType.connectionError:
      case DioExceptionType.badCertificate:
        return const AppException(AppErrorType.network, offlineMessage);
      case DioExceptionType.cancel:
        return const AppException(AppErrorType.cancelled, 'Request cancelled.');
      case DioExceptionType.badResponse:
        return _fromResponse(e.response);
      case DioExceptionType.unknown:
        if (e.error is SocketException) {
          return const AppException(AppErrorType.network, offlineMessage);
        }
        if (e.response != null) return _fromResponse(e.response);
        return const AppException(AppErrorType.unknown, genericMessage);
    }
  }

  static AppException _fromResponse(Response<dynamic>? response) {
    final status = response?.statusCode ?? 0;
    final body = response?.data;
    String? serverMessage;
    var maintenance = false;
    if (body is Map) {
      final m = body['message'];
      if (m is String && m.trim().isNotEmpty) serverMessage = m.trim();
      final data = body['data'];
      if (data is Map && data['maintenance'] == true) maintenance = true;
    }

    if (status == 503 && maintenance) {
      return AppException(AppErrorType.maintenance,
          serverMessage ?? 'We are performing scheduled maintenance.',
          statusCode: status);
    }

    final AppErrorType type;
    if (status == 400 || status == 422) {
      type = AppErrorType.validation;
    } else if (status == 401) {
      type = AppErrorType.unauthorized;
    } else if (status == 403) {
      type = AppErrorType.forbidden;
    } else if (status == 404) {
      type = AppErrorType.notFound;
    } else if (status == 409) {
      type = AppErrorType.conflict;
    } else if (status == 429) {
      type = AppErrorType.rateLimited;
    } else if (status >= 500) {
      type = AppErrorType.server;
    } else {
      type = AppErrorType.unknown;
    }

    final String fallback;
    switch (type) {
      case AppErrorType.unauthorized:
        fallback = 'Please log in to continue.';
        break;
      case AppErrorType.forbidden:
        fallback = 'You are not allowed to do that.';
        break;
      case AppErrorType.notFound:
        fallback = 'We could not find what you were looking for.';
        break;
      case AppErrorType.rateLimited:
        fallback = 'Too many attempts. Please wait a moment and try again.';
        break;
      case AppErrorType.server:
        fallback =
            'Our server is having trouble right now. Please try again shortly.';
        break;
      case AppErrorType.validation:
        fallback = 'Please check the details and try again.';
        break;
      default:
        fallback = genericMessage;
    }

    // In production the backend returns a bare "Validation failed" for 422
    // (field details are dev-only) — replace it with friendlier copy.
    final msg = (serverMessage == null || serverMessage == 'Validation failed')
        ? fallback
        : serverMessage;
    return AppException(type, msg, statusCode: status);
  }

  @override
  String toString() => message;
}
