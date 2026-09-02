import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Teacher, TeacherFormData, TeachersListParams, PaginationMeta } from '../../types/teacher';
import { Student, StudentsListParams } from '../../types/student';
import { teacherService } from '../../services/teacherService';

interface TeacherState {
  teachers: Teacher[];
  selectedTeacher: Teacher | null;
  myProfile: Teacher | null;
  myClasses: Teacher['assignedClasses'];
  myStudents: Student[];
  myStudentsPagination: PaginationMeta | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  teachers: [],
  selectedTeacher: null,
  myProfile: null,
  myClasses: [],
  myStudents: [],
  myStudentsPagination: null,
  pagination: null,
  loading: false,
  detailLoading: false,
  submitting: false,
  error: null,
};

export const fetchTeachers = createAsyncThunk(
  'teachers/fetchAll',
  async (params: TeachersListParams | undefined, { rejectWithValue }) => {
    try {
      const { data } = await teacherService.getTeachers(params);
      return { teachers: data.data, pagination: (data as any).pagination };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchTeacher = createAsyncThunk(
  'teachers/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await teacherService.getTeacher(id);
      return data.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const createTeacher = createAsyncThunk(
  'teachers/create',
  async (formData: TeacherFormData, { rejectWithValue }) => {
    try {
      const { data } = await teacherService.createTeacher(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const updateTeacher = createAsyncThunk(
  'teachers/update',
  async ({ id, data: formData }: { id: string; data: Partial<TeacherFormData> }, { rejectWithValue }) => {
    try {
      const { data } = await teacherService.updateTeacher(id, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  'teachers/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await teacherService.deleteTeacher(id);
      return id;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchMyProfile = createAsyncThunk(
  'teachers/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await teacherService.getMyProfile();
      return data.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchMyClasses = createAsyncThunk(
  'teachers/fetchMyClasses',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await teacherService.getMyClasses();
      return data.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchMyStudents = createAsyncThunk(
  'teachers/fetchMyStudents',
  async (params: StudentsListParams | undefined, { rejectWithValue }) => {
    try {
      const { data } = await teacherService.getMyStudents(params);
      return { students: data.data, pagination: (data as any).pagination };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const teacherSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    clearTeacherError(state) { state.error = null; },
    clearSelectedTeacher(state) { state.selectedTeacher = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload.teachers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTeacher.pending, (state) => { state.detailLoading = true; state.error = null; })
      .addCase(fetchTeacher.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedTeacher = action.payload;
      })
      .addCase(fetchTeacher.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createTeacher.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.submitting = false;
        state.teachers.unshift(action.payload);
        if (state.pagination) state.pagination.total += 1;
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateTeacher.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.teachers.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.teachers[idx] = action.payload;
        if (state.selectedTeacher?._id === action.payload._id) state.selectedTeacher = action.payload;
        if (state.myProfile?._id === action.payload._id) state.myProfile = action.payload;
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteTeacher.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.submitting = false;
        state.teachers = state.teachers.filter((t) => t._id !== action.payload);
        if (state.pagination) state.pagination.total -= 1;
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMyProfile.pending, (state) => { state.detailLoading = true; state.error = null; })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.myProfile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMyClasses.fulfilled, (state, action) => {
        state.myClasses = action.payload;
      });

    builder
      .addCase(fetchMyStudents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.myStudents = action.payload.students;
        state.myStudentsPagination = action.payload.pagination;
      })
      .addCase(fetchMyStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTeacherError, clearSelectedTeacher } = teacherSlice.actions;
export default teacherSlice.reducer;
