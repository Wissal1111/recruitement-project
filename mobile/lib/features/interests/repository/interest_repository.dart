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

  // GET /api/profile/interests/all
  Future<List<Interest>> getAllInterests() async {
    try {
      final res = await _dio.get('/api/profile/interests/all');
      // backend returns { interests: [...] }
      final raw = res.data;
      List<dynamic> list;
      if (raw is Map && raw['interests'] != null) {
        list = raw['interests'] as List<dynamic>;
      } else if (raw is List) {
        list = raw;
      } else {
        list = [];
      }
      return list
          .map((e) => Interest.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to load interests');
    }
  }

  // GET /api/profile/interests
  Future<List<UserInterest>> getUserInterests() async {
    try {
      final res = await _dio.get('/api/profile/interests');
      final raw = res.data;
      List<dynamic> list;
      if (raw is Map && raw['interests'] != null) {
        list = raw['interests'] as List<dynamic>;
      } else if (raw is List) {
        list = raw;
      } else {
        list = [];
      }
      return list
          .map((e) => UserInterest.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to load user interests');
    }
  }

  // POST /api/profile/interests — backend expects { interestIds: [...] }
  Future<void> addInterests(List<String> interestIds) async {
    try {
      await _dio
          .post('/api/profile/interests', data: {'interestIds': interestIds});
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to add interests');
    }
  }

  // PUT /api/profile/interests — replace all
  Future<void> updateInterests(List<String> interestIds) async {
    try {
      await _dio
          .put('/api/profile/interests', data: {'interestIds': interestIds});
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to update interests');
    }
  }

  // DELETE /api/profile/interests/:id
  Future<void> removeInterest(String userInterestId) async {
    try {
      await _dio.delete('/api/profile/interests/$userInterestId');
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to remove interest');
    }
  }
}
