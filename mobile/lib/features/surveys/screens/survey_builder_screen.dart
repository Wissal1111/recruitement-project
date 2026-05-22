import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api_client.dart';
import '../../../shared/theme.dart';
import '../../surveys/providers/survey_provider.dart';

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

  // We group questions by Phase. phaseQuestions[0] = questions for phase 1.
  final Map<int, List<Map<String, dynamic>>> _phaseQuestions = {
    0: [
      {
        'type': 'SHORT TEXT',
        'text': '',
        'required': true,
      }
    ]
  };

  // 🚨 HERE IS THE MAGIC INIT STATE! 🚨
  // This runs the moment the screen opens and loads your database data into the UI.
  @override
  void initState() {
    super.initState();

    // Check if we are editing an EXISTING survey (it has a studyId and phases)
    if (widget.surveyData['studyId'] != null &&
        widget.surveyData['phases'] != null) {
      final existingPhases = widget.surveyData['phases'] as List;

      if (existingPhases.isNotEmpty) {
        _phases = existingPhases.length;
        _phaseQuestions.clear(); // Clear the default blank question

        // Loop through the phases from the database
        for (int i = 0; i < existingPhases.length; i++) {
          final phase = existingPhases[i];
          final questions = phase['questions'] as List? ?? [];

          // Convert database questions back into Flutter UI format
          _phaseQuestions[i] = questions.map<Map<String, dynamic>>((q) {
            String uiType = 'SHORT TEXT';
            if (q['questionType'] == 'SINGLE_CHOICE')
              uiType = 'MULTIPLE CHOICE';
            else if (q['questionType'] == 'MULTIPLE_CHOICE')
              uiType = 'CHECKBOX';
            else if (q['questionType'] == 'RATING_SCALE') uiType = 'RATING';

            // Clean up the backend's default blank space (' ')
            String text = q['text'] ?? '';
            if (text.trim().isEmpty) text = '';

            return {
              'id': q['questionId'], // Keep ID so we update the same question
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
      isScrollControlled: true, // Prevents overflow!
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

  // Publish OR Update to Backend
  Future<void> _publish() async {
    setState(() => _isPublishing = true);
    try {
      final dio = ref.read(dioProvider);

      // 1. Build the phases payload
      final phasesPayload = [];
      for (int i = 0; i < _phases; i++) {
        final qList = _phaseQuestions[i] ?? [];
        final formattedQuestions = qList.asMap().entries.map((e) {
          final index = e.key;
          final q = e.value;

          String backendType = 'TEXT';
          if (q['type'] == 'MULTIPLE CHOICE' || q['type'] == 'DROPDOWN')
            backendType = 'SINGLE_CHOICE';
          if (q['type'] == 'CHECKBOX') backendType = 'MULTIPLE_CHOICE';
          if (q['type'] == 'RATING') backendType = 'RATING_SCALE';

          final options =
              (q['options'] as List<String>?)?.asMap().entries.map((opt) {
                    return {
                      'label': opt.value,
                      'value': opt.value,
                      'orderIndex': opt.key + 1
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

        phasesPayload.add({
          'phaseOrder': i + 1,
          'title': 'Phase ${i + 1}',
          'phaseType': 'NORMAL',
          'rewardAmount': 0,
          'maxParticipants': 0,
          'questions': formattedQuestions.isNotEmpty
              ? formattedQuestions
              : [
                  {
                    'text': 'Empty Phase',
                    'questionType': 'TEXT',
                    'isRequired': false,
                    'orderIndex': 1
                  }
                ]
        });
      }

      // 2. Build the final payload
      final payload = {
        'title': widget.surveyData['title']?.isEmpty == true
            ? 'Untitled Survey'
            : widget.surveyData['title'],
        'description': widget.surveyData['description'] ?? '',
        'studyCategory': 'SURVEY',
        'totalBudget': widget.surveyData['totalBudget'] ?? 500.0,
        'phases': phasesPayload,
      };

      // 3. THE SMART LOGIC: Update vs Create
      final existingStudyId = widget.surveyData['studyId'];

      if (existingStudyId != null) {
        // UPDATE EXISTING SURVEY (PUT)
        await dio.put('/api/studies/$existingStudyId', data: payload);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Survey Updated Successfully!'),
              backgroundColor: AppTheme.successColor));
        }
      } else {
        // CREATE NEW SURVEY (POST)
        await dio.post('/api/studies', data: payload);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Survey Created Successfully!'),
              backgroundColor: AppTheme.successColor));
        }
      }

      // 4. Refresh the home screen and go back
      ref.invalidate(mySurveysProvider);
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Failed to save: $e'),
            backgroundColor: AppTheme.errorColor));
      }
    } finally {
      if (mounted) setState(() => _isPublishing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.surveyData['title']?.isEmpty == true
        ? 'Untitled Survey'
        : widget.surveyData['title'];
    final currentQuestions = _phaseQuestions[_activePhase] ?? [];

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: Column(
          children: [
            // Top bar
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
              ]),
            ),

            // Phase tabs
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
                                child: Text('Phase ${i + 1}',
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: _activePhase == i
                                            ? Colors.white
                                            : AppTheme.textSecondary)),
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

            // Questions list
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
      bottomNavigationBar: Container(
        color: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(children: [
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
      ),
    );
  }
}

// ----------------------------------------------------
// EDITED QUESTION CARD: Allows editing Option Texts!
// ----------------------------------------------------
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

        // 1. EDITABLE QUESTION TEXT
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

        // 2. DUMMY ANSWER UI based on Type
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

        // 3. EDITABLE OPTIONS for Choice Types
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
          // Add Option Button
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
