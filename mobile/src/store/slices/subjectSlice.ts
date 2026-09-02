import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Subject, SubjectFormData, SubjectsListParams } from '../../types/timetable';
import { subjectService } from '../../services/subjectService';

interface SubjectState {
  subjects: Subject[];
  selectedSubject: Subject | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: SubjectState = {
  subjects: [],
  selectedSubject: null,
  loading: false,
  submitting: false,
  error: null,
};

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchAll',
  async (params: SubjectsListParams | undefined, { rejectWithValue }) => {
    try {
      const { data } = await subjectService.getSubjects(params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchSubject = createAsyncThunk(
  'subjects/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await subjectService.getSubject(id);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const createSubject = createAsyncThunk(
  'subjects/create',
  async (formData: SubjectFormData, { rejectWithValue }) => {
    try {
      const { data } = await subjectService.createSubject(formData);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const updateSubject = createAsyncThunk(
  'subjects/update',
  async ({ id, data: formData }: { id: string; data: Partial<SubjectFormData> }, { rejectWithValue }) => {
    try {
      const { data } = await subjectService.updateSubject(id, formData);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const deleteSubject = createAsyncThunk(
  'subjects/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await subjectService.deleteSubject(id);
      return id;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    clearSubjectError(state) { state.error = null; },
    clearSelectedSubject(state) { state.selectedSubject = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSubjects.fulfilled, (state, action) => { state.loading = false; state.subjects = action.payload; })
      .addCase(fetchSubjects.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(fetchSubject.fulfilled, (state, action) => { state.selectedSubject = action.payload; });

    builder
      .addCase(createSubject.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(createSubject.fulfilled, (state, action) => { state.submitting = false; state.subjects.push(action.payload); })
      .addCase(createSubject.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(updateSubject.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.subjects.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.subjects[idx] = action.payload;
        if (state.selectedSubject?._id === action.payload._id) state.selectedSubject = action.payload;
      })
      .addCase(updateSubject.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(deleteSubject.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.submitting = false;
        state.subjects = state.subjects.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteSubject.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });
  },
});

export const { clearSubjectError, clearSelectedSubject } = subjectSlice.actions;
export default subjectSlice.reducer;
