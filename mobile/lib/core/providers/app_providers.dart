import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/category_model.dart';
import '../models/settings_model.dart';
import 'core_providers.dart';
import 'repository_providers.dart';

/// GET /settings (cached for offline use).
final settingsProvider = FutureProvider<PublicSettings>(
    (ref) => ref.watch(contentRepositoryProvider).settings());

/// Never-null view of settings for widgets that just need a value.
final settingsValueProvider = Provider<PublicSettings>(
    (ref) => ref.watch(settingsProvider).valueOrNull ?? const PublicSettings());

/// Brand Management logo URLs (admin): live settings once loaded, otherwise
/// the last cached copy — so the splash screen and offline launches show the
/// admin's logos too. Empty map = bundled logos everywhere.
final brandLogosProvider = Provider<Map<String, String>>((ref) {
  final live = ref.watch(settingsProvider).valueOrNull;
  if (live != null) return live.brandLogos;
  final cached = ref.read(localStorageProvider).getCache('settings');
  if (cached is Map && cached['settings'] is Map) {
    return PublicSettings.fromJson(Map<String, dynamic>.from(cached['settings'] as Map)).brandLogos;
  }
  return const <String, String>{};
});

/// GET /categories?tree=true
final categoryTreeProvider = FutureProvider<List<CategoryModel>>(
    (ref) => ref.watch(catalogRepositoryProvider).categoryTree());

class ThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    final saved = ref.watch(localStorageProvider).themeMode;
    return switch (saved) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  Future<void> set(ThemeMode mode) async {
    state = mode;
    await ref.read(localStorageProvider).setThemeMode(mode.name);
  }
}

final themeModeProvider =
    NotifierProvider<ThemeModeNotifier, ThemeMode>(ThemeModeNotifier.new);
