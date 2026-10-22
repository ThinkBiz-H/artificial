import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/order_model.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_bottom_nav.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/shimmer_widgets.dart';
import '../../../shared/widgets/state_views.dart';
import '../../../shared/widgets/status_chip.dart';
import '../viewmodels/orders_viewmodel.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(myOrdersProvider);
    // Back from the orders list always returns to the Home tab.
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) context.go(RoutePaths.home);
      },
      child: DefaultTabController(
        length: 4,
        child: Scaffold(
          appBar: AppBar(
            leading: const HomeBackButton(),
            title: const Text('My Orders'),
            bottom: const TabBar(
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              tabs: [
                Tab(text: 'ALL'),
                Tab(text: 'ACTIVE'),
                Tab(text: 'DELIVERED'),
                Tab(text: 'CANCELLED'),
              ],
            ),
          ),
          body: async.when(
            loading: () => const ListTileSkeleton(),
            error: (e, _) => ErrorState(
              error: e,
              onRetry: () => ref.invalidate(myOrdersProvider),
            ),
            data: (orders) => TabBarView(
              children: [
                _OrderList(orders: orders),
                _OrderList(orders: orders.where((o) => o.isActive).toList()),
                _OrderList(orders: orders.where((o) => o.isDelivered).toList()),
                _OrderList(orders: orders.where((o) => o.isCancelled).toList()),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OrderList extends ConsumerWidget {
  const _OrderList({required this.orders});
  final List<OrderModel> orders;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myOrdersProvider);
        try {
          await ref.read(myOrdersProvider.future);
        } catch (_) {}
      },
      child: orders.isEmpty
          ? ListView(
              children: [
                SizedBox(
                  height: MediaQuery.sizeOf(context).height * 0.6,
                  child: EmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: 'No orders here',
                    message: 'When you place an order it will appear here.',
                    actionLabel: 'Shop now',
                    onAction: () => context.go(RoutePaths.home),
                  ),
                ),
              ],
            )
          : ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.md),
              itemCount: orders.length,
              itemBuilder: (_, i) => OrderCard(order: orders[i]),
            ),
    );
  }
}

class OrderCard extends StatelessWidget {
  const OrderCard({super.key, required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: InkWell(
        borderRadius: const BorderRadius.all(Radius.circular(14)),
        onTap: () => context.push(RoutePaths.order(order.id)),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '#${order.orderNumber}',
                      style: context.text.titleMedium,
                    ),
                  ),
                  StatusChip(label: order.orderStatus),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                Formatters.dateTime(order.createdAt),
                style: context.text.bodySmall,
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  ...order.items
                      .take(3)
                      .map(
                        (i) => Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: SizedBox(
                            width: 52,
                            height: 60,
                            child: AppNetworkImage(
                              url: i.thumbnail,
                              targetWidth: 120,
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                      ),
                  if (order.items.length > 3)
                    Text(
                      '+${order.items.length - 3}',
                      style: context.text.bodySmall,
                    ),
                  const Spacer(),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        Formatters.currency(order.grandTotal),
                        style: context.text.titleMedium,
                      ),
                      Text(
                        '${order.itemCount} item${order.itemCount == 1 ? '' : 's'} · ${order.isCod ? 'COD' : 'Online'}',
                        style: context.text.bodySmall,
                      ),
                    ],
                  ),
                ],
              ),
              if (order.canRetryPayment) ...[
                const SizedBox(height: AppSpacing.sm),
                StatusChip(
                  label:
                      'Payment ${order.paymentStatus.toLowerCase()} — tap to retry',
                  color: StatusChip.colorForPayment(order.paymentStatus),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
