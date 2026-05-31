import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api_client.dart';
import '../../../shared/theme.dart';
import '../models/survey_model.dart';

class AnswerPhaseScreen extends ConsumerStatefulWidget {
  final Study survey;
  final int phaseIndex;
  const AnswerPhaseScreen(
      {super.key, required this.survey, required this.phaseIndex});

  @override
  ConsumerState<AnswerPhaseScreen> createState() => _AnswerPhaseScreenState();
}

class _AnswerPhaseScreenState extends ConsumerState<AnswerPhaseScreen> {
  final Map<String, dynamic> _answers = {};
  bool _isSubmitting = false;

  bool get _isMultiPhase => widget.survey.phases.length > 1;
  bool get _isLastPhase => widget.phaseIndex == widget.survey.phases.length - 1;
  // Only phase 1 (index 0) requires creator approval in multi-phase surveys
  bool get _requiresApproval => _isMultiPhase && widget.phaseIndex == 0;

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    try {
      final dio = ref.read(dioProvider);
      final phase = widget.survey.phases[widget.phaseIndex];
      final phaseId = phase['phaseId']?.toString() ?? '';
      final questions = phase['questions'] as List? ?? [];

      final answers = questions.map((q) {
        final qId = q['questionId'] ?? '';
        final answer = _answers[qId];
        return {
          'questionId': qId,
          'value': answer is List ? answer : (answer?.toString() ?? ''),
        };
      }).toList();

      await dio.post('/api/responses', data: {
        'studyId': widget.survey.studyId,
        'phaseId': phaseId,
        'answers': answers,
      });

      // Notify creator
      try {
        await dio.post('/api/notifications', data: {
          'userId': widget.survey.creatorId,
          'title': _isMultiPhase
              ? 'Phase ${widget.phaseIndex + 1} Answered'
              : 'Survey Answered',
          'message': _isMultiPhase
              ? 'A participant answered Phase ${widget.phaseIndex + 1} of "${widget.survey.title}". Review their response.'
              : 'A participant submitted answers for "${widget.survey.title}".',
        });
      } catch (e) {
        debugPrint('Notification failed (non-fatal): $e');
      }

      if (!mounted) return;

      if (_requiresApproval) {
        // Phase 1 of multi-phase: wait for creator approval
        _showWaitingDialog();
      } else if (!_isLastPhase) {
        // Phases 2, 3, 4... go directly to next phase
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(
                'Phase ${widget.phaseIndex + 1} submitted! Moving to Phase ${widget.phaseIndex + 2}...'),
            backgroundColor: AppTheme.successColor));
        await Future.delayed(const Duration(milliseconds: 800));
        if (mounted) {
          context.pushReplacement('/surveys/answer', extra: {
            'survey': widget.survey,
            'phaseIndex': widget.phaseIndex + 1,
          });
        }
      } else {
        // Last phase done
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('All phases completed! Great job!'),
            backgroundColor: AppTheme.successColor));
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content:
                Text('Failed: ${e.toString().replaceAll('Exception: ', '')}'),
            backgroundColor: AppTheme.errorColor));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showWaitingDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.hourglass_top, size: 56, color: AppTheme.primary),
          const SizedBox(height: 16),
          const Text('Phase 1 Submitted!',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary)),
          const SizedBox(height: 8),
          Text(
              'The creator will review your answers. '
              'You will receive a notification when Phase 2 is approved.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 14, color: AppTheme.textSecondary, height: 1.5)),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.go('/home');
              },
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
              child: const Text('Back to Home',
                  style: TextStyle(color: Colors.white)),
            ),
          ),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final phase = widget.survey.phases[widget.phaseIndex];
    final questions = phase['questions'] as List? ?? [];
    final phaseTitle = phase['title']?.toString().trim().isEmpty == true
        ? 'Phase ${widget.phaseIndex + 1}'
        : phase['title'].toString();

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new,
                color: AppTheme.textPrimary, size: 20),
            onPressed: () => context.pop()),
        title: Text(phaseTitle,
            style: const TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(widget.survey.title,
                  style: const TextStyle(
                      fontSize: 14, color: AppTheme.textSecondary)),
              const SizedBox(height: 4),
              Text(
                  'Phase ${widget.phaseIndex + 1} of ${widget.survey.phases.length}',
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary)),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(100),
                child: LinearProgressIndicator(
                  value: (widget.phaseIndex + 1) / widget.survey.phases.length,
                  minHeight: 6,
                  backgroundColor: AppTheme.surfaceHigh,
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                ),
              ),
              if (_isMultiPhase) ...[
                const SizedBox(height: 12),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                      color: AppTheme.primaryContainer,
                      borderRadius: BorderRadius.circular(8)),
                  child: Row(children: [
                    const Icon(Icons.info_outline,
                        size: 14, color: AppTheme.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _requiresApproval
                            ? 'After submitting, the creator will review and unlock the next phase.'
                            : _isLastPhase
                                ? 'This is the final phase!'
                                : 'Your answer will unlock the next phase automatically.',
                        style: const TextStyle(
                            fontSize: 12, color: AppTheme.primary),
                      ),
                    ),
                  ]),
                ),
              ],
            ]),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: questions.length,
              itemBuilder: (context, index) {
                final q = questions[index];
                final qId = q['questionId'] ?? 'q_$index';
                final qText = q['text'] ?? 'Question ${index + 1}';
                final qType = q['questionType'] ?? 'TEXT';
                final isRequired = q['isRequired'] == true;
                final options = q['options'] as List? ?? [];

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16)),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                                color: AppTheme.primaryContainer,
                                borderRadius: BorderRadius.circular(6)),
                            child: Text('Q${index + 1}',
                                style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: AppTheme.primary)),
                          ),
                          if (isRequired) ...[
                            const SizedBox(width: 8),
                            const Text('*',
                                style: TextStyle(
                                    color: AppTheme.errorColor, fontSize: 16)),
                          ],
                        ]),
                        const SizedBox(height: 12),
                        Text(qText.toString(),
                            style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.textPrimary,
                                height: 1.4)),
                        const SizedBox(height: 16),
                        if (qType == 'TEXT')
                          TextField(
                            onChanged: (v) => _answers[qId] = v,
                            maxLines: 2,
                            decoration: const InputDecoration(
                                hintText: 'Type your answer...'),
                          ),
                        if (qType == 'SINGLE_CHOICE')
                          ...options.map((opt) {
                            final label = opt['label'] ?? opt.toString();
                            final isSelected = _answers[qId] == label;
                            return GestureDetector(
                              onTap: () =>
                                  setState(() => _answers[qId] = label),
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 14),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppTheme.primaryContainer
                                      : AppTheme.surfaceLow,
                                  borderRadius: BorderRadius.circular(12),
                                  border: isSelected
                                      ? Border.all(color: AppTheme.primary)
                                      : null,
                                ),
                                child: Row(children: [
                                  Icon(
                                      isSelected
                                          ? Icons.radio_button_checked
                                          : Icons.radio_button_unchecked,
                                      color: isSelected
                                          ? AppTheme.primary
                                          : AppTheme.textTertiary,
                                      size: 20),
                                  const SizedBox(width: 12),
                                  Text(label.toString(),
                                      style: TextStyle(
                                          color: isSelected
                                              ? AppTheme.primary
                                              : AppTheme.textPrimary,
                                          fontWeight: isSelected
                                              ? FontWeight.w600
                                              : FontWeight.w400)),
                                ]),
                              ),
                            );
                          }),
                        if (qType == 'MULTIPLE_CHOICE')
                          ...options.map((opt) {
                            final label = opt['label'] ?? opt.toString();
                            final selected =
                                (_answers[qId] as List<String>?) ?? [];
                            final isSelected = selected.contains(label);
                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  final list = List<String>.from(selected);
                                  isSelected
                                      ? list.remove(label)
                                      : list.add(label.toString());
                                  _answers[qId] = list;
                                });
                              },
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 14),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppTheme.primaryContainer
                                      : AppTheme.surfaceLow,
                                  borderRadius: BorderRadius.circular(12),
                                  border: isSelected
                                      ? Border.all(color: AppTheme.primary)
                                      : null,
                                ),
                                child: Row(children: [
                                  Icon(
                                      isSelected
                                          ? Icons.check_box
                                          : Icons.check_box_outline_blank,
                                      color: isSelected
                                          ? AppTheme.primary
                                          : AppTheme.textTertiary,
                                      size: 20),
                                  const SizedBox(width: 12),
                                  Text(label.toString()),
                                ]),
                              ),
                            );
                          }),
                        if (qType == 'RATING_SCALE')
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: List.generate(5, (i) {
                              final val = i + 1;
                              final isSelected = _answers[qId] == val;
                              return GestureDetector(
                                onTap: () =>
                                    setState(() => _answers[qId] = val),
                                child: Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? AppTheme.primary
                                        : AppTheme.surfaceLow,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                      child: Text('$val',
                                          style: TextStyle(
                                              fontWeight: FontWeight.w700,
                                              color: isSelected
                                                  ? Colors.white
                                                  : AppTheme.textSecondary))),
                                ),
                              );
                            }),
                          ),
                        if (qType == 'YES_NO')
                          Row(children: [
                            Expanded(
                                child: GestureDetector(
                              onTap: () =>
                                  setState(() => _answers[qId] = 'Yes'),
                              child: Container(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                decoration: BoxDecoration(
                                    color: _answers[qId] == 'Yes'
                                        ? AppTheme.primary
                                        : AppTheme.surfaceLow,
                                    borderRadius: BorderRadius.circular(12)),
                                child: Center(
                                    child: Text('Yes',
                                        style: TextStyle(
                                            fontWeight: FontWeight.w700,
                                            color: _answers[qId] == 'Yes'
                                                ? Colors.white
                                                : AppTheme.textPrimary))),
                              ),
                            )),
                            const SizedBox(width: 12),
                            Expanded(
                                child: GestureDetector(
                              onTap: () => setState(() => _answers[qId] = 'No'),
                              child: Container(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                decoration: BoxDecoration(
                                    color: _answers[qId] == 'No'
                                        ? AppTheme.errorColor
                                        : AppTheme.surfaceLow,
                                    borderRadius: BorderRadius.circular(12)),
                                child: Center(
                                    child: Text('No',
                                        style: TextStyle(
                                            fontWeight: FontWeight.w700,
                                            color: _answers[qId] == 'No'
                                                ? Colors.white
                                                : AppTheme.textPrimary))),
                              ),
                            )),
                          ]),
                      ]),
                );
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        color: Colors.white,
        padding: const EdgeInsets.all(20),
        child: ElevatedButton(
          onPressed: _isSubmitting ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            minimumSize: const Size(double.infinity, 54),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: _isSubmitting
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2))
              : Text(
                  _isLastPhase
                      ? 'Submit & Complete'
                      : 'Submit Phase ${widget.phaseIndex + 1}',
                  style: const TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                      fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
