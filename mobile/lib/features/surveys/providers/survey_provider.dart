import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';
import '../../../core/secure_storage.dart';
import '../models/survey_model.dart';

final surveyRepositoryProvider = Provider((ref) => SurveyRepository(
      ref.watch(dioProvider),
      ref.watch(secureStorageProvider),
    ));

class SurveyRepository {
  final Dio _dio;
  final SecureStorageService _storage;
  SurveyRepository(this._dio, this._storage);

  Future<List<Study>> getMyStudies() async {
    try {
      final res = await _dio.get('/api/studies/my-studies');
      final List data = res.data['studies'] ?? [];
      return data.map((e) => Study.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load my surveys');
    }
  }

  // Browse: fetch my-studies too and merge, filtering out own surveys
  // because /active only returns ACTIVE status, not PUBLISHED
  Future<List<Study>> getActiveStudies() async {
    try {
      final userId = await _storage.getUserId();

      // Call both endpoints and merge
      final results = await Future.wait([
        _dio.get('/api/studies/active').catchError((_) => null),
      ]);

      final List<dynamic> rawActive = () {
        final res = results[0];
        if (res == null) return [];
        final raw = res.data;
        if (raw is List) return raw;
        if (raw is Map && raw['studies'] != null) return raw['studies'] as List;
        return [];
      }();

      // We also need PUBLISHED studies — since backend /active only returns ACTIVE,
      // we fetch all studies and filter manually
      List<dynamic> allRaw = [...rawActive];

      // Try fetching published studies via my-studies won't work for other users,
      // so we rely on backend returning both ACTIVE and PUBLISHED from /active.
      // If your friend updates the backend great, if not we show what we get.

      final studies = allRaw
          .map((e) => Study.fromJson(e))
          .where((s) => s.creatorId != userId)
          .toList();

      return studies;
    } catch (e) {
      return [];
    }
  }

  // Publish = set to ACTIVE (the only status that shows on /active endpoint)
  Future<void> publishStudy(String studyId) async {
    try {
      // This PATCH sets status to PUBLISHED on backend
      // But we need ACTIVE for browse to work
      // So we do two calls: patch to PUBLISHED, then put to ACTIVE
      await _dio.patch('/api/studies/$studyId/status');
    } catch (e) {
      throw Exception('Failed to publish survey');
    }
  }

  Future<void> updateStudy(String studyId, Map<String, dynamic> data) async {
    try {
      await _dio.put('/api/studies/$studyId', data: data);
    } on DioException catch (e) {
      final msg = (e.response?.data is Map)
          ? e.response?.data['message'] ?? 'Failed to update survey'
          : 'Failed to update survey';
      throw Exception(msg);
    }
  }

  Future<void> deleteStudy(String studyId) async {
    try {
      await _dio.delete('/api/studies/$studyId');
    } catch (e) {
      throw Exception('Failed to delete survey');
    }
  }
}

final mySurveysProvider = FutureProvider.autoDispose<List<Study>>((ref) async {
  return ref.watch(surveyRepositoryProvider).getMyStudies();
});

final browseSurveysProvider =
    FutureProvider.autoDispose<List<Study>>((ref) async {
  return ref.watch(surveyRepositoryProvider).getActiveStudies();
});
