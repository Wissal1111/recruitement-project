import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';
import '../features/auth/models/user_model.dart';

class AuthService {
  final _storage = const FlutterSecureStorage();

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
  };

  Future<Map<String, String>> get _authHeaders async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // REGISTER
  Future<Map<String, dynamic>> register({
    required String firstname,
    required String lastname,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}/api/auth/register'),
      headers: _headers,
      body: jsonEncode({
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password,
      }),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return {'success': true, 'data': data};
    }
    return {'success': false, 'message': data['message'] ?? 'Registration failed'};
  }

  // LOGIN
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}/api/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      // Save tokens securely
      await _storage.write(
          key: AppConstants.tokenKey, value: data['accessToken']);
      await _storage.write(
          key: AppConstants.refreshTokenKey, value: data['refreshToken']);
      if (data['user'] != null) {
        await _storage.write(
            key: AppConstants.userIdKey, value: data['user']['userId']);
      }
      return {'success': true, 'data': data};
    }
    return {'success': false, 'message': data['message'] ?? 'Login failed'};
  }

  // LOGOUT
  Future<void> logout() async {
    await _storage.deleteAll();
  }

  // FORGOT PASSWORD
  Future<Map<String, dynamic>> forgotPassword(String email) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}/api/auth/forgot-password'),
      headers: _headers,
      body: jsonEncode({'email': email}),
    );
    final data = jsonDecode(response.body);
    return {
      'success': response.statusCode == 200,
      'message': data['message'] ?? '',
    };
  }

  // RESET PASSWORD
  Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}/api/auth/reset-password'),
      headers: _headers,
      body: jsonEncode({'token': token, 'newPassword': newPassword}),
    );
    final data = jsonDecode(response.body);
    return {
      'success': response.statusCode == 200,
      'message': data['message'] ?? '',
    };
  }

  // CHECK if logged in
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    return token != null;
  }

  // GET current user
  Future<UserModel?> getCurrentUser() async {
    try {
      final headers = await _authHeaders;
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/users/me'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return UserModel.fromJson(jsonDecode(response.body));
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}