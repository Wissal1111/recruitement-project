import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../models/survey_model.dart';

class SurveyDetailScreen extends StatelessWidget {
  final Study survey;
  const SurveyDetailScreen({super.key, required this.survey});

  @override
  Widget build(BuildContext context) {
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
                          color: AppTheme.primaryContainer,
                          borderRadius: BorderRadius.circular(9999)),
                      child: Text(survey.studyStatus,
                          style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.primary,
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
                        _StatBlock(title: 'RESPONSES', value: '0'),
                      ],
                    ),
                  ]),
            ),
            const SizedBox(height: 32),

            const Text('Recruitment',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary)),
            const SizedBox(height: 12),

            // 🚨 FIND PARTICIPANTS BUTTON
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
                              'View profiles that match your criteria and invite them to participate.',
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
            )
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
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title,
          style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: AppTheme.textSecondary,
              letterSpacing: 1)),
      const SizedBox(height: 4),
      Text(value,
          style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppTheme.textPrimary)),
    ]);
  }
}
