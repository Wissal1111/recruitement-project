import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authUser = ref.watch(currentUserProvider);
    final profileAsync = ref.watch(profileProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: profileAsync.when(
          loading: () => const Center(child: CircularProgressIndicator(
            color: AppTheme.primary,
          )),
          error: (e, _) => Center(child: Text('$e')),
          data: (profile) {
            final fullName = '${authUser?.firstname ?? ''} ${authUser?.lastname ?? ''}'.trim();
            final earnings = profile?.totalEarnings ?? 0.0;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    const Text('LucidCurator', style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.primary)),
                    const Icon(Icons.notifications_outlined),
                  ]),
                  const SizedBox(height: 24),

                  // Profile card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(children: [
                      Stack(children: [
                        Container(
                          width: 96, height: 96,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppTheme.primaryContainer,
                            image: profile?.profilePictureUrl != null
                                ? DecorationImage(
                                    image: NetworkImage(profile!.profilePictureUrl!),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: profile?.profilePictureUrl == null
                              ? Text(
                                  fullName.isNotEmpty
                                      ? fullName[0].toUpperCase()
                                      : 'U',
                                  style: const TextStyle(
                                    fontSize: 32, fontWeight: FontWeight.w700,
                                    color: AppTheme.primary),
                                )
                              : null,
                        ),
                        Positioned(bottom: 0, right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: AppTheme.primary, shape: BoxShape.circle),
                            child: const Icon(Icons.verified, color: Colors.white, size: 16),
                          )),
                      ]),
                      const SizedBox(height: 14),
                      Text(fullName.isNotEmpty ? fullName : 'Curator',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(
                        profile?.profession ?? 'Data Curator',
                        style: const TextStyle(color: AppTheme.primary, fontSize: 14),
                      ),
                      const SizedBox(height: 20),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceBase,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Column(children: [
                          const Text('TOTAL EARNINGS', style: TextStyle(
                            fontSize: 11, color: AppTheme.textSecondary, letterSpacing: 1)),
                          const SizedBox(height: 8),
                          Text('\$${earnings.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 28, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () {},
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                foregroundColor: Colors.white,
                                minimumSize: const Size(double.infinity, 48),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(9999)),
                              ),
                              child: const Text('Withdraw Funds'),
                            ),
                          ),
                        ]),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () async {
                            await context.push('/profile/edit');
                            // Refresh after returning from edit
                            ref.invalidate(profileProvider);
                          },
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.primary),
                            foregroundColor: AppTheme.primary,
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                          ),
                          child: const Text('Edit Profile'),
                        ),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 24),

                  const Align(alignment: Alignment.centerLeft,
                    child: Text('PREFERENCE HUB', style: TextStyle(
                      fontSize: 11, fontWeight: FontWeight.w600,
                      letterSpacing: 1, color: AppTheme.textSecondary))),
                  const SizedBox(height: 12),

                  _MenuItem(icon: Icons.lock_outline, title: 'Change Password',
                    onTap: () => context.push('/change-password')),
                  _MenuItem(icon: Icons.account_balance_wallet_outlined,
                    title: 'Payment Methods', onTap: () {}),
                  _MenuItem(icon: Icons.notifications_outlined,
                    title: 'Notification Preferences', onTap: () {}),
                  _MenuItem(icon: Icons.help_outline,
                    title: 'Help & Support', onTap: () {}),
                  const SizedBox(height: 16),

                  TextButton.icon(
                    onPressed: () async {
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) context.go('/login');
                    },
                    icon: const Icon(Icons.logout, color: AppTheme.errorColor),
                    label: const Text('LOG OUT', style: TextStyle(
                      color: AppTheme.errorColor, fontWeight: FontWeight.w600, letterSpacing: 1)),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(14)),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.primaryContainer, borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: AppTheme.primary, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
        trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
        onTap: onTap,
      ),
    );
  }
}