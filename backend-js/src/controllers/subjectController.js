const mongoose = require('mongoose');
const { Subject } = require('../models/Subject');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

const POPULATE = [
  { path: 'class', select: 'name' },
  { path: 'academicYear', select: 'name' },
  { path: 'teacher', select: 'name teacherId' },
];

const getSubjects = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.teacher) filter.teacher = req.query.teacher;
    if (req.query.search) {
      const s = req.query.search.trim();
      filter.$or = [{ name: { $regex: s, $options: 'i' } }, { code: { $regex: s, $options: 'i' } }];
    }
    const [subjects, total] = await Promise.all([
      Subject.find(filter).populate(POPULATE).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Subject.countDocuments(filter),
    ]);
    sendSuccess(res, 'Subjects fetched successfully', subjects, 200, { total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const createSubject = async (req, res, next) => {
  try {
    const existing = await Subject.findOne({ code: req.body.code.trim().toUpperCase(), class: req.body.class, academicYear: req.body.academicYear });
    if (existing) throw new AppError('A subject with this code already exists for this class and year', 409);
    const subject = await Subject.create(req.body);
    const populated = await subject.populate(POPULATE);
    sendSuccess(res, 'Subject created successfully', populated, 201);
  } catch (err) { next(err); }
};

const getSubject = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid subject ID', 400);
    const subject = await Subject.findById(req.params.id).populate(POPULATE);
    if (!subject) throw new AppError('Subject not found', 404);
    sendSuccess(res, 'Subject fetched successfully', subject);
  } catch (err) { next(err); }
};

const updateSubject = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid subject ID', 400);
    if (req.body.code) {
      const conflict = await Subject.findOne({ code: req.body.code.trim().toUpperCase(), class: req.body.class, academicYear: req.body.academicYear, _id: { $ne: req.params.id } });
      if (conflict) throw new AppError('Subject code already in use for this class and year', 409);
    }
    const subject = await Subject.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).populate(POPULATE);
    if (!subject) throw new AppError('Subject not found', 404);
    sendSuccess(res, 'Subject updated successfully', subject);
  } catch (err) { next(err); }
};

const deleteSubject = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid subject ID', 400);
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) throw new AppError('Subject not found', 404);
    sendSuccess(res, 'Subject deleted successfully');
  } catch (err) { next(err); }
};

module.exports = { getSubjects, createSubject, getSubject, updateSubject, deleteSubject };
