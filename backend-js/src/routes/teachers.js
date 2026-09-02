const { Router } = require('express');
const mongoose = require('mongoose');
const { getTeachers, createTeacher, getTeacher, updateTeacher, deleteTeacher, getMyClasses, getMyStudents, getMyProfile } = require('../controllers/teacherController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateTeacher, validateUpdateTeacher } = require('../validators/teacherValidator');
const { Teacher } = require('../models/Teacher');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

const router = Router();
router.use(authenticate);

router.get('/me/profile', authorize('TEACHER'), getMyProfile);
router.get('/me/classes', authorize('TEACHER'), getMyClasses);
router.get('/me/students', authorize('TEACHER'), getMyStudents);

router.get('/', authorize('ADMIN'), getTeachers);
router.post('/', authorize('ADMIN'), validateCreateTeacher, createTeacher);
router.get('/:id', authorize('ADMIN'), getTeacher);
router.put('/:id', authorize('ADMIN'), validateUpdateTeacher, updateTeacher);
router.delete('/:id', authorize('ADMIN'), deleteTeacher);

router.post('/:id/assign-class', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { classId, sectionId, academicYear } = req.body;
    if (!classId || !academicYear) throw new AppError('classId and academicYear are required', 400);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid teacher ID', 400);
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) throw new AppError('Teacher not found', 404);
    const alreadyAssigned = teacher.assignedClasses.some(
      (ac) => ac.class.toString() === classId &&
        ac.academicYear.toString() === academicYear &&
        (sectionId ? ac.section?.toString() === sectionId : !ac.section)
    );
    if (alreadyAssigned) throw new AppError('This class is already assigned to the teacher', 409);
    teacher.assignedClasses.push({
      class: new mongoose.Types.ObjectId(classId),
      section: sectionId ? new mongoose.Types.ObjectId(sectionId) : undefined,
      academicYear: new mongoose.Types.ObjectId(academicYear),
    });
    await teacher.save();
    const populated = await teacher.populate([
      { path: 'assignedClasses.class', select: 'name' },
      { path: 'assignedClasses.section', select: 'name' },
      { path: 'assignedClasses.academicYear', select: 'name' },
    ]);
    sendSuccess(res, 'Class assigned to teacher', populated);
  } catch (err) { next(err); }
});

router.delete('/:id/assign-class', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { classId, sectionId, academicYear } = req.body;
    if (!classId || !academicYear) throw new AppError('classId and academicYear are required', 400);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid teacher ID', 400);
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) throw new AppError('Teacher not found', 404);
    const before = teacher.assignedClasses.length;
    teacher.assignedClasses = teacher.assignedClasses.filter(
      (ac) => !(
        ac.class.toString() === classId &&
        ac.academicYear.toString() === academicYear &&
        (sectionId ? ac.section?.toString() === sectionId : !ac.section)
      )
    );
    if (teacher.assignedClasses.length === before) throw new AppError('Assignment not found', 404);
    await teacher.save();
    sendSuccess(res, 'Class unassigned from teacher', teacher);
  } catch (err) { next(err); }
});

module.exports = router;
