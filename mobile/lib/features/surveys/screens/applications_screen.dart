import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../models/survey_model.dart';
import '../providers/recruitment_provider.dart';

class ApplicationsScreen extends ConsumerWidget {
  final Study survey;
  const ApplicationsScreen({super.key, required this.survey});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new,
                color: AppTheme.textPrimary, size: 20),
            onPressed: () => context.pop()),
        title: const Text('Applications',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
      ),
      body: FutureBuilder(
        future: ref
            .read(recruitmentRepositoryProvider)
            .getStudyApplications(survey.studyId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final apps = snapshot.data ?? [];

          if (apps.isEmpty) {
            return const Center(
              child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.inbox_outlined,
                        size: 64, color: AppTheme.textTertiary),
                    SizedBox(height: 16),
                    Text('No applications yet.',
                        style: TextStyle(
                            fontSize: 16,
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w600)),
                    SizedBox(height: 8),
                    Text(
                        'Launch an invitation campaign to start receiving applications.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 13, color: AppTheme.textTertiary)),
                  ]),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: apps.length,
            itemBuilder: (context, index) {
              final app = apps[index];
              final status = app['status'] ?? 'PENDING';
              final isPending = status == 'PENDING' || status == 'APPLIED';

              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: AppTheme.ambientShadow),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        CircleAvatar(
                            backgroundColor: AppTheme.primaryContainer,
                            child: Text(
                                (app['participantId'] ?? 'U')
                                    .toString()
                                    .substring(0, 1)
                                    .toUpperCase(),
                                style: const TextStyle(
                                    color: AppTheme.primary,
                                    fontWeight: FontWeight.bold))),
                        const SizedBox(width: 12),
                        Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text(
                                  'Participant: ${app['participantId']?.toString().substring(0, 8) ?? 'Unknown'}...',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14)),
                              Text('Status: $status',
                                  style: TextStyle(
                                      color: isPending
                                          ? AppTheme.primary
                                          : AppTheme.successColor,
                                      fontSize: 12)),
                            ])),
                      ]),
                      if (isPending) ...[
                        const SizedBox(height: 16),
                        Row(children: [
                          Expanded(
                              child: OutlinedButton(
                            onPressed: () async {
                              await ref
                                  .read(recruitmentRepositoryProvider)
                                  .reviewApplication(
                                      app['id'].toString(), 'REJECTED');
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                        content: Text('Application rejected.'),
                                        backgroundColor: AppTheme.errorColor));
                              }
                            },
                            style: OutlinedButton.styleFrom(
                                foregroundColor: AppTheme.errorColor,
                                side: const BorderSide(
                                    color: AppTheme.errorColor)),
                            child: const Text('Reject'),
                          )),
                          const SizedBox(width: 12),
                          Expanded(
                              child: ElevatedButton(
                            onPressed: () async {
                              await ref
                                  .read(recruitmentRepositoryProvider)
                                  .reviewApplication(
                                      app['id'].toString(), 'APPROVED');
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                        content: Text('Application approved!'),
                                        backgroundColor:
                                            AppTheme.successColor));
                              }
                            },
                            style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.successColor,
                                foregroundColor: Colors.white),
                            child: const Text('Approve'),
                          )),
                        ]),
                      ],
                    ]),
              );
            },
          );
        },
      ),
    );
  }
}
