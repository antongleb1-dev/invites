import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../l10n/app_localizations.dart';
import '../../data/models/chat_message.dart';
import '../../providers/chat_provider.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/chat_input.dart';
import '../widgets/quick_action_chips.dart';
import '../widgets/agent_mode_selector.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _scrollController = ScrollController();
  bool _isGenerating = false;

  @override
  void initState() {
    super.initState();
    // Initialize chat with welcome message after build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeChat();
    });
  }

  void _initializeChat() {
    final l10n = AppLocalizations.of(context)!;
    final quickActions = [
      l10n.eventWedding,
      l10n.eventBirthday,
      l10n.eventCorporate,
      l10n.eventAnniversary,
      l10n.eventNewYear,
    ];

    ref.read(chatProvider.notifier).initializeChat(
          l10n.welcomeMessage,
          quickActions,
        );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _onSendMessage(String text, {List<XFile>? files}) async {
    if (_isGenerating) return;

    setState(() => _isGenerating = true);
    _scrollToBottom();

    final locale = Localizations.localeOf(context).languageCode;
    await ref.read(chatProvider.notifier).sendMessage(
      text,
      language: locale,
      files: files,
    );

    setState(() => _isGenerating = false);
    _scrollToBottom();
  }

  void _onQuickAction(String action) {
    // Remove the emoji prefix for the actual prompt
    final cleanAction = action.replaceAll(RegExp(r'^[\p{Emoji}\s]+', unicode: true), '').trim();
    _onSendMessage(cleanAction.isNotEmpty ? cleanAction : action);
  }

  void _startNewChat() {
    ref.read(chatProvider.notifier).clearChat();
    _initializeChat();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final messages = ref.watch(chatProvider);
    final generatedHtml = ref.watch(generatedHtmlProvider);
    final savedSlug = ref.watch(savedSlugProvider);
    final saveStatus = ref.watch(saveStatusProvider);

    // Scroll to bottom when messages change
    if (messages.isNotEmpty) {
      _scrollToBottom();
    }

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: SafeArea(
          bottom: false,
          child: Column(
            children: [
              // Header
              _buildHeader(l10n, generatedHtml != null),

              // Agent Mode Selector (AI Provider)
              const AgentModeSelector(),

              // Chat Messages
              Expanded(
                child: messages.isEmpty
                    ? _buildEmptyState(l10n)
                    : _buildChatList(messages, l10n),
              ),

              // Preview banner when invitation is generated
              if (generatedHtml != null) _buildPreviewBanner(l10n, savedSlug),

              // Chat Input
              ChatInput(
                onSend: _onSendMessage,
                hintText: _isGenerating
                    ? l10n.generatingInvitation
                    : l10n.promptPlaceholder,
                enabled: !_isGenerating,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(AppLocalizations l10n, bool hasInvitation) {
    final saveStatus = ref.watch(saveStatusProvider);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.auto_awesome, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.aiDesigner,
                  style: AppTypography.headlineSmall,
                ),
                // Show save status or subtitle
                if (saveStatus == SaveStatus.saving)
                  Row(
                    children: [
                      SizedBox(
                        width: 10, height: 10,
                        child: CircularProgressIndicator(
                          strokeWidth: 1.5,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        l10n.saving,
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  )
                else if (saveStatus == SaveStatus.saved)
                  Row(
                    children: [
                      Icon(Icons.check_circle, size: 12, color: Colors.green),
                      const SizedBox(width: 4),
                      Text(
                        l10n.saved,
                        style: AppTypography.bodySmall.copyWith(color: Colors.green),
                      ),
                    ],
                  )
                else
                  Text(
                    l10n.aiDesignerSubtitle,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textMuted,
                    ),
                  ),
              ],
            ),
          ),
          // New chat button
          IconButton(
            onPressed: _startNewChat,
            icon: const Icon(Icons.add_circle_outline, color: AppColors.primary),
            tooltip: l10n.newChat,
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildPreviewBanner(AppLocalizations l10n, String? slug) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/preview'),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                const Icon(Icons.visibility, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.previewInvitation,
                        style: AppTypography.labelMedium.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (slug != null)
                        Text(
                          'invites.kz/$slug',
                          style: AppTypography.bodySmall.copyWith(
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 16),
              ],
            ),
          ),
        ),
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildEmptyState(AppLocalizations l10n) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.auto_awesome, color: Colors.white, size: 36),
            ),
            const SizedBox(height: 20),
            Text(
              l10n.createInvitation,
              style: AppTypography.headlineMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              l10n.tagline,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatList(List<ChatMessage> messages, AppLocalizations l10n) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(vertical: 12),
      itemCount: messages.length + _getQuickActionsCount(messages),
      itemBuilder: (context, index) {
        // Check if we should show quick actions after the first bot message
        final firstBotWithActions = messages.indexWhere(
          (m) => m.type == MessageType.bot && m.quickActions != null,
        );

        if (firstBotWithActions >= 0 &&
            index == firstBotWithActions + 1 &&
            messages.length == 1) {
          // Show quick actions
          return QuickActionChips(
            actions: messages[firstBotWithActions].quickActions!,
            onTap: _onQuickAction,
          );
        }

        // Adjust index if quick actions were shown
        final msgIndex = (firstBotWithActions >= 0 &&
                messages.length == 1 &&
                index > firstBotWithActions)
            ? index - 1
            : index;

        if (msgIndex >= messages.length) return const SizedBox.shrink();

        final message = messages[msgIndex];
        return ChatBubble(
          message: message,
          onPreviewTap: message.html != null
              ? () => context.go('/preview')
              : null,
        ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1, end: 0);
      },
    );
  }

  int _getQuickActionsCount(List<ChatMessage> messages) {
    if (messages.length == 1 &&
        messages.first.type == MessageType.bot &&
        messages.first.quickActions != null) {
      return 1;
    }
    return 0;
  }
}
