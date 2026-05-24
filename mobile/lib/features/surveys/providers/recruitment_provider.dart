import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';

final recruitmentRepositoryProvider =
    Provider((ref) => RecruitmentRepository(ref.watch(dioProvider)));

class RecruitmentRepository {
  final Dio _dio;
  RecruitmentRepository(this._dio);

  // 1. Get Invitations for the Participant
  Future<List<dynamic>> getMyInvitations() async {
    try {
      final res = await _dio.get('/api/recruitment/invitations/me');
      return res.data as List<dynamic>;
    } catch (e) {
      return [];
    }
  }

  // 2. Accept or Decline Invitation
  Future<void> respondToInvitation(String invitationId, bool accept) async {
    final action = accept ? 'accept' : 'decline';
    await _dio.put('/api/recruitment/invitations/$invitationId/$action');
  }

  // 3. Preview Participants (For Creators)
  Future<Map<String, dynamic>> previewEligiblePool(String studyId) async {
    try {
      final res =
          await _dio.get('/api/recruitment/studies/$studyId/criteria/preview');
      return res.data as Map<String, dynamic>;
    } catch (e) {
      throw Exception("Failed to load eligible participants");
    }
  }

  // 4. Send Invitations (Launch Campaign)
  Future<void> launchCampaign(String studyId) async {
    await _dio.post('/api/recruitment/studies/$studyId/campaigns',
        data: {"campaignName": "Initial Recruitment"});
  }
}

// Provider for the Invitations Screen
final myInvitationsProvider = FutureProvider.autoDispose((ref) async {
  return ref.watch(recruitmentRepositoryProvider).getMyInvitations();
});
