import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/storage_service.dart';

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(_getDeviceLocale()) {
    _loadSavedLocale();
  }
  
  static Locale _getDeviceLocale() {
    final deviceLocale = Platform.localeName.split('_').first;
    const supportedLocales = ['en', 'ru', 'es', 'pt', 'hi', 'ar'];
    
    if (supportedLocales.contains(deviceLocale)) {
      return Locale(deviceLocale);
    }
    return const Locale('en');
  }
  
  Future<void> _loadSavedLocale() async {
    final savedLocale = await StorageService.getLocale();
    if (savedLocale != null) {
      state = Locale(savedLocale);
    }
  }
  
  Future<void> setLocale(String languageCode) async {
    state = Locale(languageCode);
    await StorageService.saveLocale(languageCode);
  }
}
