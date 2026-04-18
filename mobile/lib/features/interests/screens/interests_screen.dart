import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';

class InterestsScreen extends StatefulWidget {
  const InterestsScreen({super.key});
  @override
  State<InterestsScreen> createState() => _InterestsScreenState();
}

class _InterestsScreenState extends State<InterestsScreen> {
  final Set<String> _selected = {'Cybersecurity'};

  final _categories = {
    'Technology': [
      {'name': 'Artificial Intelligence', 'sub': 'Deep Learning & LLMs'},
      {'name': 'Cybersecurity', 'sub': 'Privacy & Protection'},
      {'name': 'Software Engineering', 'sub': 'Frameworks & Architecture'},
    ],
    'Lifestyle': [
      {'name': 'Mindfulness', 'sub': ''},
      {'name': 'Gastronomy', 'sub': ''},
      {'name': 'Travel', 'sub': ''},
      {'name': 'Wellness', 'sub': ''},
    ],
    'Science': [
      {'name': 'Astrophysics', 'sub': 'The Cosmos Unveiled'},
      {'name': 'BioTech', 'sub': ''},
    ],
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Curator',
                              style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.primaryColor)),
                          CircleAvatar(
                              radius: 18,
                              backgroundColor: AppTheme.primaryLight,
                              child: Icon(Icons.person,
                                  size: 18, color: AppTheme.primaryColor)),
                        ]),
                    const SizedBox(height: 24),
                    const Text('Tailor your ',
                        style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary)),
                    const Text('Intellect',
                        style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.primaryColor)),
                    const SizedBox(height: 8),
                    const Text(
                        'Select at least 3 categories to curate your editorial experience.',
                        style: TextStyle(
                            color: AppTheme.textSecondary, fontSize: 14)),
                    const SizedBox(height: 20),
                    TextField(
                      decoration: InputDecoration(
                        hintText: 'Search categories...',
                        prefixIcon: const Icon(Icons.search,
                            color: AppTheme.textSecondary),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none),
                        filled: true,
                        fillColor: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 28),
                    ..._categories.entries.map((entry) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(entry.key,
                              style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textPrimary)),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: entry.value.map((item) {
                              final name = item['name']!;
                              final isSelected = _selected.contains(name);
                              return GestureDetector(
                                onTap: () => setState(() => isSelected
                                    ? _selected.remove(name)
                                    : _selected.add(name)),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? AppTheme.primaryColor
                                        : Colors.white,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                        color: isSelected
                                            ? AppTheme.primaryColor
                                            : const Color(0xFFE5E7EB)),
                                  ),
                                  child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(name,
                                            style: TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 13,
                                              color: isSelected
                                                  ? Colors.white
                                                  : AppTheme.textPrimary,
                                            )),
                                        if (isSelected) ...[
                                          const SizedBox(width: 6),
                                          const Icon(Icons.check,
                                              size: 14, color: Colors.white),
                                        ] else ...[
                                          const SizedBox(width: 6),
                                          const Icon(Icons.add,
                                              size: 14,
                                              color: AppTheme.textSecondary),
                                        ],
                                      ]),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 28),
                        ],
                      );
                    }),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: ElevatedButton(
                onPressed:
                    _selected.length >= 3 ? () => context.go('/home') : null,
                child:
                    Text('Save & Continue (${_selected.length} selected)  →'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
