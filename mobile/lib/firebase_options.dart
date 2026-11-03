// Firebase configuration for the Android app (from android/app/google-services.json,
// project abj-jewellery). These are public client identifiers, not secrets.
// iOS initialises from ios/Runner/GoogleService-Info.plist once that file is added.
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

class DefaultFirebaseOptions {
  DefaultFirebaseOptions._();

  /// Options for this platform, or null when the platform reads its native
  /// config file instead (iOS plist) or has no Firebase app (web, desktop).
  static FirebaseOptions? get currentPlatform {
    if (kIsWeb) return null;
    return defaultTargetPlatform == TargetPlatform.android ? android : null;
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBGDKn4zTMnPOFkz9D6PfHV_oMJ5dQqWgM',
    appId: '1:58420919218:android:a613f6ac743de8919182ab',
    messagingSenderId: '58420919218',
    projectId: 'abj-jewellery',
    storageBucket: 'abj-jewellery.firebasestorage.app',
  );
}
