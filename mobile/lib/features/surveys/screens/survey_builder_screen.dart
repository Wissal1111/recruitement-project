import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../../../shared/widgets/gradient_button.dart';

class SurveyBuilderScreen extends StatefulWidget {
  const SurveyBuilderScreen({super.key});

  @override
  State<SurveyBuilderScreen> createState() => _SurveyBuilderScreenState();
}

class _SurveyBuilderScreenState extends State<SurveyBuilderScreen> {
  int _activePhase = 0;
  int _phases = 2;

  final List<Map<String, dynamic>> _questions = [
    {
      'type': 'RATING',
      'text': 'How satisfied were you with our checkout process today?',
      'required': true,
      'ratingValue': 5,
    },
    {
      'type': 'MULTIPLE CHOICE',
      'text': 'Which feature do you use most frequently?',
      'required': false,
      'options': [
        'Data Visualization Dashboard',
        'Automated Report Generation',
        'Custom Integration API'
      ],
      'selectedOption': 2,
    },
  ];

  void _showAddQuestion() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _AddQuestionSheet(
        onSelect: (type) {
          Navigator.pop(context);
          setState(() {
            _questions.add({
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

  @override
  Widget build(BuildContext context) {
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
                      size: 16, color: AppTheme.textPrimary),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Customer Experience 2024',
                            style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary)),
                        Text('SURVEYOR BUILDER',
                            style: TextStyle(
                                fontSize: 10,
                                color: AppTheme.textTertiary,
                                letterSpacing: 1)),
                      ]),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(9999),
                  ),
                  child: const Text('Save',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 13)),
                ),
              ]),
            ),

            // Phase tabs
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                              child: Text('Phase $i',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: _activePhase == i
                                        ? Colors.white
                                        : AppTheme.textSecondary,
                                  )),
                            ),
                          ),
                        )),
                GestureDetector(
                  onTap: () => setState(() => _phases++),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      border: Border.all(
                          color: AppTheme.surfaceHigh,
                          width: 1.5,
                          style: BorderStyle.solid),
                      borderRadius: BorderRadius.circular(9999),
                    ),
                    child: Row(children: [
                      const Icon(Icons.add,
                          size: 14, color: AppTheme.textTertiary),
                      const SizedBox(width: 4),
                      const Text('Add Phase',
                          style: TextStyle(
                              fontSize: 12, color: AppTheme.textTertiary)),
                    ]),
                  ),
                ),
              ]),
            ),

            // Questions list
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  ..._questions.asMap().entries.map((entry) {
                    final i = entry.key;
                    final q = entry.value;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _QuestionCard(
                        index: i + 1,
                        question: q,
                        onDelete: () => setState(() => _questions.removeAt(i)),
                        onToggleRequired: () => setState(
                            () => q['required'] = !(q['required'] as bool)),
                        onRatingChanged: q['type'] == 'RATING'
                            ? (v) => setState(() => q['ratingValue'] = v)
                            : null,
                        onOptionSelect: q['type'] == 'MULTIPLE CHOICE'
                            ? (v) => setState(() => q['selectedOption'] = v)
                            : null,
                      ),
                    );
                  }),

                  // Add new question button
                  GestureDetector(
                    onTap: _showAddQuestion,
                    child: Container(
                      height: 72,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border:
                            Border.all(color: AppTheme.surfaceHigh, width: 1.5),
                      ),
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
                  const SizedBox(height: 16),

                  // Logic card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryContainer,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(children: [
                      const Icon(Icons.auto_awesome,
                          color: AppTheme.primary, size: 28),
                      const SizedBox(height: 10),
                      const Text('Add Intelligent Logic?',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary)),
                      const SizedBox(height: 6),
                      const Text(
                          'Skip questions based on previous answers to create a curated journey.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              fontSize: 13,
                              color: AppTheme.textSecondary,
                              height: 1.4)),
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(9999),
                        ),
                        child: const Text('CONFIGURE FLOW',
                            style: TextStyle(
                                color: AppTheme.primary,
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                                letterSpacing: 1)),
                      ),
                    ]),
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
            child: OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.remove_red_eye_outlined, size: 16),
              label: const Text('PREVIEW'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.textSecondary,
                side: BorderSide(color: AppTheme.surfaceHigh),
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: GradientButton(
              label: 'Publish',
              onPressed: () {},
              height: 50,
            ),
          ),
          const SizedBox(width: 12),
          Container(
            height: 50,
            width: 50,
            decoration: BoxDecoration(
              color: AppTheme.surfaceLow,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.settings_outlined,
                color: AppTheme.textSecondary, size: 20),
          ),
        ]),
      ),
      floatingActionButton: Container(
        width: 48,
        height: 48,
        margin: const EdgeInsets.only(bottom: 70),
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(14),
          boxShadow: AppTheme.ambientShadow,
        ),
        child: IconButton(
          icon: const Icon(Icons.add, color: Colors.white),
          onPressed: _showAddQuestion,
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}

class _QuestionCard extends StatelessWidget {
  final int index;
  final Map<String, dynamic> question;
  final VoidCallback onDelete;
  final VoidCallback onToggleRequired;
  final ValueChanged<int>? onRatingChanged;
  final ValueChanged<int>? onOptionSelect;

  const _QuestionCard({
    required this.index,
    required this.question,
    required this.onDelete,
    required this.onToggleRequired,
    this.onRatingChanged,
    this.onOptionSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.primaryContainer,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text('0$index • ${question['type']}',
                style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                    letterSpacing: 0.8)),
          ),
          const Spacer(),
          Icon(Icons.drag_indicator, color: AppTheme.textTertiary, size: 20),
        ]),
        const SizedBox(height: 12),

        // Question text
        question['text']?.isEmpty == true
            ? TextField(
                decoration: const InputDecoration(
                    hintText: 'Enter your question here...'),
                onChanged: (v) => question['text'] = v,
              )
            : Text(question['text'],
                style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                    height: 1.4)),

        const SizedBox(height: 16),

        // Rating question
        if (question['type'] == 'RATING') ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(5, (i) {
              final selected = question['ratingValue'] == (i + 1);
              return GestureDetector(
                onTap: () => onRatingChanged?.call(i + 1),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: selected ? AppTheme.primary : AppTheme.surfaceLow,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                      child: Text('${i + 1}',
                          style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: selected
                                  ? Colors.white
                                  : AppTheme.textSecondary))),
                ),
              );
            }),
          ),
        ],

        // Multiple choice question
        if (question['type'] == 'MULTIPLE CHOICE' &&
            question['options'] != null) ...[
          ...(question['options'] as List<String>).asMap().entries.map((e) {
            final selected = question['selectedOption'] == e.key;
            return GestureDetector(
              onTap: () => onOptionSelect?.call(e.key),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                margin: const EdgeInsets.only(bottom: 8),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: selected
                      ? AppTheme.primaryContainer
                      : AppTheme.surfaceLow,
                  borderRadius: BorderRadius.circular(12),
                  border: selected ? Border.all(color: AppTheme.primary) : null,
                ),
                child: Row(children: [
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: selected ? AppTheme.primary : Colors.transparent,
                      border: Border.all(
                          color: selected
                              ? AppTheme.primary
                              : AppTheme.textTertiary,
                          width: 2),
                    ),
                    child: selected
                        ? const Icon(Icons.circle,
                            color: Colors.white, size: 10)
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Text(e.value,
                      style: TextStyle(
                          fontSize: 14,
                          color: selected
                              ? AppTheme.primary
                              : AppTheme.textPrimary,
                          fontWeight:
                              selected ? FontWeight.w600 : FontWeight.w400)),
                ]),
              ),
            );
          }),
        ],

        const SizedBox(height: 12),
        const Divider(height: 1, color: Color(0xFFF0F2FA)),
        const SizedBox(height: 12),

        Row(children: [
          GestureDetector(
            onTap: () {},
            child: const Row(children: [
              Icon(Icons.copy_outlined,
                  size: 15, color: AppTheme.textSecondary),
              SizedBox(width: 4),
              Text('Duplicate',
                  style:
                      TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
            ]),
          ),
          const SizedBox(width: 16),
          GestureDetector(
            onTap: onDelete,
            child: const Row(children: [
              Icon(Icons.delete_outline, size: 15, color: AppTheme.errorColor),
              SizedBox(width: 4),
              Text('Delete',
                  style: TextStyle(fontSize: 12, color: AppTheme.errorColor)),
            ]),
          ),
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
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
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

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 40,
          height: 4,
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: AppTheme.surfaceHigh,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const Align(
          alignment: Alignment.centerLeft,
          child: Text('Add Question',
              style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary)),
        ),
        const Align(
          alignment: Alignment.centerLeft,
          child: Text('Select a component type',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
        ),
        const SizedBox(height: 20),
        ...types.map((t) => GestureDetector(
              onTap: () => onSelect(t['name'] as String),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Row(children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(t['icon'] as IconData,
                        color: AppTheme.primary, size: 20),
                  ),
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
            )),
        const SizedBox(height: 8),
      ]),
    );
  }
}
