import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../services/api_service.dart';
import '../services/storage_service.dart';
import 'api_provider.dart';

/// Auth state provider
final authStateProvider = StreamProvider<User?>((ref) {
  return FirebaseAuth.instance.authStateChanges();
});

/// Current user data provider
final currentUserProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final authState = ref.watch(authStateProvider);
  if (authState.valueOrNull == null) return null;
  
  try {
    final api = ref.read(apiServiceProvider);
    return await api.getCurrentUser();
  } catch (e) {
    return null;
  }
});

/// Auth controller for login/logout actions
final authControllerProvider = Provider((ref) => AuthController(ref));

class AuthController {
  final Ref _ref;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  
  AuthController(this._ref);
  
  ApiService get _api => _ref.read(apiServiceProvider);
  
  /// Sign in with email and password
  Future<UserCredential> signInWithEmail(String email, String password) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      // Save auth token
      final token = await credential.user?.getIdToken();
      if (token != null && credential.user != null) {
        await StorageService.saveAuthData(
          token: token,
          userId: credential.user!.uid,
          email: credential.user!.email,
          name: credential.user!.displayName,
        );
      }
      
      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseError(e);
    }
  }
  
  /// Sign up with email and password
  Future<UserCredential> signUpWithEmail(String email, String password, {String? name}) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      if (name != null) {
        await credential.user?.updateDisplayName(name);
      }
      
      // Save auth token
      final token = await credential.user?.getIdToken();
      if (token != null && credential.user != null) {
        await StorageService.saveAuthData(
          token: token,
          userId: credential.user!.uid,
          email: credential.user!.email,
          name: name ?? credential.user!.displayName,
        );
      }
      
      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseError(e);
    }
  }
  
  /// Sign in with Google
  Future<UserCredential?> signInWithGoogle() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;
      
      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      
      final userCredential = await _auth.signInWithCredential(credential);
      
      // Save auth token
      final token = await userCredential.user?.getIdToken();
      if (token != null && userCredential.user != null) {
        await StorageService.saveAuthData(
          token: token,
          userId: userCredential.user!.uid,
          email: userCredential.user!.email,
          name: userCredential.user!.displayName,
        );
      }
      
      return userCredential;
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseError(e);
    }
  }
  
  /// Sign in with Apple
  Future<UserCredential> signInWithApple() async {
    try {
      final appleProvider = AppleAuthProvider();
      appleProvider.addScope('email');
      appleProvider.addScope('name');
      
      final credential = await _auth.signInWithProvider(appleProvider);
      
      // Save auth token
      final token = await credential.user?.getIdToken();
      if (token != null && credential.user != null) {
        await StorageService.saveAuthData(
          token: token,
          userId: credential.user!.uid,
          email: credential.user!.email,
          name: credential.user!.displayName,
        );
      }
      
      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseError(e);
    }
  }
  
  /// Continue as guest
  Future<UserCredential> continueAsGuest() async {
    try {
      final credential = await _auth.signInAnonymously();
      
      await StorageService.setGuestMode(true);
      
      // Save auth token
      final token = await credential.user?.getIdToken();
      if (token != null && credential.user != null) {
        await StorageService.saveAuthData(
          token: token,
          userId: credential.user!.uid,
        );
      }
      
      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseError(e);
    }
  }
  
  /// Sign out
  Future<void> signOut() async {
    await _auth.signOut();
    await _googleSignIn.signOut();
    await StorageService.clearAuthData();
  }
  
  /// Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseError(e);
    }
  }
  
  String _handleFirebaseError(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found with this email.';
      case 'wrong-password':
        return 'Incorrect password.';
      case 'email-already-in-use':
        return 'This email is already registered.';
      case 'weak-password':
        return 'Password is too weak.';
      case 'invalid-email':
        return 'Invalid email address.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many requests. Please try again later.';
      default:
        return e.message ?? 'An error occurred.';
    }
  }
}
