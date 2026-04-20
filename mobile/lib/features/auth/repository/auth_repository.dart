import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';
import '../../../core/secure_storage.dart';
import '../models/auth_models.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    dio: ref.watch(dioProvider),
    storage: ref.watch(secureStorageProvider),
  );
});

class AuthRepository {
  final Dio _dio;
  final SecureStorageService _storage;

  AuthRepository({required Dio dio, required SecureStorageService storage})
      : _dio = dio,
        _storage = storage;

  // ✅ NEW HELPER: Safely extracts error messages so the app never crashes on HTML/404 errors
  String _getErrorMessage(DioException e, String fallback) {
    if (e.response?.data is Map<String, dynamic>) {
      return e.response?.data['message'] ?? fallback;
    } else if (e.response?.statusCode == 404) {
      return 'Backend route not found (404). Please restart your Node.js server.';
    }
    return fallback;
  }

  Future<User> register(RegisterRequest req) async {
    try {
      final res = await _dio.post('/api/auth/register', data: req.toJson());
      final data = res.data as Map<String, dynamic>;

      // Backend returns: { accessToken, refreshToken, userId }
      final accessToken = data['accessToken'] as String? ?? '';
      final refreshToken = data['refreshToken'] as String? ?? '';
      final userId = data['userId'] as String? ?? '';

      await _storage.saveTokens(access: accessToken, refresh: refreshToken);
      await _storage.saveUserId(userId);

      return User(
        userId: userId,
        firstname: req.firstname,
        lastname: req.lastname,
        email: req.email,
        isActive: true,
      );
    } on DioException catch (e) {
      throw Exception(_getErrorMessage(e, 'Registration failed'));
    }
  }

  Future<User> login(String email, String password) async {
    try {
      final res = await _dio.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });
      final data = res.data as Map<String, dynamic>;

      // Backend returns: { accessToken, refreshToken, user: { userId } }
      final accessToken = data['accessToken'] as String? ?? '';
      final refreshToken = data['refreshToken'] as String? ?? '';
      final userMap = data['user'] as Map<String, dynamic>? ?? {};
      final userId = userMap['userId'] as String? ?? '';

      await _storage.saveTokens(access: accessToken, refresh: refreshToken);
      await _storage.saveUserId(userId);

      return User(
        userId: userId,
        firstname: '',
        lastname: '',
        email: email,
        isActive: true,
      );
    } on DioException catch (e) {
      throw Exception(_getErrorMessage(e, 'Login failed'));
    }
  }

  Future<void> logout() async {
    try {
      final refresh = await _storage.getRefreshToken();
      await _dio.post('/api/auth/logout', data: {'refreshToken': refresh});
    } catch (_) {}
    await _storage.clearAll();
  }

  Future<void> forgotPassword(String email) async {
    try {
      await _dio.post('/api/auth/forgot-password', data: {'email': email});
    } on DioException catch (e) {
      throw Exception(_getErrorMessage(e, 'Request failed'));
    }
  }

  Future<void> resetPassword(String token, String newPassword) async {
    try {
      await _dio.post('/api/auth/reset-password', data: {
        'token': token,
        'newPassword': newPassword,
      });
    } on DioException catch (e) {
      throw Exception(_getErrorMessage(e, 'Reset failed'));
    }
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
