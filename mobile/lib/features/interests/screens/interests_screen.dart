import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../../interests/providers/interest_provider.dart';

class InterestsScreen extends ConsumerStatefulWidget {
  const InterestsScreen({super.key});
  @override
  ConsumerState<InterestsScreen> createState() => _InterestsScreenState();
}

class _InterestsScreenState extends ConsumerState<InterestsScreen> {
  final Set<String> _selectedIds = {};
  String _searchQuery = '';
  bool _isInitialized = false;
  bool _isSaving = false;

  Future<void> _saveInterests() async {
    setState(() => _isSaving = true);
    try {
      // Save the updated list of IDs to the backend
      await ref
          .read(userInterestsProvider.notifier)
          .saveFromOnboarding(_selectedIds.toList());

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Interests updated successfully!'),
            backgroundColor: AppTheme.primary,
          ),
        );
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to save interests. Please try again.'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Fetch all available interests from the backend
    final allInterestsAsync = ref.watch(allInterestsProvider);

    // Fetch the user's currently selected interests
    final userInterestsAsync = ref.watch(userInterestsProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        GestureDetector(
                          onTap: () =>
                              context.go('/profile'), // or context.pop()
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceLow,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.arrow_back_ios_new,
                                size: 16, color: AppTheme.textPrimary),
                          ),
                        ),
                        const Text('LucidCurator',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.primary)),
                        Container(
                          width: 40,
                          height: 40,
                          decoration: const BoxDecoration(
                              color: AppTheme.surfaceHigh,
                              shape: BoxShape.circle),
                          child: const Icon(Icons.person,
                              size: 20, color: AppTheme.textTertiary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Titles
                    const Text('Tailor your ',
                        style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary)),
                    const Text('Intellect',
                        style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.primary)),
                    const SizedBox(height: 8),
                    const Text(
                        'Select at least 3 categories to curate your editorial experience.',
                        style: TextStyle(
                            color: AppTheme.textSecondary, fontSize: 14)),
                    const SizedBox(height: 20),

                    // Search Bar
                    TextField(
                      onChanged: (val) => setState(() => _searchQuery = val),
                      decoration: InputDecoration(
                        hintText: 'Search categories...',
                        prefixIcon: const Icon(Icons.search,
                            color: AppTheme.textSecondary),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none),
                        filled: true,
                        fillColor: AppTheme.surfaceLowest,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Dynamic Interests Section
                    allInterestsAsync.when(
                      loading: () => const Center(
                          child: CircularProgressIndicator(
                              color: AppTheme.primary)),
                      error: (error, _) => const Center(
                          child: Text('Failed to load interests',
                              style: TextStyle(color: AppTheme.errorColor))),
                      data: (allInterests) {
                        return userInterestsAsync.when(
                          loading: () => const Center(
                              child: CircularProgressIndicator(
                                  color: AppTheme.primary)),
                          error: (error, _) => const Center(
                              child: Text('Failed to load your selections',
                                  style:
                                      TextStyle(color: AppTheme.errorColor))),
                          data: (userInterests) {
                            // Initialize selected IDs only once when data first loads
                            if (!_isInitialized) {
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                setState(() {
                                  for (var ui in userInterests) {
                                    _selectedIds.add(ui.interestId);
                                  }
                                  _isInitialized = true;
                                });
                              });
                            }

                            // Filter the list based on the search query
                            final filteredInterests = allInterests.where((i) {
                              return i.name
                                  .toLowerCase()
                                  .contains(_searchQuery.toLowerCase());
                            }).toList();

                            if (filteredInterests.isEmpty) {
                              return const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(20.0),
                                  child: Text('No interests found.',
                                      style: TextStyle(
                                          color: AppTheme.textSecondary)),
                                ),
                              );
                            }

                            return Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: filteredInterests.map((item) {
                                final id = item.interestId;
                                final name = item.name;
                                final isSelected = _selectedIds.contains(id);

                                return GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      if (isSelected) {
                                        _selectedIds.remove(id);
                                      } else {
                                        _selectedIds.add(id);
                                      }
                                    });
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 12),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? AppTheme.primary
                                          : AppTheme.surfaceLowest,
                                      borderRadius: BorderRadius.circular(14),
                                      border: Border.all(
                                          color: isSelected
                                              ? AppTheme.primary
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
                            );
                          },
                        );
                      },
                    ),
                    const SizedBox(height: 28),
                  ],
                ),
              ),
            ),

            // Bottom Save Button
            Padding(
              padding: const EdgeInsets.all(24),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  minimumSize: const Size(double.infinity, 54),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                onPressed: (_selectedIds.length >= 3 && !_isSaving)
                    ? _saveInterests
                    : null,
                child: _isSaving
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : Text(
                        'Save & Continue (${_selectedIds.length} selected)  →',
                        style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.white),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
