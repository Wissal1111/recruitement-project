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

  Future<UserProfile> getProfile() async {
    try {
      final res = await _dio.get('/api/profile');
      return UserProfile.fromJson(res.data['profile'] ?? res.data);
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to load profile');
    }
  }

  Future<UserProfile> updateProfile(Map<String, dynamic> data) async {
    try {
      final res = await _dio.put('/api/profile', data: data);
      return UserProfile.fromJson(res.data['profile'] ?? res.data);
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to update profile');
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
      return res.data['profilePictureUrl'] ?? '';
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to upload photo');
    }
  }
}
