const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateMarkAttendance, validateUpdateAttendance } = require('../validators/attendanceValidator');
const { markAttendance, getClassAttendance, getAttendanceHistory, updateAttendance, getMyAttendance, getMyAttendanceSummary, getChildAttendance, getStudentAttendanceReport, getClassAttendanceReport } = require('../controllers/attendanceController');

const router = Router();
router.use(authenticate);

router.get('/me', authorize('STUDENT'), getMyAttendance);
router.get('/me/summary', authorize('STUDENT'), getMyAttendanceSummary);
router.get('/child/:studentId', authorize('PARENT'), getChildAttendance);
router.get('/report/student/:studentId', authorize('ADMIN'), getStudentAttendanceReport);
router.get('/report/class', authorize('ADMIN'), getClassAttendanceReport);
router.get('/class', authorize('TEACHER', 'ADMIN'), getClassAttendance);
router.get('/history', authorize('TEACHER', 'ADMIN'), getAttendanceHistory);
router.post('/mark', authorize('TEACHER', 'ADMIN'), validateMarkAttendance, markAttendance);
router.put('/:id', authorize('TEACHER', 'ADMIN'), validateUpdateAttendance, updateAttendance);

module.exports = router;
