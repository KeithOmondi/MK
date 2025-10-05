// src/redux/slices/reviewSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import api from "../../api/axios";
import type { RootState } from "../store";

/* ==========================
   Interfaces
========================== */
export interface Review {
  _id: string;
  productId: string | { _id: string; name?: string };
  orderId: string;
  userId: string | { _id: string; name?: string; email?: string };
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
  success: false,
};

/* ==========================
   Async Thunks
========================== */

// ✅ Add a review
export const addReview = createAsyncThunk<
  Review,
  { productId?: string; orderId: string; rating: number; comment: string },
  { rejectValue: string }
>("reviews/add", async (payload, { rejectWithValue }) => {
  try {
    if (!payload.productId) {
      console.warn("⚠️ Missing productId in review payload:", payload);
    }

    const { data } = await api.post("/reviews/add", payload);
    console.log("✅ Review added successfully:", data);
    return data.data as Review;
  } catch (err: any) {
    console.error("❌ Add review failed:", err.response?.data || err.message);
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ✅ Get reviews by product
export const getReviewsByProduct = createAsyncThunk<Review[], string, { rejectValue: string }>(
  "reviews/getByProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
      return data.data as Review[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Get reviews by user
export const getReviewsByUser = createAsyncThunk<Review[], string, { rejectValue: string }>(
  "reviews/getByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/reviews/user/${userId}`);
      return data.data as Review[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Update review
export const updateReview = createAsyncThunk<
  Review,
  { id: string; rating?: number; comment?: string },
  { rejectValue: string }
>("reviews/update", async ({ id, rating, comment }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/reviews/update/${id}`, { rating, comment });
    return data.data as Review;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ✅ Delete review
export const deleteReview = createAsyncThunk<{ _id: string }, string, { rejectValue: string }>(
  "reviews/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/delete/${id}`);
      return { _id: id };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* ==========================
   Slice
========================== */
const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    resetReviews: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addReview.fulfilled, (state, action: PayloadAction<Review>) => {
        state.loading = false;
        state.success = true;
        state.reviews.push(action.payload);
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add review";
      })

      // Get by product
      .addCase(getReviewsByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewsByProduct.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getReviewsByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch product reviews";
      })

      // Get by user
      .addCase(getReviewsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewsByUser.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getReviewsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user reviews";
      })

      // Update
      .addCase(updateReview.fulfilled, (state, action: PayloadAction<Review>) => {
        state.reviews = state.reviews.map((r) =>
          r._id === action.payload._id ? action.payload : r
        );
      })

      // Delete
      .addCase(deleteReview.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
        state.reviews = state.reviews.filter((r) => r._id !== action.payload._id);
      });
  },
});

export const { resetReviews } = reviewSlice.actions;
export default reviewSlice.reducer;

/* ==========================
   Selectors
========================== */
export const selectReviews = (state: RootState) => state.reviews.reviews;
export const selectReviewLoading = (state: RootState) => state.reviews.loading;
export const selectReviewError = (state: RootState) => state.reviews.error;

export const selectReviewsByProduct = (productId: string) =>
  createSelector([selectReviews], (reviews) =>
    reviews.filter(
      (r) => (typeof r.productId === "string" ? r.productId : r.productId?._id) === productId
    )
  );

export const selectReviewsByUser = (userId: string) =>
  createSelector([selectReviews], (reviews) =>
    reviews.filter(
      (r) => (typeof r.userId === "string" ? r.userId : r.userId?._id) === userId
    )
  );
