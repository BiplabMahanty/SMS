const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateSubject, validateUpdateSubject } = require('../validators/subjectTimetableValidator');
const { getSubjects, createSubject, getSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');

const router = Router();
router.use(authenticate);

router.get('/', authorize('ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), getSubjects);
router.post('/', authorize('ADMIN'), validateCreateSubject, createSubject);
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), getSubject);
router.put('/:id', authorize('ADMIN'), validateUpdateSubject, updateSubject);
router.delete('/:id', authorize('ADMIN'), deleteSubject);

module.exports = router;
