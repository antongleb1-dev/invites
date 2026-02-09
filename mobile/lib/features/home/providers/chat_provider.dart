import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../core/providers/api_provider.dart';
import '../../../core/providers/tokens_provider.dart';
import '../data/models/chat_message.dart';

const _uuid = Uuid();

final agentModeProvider = StateProvider<AgentMode>((ref) => AgentMode.ai);

final chatProvider = StateNotifierProvider<ChatNotifier, List<ChatMessage>>((ref) {
  return ChatNotifier(ref);
});

class ChatNotifier extends StateNotifier<List<ChatMessage>> {
  final Ref _ref;
  
  ChatNotifier(this._ref) : super([]);

  /// Initialize chat with welcome message based on locale
  void initializeChat(String welcomeMessage, List<String> quickActions) {
    if (state.isNotEmpty) return; // Already initialized
    
    state = [
      ChatMessage(
        id: _uuid.v4(),
        text: welcomeMessage,
        type: MessageType.bot,
        quickActions: quickActions,
      ),
    ];
  }

  /// Send a user message and get AI response
  Future<void> sendMessage(String text, {required String language}) async {
    // Add user message
    final userMsg = ChatMessage(
      id: _uuid.v4(),
      text: text,
      type: MessageType.user,
    );
    state = [...state, userMsg];

    // Add loading message
    final loadingId = _uuid.v4();
    state = [
      ...state,
      ChatMessage(
        id: loadingId,
        text: '',
        type: MessageType.loading,
        isTyping: true,
      ),
    ];

    try {
      final api = _ref.read(apiServiceProvider);
      final mode = _ref.read(agentModeProvider);
      
      final response = await api.generateInvitation(
        prompt: text,
        language: language,
      );

      // Remove loading message
      state = state.where((m) => m.id != loadingId).toList();

      // Add bot response
      final botMsg = ChatMessage(
        id: _uuid.v4(),
        text: response['message'] ?? response['description'] ?? 'Invitation created!',
        type: MessageType.bot,
        invitationId: response['id']?.toString(),
        previewUrl: response['preview_url']?.toString(),
      );
      state = [...state, botMsg];

      // Update token balance
      _ref.read(tokenBalanceNotifierProvider.notifier).refresh();
    } catch (e) {
      // Remove loading message
      state = state.where((m) => m.id != loadingId).toList();

      // Add error message
      final errorMsg = ChatMessage(
        id: _uuid.v4(),
        text: _getErrorMessage(e),
        type: MessageType.bot,
      );
      state = [...state, errorMsg];
    }
  }

  /// Send a quick action (preset event type)
  Future<void> sendQuickAction(String action, {required String language}) async {
    await sendMessage(action, language: language);
  }

  /// Clear chat history
  void clearChat() {
    state = [];
  }

  String _getErrorMessage(dynamic error) {
    if (error.toString().contains('401')) {
      return 'Please login to generate invitations.';
    }
    if (error.toString().contains('402') || error.toString().contains('insufficient')) {
      return 'Not enough tokens. Please purchase more tokens to continue.';
    }
    return 'Something went wrong. Please try again.';
  }
}


