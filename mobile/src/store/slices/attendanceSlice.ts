import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../../services/attendanceService';
import {
  AttendanceRecord,
  AttendanceParams,
  AttendanceSummary,
  ClassAttendanceSummaryItem,
  MarkAttendancePayload,
} from '../../types/attendance';

interface AttendanceState {
  classRecords: AttendanceRecord[];
  historyRecords: AttendanceRecord[];
  myRecords: AttendanceRecord[];
  myPercentage: number;
  summary: AttendanceSummary | null;
  classReport: ClassAttendanceSummaryItem[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  pagination: { total: number; page: number; limit: number; totalPages: number } | null;
}

const initialState: AttendanceState = {
  classRecords: [],
  historyRecords: [],
  myRecords: [],
  myPercentage: 0,
  summary: null,
  classReport: [],
  loading: false,
  submitting: false,
  error: null,
  pagination: null,
};

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (payload: MarkAttendancePayload, { rejectWithValue }) => {
    try {
      await attendanceService.markAttendance(payload);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchClassAttendance = createAsyncThunk(
  'attendance/fetchClass',
  async (params: AttendanceParams, { rejectWithValue }) => {
    try {
      const { data } = await attendanceService.getClassAttendance(params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchAttendanceHistory = createAsyncThunk(
  'attendance/fetchHistory',
  async (params: AttendanceParams, { rejectWithValue }) => {
    try {
      const { data } = await attendanceService.getAttendanceHistory(params);
      return { records: data.data, pagination: (data as any).pagination };
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const updateAttendanceRecord = createAsyncThunk(
  'attendance/update',
  async ({ id, data }: { id: string; data: Partial<AttendanceRecord> }, { rejectWithValue }) => {
    try {
      const res = await attendanceService.updateAttendance(id, data);
      return res.data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchMyAttendance = createAsyncThunk(
  'attendance/fetchMine',
  async (params: AttendanceParams | undefined, { rejectWithValue }) => {
    try {
      const { data } = await attendanceService.getMyAttendance(params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchMyAttendanceSummary = createAsyncThunk(
  'attendance/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await attendanceService.getMyAttendanceSummary();
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchChildAttendance = createAsyncThunk(
  'attendance/fetchChild',
  async ({ studentId, params }: { studentId: string; params?: AttendanceParams }, { rejectWithValue }) => {
    try {
      const { data } = await attendanceService.getChildAttendance(studentId, params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchClassReport = createAsyncThunk(
  'attendance/fetchClassReport',
  async (params: AttendanceParams, { rejectWithValue }) => {
    try {
      const { data } = await attendanceService.getClassReport(params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError(state) { state.error = null; },
    clearClassRecords(state) { state.classRecords = []; },
  },
  extraReducers: (builder) => {
    const pending = (state: AttendanceState) => { state.loading = true; state.error = null; };
    const rejected = (state: AttendanceState, action: { payload: unknown }) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(markAttendance.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(markAttendance.fulfilled, (state) => { state.submitting = false; })
      .addCase(markAttendance.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(fetchClassAttendance.pending, pending)
      .addCase(fetchClassAttendance.fulfilled, (state, action) => { state.loading = false; state.classRecords = action.payload; })
      .addCase(fetchClassAttendance.rejected, rejected);

    builder
      .addCase(fetchAttendanceHistory.pending, pending)
      .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.historyRecords = action.payload.records;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAttendanceHistory.rejected, rejected);

    builder
      .addCase(updateAttendanceRecord.pending, (state) => { state.submitting = true; })
      .addCase(updateAttendanceRecord.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.classRecords.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.classRecords[idx] = action.payload;
        const idx2 = state.historyRecords.findIndex((r) => r._id === action.payload._id);
        if (idx2 !== -1) state.historyRecords[idx2] = action.payload;
      })
      .addCase(updateAttendanceRecord.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(fetchMyAttendance.pending, pending)
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.myRecords = action.payload.records;
        state.myPercentage = action.payload.percentage;
      })
      .addCase(fetchMyAttendance.rejected, rejected);

    builder
      .addCase(fetchMyAttendanceSummary.pending, pending)
      .addCase(fetchMyAttendanceSummary.fulfilled, (state, action) => { state.loading = false; state.summary = action.payload; })
      .addCase(fetchMyAttendanceSummary.rejected, rejected);

    builder
      .addCase(fetchChildAttendance.pending, pending)
      .addCase(fetchChildAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.myRecords = action.payload.records;
        state.myPercentage = action.payload.percentage;
      })
      .addCase(fetchChildAttendance.rejected, rejected);

    builder
      .addCase(fetchClassReport.pending, pending)
      .addCase(fetchClassReport.fulfilled, (state, action) => { state.loading = false; state.classReport = action.payload; })
      .addCase(fetchClassReport.rejected, rejected);
  },
});

export const { clearAttendanceError, clearClassRecords } = attendanceSlice.actions;
export default attendanceSlice.reducer;
