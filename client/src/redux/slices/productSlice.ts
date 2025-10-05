import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";

/* -------------------- Types -------------------- */
export interface Image {
  url: string;
  public_id: string;
  alt?: string;
}

export interface ProductVariant {
  _id?: string;
  color?: string;
  size?: string;
  material?: string;
  price: number;
  stock: number;
  sku?: string;
  image?: string;
}

export interface FlashSale {
  isActive: boolean;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
}

export interface SEO {
  title?: string;
  description?: string;
  slug?: string;
  keywords?: string[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string | { _id: string; name: string };
  supplier: { _id: string; name?: string; shopName?: string };
  brand?: string;
  price: number;
  oldPrice?: number | null;
  stock?: number;
  images: Image[];
  status: "active" | "inactive" | "pending" | "draft";
  visibility?: "public" | "private" | "hidden";
  sections?: ("FlashSales" | "BestDeals" | "NewArrivals" | "TopTrending")[];
  flashSale?: FlashSale;
  variants?: ProductVariant[];
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  shippingRegions?: string[];
  freeShipping?: boolean;
  warranty?: string;
  seo?: SEO;
  createdAt?: string;
  updatedAt?: string;
  colors?: string[];
  taxPercentage?: number;
}

export interface ProductListResponse {
  data: Product[];
  total?: number;
  page?: number;
  pages?: number;
}

interface HomepageProducts {
  flashsales: Product[];
  bestdeals: Product[];
  newarrivals: Product[];
  toptrending: Product[];
}

/* -------------------- State -------------------- */
interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
  homepage: HomepageProducts;
}

const initialState: ProductState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0,
  homepage: {
    flashsales: [],
    bestdeals: [],
    newarrivals: [],
    toptrending: [],
  },
};

/* -------------------- Helpers -------------------- */
const toFormData = (payload: any): FormData => {
  if (payload instanceof FormData) return payload;
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (["sections", "variants", "shippingRegions"].includes(key)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === "images") {
        value.forEach((img) => formData.append("images", img as any));
      }
    } else if (value !== undefined && value !== null) {
      formData.append(key, value as any);
    }
  });
  return formData;
};

/* -------------------- Async Thunks -------------------- */

// ✅ Create Product (Supplier)
export const createProduct = createAsyncThunk<Product, any>(
  "products/create",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = toFormData(payload);
      const { data } = await api.post("/products/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data as Product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Update Product (Supplier or Admin)
export const updateProduct = createAsyncThunk<
  Product,
  { id: string; payload: any }
>("products/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const formData = toFormData(payload);
    const { data } = await api.put(`/products/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as Product;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ✅ Fetch Public Products
export const fetchProducts = createAsyncThunk<
  ProductListResponse,
  Record<string, any> | undefined,
  { rejectValue: string }
>("products/fetchAll", async (filters, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/products/get", { params: filters });
    return data as ProductListResponse;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch products");
  }
});

// ✅ Fetch Admin Products (with filters)
export const fetchAdminProducts = createAsyncThunk<
  ProductListResponse,
  Record<string, any> | undefined,
  { rejectValue: string }
>("products/fetchAdmin", async (filters, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/products/get", {
      params: { ...filters, admin: true },
    });
    return data as ProductListResponse;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch admin products");
  }
});

// ✅ Fetch Single Product
export const fetchProductById = createAsyncThunk<Product, string>(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/get/${id}`);
      return data.data as Product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Fetch Homepage Products
export const fetchHomepageProducts = createAsyncThunk<HomepageProducts>(
  "products/fetchHomepage",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/products/homepage");
      return data.data as HomepageProducts;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Delete Product
export const deleteProduct = createAsyncThunk<
  { id: string; message: string },
  string
>("products/delete", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/products/delete/${id}`);
    return { id, message: data.message };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/* -------------------- Slice -------------------- */
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProduct(state) {
      state.product = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- Create ---------- */
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ---------- Update ---------- */
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.products = state.products.map((p) =>
          p._id === updated._id ? updated : p
        );
        state.product = updated;
      })

      /* ---------- Fetch (Public) ---------- */
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.total = action.payload.total || state.products.length;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch products";
      })

      /* ---------- Fetch (Admin) ---------- */
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch admin products";
      })

      /* ---------- Single ---------- */
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.product = action.payload;
      })

      /* ---------- Homepage ---------- */
      .addCase(fetchHomepageProducts.fulfilled, (state, action) => {
        state.homepage = action.payload;
      })

      /* ---------- Delete ---------- */
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload.id);
      });
  },
});

/* -------------------- Exports -------------------- */
export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;

/* -------------------- Selectors -------------------- */
export const selectProducts = (state: RootState) => state.products.products;
export const selectProduct = (state: RootState) => state.products.product;
export const selectProductLoading = (state: RootState) => state.products.loading;
export const selectProductError = (state: RootState) => state.products.error;
export const selectHomepageProducts = (state: RootState) =>
  state.products.homepage;
