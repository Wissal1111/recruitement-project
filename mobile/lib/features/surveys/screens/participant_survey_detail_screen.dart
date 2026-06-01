import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../models/survey_model.dart';
import '../providers/recruitment_provider.dart';

class ParticipantSurveyDetailScreen extends ConsumerStatefulWidget {
  final Study survey;
  const ParticipantSurveyDetailScreen({super.key, required this.survey});

  @override
  ConsumerState<ParticipantSurveyDetailScreen> createState() =>
      _ParticipantSurveyDetailScreenState();
}

class _ParticipantSurveyDetailScreenState
    extends ConsumerState<ParticipantSurveyDetailScreen> {
  bool _isApplying = false;

  Future<void> _apply() async {
    setState(() => _isApplying = true);
    try {
      // ✅ REMOVE firstPhaseId - applyToStudy only needs studyId now
      await ref.read(recruitmentRepositoryProvider).applyToStudy(
            widget.survey.studyId,
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Application submitted! Waiting for approval.'),
            backgroundColor: AppTheme.successColor));
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content:
                Text('Failed: ${e.toString().replaceAll("Exception: ", "")}'),
            backgroundColor: AppTheme.errorColor));
      }
    } finally {
      if (mounted) setState(() => _isApplying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final survey = widget.survey;
    final phases = survey.phases;

    // Calculate reward per phase
    double totalReward = 0;
    for (var phase in phases) {
      final raw = phase['rewardAmount'];
      if (raw is num) {
        totalReward += raw.toDouble();
      } else if (raw is Map && raw['\$numberDecimal'] != null) {
        totalReward += double.tryParse(raw['\$numberDecimal'].toString()) ?? 0;
      }
    }

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new,
                color: AppTheme.textPrimary, size: 20),
            onPressed: () => context.pop()),
        title: const Text('Survey Details',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Survey Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(20)),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
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
                      Text(survey.studyCategory,
                          style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                              fontWeight: FontWeight.w600)),
                    ]),
                    const SizedBox(height: 16),
                    Text(survey.title,
                        style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary)),
                    const SizedBox(height: 8),
                    Text(survey.description ?? 'No description provided.',
                        style: const TextStyle(
                            fontSize: 14,
                            color: AppTheme.textSecondary,
                            height: 1.5)),
                    const SizedBox(height: 20),
                    const Divider(color: AppTheme.surfaceHigh),
                    const SizedBox(height: 12),
                    Row(children: [
                      _InfoChip(
                          icon: Icons.layers_outlined,
                          label: '${survey.phaseCount} Phases'),
                      const SizedBox(width: 16),
                      _InfoChip(
                          icon: Icons.monetization_on_outlined,
                          label: '\$${totalReward.toStringAsFixed(0)} Reward'),
                    ]),
                  ]),
            ),
            const SizedBox(height: 24),

            // Creator Info
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(20)),
              child: Row(children: [
                CircleAvatar(
                    backgroundColor: AppTheme.primaryContainer,
                    radius: 24,
                    child: Text(
                        survey.creatorId.isNotEmpty
                            ? survey.creatorId[0].toUpperCase()
                            : 'C',
                        style: const TextStyle(
                            color: AppTheme.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 18))),
                const SizedBox(width: 14),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      const Text('CREATED BY',
                          style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textSecondary,
                              letterSpacing: 1)),
                      const SizedBox(height: 4),
                      Text('Creator ${survey.creatorId.substring(0, 8)}...',
                          style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary)),
                    ])),
              ]),
            ),
            const SizedBox(height: 24),

            // Phases Breakdown
            const Text('Phases Overview',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary)),
            const SizedBox(height: 12),

            ...phases.asMap().entries.map((entry) {
              final i = entry.key;
              final phase = entry.value;
              final title = phase['title'] ?? 'Phase ${i + 1}';
              final questionCount = (phase['questions'] as List?)?.length ?? 0;
              final rawReward = phase['rewardAmount'];
              String reward = '\$0';
              if (rawReward is num) {
                reward = '\$${rawReward.toStringAsFixed(0)}';
              } else if (rawReward is Map &&
                  rawReward['\$numberDecimal'] != null) {
                reward =
                    '\$${double.tryParse(rawReward['\$numberDecimal'].toString())?.toStringAsFixed(0) ?? '0'}';
              }

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.surfaceHigh)),
                child: Row(children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                        color: AppTheme.primaryContainer,
                        borderRadius: BorderRadius.circular(10)),
                    child: Center(
                        child: Text('${i + 1}',
                            style: const TextStyle(
                                color: AppTheme.primary,
                                fontWeight: FontWeight.w800,
                                fontSize: 16))),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Text(
                            title.toString().trim().isEmpty
                                ? 'Phase ${i + 1}'
                                : title.toString(),
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary)),
                        Text('$questionCount questions',
                            style: const TextStyle(
                                fontSize: 12, color: AppTheme.textSecondary)),
                      ])),
                  Text(reward,
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primary)),
                ]),
              );
            }),
            const SizedBox(height: 32),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        color: Colors.white,
        padding: const EdgeInsets.all(20),
        child: ElevatedButton(
          onPressed: _isApplying ? null : _apply,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            minimumSize: const Size(double.infinity, 54),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: _isApplying
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2))
              : const Text('Participate Now',
                  style: TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                      fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(icon, size: 16, color: AppTheme.primary),
      const SizedBox(width: 6),
      Text(label,
          style: const TextStyle(
              fontSize: 13,
              color: AppTheme.textPrimary,
              fontWeight: FontWeight.w600)),
    ]);
  }
}
