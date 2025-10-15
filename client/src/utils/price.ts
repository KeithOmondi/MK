import type { Product, ProductVariant } from "../redux/slices/productSlice";

/**
 * Returns safe, display-ready pricing for a product or its variant.
 * Handles:
 * - Missing or invalid numeric values
 * - Variant-level vs product-level prices
 * - Flash sale discounts
 * - Old/original price for discount display
 */
export const getDisplayPrice = (
  product: Product,
  variant?: ProductVariant
): { price: number; oldPrice?: number } => {
  // Ensure all numeric inputs are valid
  const productPrice = Number(product.price ?? 0);
  const variantPrice = Number(variant?.price ?? 0);

  // Prefer variant price if valid and > 0
  const basePrice = variantPrice > 0 ? variantPrice : productPrice;

  // Old/original price (for UI strike-through display)
  const oldPrice =
    typeof product.oldPrice === "number" && product.oldPrice > basePrice
      ? product.oldPrice
      : undefined;

  // Flash sale logic
  const flashSaleActive = Boolean(product.flashSale?.isActive);
  const discountPercent = Number(product.flashSale?.discountPercentage ?? 0);

  if (flashSaleActive && discountPercent > 0) {
    const discount = discountPercent / 100;
    const discountedPrice = Math.max(0, basePrice * (1 - discount));

    return {
      price: discountedPrice,
      oldPrice: oldPrice ?? basePrice,
    };
  }

  // Normal display (no sale)
  return { price: basePrice, oldPrice };
};
