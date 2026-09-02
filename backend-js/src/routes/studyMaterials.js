const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { createMaterial, deleteMaterial, getMaterials, downloadMaterial } = require('../controllers/studyMaterialController');

const router = Router();
router.use(authenticate);

router.get('/files/:filename', downloadMaterial);
router.get('/', authorize('TEACHER', 'ADMIN', 'STUDENT'), getMaterials);
router.post('/', authorize('TEACHER', 'ADMIN'), upload.single('file'), createMaterial);
router.delete('/:id', authorize('TEACHER', 'ADMIN'), deleteMaterial);

module.exports = router;
