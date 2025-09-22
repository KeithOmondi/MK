// src/types.ts
export interface Product {
  _id: string;
  name: string;
  price: number;
  images?: { url: string }[];
  brand?: string;
  stock?: number | null; // <-- allow null to match slice
}
