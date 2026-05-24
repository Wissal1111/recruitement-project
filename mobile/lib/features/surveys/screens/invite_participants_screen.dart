import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../models/survey_model.dart';
import '../providers/recruitment_provider.dart';

class InviteParticipantsScreen extends ConsumerStatefulWidget {
  final Study survey;
  const InviteParticipantsScreen({super.key, required this.survey});

  @override
  ConsumerState<InviteParticipantsScreen> createState() =>
      _InviteParticipantsScreenState();
}

class _InviteParticipantsScreenState
    extends ConsumerState<InviteParticipantsScreen> {
  final Set<String> _invitedUsers = {};
  Map<String, dynamic>? _previewData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadEligibleParticipants();
  }

  Future<void> _loadEligibleParticipants() async {
    try {
      final users = await ref
          .read(recruitmentRepositoryProvider)
          .getEligibleUsers(widget.survey.studyId);
      if (mounted) {
        setState(() {
          _previewData = {'eligibleUsers': users};
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading participants: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _sendInvite(String participantId) async {
    try {
      // Launch a campaign targeting this specific user
      await ref
          .read(recruitmentRepositoryProvider)
          .launchCampaign(widget.survey.studyId, 'Invite $participantId');
      setState(() => _invitedUsers.add(participantId));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Invitation sent!'),
            backgroundColor: AppTheme.successColor));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Failed to send invitation.'),
            backgroundColor: AppTheme.errorColor));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final participants = (_previewData?['eligibleUsers'] as List?) ?? [];

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new,
                color: AppTheme.textPrimary, size: 20),
            onPressed: () => context.pop()),
        title: const Text('Find Participants',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  color: Colors.white,
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('For: ${widget.survey.title}',
                            style: const TextStyle(
                                fontSize: 13, color: AppTheme.textSecondary)),
                        const SizedBox(height: 8),
                        Text('${participants.length} Eligible Participants',
                            style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textPrimary)),
                        const SizedBox(height: 4),
                        const Text(
                            'Participants that match your survey criteria. Invite them to participate!',
                            style: TextStyle(
                                fontSize: 14, color: AppTheme.textSecondary)),
                      ]),
                ),
                Expanded(
                  child: participants.isEmpty
                      ? const Center(
                          child: Padding(
                              padding: EdgeInsets.all(40),
                              child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.person_search,
                                        size: 64, color: AppTheme.textTertiary),
                                    SizedBox(height: 16),
                                    Text('No matching participants found.',
                                        style: TextStyle(
                                            fontSize: 16,
                                            color: AppTheme.textSecondary,
                                            fontWeight: FontWeight.w600)),
                                    SizedBox(height: 8),
                                    Text(
                                        'Try setting your eligibility criteria first from the Survey Dashboard.',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                            fontSize: 13,
                                            color: AppTheme.textTertiary)),
                                  ])))
                      : ListView.builder(
                          padding: const EdgeInsets.all(20),
                          itemCount: participants.length,
                          itemBuilder: (context, index) {
                            final user = participants[index];
                            final id = user['userId']?.toString() ?? '$index';
                            final isInvited = _invitedUsers.contains(id);

                            return Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border:
                                      Border.all(color: AppTheme.surfaceHigh)),
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(children: [
                                      CircleAvatar(
                                        backgroundColor:
                                            AppTheme.primaryContainer,
                                        child: Text(
                                            (user['firstname'] ??
                                                    user['email'] ??
                                                    'U')
                                                .toString()[0]
                                                .toUpperCase(),
                                            style: const TextStyle(
                                                color: AppTheme.primary,
                                                fontWeight: FontWeight.bold)),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                          child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                            Text(
                                                '${user['firstname'] ?? ''} ${user['lastname'] ?? ''}'
                                                    .trim(),
                                                style: const TextStyle(
                                                    fontWeight: FontWeight.w700,
                                                    fontSize: 16)),
                                            Text(user['email'] ?? '',
                                                style: const TextStyle(
                                                    color:
                                                        AppTheme.textSecondary,
                                                    fontSize: 13)),
                                          ])),
                                    ]),
                                    const SizedBox(height: 16),
                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton(
                                        onPressed: isInvited
                                            ? null
                                            : () => _sendInvite(id),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: isInvited
                                              ? AppTheme.surfaceHigh
                                              : AppTheme.primary,
                                          foregroundColor: isInvited
                                              ? AppTheme.textSecondary
                                              : Colors.white,
                                          elevation: 0,
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12)),
                                        ),
                                        child: Text(isInvited
                                            ? '✓ Invitation Sent'
                                            : 'Send Invitation'),
                                      ),
                                    ),
                                  ]),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
