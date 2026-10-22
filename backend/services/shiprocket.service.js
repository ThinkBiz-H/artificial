const { shiprocketClient, isShiprocketEnabled } = require("../config/shiprocket");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

// In-memory token cache. Shiprocket tokens are valid for ~240 hours; we
// refresh a little early to be safe. This is fine for a single-instance
// deployment — for multi-instance deployments back this with Redis instead.
let tokenCache = { token: null, expiresAt: 0 };

const assertEnabled = () => {
  if (!isShiprocketEnabled()) {
    throw new ApiError(
      400,
      "Shiprocket integration is disabled. Set SHIPROCKET_ENABLED=true and configure credentials, or manage this shipment manually.",
    );
  }
};

/**
 * Logs in to Shiprocket and returns a bearer token, using a cached
 * token when still valid.
 */
const getAuthToken = async () => {
  assertEnabled();

  if (tokenCache.token && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new ApiError(500, "Shiprocket credentials are not configured");
  }

  try {
    const { data } = await shiprocketClient.post("/auth/login", {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    tokenCache = {
      token: data.token,
      // Refresh a day early out of the ~10 day validity window
      expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
    };

    return tokenCache.token;
  } catch (error) {
    logger.error(`Shiprocket auth failed: ${error.response?.data?.message || error.message}`);
    throw new ApiError(502, "Failed to authenticate with Shiprocket");
  }
};

const authedRequest = async (method, url, payload) => {
  const token = await getAuthToken();
  try {
    const { data } = await shiprocketClient.request({
      method,
      url,
      data: payload,
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      JSON.stringify(error.response?.data?.errors) ||
      error.message;
    logger.error(`Shiprocket API error [${method} ${url}]: ${message}`);
    throw new ApiError(502, `Shiprocket error: ${message}`);
  }
};

/**
 * Builds the Shiprocket "create adhoc order" payload from an internal Order document.
 */
const buildAdhocOrderPayload = (order) => {
  const addr = order.shippingAddress || {};
  const [firstName, ...rest] = (addr.fullName || "Customer").split(" ");

  return {
    order_id: order.orderNumber,
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 19).replace("T", " "),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing_customer_name: firstName || "Customer",
    billing_last_name: rest.join(" ") || "",
    billing_address: addr.addressLine1 || "",
    billing_address_2: addr.addressLine2 || "",
    billing_city: addr.city || "",
    billing_pincode: addr.pincode || "",
    billing_state: addr.state || "",
    billing_country: addr.country || "India",
    billing_email: addr.email || "customer@example.com",
    billing_phone: addr.mobile || "9999999999",
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      // Colour / size in the name so the packer picks the right piece; the
      // variant SKU keeps two variants of one product as separate lines.
      name: [item.color, item.size].filter(Boolean).length
        ? `${item.title} (${[item.color, item.size].filter(Boolean).join(" / ")})`
        : item.title,
      sku: item.sku || item.product.toString(),
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: order.subTotal,
    length: order.packageDetails?.lengthCm || 10,
    breadth: order.packageDetails?.breadthCm || 10,
    height: order.packageDetails?.heightCm || 10,
    weight: order.packageDetails?.weightKg || 0.5,
  };
};

/**
 * Creates a Shiprocket adhoc order + shipment. Returns identifiers to
 * persist on the Order document.
 */
const createShipment = async (order) => {
  const payload = buildAdhocOrderPayload(order);
  const data = await authedRequest("post", "/orders/create/adhoc", payload);

  if (!data || data.status_code === 0 || !data.shipment_id) {
    throw new ApiError(502, data?.message || "Shiprocket failed to create shipment");
  }

  return {
    shiprocketOrderId: String(data.order_id),
    shipmentId: String(data.shipment_id),
    status: data.status,
  };
};

/**
 * Requests the best recommended courier for a shipment, or assigns a
 * specific courier if `courierId` is provided.
 */
const assignAWB = async (shipmentId, courierId) => {
  const payload = { shipment_id: shipmentId };
  if (courierId) payload.courier_id = courierId;

  const data = await authedRequest("post", "/courier/assign/awb", payload);
  const response = data?.response?.data;

  if (!response || !response.awb_code) {
    throw new ApiError(502, data?.message || "Shiprocket failed to assign an AWB / courier");
  }

  return {
    awbCode: String(response.awb_code),
    courierCompanyId: String(response.courier_company_id || courierId || ""),
    courierName: response.courier_name || "",
  };
};

/**
 * Checks courier serviceability + recommends the cheapest/fastest courier
 * for the given pincode pair, useful before assigning an AWB.
 */
const checkServiceability = async ({ pickupPincode, deliveryPincode, weight, cod }) => {
  const token = await getAuthToken();
  try {
    const { data } = await shiprocketClient.get("/courier/serviceability", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight,
        cod: cod ? 1 : 0,
      },
    });
    return data?.data?.available_courier_companies || [];
  } catch (error) {
    logger.error(`Shiprocket serviceability check failed: ${error.message}`);
    return [];
  }
};

const generateLabel = async (shipmentId) => {
  const data = await authedRequest("post", "/courier/generate/label", {
    shipment_id: [shipmentId],
  });
  return data?.label_url || null;
};

const generateManifest = async (shipmentId) => {
  const data = await authedRequest("post", "/manifests/generate", {
    shipment_id: [shipmentId],
  });
  return data?.manifest_url || null;
};

const requestPickup = async (shipmentId) => {
  const data = await authedRequest("post", "/courier/generate/pickup", {
    shipment_id: [shipmentId],
  });
  return {
    pickupScheduledAt: data?.response?.pickup_scheduled_date ? new Date(data.response.pickup_scheduled_date) : new Date(),
    pickupTokenNumber: data?.response?.pickup_token_number ? String(data.response.pickup_token_number) : null,
  };
};

const cancelShipment = async (awbCode) => {
  const data = await authedRequest("post", "/orders/cancel/shipment/awbs", {
    awbs: [awbCode],
  });
  return data;
};

/**
 * Tracks a shipment by AWB code. Returns a normalized status string plus
 * the raw scan history for audit / debugging.
 */
const trackByAWB = async (awbCode) => {
  const data = await authedRequest("get", `/courier/track/awb/${awbCode}`);
  const trackData = data?.tracking_data;
  if (!trackData) {
    throw new ApiError(502, "No tracking data available from Shiprocket yet");
  }

  return {
    currentStatus: trackData.shipment_track?.[0]?.current_status || "In Transit",
    checkpoints: trackData.shipment_track_activities || [],
    etd: trackData.etd || null,
  };
};

module.exports = {
  isShiprocketEnabled,
  getAuthToken,
  createShipment,
  assignAWB,
  checkServiceability,
  generateLabel,
  generateManifest,
  requestPickup,
  cancelShipment,
  trackByAWB,
};
