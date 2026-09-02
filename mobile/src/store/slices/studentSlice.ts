import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Student, StudentFormData, StudentsListParams, PaginationMeta } from '../../types/student';
import { studentService } from '../../services/studentService';

interface StudentState {
  students: Student[];
  myChildren: Student[];
  selectedStudent: Student | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: StudentState = {
  students: [],
  myChildren: [],
  selectedStudent: null,
  pagination: null,
  loading: false,
  detailLoading: false,
  submitting: false,
  error: null,
};

export const fetchMyChildren = createAsyncThunk(
  'students/fetchMyChildren',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await studentService.getMyChildren();
      return data.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchStudents = createAsyncThunk(
  'students/fetchAll',
  async (params: StudentsListParams | undefined, { rejectWithValue }) => {
    try {
      const { data } = await studentService.getStudents(params);
      return { students: data.data, pagination: (data as any).pagination };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchStudent = createAsyncThunk(
  'students/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await studentService.getStudent(id);
      return data.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const createStudent = createAsyncThunk(
  'students/create',
  async (formData: StudentFormData, { rejectWithValue }) => {
    try {
      const { data } = await studentService.createStudent(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/update',
  async ({ id, data: formData }: { id: string; data: Partial<StudentFormData> }, { rejectWithValue }) => {
    try {
      const { data } = await studentService.updateStudent(id, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'students/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await studentService.deleteStudent(id);
      return id;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearStudentError(state) { state.error = null; },
    clearSelectedStudent(state) { state.selectedStudent = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyChildren.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyChildren.fulfilled, (state, action) => { state.loading = false; state.myChildren = action.payload; })
      .addCase(fetchMyChildren.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(fetchStudents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchStudent.pending, (state) => { state.detailLoading = true; state.error = null; })
      .addCase(fetchStudent.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedStudent = action.payload;
      })
      .addCase(fetchStudent.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createStudent.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.submitting = false;
        state.students.unshift(action.payload);
        if (state.pagination) state.pagination.total += 1;
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateStudent.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.students.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.students[idx] = action.payload;
        if (state.selectedStudent?._id === action.payload._id) {
          state.selectedStudent = action.payload;
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteStudent.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.submitting = false;
        state.students = state.students.filter((s) => s._id !== action.payload);
        if (state.pagination) state.pagination.total -= 1;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStudentError, clearSelectedStudent } = studentSlice.actions;
export default studentSlice.reducer;
