import axios from "axios";
import NodeCache from "node-cache";
import Product from "../models/Product.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";

/* ------------------------------------------------------------
   🔒 CACHES
------------------------------------------------------------ */
const geoCache = new NodeCache({ stdTTL: 86400 }); // 1 day
const distanceCache = new NodeCache({ stdTTL: 86400 });

/* ------------------------------------------------------------
   🌍 ENV + CONFIG
------------------------------------------------------------ */
const getEnv = () => {
  const {
    LOCATIONIQ_API_KEY,
    WAREHOUSE_ADDRESS,
    COST_PER_KG = 20,
    DISTANCE_COST_PER_KM = 10,
    BULKY_VOLUME_THRESHOLD_CM3 = 1_000_000,
    BULKY_SURCHARGE = 50,
    FRAGILITY_COST_HIGH = 100,
    FRAGILITY_COST_MEDIUM = 50,
    FREE_SHIPPING_THRESHOLD = 5000,
  } = process.env;

  if (!LOCATIONIQ_API_KEY) throw new Error("Missing LOCATIONIQ_API_KEY");
  if (!WAREHOUSE_ADDRESS) throw new Error("Missing WAREHOUSE_ADDRESS");

  return {
    LOCATIONIQ_API_KEY,
    WAREHOUSE_ADDRESS,
    COST_PER_KG: Number(COST_PER_KG),
    DISTANCE_COST_PER_KM: Number(DISTANCE_COST_PER_KM),
    BULKY_VOLUME_THRESHOLD_CM3: Number(BULKY_VOLUME_THRESHOLD_CM3),
    BULKY_SURCHARGE: Number(BULKY_SURCHARGE),
    FRAGILITY_COST_HIGH: Number(FRAGILITY_COST_HIGH),
    FRAGILITY_COST_MEDIUM: Number(FRAGILITY_COST_MEDIUM),
    FREE_SHIPPING_THRESHOLD: Number(FREE_SHIPPING_THRESHOLD),
  };
};

/* ------------------------------------------------------------
   🧭 HELPERS
------------------------------------------------------------ */
export const normalizeKey = (text) => text?.trim()?.toLowerCase() || "";

/* ------------------------------------------------------------
   🗺️ GEOCODING
------------------------------------------------------------ */
export const getCoordinates = async (address) => {
  const { LOCATIONIQ_API_KEY } = getEnv();

  if (!address) throw new ErrorHandler("Address is required for geolocation", 400);

  const cacheKey = `coords:${normalizeKey(address)}`;
  const cached = geoCache.get(cacheKey);
  if (cached) return cached;

  const res = await axios.get("https://us1.locationiq.com/v1/search", {
    params: { key: LOCATIONIQ_API_KEY, q: address, format: "json", limit: 1 },
    timeout: 7000,
  });

  const result = res.data?.[0];
  if (!result) throw new ErrorHandler(`No geolocation found for "${address}"`, 400);

  const coords = { lat: +result.lat, lon: +result.lon };
  geoCache.set(cacheKey, coords);
  return coords;
};

/* ------------------------------------------------------------
   📏 DISTANCE CALCULATION
------------------------------------------------------------ */
export const getDistanceKm = async (origin, destination) => {
  const { LOCATIONIQ_API_KEY } = getEnv();

  const cacheKey = `dist:${origin.lat},${origin.lon}|${destination.lat},${destination.lon}`;
  const cached = distanceCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const url = `https://us1.locationiq.com/v1/matrix/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
  const res = await axios.get(url, { params: { key: LOCATIONIQ_API_KEY }, timeout: 7000 });

  const km = Number(res.data?.distances?.[0]?.[1]) / 1000;
  if (isNaN(km)) throw new ErrorHandler("Invalid distance data from LocationIQ", 500);

  distanceCache.set(cacheKey, km);
  return km;
};

/* ------------------------------------------------------------
   🚚 SHIPPING COST CALCULATION
------------------------------------------------------------ */
export const calculateShippingCost = async ({ items, deliveryAddress, totalAmount }) => {
  const {
    WAREHOUSE_ADDRESS,
    COST_PER_KG,
    DISTANCE_COST_PER_KM,
    BULKY_VOLUME_THRESHOLD_CM3,
    BULKY_SURCHARGE,
    FRAGILITY_COST_HIGH,
    FRAGILITY_COST_MEDIUM,
    FREE_SHIPPING_THRESHOLD,
  } = getEnv();

  if (!Array.isArray(items) || !items.length)
    throw new ErrorHandler("No items provided for shipping calculation", 400);
  if (!deliveryAddress) throw new ErrorHandler("Delivery address required", 400);

  // 🚫 Free shipping threshold
  if (+totalAmount >= +FREE_SHIPPING_THRESHOLD) return 0;

  // 🌍 Get coordinates & distance
  const [origin, destination] = await Promise.all([
    getCoordinates(WAREHOUSE_ADDRESS),
    getCoordinates(deliveryAddress),
  ]);
  const distanceKm = await getDistanceKm(origin, destination);

  // 🏷️ Product info
  const productIds = [...new Set(items.map((i) => i.productId).filter(Boolean))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let totalCost = 0;

  for (const item of items) {
    const product = productMap.get(item.productId?.toString());
    if (!product) continue;

    const qty = Math.max(1, Number(item.quantity) || 1);
    const weightKg = Number(product.weight) || 0;

    const weightCost = weightKg * COST_PER_KG * qty;

    const { length = 0, width = 0, height = 0 } = product.dimensions || {};
    const volumeCm3 = length * width * height;
    const bulkyCost = volumeCm3 > BULKY_VOLUME_THRESHOLD_CM3 ? BULKY_SURCHARGE * qty : 0;

    const fragility = (product.fragility || "").toLowerCase();
    const fragilityCost =
      fragility === "high"
        ? FRAGILITY_COST_HIGH * qty
        : fragility === "medium"
        ? FRAGILITY_COST_MEDIUM * qty
        : 0;

    totalCost += weightCost + bulkyCost + fragilityCost;
  }

  totalCost += distanceKm * DISTANCE_COST_PER_KM;

  return Math.max(0, Number(totalCost.toFixed(2)));
};

