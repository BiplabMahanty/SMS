const { Router } = require('express');
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../middleware/auth');
const { Class } = require('../models/Class');
const { AcademicYear } = require('../models/AcademicYear');
const { Section } = require('../models/Section');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

const router = Router();
router.use(authenticate);

// Academic Years
router.get('/academic-years', authorize('ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), async (req, res, next) => {
  try {
    const years = await AcademicYear.find().sort({ startDate: -1 }).lean();
    sendSuccess(res, 'Academic years fetched', years);
  } catch (err) { next(err); }
});

router.post('/academic-years', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name, startDate, endDate, isCurrent } = req.body;
    if (!name || !startDate || !endDate) throw new AppError('Name, startDate and endDate are required', 400);
    const existing = await AcademicYear.findOne({ name: name.trim() });
    if (existing) throw new AppError('Academic year already exists', 409);
    if (isCurrent) await AcademicYear.updateMany({}, { isCurrent: false });
    const year = await AcademicYear.create({ name: name.trim(), startDate, endDate, isCurrent: !!isCurrent });
    sendSuccess(res, 'Academic year created', year, 201);
  } catch (err) { next(err); }
});

router.put('/academic-years/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name, startDate, endDate, isCurrent } = req.body;
    if (isCurrent) await AcademicYear.updateMany({ _id: { $ne: req.params.id } }, { isCurrent: false });
    const year = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(name && { name: name.trim() }), ...(startDate && { startDate }), ...(endDate && { endDate }), ...(isCurrent !== undefined && { isCurrent }) } },
      { new: true, runValidators: true }
    );
    if (!year) throw new AppError('Academic year not found', 404);
    sendSuccess(res, 'Academic year updated', year);
  } catch (err) { next(err); }
});

router.delete('/academic-years/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const year = await AcademicYear.findByIdAndDelete(req.params.id);
    if (!year) throw new AppError('Academic year not found', 404);
    sendSuccess(res, 'Academic year deleted');
  } catch (err) { next(err); }
});

// Classes
router.get('/classes', authorize('ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    const classes = await Class.find(filter).populate('academicYear', 'name').sort({ name: 1 }).lean();
    sendSuccess(res, 'Classes fetched', classes);
  } catch (err) { next(err); }
});

router.post('/classes', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name, academicYear } = req.body;
    if (!name || !academicYear) throw new AppError('Name and academicYear are required', 400);
    const cls = await Class.create({ name: name.trim(), academicYear });
    const populated = await cls.populate('academicYear', 'name');
    sendSuccess(res, 'Class created', populated, 201);
  } catch (err) { next(err); }
});

router.put('/classes/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name, academicYear } = req.body;
    const cls = await Class.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(name && { name: name.trim() }), ...(academicYear && { academicYear }) } },
      { new: true, runValidators: true }
    ).populate('academicYear', 'name');
    if (!cls) throw new AppError('Class not found', 404);
    sendSuccess(res, 'Class updated', cls);
  } catch (err) { next(err); }
});

router.delete('/classes/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) throw new AppError('Class not found', 404);
    await Section.deleteMany({ class: req.params.id });
    sendSuccess(res, 'Class deleted');
  } catch (err) { next(err); }
});

// Sections
router.get('/classes/:classId/sections', authorize('ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), async (req, res, next) => {
  try {
    const sections = await Section.find({ class: req.params.classId }).sort({ name: 1 }).lean();
    sendSuccess(res, 'Sections fetched', sections);
  } catch (err) { next(err); }
});

router.post('/classes/:classId/sections', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name, academicYear } = req.body;
    if (!name || !academicYear) throw new AppError('Name and academicYear are required', 400);
    const cls = await Class.findById(req.params.classId);
    if (!cls) throw new AppError('Class not found', 404);
    const section = await Section.create({ name: name.trim(), class: req.params.classId, academicYear });
    sendSuccess(res, 'Section created', section, 201);
  } catch (err) { next(err); }
});

router.put('/sections/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name } = req.body;
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(name && { name: name.trim() }) } },
      { new: true, runValidators: true }
    );
    if (!section) throw new AppError('Section not found', 404);
    sendSuccess(res, 'Section updated', section);
  } catch (err) { next(err); }
});

router.delete('/sections/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) throw new AppError('Section not found', 404);
    sendSuccess(res, 'Section deleted');
  } catch (err) { next(err); }
});

module.exports = router;
