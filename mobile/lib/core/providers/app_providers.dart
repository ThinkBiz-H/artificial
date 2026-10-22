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
