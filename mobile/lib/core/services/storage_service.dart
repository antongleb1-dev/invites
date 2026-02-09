import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const _storage = FlutterSecureStorage();
  
  // Keys
  static const String _tokenKey = 'auth_token';
  static const String _userIdKey = 'user_id';
  static const String _emailKey = 'user_email';
  static const String _nameKey = 'user_name';
  static const String _isGuestKey = 'is_guest';
  static const String _localeKey = 'locale';
  
  // Auth data
  static Future<void> saveAuthData({
    required String token,
    required String userId,
    String? email,
    String? name,
  }) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userIdKey, value: userId);
    if (email != null) await _storage.write(key: _emailKey, value: email);
    if (name != null) await _storage.write(key: _nameKey, value: name);
  }
  
  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }
  
  static Future<String?> getUserId() async {
    return await _storage.read(key: _userIdKey);
  }
  
  static Future<String?> getEmail() async {
    return await _storage.read(key: _emailKey);
  }
  
  static Future<String?> getName() async {
    return await _storage.read(key: _nameKey);
  }
  
  static Future<void> clearAuthData() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userIdKey);
    await _storage.delete(key: _emailKey);
    await _storage.delete(key: _nameKey);
    await _storage.delete(key: _isGuestKey);
  }
  
  // Guest mode
  static Future<void> setGuestMode(bool isGuest) async {
    await _storage.write(key: _isGuestKey, value: isGuest.toString());
  }
  
  static Future<bool> isGuestMode() async {
    final value = await _storage.read(key: _isGuestKey);
    return value == 'true';
  }
  
  // Locale
  static Future<void> saveLocale(String locale) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_localeKey, locale);
  }
  
  static Future<String?> getLocale() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_localeKey);
  }
}
