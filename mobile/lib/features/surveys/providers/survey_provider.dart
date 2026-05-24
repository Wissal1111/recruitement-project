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

  // Get MY surveys (Creator view)
  Future<List<Study>> getMyStudies() async {
    try {
      final res = await _dio.get('/api/studies/my-studies');
      final List data = res.data['studies'] ?? [];
      return data.map((e) => Study.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load my surveys');
    }
  }

  // Get ALL published surveys (Browse view - for participants)
  Future<List<Study>> getAllPublishedStudies() async {
    try {
      // Get all my studies first so we can exclude them from browse
      final myRes = await _dio.get('/api/studies/my-studies');
      final List myData = myRes.data['studies'] ?? [];
      final myIds = myData.map((e) => e['studyId']).toSet();

      // Now get the current user's ID
      final userId = await _storage.getUserId();

      // Get ALL studies (we need a backend endpoint for this)
      // For now, we use my-studies but in the future your friend should add GET /api/studies/all
      // TEMPORARY: Return empty if no public endpoint exists yet
      // When your friend adds the endpoint, uncomment the code below:
      
      // final res = await _dio.get('/api/studies/published');
      // final List data = res.data['studies'] ?? [];
      // return data.map((e) => Study.fromJson(e)).where((s) => s.creatorId != userId).toList();
      
      return []; // Remove this line when the endpoint exists
    } catch (e) {
      return [];
    }
  }

  // Update an existing survey
  Future<void> updateStudy(String studyId, Map<String, dynamic> data) async {
    try {
      await _dio.put('/api/studies/$studyId', data: data);
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to update survey');
    }
  }
}

// Provider for MY surveys
final mySurveysProvider = FutureProvider.autoDispose<List<Study>>((ref) async {
  return ref.watch(surveyRepositoryProvider).getMyStudies();
});

// Provider for ALL browsable surveys
final browseSurveysProvider = FutureProvider.autoDispose<List<Study>>((ref) async {
  return ref.watch(surveyRepositoryProvider).getAllPublishedStudies();
});