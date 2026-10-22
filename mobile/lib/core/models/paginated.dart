import 'common_models.dart';

class Paginated<T> {
  const Paginated({required this.items, required this.pagination});

  final List<T> items;
  final Pagination pagination;

  bool get hasMore => pagination.hasMore;
}
