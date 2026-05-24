import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../models/survey_model.dart';
import '../providers/recruitment_provider.dart';

class InviteParticipantsScreen extends ConsumerStatefulWidget {
  final Study survey;
  const InviteParticipantsScreen({super.key, required this.survey});

  @override
  ConsumerState<InviteParticipantsScreen> createState() =>
      _InviteParticipantsScreenState();
}

class _InviteParticipantsScreenState
    extends ConsumerState<InviteParticipantsScreen> {
  bool _isLaunching = false;

  Future<void> _launchCampaign() async {
    setState(() => _isLaunching = true);
    try {
      await ref
          .read(recruitmentRepositoryProvider)
          .launchCampaign(widget.survey.studyId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content:
                Text('Invitations sent automatically to the best matches!'),
            backgroundColor: AppTheme.successColor));
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Failed to launch campaign.'),
            backgroundColor: AppTheme.errorColor));
      }
    } finally {
      if (mounted) setState(() => _isLaunching = false);
    }
  }

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
            onPressed: () => context.pop()),
        title: const Text('Matched Participants',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Targeting for: ${widget.survey.title}',
                  style: const TextStyle(
                      fontSize: 13, color: AppTheme.textSecondary)),
              const SizedBox(height: 8),
              const Text('AI Matchmaker',
                  style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary)),
              const SizedBox(height: 4),
              const Text(
                  'Launch an invitation campaign. Our system will automatically email the best matches.',
                  style:
                      TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
            ]),
          ),
          const Spacer(),
          Center(
            child: Icon(Icons.auto_awesome,
                size: 80, color: AppTheme.primary.withOpacity(0.3)),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(24),
            child: ElevatedButton(
              onPressed: _isLaunching ? null : _launchCampaign,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                minimumSize: const Size(double.infinity, 54),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              child: _isLaunching
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Launch Auto-Invite Campaign',
                      style: TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                          fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
    );
  }
}
