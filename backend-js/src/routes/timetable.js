const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateTimetable, validateUpdateTimetable } = require('../validators/subjectTimetableValidator');
const { getTimetable, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry, getMyTimetableTeacher, getMyTimetableStudent, getChildTimetable } = require('../controllers/timetableController');

const router = Router();
router.use(authenticate);

router.get('/me/teacher', authorize('TEACHER'), getMyTimetableTeacher);
router.get('/me/student', authorize('STUDENT'), getMyTimetableStudent);
router.get('/child/:studentId', authorize('PARENT'), getChildTimetable);

router.get('/', authorize('ADMIN', 'TEACHER'), getTimetable);
router.post('/', authorize('ADMIN'), validateCreateTimetable, createTimetableEntry);
router.put('/:id', authorize('ADMIN'), validateUpdateTimetable, updateTimetableEntry);
router.delete('/:id', authorize('ADMIN'), deleteTimetableEntry);

module.exports = router;
