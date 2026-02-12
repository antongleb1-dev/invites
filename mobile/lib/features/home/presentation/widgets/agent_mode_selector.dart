import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../data/models/chat_message.dart';
import '../../providers/chat_provider.dart';

class AgentModeSelector extends ConsumerWidget {
  const AgentModeSelector({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentProvider = ref.watch(aiProviderProvider);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ModeTab(
              label: 'Opus 4.5',
              isSelected: currentProvider == AIProvider.claude,
              onTap: () => ref.read(aiProviderProvider.notifier).state = AIProvider.claude,
            ),
          ),
          Expanded(
            child: _ModeTab(
              label: 'GPT-4.1',
              isSelected: currentProvider == AIProvider.openai,
              onTap: () => ref.read(aiProviderProvider.notifier).state = AIProvider.openai,
            ),
          ),
        ],
      ),
    );
  }
}

class _ModeTab extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ModeTab({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Center(
          child: Text(
            label,
            style: AppTypography.labelMedium.copyWith(
              color: isSelected ? Colors.white : AppColors.textSecondary,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}
