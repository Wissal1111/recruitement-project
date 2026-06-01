import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';
import '../../../core/secure_storage.dart';
import '../../auth/providers/auth_provider.dart';
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
          options: Options(receiveTimeout: const Duration(seconds: 8)));
      final raw = res.data;
      List data;
      if (raw is Map && raw['studies'] != null) {
        data = raw['studies'];
      } else if (raw is List) {
        data = raw;
      } else {
        data = [];
      }
      final userId = await _storage.getUserId();
      final studies = data.map((e) => Study.fromJson(e)).toList();
      final hasCreatorId = studies.any((s) => s.creatorId.isNotEmpty);
      if (hasCreatorId && userId != null) {
        return studies.where((s) => s.creatorId == userId).toList();
      }
      return studies;
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> getStudyById(String studyId) async {
    try {
      final res = await _dio.get('/api/studies/$studyId',
          options: Options(receiveTimeout: const Duration(seconds: 8)));
      if (res.data is Map<String, dynamic>) return res.data;
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<List<Study>> getActiveStudies() async {
    try {
      final res = await _dio.get('/api/studies/active',
          options: Options(receiveTimeout: const Duration(seconds: 8)));
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
      final studies = data.map((e) => Study.fromJson(e)).toList();
      if (userId != null) {
        final hasCreatorId = studies.any((s) => s.creatorId.isNotEmpty);
        if (hasCreatorId) {
          return studies.where((s) => s.creatorId != userId).toList();
        }
      }
      return studies;
    } catch (e) {
      return [];
    }
  }

  // Returns studyIds Sarah has already participated in OR accepted invitations for
  Future<Set<String>> getMyParticipatedStudyIds() async {
    final Set<String> ids = {};
    try {
      // 1. Submitted responses
      final res = await _dio.get('/api/responses/me/by-study',
          options: Options(receiveTimeout: const Duration(seconds: 8)));
      final raw = res.data;
      List data = [];
      if (raw is Map && raw['data'] is List) {
        data = raw['data'];
      } else if (raw is List) {
        data = raw;
      }
      for (final e in data) {
        final id = e['studyId']?.toString();
        if (id != null) ids.add(id);
      }
    } catch (e) {
      debugPrint('Responses fetch error: $e');
    }

    try {
      // 2. Accepted/completed invitations
      final res = await _dio.get('/api/recruitment/invitations/me',
          options: Options(receiveTimeout: const Duration(seconds: 8)));
      final List invites = res.data is List ? res.data : [];
      for (final inv in invites) {
        final status = (inv['status'] ?? '').toString().toUpperCase();
        if (status == 'ACCEPTED' || status == 'COMPLETED') {
          final studyId = inv['studyId']?.toString();
          if (studyId != null) ids.add(studyId);
        }
      }
    } catch (e) {
      debugPrint('Invitations fetch error: $e');
    }

    return ids;
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
  ref.watch(authProvider);
  return ref.watch(surveyRepositoryProvider).getMyStudies();
});

final browseSurveysProvider = FutureProvider<List<Study>>((ref) async {
  ref.watch(authProvider);
  return ref.watch(surveyRepositoryProvider).getActiveStudies();
});

final myParticipatedStudyIdsProvider = FutureProvider<Set<String>>((ref) async {
  ref.watch(authProvider);
  return ref.watch(surveyRepositoryProvider).getMyParticipatedStudyIds();
});
