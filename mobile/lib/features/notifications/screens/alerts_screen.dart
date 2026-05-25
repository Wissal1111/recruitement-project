import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/api_client.dart';
import '../../../../shared/theme.dart';

final notificationsProvider = FutureProvider.autoDispose((ref) async {
  try {
    final dio = ref.read(dioProvider);
    final res = await dio.get('/api/notifications');
    if (res.data is List) return res.data as List;
    if (res.data is Map && res.data['notifications'] != null)
      return res.data['notifications'] as List;
    return [];
  } catch (e) {
    return [];
  }
});

class AlertsScreen extends ConsumerWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifAsync = ref.watch(notificationsProvider);

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
      body: notifAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) =>
            const Center(child: Text('Failed to load notifications')),
        data: (notifications) {
          if (notifications.isEmpty) {
            return const Center(
                child: Padding(
                    padding: EdgeInsets.all(40),
                    child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_none,
                              size: 64, color: AppTheme.textTertiary),
                          SizedBox(height: 16),
                          Text('No notifications yet.',
                              style: TextStyle(
                                  fontSize: 16,
                                  color: AppTheme.textSecondary,
                                  fontWeight: FontWeight.w600)),
                        ])));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final n = notifications[index];
              final isRead = n['isRead'] == true;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isRead ? Colors.white : AppTheme.primaryContainer,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.surfaceHigh),
                ),
                child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                          isRead
                              ? Icons.notifications_none
                              : Icons.notifications_active,
                          color:
                              isRead ? AppTheme.textTertiary : AppTheme.primary,
                          size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            Text(n['title'] ?? 'Notification',
                                style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 15,
                                    color: isRead
                                        ? AppTheme.textSecondary
                                        : AppTheme.textPrimary)),
                            const SizedBox(height: 6),
                            Text(n['message'] ?? '',
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textSecondary,
                                    height: 1.4)),
                          ])),
                    ]),
              );
            },
          );
        },
      ),
    );
  }
}
