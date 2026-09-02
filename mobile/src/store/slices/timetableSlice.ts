import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TimetableEntry, TimetableFormData, TimetableParams } from '../../types/timetable';
import { timetableService } from '../../services/timetableService';

interface TimetableState {
  entries: TimetableEntry[];
  myEntries: TimetableEntry[]; // teacher / student / parent child view
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: TimetableState = {
  entries: [],
  myEntries: [],
  loading: false,
  submitting: false,
  error: null,
};

export const fetchTimetable = createAsyncThunk(
  'timetable/fetchAll',
  async (params: TimetableParams | undefined, { rejectWithValue }) => {
    try {
      const { data } = await timetableService.getTimetable(params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchMyTimetableTeacher = createAsyncThunk(
  'timetable/fetchMyTeacher',
  async (params: { academicYear?: string; dayOfWeek?: string } | undefined, { rejectWithValue }) => {
    try {
      const { data } = await timetableService.getMyTimetableTeacher(params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchMyTimetableStudent = createAsyncThunk(
  'timetable/fetchMyStudent',
  async (params: { dayOfWeek?: string } | undefined, { rejectWithValue }) => {
    try {
      const { data } = await timetableService.getMyTimetableStudent(params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchChildTimetable = createAsyncThunk(
  'timetable/fetchChild',
  async ({ studentId, params }: { studentId: string; params?: { dayOfWeek?: string } }, { rejectWithValue }) => {
    try {
      const { data } = await timetableService.getChildTimetable(studentId, params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const createTimetableEntry = createAsyncThunk(
  'timetable/create',
  async (formData: TimetableFormData, { rejectWithValue }) => {
    try {
      const { data } = await timetableService.createEntry(formData);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const deleteTimetableEntry = createAsyncThunk(
  'timetable/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await timetableService.deleteEntry(id);
      return id;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {
    clearTimetableError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimetable.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTimetable.fulfilled, (state, action) => { state.loading = false; state.entries = action.payload; })
      .addCase(fetchTimetable.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    const myFulfilled = (state: TimetableState, action: { payload: TimetableEntry[] }) => {
      state.loading = false;
      state.myEntries = action.payload;
    };
    const myPending = (state: TimetableState) => { state.loading = true; state.error = null; };
    const myRejected = (state: TimetableState, action: { payload: unknown }) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(fetchMyTimetableTeacher.pending, myPending)
      .addCase(fetchMyTimetableTeacher.fulfilled, myFulfilled)
      .addCase(fetchMyTimetableTeacher.rejected, myRejected);

    builder
      .addCase(fetchMyTimetableStudent.pending, myPending)
      .addCase(fetchMyTimetableStudent.fulfilled, myFulfilled)
      .addCase(fetchMyTimetableStudent.rejected, myRejected);

    builder
      .addCase(fetchChildTimetable.pending, myPending)
      .addCase(fetchChildTimetable.fulfilled, myFulfilled)
      .addCase(fetchChildTimetable.rejected, myRejected);

    builder
      .addCase(createTimetableEntry.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(createTimetableEntry.fulfilled, (state, action) => {
        state.submitting = false;
        state.entries.push(action.payload);
      })
      .addCase(createTimetableEntry.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(deleteTimetableEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter((e) => e._id !== action.payload);
      });
  },
});

export const { clearTimetableError } = timetableSlice.actions;
export default timetableSlice.reducer;
