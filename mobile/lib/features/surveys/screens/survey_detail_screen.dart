import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../models/survey_model.dart'; // Import your model!

class SurveyDetailScreen extends StatelessWidget {
  final Study survey; // Accept the survey data
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
        title: Text(survey.title,
            style: const TextStyle(
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
                'phases': survey.phases, // <--- THIS WAS MISSING!
              });
            },
          )
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Status: ${survey.studyStatus}',
                style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 20),
            const Text('Survey Statistics & Details coming soon!',
                style: TextStyle(color: AppTheme.textSecondary)),
          ],
        ),
      ),
    );
  }
}
