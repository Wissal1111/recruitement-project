import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/theme.dart';
import '../providers/auth_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final name = user?.firstname ?? 'User';

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Hello, $name 👋',
                            style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary)),
                        const SizedBox(height: 4),
                        const Text('Ready to curate some insights today?',
                            style: TextStyle(
                                color: AppTheme.textSecondary, fontSize: 13)),
                      ]),
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: AppTheme.primaryLight,
                    child: Text(name.isNotEmpty ? name[0].toUpperCase() : 'U',
                        style: const TextStyle(
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(children: [
                _StatCard(
                    label: 'ACTIVE SURVEYS',
                    value: '12',
                    icon: Icons.assignment_outlined),
                const SizedBox(width: 16),
                _StatCard(
                    label: 'EARNINGS',
                    value: '\$145.00',
                    icon: Icons.account_balance_wallet_outlined),
              ]),
              const SizedBox(height: 24),
              _ActionCard(
                color: AppTheme.primaryColor,
                title: 'Create New Survey',
                subtitle:
                    'Design a beautiful, high-converting survey in minutes.',
                icon: Icons.add,
                onTap: () {},
              ),
              const SizedBox(height: 16),
              _ActionCard(
                color: const Color(0xFF6B7280),
                title: 'Browse Available Surveys',
                subtitle: 'Explore community templates and public research.',
                icon: Icons.explore,
                onTap: () {},
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Recent Activity',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary)),
                  TextButton(
                      onPressed: () {},
                      child: const Text('View All',
                          style: TextStyle(color: AppTheme.primaryColor))),
                ],
              ),
              const SizedBox(height: 12),
              _ActivityItem(
                  icon: Icons.bar_chart,
                  color: AppTheme.primaryColor,
                  title: 'User Experience Research Q3',
                  subtitle: '14 new responses received today',
                  time: '2H AGO'),
              _ActivityItem(
                  icon: Icons.check_circle,
                  color: AppTheme.successColor,
                  title: 'Payment Processed',
                  subtitle: "Earnings from 'Brand Perception' added to wallet",
                  time: 'YESTERDAY'),
              _ActivityItem(
                  icon: Icons.star,
                  color: const Color(0xFFF59E0B),
                  title: 'Milestone Reached',
                  subtitle: "You've reached 'Expert Curator' status",
                  time: '2D AGO'),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  const _StatCard(
      {required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(16)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: AppTheme.primaryColor, size: 22),
          const SizedBox(height: 12),
          Text(label,
              style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.textSecondary,
                  letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary)),
        ]),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final Color color;
  final String title, subtitle;
  final IconData icon;
  final VoidCallback onTap;
  const _ActionCard(
      {required this.color,
      required this.title,
      required this.subtitle,
      required this.icon,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
            color: color, borderRadius: BorderRadius.circular(20)),
        child: Row(children: [
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(title,
                    style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Colors.white)),
                const SizedBox(height: 6),
                Text(subtitle,
                    style: TextStyle(
                        fontSize: 13, color: Colors.white.withOpacity(0.8))),
              ])),
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
            child: Icon(icon, color: Colors.white),
          ),
        ]),
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title, subtitle, time;
  const _ActivityItem(
      {required this.icon,
      required this.color,
      required this.title,
      required this.subtitle,
      required this.time});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(14)),
      child: Row(children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: AppTheme.textPrimary)),
          const SizedBox(height: 2),
          Text(subtitle,
              style:
                  const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
        ])),
        const SizedBox(width: 8),
        Text(time,
            style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppTheme.textSecondary)),
      ]),
    );
  }
}
