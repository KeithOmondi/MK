// src/redux/slices/supplierSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";

// =========================
// Types
// =========================
export interface SupplierUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface SupplierDocument {
  url: string;
  publicId: string;
}

export interface Supplier {
  _id: string;
  user: SupplierUser;
  fullName: string;
  phoneNumber: string;
  address: string;
  idNumber: string;
  taxNumber?: string;
  shopName: string;
  businessType: "wholesaler" | "retailer" | "manufacturer";
  website?: string;
  idDocument?: SupplierDocument;
  businessLicense?: SupplierDocument;
  status: "Pending" | "Approved" | "Rejected";
  verified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SupplierState {
  suppliers: Supplier[];
  supplier: Supplier | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: SupplierState = {
  suppliers: [],
  supplier: null,
  loading: false,
  error: null,
  success: null,
};

// =========================
// Async Thunks
// =========================

// Register Supplier
export const registerSupplier = createAsyncThunk<Supplier, FormData>(
  "suppliers/register",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/suppliers/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data as Supplier;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch All Suppliers
export const fetchSuppliers = createAsyncThunk<Supplier[]>(
  "suppliers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/suppliers/get`);
      return data.data as Supplier[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch Supplier by ID
export const fetchSupplierById = createAsyncThunk<Supplier, string>(
  "suppliers/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/suppliers/get/${id}`);
      return data.data as Supplier;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update Supplier
export const updateSupplier = createAsyncThunk<
  Supplier,
  { id: string; formData: FormData }
>("suppliers/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/suppliers/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as Supplier;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete Supplier
export const deleteSupplier = createAsyncThunk<string, string>(
  "suppliers/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/suppliers/delete/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// =========================
// Slice
// =========================
const supplierSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerSupplier.pending, (state) => { state.loading = true; })
      .addCase(registerSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.loading = false;
        state.success = "Supplier registered successfully!";
        state.suppliers.push(action.payload);
      })
      .addCase(registerSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch All
      .addCase(fetchSuppliers.pending, (state) => { state.loading = true; })
      .addCase(fetchSuppliers.fulfilled, (state, action: PayloadAction<Supplier[]>) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch By ID
      .addCase(fetchSupplierById.pending, (state) => { state.loading = true; })
      .addCase(fetchSupplierById.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.loading = false;
        state.supplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Supplier
      .addCase(updateSupplier.pending, (state) => { state.loading = true; })
      .addCase(updateSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.loading = false;
        state.success = "Supplier updated successfully!";
        state.suppliers = state.suppliers.map((s) => s._id === action.payload._id ? action.payload : s);
        if (state.supplier?._id === action.payload._id) state.supplier = action.payload;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Supplier
      .addCase(deleteSupplier.pending, (state) => { state.loading = true; })
      .addCase(deleteSupplier.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.success = "Supplier deleted successfully!";
        state.suppliers = state.suppliers.filter((s) => s._id !== action.payload);
        if (state.supplier?._id === action.payload) state.supplier = null;
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages } = supplierSlice.actions;

// =========================
// Selectors
// =========================
export const selectSuppliers = (state: RootState) => state.suppliers.suppliers;
export const selectSupplier = (state: RootState) => state.suppliers.supplier;
export const selectSupplierLoading = (state: RootState) => state.suppliers.loading;
export const selectSupplierError = (state: RootState) => state.suppliers.error;
export const selectSupplierSuccess = (state: RootState) => state.suppliers.success;

export default supplierSlice.reducer;
