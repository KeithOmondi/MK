import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";
import type { RootState } from "../store";

/* ===========================
   TYPES
=========================== */
export interface Dispute {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  orderId: string | { _id: string; orderNumber: string; totalAmount: number };
  seller: string | { _id: string; name: string; email: string };
  product?: string | { _id: string; name: string };
  type: "Product Issue" | "Late Delivery" | "Wrong Item" | "Refund" | "Other";
  reason: string;
  status: "Pending" | "In Review" | "Resolved" | "Escalated" | "Closed";
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}


interface DisputeState {
  disputes: Dispute[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

/* ===========================
   INITIAL STATE
=========================== */
const initialState: DisputeState = {
  disputes: [],
  loading: false,
  error: null,
  successMessage: null,
};

/* ===========================
   ASYNC THUNKS (API CALLS)
=========================== */

// Create a new dispute (User)
export const createDispute = createAsyncThunk(
  "disputes/createDispute",
  async (payload: { order: string; reason: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/disputes/create", payload, { withCredentials: true });
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create dispute.");
    }
  }
);

// Fetch user’s disputes
export const fetchUserDisputes = createAsyncThunk(
  "disputes/fetchUserDisputes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/disputes/my-disputes", { withCredentials: true });
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch your disputes.");
    }
  }
);

// Fetch all disputes (Admin)
export const fetchAllDisputes = createAsyncThunk(
  "disputes/fetchAllDisputes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/disputes/get", { withCredentials: true });
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch disputes.");
    }
  }
);

// Update dispute status (Admin)
export const updateDisputeStatus = createAsyncThunk(
  "disputes/updateDisputeStatus",
  async (
    { id, status }: { id: string; status: "Resolved" | "Rejected" },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(
        `/disputes/update/${id}/status`,
        { status },
        { withCredentials: true }
      );
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update dispute status.");
    }
  }
);

// Delete a dispute (Admin)
export const deleteDispute = createAsyncThunk(
  "disputes/deleteDispute",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/disputes/delete/${id}`, { withCredentials: true });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete dispute.");
    }
  }
);

/* ===========================
   SLICE
=========================== */
const disputesSlice = createSlice({
  name: "disputes",
  initialState,
  reducers: {
    clearDisputeMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createDispute.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDispute.fulfilled, (state, action: PayloadAction<Dispute>) => {
        state.loading = false;
        state.disputes.push(action.payload);
        state.successMessage = "Dispute created successfully.";
      })
      .addCase(createDispute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch user disputes
      .addCase(fetchUserDisputes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDisputes.fulfilled, (state, action: PayloadAction<Dispute[]>) => {
        state.loading = false;
        state.disputes = action.payload;
      })
      .addCase(fetchUserDisputes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch all disputes (admin)
      .addCase(fetchAllDisputes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllDisputes.fulfilled, (state, action: PayloadAction<Dispute[]>) => {
        state.loading = false;
        state.disputes = action.payload;
      })
      .addCase(fetchAllDisputes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update status
      .addCase(updateDisputeStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDisputeStatus.fulfilled, (state, action: PayloadAction<Dispute>) => {
        state.loading = false;
        const index = state.disputes.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) state.disputes[index] = action.payload;
        state.successMessage = "Dispute status updated.";
      })
      .addCase(updateDisputeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteDispute.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDispute.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.disputes = state.disputes.filter((d) => d._id !== action.payload);
        state.successMessage = "Dispute deleted successfully.";
      })
      .addCase(deleteDispute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDisputeMessages } = disputesSlice.actions;
export const selectDisputes = (state: RootState) => state.disputes;
export default disputesSlice.reducer;
