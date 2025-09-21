// src/redux/slices/categorySlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";



// ==========================
// Types
// ==========================
export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: Category | null;
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
// Thunks
// ==========================
export const createCategory = createAsyncThunk(
  "categories/create",
  async (
    { name, parentCategory }: { name: string; parentCategory?: string | null },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/category/create", { name, parentCategory });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/category/get");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/category/get/${id}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    { id, name, parentCategory }: { id: string; name?: string; parentCategory?: string | null },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/category/update/${id}`, { name, parentCategory });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/category/delete/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

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
      // Create
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.success = true;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch all
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.category = action.payload;
      })

      // Update
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories = state.categories.map((cat) =>
          cat._id === action.payload._id ? action.payload : cat
        );
        if (state.category?._id === action.payload._id) {
          state.category = action.payload;
        }
      })

      // Delete
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
export const selectCategories = (state: RootState) => state.categories.categories;
export const selectCategory = (state: RootState) => state.categories.category;
export const selectCategoryLoading = (state: RootState) => state.categories.loading;
export const selectCategoryError = (state: RootState) => state.categories.error;
