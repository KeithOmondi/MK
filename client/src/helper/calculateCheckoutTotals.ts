import type { CartItem, Coupon } from "../redux/slices/cartSlice";

export interface CheckoutTotals {
  subtotal: number;
  totalCommission: number;
  totalEscrowHeld: number;
  shippingCost: number;
  totalAmount: number;
  estimatedDeliveryDate: Date;
  deliveryDuration: number; // in days
}

/**
 * Calculates checkout totals for the cart.
 *
 * @param items - Cart items
 * @param shippingMethod - "standard" or "express"
 * @param distanceKm - Distance in kilometers for delivery
 * @param coupon - Optional coupon
 * @returns CheckoutTotals object
 */
export const calculateCheckoutTotals = (
  items: CartItem[],
  shippingMethod: "standard" | "express" = "standard",
  distanceKm: number = 10,
  coupon: Coupon | null = null
): CheckoutTotals => {
  let subtotal = 0;
  let totalCommission = 0;

  // Calculate subtotal and commission
  items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    const commission = itemTotal * 0.1; // 10% commission
    subtotal += itemTotal;
    totalCommission += commission;
  });

  const totalEscrowHeld = subtotal - totalCommission;

  // Dynamic shipping cost based on distance
  const shippingCost =
    shippingMethod === "express" ? 200 + distanceKm * 10 : 100 + distanceKm * 5;

  // Apply coupon discount
  const discount = coupon ? (subtotal * coupon.percentage) / 100 : 0;

  // Total amount including shipping and discount
  const totalAmount = subtotal - discount + shippingCost;

  // Estimate delivery date based on shipping method
  const deliveryDays = shippingMethod === "express" ? 1 : 3;
  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + deliveryDays);

  return {
    subtotal,
    totalCommission,
    totalEscrowHeld,
    shippingCost,
    totalAmount,
    estimatedDeliveryDate,
    deliveryDuration: deliveryDays,
  };
};
