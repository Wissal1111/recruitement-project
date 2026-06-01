import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';

final recruitmentRepositoryProvider =
    Provider((ref) => RecruitmentRepository(ref.watch(dioProvider)));

class RecruitmentRepository {
  final Dio _dio;
  RecruitmentRepository(this._dio);

  /// Fetches all invitations for the currently logged-in user.
  /// Throws on error so the UI can show a proper error state.
  Future<List<dynamic>> getMyInvitations() async {
    final res = await _dio.get(
      '/api/recruitment/invitations/me',
      options: Options(receiveTimeout: const Duration(seconds: 10)),
    );
    debugPrint('getMyInvitations status: ${res.statusCode}');
    debugPrint('getMyInvitations data: ${res.data}');
    if (res.data is List) return res.data as List;
    // Some backends wrap in { "data": [...] } or { "invitations": [...] }
    if (res.data is Map) {
      final map = res.data as Map<String, dynamic>;
      if (map['data'] is List) return map['data'] as List;
      if (map['invitations'] is List) return map['invitations'] as List;
    }
    return [];
  }

  Future<void> acceptInvitation(String invitationId) async {
    try {
      await _dio.put('/api/recruitment/invitations/$invitationId/accept');
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      throw Exception('$status');
    }
  }

  Future<void> declineInvitation(String invitationId) async {
    try {
      await _dio.put('/api/recruitment/invitations/$invitationId/decline');
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      throw Exception('$status');
    }
  }


  /// Apply to a public study. Sends studyId + first phaseId.
  Future<void> applyToStudy(String studyId, {String? phaseId}) async {
    try {
      debugPrint('applyToStudy → studyId=$studyId phaseId=$phaseId');
      final data = <String, dynamic>{'studyId': studyId};
      if (phaseId != null && phaseId.isNotEmpty) {
        data['phaseId'] = phaseId;
      }
      final res = await _dio.post('/api/recruitment/apply', data: data);
      debugPrint('applyToStudy response: ${res.statusCode} ${res.data}');
    } on DioException catch (e) {
      debugPrint(
          'applyToStudy error: ${e.response?.statusCode} ${e.response?.data}');
      if (e.response?.statusCode == 409) {
        throw Exception('already_applied');
      }
      throw Exception(e.response?.data?.toString() ?? 'Failed to apply');
    }
  }

  /// Fetch all responses submitted for a study (Kim's view).
  Future<List<dynamic>> getStudyResponses(String studyId) async {
    try {
      final res = await _dio.get('/api/responses/study/$studyId',
          options: Options(receiveTimeout: const Duration(seconds: 10)));
      debugPrint(
          'getStudyResponses: ${res.statusCode} count=${res.data is List ? (res.data as List).length : '?'}');
      if (res.data is List) return res.data as List;
      if (res.data is Map) {
        final map = res.data as Map<String, dynamic>;
        if (map['data'] is List) return map['data'] as List;
        if (map['responses'] is List) return map['responses'] as List;
      }
      return [];
    } on DioException catch (e) {
      debugPrint(
          'getStudyResponses error: ${e.response?.statusCode} ${e.response?.data}');
      return [];
    }
  }

  /// Fetch responses for one specific participant in a study.
  Future<List<dynamic>> getParticipantResponses(
      String studyId, String userId) async {
    try {
      final res = await _dio.get(
        '/api/responses/study/$studyId/user/$userId',
        options: Options(receiveTimeout: const Duration(seconds: 10)),
      );
      if (res.data is List) return res.data as List;
      if (res.data is Map) {
        final map = res.data as Map<String, dynamic>;
        if (map['data'] is List) return map['data'] as List;
        if (map['responses'] is List) return map['responses'] as List;
      }
      return [];
    } on DioException catch (e) {
      debugPrint('getParticipantResponses error: ${e.response?.statusCode}');
      return [];
    }
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
      if (res.data is List) return res.data as List;
      return [];
    } on DioException catch (e) {
      debugPrint('getEligibleUsers status: ${e.response?.statusCode}');
      debugPrint('getEligibleUsers data: ${e.response?.data}');
      throw Exception(e.response?.data?.toString() ?? 'Failed to load users');
    } catch (e) {
      debugPrint('getEligibleUsers error: $e');
      throw Exception(e.toString());
    }
  }

  Future<void> setCriteria(
      String studyId, Map<String, dynamic> criteria) async {
    try {
      debugPrint('SET CRITERIA PAYLOAD: $criteria');
      await _dio.post(
        '/api/recruitment/studies/$studyId/criteria',
        data: criteria,
        options: Options(receiveTimeout: const Duration(seconds: 10)),
      );
      debugPrint('Criteria created successfully');
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      if (status == 409) {
        debugPrint('Criteria exists. Updating...');
        await _dio.put(
          '/api/recruitment/studies/$studyId/criteria',
          data: criteria,
          options: Options(receiveTimeout: const Duration(seconds: 10)),
        );
        debugPrint('Criteria updated successfully');
        return;
      }
      debugPrint('setCriteria failed status: ${e.response?.statusCode}');
      debugPrint('setCriteria failed data: ${e.response?.data}');
      rethrow;
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

  /// Returns null if no criteria exist yet (404 is normal).
  Future<Map<String, dynamic>?> getStudyCriteria(String studyId) async {
    try {
      final res = await _dio.get(
        '/api/recruitment/studies/$studyId/criteria',
        options: Options(
          receiveTimeout: const Duration(seconds: 5),
          // Don't throw on 404 — criteria simply don't exist yet
          validateStatus: (status) =>
              status != null && (status < 300 || status == 404),
        ),
      );
      if (res.statusCode == 404) return null;
      if (res.data is Map<String, dynamic>) return res.data;
      return null;
    } catch (e) {
      debugPrint('getStudyCriteria error: $e');
      return null;
    }
  }

  Future<void> inviteUser(String studyId, String userId) async {
    try {
      debugPrint('inviteUser → studyId=$studyId  userId=$userId');
      final res =
          await _dio.post('/api/recruitment/studies/$studyId/invite/$userId');
      debugPrint('inviteUser response: ${res.statusCode} ${res.data}');
    } on DioException catch (e) {
      debugPrint(
          'inviteUser error: ${e.response?.statusCode} ${e.response?.data}');
      if (e.response?.statusCode == 409) {
        throw Exception('User already invited');
      }
      throw Exception('Failed to send invitation: ${e.response?.data}');
    }
  }
}

final myInvitationsProvider = FutureProvider<List<dynamic>>((ref) async {
  // Calling read here is intentional: the provider is manually invalidated
  // after accept/decline so it re-fetches fresh data.
  return ref.read(recruitmentRepositoryProvider).getMyInvitations();
});

final myParticipationsProvider = FutureProvider<List<dynamic>>((ref) async {
  return ref.read(recruitmentRepositoryProvider).getMyParticipations();
});
