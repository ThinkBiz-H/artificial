import '../network/api_client.dart';
import '../network/api_endpoints.dart';
import '../models/cart_model.dart';

/// POST /shipping/calculate (shipping.controller.js) — same service the
/// backend uses when it prices the order.
class ShippingRepository {
  ShippingRepository(this._api);

  final ApiClient _api;

  Future<ShippingQuote> quote({
    required String pincode,
    double subTotal = 0,
    bool cod = false,
    double weightKg = 0.5,
  }) async {
    final res = await _api.post(ApiEndpoints.shippingCalculate, data: {
      'pincode': pincode,
      'subTotal': subTotal,
      'cod': cod,
      'weight': weightKg,
    }, auth: false);
    return ShippingQuote.fromJson(res.data);
  }
}
