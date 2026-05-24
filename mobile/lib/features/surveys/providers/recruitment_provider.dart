import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';

final recruitmentRepositoryProvider =
    Provider((ref) => RecruitmentRepository(ref.watch(dioProvider)));

class RecruitmentRepository {
  final Dio _dio;
  RecruitmentRepository(this._dio);

  Future<List<dynamic>> getMyInvitations() async {
    try {
      final res = await _dio.get('/api/recruitment/invitations/me');
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
      final res =
          await _dio.get('/api/recruitment/studies/$studyId/applications');
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

  Future<Map<String, dynamic>> getCampaignStats(String campaignId) async {
    try {
      final res =
          await _dio.get('/api/recruitment/campaigns/$campaignId/stats');
      return res.data as Map<String, dynamic>;
    } catch (e) {
      return {};
    }
  }

  // Maps Flutter education string → backend EducationLevel enum name
  String? _mapEducationLevel(String? education) {
    if (education == null) return null;
    const map = {
      'High School': 'HIGH_SCHOOL',
      "Bachelor's Degree": 'BACHELORS_DEGREE',
      "Master's Degree": 'MASTERS_DEGREE',
      'PhD': 'PHD',
    };
    return map[education];
  }

  // Sets eligibility criteria — only sends fields the backend actually accepts
  // interestIds skipped because backend needs UUIDs not strings
  Future<void> setCriteria(
      String studyId, Map<String, dynamic> criteria) async {
    // Build clean payload with only fields backend understands
    final payload = <String, dynamic>{};

    if (criteria['ageMin'] != null) payload['ageMin'] = criteria['ageMin'];
    if (criteria['ageMax'] != null) payload['ageMax'] = criteria['ageMax'];
    if (criteria['gender'] != null) payload['gender'] = criteria['gender'];

    // Country: send as-is, backend does case-insensitive match
    if (criteria['country'] != null) payload['country'] = criteria['country'];

    // Education: must be mapped to enum string
    final edu =
        _mapEducationLevel(criteria['educationLevel'] ?? criteria['education']);
    if (edu != null) payload['educationLevel'] = edu;

    // interestIds: only send if they are actual UUIDs, skip string interests
    final interests = criteria['interestIds'];
    if (interests != null && interests is List && interests.isNotEmpty) {
      // Check if they look like UUIDs
      final firstItem = interests.first.toString();
      final isUuid = RegExp(
              r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
              caseSensitive: false)
          .hasMatch(firstItem);
      if (isUuid) payload['interestIds'] = interests;
      // If strings like "UX Research" → skip, backend can't handle them
    }

    debugPrint('📤 Sending criteria: $payload');

    try {
      // Try POST first (create)
      final res = await _dio.post('/api/recruitment/studies/$studyId/criteria',
          data: payload);
      debugPrint('✅ Criteria created: ${res.statusCode}');
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        // Already exists → use PUT to update
        debugPrint('ℹ️ Criteria exists, updating...');
        final res = await _dio.put('/api/recruitment/studies/$studyId/criteria',
            data: payload);
        debugPrint('✅ Criteria updated: ${res.statusCode}');
      } else {
        debugPrint(
            '❌ Criteria failed: ${e.response?.statusCode} ${e.response?.data}');
        // Don't rethrow — criteria failure is non-fatal
      }
    }
  }

  // Preview returns eligibleCount only (backend limitation)
  // For actual user list we call fetchEligibleUsers via the user service
  Future<Map<String, dynamic>> previewEligiblePool(String studyId) async {
    try {
      final res =
          await _dio.get('/api/recruitment/studies/$studyId/criteria/preview');
      debugPrint('📥 Preview response: ${res.data}');
      if (res.data is Map) return res.data as Map<String, dynamic>;
      return {'eligibleCount': 0, 'eligibleUsers': []};
    } catch (e) {
      debugPrint('❌ Preview failed: $e');
      return {'eligibleCount': 0, 'eligibleUsers': []};
    }
  }

  Future<List<dynamic>> getEligibleUsers(String studyId) async {
    try {
      final res = await _dio
          .get('/api/recruitment/studies/$studyId/criteria/eligible-users');
      debugPrint('📥 Eligible users: ${res.data}');
      if (res.data is List) return res.data;
      return [];
    } catch (e) {
      debugPrint('❌ getEligibleUsers failed: $e');
      return [];
    }
  }

  Future<List<dynamic>> getMyParticipations() async {
    try {
      final res = await _dio.get('/api/recruitment/participations/me');
      if (res.data is List) return res.data;
      return [];
    } catch (e) {
      return [];
    }
  }
}

final myInvitationsProvider = FutureProvider.autoDispose((ref) async {
  return ref.watch(recruitmentRepositoryProvider).getMyInvitations();
});

final myParticipationsProvider = FutureProvider.autoDispose((ref) async {
  return ref.watch(recruitmentRepositoryProvider).getMyParticipations();
});
