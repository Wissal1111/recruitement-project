import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import 'secure_storage.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      sendTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  bool isRefreshing = false;
  Completer<String?>? refreshCompleter;

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        try {
          final storage = ref.read(secureStorageProvider);
          final token = await storage.getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
        } catch (_) {}

        if (kDebugMode) {
          debugPrint('→ ${options.method} ${options.path}');
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        if (kDebugMode) {
          debugPrint(
              '← ${response.statusCode} ${response.requestOptions.path}');
        }
        return handler.next(response);
      },
      onError: (error, handler) async {
        final isUnauthorized = error.response?.statusCode == 401;
        final isRefreshCall =
            error.requestOptions.path.contains('/api/auth/refresh-token');

        // 🚨 FIX: Check if this request was already retried
        final alreadyRetried = error.requestOptions.extra['retried'] == true;

        if (!isUnauthorized || isRefreshCall || alreadyRetried) {
          if (kDebugMode) {
            debugPrint(
                '✗ ${error.response?.statusCode} ${error.requestOptions.path}');
          }
          return handler.next(error);
        }

        // If another request is already refreshing, wait for it
        if (isRefreshing && refreshCompleter != null) {
          try {
            final newToken = await refreshCompleter!.future;
            if (newToken != null) {
              error.requestOptions.headers['Authorization'] =
                  'Bearer $newToken';
              error.requestOptions.extra['retried'] =
                  true; // 🚨 Mark as retried
              final retryResponse = await dio.fetch(error.requestOptions);
              return handler.resolve(retryResponse);
            }
          } catch (_) {}
          return handler.next(error);
        }

        // Start refreshing
        isRefreshing = true;
        refreshCompleter = Completer<String?>();

        try {
          final storage = ref.read(secureStorageProvider);
          final refreshToken = await storage.getRefreshToken();

          if (refreshToken == null || refreshToken.isEmpty) {
            refreshCompleter!.complete(null);
            isRefreshing = false;
            return handler.next(error);
          }

          final freshDio = Dio(BaseOptions(
            baseUrl: AppConfig.baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
            headers: {'Content-Type': 'application/json'},
          ));

          final refreshResponse = await freshDio.post(
            '/api/auth/refresh-token',
            data: {'refreshToken': refreshToken},
          );

          final newAccessToken = refreshResponse.data['accessToken'] as String?;

          if (newAccessToken == null) {
            refreshCompleter!.complete(null);
            isRefreshing = false;
            return handler.next(error);
          }

          await storage.saveAccessToken(newAccessToken);

          if (kDebugMode) {
            debugPrint('🔄 Token refreshed successfully');
          }

          refreshCompleter!.complete(newAccessToken);
          isRefreshing = false;

          // Retry the original request - ONCE only
          error.requestOptions.headers['Authorization'] =
              'Bearer $newAccessToken';
          error.requestOptions.extra['retried'] = true; // 🚨 Mark as retried
          final retryResponse = await dio.fetch(error.requestOptions);
          return handler.resolve(retryResponse);
        } catch (refreshError) {
          if (kDebugMode) {
            debugPrint('❌ Token refresh failed: $refreshError');
          }
          if (!refreshCompleter!.isCompleted) {
            refreshCompleter!.completeError(refreshError);
          }
          isRefreshing = false;
          return handler.next(error);
        }
      },
    ),
  );

  return dio;
});
