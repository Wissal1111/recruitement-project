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
  List<dynamic> _participants = [];
  bool _isLoading = true;
  String? _error;

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
          _participants = users;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading participants: $e');
      if (mounted) {
        setState(() {
          _error = 'Failed to load participants';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _sendInvite(String participantId) async {
    try {
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
          : _error != null
              ? Center(
                  child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                      const Icon(Icons.error_outline,
                          size: 48, color: AppTheme.errorColor),
                      const SizedBox(height: 16),
                      Text(_error!,
                          style:
                              const TextStyle(color: AppTheme.textSecondary)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _isLoading = true;
                            _error = null;
                          });
                          _loadEligibleParticipants();
                        },
                        child: const Text('Retry'),
                      )
                    ]))
              : Column(
                  children: [
                    // Header
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      color: Colors.white,
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('For: ${widget.survey.title}',
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textSecondary)),
                            const SizedBox(height: 8),
                            Text(
                                '${_participants.length} Eligible Participant${_participants.length == 1 ? '' : 's'}',
                                style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w800,
                                    color: AppTheme.textPrimary)),
                            const SizedBox(height: 4),
                            const Text(
                                'These users match your survey criteria.',
                                style: TextStyle(
                                    fontSize: 14,
                                    color: AppTheme.textSecondary)),
                          ]),
                    ),

                    // List
                    Expanded(
                      child: _participants.isEmpty
                          ? const Center(
                              child: Padding(
                                  padding: EdgeInsets.all(40),
                                  child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.person_search,
                                            size: 64,
                                            color: AppTheme.textTertiary),
                                        SizedBox(height: 16),
                                        Text('No matching participants found.',
                                            style: TextStyle(
                                                fontSize: 16,
                                                color: AppTheme.textSecondary,
                                                fontWeight: FontWeight.w600)),
                                        SizedBox(height: 8),
                                        Text(
                                            'Make sure you set eligibility criteria when creating the survey.',
                                            textAlign: TextAlign.center,
                                            style: TextStyle(
                                                fontSize: 13,
                                                color: AppTheme.textTertiary)),
                                      ])))
                          : ListView.builder(
                              padding: const EdgeInsets.all(20),
                              itemCount: _participants.length,
                              itemBuilder: (context, index) {
                                final user = _participants[index];
                                final id =
                                    user['userId']?.toString() ?? '$index';
                                final isInvited = _invitedUsers.contains(id);
                                final firstName = user['firstname'] ??
                                    user['firstName'] ??
                                    '';
                                final lastName =
                                    user['lastname'] ?? user['lastName'] ?? '';
                                final fullName = '$firstName $lastName'.trim();
                                final email = user['email'] ?? '';
                                final country = user['country'] ?? '';
                                final education = user['education'] ?? '';
                                final age = user['age'];

                                return Container(
                                  margin: const EdgeInsets.only(bottom: 16),
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                          color: AppTheme.surfaceHigh)),
                                  child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(children: [
                                          CircleAvatar(
                                            radius: 24,
                                            backgroundColor:
                                                AppTheme.primaryContainer,
                                            child: Text(
                                                (fullName.isNotEmpty
                                                        ? fullName
                                                        : email)
                                                    .substring(0, 1)
                                                    .toUpperCase(),
                                                style: const TextStyle(
                                                    color: AppTheme.primary,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 18)),
                                          ),
                                          const SizedBox(width: 14),
                                          Expanded(
                                              child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                Text(
                                                    fullName.isNotEmpty
                                                        ? fullName
                                                        : 'Anonymous',
                                                    style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.w700,
                                                        fontSize: 16,
                                                        color: AppTheme
                                                            .textPrimary)),
                                                Text(email,
                                                    style: const TextStyle(
                                                        color: AppTheme
                                                            .textSecondary,
                                                        fontSize: 13)),
                                              ])),
                                        ]),
                                        if (country.isNotEmpty ||
                                            education.isNotEmpty ||
                                            age != null) ...[
                                          const SizedBox(height: 12),
                                          Wrap(
                                            spacing: 8,
                                            runSpacing: 6,
                                            children: [
                                              if (age != null)
                                                _Tag(
                                                    icon: Icons.cake_outlined,
                                                    label: '$age yrs'),
                                              if (country.isNotEmpty)
                                                _Tag(
                                                    icon: Icons.public,
                                                    label: country),
                                              if (education.isNotEmpty)
                                                _Tag(
                                                    icon: Icons.school_outlined,
                                                    label: education
                                                        .toString()
                                                        .replaceAll('_', ' ')),
                                            ],
                                          ),
                                        ],
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
                                                      BorderRadius.circular(
                                                          12)),
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

class _Tag extends StatelessWidget {
  final IconData icon;
  final String label;
  const _Tag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
          color: AppTheme.surfaceLow,
          borderRadius: BorderRadius.circular(9999)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 12, color: AppTheme.textSecondary),
        const SizedBox(width: 4),
        Text(label,
            style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.w500)),
      ]),
    );
  }
}
