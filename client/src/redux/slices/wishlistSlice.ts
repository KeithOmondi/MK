// src/redux/slices/wishlistSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

/**
 * ------------------------
 * TYPES
 * ------------------------
 */
export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

/**
 * ------------------------
 * HELPERS
 * ------------------------
 */
const loadWishlistFromStorage = (): WishlistItem[] => {
  try {
    const data = localStorage.getItem("wishlist");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveWishlistToStorage = (items: WishlistItem[]) => {
  try {
    localStorage.setItem("wishlist", JSON.stringify(items));
  } catch {
    // ignore write errors
  }
};

/**
 * ------------------------
 * INITIAL STATE
 * ------------------------
 */
const initialState: WishlistState = {
  items: loadWishlistFromStorage(),
  loading: false,
  error: null,
};

/**
 * ------------------------
 * ASYNC ACTIONS (optional API persistence)
 * ------------------------
 */

// Example: Sync wishlist with server (optional)
export const syncWishlist = createAsyncThunk<
  WishlistItem[],
  void,
  { rejectValue: string }
>("wishlist/syncWishlist", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/v1/wishlist");
    if (!response.ok) throw new Error("Failed to fetch wishlist");
    const data = await response.json();
    return data.items as WishlistItem[];
  } catch (err: any) {
    return rejectWithValue(err.message || "Sync failed");
  }
});

/**
 * ------------------------
 * SLICE
 * ------------------------
 */
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (!exists) {
        state.items.push(action.payload);
        saveWishlistToStorage(state.items);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
      saveWishlistToStorage(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveWishlistToStorage([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        saveWishlistToStorage(state.items);
      })
      .addCase(syncWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to sync wishlist";
      });
  },
});

/**
 * ------------------------
 * SELECTORS
 * ------------------------
 */
export const selectWishlistItems = (state: RootState) => state.wishlist.items;

export const selectWishlistCount = (state: RootState) =>
  state.wishlist.items.length;

export const selectIsInWishlist =
  (productId: string) => (state: RootState) =>
    state.wishlist.items.some((item) => item.productId === productId);

export const selectWishlistLoading = (state: RootState) =>
  state.wishlist.loading;

export const selectWishlistError = (state: RootState) => state.wishlist.error;

/**
 * ------------------------
 * EXPORTS
 * ------------------------
 */
export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
