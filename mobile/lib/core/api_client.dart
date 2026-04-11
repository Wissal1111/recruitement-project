import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import 'secure_storage.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: const Duration(milliseconds: AppConfig.connectTimeout),
      receiveTimeout: const Duration(milliseconds: AppConfig.receiveTimeout),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Attach Bearer token if available
        final storage = ref.read(secureStorageProvider);
        final token = await storage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }

        // Log in debug mode
        if (kDebugMode) {
          debugPrint('→ ${options.method} ${options.path}');
          debugPrint('   body: ${options.data}');
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        if (kDebugMode) {
          debugPrint(
              '← ${response.statusCode} ${response.requestOptions.path}');
          debugPrint('   data: ${response.data}');
        }
        return handler.next(response);
      },
      onError: (error, handler) async {
        if (kDebugMode) {
          debugPrint(
              '✗ ERROR ${error.response?.statusCode} ${error.requestOptions.path}');
          debugPrint('   ${error.response?.data}');
        }
        return handler.next(error);
      },
    ),
  );

  return dio;
});
