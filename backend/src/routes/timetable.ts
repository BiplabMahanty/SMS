import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateCreateTimetable, validateUpdateTimetable } from '../validators/subjectTimetableValidator';
import {
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getMyTimetableTeacher,
  getMyTimetableStudent,
  getChildTimetable,
} from '../controllers/timetableController';

const router = Router();

router.use(authenticate);

// Role-scoped self-service — must be before /:id to avoid route conflict
router.get('/me/teacher', authorize('TEACHER'), getMyTimetableTeacher);
router.get('/me/student', authorize('STUDENT'), getMyTimetableStudent);
router.get('/child/:studentId', authorize('PARENT'), getChildTimetable);

// Admin CRUD
router.get('/', authorize('ADMIN', 'TEACHER'), getTimetable);
router.post('/', authorize('ADMIN'), validateCreateTimetable, createTimetableEntry);
router.put('/:id', authorize('ADMIN'), validateUpdateTimetable, updateTimetableEntry);
router.delete('/:id', authorize('ADMIN'), deleteTimetableEntry);

export default router;
