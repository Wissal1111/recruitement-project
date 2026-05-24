import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../models/survey_model.dart';
import '../providers/survey_provider.dart';

class SurveysScreen extends ConsumerStatefulWidget {
  const SurveysScreen({super.key});

  @override
  ConsumerState<SurveysScreen> createState() => _SurveysScreenState();
}

class _SurveysScreenState extends ConsumerState<SurveysScreen> {
  int _filterIndex = 0;
  final _filters = ['Browse', 'My Surveys', 'Completed'];

  // Static Data for "Completed" (Showing phase point breakdown)
  final List<Map<String, dynamic>> _completedSurveys = [
    {
      'title': 'Consumer Spending Habits 2024',
      'totalEarned': '\$15',
      'phases': [
        {'name': 'Phase 0: Screening', 'amount': '\$5', 'status': 'Paid'},
        {'name': 'Phase 1: Deep Dive', 'amount': '\$10', 'status': 'Paid'},
      ]
    },
    {
      'title': 'Smart Home Devices Feedback',
      'totalEarned': '\$5',
      'phases': [
        {'name': 'Phase 0: Initial Survey', 'amount': '\$5', 'status': 'Paid'},
      ]
    },
  ];

  String _formatDate(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final mySurveys = ref.watch(mySurveysProvider);
    final browsable = ref.watch(browseSurveysProvider);

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
            // Header & Search
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
                    hintText: 'Search surveys...',
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
                                      : AppTheme.textSecondary)),
                        ),
                      );
                    },
                  ),
                ),
              ]),
            ),
            const SizedBox(height: 16),

            // Dynamic Body
            Expanded(
              child: _buildBodyContent(mySurveys, browsable),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBodyContent(
      AsyncValue<List<Study>> mySurveys, AsyncValue<List<Study>> browsable) {
    // =============================================
    // TAB 0: BROWSE (Real surveys from other people)
    // =============================================
    if (_filterIndex == 0) {
      return browsable.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => const Center(child: Text('Failed to load surveys')),
        data: (surveys) {
          if (surveys.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.explore_outlined,
                        size: 64, color: AppTheme.textTertiary),
                    SizedBox(height: 16),
                    Text('No surveys to browse yet.',
                        style: TextStyle(
                            fontSize: 16,
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w600)),
                    SizedBox(height: 8),
                    Text(
                        'When other creators publish surveys that match your profile, they will appear here.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 13, color: AppTheme.textTertiary)),
                  ],
                ),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: surveys.length,
            itemBuilder: (context, index) {
              return _BrowseCard(survey: surveys[index]);
            },
          );
        },
      );
    }

    // =============================================
    // TAB 2: COMPLETED (Static phase breakdown)
    // =============================================
    if (_filterIndex == 2) {
      return ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _completedSurveys.length,
        itemBuilder: (context, index) {
          return _CompletedCard(survey: _completedSurveys[index]);
        },
      );
    }

    // =============================================
    // TAB 1: MY SURVEYS (ALL your created surveys)
    // =============================================
    return mySurveys.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(child: Text('Error: $err')),
      data: (allSurveys) {
        if (allSurveys.isEmpty) {
          return const Center(
              child: Text('No surveys created yet.',
                  style: TextStyle(color: AppTheme.textSecondary)));
        }

        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          itemCount: allSurveys.length,
          itemBuilder: (context, index) {
            final s = allSurveys[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _MySurveyCard(
                survey: s,
                dateString: _formatDate(s.updatedAt),
                onTap: () => context.push('/surveys/detail', extra: s),
              ),
            );
          },
        );
      },
    );
  }
}

// ---------------------------------------------------------
// WIDGETS
// ---------------------------------------------------------

// 1. Browse Card (Real data from other creators)
class _BrowseCard extends StatelessWidget {
  final Study survey;
  const _BrowseCard({required this.survey});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.surfaceHigh, width: 1.5)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
                color: const Color(0xFFD1FAE5),
                borderRadius: BorderRadius.circular(9999)),
            child: Text(survey.studyStatus,
                style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF059669),
                    letterSpacing: 1)),
          ),
          const Spacer(),
          Text('\$${survey.totalBudget.toStringAsFixed(0)}',
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primary)),
        ]),
        const SizedBox(height: 12),
        Text(survey.title,
            style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary)),
        const SizedBox(height: 4),
        Text(survey.description ?? 'No description.',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style:
                const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
        const SizedBox(height: 12),
        Row(children: [
          const Icon(Icons.layers_outlined,
              size: 14, color: AppTheme.textTertiary),
          const SizedBox(width: 4),
          Text('${survey.phaseCount} PHASES',
              style:
                  const TextStyle(fontSize: 12, color: AppTheme.textTertiary)),
        ]),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.textPrimary,
                  side: const BorderSide(color: AppTheme.surfaceHigh),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
              child: const Text('Details'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
              child: const Text('Participate'),
            ),
          ),
        ])
      ]),
    );
  }
}

// 2. My Surveys Card (Real Data - Shows ALL statuses with budget)
class _MySurveyCard extends StatelessWidget {
  final Study survey;
  final String dateString;
  final VoidCallback onTap;
  const _MySurveyCard(
      {required this.survey, required this.dateString, required this.onTap});

  Color _statusColor() {
    switch (survey.studyStatus) {
      case 'DRAFT':
        return AppTheme.textSecondary;
      case 'PUBLISHED':
        return AppTheme.primary;
      case 'ACTIVE':
        return AppTheme.successColor;
      case 'COMPLETED':
        return const Color(0xFF059669);
      default:
        return AppTheme.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDraft = survey.studyStatus == 'DRAFT';
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: AppTheme.ambientShadow),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                  color: _statusColor().withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6)),
              child: Text(survey.studyStatus,
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: _statusColor(),
                      letterSpacing: 1)),
            ),
            const Spacer(),
            Text(dateString,
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textTertiary)),
          ]),
          const SizedBox(height: 12),
          Text(survey.title,
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary)),
          const SizedBox(height: 12),
          Row(children: [
            const Icon(Icons.layers_outlined,
                size: 14, color: AppTheme.textTertiary),
            const SizedBox(width: 4),
            Text('${survey.phaseCount} PHASES',
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textTertiary)),
            const SizedBox(width: 16),
            const Icon(Icons.monetization_on_outlined,
                size: 14, color: AppTheme.primary),
            const SizedBox(width: 4),
            Text('\$${survey.totalBudget.toStringAsFixed(0)} BUDGET',
                style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.primary,
                    fontWeight: FontWeight.bold)),
          ]),
        ]),
      ),
    );
  }
}

// 3. Completed Surveys Card (Phase Breakdown)
class _CompletedCard extends StatelessWidget {
  final Map<String, dynamic> survey;
  const _CompletedCard({required this.survey});

  @override
  Widget build(BuildContext context) {
    final phases = survey['phases'] as List;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.surfaceHigh, width: 1.5)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.check_circle,
              color: AppTheme.successColor, size: 20),
          const SizedBox(width: 8),
          const Text('COMPLETED',
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.successColor,
                  letterSpacing: 1)),
          const Spacer(),
          Text('Total: ${survey['totalEarned']}',
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary)),
        ]),
        const SizedBox(height: 12),
        Text(survey['title'],
            style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary)),
        const SizedBox(height: 16),
        const Divider(color: AppTheme.surfaceHigh),
        const SizedBox(height: 8),
        ...phases.map((p) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(children: [
                Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                        color: AppTheme.primary, shape: BoxShape.circle)),
                const SizedBox(width: 10),
                Text(p['name'],
                    style: const TextStyle(
                        fontSize: 13, color: AppTheme.textSecondary)),
                const Spacer(),
                Text(p['amount'],
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary)),
              ]),
            )),
      ]),
    );
  }
}
