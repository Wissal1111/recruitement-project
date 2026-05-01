import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';
import '../models/profile_model.dart';

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository(dio: ref.watch(dioProvider));
});

class ProfileRepository {
  final Dio _dio;
  ProfileRepository({required Dio dio}) : _dio = dio;

  // Extremely safe error parser
  String _getErrorMessage(DioException e, String fallback) {
    final data = e.response?.data;
    if (data is Map) {
      return data['message']?.toString() ?? fallback;
    } else if (e.response?.statusCode == 404) {
      return 'Backend route not found (404).';
    }
    return fallback;
  }

  Future<UserProfile> getProfile() async {
    try {
      final res = await _dio.get('/api/profile');
      final raw = res.data;

      // Safely parse the map to prevent String/Int index crashes!
      if (raw is Map<String, dynamic>) {
        final profileMap = raw['profile'] ?? raw;
        return UserProfile.fromJson(profileMap as Map<String, dynamic>);
      }
      throw Exception("Unexpected data format from server");
    } on DioException catch (e) {
      throw Exception(_getErrorMessage(e, 'Failed to load profile'));
    }
  }

  Future<UserProfile> updateProfile(Map<String, dynamic> data) async {
    try {
      final res = await _dio.put('/api/profile', data: data);
      final raw = res.data;

      // Safely parse the map
      if (raw is Map<String, dynamic>) {
        final profileMap = raw['profile'] ?? raw;
        return UserProfile.fromJson(profileMap as Map<String, dynamic>);
      }
      throw Exception("Unexpected data format from server");
    } on DioException catch (e) {
      throw Exception(_getErrorMessage(e, 'Failed to update profile'));
    }
  }

  Future<String> uploadProfilePicture(File imageFile) async {
    try {
      final fileName = imageFile.path.split('/').last;
      final formData = FormData.fromMap({
        'profilePicture': await MultipartFile.fromFile(
          imageFile.path,
          filename: fileName,
        ),
      });
      final res = await _dio.post('/api/profile/picture', data: formData);
      final raw = res.data;

      if (raw is Map) {
        return raw['profilePictureUrl']?.toString() ?? '';
      }
      return '';
    } on DioException catch (e) {
      throw Exception(_getErrorMessage(e, 'Failed to upload photo'));
    }
  }
}
