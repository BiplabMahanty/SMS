import client from '../api/client';
import { Assignment, AssignmentSubmission, StudyMaterial } from '../types/assignment';

export const assignmentService = {
  getAssignments: (params?: object) =>
    client.get<{ data: Assignment[] }>('/assignments', { params }).then(r => r.data.data),

  getMyAssignments: (params?: object) =>
    client.get<{ data: Assignment[] }>('/assignments/me', { params }).then(r => r.data.data),

  getAssignment: (id: string) =>
    client.get<{ data: Assignment }>(`/assignments/${id}`).then(r => r.data.data),

  createAssignment: (payload: FormData | object) =>
    client.post<{ data: Assignment }>('/assignments', payload, {
      headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }).then(r => r.data.data),

  updateAssignment: (id: string, formData: FormData) =>
    client.put<{ data: Assignment }>(`/assignments/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data),

  deleteAssignment: (id: string) => client.delete(`/assignments/${id}`),

  getSubmissions: (assignmentId: string) =>
    client.get<{ data: AssignmentSubmission[] }>(`/assignments/${assignmentId}/submissions`).then(r => r.data.data),

  getMySubmission: (assignmentId: string) =>
    client.get<{ data: AssignmentSubmission }>(`/assignments/${assignmentId}/my-submission`).then(r => r.data.data),

  submitAssignment: (assignmentId: string, formData: FormData) =>
    client.post<{ data: AssignmentSubmission }>(`/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data),

  gradeSubmission: (submissionId: string, marks: number, feedback: string) =>
    client.put<{ data: AssignmentSubmission }>(`/assignments/submissions/${submissionId}/grade`, { marks, feedback }).then(r => r.data.data),

  getFileUrl: (filename: string) => `${client.defaults.baseURL}/assignments/files/${filename}`,
};

export const studyMaterialService = {
  getMaterials: (params?: object) =>
    client.get<{ data: StudyMaterial[] }>('/study-materials', { params }).then(r => r.data.data),

  createMaterial: (formData: FormData) =>
    client.post<{ data: StudyMaterial }>('/study-materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data),

  deleteMaterial: (id: string) => client.delete(`/study-materials/${id}`),

  getFileUrl: (filename: string) => `${client.defaults.baseURL}/study-materials/files/${filename}`,
};
