import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store";

// =============================
// 🌍 API Base
// =============================
const API_URL = "http://localhost:8000/api/v1/sections";

// ✅ Helper: Attach token if available
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// =============================
// 📦 Thunks
// =============================

// 1️⃣ Get all available homepage sections (metadata)
export const fetchSectionsList = createAsyncThunk(
  "sections/fetchSectionsList",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load sections list"
      );
    }
  }
);

// 2️⃣ Get products under a specific section
export const fetchSectionProducts = createAsyncThunk(
  "sections/fetchSectionProducts",
  async (
    {
      sectionName,
      limit = 10,
      sort = "latest",
    }: { sectionName: string; limit?: number; sort?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.get(
        `${API_URL}/${sectionName}?limit=${limit}&sort=${sort}`
      );
      return {
        sectionName,
        products: res.data.data,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load section products"
      );
    }
  }
);

// 3️⃣ Create a new section
export const createSection = createAsyncThunk(
  "sections/createSection",
  async ({ name }: { name: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}`,
        { name },
        { headers: getAuthHeaders() }
      );
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create section"
      );
    }
  }
);

// 3️⃣ Add a product to a section
export const addProductToSection = createAsyncThunk(
  "sections/addProductToSection",
  async (
    { sectionName, productId }: { sectionName: string; productId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post(
        `${API_URL}/${sectionName}/${productId}`,
        {},
        { headers: getAuthHeaders() }
      );
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add product to section"
      );
    }
  }
);

// 4️⃣ Remove product from a section
export const removeProductFromSection = createAsyncThunk(
  "sections/removeProductFromSection",
  async (
    { sectionName, productId }: { sectionName: string; productId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.delete(`${API_URL}/${sectionName}/${productId}`, {
        headers: getAuthHeaders(),
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove product from section"
      );
    }
  }
);

// =============================
// 🧠 State Types
// =============================
interface SectionState {
  list: { name: string; title: string }[];
  productsBySection: Record<string, any[]>;
  loading: boolean;
  error: string | null;
}

const initialState: SectionState = {
  list: [],
  productsBySection: {},
  loading: false,
  error: null,
};

// =============================
// 🪄 Slice
// =============================
const sectionSlice = createSlice({
  name: "sections",
  initialState,
  reducers: {
    clearSectionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get all sections
    builder
      .addCase(fetchSectionsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchSectionsList.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(
        fetchSectionsList.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );

    // Create new section
    builder
      .addCase(createSection.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSection.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.list.push(action.payload); // add new section to list
      })
      .addCase(createSection.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get section products
    builder
      .addCase(fetchSectionProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchSectionProducts.fulfilled,
        (
          state,
          action: PayloadAction<{ sectionName: string; products: any[] }>
        ) => {
          state.loading = false;
          state.productsBySection[action.payload.sectionName] =
            action.payload.products;
        }
      )
      .addCase(
        fetchSectionProducts.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );

    // Add to section
    builder
      .addCase(addProductToSection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(
        addProductToSection.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );

    // Remove from section
    builder
      .addCase(removeProductFromSection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(
        removeProductFromSection.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearSectionError } = sectionSlice.actions;

// =============================
// 🔍 Selectors
// =============================
export const selectSectionsList = (state: RootState) => state.sections.list;
export const selectSectionProducts = (state: RootState, name: string) =>
  state.sections.productsBySection[name] || [];
export const selectSectionsLoading = (state: RootState) =>
  state.sections.loading;
export const selectSectionsError = (state: RootState) => state.sections.error;

export default sectionSlice.reducer;
