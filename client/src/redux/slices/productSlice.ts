// src/redux/slices/productSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";

/* ======================================================
   🧩 TYPES
====================================================== */
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

export interface SupplierRef {
  _id: string;
  name?: string;
  shopName?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string | { _id: string; name: string };
  supplier?: SupplierRef | string;
  brand?: string;
  price: number;
  oldPrice?: number | null;
  stock?: number;
  images?: Image[];
  status?: "active" | "inactive" | "pending" | "draft";
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
  sku?: string;
  taxPercentage?: number;
}

export interface ProductListResponse {
  data: Product[];
  total?: number;
  page?: number;
  pages?: number;
}

export interface HomepageProducts {
  flashsales: Product[];
  bestdeals: Product[];
  newarrivals: Product[];
  toptrending: Product[];
}

/* ======================================================
   🧠 STATE
====================================================== */
interface ProductState {
  products: Product[]; // raw array from server
  filteredProducts: Product[]; // products after client side filter (search by SKU)
  product: Product | null;
  loading: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
  homepageProducts: HomepageProducts;
  searchQuery: string; // store the current SKU search
}

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  product: null,
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0,
  homepageProducts: {
    flashsales: [],
    bestdeals: [],
    newarrivals: [],
    toptrending: [],
  },
  searchQuery: "",
};

/* ======================================================
   🧰 HELPERS
====================================================== */
const toFormData = (payload: any): FormData => {
  if (payload instanceof FormData) return payload;

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      if (["sections", "variants", "shippingRegions"].includes(key)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === "images") {
        value.forEach((img) => formData.append("images", img as any));
      } else {
        // append simple arrays as JSON
        formData.append(key, JSON.stringify(value));
      }
    } else {
      formData.append(key, value as any);
    }
  });

  return formData;
};

const applySkuFilter = (products: Product[], query: string) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return products.slice();
  // Strict SKU match or contains; SKU is unique but admin may type partials.
  return products.filter((p) => (p.sku ?? "").toLowerCase().includes(q));
};

/* ======================================================
   ⚡ ASYNC THUNKS
   (all endpoints your app referenced)
====================================================== */

// Create product
export const createProduct = createAsyncThunk<Product, any, { rejectValue: string }>(
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

// Update product
export const updateProduct = createAsyncThunk<
  Product,
  { id: string; payload: any },
  { rejectValue: string }
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

// Delete product (soft-delete / deactivate)
export const deleteProduct = createAsyncThunk<
  { id: string; message: string },
  string,
  { rejectValue: string }
>("products/delete", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/products/delete/${id}`);
    // Expecting server to return { message: "..." }
    return { id, message: data.message };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch public products (with filters)
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

// Fetch admin products (admin listing)
export const fetchAdminProducts = createAsyncThunk<
  ProductListResponse,
  Record<string, any> | undefined,
  { rejectValue: string }
>("products/fetchAdmin", async (filters, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/products/admin/get", { params: filters });
    return data as ProductListResponse;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch admin products");
  }
});

// Fetch single product by id or slug
export const fetchProductById = createAsyncThunk<Product, string, { rejectValue: string }>(
  "products/fetchById",
  async (idOrSlug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/get/${idOrSlug}`);
      return data.data as Product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch homepage products
export const fetchHomepageProducts = createAsyncThunk<
  HomepageProducts,
  void,
  { rejectValue: string }
>("products/fetchHomepage", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/products/homepage");
    return data.data as HomepageProducts;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch products by category (id or slug)
export const fetchProductsByCategory = createAsyncThunk<
  ProductListResponse,
  string,
  { rejectValue: string }
>("products/fetchByCategory", async (categoryIdOrSlug, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/category/${categoryIdOrSlug}`);
    return data as ProductListResponse;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch products by category");
  }
});

/* ======================================================
   🧩 SLICE
====================================================== */
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProduct(state) {
      state.product = null;
      state.error = null;
    },
    // search by SKU (client-side)
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload ?? "";
      state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
    },
    // reset filters
    resetSearch(state) {
      state.searchQuery = "";
      state.filteredProducts = state.products.slice();
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- CREATE ---------- */
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        // reapply search filter
        state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create product";
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.products = state.products.map((p) => (p._id === updated._id ? updated : p));
        state.product = updated;
        state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update product";
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload.id);
        state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete product";
      })

      /* ---------- FETCH (Public) ---------- */
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data ?? [];
        state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
        state.total = action.payload.total ?? state.products.length;
        state.page = action.payload.page ?? 1;
        state.pages = action.payload.pages ?? 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch products";
      })

      /* ---------- FETCH (Admin) ---------- */
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data ?? [];
        state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
        state.total = action.payload.total ?? state.products.length;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch admin products";
      })

      /* ---------- FETCH (Single) ---------- */
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch product";
      })

      /* ---------- FETCH HOMEPAGE ---------- */
      .addCase(fetchHomepageProducts.fulfilled, (state, action) => {
        state.homepageProducts = action.payload;
      })
      .addCase(fetchHomepageProducts.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to fetch homepage products";
      })

      /* ---------- FETCH (Category) ---------- */
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data ?? [];
        state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
        state.total = action.payload.total ?? state.products.length;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch products by category";
      });
  },
});

/* ======================================================
   🚀 EXPORTS
====================================================== */
export const { clearProduct, setSearchQuery, resetSearch } = productSlice.actions;
export default productSlice.reducer;

/* ======================================================
   🔍 THUNKS (re-exported for convenience)
   - exported above as named consts (createAsyncThunk)
====================================================== */


/* ======================================================
   🔍 SELECTORS
====================================================== */
export const selectProducts = (state: RootState) => state.products.filteredProducts;
export const selectAllProducts = (state: RootState) => state.products.products;
export const selectProduct = (state: RootState) => state.products.product;
export const selectProductLoading = (state: RootState) => state.products.loading;
export const selectProductError = (state: RootState) => state.products.error;
export const selectHomepageProducts = (state: RootState) => state.products.homepageProducts;
export const selectSearchQuery = (state: RootState) => state.products.searchQuery;
