import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/auth_models.dart';
import '../models/user_model.dart';
import 'core_providers.dart';
import 'push_registration_provider.dart';
import 'repository_providers.dart';

enum AuthStatus { authenticated, unauthenticated }

class AuthState {
  const AuthState._(this.status, this.user, {this.sessionExpired = false});

  const AuthState.unauthenticated({bool sessionExpired = false})
      : this._(AuthStatus.unauthenticated, null, sessionExpired: sessionExpired);

  const AuthState.authenticated(UserModel? user)
      : this._(AuthStatus.authenticated, user);

  final AuthStatus status;
  final UserModel? user;

  /// True when the server rejected the refresh token (not a manual logout).
  final bool sessionExpired;

  bool get isAuthenticated => status == AuthStatus.authenticated;
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

/// Convenience selectors.
final isAuthenticatedProvider =
    Provider<bool>((ref) => ref.watch(authProvider.select((s) => s.isAuthenticated)));
final currentUserProvider = Provider<UserModel?>((ref) => ref.watch(authProvider).user);

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    final tokens = ref.watch(tokenManagerProvider);
    final sub = tokens.onSessionExpired.listen((_) => _onSessionExpired());
    ref.onDispose(sub.cancel);

    if (tokens.hasSession) {
      Future<void>.microtask(refreshProfile);
      return AuthState.authenticated(ref.read(initialUserProvider));
    }
    return const AuthState.unauthenticated();
  }

  /// Called after any successful OTP verification (login, register or
  /// checkout). Guest cart & wishlist are merged into the account first so
  /// dependent providers fetch the merged server state.
  Future<void> completeLogin(AuthSession session) async {
    try {
      await ref.read(cartRepositoryProvider).mergeGuestCart();
    } catch (_) {}
    try {
      await ref.read(wishlistRepositoryProvider).mergeGuestWishlist();
    } catch (_) {}
    state = AuthState.authenticated(session.user);
    unawaited(ref.read(pushRegistrationProvider).register());
  }

  Future<void> refreshProfile() async {
    if (!state.isAuthenticated) return;
    try {
      final user = await ref.read(authRepositoryProvider).me();
      if (state.isAuthenticated) state = AuthState.authenticated(user);
    } catch (_) {
      // Offline or transient — keep the cached user. A rejected refresh
      // token is handled by _onSessionExpired.
    }
  }

  Future<void> updateUser(UserModel user) async {
    await ref.read(authRepositoryProvider).cacheUser(user);
    state = AuthState.authenticated(user);
  }

  Future<void> logout() async {
    await ref.read(pushRegistrationProvider).unregister();
    await ref.read(authRepositoryProvider).logout();
    await ref.read(localStorageProvider).clearSessionData();
    state = const AuthState.unauthenticated();
  }

  /// Play Store requirement: in-app account deletion.
  Future<void> deleteAccount() async {
    await ref.read(pushRegistrationProvider).unregister();
    await ref.read(userRepositoryProvider).deleteAccount();
    await ref.read(authRepositoryProvider).clearLocalSession();
    await ref.read(localStorageProvider).clearSessionData();
    state = const AuthState.unauthenticated();
  }

  Future<void> _onSessionExpired() async {
    await ref.read(authRepositoryProvider).clearLocalSession();
    await ref.read(localStorageProvider).clearSessionData();
    state = const AuthState.unauthenticated(sessionExpired: true);
  }
}
