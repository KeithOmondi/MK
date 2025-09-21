// src/redux/slices/productSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";

// ==========================
// Types
// ==========================
export interface Image {
  url: string;
  public_id: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface Logistics {
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingMethods?: string[];
  handlingTime?: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string | Category; // or Category type if populated
  price: number;
  stock: number | null;
  images: {
    url: string;
    public_id: string;
  }[];
  supplier: string; // or Supplier type if populated
  ratings: {
    userId: string;
    rating: number;
    review?: string;
    createdAt: string;
  }[];
  status: "active" | "inactive" | "draft";

  // 🔥 Promotions
  isFlashSale: boolean;
  flashSaleEndDate?: string;
  isDealOfWeek: boolean;
  dealEndDate?: string;
  isNewArrival: boolean;
  newArrivalExpiry?: string;

  // 🚚 Logistics fields
  warehouseLocation?: {
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  shippingProvider?: string;
  deliveryTime?: string;
  returnPolicy?: string;

  createdAt: string;
  updatedAt: string;
}



export interface ProductListResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

interface ProductState {
  products: Product[];
  product?: Product | null;
  loading: boolean;
  error?: string | null;
  pages: number;
  page: number;
  total: number;
  homepage: {
    flashSales: Product[];
    deals: Product[];
    newArrivals: Product[];
  };
}

// ==========================
// Initial State
// ==========================
const initialState: ProductState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  pages: 1,
  page: 1,
  total: 0,
  homepage: {
    flashSales: [],
    deals: [],
    newArrivals: [],
  },
};

// ==========================
// Async Thunks
// ==========================

// Create Product (Admin/Supplier)
export const createProduct = createAsyncThunk<Product, FormData>(
  "products/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/products/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch all products (filters & pagination)
export const fetchProducts = createAsyncThunk<
  ProductListResponse,
  { page?: number; limit?: number; keyword?: string; category?: string; minPrice?: number; maxPrice?: number; sortBy?: string }
>("products/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/get`, { params });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch homepage products (FlashSales, Deals, New Arrivals)
export const fetchHomepageProducts = createAsyncThunk<
  { flashSales: Product[]; deals: Product[]; newArrivals: Product[] }
>("products/fetchHomepage", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/homepage`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch single product
export const fetchProductById = createAsyncThunk<Product, string>(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/get/${id}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk<Product, { id: string; formData: FormData }>(
  "products/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/products/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk<{ message: string; id: string }, string>(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/products/delete/${id}`);
      return { ...data, id };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete single image
export const deleteProductImage = createAsyncThunk<Product, { productId: string; publicId: string }>(
  "products/deleteImage",
  async ({ productId, publicId }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/products/delete/${productId}/images/${publicId}`);
      return data.product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ==========================
// Slice
// ==========================
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<ProductListResponse>) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Homepage Products
      .addCase(fetchHomepageProducts.fulfilled, (state, action) => {
        state.homepage = action.payload;
      })

      // Fetch Product By Id
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Product
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        state.product = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload.id);
      })

      // Delete Product Image
      .addCase(deleteProductImage.fulfilled, (state, action: PayloadAction<Product>) => {
        state.product = action.payload;
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;

// ==========================
// Selectors
// ==========================
export const selectProducts = (state: RootState) => state.products.products;
export const selectProduct = (state: RootState) => state.products.product;
export const selectProductLoading = (state: RootState) => state.products.loading;
export const selectProductError = (state: RootState) => state.products.error;
export const selectHomepageProducts = (state: RootState) => state.products.homepage;
