import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/theme.dart';
import '../providers/recruitment_provider.dart';

class InvitationsScreen extends ConsumerWidget {
  const InvitationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final invitesAsync = ref.watch(myInvitationsProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        title: const Text('My Invitations',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 18)),
        backgroundColor: AppTheme.surfaceBase,
        elevation: 0,
      ),
      body: invitesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) =>
            const Center(child: Text('Failed to load invitations')),
        data: (invites) {
          if (invites.isEmpty) {
            return const Center(
                child: Text('No new invitations right now.',
                    style: TextStyle(color: AppTheme.textSecondary)));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: invites.length,
            itemBuilder: (context, index) {
              final invite = invites[index];
              final inviteId = invite['id'] ?? invite['invitationId'];

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
                        const CircleAvatar(
                            backgroundColor: AppTheme.primaryContainer,
                            child: Icon(Icons.mail, color: AppTheme.primary)),
                        const SizedBox(width: 12),
                        Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              const Text('You were invited!',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 15)),
                              Text('Survey ID: ${invite['studyId']}',
                                  style: const TextStyle(
                                      color: AppTheme.primary,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600)),
                            ])),
                      ]),
                      const SizedBox(height: 20),
                      Row(children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () async {
                              await ref
                                  .read(recruitmentRepositoryProvider)
                                  .respondToInvitation(inviteId, false);
                              ref.invalidate(myInvitationsProvider);
                            },
                            style: OutlinedButton.styleFrom(
                                foregroundColor: AppTheme.errorColor,
                                side: const BorderSide(
                                    color: AppTheme.errorColor)),
                            child: const Text('Decline'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () async {
                              await ref
                                  .read(recruitmentRepositoryProvider)
                                  .respondToInvitation(inviteId, true);
                              ref.invalidate(myInvitationsProvider);
                            },
                            style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.successColor,
                                foregroundColor: Colors.white),
                            child: const Text('Accept'),
                          ),
                        ),
                      ]),
                    ]),
              );
            },
          );
        },
      ),
    );
  }
}
