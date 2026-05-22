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
  final _filters = ['All Surveys', 'Active', 'Drafts', 'Completed'];

  // Helper function to format dates like "2h ago" or "Oct 12"
  String _formatDate(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    // 🔥 1. Fetch real surveys from the backend
    final surveysAsync = ref.watch(mySurveysProvider);

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
            // Top Header & Filters
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

            // 🔥 2. Display Real Data
            Expanded(
              child: surveysAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, _) => Center(child: Text('Error: $err')),
                data: (allSurveys) {
                  // Filter logic
                  var filtered = allSurveys;
                  if (_filterIndex == 1) {
                    filtered = allSurveys
                        .where((s) =>
                            s.studyStatus == 'ACTIVE' ||
                            s.studyStatus == 'PUBLISHED')
                        .toList();
                  } else if (_filterIndex == 2) {
                    filtered = allSurveys
                        .where((s) => s.studyStatus == 'DRAFT')
                        .toList();
                  } else if (_filterIndex == 3) {
                    filtered = allSurveys
                        .where((s) => s.studyStatus == 'COMPLETED')
                        .toList();
                  }

                  if (filtered.isEmpty) {
                    return const Center(
                        child: Text('No surveys found.',
                            style: TextStyle(color: AppTheme.textSecondary)));
                  }

                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      // Priority card (First item)
                      _PrioritySurveyCard(
                        survey: filtered[0],
                        dateString: _formatDate(filtered[0].updatedAt),
                        onTap: () => context.push('/surveys/detail',
                            extra:
                                filtered[0]), // <--- Add "extra: filtered[0]"
                      ),
                      const SizedBox(height: 12),

                      // Regular cards (Remaining items)
                      ...filtered.skip(1).map((s) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _SurveyListCard(
                              survey: s,
                              onTap: () =>
                                  context.push('/surveys/detail', extra: s),
                            ),
                          )),
                      const SizedBox(height: 24),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---- UPDATED WIDGETS TO USE THE REAL MODEL ----

class _PrioritySurveyCard extends StatelessWidget {
  final Study survey;
  final String dateString;
  final VoidCallback onTap;
  const _PrioritySurveyCard(
      {required this.survey, required this.dateString, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(20)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                  color: AppTheme.primaryContainer,
                  borderRadius: BorderRadius.circular(9999)),
              child: Text(survey.studyStatus,
                  style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                      letterSpacing: 1)),
            ),
            const SizedBox(width: 10),
            Text('Updated $dateString',
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textSecondary)),
          ]),
          const SizedBox(height: 12),
          Text(survey.title,
              style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary)),
          const SizedBox(height: 16),
          Row(children: [
            _StatPill(
                value: '${survey.phaseCount}',
                label: 'PHASES',
                color: AppTheme.primary),
            const SizedBox(width: 16),
            _StatPill(
                value: survey.studyCategory,
                label: 'CATEGORY',
                color: AppTheme.textSecondary),
          ]),
        ]),
      ),
    );
  }
}

class _SurveyListCard extends StatelessWidget {
  final Study survey;
  final VoidCallback onTap;
  const _SurveyListCard({required this.survey, required this.onTap});

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
                        borderRadius: BorderRadius.circular(6)),
                    child: const Text('DRAFT',
                        style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textSecondary,
                            letterSpacing: 1)),
                  ),
                Text(survey.title,
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
                  Text('${survey.phaseCount} PHASES',
                      style: const TextStyle(
                          fontSize: 11, color: AppTheme.textTertiary)),
                ]),
              ])),
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
                color: AppTheme.surfaceLow,
                borderRadius: BorderRadius.circular(10)),
            child: Icon(isDraft ? Icons.more_horiz : Icons.arrow_forward_ios,
                size: 14, color: AppTheme.textSecondary),
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
                  fontSize: 18, fontWeight: FontWeight.w800, color: color)),
          Text(label,
              style: const TextStyle(
                  fontSize: 10,
                  color: AppTheme.textSecondary,
                  letterSpacing: 1)),
        ],
      );
}
