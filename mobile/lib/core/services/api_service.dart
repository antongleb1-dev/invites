import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// API Service for invites.kz tRPC backend
class ApiService {
  late final Dio _dio;

  static const String baseUrl = 'https://invites.kz';
  static const String trpcPath = '/api/trpc';

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: '$baseUrl$trpcPath',
        connectTimeout: const Duration(seconds: 60),
        receiveTimeout: const Duration(seconds: 120),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Get fresh Firebase ID token
          final user = FirebaseAuth.instance.currentUser;
          if (user != null) {
            final token = await user.getIdToken();
            if (token != null) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          return handler.next(error);
        },
      ),
    );
  }

  // ─── tRPC helpers ───

  /// tRPC Query: GET /api/trpc/{procedure}?input={json}
  Future<dynamic> _trpcQuery(String procedure, {Map<String, dynamic>? input}) async {
    String url = '/$procedure';
    if (input != null) {
      final encoded = Uri.encodeComponent('{"json":${_jsonEncode(input)}}');
      url += '?input=$encoded';
    }
    final response = await _dio.get(url);
    return _extractResult(response.data);
  }

  /// tRPC Mutation: POST /api/trpc/{procedure} with body
  Future<dynamic> _trpcMutation(String procedure, {Map<String, dynamic>? input}) async {
    final body = input != null ? {'json': input} : {'json': {}};
    final response = await _dio.post('/$procedure', data: body);
    return _extractResult(response.data);
  }

  dynamic _extractResult(dynamic data) {
    if (data is Map) {
      // Standard tRPC response: {result: {data: {json: ...}}}
      final result = data['result'];
      if (result is Map) {
        final resultData = result['data'];
        if (resultData is Map && resultData.containsKey('json')) {
          return resultData['json'];
        }
        return resultData;
      }
      return result;
    }
    return data;
  }

  String _jsonEncode(dynamic value) {
    if (value == null) return 'null';
    if (value is String) return '"${value.replaceAll('"', '\\"')}"';
    if (value is num || value is bool) return value.toString();
    if (value is List) {
      return '[${value.map(_jsonEncode).join(',')}]';
    }
    if (value is Map) {
      final entries = value.entries.map((e) => '"${e.key}":${_jsonEncode(e.value)}');
      return '{${entries.join(',')}}';
    }
    return value.toString();
  }

  // ─── Auth ───

  /// Get current user from backend
  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final result = await _trpcQuery('auth.me');
      return result is Map<String, dynamic> ? result : null;
    } catch (e) {
      return null;
    }
  }

  /// Get user profile
  Future<Map<String, dynamic>?> getUserProfile() async {
    try {
      final result = await _trpcQuery('user.profile');
      return result is Map<String, dynamic> ? result : null;
    } catch (e) {
      return null;
    }
  }

  // ─── AI Chat ───

  /// Get available AI providers
  Future<Map<String, dynamic>> getAIProviders() async {
    final result = await _trpcQuery('ai.getProviders');
    return result is Map<String, dynamic>
        ? result
        : {'available': {'claude': true, 'openai': true}, 'defaultProvider': 'openai'};
  }

  /// Send chat message to AI
  /// [provider]: 'claude' or 'openai'
  /// [messages]: conversation history [{role: 'user'|'assistant', content: '...'}]
  /// [currentHtml]: current HTML state for editing (null for new generation)
  Future<Map<String, dynamic>> aiChat({
    required String provider,
    required List<Map<String, String>> messages,
    String? currentHtml,
  }) async {
    final result = await _trpcMutation('ai.chat', input: {
      'provider': provider,
      'messages': messages,
      'currentHtml': currentHtml,
    });
    return result is Map<String, dynamic>
        ? result
        : {'message': 'No response', 'html': null};
  }

  /// Save generated HTML as new invitation
  Future<Map<String, dynamic>> saveInvitationHtml({
    required String html,
    required String slug,
    required String title,
    List<Map<String, String>>? chatHistory,
  }) async {
    final result = await _trpcMutation('ai.saveHtml', input: {
      'html': html,
      'slug': slug,
      'title': title,
      if (chatHistory != null) 'chatHistory': chatHistory,
    });
    return result is Map<String, dynamic> ? result : {};
  }

  /// Update existing invitation HTML
  Future<Map<String, dynamic>> updateInvitationHtml({
    required int id,
    required String html,
    String? title,
    String? slug,
    List<Map<String, String>>? chatHistory,
  }) async {
    final result = await _trpcMutation('ai.updateHtml', input: {
      'id': id,
      'html': html,
      if (title != null) 'title': title,
      if (slug != null) 'slug': slug,
      if (chatHistory != null) 'chatHistory': chatHistory,
    });
    return result is Map<String, dynamic> ? result : {};
  }

  /// Get invitation for editing
  Future<Map<String, dynamic>> getInvitationForEdit(int id) async {
    final result = await _trpcQuery('ai.getForEdit', input: {'id': id});
    return result is Map<String, dynamic> ? result : {};
  }

  // ─── Packages & Edits ───

  /// Get AI package status for a wedding
  Future<Map<String, dynamic>> getPackageStatus(int weddingId) async {
    try {
      final result = await _trpcQuery('ai.getPackageStatus', input: {'weddingId': weddingId});
      return result is Map<String, dynamic>
          ? result
          : {
              'hasPackage': false,
              'package': null,
              'editsLimit': 0,
              'editsUsed': 0,
              'editsRemaining': 0,
            };
    } catch (e) {
      return {
        'hasPackage': false,
        'package': null,
        'editsLimit': 0,
        'editsUsed': 0,
        'editsRemaining': 0,
      };
    }
  }

  /// Check if user can edit invitation
  Future<Map<String, dynamic>> canEdit(int weddingId) async {
    try {
      final result = await _trpcQuery('ai.canEdit', input: {'weddingId': weddingId});
      return result is Map<String, dynamic>
          ? result
          : {'canEdit': true, 'hasPackage': false, 'editsRemaining': 0};
    } catch (e) {
      return {'canEdit': true, 'hasPackage': false, 'editsRemaining': 0};
    }
  }

  /// Increment edit count after successful generation
  Future<Map<String, dynamic>> incrementEditCount(int weddingId) async {
    final result = await _trpcMutation('ai.incrementEditCount', input: {'weddingId': weddingId});
    return result is Map<String, dynamic> ? result : {};
  }

  /// Purchase AI package (returns payment URL)
  Future<String?> purchasePackage({
    required int weddingId,
    required String packageId,
  }) async {
    final result = await _trpcMutation('ai.purchasePackage', input: {
      'weddingId': weddingId,
      'packageId': packageId,
    });
    return result is Map ? result['redirectUrl'] as String? : null;
  }

  /// Purchase topup edits
  Future<String?> purchaseTopup({
    required int weddingId,
    required String topupId,
  }) async {
    final result = await _trpcMutation('ai.purchaseTopup', input: {
      'weddingId': weddingId,
      'topupId': topupId,
    });
    return result is Map ? result['redirectUrl'] as String? : null;
  }

  // ─── Invitations (Weddings) ───

  /// Get user's invitations
  Future<List<dynamic>> getMyInvitations() async {
    try {
      final result = await _trpcQuery('wedding.myWeddings');
      return result is List ? result : [];
    } catch (e) {
      return [];
    }
  }

  /// Get invitation by slug (public)
  Future<Map<String, dynamic>?> getInvitationBySlug(String slug) async {
    try {
      final result = await _trpcQuery('wedding.getBySlug', input: {'slug': slug});
      return result is Map<String, dynamic> ? result : null;
    } catch (e) {
      return null;
    }
  }

  /// Get invitation by ID
  Future<Map<String, dynamic>?> getInvitationById(int id) async {
    try {
      final result = await _trpcQuery('wedding.getById', input: {'id': id});
      return result is Map<String, dynamic> ? result : null;
    } catch (e) {
      return null;
    }
  }

  /// Delete invitation
  Future<bool> deleteInvitation(int id) async {
    try {
      await _trpcMutation('wedding.delete', input: {'id': id});
      return true;
    } catch (e) {
      return false;
    }
  }

  // ─── RSVP ───

  /// Get RSVP responses for an invitation
  Future<List<dynamic>> getRsvpList(int weddingId) async {
    try {
      final result = await _trpcQuery('rsvp.list', input: {'weddingId': weddingId});
      return result is List ? result : [];
    } catch (e) {
      return [];
    }
  }

  // ─── Wishlist ───

  /// Get wishlist items for an invitation
  Future<List<dynamic>> getWishlist(int weddingId) async {
    try {
      final result = await _trpcQuery('wishlist.list', input: {'weddingId': weddingId});
      return result is List ? result : [];
    } catch (e) {
      return [];
    }
  }

  // ─── Wishes ───

  /// Get all wishes for an invitation (owner view)
  Future<List<dynamic>> getWishes(int weddingId) async {
    try {
      final result = await _trpcQuery('wish.listAll', input: {'weddingId': weddingId});
      return result is List ? result : [];
    } catch (e) {
      return [];
    }
  }

  /// Approve a wish
  Future<bool> approveWish(int id, int weddingId) async {
    try {
      await _trpcMutation('wish.approve', input: {'id': id, 'weddingId': weddingId});
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Reject a wish
  Future<bool> rejectWish(int id, int weddingId) async {
    try {
      await _trpcMutation('wish.reject', input: {'id': id, 'weddingId': weddingId});
      return true;
    } catch (e) {
      return false;
    }
  }

  // ─── Wedding Update ───

  /// Update wedding/invitation settings
  Future<bool> updateWedding({
    required int id,
    String? title,
    String? slug,
    String? location,
    String? description,
  }) async {
    try {
      final input = <String, dynamic>{'id': id};
      if (title != null) input['title'] = title;
      if (slug != null) input['slug'] = slug;
      if (location != null) input['location'] = location;
      if (description != null) input['description'] = description;
      await _trpcMutation('wedding.update', input: input);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Upgrade wedding to premium (free activation if has AI package)
  Future<bool> activateFreeWithAIPackage(int weddingId) async {
    try {
      await _trpcMutation('payment.activateFreeWithAIPackage', input: {'weddingId': weddingId});
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Create premium payment (returns redirect URL)
  Future<String?> createPremiumPayment(int weddingId) async {
    try {
      final result = await _trpcMutation('payment.createPremiumPayment', input: {'weddingId': weddingId});
      return result is Map ? result['redirectUrl'] as String? : null;
    } catch (e) {
      return null;
    }
  }

  // ─── File Upload ───

  /// Upload a file (image, video, audio) to the server
  /// Returns {url, key, type}
  Future<Map<String, dynamic>> uploadFile(String filePath, String fileName) async {
    final uploadDio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 120),
    ));

    // Add auth header
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      final token = await user.getIdToken();
      if (token != null) {
        uploadDio.options.headers['Authorization'] = 'Bearer $token';
      }
    }

    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
    });

    final response = await uploadDio.post('/api/upload', data: formData);
    return response.data is Map<String, dynamic>
        ? response.data
        : {'url': '', 'key': '', 'type': ''};
  }

  // ─── Pricing ───

  /// Get pricing info
  Future<Map<String, dynamic>> getPricingInfo() async {
    try {
      final result = await _trpcQuery('payment.getPricingInfo');
      return result is Map<String, dynamic> ? result : {'price': 0, 'isPromo': false};
    } catch (e) {
      return {'price': 0, 'isPromo': false};
    }
  }
}
