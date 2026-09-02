const { Router } = require('express');
const { getStudents, createStudent, getStudent, updateStudent, deleteStudent, getMyChildren } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateStudent, validateUpdateStudent } = require('../validators/studentValidator');

const router = Router();
router.use(authenticate);

router.get('/my-children', authorize('PARENT'), getMyChildren);
router.get('/', authorize('ADMIN', 'TEACHER'), getStudents);
router.post('/', authorize('ADMIN'), validateCreateStudent, createStudent);
router.get('/:id', authorize('ADMIN', 'TEACHER'), getStudent);
router.put('/:id', authorize('ADMIN'), validateUpdateStudent, updateStudent);
router.delete('/:id', authorize('ADMIN'), deleteStudent);

module.exports = router;
