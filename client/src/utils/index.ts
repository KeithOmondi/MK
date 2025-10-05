import type { ProductVariant } from "../redux/slices/productSlice";

export interface Product {
  _id: string;
  name: string;
  description?: string;
  category?: string | { _id: string; name: string };
  brand?: string;
  price: number;
  stock?: number;
  images?: { url: string; public_id?: string }[];
  variants?: ProductVariant[];

  // ✅ Add these two optional fields:
  oldPrice?: number;
  flashSale?: {
    isActive: boolean;
    discountPercentage?: number;
    startDate?: string;
    endDate?: string;
  };

  // ✅ Optional timestamps if your backend returns them:
  createdAt?: string;
  updatedAt?: string;
}
