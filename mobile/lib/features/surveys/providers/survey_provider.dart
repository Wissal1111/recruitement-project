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
      final res = await _dio.get('/api/studies/my-studies',
          options: Options(
            receiveTimeout: const Duration(seconds: 8),
            sendTimeout: const Duration(seconds: 5),
          ));
      final raw = res.data;
      List data;
      if (raw is Map && raw['studies'] != null) {
        data = raw['studies'];
      } else if (raw is List) {
        data = raw;
      } else {
        data = [];
      }
      return data.map((e) => Study.fromJson(e)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<Study>> getActiveStudies() async {
    try {
      final res = await _dio.get('/api/studies/active',
          options: Options(
            receiveTimeout: const Duration(seconds: 8),
            sendTimeout: const Duration(seconds: 5),
          ));
      final raw = res.data;
      List data;
      if (raw is List) {
        data = raw;
      } else if (raw is Map && raw['studies'] != null) {
        data = raw['studies'];
      } else {
        data = [];
      }
      final userId = await _storage.getUserId();
      return data
          .map((e) => Study.fromJson(e))
          .where((s) => s.creatorId != userId)
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> publishStudy(String studyId) async {
    await _dio.patch('/api/studies/$studyId/status');
  }

  Future<void> updateStudy(String studyId, Map<String, dynamic> data) async {
    await _dio.put('/api/studies/$studyId', data: data);
  }

  Future<void> deleteStudy(String studyId) async {
    await _dio.delete('/api/studies/$studyId');
  }
}

final mySurveysProvider = FutureProvider<List<Study>>((ref) async {
  return ref.watch(surveyRepositoryProvider).getMyStudies();
});

final browseSurveysProvider = FutureProvider<List<Study>>((ref) async {
  return ref.watch(surveyRepositoryProvider).getActiveStudies();
});
