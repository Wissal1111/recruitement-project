import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';

class SurveysScreen extends StatefulWidget {
  const SurveysScreen({super.key});

  @override
  State<SurveysScreen> createState() => _SurveysScreenState();
}

class _SurveysScreenState extends State<SurveysScreen> {
  int _filterIndex = 0;
  final _filters = ['All Surveys', 'Active', 'Drafts', 'Completed'];

  final _surveys = [
    {
      'title': 'Q4 Product Engagement Analysis',
      'responses': 1284,
      'phases': 3,
      'status': 'priority',
      'updated': '2h ago',
      'progress': 0.7,
    },
    {
      'title': 'Beta User Feedback',
      'phases': 2,
      'responses': 432,
      'status': 'active',
    },
    {
      'title': 'Employee Satisfaction 2024',
      'phases': 5,
      'responses': 89,
      'status': 'active',
    },
    {
      'title': 'Brand Awareness Study',
      'phases': 1,
      'responses': 0,
      'status': 'draft',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      floatingActionButton: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppTheme.ambientShadow,
        ),
        child: IconButton(
          icon: const Icon(Icons.add, color: Colors.white, size: 26),
          onPressed: () => context.push('/surveys/create'),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Column(children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Surveys',
                        style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary)),
                    Row(children: [
                      const Text('Surveyor',
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.primary)),
                      const SizedBox(width: 10),
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: AppTheme.primaryContainer,
                        child: const Icon(Icons.person,
                            size: 18, color: AppTheme.primary),
                      ),
                    ]),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Search your projects...',
                    prefixIcon:
                        const Icon(Icons.search, color: AppTheme.textTertiary),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _filters.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, i) {
                      final selected = i == _filterIndex;
                      return GestureDetector(
                        onTap: () => setState(() => _filterIndex = i),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 18, vertical: 8),
                          decoration: BoxDecoration(
                            color: selected ? AppTheme.primary : Colors.white,
                            borderRadius: BorderRadius.circular(9999),
                          ),
                          child: Text(_filters[i],
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: selected
                                    ? Colors.white
                                    : AppTheme.textSecondary,
                              )),
                        ),
                      );
                    },
                  ),
                ),
              ]),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  // Priority card
                  _PrioritySurveyCard(
                    survey: _surveys[0],
                    onTap: () => context.push('/surveys/detail'),
                  ),
                  const SizedBox(height: 12),
                  // Regular cards
                  ..._surveys.skip(1).map((s) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _SurveyListCard(
                          survey: s,
                          onTap: () => context.push('/surveys/detail'),
                        ),
                      )),
                  const SizedBox(height: 12),
                  // Promo card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF3A3BB5), Color(0xFF6366F1)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Gain Deeper Insights',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700)),
                          const SizedBox(height: 6),
                          Text(
                              'Unlock AI-powered sentiment analysis for all your surveys.',
                              style: TextStyle(
                                  color: Colors.white.withOpacity(0.8),
                                  fontSize: 13)),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 10),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(9999),
                            ),
                            child: const Text('GO PRO',
                                style: TextStyle(
                                    color: AppTheme.primary,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                    letterSpacing: 1)),
                          ),
                        ]),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PrioritySurveyCard extends StatelessWidget {
  final Map<String, dynamic> survey;
  final VoidCallback onTap;
  const _PrioritySurveyCard({required this.survey, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppTheme.primaryContainer,
                borderRadius: BorderRadius.circular(9999),
              ),
              child: const Text('PRIORITY',
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                      letterSpacing: 1)),
            ),
            const SizedBox(width: 10),
            Text('Updated ${survey['updated']}',
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textSecondary)),
            const Spacer(),
            const Icon(Icons.auto_awesome, color: AppTheme.primary, size: 20),
          ]),
          const SizedBox(height: 12),
          Text(survey['title'],
              style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary)),
          const SizedBox(height: 16),
          Row(children: [
            _StatPill(
              value: '${survey['responses']}',
              label: 'RESPONSES',
              color: AppTheme.primary,
            ),
            const SizedBox(width: 16),
            _StatPill(
              value: '${survey['phases']}',
              label: 'PHASES',
              color: AppTheme.textSecondary,
            ),
          ]),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: LinearProgressIndicator(
              value: (survey['progress'] as double? ?? 0.5),
              minHeight: 5,
              backgroundColor: AppTheme.surfaceHigh,
              valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
            ),
          ),
        ]),
      ),
    );
  }
}

class _SurveyListCard extends StatelessWidget {
  final Map<String, dynamic> survey;
  final VoidCallback onTap;
  const _SurveyListCard({required this.survey, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDraft = survey['status'] == 'draft';
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: isDraft
              ? Border.all(color: AppTheme.surfaceHigh, width: 1.5)
              : null,
        ),
        child: Row(children: [
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                if (isDraft)
                  Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceHigh,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('DRAFT',
                        style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textSecondary,
                            letterSpacing: 1)),
                  ),
                Text(survey['title'],
                    style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                        color: isDraft
                            ? AppTheme.textSecondary
                            : AppTheme.textPrimary)),
                const SizedBox(height: 4),
                Row(children: [
                  const Icon(Icons.layers_outlined,
                      size: 13, color: AppTheme.textTertiary),
                  const SizedBox(width: 4),
                  Text('${survey['phases']} PHASES',
                      style: const TextStyle(
                          fontSize: 11, color: AppTheme.textTertiary)),
                  if (!isDraft) ...[
                    const SizedBox(width: 12),
                    const Icon(Icons.people_outline,
                        size: 13, color: AppTheme.textTertiary),
                    const SizedBox(width: 4),
                    Text('${survey['responses']} RESPONSES',
                        style: const TextStyle(
                            fontSize: 11, color: AppTheme.primary)),
                  ],
                ]),
              ])),
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppTheme.surfaceLow,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isDraft ? Icons.more_horiz : Icons.arrow_forward_ios,
              size: 14,
              color: AppTheme.textSecondary,
            ),
          ),
        ]),
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  final String value, label;
  final Color color;
  const _StatPill(
      {required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value,
              style: TextStyle(
                  fontSize: 22, fontWeight: FontWeight.w800, color: color)),
          Text(label,
              style: const TextStyle(
                  fontSize: 10,
                  color: AppTheme.textSecondary,
                  letterSpacing: 1)),
        ],
      );
}
