import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/core_providers.dart';

/// Recent searches persisted in encrypted Hive.
class RecentSearchesNotifier extends Notifier<List<String>> {
  @override
  List<String> build() => ref.watch(localStorageProvider).recentSearches;

  Future<void> add(String term) async {
    await ref.read(localStorageProvider).addRecentSearch(term);
    state = ref.read(localStorageProvider).recentSearches;
  }

  Future<void> remove(String term) async {
    await ref.read(localStorageProvider).removeRecentSearch(term);
    state = ref.read(localStorageProvider).recentSearches;
  }

  Future<void> clear() async {
    await ref.read(localStorageProvider).clearRecentSearches();
    state = const <String>[];
  }
}

final recentSearchesProvider =
    NotifierProvider<RecentSearchesNotifier, List<String>>(RecentSearchesNotifier.new);
