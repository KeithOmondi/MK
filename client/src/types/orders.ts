// src/types/order.ts
export interface OrderDeliveryDetails {
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
}

export interface OrderPayload {
  items: { productId: string; quantity: number }[];
  deliveryDetails: {
    country: string;
    state: string;
    city: string;
    address: string;
    phone: string;
  };
  shippingCost: number;
  coupon?: string | null;
  paymentMethod: "cod" | "mpesa";
}

