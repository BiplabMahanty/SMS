import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateMarkAttendance, validateUpdateAttendance } from '../validators/attendanceValidator';
import {
  markAttendance,
  getClassAttendance,
  getAttendanceHistory,
  updateAttendance,
  getMyAttendance,
  getMyAttendanceSummary,
  getChildAttendance,
  getStudentAttendanceReport,
  getClassAttendanceReport,
} from '../controllers/attendanceController';

const router = Router();
router.use(authenticate);

// Student self-service
router.get('/me', authorize('STUDENT'), getMyAttendance);
router.get('/me/summary', authorize('STUDENT'), getMyAttendanceSummary);

// Parent
router.get('/child/:studentId', authorize('PARENT'), getChildAttendance);

// Admin reports
router.get('/report/student/:studentId', authorize('ADMIN'), getStudentAttendanceReport);
router.get('/report/class', authorize('ADMIN'), getClassAttendanceReport);

// Teacher + Admin
router.get('/class', authorize('TEACHER', 'ADMIN'), getClassAttendance);
router.get('/history', authorize('TEACHER', 'ADMIN'), getAttendanceHistory);
router.post('/mark', authorize('TEACHER', 'ADMIN'), validateMarkAttendance, markAttendance);
router.put('/:id', authorize('TEACHER', 'ADMIN'), validateUpdateAttendance, updateAttendance);

export default router;
