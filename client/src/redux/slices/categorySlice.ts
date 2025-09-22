// src/redux/slices/categorySlice.ts
import {
  createSlice,
  createAsyncThunk,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";

// ==========================
// Types
// ==========================
export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: string | Category | null;
  icon?: string;
}

export interface CategoryState {
  categories: Category[];
  category: Category | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// ==========================
// Initial State
// ==========================
const initialState: CategoryState = {
  categories: [],
  category: null,
  loading: false,
  error: null,
  success: false,
};

// ==========================
// Helpers to normalize responses
// ==========================
const extractArray = (payload: any): Category[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.categories)) return payload.categories;
  // also support nested payload.data.data if needed
  if (Array.isArray(payload.data?.data)) return payload.data.data;
  return [];
};

const extractCategory = (payload: any): Category | null => {
  if (!payload) return null;
  if (typeof payload === "object" && payload._id) return payload as Category;
  // sometimes nested: { data: { ... } }
  if (payload.data && payload.data._id) return payload.data as Category;
  if (payload.category && payload.category._id) return payload.category as Category;
  return null;
};

// ==========================
// Thunks
// ==========================
export const createCategory = createAsyncThunk<
  Category | null,
  { name: string; parentCategory?: string | null },
  { rejectValue: string }
>("categories/create", async ({ name, parentCategory }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/category/create", { name, parentCategory });
    // normalize to Category
    return extractCategory(data);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/category/get");
    return extractArray(data);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchCategoryById = createAsyncThunk<
  Category | null,
  string,
  { rejectValue: string }
>("categories/fetchById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/category/get/${id}`);
    return extractCategory(data);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCategory = createAsyncThunk<
  Category | null,
  { id: string; name?: string; parentCategory?: string | null },
  { rejectValue: string }
>("categories/update", async ({ id, name, parentCategory }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/category/update/${id}`, { name, parentCategory });
    return extractCategory(data);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("categories/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/category/delete/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ==========================
// Slice
// ==========================
const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    resetCategoryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // create
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category | null>) => {
        state.loading = false;
        state.success = true;
        if (action.payload) state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create category";
      })

      // fetch all
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch categories";
      })

      // fetch by id
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category | null>) => {
        state.category = action.payload;
      })

      // update
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category | null>) => {
        const updated = action.payload;
        if (!updated) return;
        state.categories = state.categories.map((cat) =>
          cat._id === updated._id ? updated : cat
        );
        if (state.category?._id === updated._id) state.category = updated;
      })

      // delete
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      });
  },
});

export const { resetCategoryState } = categorySlice.actions;
export default categorySlice.reducer;

// ==========================
// Selectors
// ==========================
export const selectCategories = (state: RootState): Category[] =>
  Array.isArray(state.categories.categories) ? state.categories.categories : [];

export const selectCategory = (state: RootState): Category | null => state.categories.category;
export const selectCategoryLoading = (state: RootState): boolean => state.categories.loading;
export const selectCategoryError = (state: RootState): string | null => state.categories.error;

// memoized nested category tree (safe: always returns array)
export const selectCategoryTree = createSelector([selectCategories], (categories) => {
  if (!Array.isArray(categories)) return [];

  const map: Record<string, Category & { subcategories: Category[] }> = {};
  categories.forEach((cat) => {
    map[cat._id] = { ...cat, subcategories: [] };
  });

  const tree: (Category & { subcategories: Category[] })[] = [];

  categories.forEach((cat) => {
    if (cat.parentCategory) {
      const parentId =
        typeof cat.parentCategory === "string"
          ? cat.parentCategory
          : (cat.parentCategory as Category)?._id;

      if (parentId && map[parentId]) {
        map[parentId].subcategories.push(map[cat._id]);
      }
    } else {
      tree.push(map[cat._id]);
    }
  });

  return tree;
});
