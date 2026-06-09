import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../../payment/providers/payment_provider.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Widget _buildAvatar(String fullName, dynamic profile) {
    final gender = (profile?.gender ?? '').toString().toLowerCase();
    final hasCustomPicture = profile?.profilePictureUrl != null &&
        profile!.profilePictureUrl!.isNotEmpty;

    if (hasCustomPicture) {
      return Container(
        width: 96,
        height: 96,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          image: DecorationImage(
            image: NetworkImage(profile!.profilePictureUrl!),
            fit: BoxFit.cover,
          ),
        ),
      );
    }

    if (gender == 'female' || gender == 'f') {
      return Container(
        width: 96,
        height: 96,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: Color(0xFFFCE4EC),
        ),
        child: const Center(
          child: Icon(Icons.face_3, size: 52, color: Color(0xFFE91E63)),
        ),
      );
    }

    if (gender == 'male' || gender == 'm') {
      return Container(
        width: 96,
        height: 96,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: Color(0xFFE3F2FD),
        ),
        child: const Center(
          child: Icon(Icons.face, size: 52, color: Color(0xFF1565C0)),
        ),
      );
    }

    return Container(
      width: 96,
      height: 96,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        color: AppTheme.primaryContainer,
      ),
      child: Center(
        child: Text(
          fullName.isNotEmpty ? fullName[0].toUpperCase() : 'U',
          style: const TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            color: AppTheme.primary,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authUser = ref.watch(currentUserProvider);
    final profileAsync = ref.watch(profileProvider);
    // ✅ Watch wallet for real earnings
    final walletAsync = ref.watch(walletProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: profileAsync.when(
          loading: () => const Center(
              child: CircularProgressIndicator(color: AppTheme.primary)),
          error: (e, _) => Center(
            child:
                Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              const Icon(Icons.person_off_outlined,
                  size: 64, color: AppTheme.textTertiary),
              const SizedBox(height: 16),
              const Text('Could not load profile',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(profileProvider),
                icon: const Icon(Icons.refresh, color: Colors.white),
                label:
                    const Text('Retry', style: TextStyle(color: Colors.white)),
                style:
                    ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
              ),
            ]),
          ),
          data: (profile) {
            final fullName =
                '${profile?.firstname ?? authUser?.firstname ?? ''} ${profile?.lastname ?? authUser?.lastname ?? ''}'
                    .trim();

            // ✅ Get earnings from wallet (real points)
            double availableUsd = 0;
            walletAsync.whenData((wallet) {
              final available = double.tryParse(
                      wallet['availablePoints']?.toString() ?? '0') ??
                  0;
              availableUsd = available / 100;
            });

            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('LucidCurator',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.primary)),
                        const Icon(Icons.notifications_outlined),
                      ]),
                  const SizedBox(height: 24),

                  // ── Profile card ──────────────────────────
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(children: [
                      Stack(children: [
                        _buildAvatar(fullName, profile),
                        Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                  color: AppTheme.primary,
                                  shape: BoxShape.circle),
                              child: const Icon(Icons.verified,
                                  color: Colors.white, size: 16),
                            )),
                      ]),
                      const SizedBox(height: 14),
                      Text(fullName.isNotEmpty ? fullName : 'Curator',
                          style: const TextStyle(
                              fontSize: 22, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(
                        profile?.profession ?? 'Data Curator',
                        style: const TextStyle(
                            color: AppTheme.primary, fontSize: 14),
                      ),
                      const SizedBox(height: 20),

                      // ── Earnings box ──────────────────────
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceBase,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Column(children: [
                          const Text('WALLET BALANCE',
                              style: TextStyle(
                                  fontSize: 11,
                                  color: AppTheme.textSecondary,
                                  letterSpacing: 1)),
                          const SizedBox(height: 8),
                          // ✅ Show real wallet balance
                          walletAsync.when(
                            loading: () => const SizedBox(
                              height: 34,
                              child: Center(
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: AppTheme.primary)),
                            ),
                            error: (_, __) => Text(
                              '\$0.00',
                              style: const TextStyle(
                                  fontSize: 28, fontWeight: FontWeight.w700),
                            ),
                            data: (wallet) {
                              final available = double.tryParse(
                                      wallet['availablePoints']?.toString() ??
                                          '0') ??
                                  0;
                              final usd = available / 100;
                              return Column(children: [
                                Text('\$${usd.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.w700)),
                                Text(
                                    '${available.toStringAsFixed(0)} points available',
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary)),
                              ]);
                            },
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () => context.push('/wallet'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                foregroundColor: Colors.white,
                                minimumSize: const Size(double.infinity, 48),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(9999)),
                              ),
                              child: const Text('My Wallet'),
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

                  // ── Preference Hub ────────────────────────
                  const Align(
                      alignment: Alignment.centerLeft,
                      child: Text('PREFERENCE HUB',
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 1,
                              color: AppTheme.textSecondary))),
                  const SizedBox(height: 12),

                  _MenuItem(
                      icon: Icons.lock_outline,
                      title: 'Change Password',
                      onTap: () => context.push('/change-password')),
                  _MenuItem(
                      icon: Icons.account_balance_wallet_outlined,
                      title: 'My Wallet',
                      onTap: () => context.push('/wallet')),
                  _MenuItem(
                      icon: Icons.credit_card,
                      title: 'Payment Cards',
                      onTap: () => context.push('/wallet/cards')),
                  _MenuItem(
                      icon: Icons.notifications_outlined,
                      title: 'Notification Preferences',
                      onTap: () {}),
                  _MenuItem(
                      icon: Icons.help_outline,
                      title: 'Help & Support',
                      onTap: () {}),
                  const SizedBox(height: 16),

                  TextButton.icon(
                    onPressed: () async {
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) {
                        context.go('/login');
                      }
                    },
                    icon: const Icon(Icons.logout, color: AppTheme.errorColor),
                    label: const Text('LOG OUT',
                        style: TextStyle(
                            color: AppTheme.errorColor,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 1)),
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
  const _MenuItem(
      {required this.icon, required this.title, required this.onTap});

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
              color: AppTheme.primaryContainer,
              borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: AppTheme.primary, size: 20),
        ),
        title: Text(title,
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
        trailing:
            const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
        onTap: onTap,
      ),
    );
  }
}
