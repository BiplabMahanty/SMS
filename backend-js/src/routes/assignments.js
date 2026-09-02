const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { createAssignment, updateAssignment, deleteAssignment, getAssignments, getAssignment, getSubmissions, gradeSubmission, getMyAssignments, submitAssignment, getMySubmission, downloadFile } = require('../controllers/assignmentController');

const router = Router();
router.use(authenticate);

router.get('/me', authorize('STUDENT'), getMyAssignments);
router.get('/:id/my-submission', authorize('STUDENT'), getMySubmission);
router.post('/:id/submit', authorize('STUDENT'), upload.array('files', 5), submitAssignment);

router.get('/:id/submissions', authorize('TEACHER', 'ADMIN'), getSubmissions);
router.put('/submissions/:submissionId/grade', authorize('TEACHER', 'ADMIN'), gradeSubmission);

router.get('/files/:filename', downloadFile);

router.get('/', authorize('TEACHER', 'ADMIN'), getAssignments);
router.post('/', authorize('TEACHER', 'ADMIN'), upload.array('files', 5), createAssignment);
router.get('/:id', authorize('TEACHER', 'ADMIN', 'STUDENT'), getAssignment);
router.put('/:id', authorize('TEACHER', 'ADMIN'), upload.array('files', 5), updateAssignment);
router.delete('/:id', authorize('TEACHER', 'ADMIN'), deleteAssignment);

module.exports = router;
