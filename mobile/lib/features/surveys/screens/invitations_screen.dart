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
  // Track processing per invitationId — not global
  final Set<String> _processing = {};

  Future<void> _accept(String invitationId, Study? study) async {
    if (_processing.contains(invitationId)) return;
    setState(() => _processing.add(invitationId));

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

      if (study != null) {
        context.push('/surveys/answer', extra: {
          'survey': study,
          'phaseIndex': 0,
        });
      }
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString().contains('409')
          ? 'This invitation was already handled.'
          : 'Failed to accept invitation.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: AppTheme.errorColor),
      );
      ref.invalidate(myInvitationsProvider);
    } finally {
      if (mounted) setState(() => _processing.remove(invitationId));
    }
  }

  Future<void> _decline(String invitationId) async {
    if (_processing.contains(invitationId)) return;
    setState(() => _processing.add(invitationId));

    try {
      await ref
          .read(recruitmentRepositoryProvider)
          .declineInvitation(invitationId);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Invitation declined.'),
            backgroundColor: AppTheme.errorColor),
      );
      ref.invalidate(myInvitationsProvider);
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString().contains('409')
          ? 'This invitation was already handled.'
          : 'Failed to decline invitation.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: AppTheme.errorColor),
      );
      ref.invalidate(myInvitationsProvider);
    } finally {
      if (mounted) setState(() => _processing.remove(invitationId));
    }
  }

  @override
  Widget build(BuildContext context) {
    final invitesAsync = ref.watch(myInvitationsProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        title: const Text('My Invitations',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 18)),
        backgroundColor: AppTheme.surfaceBase,
        elevation: 0,
        actions: [
          // Manual refresh button so Sarah can force a re-fetch
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: () => ref.invalidate(myInvitationsProvider),
          ),
        ],
      ),
      body: invitesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) {
          // Show the actual error so we can debug it
          debugPrint('myInvitationsProvider error: $err');
          debugPrint('$stack');
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.cloud_off_outlined,
                      size: 56, color: AppTheme.textTertiary),
                  const SizedBox(height: 16),
                  const Text('Could not load invitations',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimary)),
                  const SizedBox(height: 8),
                  Text(
                    err.toString(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        fontSize: 12, color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => ref.invalidate(myInvitationsProvider),
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text('Try Again'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        data: (invites) {
          // Debug: log all raw invites so we can check statuses
          debugPrint('Raw invitations count: ${invites.length}');
          for (final inv in invites) {
            debugPrint(
                '  → id=${inv['id'] ?? inv['invitationId']}  status=${inv['status']}  studyId=${inv['studyId']}');
          }

          final pending = invites.where((inv) {
            final status = (inv['status'] ?? '').toString().toUpperCase();
            return status == 'PENDING';
          }).toList();

          debugPrint('Pending invitations: ${pending.length}');

          if (pending.isEmpty) {
            return RefreshIndicator(
              onRefresh: () async => ref.invalidate(myInvitationsProvider),
              child: ListView(
                children: const [
                  SizedBox(height: 120),
                  Center(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.mail_outline,
                              size: 64, color: AppTheme.textTertiary),
                          SizedBox(height: 16),
                          Text('No pending invitations.',
                              style: TextStyle(
                                  fontSize: 16,
                                  color: AppTheme.textSecondary,
                                  fontWeight: FontWeight.w600)),
                          SizedBox(height: 8),
                          Text(
                            'Pull down to refresh.',
                            style: TextStyle(
                                fontSize: 13, color: AppTheme.textTertiary),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(myInvitationsProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: pending.length,
              itemBuilder: (context, index) {
                final invite = pending[index];
                final invitationId =
                    (invite['id'] ?? invite['invitationId'] ?? '').toString();
                final studyId = (invite['studyId'] ?? '').toString();
                final isThisProcessing = _processing.contains(invitationId);

                return _InvitationCard(
                  key: Key('invite_$invitationId'),
                  invitationId: invitationId,
                  studyId: studyId,
                  isProcessing: isThisProcessing,
                  onAccept: (study) => _accept(invitationId, study),
                  onDecline: () => _decline(invitationId),
                );
              },
            ),
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
    super.key,
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
    if (widget.studyId.isEmpty) {
      if (mounted) setState(() => _loadingStudy = false);
      return;
    }
    final data =
        await ref.read(surveyRepositoryProvider).getStudyById(widget.studyId);
    if (!mounted) return;
    setState(() {
      if (data != null) _study = Study.fromJson(data);
      _loadingStudy = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final title = _study?.title ?? 'Survey';
    final description = _study?.description ?? '';
    final phases = _study?.phaseCount ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppTheme.ambientShadow,
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const CircleAvatar(
            backgroundColor: AppTheme.primaryContainer,
            child: Icon(Icons.mail, color: AppTheme.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('You were invited',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              const SizedBox(height: 2),
              _loadingStudy
                  ? const Text('Loading...',
                      style: TextStyle(
                          color: AppTheme.textSecondary, fontSize: 12))
                  : Text(title,
                      style: const TextStyle(
                          color: AppTheme.primary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600)),
            ]),
          ),
        ]),
        if (!_loadingStudy && description.isNotEmpty) ...[
          const SizedBox(height: 10),
          Text(description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style:
                  const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
        ],
        if (!_loadingStudy) ...[
          const SizedBox(height: 10),
          Row(children: [
            const Icon(Icons.layers_outlined,
                size: 13, color: AppTheme.textTertiary),
            const SizedBox(width: 4),
            Text('$phases phases',
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textTertiary)),
          ]),
        ],
        const SizedBox(height: 16),
        Row(children: [
          Expanded(
            child: OutlinedButton(
              onPressed: widget.isProcessing ? null : widget.onDecline,
              style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.errorColor,
                  side: const BorderSide(color: AppTheme.errorColor)),
              child: const Text('Decline'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed:
                  widget.isProcessing ? null : () => widget.onAccept(_study),
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.successColor,
                  foregroundColor: Colors.white),
              child: widget.isProcessing
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Text('Accept'),
            ),
          ),
        ]),
      ]),
    );
  }
}
