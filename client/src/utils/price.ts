import type { Product, ProductVariant } from "../redux/slices/productSlice";

/**
 * Calculates the display price of a product, considering:
 * - Variant price (if available)
 * - Flash sale discount (if active)
 * - Old/original price (for showing discounts)
 */
export const getDisplayPrice = (
  product: Product,
  variant?: ProductVariant
): { price: number; oldPrice?: number } => {
  const basePrice = variant?.price ?? product.price ?? 0;
  const oldPrice = product.oldPrice ?? undefined;

  // ✅ Handle flash sale discounts safely
  if (product.flashSale?.isActive && typeof product.flashSale.discountPercentage === "number") {
    const discount = product.flashSale.discountPercentage / 100;
    const discountedPrice = Math.max(0, basePrice * (1 - discount)); // prevent negative prices

    return {
      price: discountedPrice,
      oldPrice: basePrice,
    };
  }

  // ✅ Fallback: show normal price
  return { price: basePrice, oldPrice };
};
