// src/redux/slices/reportSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction, createSelector } from "@reduxjs/toolkit";
import api from "../../api/axios";
import type { RootState } from "../store";

/* ==========================
   Interfaces
========================== */
export interface Reporter {
  _id: string;
  name: string;
  email: string;
}

export interface ReportedEntity {
  _id: string;
  name?: string;
  title?: string;
}

export type ReportStatus = "Pending" | "Resolved" | "Ignored";
export type ReportType = "Spam" | "Abuse" | "Fraud" | "Other";

export interface Report {
  _id: string;
  reporter: Reporter;
  reportedEntity: ReportedEntity;
  entityType: "User" | "Product";
  type: ReportType;
  reason: string;
  status: ReportStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface ReportState {
  reports: Report[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ReportState = {
  reports: [],
  loading: false,
  error: null,
  success: false,
};

/* ==========================
   Async Thunks
========================== */

// ✅ Create a new report (authenticated user)
export const createReport = createAsyncThunk<
  Report,
  { reportedEntityId: string; entityType: "User" | "Product"; type: ReportType; reason: string },
  { rejectValue: string }
>(
  "reports/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/reports/create", {
        reportedEntityId: payload.reportedEntityId,
        entityType: payload.entityType,
        type: payload.type,
        reason: payload.reason,
      });
      return data.data as Report;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Fetch all reports (admin only)
export const fetchReports = createAsyncThunk<Report[], void, { rejectValue: string }>(
  "reports/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/reports/get");
      return data.data as Report[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Update report status (admin only)
export const updateReportStatus = createAsyncThunk<
  Report,
  { id: string; status: ReportStatus },
  { rejectValue: string }
>(
  "reports/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/reports/update/${id}/status`, { status });
      return data.data as Report;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* ==========================
   Slice
========================== */
const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    resetReports: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReport.fulfilled, (state, action: PayloadAction<Report>) => {
        state.loading = false;
        state.success = true;
        state.reports.push(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create report";
      })

      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action: PayloadAction<Report[]>) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch reports";
      })

      // Update report
      .addCase(updateReportStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateReportStatus.fulfilled, (state, action: PayloadAction<Report>) => {
        state.loading = false;
        state.success = true;
        state.reports = state.reports.map((r) =>
          r._id === action.payload._id ? action.payload : r
        );
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update report";
      });
  },
});

export const { resetReports } = reportSlice.actions;
export default reportSlice.reducer;

/* ==========================
   Selectors
========================== */
export const selectReports = (state: RootState) => state.reports.reports;
export const selectReportsLoading = (state: RootState) => state.reports.loading;
export const selectReportsError = (state: RootState) => state.reports.error;
export const selectReportsSuccess = (state: RootState) => state.reports.success;

export const selectReportsByType = (type: ReportType) =>
  createSelector([selectReports], (reports) =>
    reports.filter((r) => r.type === type)
  );

export const selectReportsByStatus = (status: ReportStatus) =>
  createSelector([selectReports], (reports) =>
    reports.filter((r) => r.status === status)
  );

export const selectReportsByEntity = (entityId: string) =>
  createSelector([selectReports], (reports) =>
    reports.filter((r) => r.reportedEntity._id === entityId)
  );
