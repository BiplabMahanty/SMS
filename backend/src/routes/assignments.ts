import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createAssignment, updateAssignment, deleteAssignment,
  getAssignments, getAssignment, getSubmissions, gradeSubmission,
  getMyAssignments, submitAssignment, getMySubmission, downloadFile,
} from '../controllers/assignmentController';

const router = Router();
router.use(authenticate);

// Student
router.get('/me', authorize('STUDENT'), getMyAssignments);
router.get('/:id/my-submission', authorize('STUDENT'), getMySubmission);
router.post('/:id/submit', authorize('STUDENT'), upload.array('files', 5), submitAssignment);

// Teacher grading
router.get('/:id/submissions', authorize('TEACHER', 'ADMIN'), getSubmissions);
router.put('/submissions/:submissionId/grade', authorize('TEACHER', 'ADMIN'), gradeSubmission);

// File download (all roles)
router.get('/files/:filename', downloadFile);

// CRUD
router.get('/', authorize('TEACHER', 'ADMIN'), getAssignments);
router.post('/', authorize('TEACHER', 'ADMIN'), upload.array('files', 5), createAssignment);
router.get('/:id', authorize('TEACHER', 'ADMIN', 'STUDENT'), getAssignment);
router.put('/:id', authorize('TEACHER', 'ADMIN'), upload.array('files', 5), updateAssignment);
router.delete('/:id', authorize('TEACHER', 'ADMIN'), deleteAssignment);

export default router;
