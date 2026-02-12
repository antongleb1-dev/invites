import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';

import '../../../core/providers/api_provider.dart';
import '../data/models/chat_message.dart';

const _uuid = Uuid();

/// Current AI provider selection
final aiProviderProvider = StateProvider<AIProvider>((ref) => AIProvider.claude);

/// Current generated HTML (last generation result)
final generatedHtmlProvider = StateProvider<String?>((ref) => null);

/// Saved invitation ID (after save)
final savedInvitationIdProvider = StateProvider<int?>((ref) => null);

/// Saved invitation slug
final savedSlugProvider = StateProvider<String?>((ref) => null);

/// Save status for UI display
enum SaveStatus { idle, saving, saved, error }
final saveStatusProvider = StateProvider<SaveStatus>((ref) => SaveStatus.idle);

/// Chat messages provider
final chatProvider = StateNotifierProvider<ChatNotifier, List<ChatMessage>>((ref) {
  return ChatNotifier(ref);
});

class ChatNotifier extends StateNotifier<List<ChatMessage>> {
  final Ref _ref;

  ChatNotifier(this._ref) : super([]);

  /// Get conversation history in API format (only user/assistant messages)
  List<Map<String, String>> get _conversationHistory {
    return state
        .where((m) => m.type == MessageType.user || m.type == MessageType.bot)
        .where((m) => m.text.isNotEmpty)
        .map((m) => m.toApiMessage())
        .toList();
  }

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

  /// Load an existing invitation for editing (restores chat history + HTML)
  Future<void> loadInvitationForEdit(int invitationId) async {
    try {
      final api = _ref.read(apiServiceProvider);
      final data = await api.getInvitationForEdit(invitationId);

      if (data.isEmpty) return;

      // Set invitation state
      _ref.read(savedInvitationIdProvider.notifier).state = invitationId;
      _ref.read(savedSlugProvider.notifier).state = data['slug'] as String?;

      final html = data['html'] as String?;
      if (html != null && html.isNotEmpty) {
        _ref.read(generatedHtmlProvider.notifier).state = html;
      }

      // Restore chat history
      final chatHistory = data['chatHistory'];
      if (chatHistory is List && chatHistory.isNotEmpty) {
        final messages = <ChatMessage>[];
        for (final msg in chatHistory) {
          if (msg is Map) {
            final role = msg['role'] as String? ?? '';
            final content = msg['content'] as String? ?? '';
            if (content.isEmpty) continue;

            messages.add(ChatMessage(
              id: _uuid.v4(),
              text: content,
              type: role == 'user' ? MessageType.user : MessageType.bot,
              html: (role == 'assistant' && msg == chatHistory.last && html != null)
                  ? html
                  : null,
              slug: (role == 'assistant' && msg == chatHistory.last)
                  ? data['slug'] as String?
                  : null,
              invitationId: (role == 'assistant' && msg == chatHistory.last)
                  ? invitationId.toString()
                  : null,
            ));
          }
        }
        if (messages.isNotEmpty) {
          state = messages;
          return;
        }
      }

      // If no chat history, show a system message about loaded invitation
      final title = data['title'] as String? ?? _t('invitation');
      state = [
        ChatMessage(
          id: _uuid.v4(),
          text: _t('loadedForEditing', {'title': title}),
          type: MessageType.bot,
          html: html,
          slug: data['slug'] as String?,
          invitationId: invitationId.toString(),
        ),
      ];
    } catch (e) {
      state = [
        ChatMessage(
          id: _uuid.v4(),
          text: _t('couldNotLoadInvitation'),
          type: MessageType.bot,
        ),
      ];
    }
  }

  /// Current language code for localized messages
  String _currentLanguage = 'en';

  /// Send a user message and get AI response
  Future<void> sendMessage(String text, {required String language, List<XFile>? files}) async {
    _currentLanguage = language;

    // Upload files if any
    List<ChatAttachment>? attachments;
    if (files != null && files.isNotEmpty) {
      attachments = [];
      final api = _ref.read(apiServiceProvider);
      for (final file in files) {
        try {
          final result = await api.uploadFile(file.path, file.name);
          attachments.add(ChatAttachment(
            name: file.name,
            url: result['url'] as String? ?? '',
            type: result['type'] as String? ?? 'file',
            localPath: file.path,
          ));
        } catch (e) {
          // Skip failed uploads
        }
      }
    }

    // Add user message
    final userMsg = ChatMessage(
      id: _uuid.v4(),
      text: text,
      type: MessageType.user,
      attachments: attachments,
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
      final provider = _ref.read(aiProviderProvider);
      final currentHtml = _ref.read(generatedHtmlProvider);

      // Build conversation for API with language instruction
      final messages = _conversationHistory;

      // Prepend language instruction so AI responds in the correct language
      final langName = _getLanguageName(language);
      final messagesWithLang = [
        {'role': 'user', 'content': 'IMPORTANT: Always respond in $langName language. All your messages, explanations, and generated content must be in $langName.'},
        {'role': 'assistant', 'content': 'Understood! I will respond in $langName.'},
        ...messages,
      ];

      final response = await api.aiChat(
        provider: provider == AIProvider.claude ? 'claude' : 'openai',
        messages: messagesWithLang,
        currentHtml: currentHtml,
      );

      // Remove loading message
      state = state.where((m) => m.id != loadingId).toList();

      // Extract response data
      final responseMessage = response['message'] as String? ?? _t('invitationCreated');
      final responseHtml = response['html'] as String?;

      // Update generated HTML if AI returned HTML
      if (responseHtml != null && responseHtml.isNotEmpty) {
        _ref.read(generatedHtmlProvider.notifier).state = responseHtml;

        // Auto-save the invitation
        await _autoSaveInvitation(responseHtml, text);
      }

      // Add bot response
      final savedSlug = _ref.read(savedSlugProvider);
      final savedId = _ref.read(savedInvitationIdProvider);

      final botMsg = ChatMessage(
        id: _uuid.v4(),
        text: responseMessage,
        type: MessageType.bot,
        html: responseHtml,
        invitationId: savedId?.toString(),
        slug: savedSlug,
      );
      state = [...state, botMsg];

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

  /// Auto-save the generated invitation
  Future<void> _autoSaveInvitation(String html, String userPrompt) async {
    _ref.read(saveStatusProvider.notifier).state = SaveStatus.saving;
    try {
      final api = _ref.read(apiServiceProvider);
      final existingId = _ref.read(savedInvitationIdProvider);

      if (existingId != null) {
        // Update existing invitation
        final result = await api.updateInvitationHtml(
          id: existingId,
          html: html,
          chatHistory: _conversationHistory,
        );
        if (result['slug'] != null) {
          _ref.read(savedSlugProvider.notifier).state = result['slug'] as String;
        }
      } else {
        // Save as new invitation
        final slug = _generateSlug(userPrompt);
        final title = _generateTitle(userPrompt);

        final result = await api.saveInvitationHtml(
          html: html,
          slug: slug,
          title: title,
          chatHistory: _conversationHistory,
        );

        // Store saved invitation info
        if (result['id'] != null) {
          _ref.read(savedInvitationIdProvider.notifier).state =
              result['id'] is int ? result['id'] as int : int.tryParse(result['id'].toString());
        }
        if (result['slug'] != null) {
          _ref.read(savedSlugProvider.notifier).state = result['slug'] as String;
        }
      }
      _ref.read(saveStatusProvider.notifier).state = SaveStatus.saved;

      // Reset to idle after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        if (_ref.read(saveStatusProvider) == SaveStatus.saved) {
          _ref.read(saveStatusProvider.notifier).state = SaveStatus.idle;
        }
      });
    } catch (e) {
      _ref.read(saveStatusProvider.notifier).state = SaveStatus.error;
    }
  }

  /// Manual save of title and slug
  Future<bool> saveInvitationSettings({String? title, String? slug}) async {
    final existingId = _ref.read(savedInvitationIdProvider);
    if (existingId == null) return false;

    _ref.read(saveStatusProvider.notifier).state = SaveStatus.saving;
    try {
      final api = _ref.read(apiServiceProvider);
      final success = await api.updateWedding(
        id: existingId,
        title: title,
        slug: slug,
      );
      if (success && slug != null) {
        _ref.read(savedSlugProvider.notifier).state = slug;
      }
      _ref.read(saveStatusProvider.notifier).state = SaveStatus.saved;
      Future.delayed(const Duration(seconds: 3), () {
        if (_ref.read(saveStatusProvider) == SaveStatus.saved) {
          _ref.read(saveStatusProvider.notifier).state = SaveStatus.idle;
        }
      });
      return success;
    } catch (e) {
      _ref.read(saveStatusProvider.notifier).state = SaveStatus.error;
      return false;
    }
  }

  /// Generate URL slug from prompt
  String _generateSlug(String prompt) {
    final timestamp = DateTime.now().millisecondsSinceEpoch.toString().substring(7);
    final words = prompt
        .toLowerCase()
        .replaceAll(RegExp(r'[^\w\s]'), '')
        .split(RegExp(r'\s+'))
        .where((w) => w.length > 2)
        .take(3)
        .join('-');
    return words.isNotEmpty ? '$words-$timestamp' : 'invite-$timestamp';
  }

  /// Generate title from prompt
  String _generateTitle(String prompt) {
    if (prompt.length <= 50) return prompt;
    return '${prompt.substring(0, 47)}...';
  }

  /// Send a quick action (preset event type)
  Future<void> sendQuickAction(String action, {required String language}) async {
    await sendMessage(action, language: language);
  }

  /// Clear chat history and start new
  void clearChat() {
    state = [];
    _ref.read(generatedHtmlProvider.notifier).state = null;
    _ref.read(savedInvitationIdProvider.notifier).state = null;
    _ref.read(savedSlugProvider.notifier).state = null;
  }

  String _getLanguageName(String code) {
    switch (code) {
      case 'ru': return 'Russian';
      case 'es': return 'Spanish';
      case 'pt': return 'Portuguese';
      case 'hi': return 'Hindi';
      case 'ar': return 'Arabic';
      default: return 'English';
    }
  }

  /// Localized strings for provider (no BuildContext available)
  String _t(String key, [Map<String, String>? params]) {
    final lang = _currentLanguage;
    final translations = _translations[key];
    if (translations == null) return key;
    var text = translations[lang] ?? translations['en'] ?? key;
    if (params != null) {
      params.forEach((k, v) {
        text = text.replaceAll('{$k}', v);
      });
    }
    return text;
  }

  static const Map<String, Map<String, String>> _translations = {
    'invitation': {
      'en': 'Invitation',
      'ru': 'Приглашение',
      'es': 'Invitación',
      'pt': 'Convite',
      'hi': 'निमंत्रण',
      'ar': 'دعوة',
    },
    'invitationCreated': {
      'en': 'Invitation created!',
      'ru': 'Приглашение создано!',
      'es': '¡Invitación creada!',
      'pt': 'Convite criado!',
      'hi': 'निमंत्रण बन गया!',
      'ar': 'تم إنشاء الدعوة!',
    },
    'loadedForEditing': {
      'en': 'Loaded "{title}" for editing. You can continue making changes — just describe what you want to update.',
      'ru': 'Загружено «{title}» для редактирования. Можете продолжить — просто опишите, что хотите изменить.',
      'es': 'Se cargó «{title}» para editar. Puedes seguir haciendo cambios — solo describe lo que quieres modificar.',
      'pt': '«{title}» carregado para edição. Você pode continuar fazendo alterações — basta descrever o que deseja modificar.',
      'hi': '«{title}» एडिटिंग के लिए लोड हो गया। बदलाव जारी रख सकते हैं — बस बताएँ क्या बदलना है।',
      'ar': 'تم تحميل «{title}» للتعديل. يمكنك متابعة التغييرات — فقط صِف ما تريد تعديله.',
    },
    'couldNotLoadInvitation': {
      'en': 'Could not load invitation. Please try again.',
      'ru': 'Не удалось загрузить приглашение. Попробуйте ещё раз.',
      'es': 'No se pudo cargar la invitación. Inténtalo de nuevo.',
      'pt': 'Não foi possível carregar o convite. Tente novamente.',
      'hi': 'निमंत्रण लोड नहीं हो सका। फिर से कोशिश करें।',
      'ar': 'لم يتم تحميل الدعوة. حاول مرة أخرى.',
    },
  };

  String _getErrorMessage(dynamic error) {
    final errorStr = error.toString();
    final lang = _currentLanguage;

    if (errorStr.contains('401') || errorStr.contains('UNAUTHORIZED')) {
      return _errorMessages['auth']?[lang] ?? _errorMessages['auth']?['en'] ?? '';
    }
    if (errorStr.contains('402') || errorStr.contains('insufficient') || errorStr.contains('limit_reached')) {
      return _errorMessages['editLimit']?[lang] ?? _errorMessages['editLimit']?['en'] ?? '';
    }
    if (errorStr.contains('403') || errorStr.contains('FORBIDDEN')) {
      return _errorMessages['forbidden']?[lang] ?? _errorMessages['forbidden']?['en'] ?? '';
    }
    if (errorStr.contains('timeout') || errorStr.contains('Timeout')) {
      return _errorMessages['timeout']?[lang] ?? _errorMessages['timeout']?['en'] ?? '';
    }
    return _errorMessages['general']?[lang] ?? _errorMessages['general']?['en'] ?? '';
  }

  static const Map<String, Map<String, String>> _errorMessages = {
    'auth': {
      'en': 'Please login to generate invitations.',
      'ru': 'Пожалуйста, войдите для создания приглашений.',
      'es': 'Por favor, inicia sesión para generar invitaciones.',
      'pt': 'Por favor, faça login para gerar convites.',
      'hi': 'कृपया निमंत्रण बनाने के लिए लॉगिन करें।',
      'ar': 'يرجى تسجيل الدخول لإنشاء الدعوات.',
    },
    'editLimit': {
      'en': 'You have reached your edit limit. Please purchase a package to continue.',
      'ru': 'Вы исчерпали лимит правок. Пожалуйста, купите пакет для продолжения.',
      'es': 'Has alcanzado tu límite de ediciones. Compra un paquete para continuar.',
      'pt': 'Você atingiu o limite de edições. Compre um pacote para continuar.',
      'hi': 'आपकी एडिट सीमा पूरी हो गई। जारी रखने के लिए पैकेज खरीदें।',
      'ar': 'لقد وصلت إلى حد التعديلات. اشترِ حزمة للمتابعة.',
    },
    'forbidden': {
      'en': 'Access denied. Please check your account.',
      'ru': 'Доступ запрещён. Проверьте ваш аккаунт.',
      'es': 'Acceso denegado. Verifica tu cuenta.',
      'pt': 'Acesso negado. Verifique sua conta.',
      'hi': 'एक्सेस अस्वीकृत। कृपया अपना अकाउंट जाँचें।',
      'ar': 'تم رفض الوصول. يرجى التحقق من حسابك.',
    },
    'timeout': {
      'en': 'Request timed out. AI generation can take up to 2 minutes — please try again.',
      'ru': 'Время ожидания истекло. Генерация может занять до 2 минут — попробуйте снова.',
      'es': 'Tiempo de espera agotado. La generación IA puede tardar hasta 2 minutos — inténtalo de nuevo.',
      'pt': 'Tempo esgotado. A geração IA pode levar até 2 minutos — tente novamente.',
      'hi': 'टाइमआउट। AI जेनरेशन में 2 मिनट तक लग सकते हैं — फिर से कोशिश करें।',
      'ar': 'انتهت مهلة الطلب. قد يستغرق الإنشاء حتى دقيقتين — حاول مرة أخرى.',
    },
    'general': {
      'en': 'Something went wrong. Please try again.',
      'ru': 'Что-то пошло не так. Попробуйте ещё раз.',
      'es': 'Algo salió mal. Inténtalo de nuevo.',
      'pt': 'Algo deu errado. Tente novamente.',
      'hi': 'कुछ गलत हो गया। फिर से कोशिश करें।',
      'ar': 'حدث خطأ ما. حاول مرة أخرى.',
    },
  };
}
