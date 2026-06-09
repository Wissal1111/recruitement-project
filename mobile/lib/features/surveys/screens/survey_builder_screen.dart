import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api_client.dart';
import '../../../shared/theme.dart';
import '../../surveys/providers/survey_provider.dart';
import '../providers/recruitment_provider.dart';

class SurveyBuilderScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> surveyData;
  const SurveyBuilderScreen({super.key, required this.surveyData});

  @override
  ConsumerState<SurveyBuilderScreen> createState() =>
      _SurveyBuilderScreenState();
}

class _SurveyBuilderScreenState extends ConsumerState<SurveyBuilderScreen> {
  int _activePhase = 0;
  int _phases = 1;
  bool _isPublishing = false;

  final Map<int, List<Map<String, dynamic>>> _phaseQuestions = {
    0: [
      {
        'type': 'SHORT TEXT',
        'text': '',
        'required': true,
      }
    ]
  };

  @override
  void initState() {
    super.initState();

    if (widget.surveyData['studyId'] != null &&
        widget.surveyData['phases'] != null) {
      final existingPhases = widget.surveyData['phases'] as List;

      if (existingPhases.isNotEmpty) {
        _phases = existingPhases.length;
        _phaseQuestions.clear();

        for (int i = 0; i < existingPhases.length; i++) {
          final phase = existingPhases[i];
          final questions = phase['questions'] as List? ?? [];

          _phaseQuestions[i] = questions.map<Map<String, dynamic>>((q) {
            String uiType = 'SHORT TEXT';
            if (q['questionType'] == 'SINGLE_CHOICE')
              uiType = 'MULTIPLE CHOICE';
            else if (q['questionType'] == 'MULTIPLE_CHOICE')
              uiType = 'CHECKBOX';
            else if (q['questionType'] == 'RATING_SCALE') uiType = 'RATING';

            String text = q['text'] ?? '';
            if (text.trim().isEmpty) text = '';

            return {
              'id': q['questionId'],
              'type': uiType,
              'text': text,
              'required': q['isRequired'] ?? false,
              'options': (q['options'] as List?)
                      ?.map((o) => o['label'].toString())
                      .toList() ??
                  ['Option 1', 'Option 2'],
            };
          }).toList();
        }
      }
    }
  }

  void _showAddQuestion() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _AddQuestionSheet(
        onSelect: (type) {
          Navigator.pop(context);
          setState(() {
            _phaseQuestions[_activePhase] ??= [];
            _phaseQuestions[_activePhase]!.add({
              'type': type.toUpperCase(),
              'text': '',
              'required': false,
              if (type == 'Multiple choice' ||
                  type == 'Checkbox' ||
                  type == 'Dropdown')
                'options': ['Option 1', 'Option 2'],
            });
          });
        },
      ),
    );
  }

  Future<void> _publish() async {
    setState(() => _isPublishing = true);

    try {
      final dio = ref.read(dioProvider);

      // ✅ Get reward and participant info from create screen
      final rewardPerParticipant =
          (widget.surveyData['rewardPerParticipant'] as num?)?.toDouble() ??
              0.0;
      final maxParticipants =
          (widget.surveyData['maxParticipants'] as num?)?.toInt() ?? 10;
      final isMultiPhase = _phases > 1;

      // ✅ Option B: Total reward divided equally across rewarded phases
      // Phase 1 in multi-phase = screening (no reward)
      // Remaining phases share the total reward equally
      final rewardedPhasesCount = isMultiPhase ? (_phases - 1) : 1;

      final rewardPerPhase = rewardedPhasesCount > 0
          ? (rewardPerParticipant / rewardedPhasesCount)
          : rewardPerParticipant;

      debugPrint('Total reward per participant: $rewardPerParticipant pts');
      debugPrint('Number of rewarded phases: $rewardedPhasesCount');
      debugPrint('Reward per phase: $rewardPerPhase pts');

      // 1. Build phases payload
      final phasesPayload = [];

      for (int i = 0; i < _phases; i++) {
        final qList = _phaseQuestions[i] ?? [];

        final formattedQuestions = qList.asMap().entries.map((e) {
          final index = e.key;
          final q = e.value;

          String backendType = 'TEXT';
          if (q['type'] == 'MULTIPLE CHOICE' || q['type'] == 'DROPDOWN') {
            backendType = 'SINGLE_CHOICE';
          }
          if (q['type'] == 'CHECKBOX') {
            backendType = 'MULTIPLE_CHOICE';
          }
          if (q['type'] == 'RATING') {
            backendType = 'RATING_SCALE';
          }

          final options =
              (q['options'] as List<String>?)?.asMap().entries.map((opt) {
                    return {
                      'label': opt.value,
                      'value': opt.value,
                      'orderIndex': opt.key + 1,
                    };
                  }).toList() ??
                  [];

          return {
            'text':
                q['text']?.isEmpty == true ? 'Untitled Question' : q['text'],
            'questionType': backendType,
            'isRequired': q['required'],
            'orderIndex': index + 1,
            'options': options,
          };
        }).toList();

        // ✅ Phase 1 = 0 pts (screening), others = equal share
        final phaseReward =
            isMultiPhase ? (i == 0 ? 0.0 : rewardPerPhase) : rewardPerPhase;

        debugPrint('Phase ${i + 1} rewardAmount: $phaseReward pts');
        debugPrint('=== PHASE ${i + 1} PAYLOAD ===');
        debugPrint('rewardAmount: $phaseReward');
        debugPrint(
            'rewardPerParticipant from surveyData: ${widget.surveyData['rewardPerParticipant']}');
        debugPrint('maxParticipants: $maxParticipants');
        phasesPayload.add({
          'phaseOrder': i + 1,
          'title': 'Phase ${i + 1}',
          'phaseType': 'NORMAL',
          'rewardAmount': phaseReward, // ✅ FIXED
          'maxParticipants': maxParticipants,
          'questions': formattedQuestions.isNotEmpty
              ? formattedQuestions
              : [
                  {
                    'text': 'Empty Phase',
                    'questionType': 'TEXT',
                    'isRequired': false,
                    'orderIndex': 1,
                    'options': [],
                  }
                ],
        });
      }

      // 2. Build study payload
      final payload = {
        'title': widget.surveyData['title']?.isEmpty == true
            ? 'Untitled Survey'
            : widget.surveyData['title'],
        'description': widget.surveyData['description'] ?? '',
        'studyCategory': 'SURVEY',
        'totalBudget': widget.surveyData['totalBudget'] ?? 500.0,
        'isMultiPhase': isMultiPhase,
        'phases': phasesPayload,
      };

      final existingStudyId = widget.surveyData['studyId'];

      // ── UPDATE EXISTING SURVEY ─────────────────────────
      if (existingStudyId != null) {
        await dio.put('/api/studies/$existingStudyId', data: payload);

        final criteriaPayload = _buildCriteriaPayload();
        debugPrint('CRITERIA PAYLOAD FOR UPDATE: $criteriaPayload');

        await ref
            .read(recruitmentRepositoryProvider)
            .setCriteria(existingStudyId.toString(), criteriaPayload);

        debugPrint('Criteria updated successfully');

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Survey Updated Successfully!'),
              backgroundColor: AppTheme.successColor,
            ),
          );
        }
      }

      // ── CREATE NEW SURVEY ──────────────────────────────
      else {
        // Step 1: Create survey as DRAFT
        final createResponse = await dio.post('/api/studies', data: payload);

        debugPrint('CREATE SURVEY RESPONSE: ${createResponse.data}');

        final newStudyId = createResponse.data['studyId'] ??
            createResponse.data['study']?['studyId'];

        if (newStudyId == null) {
          throw Exception('Server did not return a studyId');
        }

        // Step 2: Save criteria
        final criteriaPayload = _buildCriteriaPayload();
        debugPrint('CRITERIA PAYLOAD: $criteriaPayload');

        await ref
            .read(recruitmentRepositoryProvider)
            .setCriteria(newStudyId.toString(), criteriaPayload);

        debugPrint('Criteria saved successfully');

        // Step 3: Publish survey
        await dio.patch('/api/studies/$newStudyId/status');
        debugPrint('Survey published');

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Survey Published Successfully!'),
              backgroundColor: AppTheme.successColor,
            ),
          );
        }
      }

      ref.invalidate(mySurveysProvider);
      ref.invalidate(browseSurveysProvider);

      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      debugPrint('PUBLISH ERROR: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save: $e'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isPublishing = false);
      }
    }
  }

  Map<String, dynamic> _buildCriteriaPayload() {
    final payload = <String, dynamic>{
      'ageMin': widget.surveyData['ageMin'] ?? 18,
      'ageMax': widget.surveyData['ageMax'] ?? 65,
      'gender': widget.surveyData['gender'],
      'country': widget.surveyData['country'],
      'educationLevel': _mapEducationToBackend(widget.surveyData['education']),
      'interestIds': widget.surveyData['interestIds'] ?? [],
    };

    payload.removeWhere((key, value) {
      if (value == null) return true;
      if (value is String && value.trim().isEmpty) return true;
      if (value is List && value.isEmpty) return true;
      return false;
    });

    return payload;
  }

  String? _mapEducationToBackend(dynamic education) {
    if (education == null) return null;
    final e = education.toString().toLowerCase();
    if (e.contains('high')) return 'HIGH_SCHOOL';
    if (e.contains('bachelor')) return 'BACHELOR';
    if (e.contains('master')) return 'MASTER';
    if (e.contains('phd') || e.contains('doctor')) return 'PHD';
    return 'OTHER';
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.surveyData['title']?.isEmpty == true
        ? 'Untitled Survey'
        : widget.surveyData['title'];
    final currentQuestions = _phaseQuestions[_activePhase] ?? [];

    // ✅ Show reward info in builder header
    final rewardPerParticipant =
        (widget.surveyData['rewardPerParticipant'] as num?)?.toDouble() ?? 0.0;
    final isMultiPhase = _phases > 1;
    final rewardedPhasesCount = isMultiPhase ? (_phases - 1) : 1;
    final rewardPerPhase = rewardedPhasesCount > 0
        ? (rewardPerParticipant / rewardedPhasesCount)
        : rewardPerParticipant;

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ────────────────────────────────────
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(children: [
                GestureDetector(
                    onTap: () => context.pop(),
                    child: const Icon(Icons.arrow_back_ios_new,
                        size: 16, color: AppTheme.textPrimary)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title,
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary)),
                        const Text('SURVEY BUILDER',
                            style: TextStyle(
                                fontSize: 10,
                                color: AppTheme.textTertiary,
                                letterSpacing: 1)),
                      ]),
                ),
                // ✅ Show reward per phase info
                if (rewardPerParticipant > 0)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                        color: AppTheme.primaryContainer,
                        borderRadius: BorderRadius.circular(8)),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('${rewardPerPhase.toStringAsFixed(0)} pts/phase',
                              style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.primary)),
                          Text(
                              '${rewardPerParticipant.toStringAsFixed(0)} pts total',
                              style: const TextStyle(
                                  fontSize: 10, color: AppTheme.textSecondary)),
                        ]),
                  ),
              ]),
            ),

            // ── Phase tabs ────────────────────────────────
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(children: [
                  ...List.generate(
                      _phases,
                      (i) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: GestureDetector(
                              onTap: () => setState(() => _activePhase = i),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  gradient: _activePhase == i
                                      ? AppTheme.primaryGradient
                                      : null,
                                  color: _activePhase != i
                                      ? AppTheme.surfaceLow
                                      : null,
                                  borderRadius: BorderRadius.circular(9999),
                                ),
                                child: Row(children: [
                                  Text('Phase ${i + 1}',
                                      style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: _activePhase == i
                                              ? Colors.white
                                              : AppTheme.textSecondary)),
                                  // ✅ Show reward badge on each phase tab
                                  if (rewardPerParticipant > 0) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                          color: _activePhase == i
                                              ? Colors.white.withOpacity(0.3)
                                              : AppTheme.primaryContainer,
                                          borderRadius:
                                              BorderRadius.circular(9999)),
                                      child: Text(
                                          isMultiPhase && i == 0
                                              ? '0 pts'
                                              : '${rewardPerPhase.toStringAsFixed(0)} pts',
                                          style: TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.w700,
                                              color: _activePhase == i
                                                  ? Colors.white
                                                  : AppTheme.primary)),
                                    ),
                                  ],
                                ]),
                              ),
                            ),
                          )),
                  GestureDetector(
                    onTap: () => setState(() {
                      _phases++;
                      _phaseQuestions[_phases - 1] = [];
                    }),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                          border: Border.all(
                              color: AppTheme.surfaceHigh, width: 1.5),
                          borderRadius: BorderRadius.circular(9999)),
                      child: const Row(children: [
                        Icon(Icons.add, size: 14, color: AppTheme.textTertiary),
                        SizedBox(width: 4),
                        Text('Add Phase',
                            style: TextStyle(
                                fontSize: 12, color: AppTheme.textTertiary)),
                      ]),
                    ),
                  ),
                ]),
              ),
            ),

            // ✅ Reward breakdown info bar
            if (rewardPerParticipant > 0)
              Container(
                width: double.infinity,
                color: AppTheme.primaryContainer,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(children: [
                  const Icon(Icons.info_outline,
                      size: 14, color: AppTheme.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      isMultiPhase
                          ? 'Phase 1 = screening (0 pts)  •  Phases 2–$_phases = ${rewardPerPhase.toStringAsFixed(0)} pts each  •  Total = ${rewardPerParticipant.toStringAsFixed(0)} pts per participant'
                          : 'Each participant earns ${rewardPerParticipant.toStringAsFixed(0)} pts on completion',
                      style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.primary,
                          fontWeight: FontWeight.w500),
                    ),
                  ),
                ]),
              ),

            // ── Questions list ────────────────────────────
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (currentQuestions.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 20),
                      child: Center(
                          child: Text('No questions in this phase yet.',
                              style: TextStyle(color: AppTheme.textSecondary))),
                    ),
                  ...currentQuestions.asMap().entries.map((entry) {
                    final i = entry.key;
                    final q = entry.value;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _QuestionCard(
                        index: i + 1,
                        question: q,
                        onDelete: () =>
                            setState(() => currentQuestions.removeAt(i)),
                        onToggleRequired: () => setState(
                            () => q['required'] = !(q['required'] as bool)),
                        onUpdateOption: (optIndex, newText) {
                          setState(() {
                            (q['options'] as List<String>)[optIndex] = newText;
                          });
                        },
                        onAddOption: () {
                          setState(() {
                            (q['options'] as List<String>).add('New Option');
                          });
                        },
                      ),
                    );
                  }),
                  GestureDetector(
                    onTap: _showAddQuestion,
                    child: Container(
                      height: 72,
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                              color: AppTheme.surfaceHigh, width: 1.5)),
                      child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_circle_outline,
                                color: AppTheme.textTertiary, size: 22),
                            SizedBox(width: 8),
                            Text('Add New Question',
                                style: TextStyle(
                                    color: AppTheme.textSecondary,
                                    fontWeight: FontWeight.w600)),
                          ]),
                    ),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ],
        ),
      ),

      // ── Bottom publish button ──────────────────────────
      bottomNavigationBar: Container(
        color: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          // ✅ Show reward summary before publishing
          if (rewardPerParticipant > 0) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                  color: AppTheme.surfaceLow,
                  borderRadius: BorderRadius.circular(10)),
              child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _RewardStat(
                        label: 'Per Phase',
                        value: '${rewardPerPhase.toStringAsFixed(0)} pts'),
                    Container(
                        width: 1, height: 30, color: AppTheme.surfaceHigh),
                    _RewardStat(
                        label: 'Per Participant',
                        value:
                            '${rewardPerParticipant.toStringAsFixed(0)} pts'),
                    Container(
                        width: 1, height: 30, color: AppTheme.surfaceHigh),
                    _RewardStat(
                        label: 'Rewarded Phases',
                        value: '$rewardedPhasesCount'),
                  ]),
            ),
          ],
          Row(children: [
            Expanded(
              flex: 2,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: _isPublishing ? null : _publish,
                child: _isPublishing
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : Text(
                        widget.surveyData['studyId'] != null
                            ? 'Update Survey'
                            : 'Publish Survey',
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ]),
        ]),
      ),
    );
  }
}

// ── Reward stat widget ─────────────────────────────────────
class _RewardStat extends StatelessWidget {
  final String label, value;
  const _RewardStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(label,
          style: const TextStyle(
              fontSize: 10,
              color: AppTheme.textSecondary,
              fontWeight: FontWeight.w500)),
      const SizedBox(height: 2),
      Text(value,
          style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppTheme.primary)),
    ]);
  }
}

// ─────────────────────────────────────────────────────────
// QUESTION CARD
// ─────────────────────────────────────────────────────────
class _QuestionCard extends StatelessWidget {
  final int index;
  final Map<String, dynamic> question;
  final VoidCallback onDelete;
  final VoidCallback onToggleRequired;
  final Function(int, String)? onUpdateOption;
  final VoidCallback? onAddOption;

  const _QuestionCard({
    required this.index,
    required this.question,
    required this.onDelete,
    required this.onToggleRequired,
    this.onUpdateOption,
    this.onAddOption,
  });

  @override
  Widget build(BuildContext context) {
    final type = question['type'] as String;
    final hasOptions =
        type == 'MULTIPLE CHOICE' || type == 'CHECKBOX' || type == 'DROPDOWN';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(16)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
                color: AppTheme.primaryContainer,
                borderRadius: BorderRadius.circular(6)),
            child: Text('0$index • $type',
                style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                    letterSpacing: 0.8)),
          ),
          const Spacer(),
          const Icon(Icons.drag_indicator,
              color: AppTheme.textTertiary, size: 20),
        ]),
        const SizedBox(height: 12),
        TextField(
          controller: TextEditingController(text: question['text'])
            ..selection = TextSelection.collapsed(
                offset: (question['text'] as String).length),
          decoration: const InputDecoration(
            hintText: 'Enter your question here...',
            border: InputBorder.none,
            hintStyle: TextStyle(color: AppTheme.textSecondary, fontSize: 16),
          ),
          style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary),
          onChanged: (v) => question['text'] = v,
        ),
        const SizedBox(height: 12),
        if (type == 'SHORT TEXT')
          Container(
              height: 48,
              decoration: BoxDecoration(
                  color: AppTheme.surfaceLowest,
                  borderRadius: BorderRadius.circular(8)),
              child: const Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                      padding: EdgeInsets.only(left: 12),
                      child: Text('Short answer text',
                          style: TextStyle(color: AppTheme.textTertiary))))),
        if (type == 'PARAGRAPH')
          Container(
              height: 90,
              decoration: BoxDecoration(
                  color: AppTheme.surfaceLowest,
                  borderRadius: BorderRadius.circular(8)),
              child: const Align(
                  alignment: Alignment.topLeft,
                  child: Padding(
                      padding: EdgeInsets.all(12),
                      child: Text('Long answer text...',
                          style: TextStyle(color: AppTheme.textTertiary))))),
        if (type == 'RATING')
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(
                5,
                (i) => Container(
                    width: 48,
                    height: 48,
                    decoration: const BoxDecoration(
                        color: AppTheme.surfaceLow, shape: BoxShape.circle),
                    child: Center(
                        child: Text('${i + 1}',
                            style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textSecondary))))),
          ),
        if (hasOptions && question['options'] != null) ...[
          ...(question['options'] as List<String>).asMap().entries.map((e) {
            final optIndex = e.key;
            final optValue = e.value;
            return Row(
              children: [
                Icon(
                    type == 'CHECKBOX'
                        ? Icons.check_box_outline_blank
                        : Icons.radio_button_unchecked,
                    color: AppTheme.textTertiary,
                    size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: TextEditingController(text: optValue)
                      ..selection =
                          TextSelection.collapsed(offset: optValue.length),
                    decoration: InputDecoration(
                        hintText: 'Option ${optIndex + 1}',
                        border: InputBorder.none),
                    style: const TextStyle(
                        fontSize: 14, color: AppTheme.textPrimary),
                    onChanged: (v) => onUpdateOption?.call(optIndex, v),
                  ),
                ),
              ],
            );
          }),
          TextButton.icon(
            onPressed: onAddOption,
            icon: const Icon(Icons.add, size: 16),
            label: const Text('Add option'),
            style: TextButton.styleFrom(
                foregroundColor: AppTheme.primary, padding: EdgeInsets.zero),
          ),
        ],
        const SizedBox(height: 12),
        const Divider(height: 1, color: Color(0xFFF0F2FA)),
        const SizedBox(height: 12),
        Row(children: [
          GestureDetector(
              onTap: onDelete,
              child: const Row(children: [
                Icon(Icons.delete_outline,
                    size: 15, color: AppTheme.errorColor),
                SizedBox(width: 4),
                Text('Delete',
                    style: TextStyle(fontSize: 12, color: AppTheme.errorColor))
              ])),
          const Spacer(),
          const Text('REQUIRED',
              style: TextStyle(
                  fontSize: 11,
                  color: AppTheme.textSecondary,
                  letterSpacing: 0.8)),
          const SizedBox(width: 8),
          Switch(
              value: question['required'] as bool,
              onChanged: (_) => onToggleRequired(),
              activeColor: AppTheme.primary,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap),
        ]),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────
// ADD QUESTION SHEET
// ─────────────────────────────────────────────────────────
class _AddQuestionSheet extends StatelessWidget {
  final ValueChanged<String> onSelect;
  const _AddQuestionSheet({required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final types = [
      {
        'name': 'Short text',
        'sub': 'Best for names, emails, or titles',
        'icon': Icons.short_text
      },
      {
        'name': 'Paragraph',
        'sub': 'For long-form qualitative answers',
        'icon': Icons.subject
      },
      {
        'name': 'Multiple choice',
        'sub': 'Select a single option from many',
        'icon': Icons.radio_button_checked
      },
      {
        'name': 'Checkbox',
        'sub': 'Choose multiple answers from a list',
        'icon': Icons.check_box_outlined
      },
      {
        'name': 'Dropdown',
        'sub': 'Compact list for many options',
        'icon': Icons.arrow_drop_down_circle_outlined
      },
      {
        'name': 'Rating',
        'sub': 'Stars or scales for satisfaction',
        'icon': Icons.star_outline
      },
    ];

    return Container(
      constraints:
          BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.7),
      padding: const EdgeInsets.all(24),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
                color: AppTheme.surfaceHigh,
                borderRadius: BorderRadius.circular(2))),
        const Align(
            alignment: Alignment.centerLeft,
            child: Text('Add Question',
                style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary))),
        const SizedBox(height: 20),
        Expanded(
          child: ListView.builder(
            itemCount: types.length,
            itemBuilder: (_, i) {
              final t = types[i];
              return GestureDetector(
                onTap: () => onSelect(t['name'] as String),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: Row(children: [
                    Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                            color: AppTheme.primaryContainer,
                            borderRadius: BorderRadius.circular(12)),
                        child: Icon(t['icon'] as IconData,
                            color: AppTheme.primary, size: 20)),
                    const SizedBox(width: 14),
                    Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(t['name'] as String,
                              style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textPrimary)),
                          Text(t['sub'] as String,
                              style: const TextStyle(
                                  fontSize: 13, color: AppTheme.textSecondary)),
                        ]),
                  ]),
                ),
              );
            },
          ),
        ),
      ]),
    );
  }
}
