import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ClassItem, SectionItem, AcademicYear } from '../../types/student';
import { classService, ClassWithYear } from '../../services/classService';

interface ClassState {
  classes: ClassWithYear[];
  sections: SectionItem[];
  academicYears: (AcademicYear & { isCurrent?: boolean })[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: ClassState = {
  classes: [],
  sections: [],
  academicYears: [],
  loading: false,
  submitting: false,
  error: null,
};

export const fetchClasses = createAsyncThunk(
  'classes/fetchAll',
  async (params: { academicYear?: string } | undefined, { rejectWithValue }) => {
    try {
      const { data } = await classService.getClasses(params);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const createClass = createAsyncThunk(
  'classes/create',
  async (payload: { name: string; academicYear: string }, { rejectWithValue }) => {
    try {
      const { data } = await classService.createClass(payload);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const updateClass = createAsyncThunk(
  'classes/update',
  async ({ id, data: payload }: { id: string; data: { name?: string; academicYear?: string } }, { rejectWithValue }) => {
    try {
      const { data } = await classService.updateClass(id, payload);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const deleteClass = createAsyncThunk(
  'classes/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await classService.deleteClass(id);
      return id;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchSections = createAsyncThunk(
  'classes/fetchSections',
  async (classId: string, { rejectWithValue }) => {
    try {
      const { data } = await classService.getSections(classId);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const createSection = createAsyncThunk(
  'classes/createSection',
  async ({ classId, name, academicYear }: { classId: string; name: string; academicYear: string }, { rejectWithValue }) => {
    try {
      const { data } = await classService.createSection(classId, { name, academicYear });
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const updateSection = createAsyncThunk(
  'classes/updateSection',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const { data } = await classService.updateSection(id, { name });
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const deleteSection = createAsyncThunk(
  'classes/deleteSection',
  async (id: string, { rejectWithValue }) => {
    try {
      await classService.deleteSection(id);
      return id;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchAcademicYears = createAsyncThunk(
  'classes/fetchAcademicYears',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await classService.getAcademicYears();
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const createAcademicYear = createAsyncThunk(
  'classes/createAcademicYear',
  async (payload: { name: string; startDate: string; endDate: string; isCurrent?: boolean }, { rejectWithValue }) => {
    try {
      const { data } = await classService.createAcademicYear(payload);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const updateAcademicYear = createAsyncThunk(
  'classes/updateAcademicYear',
  async ({ id, data: payload }: { id: string; data: { name?: string; startDate?: string; endDate?: string; isCurrent?: boolean } }, { rejectWithValue }) => {
    try {
      const { data } = await classService.updateAcademicYear(id, payload);
      return data.data;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const deleteAcademicYear = createAsyncThunk(
  'classes/deleteAcademicYear',
  async (id: string, { rejectWithValue }) => {
    try {
      await classService.deleteAcademicYear(id);
      return id;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const assignClassToTeacher = createAsyncThunk(
  'classes/assignToTeacher',
  async ({ teacherId, classId, academicYear, sectionId }: { teacherId: string; classId: string; academicYear: string; sectionId?: string }, { rejectWithValue }) => {
    try {
      await classService.assignClass(teacherId, { classId, academicYear, sectionId });
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const unassignClassFromTeacher = createAsyncThunk(
  'classes/unassignFromTeacher',
  async ({ teacherId, classId, academicYear, sectionId }: { teacherId: string; classId: string; academicYear: string; sectionId?: string }, { rejectWithValue }) => {
    try {
      await classService.unassignClass(teacherId, { classId, academicYear, sectionId });
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearClassError(state) { state.error = null; },
    clearSections(state) { state.sections = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClasses.fulfilled, (state, action) => { state.loading = false; state.classes = action.payload; })
      .addCase(fetchClasses.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(createClass.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(createClass.fulfilled, (state, action) => { state.submitting = false; state.classes.push(action.payload); })
      .addCase(createClass.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(updateClass.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(updateClass.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.classes.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.classes[idx] = action.payload;
      })
      .addCase(updateClass.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(deleteClass.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.submitting = false;
        state.classes = state.classes.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteClass.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(fetchSections.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSections.fulfilled, (state, action) => { state.loading = false; state.sections = action.payload; })
      .addCase(fetchSections.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(createSection.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(createSection.fulfilled, (state, action) => { state.submitting = false; state.sections.push(action.payload); })
      .addCase(createSection.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(updateSection.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(updateSection.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.sections.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.sections[idx] = action.payload;
      })
      .addCase(updateSection.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(deleteSection.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.submitting = false;
        state.sections = state.sections.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteSection.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(fetchAcademicYears.fulfilled, (state, action) => { state.academicYears = action.payload; });

    builder
      .addCase(createAcademicYear.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(createAcademicYear.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload.isCurrent) state.academicYears.forEach((y) => { y.isCurrent = false; });
        state.academicYears.unshift(action.payload);
      })
      .addCase(createAcademicYear.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(updateAcademicYear.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(updateAcademicYear.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload.isCurrent) state.academicYears.forEach((y) => { y.isCurrent = false; });
        const idx = state.academicYears.findIndex((y) => y._id === action.payload._id);
        if (idx !== -1) state.academicYears[idx] = action.payload;
      })
      .addCase(updateAcademicYear.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(deleteAcademicYear.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(deleteAcademicYear.fulfilled, (state, action) => {
        state.submitting = false;
        state.academicYears = state.academicYears.filter((y) => y._id !== action.payload);
      })
      .addCase(deleteAcademicYear.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(assignClassToTeacher.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(assignClassToTeacher.fulfilled, (state) => { state.submitting = false; })
      .addCase(assignClassToTeacher.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });

    builder
      .addCase(unassignClassFromTeacher.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(unassignClassFromTeacher.fulfilled, (state) => { state.submitting = false; })
      .addCase(unassignClassFromTeacher.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });
  },
});

export const { clearClassError, clearSections } = classSlice.actions;
export default classSlice.reducer;
