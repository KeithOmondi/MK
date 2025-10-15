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
  name?: string;        // Supplier's personal name
  shopName?: string;    // Business or storefront name
  rating?: number;      // Average shop rating (0–5)
  verified?: boolean;
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
  products: Product[];
  filteredProducts: Product[];
  product: Product | null;
  homepageProducts: HomepageProducts;
  sectionProducts: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
  searchQuery: string;
  lastFetchedHomepage?: number;
  related: Product[]; // 👈 add this
  relatedLoading: boolean; // 👈 add this
  relatedError: string | null; // 👈 add this
}

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  product: null,
  homepageProducts: {
    flashsales: [],
    bestdeals: [],
    newarrivals: [],
    toptrending: [],
  },
  sectionProducts: [],
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0,
  searchQuery: "",
  lastFetchedHomepage: undefined,
  related: [],
  relatedLoading: false,
  relatedError: null,
};

/* ======================================================
   🧰 HELPERS
====================================================== */
const toFormData = (payload: any): FormData => {
  if (payload instanceof FormData) return payload;

  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      if (["sections", "variants", "shippingRegions"].includes(key)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === "images") {
        value.forEach((img) => formData.append("images", img as any));
      } else {
        formData.append(key, JSON.stringify(value));
      }
    } else {
      formData.append(key, value as any);
    }
  }
  return formData;
};

const applySkuFilter = (products: Product[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return products.slice();
  return products.filter((p) => (p.sku ?? "").toLowerCase().includes(q));
};

/* ======================================================
   ⚡ ASYNC THUNKS
====================================================== */

// ✅ Create Product
export const createProduct = createAsyncThunk<Product, any, { rejectValue: string }>(
  "products/create",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = toFormData(payload);
      const { data } = await api.post("/products/create", formData);
      return data.data as Product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Update Product
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

// ✅ Delete Product
export const deleteProduct = createAsyncThunk<
  { id: string; message: string },
  string,
  { rejectValue: string }
>("products/delete", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/products/delete/${id}`);
    return { id, message: data.message };
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

// ✅ Fetch Admin Products
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

// ✅ Fetch Supplier Products
export const fetchSupplierProducts = createAsyncThunk<Product[], void, { rejectValue: string }>(
  "products/fetchSupplierProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/products/supplier");
      console.log("✅ Supplier API raw response:", data);

      if (!data || !Array.isArray(data.data)) {
        console.error("❌ Unexpected API response:", data);
        return rejectWithValue("No products array returned from API");
      }

      console.log("✅ Products array:", data.data);
      return data.data;
    } catch (err: any) {
      console.error("❌ Fetch error:", err);
      return rejectWithValue(err.response?.data?.message || "Failed to fetch supplier products");
    }
  }
);







// ✅ Fetch Single Product
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

// ✅ Fetch Homepage Products
export const fetchHomepageProducts = createAsyncThunk<
  HomepageProducts,
  void,
  { state: RootState; rejectValue: string }
>("products/fetchHomepage", async (_, { getState, rejectWithValue }) => {
  const { products } = getState();
  const now = Date.now();

  if (products.lastFetchedHomepage && now - products.lastFetchedHomepage < 5 * 60 * 1000) {
    return products.homepageProducts;
  }

  try {
    const { data } = await api.get("/products/homepage");
    return data.data as HomepageProducts;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ✅ Fetch Products by Section
export const fetchProductsBySection = createAsyncThunk<
  Product[],
  { section: "FlashSales" | "BestDeals" | "NewArrivals" | "TopTrending"; limit?: number; sort?: string },
  { rejectValue: string }
>("products/fetchBySection", async ({ section, limit = 8, sort = "latest" }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/section/${section}`, { params: { limit, sort } });
    return data.data as Product[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch section products");
  }
});

// ✅ Fetch Products by Category
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

// ✅ Fetch related products by category (exclude current product)
export const fetchRelatedProducts = createAsyncThunk(
  "products/fetchRelatedProducts",
  async (
    {
      categoryId,
      excludeId,
      limit = 6,
    }: { categoryId: string; excludeId: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/products/related", {
        params: { category: categoryId, exclude: excludeId, limit },
      });
      return data.products;
    } catch (err: any) {
      console.error("❌ Error fetching related products:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch related products"
      );
    }
  }
);

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
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload ?? "";
      state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
    },
    resetSearch(state) {
      state.searchQuery = "";
      state.filteredProducts = state.products.slice();
    },
    resetProducts(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      /* CREATE / UPDATE / DELETE */
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create product";
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.products = state.products.map((p) => (p._id === updated._id ? updated : p));
        state.product = updated;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload.id);
      });

    /* FETCH HOMEPAGE */
    builder
      .addCase(fetchHomepageProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHomepageProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.homepageProducts = action.payload;
        state.lastFetchedHomepage = Date.now();
      })
      .addCase(fetchHomepageProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch homepage products";
      });

    /* FETCH SINGLE PRODUCT */
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.product = null;
        state.error = action.payload ?? "Failed to fetch product by ID";
      });

    /* FETCH SECTION */
    builder
      .addCase(fetchProductsBySection.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsBySection.fulfilled, (state, action) => {
        state.loading = false;
        state.sectionProducts = action.payload;
      })
      .addCase(fetchProductsBySection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch section products";
      });

    /* FETCH ADMIN PRODUCTS */
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || [];
        state.filteredProducts = applySkuFilter(state.products, state.searchQuery);
        state.page = action.payload.page ?? 1;
        state.pages = action.payload.pages ?? 1;
        state.total = action.payload.total ?? state.products.length;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch admin products";
      });

    /* FETCH SUPPLIER PRODUCTS */
    builder
      .addCase(fetchSupplierProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
      })
      .addCase(fetchSupplierProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch supplier products";
      });

      //Related products
      builder
  .addCase(fetchRelatedProducts.pending, (state) => {
    state.relatedLoading = true;
    state.relatedError = null;
  })
  .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
    state.relatedLoading = false;
    state.related = action.payload;
  })
  .addCase(fetchRelatedProducts.rejected, (state, action) => {
    state.relatedLoading = false;
    state.relatedError =
      (action.payload as string) || "Failed to load related products";
  });
  },
});

/* ======================================================
   🚀 EXPORTS
====================================================== */
export const { clearProduct, setSearchQuery, resetSearch, resetProducts } = productSlice.actions;
export default productSlice.reducer;

/* ======================================================
   🔍 SELECTORS
====================================================== */
export const selectProducts = (state: RootState) => state.products.filteredProducts;
export const selectAllProducts = (state: RootState) => state.products.products;
export const selectProduct = (state: RootState) => state.products.product;
export const selectProductLoading = (state: RootState) => state.products.loading;
export const selectProductError = (state: RootState) => state.products.error;
export const selectHomepageProducts = (state: RootState) => state.products.homepageProducts;
export const selectSectionProducts = (state: RootState) => state.products.sectionProducts;
export const selectSearchQuery = (state: RootState) => state.products.searchQuery;
export const selectRelatedProducts = (state: RootState) => state.products.related;
export const selectRelatedLoading = (state: RootState) => state.products.relatedLoading;
export const selectRelatedError = (state: RootState) => state.products.relatedError;

