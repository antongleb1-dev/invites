import 'package:dio/dio.dart';

import 'storage_service.dart';

class ApiService {
  late final Dio _dio;
  
  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: 'https://invites.kz/api',
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await StorageService.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          // Handle errors globally
          return handler.next(error);
        },
      ),
    );
  }
  
  // Auth
  Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await _dio.get('/user/me');
    return response.data;
  }
  
  // Invitations
  Future<List<dynamic>> getInvitations() async {
    final response = await _dio.get('/invitations');
    return response.data;
  }
  
  Future<Map<String, dynamic>> getInvitation(String id) async {
    final response = await _dio.get('/invitations/$id');
    return response.data;
  }
  
  Future<Map<String, dynamic>> generateInvitation({
    required String prompt,
    required String language,
  }) async {
    final response = await _dio.post('/invitations/generate', data: {
      'prompt': prompt,
      'language': language,
    });
    return response.data;
  }
  
  Future<void> deleteInvitation(String id) async {
    await _dio.delete('/invitations/$id');
  }
  
  // Tokens
  Future<int> getTokenBalance() async {
    final response = await _dio.get('/tokens/balance');
    return response.data['balance'];
  }
  
  Future<Map<String, dynamic>> verifyPurchase({
    required String productId,
    required String purchaseToken,
    required String platform,
  }) async {
    final response = await _dio.post('/tokens/verify-purchase', data: {
      'productId': productId,
      'purchaseToken': purchaseToken,
      'platform': platform,
    });
    return response.data;
  }
}
