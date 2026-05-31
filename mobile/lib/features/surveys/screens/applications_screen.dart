import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api_client.dart';
import '../../../shared/theme.dart';
import '../models/survey_model.dart';
import '../providers/recruitment_provider.dart';

class ApplicationsScreen extends ConsumerStatefulWidget {
  final Study survey;
  const ApplicationsScreen({super.key, required this.survey});

  @override
  ConsumerState<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends ConsumerState<ApplicationsScreen> {
  List<dynamic> _applications = [];
  List<dynamic> _allResponses = [];
  bool _isLoading = true;
  int _tabIndex = 0; // 0 = Pending, 1 = All

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final dio = ref.read(dioProvider);

      final apps = await ref
          .read(recruitmentRepositoryProvider)
          .getStudyApplications(widget.survey.studyId);

      List<dynamic> responses = [];
      try {
        final res =
            await dio.get('/api/responses/study/${widget.survey.studyId}');
        if (res.data is Map && res.data['data'] is List) {
          responses = res.data['data'] as List;
        } else if (res.data is List) {
          responses = res.data as List;
        }
      } catch (e) {
        debugPrint('Responses load error: $e');
      }

      if (mounted) {
        setState(() {
          _applications = apps;
          _allResponses = responses;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<dynamic> _responsesFor(String participantId) {
    return _allResponses
        .where((r) =>
            r['participantId'] == participantId && r['status'] == 'SUBMITTED')
        .toList();
  }

  int _phaseIndexOf(dynamic response) {
    return widget.survey.phases
        .indexWhere((p) => p['phaseId'] == response['phaseId']);
  }

  Future<void> _approveParticipant(
      Map<String, dynamic> app, int lastSubmittedPhaseIndex) async {
    final participantId = app['participantId']?.toString() ?? '';
    final appId = (app['id'] ?? app['applicationId'])?.toString();
    if (appId == null) return;

    final isLastPhase =
        lastSubmittedPhaseIndex >= widget.survey.phases.length - 1;
    final isMultiPhase = widget.survey.phases.length > 1;

    try {
      final dio = ref.read(dioProvider);
      await ref
          .read(recruitmentRepositoryProvider)
          .reviewApplication(appId, 'APPROVED');

      await dio.post('/api/notifications', data: {
        'userId': participantId,
        'title': isLastPhase ? 'Survey Complete!' : 'Phase Approved!',
        'message': isLastPhase
            ? 'Congratulations! You completed "${widget.survey.title}".'
            : 'Phase ${lastSubmittedPhaseIndex + 1} approved! Continue with Phase ${lastSubmittedPhaseIndex + 2}. [studyId:${widget.survey.studyId}][nextPhase:${lastSubmittedPhaseIndex + 1}]',
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(isMultiPhase && !isLastPhase
                ? 'Approved! Participant notified for Phase ${lastSubmittedPhaseIndex + 2}.'
                : 'Participant approved!'),
            backgroundColor: AppTheme.successColor));
        _load();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Approve failed: $e'),
            backgroundColor: AppTheme.errorColor));
      }
    }
  }

  Future<void> _declineParticipant(Map<String, dynamic> app) async {
    final participantId = app['participantId']?.toString() ?? '';
    final appId = (app['id'] ?? app['applicationId'])?.toString();
    if (appId == null) return;

    try {
      final dio = ref.read(dioProvider);
      await ref
          .read(recruitmentRepositoryProvider)
          .reviewApplication(appId, 'REJECTED');

      await dio.post('/api/notifications', data: {
        'userId': participantId,
        'title': 'Application Update',
        'message':
            'Your response for "${widget.survey.title}" was not approved.',
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Participant declined.'),
            backgroundColor: AppTheme.errorColor));
        _load();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Decline failed: $e'),
            backgroundColor: AppTheme.errorColor));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMultiPhase = widget.survey.phases.length > 1;

    final pending = _applications.where((a) {
      final s = (a['status'] ?? '').toString();
      return s == 'PENDING' || s == 'APPLIED';
    }).toList();

    final all = _applications;

    final displayed = _tabIndex == 0 ? pending : all;

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new,
                color: AppTheme.textPrimary, size: 20),
            onPressed: () => context.pop()),
        title: Text(isMultiPhase ? 'Participant Responses' : 'Applications',
            style: const TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
        actions: [
          IconButton(
              icon: const Icon(Icons.refresh, color: AppTheme.primary),
              onPressed: () {
                setState(() => _isLoading = true);
                _load();
              })
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Tab switcher
                Container(
                  color: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(children: [
                    _TabBtn(
                      label: 'Pending (${pending.length})',
                      selected: _tabIndex == 0,
                      onTap: () => setState(() => _tabIndex = 0),
                    ),
                    const SizedBox(width: 10),
                    _TabBtn(
                      label: 'All (${all.length})',
                      selected: _tabIndex == 1,
                      onTap: () => setState(() => _tabIndex = 1),
                    ),
                  ]),
                ),

                Expanded(
                  child: displayed.isEmpty
                      ? Center(
                          child: Padding(
                          padding: const EdgeInsets.all(40),
                          child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                    _tabIndex == 0
                                        ? Icons.done_all
                                        : Icons.inbox_outlined,
                                    size: 64,
                                    color: _tabIndex == 0
                                        ? AppTheme.successColor
                                        : AppTheme.textTertiary),
                                const SizedBox(height: 16),
                                Text(
                                    _tabIndex == 0
                                        ? 'No pending applications.'
                                        : 'No applications yet.',
                                    style: const TextStyle(
                                        fontSize: 16,
                                        color: AppTheme.textSecondary,
                                        fontWeight: FontWeight.w600)),
                              ]),
                        ))
                      : ListView.builder(
                          padding: const EdgeInsets.all(20),
                          itemCount: displayed.length,
                          itemBuilder: (context, index) {
                            final app =
                                displayed[index] as Map<String, dynamic>;
                            final participantId =
                                app['participantId']?.toString() ?? '';
                            final status = app['status'] ?? 'PENDING';
                            final responses = _responsesFor(participantId);
                            final hasResponses = responses.isNotEmpty;
                            final lastPhaseIndex = hasResponses
                                ? _phaseIndexOf(responses.last)
                                : -1;
                            final isPending =
                                status == 'PENDING' || status == 'APPLIED';

                            return _ParticipantCard(
                              app: app,
                              participantId: participantId,
                              status: status,
                              responses: responses,
                              survey: widget.survey,
                              isMultiPhase: isMultiPhase,
                              lastPhaseIndex: lastPhaseIndex,
                              hasResponses: hasResponses,
                              // Only show action buttons for pending
                              showActions: isPending,
                              onApprove: () =>
                                  _approveParticipant(app, lastPhaseIndex),
                              onDecline: () => _declineParticipant(app),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}

class _TabBtn extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _TabBtn(
      {required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
            color: selected ? AppTheme.primary : AppTheme.surfaceLow,
            borderRadius: BorderRadius.circular(9999)),
        child: Text(label,
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: selected ? Colors.white : AppTheme.textSecondary)),
      ),
    );
  }
}

class _ParticipantCard extends StatefulWidget {
  final Map<String, dynamic> app;
  final String participantId;
  final String status;
  final List<dynamic> responses;
  final Study survey;
  final bool isMultiPhase;
  final int lastPhaseIndex;
  final bool hasResponses;
  final bool showActions;
  final VoidCallback onApprove;
  final VoidCallback onDecline;

  const _ParticipantCard({
    required this.app,
    required this.participantId,
    required this.status,
    required this.responses,
    required this.survey,
    required this.isMultiPhase,
    required this.lastPhaseIndex,
    required this.hasResponses,
    required this.showActions,
    required this.onApprove,
    required this.onDecline,
  });

  @override
  State<_ParticipantCard> createState() => _ParticipantCardState();
}

class _ParticipantCardState extends State<_ParticipantCard> {
  bool _showAnswers = false;

  Color _statusColor(String s) {
    switch (s) {
      case 'APPROVED':
        return AppTheme.successColor;
      case 'REJECTED':
        return AppTheme.errorColor;
      default:
        return AppTheme.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final shortId = widget.participantId.length > 8
        ? '${widget.participantId.substring(0, 8)}...'
        : widget.participantId;
    final isLastPhase =
        widget.lastPhaseIndex >= widget.survey.phases.length - 1;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: AppTheme.ambientShadow),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Header
        Padding(
          padding: const EdgeInsets.all(20),
          child: Row(children: [
            CircleAvatar(
                backgroundColor: AppTheme.primaryContainer,
                radius: 22,
                child: Text(
                    shortId.isNotEmpty
                        ? shortId.substring(0, 1).toUpperCase()
                        : 'P',
                    style: const TextStyle(
                        color: AppTheme.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 16))),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text('Participant $shortId',
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 15)),
                  const SizedBox(height: 4),
                  Row(children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                          color: _statusColor(widget.status).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6)),
                      child: Text(widget.status,
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: _statusColor(widget.status))),
                    ),
                    if (widget.hasResponses) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                            color: AppTheme.successColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6)),
                        child: Text(
                            '${widget.responses.length}/${widget.survey.phases.length} phases',
                            style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.successColor)),
                      ),
                    ],
                  ]),
                ])),
          ]),
        ),

        // Answers toggle
        if (widget.hasResponses) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
            child: GestureDetector(
              onTap: () => setState(() => _showAnswers = !_showAnswers),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                    color: AppTheme.surfaceLow,
                    borderRadius: BorderRadius.circular(10)),
                child:
                    Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(
                      _showAnswers
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      size: 16,
                      color: AppTheme.primary),
                  const SizedBox(width: 8),
                  Text(
                      _showAnswers
                          ? 'Hide Answers'
                          : 'View All Answers (${widget.responses.length} phase${widget.responses.length > 1 ? 's' : ''})',
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primary)),
                ]),
              ),
            ),
          ),
          if (_showAnswers) ...[
            const SizedBox(height: 12),
            ...widget.responses.map((response) {
              final phaseIdx = widget.survey.phases
                  .indexWhere((p) => p['phaseId'] == response['phaseId']);
              final answers = response['answers'] as List? ?? [];
              final snapshot = response['snapshot'] as Map? ?? {};
              final questions = snapshot['questions'] as List? ?? [];

              return Container(
                margin: const EdgeInsets.fromLTRB(20, 0, 20, 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: AppTheme.surfaceLow,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.surfaceHigh)),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        const Icon(Icons.assignment_outlined,
                            size: 14, color: AppTheme.primary),
                        const SizedBox(width: 6),
                        Text(
                            'Phase ${phaseIdx >= 0 ? phaseIdx + 1 : '?'} Answers',
                            style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.primary)),
                      ]),
                      const SizedBox(height: 12),
                      ...answers.map((answer) {
                        final qId = answer['questionId'] ?? '';
                        final question = questions.firstWhere(
                            (q) => q['questionId'] == qId,
                            orElse: () => <String, dynamic>{});
                        final qText =
                            question['text']?.toString() ?? 'Question';
                        final value = answer['value'];
                        final displayValue = value is List
                            ? value.join(', ')
                            : value?.toString() ?? '-';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8)),
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(qText,
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary,
                                        fontWeight: FontWeight.w500)),
                                const SizedBox(height: 6),
                                Text(displayValue,
                                    style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AppTheme.textPrimary)),
                              ]),
                        );
                      }),
                    ]),
              );
            }),
          ],
        ] else ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: AppTheme.surfaceLow,
                  borderRadius: BorderRadius.circular(10)),
              child: const Row(children: [
                Icon(Icons.hourglass_empty_outlined,
                    size: 14, color: AppTheme.textTertiary),
                SizedBox(width: 8),
                Text('No answers submitted yet.',
                    style:
                        TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
              ]),
            ),
          ),
        ],

        // Action buttons — only for pending
        if (widget.showActions)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
            child: Row(children: [
              Expanded(
                  child: OutlinedButton(
                onPressed: widget.onDecline,
                style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.errorColor,
                    side: const BorderSide(color: AppTheme.errorColor),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10))),
                child: const Text('Decline'),
              )),
              const SizedBox(width: 12),
              Expanded(
                  child: ElevatedButton(
                onPressed: widget.onApprove,
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.successColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10))),
                child: Text(
                    widget.isMultiPhase && widget.hasResponses && !isLastPhase
                        ? 'Approve Phase ${widget.lastPhaseIndex + 1}'
                        : 'Approve'),
              )),
            ]),
          )
        else
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                  color: _statusColor(widget.status).withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8)),
              child: Row(children: [
                Icon(
                    widget.status == 'APPROVED'
                        ? Icons.check_circle_outline
                        : Icons.cancel_outlined,
                    size: 14,
                    color: _statusColor(widget.status)),
                const SizedBox(width: 8),
                Text(
                    widget.status == 'APPROVED'
                        ? 'Participant approved'
                        : 'Participant declined',
                    style: TextStyle(
                        fontSize: 13,
                        color: _statusColor(widget.status),
                        fontWeight: FontWeight.w500)),
              ]),
            ),
          ),
      ]),
    );
  }
}
