import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Assignment, AssignmentSubmission, StudyMaterial } from '../../types/assignment';
import { assignmentService, studyMaterialService } from '../../services/assignmentService';

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  submissions: AssignmentSubmission[];
  mySubmission: AssignmentSubmission | null;
  materials: StudyMaterial[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  assignments: [], currentAssignment: null, submissions: [],
  mySubmission: null, materials: [], loading: false, error: null,
};

export const fetchAssignments = createAsyncThunk('assignments/fetchAll', (params?: object) =>
  assignmentService.getAssignments(params));

export const fetchMyAssignments = createAsyncThunk('assignments/fetchMine', (params?: object) =>
  assignmentService.getMyAssignments(params));

export const fetchAssignment = createAsyncThunk('assignments/fetchOne', (id: string) =>
  assignmentService.getAssignment(id));

export const createAssignment = createAsyncThunk(
  'assignments/create',
  async (payload: FormData | object, { rejectWithValue }) => {
    try {
      return await assignmentService.createAssignment(payload);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to create assignment';
      return rejectWithValue(msg);
    }
  }
);

export const deleteAssignment = createAsyncThunk('assignments/delete', (id: string) =>
  assignmentService.deleteAssignment(id).then(() => id));

export const fetchSubmissions = createAsyncThunk('assignments/fetchSubmissions', (id: string) =>
  assignmentService.getSubmissions(id));

export const fetchMySubmission = createAsyncThunk('assignments/fetchMySubmission', (id: string) =>
  assignmentService.getMySubmission(id));

export const submitAssignment = createAsyncThunk(
  'assignments/submit',
  ({ id, formData }: { id: string; formData: FormData }) => assignmentService.submitAssignment(id, formData)
);

export const gradeSubmission = createAsyncThunk(
  'assignments/grade',
  ({ submissionId, marks, feedback }: { submissionId: string; marks: number; feedback: string }) =>
    assignmentService.gradeSubmission(submissionId, marks, feedback)
);

export const fetchMaterials = createAsyncThunk('materials/fetchAll', (params?: object) =>
  studyMaterialService.getMaterials(params));

export const createMaterial = createAsyncThunk('materials/create', (formData: FormData) =>
  studyMaterialService.createMaterial(formData));

export const deleteMaterial = createAsyncThunk('materials/delete', (id: string) =>
  studyMaterialService.deleteMaterial(id).then(() => id));

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    const pending = (s: AssignmentState) => { s.loading = true; s.error = null; };
    const rejected = (s: AssignmentState, a: any) => { s.loading = false; s.error = a.error.message ?? 'Error'; };

    builder
      .addCase(fetchAssignments.pending, pending)
      .addCase(fetchAssignments.fulfilled, (s, a) => { s.loading = false; s.assignments = a.payload; })
      .addCase(fetchAssignments.rejected, rejected)

      .addCase(fetchMyAssignments.pending, pending)
      .addCase(fetchMyAssignments.fulfilled, (s, a) => { s.loading = false; s.assignments = a.payload; })
      .addCase(fetchMyAssignments.rejected, rejected)

      .addCase(fetchAssignment.fulfilled, (s, a) => { s.currentAssignment = a.payload; })

      .addCase(createAssignment.fulfilled, (s, a) => { s.assignments.unshift(a.payload); })

      .addCase(deleteAssignment.fulfilled, (s, a) => {
        s.assignments = s.assignments.filter(x => x._id !== a.payload);
      })

      .addCase(fetchSubmissions.fulfilled, (s, a) => { s.submissions = a.payload; })
      .addCase(fetchMySubmission.fulfilled, (s, a) => { s.mySubmission = a.payload; })
      .addCase(submitAssignment.fulfilled, (s, a) => { s.mySubmission = a.payload; })

      .addCase(fetchMaterials.pending, pending)
      .addCase(fetchMaterials.fulfilled, (s, a) => { s.loading = false; s.materials = a.payload; })
      .addCase(fetchMaterials.rejected, rejected)

      .addCase(createMaterial.fulfilled, (s, a) => { s.materials.unshift(a.payload); })
      .addCase(deleteMaterial.fulfilled, (s, a) => {
        s.materials = s.materials.filter(x => x._id !== a.payload);
      });
  },
});

export const { clearError } = assignmentSlice.actions;
export default assignmentSlice.reducer;
