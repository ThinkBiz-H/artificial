import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../repositories/auth_repository.dart';
import '../repositories/cart_repository.dart';
import '../repositories/catalog_repository.dart';
import '../repositories/content_repository.dart';
import '../repositories/notification_repository.dart';
import '../repositories/order_repository.dart';
import '../repositories/review_repository.dart';
import '../repositories/shipping_repository.dart';
import '../repositories/user_repository.dart';
import '../repositories/wishlist_repository.dart';
import 'core_providers.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) => AuthRepository(
      ref.watch(apiClientProvider),
      ref.watch(tokenManagerProvider),
      ref.watch(secureStorageProvider),
    ));

final userRepositoryProvider =
    Provider<UserRepository>((ref) => UserRepository(ref.watch(apiClientProvider)));

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) =>
    CatalogRepository(ref.watch(apiClientProvider), ref.watch(localStorageProvider)));

final reviewRepositoryProvider =
    Provider<ReviewRepository>((ref) => ReviewRepository(ref.watch(apiClientProvider)));

final cartRepositoryProvider = Provider<CartRepository>((ref) =>
    CartRepository(ref.watch(apiClientProvider), ref.watch(localStorageProvider)));

final wishlistRepositoryProvider = Provider<WishlistRepository>((ref) =>
    WishlistRepository(ref.watch(apiClientProvider), ref.watch(localStorageProvider)));

final orderRepositoryProvider =
    Provider<OrderRepository>((ref) => OrderRepository(ref.watch(apiClientProvider)));

final shippingRepositoryProvider =
    Provider<ShippingRepository>((ref) => ShippingRepository(ref.watch(apiClientProvider)));

final notificationRepositoryProvider = Provider<NotificationRepository>(
    (ref) => NotificationRepository(ref.watch(apiClientProvider)));

final contentRepositoryProvider = Provider<ContentRepository>((ref) =>
    ContentRepository(ref.watch(apiClientProvider), ref.watch(localStorageProvider)));
