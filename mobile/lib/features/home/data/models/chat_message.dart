enum MessageType { bot, user, system, loading }

enum AgentMode { ai, classic }

class ChatMessage {
  final String id;
  final String text;
  final MessageType type;
  final DateTime timestamp;
  final String? invitationId;
  final String? previewUrl;
  final List<String>? quickActions;
  final bool isTyping;

  ChatMessage({
    required this.id,
    required this.text,
    required this.type,
    DateTime? timestamp,
    this.invitationId,
    this.previewUrl,
    this.quickActions,
    this.isTyping = false,
  }) : timestamp = timestamp ?? DateTime.now();

  ChatMessage copyWith({
    String? id,
    String? text,
    MessageType? type,
    DateTime? timestamp,
    String? invitationId,
    String? previewUrl,
    List<String>? quickActions,
    bool? isTyping,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      text: text ?? this.text,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      invitationId: invitationId ?? this.invitationId,
      previewUrl: previewUrl ?? this.previewUrl,
      quickActions: quickActions ?? this.quickActions,
      isTyping: isTyping ?? this.isTyping,
    );
  }
}


