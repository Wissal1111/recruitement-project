import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';
import '../models/interest_model.dart';

final interestRepositoryProvider = Provider<InterestRepository>((ref) {
  return InterestRepository(dio: ref.watch(dioProvider));
});

class InterestRepository {
  final Dio _dio;
  InterestRepository({required Dio dio}) : _dio = dio;

  // GET /api/profile/interests/all — all available interests
  Future<List<Interest>> getAllInterests() async {
    try {
      final res = await _dio.get('/api/profile/interests/all');
      final list = res.data as List<dynamic>;
      return list
          .map((e) => Interest.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to load interests');
    }
  }

  // GET /api/profile/interests — current user's selected interests
  Future<List<UserInterest>> getUserInterests() async {
    try {
      final res = await _dio.get('/api/profile/interests');
      final list = res.data as List<dynamic>;
      return list
          .map((e) => UserInterest.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to load user interests');
    }
  }

  // POST /api/profile/interests — add an interest { interestId }
  Future<void> addInterest(String interestId) async {
    try {
      await _dio
          .post('/api/profile/interests', data: {'interestId': interestId});
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to add interest');
    }
  }

  // DELETE /api/profile/interests/:id — remove a user interest by its id
  Future<void> removeInterest(String userInterestId) async {
    try {
      await _dio.delete('/api/profile/interests/$userInterestId');
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to remove interest');
    }
  }
}
