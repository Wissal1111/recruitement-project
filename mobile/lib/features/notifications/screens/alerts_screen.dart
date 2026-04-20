import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';
import '../../../shared/theme.dart';

// Provider
final notificationsProvider =
    AsyncNotifierProvider<NotificationsNotifier, List<Map<String, dynamic>>>(
  NotificationsNotifier.new,
);

class NotificationsNotifier extends AsyncNotifier<List<Map<String, dynamic>>> {
  @override
  Future<List<Map<String, dynamic>>> build() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/api/notifications');
      final list = res.data as List<dynamic>;
      return list.cast<Map<String, dynamic>>();
    } catch (_) {
      return [];
    }
  }

  Future<void> markRead(String id) async {
    try {
      final dio = ref.read(dioProvider);
      await dio.put('/api/notifications/$id');
      state = AsyncData(
        (state.valueOrNull ?? []).map((n) {
          if (n['notificationId'] == id) {
            return {...n, 'isRead': true};
          }
          return n;
        }).toList(),
      );
    } catch (_) {}
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/api/notifications');
      final list = res.data as List<dynamic>;
      return list.cast<Map<String, dynamic>>();
    });
  }
}

class AlertsScreen extends ConsumerWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifAsync = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
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
                              color: AppTheme.primary)),
                      Row(children: [
                        IconButton(
                          icon: const Icon(Icons.refresh_outlined,
                              color: AppTheme.textSecondary),
                          onPressed: () => ref
                              .read(notificationsProvider.notifier)
                              .refresh(),
                        ),
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: AppTheme.primaryContainer,
                          child: const Icon(Icons.person,
                              size: 18, color: AppTheme.primary),
                        ),
                      ]),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Notification settings card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
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
                          const _ToggleTile(
                              icon: Icons.notifications_outlined,
                              title: 'Push Notifications',
                              subtitle: 'INSTANT DELIVERY',
                              defaultValue: true),
                          const _ToggleTile(
                              icon: Icons.mail_outline,
                              title: 'Email Digest',
                              subtitle: 'DAILY SUMMARY',
                              defaultValue: true),
                          const _ToggleTile(
                              icon: Icons.message_outlined,
                              title: 'SMS Alerts',
                              subtitle: 'PRIORITY EVENTS',
                              defaultValue: false),
                        ]),
                  ),
                  const SizedBox(height: 16),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(16),
                    ),
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
                    notifAsync.when(
                      data: (list) {
                        final unread =
                            list.where((n) => n['isRead'] == false).toList();
                        if (unread.isEmpty) return const SizedBox.shrink();
                        return TextButton(
                          onPressed: () async {
                            for (final n in unread) {
                              await ref
                                  .read(notificationsProvider.notifier)
                                  .markRead(n['notificationId']);
                            }
                          },
                          child: const Text('MARK ALL AS READ',
                              style: TextStyle(
                                  fontSize: 11,
                                  color: AppTheme.primary,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.5)),
                        );
                      },
                      loading: () => const SizedBox.shrink(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),
                  ]),
            ),
            Expanded(
              child: notifAsync.when(
                loading: () => const Center(
                    child: CircularProgressIndicator(color: AppTheme.primary)),
                error: (e, _) => Center(
                  child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.notifications_off_outlined,
                            color: AppTheme.textTertiary, size: 48),
                        const SizedBox(height: 16),
                        const Text('Could not load notifications',
                            style: TextStyle(color: AppTheme.textSecondary)),
                        const SizedBox(height: 12),
                        OutlinedButton(
                          onPressed: () => ref
                              .read(notificationsProvider.notifier)
                              .refresh(),
                          child: const Text('Retry'),
                        ),
                      ]),
                ),
                data: (notifications) {
                  if (notifications.isEmpty) {
                    return const Center(
                      child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.notifications_none_outlined,
                                color: AppTheme.textTertiary, size: 56),
                            SizedBox(height: 16),
                            Text('No notifications yet',
                                style: TextStyle(
                                    color: AppTheme.textSecondary,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600)),
                            SizedBox(height: 8),
                            Text("You're all caught up!",
                                style: TextStyle(
                                    color: AppTheme.textTertiary,
                                    fontSize: 13)),
                          ]),
                    );
                  }

                  return ListView.separated(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    itemCount: notifications.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final n = notifications[i];
                      final isRead = n['isRead'] == true;
                      return GestureDetector(
                        onTap: () {
                          if (!isRead) {
                            ref
                                .read(notificationsProvider.notifier)
                                .markRead(n['notificationId']);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isRead
                                ? Colors.white
                                : AppTheme.primaryContainer.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor: AppTheme.primaryContainer,
                                  child: const Icon(
                                      Icons.notifications_outlined,
                                      color: AppTheme.primary,
                                      size: 18),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                    child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                      Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(n['title'] ?? '',
                                                  style: TextStyle(
                                                    fontWeight: isRead
                                                        ? FontWeight.w500
                                                        : FontWeight.w700,
                                                    fontSize: 14,
                                                    color: AppTheme.textPrimary,
                                                  )),
                                            ),
                                            if (!isRead)
                                              Container(
                                                width: 8,
                                                height: 8,
                                                decoration: const BoxDecoration(
                                                  color: AppTheme.primary,
                                                  shape: BoxShape.circle,
                                                ),
                                              ),
                                          ]),
                                      const SizedBox(height: 4),
                                      Text(n['message'] ?? '',
                                          style: const TextStyle(
                                              fontSize: 12,
                                              color: AppTheme.textSecondary,
                                              height: 1.4)),
                                    ])),
                              ]),
                        ),
                      );
                    },
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

class _ToggleTile extends StatefulWidget {
  final IconData icon;
  final String title, subtitle;
  final bool defaultValue;
  const _ToggleTile(
      {required this.icon,
      required this.title,
      required this.subtitle,
      required this.defaultValue});

  @override
  State<_ToggleTile> createState() => _ToggleTileState();
}

class _ToggleTileState extends State<_ToggleTile> {
  late bool _val;
  @override
  void initState() {
    super.initState();
    _val = widget.defaultValue;
  }

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(children: [
          Icon(widget.icon, color: AppTheme.textSecondary, size: 20),
          const SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(widget.title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14)),
                Text(widget.subtitle,
                    style: const TextStyle(
                        fontSize: 11,
                        color: AppTheme.textSecondary,
                        letterSpacing: 0.5)),
              ])),
          Switch(
              value: _val,
              onChanged: (v) => setState(() => _val = v),
              activeColor: AppTheme.primary),
        ]),
      );
}
