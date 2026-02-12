enum MessageType { bot, user, system, loading }

/// AI provider used for generation
enum AIProvider { openai, claude }

/// File attachment in a chat message
class ChatAttachment {
  final String name;
  final String url;
  final String type; // 'image', 'video', 'audio', 'file'
  final String? localPath;

  const ChatAttachment({
    required this.name,
    required this.url,
    required this.type,
    this.localPath,
  });

  bool get isImage => type.startsWith('image');
  bool get isVideo => type.startsWith('video');
  bool get isAudio => type.startsWith('audio');
}

class ChatMessage {
  final String id;
  final String text;
  final MessageType type;
  final DateTime timestamp;
  final String? invitationId;
  final String? slug;
  final String? html;
  final String? previewUrl;
  final List<String>? quickActions;
  final List<ChatAttachment>? attachments;
  final bool isTyping;

  ChatMessage({
    required this.id,
    required this.text,
    required this.type,
    DateTime? timestamp,
    this.invitationId,
    this.slug,
    this.html,
    this.previewUrl,
    this.quickActions,
    this.attachments,
    this.isTyping = false,
  }) : timestamp = timestamp ?? DateTime.now();

  ChatMessage copyWith({
    String? id,
    String? text,
    MessageType? type,
    DateTime? timestamp,
    String? invitationId,
    String? slug,
    String? html,
    String? previewUrl,
    List<String>? quickActions,
    List<ChatAttachment>? attachments,
    bool? isTyping,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      text: text ?? this.text,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      invitationId: invitationId ?? this.invitationId,
      slug: slug ?? this.slug,
      html: html ?? this.html,
      previewUrl: previewUrl ?? this.previewUrl,
      quickActions: quickActions ?? this.quickActions,
      attachments: attachments ?? this.attachments,
      isTyping: isTyping ?? this.isTyping,
    );
  }

  /// Convert to API format for sending to backend
  Map<String, String> toApiMessage() {
    String content = text;

    // Append attachment URLs to message content (like the web version)
    if (attachments != null && attachments!.isNotEmpty) {
      final fileList = attachments!.map((a) => a.name).join(', ');
      final urlList = attachments!.map((a) {
        if (a.isImage) return '<img src="${a.url}" />';
        if (a.isAudio) return '<audio src="${a.url}"></audio>';
        if (a.isVideo) return '<video src="${a.url}"></video>';
        return '<a href="${a.url}">${a.name}</a>';
      }).join('\n');
      content += '\n\n📎 Uploaded files: $fileList\n\n[IMPORTANT: Use these uploaded files in the invitation design]\n$urlList';
    }

    return {
      'role': type == MessageType.user ? 'user' : 'assistant',
      'content': content,
    };
  }

  /// Get invitation URL
  String? get invitationUrl {
    if (slug != null) return 'https://invites.kz/$slug';
    return previewUrl;
  }
}
