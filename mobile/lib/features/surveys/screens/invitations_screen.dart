import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../models/survey_model.dart';
import '../providers/recruitment_provider.dart';
import '../providers/survey_provider.dart';

class InvitationsScreen extends ConsumerStatefulWidget {
  const InvitationsScreen({super.key});

  @override
  ConsumerState<InvitationsScreen> createState() => _InvitationsScreenState();
}

class _InvitationsScreenState extends ConsumerState<InvitationsScreen> {
  bool _isProcessing = false;

  Future<void> _accept(String invitationId, Study? study) async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);

    try {
      await ref
          .read(recruitmentRepositoryProvider)
          .acceptInvitation(invitationId);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invitation accepted. Starting survey...'),
          backgroundColor: AppTheme.successColor,
        ),
      );

      ref.invalidate(myInvitationsProvider);

      // Go directly to phase 0
      if (study != null) {
        context.push('/surveys/answer', extra: {
          'survey': study,
          'phaseIndex': 0,
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to accept: $e'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _decline(String invitationId) async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);

    try {
      await ref
          .read(recruitmentRepositoryProvider)
          .declineInvitation(invitationId);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invitation declined.'),
          backgroundColor: AppTheme.errorColor,
        ),
      );

      ref.invalidate(myInvitationsProvider);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to decline: $e'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final invitesAsync = ref.watch(myInvitationsProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        title: const Text(
          'My Invitations',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        backgroundColor: AppTheme.surfaceBase,
        elevation: 0,
      ),
      body: invitesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) =>
            const Center(child: Text('Failed to load invitations')),
        data: (invites) {
          if (invites.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.mail_outline,
                        size: 64, color: AppTheme.textTertiary),
                    SizedBox(height: 16),
                    Text(
                      'No invitations yet.',
                      style: TextStyle(
                        fontSize: 16,
                        color: AppTheme.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: invites.length,
            itemBuilder: (context, index) {
              final invite = invites[index];

              final invitationId =
                  (invite['id'] ?? invite['invitationId'] ?? '').toString();

              final studyId = (invite['studyId'] ?? '').toString();

              return _InvitationCard(
                invitationId: invitationId,
                studyId: studyId,
                isProcessing: _isProcessing,
                onAccept: (study) => _accept(invitationId, study),
                onDecline: () => _decline(invitationId),
              );
            },
          );
        },
      ),
    );
  }
}

class _InvitationCard extends ConsumerStatefulWidget {
  final String invitationId;
  final String studyId;
  final bool isProcessing;
  final void Function(Study? study) onAccept;
  final VoidCallback onDecline;

  const _InvitationCard({
    required this.invitationId,
    required this.studyId,
    required this.isProcessing,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  ConsumerState<_InvitationCard> createState() => _InvitationCardState();
}

class _InvitationCardState extends ConsumerState<_InvitationCard> {
  Study? _study;
  bool _loadingStudy = true;

  @override
  void initState() {
    super.initState();
    _loadStudy();
  }

  Future<void> _loadStudy() async {
    final data =
        await ref.read(surveyRepositoryProvider).getStudyById(widget.studyId);

    if (!mounted) return;

    setState(() {
      if (data != null) {
        _study = Study.fromJson(data);
      }
      _loadingStudy = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final title = _study?.title ?? 'Survey';
    final description = _study?.description ?? '';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppTheme.ambientShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const CircleAvatar(
                backgroundColor: AppTheme.primaryContainer,
                child: Icon(Icons.mail, color: AppTheme.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'You were invited',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 2),
                    _loadingStudy
                        ? const Text(
                            'Loading survey...',
                            style: TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 12,
                            ),
                          )
                        : Text(
                            title,
                            style: const TextStyle(
                              color: AppTheme.primary,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ],
                ),
              ),
            ],
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: widget.isProcessing ? null : widget.onDecline,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.errorColor,
                    side: const BorderSide(color: AppTheme.errorColor),
                  ),
                  child: const Text('Decline'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: widget.isProcessing
                      ? null
                      : () => widget.onAccept(_study),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.successColor,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Accept'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
