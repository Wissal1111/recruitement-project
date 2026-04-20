import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router.dart';
import 'shared/theme.dart';

void main() {
  runApp(const ProviderScope(child: LucidCuratorApp()));
}

class LucidCuratorApp extends ConsumerWidget {
  const LucidCuratorApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'LucidCurator',
      theme: AppTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
