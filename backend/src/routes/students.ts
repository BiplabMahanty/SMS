import { Router } from 'express';
import {
  getStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  getMyChildren,
} from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';
import { validateCreateStudent, validateUpdateStudent } from '../validators/studentValidator';

const router = Router();

router.use(authenticate);

router.get('/my-children', authorize('PARENT'), getMyChildren);
router.get('/', authorize('ADMIN', 'TEACHER'), getStudents);
router.post('/', authorize('ADMIN'), validateCreateStudent, createStudent);
router.get('/:id', authorize('ADMIN', 'TEACHER'), getStudent);
router.put('/:id', authorize('ADMIN'), validateUpdateStudent, updateStudent);
router.delete('/:id', authorize('ADMIN'), deleteStudent);

export default router;
