import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateCreateSubject, validateUpdateSubject } from '../validators/subjectTimetableValidator';
import { getSubjects, createSubject, getSubject, updateSubject, deleteSubject } from '../controllers/subjectController';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), getSubjects);
router.post('/', authorize('ADMIN'), validateCreateSubject, createSubject);
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), getSubject);
router.put('/:id', authorize('ADMIN'), validateUpdateSubject, updateSubject);
router.delete('/:id', authorize('ADMIN'), deleteSubject);

export default router;
