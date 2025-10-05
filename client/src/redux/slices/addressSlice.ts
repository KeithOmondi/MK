// src/redux/slices/addressSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios"; // adjust path if different

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
};

// Fetch all addresses
export const fetchAddresses = createAsyncThunk(
  "addresses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("addresses/get");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Add new address
export const addAddress = createAsyncThunk(
  "addresses/add",
  async (address: Address, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/addresses/add", address);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update existing address
export const updateAddress = createAsyncThunk(
  "addresses/update",
  async ({ id, ...address }: { id: string } & Address, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/addresses/update/${id}`, address);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete address
export const deleteAddress = createAsyncThunk(
  "addresses/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/addresses/delete/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // add
      .addCase(addAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        state.addresses.push(action.payload);
      })
      // update
      .addCase(updateAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        const idx = state.addresses.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.addresses[idx] = action.payload;
      })
      // delete
      .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<string>) => {
        state.addresses = state.addresses.filter((a) => a._id !== action.payload);
      });
  },
});

export default addressSlice.reducer;
