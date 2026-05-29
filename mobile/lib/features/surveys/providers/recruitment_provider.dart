import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';

final recruitmentRepositoryProvider =
    Provider((ref) => RecruitmentRepository(ref.watch(dioProvider)));

class RecruitmentRepository {
  final Dio _dio;
  RecruitmentRepository(this._dio);

  Future<List<dynamic>> getMyInvitations() async {
    try {
      final res = await _dio.get('/api/recruitment/invitations/me',
          options: Options(receiveTimeout: const Duration(seconds: 5)));
      if (res.data is List) return res.data;
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<void> acceptInvitation(String invitationId) async {
    await _dio.put('/api/recruitment/invitations/$invitationId/accept');
  }

  Future<void> declineInvitation(String invitationId) async {
    await _dio.put('/api/recruitment/invitations/$invitationId/decline');
  }

  Future<void> applyToStudy(String studyId, String phaseId) async {
    await _dio.post('/api/recruitment/apply', data: {
      'studyId': studyId,
      'phaseId': phaseId,
    });
  }

  Future<List<dynamic>> getStudyApplications(String studyId) async {
    try {
      final res = await _dio.get(
          '/api/recruitment/studies/$studyId/applications',
          options: Options(receiveTimeout: const Duration(seconds: 5)));
      if (res.data is List) return res.data;
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<void> reviewApplication(String applicationId, String decision,
      {String? notes}) async {
    await _dio.put('/api/recruitment/screening/$applicationId/review', data: {
      'decision': decision,
      'reviewNotes': notes ?? '',
    });
  }

  Future<void> launchCampaign(String studyId, String campaignName) async {
    await _dio.post('/api/recruitment/studies/$studyId/campaigns', data: {
      'campaignName': campaignName,
    });
  }

  Future<List<dynamic>> getEligibleUsers(String studyId) async {
    try {
      final res = await _dio.get(
        '/api/recruitment/studies/$studyId/criteria/eligible-users',
        options: Options(receiveTimeout: const Duration(seconds: 10)),
      );

      if (res.data is List) {
        return res.data as List;
      }

      return [];
    } catch (e) {
      debugPrint('getEligibleUsers error: $e');
      return [];
    }
  }

  Future<void> setCriteria(
      String studyId, Map<String, dynamic> criteria) async {
    try {
      await _dio.post('/api/recruitment/studies/$studyId/criteria',
          data: criteria,
          options: Options(receiveTimeout: const Duration(seconds: 5)));
    } catch (e) {
      debugPrint('setCriteria error: $e');
    }
  }

  Future<Map<String, dynamic>> previewEligiblePool(String studyId) async {
    try {
      final res = await _dio.get(
          '/api/recruitment/studies/$studyId/criteria/preview',
          options: Options(receiveTimeout: const Duration(seconds: 5)));
      return res.data as Map<String, dynamic>;
    } catch (e) {
      return {'estimatedCount': 0, 'eligibleUsers': []};
    }
  }

  Future<List<dynamic>> getMyParticipations() async {
    try {
      final res = await _dio.get('/api/recruitment/participations/me',
          options: Options(receiveTimeout: const Duration(seconds: 5)));
      if (res.data is List) return res.data;
      return [];
    } catch (e) {
      return [];
    }
  }
}

final myInvitationsProvider = FutureProvider<List<dynamic>>((ref) async {
  return ref.watch(recruitmentRepositoryProvider).getMyInvitations();
});

final myParticipationsProvider = FutureProvider<List<dynamic>>((ref) async {
  return ref.watch(recruitmentRepositoryProvider).getMyParticipations();
});
