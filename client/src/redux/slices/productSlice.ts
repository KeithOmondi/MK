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
  slug?: string;
  parentCategory?: string | null;
}

export interface Rating {
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: Category;

  price: number;
  oldPrice?: number | null;
  stock: number | null;
  brand?: string;
  tags?: string[];
  status: "active" | "inactive" | "draft";

  color?: string;
  size?: string;
  material?: string;

  warranty?: string;
  modelNumber?: string;
  sku?: string;

  images: Image[];

  supplier: string;
  ratings: Rating[];

  isFlashSale: boolean;
  flashSaleEndDate?: string;
  isDealOfWeek: boolean;
  dealEndDate?: string;
  isNewArrival: boolean;
  newArrivalExpiry?: string;

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
    topTrending: Product[];
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
    topTrending: [],
  },
};

// ==========================
// Helpers
// ==========================
const toFormData = (payload: any): FormData => {
  if (payload instanceof FormData) return payload;
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v as any));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value as any);
    }
  });
  return formData;
};

// Utility to sync a product into homepage sections
const syncHomepageSections = (homepage: ProductState["homepage"], product: Product) => {
  // Remove product from all sections first
  homepage.flashSales = homepage.flashSales.filter((p) => p._id !== product._id);
  homepage.deals = homepage.deals.filter((p) => p._id !== product._id);
  homepage.newArrivals = homepage.newArrivals.filter((p) => p._id !== product._id);
  homepage.topTrending = homepage.topTrending.filter((p) => p._id !== product._id);

  // Re-add if flags are set
  if (product.isFlashSale) homepage.flashSales.push(product);
  if (product.isDealOfWeek) homepage.deals.push(product);
  if (product.isNewArrival) homepage.newArrivals.push(product);

  // Always in trending
  homepage.topTrending.unshift(product);
};

// ==========================
// Async Thunks
// ==========================
export const createProduct = createAsyncThunk<Product, any>(
  "products/create",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = toFormData(payload);
      const { data } = await api.post(`/products/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data as Product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchProducts = createAsyncThunk<
  ProductListResponse,
  {
    page?: number;
    limit?: number;
    keyword?: string;
    category?: string;
    parentSlug?: string;
    childSlug?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    brand?: string;
    color?: string;
    size?: string;
    material?: string;
  } | void
>("products/fetchProducts", async (params, thunkAPI) => {
  try {
    const { data } = await api.get("/products/get", { params });
    return data as ProductListResponse;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchProductsByCategory = createAsyncThunk<
  ProductListResponse,
  { parentSlug: string; childSlug?: string; page?: number; limit?: number }
>("products/fetchByCategory", async ({ parentSlug, childSlug, page, limit }, { rejectWithValue }) => {
  try {
    const url = childSlug
      ? `/products/category/${parentSlug}/${childSlug}`
      : `/products/category/${parentSlug}`;
    const { data } = await api.get(url, { params: { page, limit } });
    return data as ProductListResponse;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchHomepageProducts = createAsyncThunk<
  { flashSales: Product[]; deals: Product[]; newArrivals: Product[]; topTrending: Product[] }
>("products/fetchHomepage", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/homepage`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchProductById = createAsyncThunk<Product, string>(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/get/${id}`);
      return data as Product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProduct = createAsyncThunk<Product, { id: string; payload: any }>(
  "products/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const formData = toFormData(payload);
      const { data } = await api.put(`/products/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data as Product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

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

export const deleteProductImage = createAsyncThunk<Product, { productId: string; publicId: string }>(
  "products/deleteImage",
  async ({ productId, publicId }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/products/delete/${productId}/images/${publicId}`);
      return data.product as Product;
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
      // Create
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        const newProduct = action.payload;
        state.products.push(newProduct);
        syncHomepageSections(state.homepage, newProduct);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch All
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<ProductListResponse>) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })

      // Fetch By Category
      .addCase(fetchProductsByCategory.fulfilled, (state, action: PayloadAction<ProductListResponse>) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })

      // Homepage
      .addCase(fetchHomepageProducts.fulfilled, (state, action) => {
        state.homepage = action.payload;
      })

      // Single
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.product = action.payload;
      })

      // Update
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        const updated = action.payload;

        // Update in list
        state.products = state.products.map((p) => (p._id === updated._id ? updated : p));

        // Update current
        state.product = updated;

        // Sync homepage sections with new flags
        syncHomepageSections(state.homepage, updated);
      })

      // Delete
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload.id);
        state.homepage.flashSales = state.homepage.flashSales.filter((p) => p._id !== action.payload.id);
        state.homepage.deals = state.homepage.deals.filter((p) => p._id !== action.payload.id);
        state.homepage.newArrivals = state.homepage.newArrivals.filter((p) => p._id !== action.payload.id);
        state.homepage.topTrending = state.homepage.topTrending.filter((p) => p._id !== action.payload.id);
      })

      // Delete Image
      .addCase(deleteProductImage.fulfilled, (state, action: PayloadAction<Product>) => {
        state.product = action.payload;
        state.products = state.products.map((p) => (p._id === action.payload._id ? action.payload : p));
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
