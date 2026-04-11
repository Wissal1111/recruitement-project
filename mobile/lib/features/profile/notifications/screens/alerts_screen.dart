import 'package:flutter/material.dart';

import '../../../../shared/theme.dart';

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final alerts = [
      _Alert(
          icon: Icons.person,
          color: AppTheme.primaryColor,
          title: 'New Curation shared',
          message:
              'Marcus Rivera shared "Minimalist Architecture 2024" with you.',
          time: '2m ago',
          actions: ['VIEW STREAM', 'IGNORE']),
      _Alert(
          icon: Icons.shield_outlined,
          color: AppTheme.errorColor,
          title: 'Security Alert',
          message:
              'A new login was detected from Chrome on MacOS (San Francisco, CA).',
          time: '1h ago'),
      _Alert(
          icon: Icons.bar_chart,
          color: AppTheme.primaryColor,
          title: 'Weekly Recap Available',
          message:
              'Your curation analytics for this week are ready. You gained 240 new followers.',
          time: '5h ago'),
      _Alert(
          icon: Icons.campaign_outlined,
          color: AppTheme.textSecondary,
          title: 'System Maintenance',
          message:
              'Scheduled maintenance on Oct 24, 02:00 AM UTC. Services may be briefly unavailable.',
          time: 'Yesterday'),
    ];

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Curator',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.primaryColor)),
                        CircleAvatar(
                            radius: 18,
                            backgroundColor: AppTheme.primaryLight,
                            child: const Icon(Icons.person,
                                size: 18, color: AppTheme.primaryColor)),
                      ]),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16)),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Notification Center',
                              style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textPrimary)),
                          const SizedBox(height: 4),
                          const Text(
                              'Customize how you receive updates and alerts.',
                              style: TextStyle(
                                  color: AppTheme.textSecondary, fontSize: 13)),
                          const SizedBox(height: 16),
                          _ToggleTile(
                              icon: Icons.notifications_outlined,
                              title: 'Push Notifications',
                              subtitle: 'INSTANT DELIVERY',
                              value: true),
                          _ToggleTile(
                              icon: Icons.mail_outline,
                              title: 'Email Digest',
                              subtitle: 'DAILY SUMMARY',
                              value: true),
                          _ToggleTile(
                              icon: Icons.message_outlined,
                              title: 'SMS Alerts',
                              subtitle: 'PRIORITY EVENTS',
                              value: false),
                        ]),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(16)),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Smart Filtering',
                              style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white)),
                          const SizedBox(height: 6),
                          Text(
                              'Our AI learns your preferences to highlight the most important alerts.',
                              style: TextStyle(
                                  color: Colors.white.withOpacity(0.8),
                                  fontSize: 13)),
                        ]),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('RECENT ACTIVITY',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 1,
                            color: AppTheme.textSecondary)),
                    TextButton(
                        onPressed: () {},
                        child: const Text('MARK ALL AS READ',
                            style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.primaryColor,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.5))),
                  ]),
            ),
            Expanded(
              child: ListView.separated(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                itemCount: alerts.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (_, i) {
                  final a = alerts[i];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14)),
                    child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CircleAvatar(
                              radius: 20,
                              backgroundColor: a.color.withOpacity(0.1),
                              child: Icon(a.icon, color: a.color, size: 18)),
                          const SizedBox(width: 12),
                          Expanded(
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(a.title,
                                          style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14)),
                                      Text(a.time,
                                          style: const TextStyle(
                                              fontSize: 11,
                                              color: AppTheme.textSecondary)),
                                    ]),
                                const SizedBox(height: 4),
                                Text(a.message,
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary,
                                        height: 1.4)),
                                if (a.actions.isNotEmpty) ...[
                                  const SizedBox(height: 10),
                                  Row(
                                      children: a.actions
                                          .map((action) => Padding(
                                                padding: const EdgeInsets.only(
                                                    right: 8),
                                                child: OutlinedButton(
                                                  onPressed: () {},
                                                  style:
                                                      OutlinedButton.styleFrom(
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 12,
                                                        vertical: 4),
                                                    minimumSize: Size.zero,
                                                    side: const BorderSide(
                                                        color:
                                                            Color(0xFFE5E7EB)),
                                                    shape:
                                                        RoundedRectangleBorder(
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        8)),
                                                    foregroundColor:
                                                        AppTheme.primaryColor,
                                                  ),
                                                  child: Text(action,
                                                      style: const TextStyle(
                                                          fontSize: 11)),
                                                ),
                                              ))
                                          .toList()),
                                ],
                              ])),
                        ]),
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

class _Alert {
  final IconData icon;
  final Color color;
  final String title, message, time;
  final List<String> actions;
  const _Alert(
      {required this.icon,
      required this.color,
      required this.title,
      required this.message,
      required this.time,
      this.actions = const []});
}

class _ToggleTile extends StatefulWidget {
  final IconData icon;
  final String title, subtitle;
  final bool value;
  const _ToggleTile(
      {required this.icon,
      required this.title,
      required this.subtitle,
      required this.value});
  @override
  State<_ToggleTile> createState() => _ToggleTileState();
}

class _ToggleTileState extends State<_ToggleTile> {
  late bool _val;
  @override
  void initState() {
    super.initState();
    _val = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(children: [
        Icon(widget.icon, color: AppTheme.textSecondary, size: 20),
        const SizedBox(width: 12),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(widget.title,
              style:
                  const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          Text(widget.subtitle,
              style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.textSecondary,
                  letterSpacing: 0.5)),
        ])),
        Switch(
          value: _val,
          onChanged: (v) => setState(() => _val = v),
          activeColor: AppTheme.primaryColor,
        ),
      ]),
    );
  }
}
