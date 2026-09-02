import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { createMaterial, deleteMaterial, getMaterials, downloadMaterial } from '../controllers/studyMaterialController';

const router = Router();
router.use(authenticate);

router.get('/files/:filename', downloadMaterial);
router.get('/', authorize('TEACHER', 'ADMIN', 'STUDENT'), getMaterials);
router.post('/', authorize('TEACHER', 'ADMIN'), upload.single('file'), createMaterial);
router.delete('/:id', authorize('TEACHER', 'ADMIN'), deleteMaterial);

export default router;
