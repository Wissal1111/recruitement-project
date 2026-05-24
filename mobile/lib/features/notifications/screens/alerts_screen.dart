import 'package:flutter/material.dart';

import '../../../../shared/theme.dart';

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        title: const Text('Notifications',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 18)),
        backgroundColor: AppTheme.surfaceBase,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _NotificationCard(
            title: 'Application Approved!',
            body:
                'You have been approved to participate in "AI Adoption in Healthcare". You can now start Phase 1.',
            icon: Icons.check_circle,
            color: AppTheme.successColor,
            time: '2 hours ago',
          ),
          _NotificationCard(
            title: 'Application Declined',
            body:
                'Unfortunately, your profile did not meet the exact criteria for "Smart Home Devices Feedback".',
            icon: Icons.cancel,
            color: AppTheme.errorColor,
            time: '1 day ago',
          ),
        ],
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final String title, body, time;
  final IconData icon;
  final Color color;

  const _NotificationCard(
      {required this.title,
      required this.body,
      required this.time,
      required this.icon,
      required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.surfaceHigh)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(width: 12),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(
                child: Text(title,
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: color))),
            Text(time,
                style: const TextStyle(
                    fontSize: 11, color: AppTheme.textTertiary)),
          ]),
          const SizedBox(height: 6),
          Text(body,
              style: const TextStyle(
                  fontSize: 13, color: AppTheme.textSecondary, height: 1.4)),
        ])),
      ]),
    );
  }
}
