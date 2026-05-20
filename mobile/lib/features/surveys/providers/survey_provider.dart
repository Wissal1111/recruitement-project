import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';
import '../models/survey_model.dart';

// 1. The Repository that talks to the Gateway (/api/studies)
final surveyRepositoryProvider =
    Provider((ref) => SurveyRepository(ref.watch(dioProvider)));

class SurveyRepository {
  final Dio _dio;
  SurveyRepository(this._dio);

  // Get all surveys
  Future<List<Study>> getMyStudies() async {
    try {
      final res = await _dio.get('/api/studies/my-studies');
      final List data = res.data['studies'] ?? [];
      return data.map((e) => Study.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load surveys');
    }
  }

  
  Future<void> updateStudy(String studyId, Map<String, dynamic> data) async {
    try {
      await _dio.put('/api/studies/$studyId', data: data);
    } on DioException catch (e) {
      throw Exception(
          e.response?.data?['message'] ?? 'Failed to update survey');
    }
  }
}

// 2. The Provider that feeds the UI
final mySurveysProvider = FutureProvider.autoDispose<List<Study>>((ref) async {
  return ref.watch(surveyRepositoryProvider).getMyStudies();
});
