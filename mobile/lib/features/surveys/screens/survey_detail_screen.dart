import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api_client.dart';
import '../../../shared/theme.dart';
import '../models/survey_model.dart';
import '../providers/survey_provider.dart';

class SurveyDetailScreen extends ConsumerWidget {
  final Study survey;
  const SurveyDetailScreen({super.key, required this.survey});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDraft = survey.studyStatus == 'DRAFT';

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              color: AppTheme.textPrimary, size: 20),
          onPressed: () => context.pop(),
        ),
        title: const Text('Survey Dashboard',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit, color: AppTheme.primary),
            onPressed: () {
              context.push('/surveys/build', extra: {
                'studyId': survey.studyId,
                'title': survey.title,
                'description': survey.description,
                'totalBudget': survey.totalBudget,
                'phases': survey.phases,
              });
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Survey Info Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.surfaceHigh)),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                          color: isDraft
                              ? AppTheme.surfaceHigh
                              : AppTheme.primaryContainer,
                          borderRadius: BorderRadius.circular(9999)),
                      child: Text(survey.studyStatus,
                          style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: isDraft
                                  ? AppTheme.textSecondary
                                  : AppTheme.primary,
                              letterSpacing: 1)),
                    ),
                    const SizedBox(height: 16),
                    Text(survey.title,
                        style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary)),
                    const SizedBox(height: 8),
                    Text(survey.description ?? 'No description provided.',
                        style: const TextStyle(
                            fontSize: 14,
                            color: AppTheme.textSecondary,
                            height: 1.5)),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _StatBlock(
                            title: 'BUDGET',
                            value:
                                '\$${survey.totalBudget.toStringAsFixed(0)}'),
                        _StatBlock(
                            title: 'PHASES', value: '${survey.phaseCount}'),
                        _StatBlock(
                            title: 'CATEGORY', value: survey.studyCategory),
                      ],
                    ),
                  ]),
            ),
            const SizedBox(height: 24),

            // Publish Button — only for DRAFT, sets to ACTIVE
            if (isDraft) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    try {
                      final dio = ref.read(dioProvider);
                      // Step 1: PATCH sets to PUBLISHED
                      await ref
                          .read(surveyRepositoryProvider)
                          .publishStudy(survey.studyId);
                      // Step 2: PUT to force ACTIVE so browse works
                      await dio.put('/api/studies/${survey.studyId}',
                          data: {'studyStatus': 'ACTIVE'});

                      ref.invalidate(mySurveysProvider);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Survey is now Live!'),
                                backgroundColor: AppTheme.successColor));
                        context.pop();
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            content: Text('Failed: $e'),
                            backgroundColor: AppTheme.errorColor));
                      }
                    }
                  },
                  icon: const Icon(Icons.publish, color: Colors.white),
                  label: const Text('Publish Survey',
                      style: TextStyle(
                          color: Colors.white, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.successColor,
                    minimumSize: const Size(double.infinity, 54),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Delete Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Delete Survey?'),
                      content: const Text(
                          'This action cannot be undone. All data will be lost.'),
                      actions: [
                        TextButton(
                            onPressed: () => Navigator.pop(ctx, false),
                            child: const Text('Cancel')),
                        TextButton(
                            onPressed: () => Navigator.pop(ctx, true),
                            child: const Text('Delete',
                                style: TextStyle(color: AppTheme.errorColor))),
                      ],
                    ),
                  );
                  if (confirm == true) {
                    try {
                      await ref
                          .read(surveyRepositoryProvider)
                          .deleteStudy(survey.studyId);
                      ref.invalidate(mySurveysProvider);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Survey Deleted.'),
                                backgroundColor: AppTheme.errorColor));
                        context.pop();
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            content: Text('Failed: $e'),
                            backgroundColor: AppTheme.errorColor));
                      }
                    }
                  }
                },
                icon: const Icon(Icons.delete_outline,
                    color: AppTheme.errorColor),
                label: const Text('Delete Survey'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.errorColor,
                  side: const BorderSide(color: AppTheme.errorColor),
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Recruitment section — only for non-DRAFT
            if (!isDraft) ...[
              const Text('Recruitment',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary)),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () => context.push('/surveys/invite', extra: survey),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: AppTheme.ambientShadow),
                  child: Row(children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle),
                      child: const Icon(Icons.person_search,
                          color: Colors.white, size: 28),
                    ),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Find Participants',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700)),
                            SizedBox(height: 4),
                            Text(
                                'Launch an auto-invite campaign to recruit matching participants.',
                                style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 13,
                                    height: 1.4)),
                          ]),
                    ),
                    const Icon(Icons.arrow_forward_ios,
                        color: Colors.white, size: 16),
                  ]),
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () =>
                    context.push('/surveys/applications', extra: survey),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.surfaceHigh)),
                  child: const Row(children: [
                    Icon(Icons.people_outline,
                        color: AppTheme.primary, size: 28),
                    SizedBox(width: 16),
                    Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('View Applications',
                                style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: AppTheme.textPrimary)),
                            SizedBox(height: 4),
                            Text('Review and approve participant applications.',
                                style: TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textSecondary)),
                          ]),
                    ),
                    Icon(Icons.arrow_forward_ios,
                        color: AppTheme.textTertiary, size: 16),
                  ]),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatBlock extends StatelessWidget {
  final String title, value;
  const _StatBlock({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title,
            style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: AppTheme.textSecondary,
                letterSpacing: 1)),
        const SizedBox(height: 4),
        Text(value,
            style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary),
            overflow: TextOverflow.ellipsis),
      ]),
    );
  }
}
