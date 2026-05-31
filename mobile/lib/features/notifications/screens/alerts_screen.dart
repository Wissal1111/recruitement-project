import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/api_client.dart';
import '../../../../shared/theme.dart';
import '../../surveys/models/survey_model.dart';
import '../../surveys/providers/survey_provider.dart';

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

class AlertsScreen extends ConsumerStatefulWidget {
  const AlertsScreen({super.key});

  @override
  ConsumerState<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends ConsumerState<AlertsScreen> {
  // Persist dismissed IDs across rebuilds
  final Set<String> _dismissed = {};

  Future<void> _markAsRead(String notifId) async {
    if (notifId.isEmpty) return;
    try {
      final dio = ref.read(dioProvider);
      await dio.put('/api/notifications/$notifId');
    } catch (e) {
      debugPrint('Mark as read failed: $e');
    }
  }

  String _resolveId(dynamic n) =>
      (n['notificationId'] ?? n['id'] ?? '').toString();

  @override
  Widget build(BuildContext context) {
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
          // Filter already-read and locally dismissed
          final visible = notifications.where((n) {
            final id = _resolveId(n);
            if (_dismissed.contains(id)) return false;
            return true;
          }).toList();

          if (visible.isEmpty) {
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
            itemCount: visible.length,
            itemBuilder: (context, index) {
              final n = visible[index] as Map<String, dynamic>;
              final notifId = _resolveId(n);

              return Dismissible(
                key: Key('notif_$notifId'),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 20),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                      color: AppTheme.errorColor,
                      borderRadius: BorderRadius.circular(16)),
                  child: const Icon(Icons.delete_outline,
                      color: Colors.white, size: 24),
                ),
                onDismissed: (_) {
                  setState(() => _dismissed.add(notifId));
                  _markAsRead(notifId);
                },
                child: _NotificationTile(
                  key: Key('tile_$notifId'),
                  notification: n,
                  notifId: notifId,
                  onDismiss: () {
                    setState(() => _dismissed.add(notifId));
                    _markAsRead(notifId);
                  },
                  onGoToPhase: (Study study, int phaseIndex) async {
                    setState(() => _dismissed.add(notifId));
                    await _markAsRead(notifId);
                    if (context.mounted) {
                      context.push('/surveys/answer', extra: {
                        'survey': study,
                        'phaseIndex': phaseIndex,
                      });
                    }
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}

// Stateful so loading state persists during async study fetch
class _NotificationTile extends ConsumerStatefulWidget {
  final Map<String, dynamic> notification;
  final String notifId;
  final VoidCallback onDismiss;
  final Future<void> Function(Study study, int phaseIndex) onGoToPhase;

  const _NotificationTile({
    super.key,
    required this.notification,
    required this.notifId,
    required this.onDismiss,
    required this.onGoToPhase,
  });

  @override
  ConsumerState<_NotificationTile> createState() => _NotificationTileState();
}

class _NotificationTileState extends ConsumerState<_NotificationTile> {
  bool _isLoading = false;

  String? _parseStudyId(String msg) =>
      RegExp(r'\[studyId:([^\]]+)\]').firstMatch(msg)?.group(1);

  int? _parseNextPhase(String msg) {
    final m = RegExp(r'\[nextPhase:(\d+)\]').firstMatch(msg);
    return m != null ? int.tryParse(m.group(1) ?? '') : null;
  }

  String _clean(String msg) => msg
      .replaceAll(RegExp(r'\[studyId:[^\]]+\]'), '')
      .replaceAll(RegExp(r'\[nextPhase:[^\]]+\]'), '')
      .trim();

  IconData _icon(String type) {
    switch (type) {
      case 'PHASE_APPROVED':
        return Icons.check_circle_outline;
      case 'PHASE_REJECTED':
        return Icons.cancel_outlined;
      case 'RESPONSE_SUBMITTED':
        return Icons.assignment_turned_in_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  Future<void> _handleGoToPhase(String studyId, int nextPhaseIndex) async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    try {
      debugPrint('🚀 Loading study: $studyId for phase: $nextPhaseIndex');
      final studyData =
          await ref.read(surveyRepositoryProvider).getStudyById(studyId);

      debugPrint('📦 Study data: $studyData');

      if (studyData == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Could not load survey.'),
              backgroundColor: AppTheme.errorColor));
        }
        return;
      }

      final study = Study.fromJson(studyData);
      debugPrint(
          '✅ Study loaded: ${study.title}, phases: ${study.phases.length}');

      if (mounted) {
        await widget.onGoToPhase(study, nextPhaseIndex);
      }
    } catch (e) {
      debugPrint('❌ Error loading study: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Error: $e'), backgroundColor: AppTheme.errorColor));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final n = widget.notification;
    final isRead = n['isRead'] == true;
    final type = (n['type'] ?? '').toString();
    final rawMsg = (n['message'] ?? '').toString();
    final displayMsg = _clean(rawMsg);

    final studyId = _parseStudyId(rawMsg);
    final nextPhaseIndex = _parseNextPhase(rawMsg);
    final canGoNext = studyId != null && nextPhaseIndex != null;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isRead ? Colors.white : AppTheme.primaryContainer,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.surfaceHigh),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(_icon(type),
              color: isRead ? AppTheme.textTertiary : AppTheme.primary,
              size: 24),
          const SizedBox(width: 12),
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(n['title'] ?? 'Notification',
                  style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                      color: isRead
                          ? AppTheme.textSecondary
                          : AppTheme.textPrimary)),
              const SizedBox(height: 6),
              Text(displayMsg,
                  style: const TextStyle(
                      fontSize: 13,
                      color: AppTheme.textSecondary,
                      height: 1.4)),
            ]),
          ),
          if (!isRead)
            GestureDetector(
              onTap: widget.onDismiss,
              child: const Padding(
                padding: EdgeInsets.only(left: 8),
                child:
                    Icon(Icons.close, size: 16, color: AppTheme.textTertiary),
              ),
            ),
        ]),
        if (canGoNext) ...[
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isLoading
                  ? null
                  : () => _handleGoToPhase(studyId!, nextPhaseIndex!),
              icon: _isLoading
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.play_arrow, size: 16, color: Colors.white),
              label: Text(
                  _isLoading
                      ? 'Loading...'
                      : 'Continue Phase ${nextPhaseIndex! + 1}',
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.w600)),
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10))),
            ),
          ),
        ],
      ]),
    );
  }
}
