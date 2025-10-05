// src/redux/slices/offersSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchOffers = createAsyncThunk("offers/fetchAll", async () => {
  const { data } = await api.get("/offers/get");
  return data;
});

const offersSlice = createSlice({
  name: "offers",
  initialState: {
    coupons: [] as any[],
    rewards: { points: 0, history: [] as any[] },
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons;
        state.rewards = action.payload.rewards;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch offers";
      });
  },
});

export default offersSlice.reducer;
