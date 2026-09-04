const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { Assignment } = require('../models/Assignment');
const { AssignmentSubmission } = require('../models/AssignmentSubmission');
const { Student } = require('../models/Student');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const { getTeacherByUserId } = require('../services/teacherService');
const { fileToAttachment } = require('../middleware/upload');

const POPULATE = [
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'subject', select: 'name code' },
  { path: 'teacher', select: 'name teacherId' },
  { path: 'academicYear', select: 'name' },
];

const createAssignment = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUserId(req.user.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);
    const files = req.files ?? [];
    const attachments = files.map(fileToAttachment);
    const { classId, sectionId, academicYearId, ...rest } = req.body;
    const assignment = await Assignment.create({
      ...rest,
      class: classId,
      ...(sectionId && { section: sectionId }),
      academicYear: academicYearId,
      teacher: teacher._id,
      attachments,
    });
    const populated = await assignment.populate(POPULATE);
    sendSuccess(res, 'Assignment created', populated, 201);
  } catch (err) { next(err); }
};

const updateAssignment = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUserId(req.user.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);
    const assignment = await Assignment.findOne({ _id: req.params.id, teacher: teacher._id });
    if (!assignment) throw new AppError('Assignment not found or not yours', 404);
    const newFiles = req.files ?? [];
    const newAttachments = newFiles.map(fileToAttachment);
    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, ...(newAttachments.length && { attachments: [...assignment.attachments, ...newAttachments] }) } },
      { new: true, runValidators: true }
    ).populate(POPULATE);
    sendSuccess(res, 'Assignment updated', updated);
  } catch (err) { next(err); }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUserId(req.user.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, teacher: teacher._id });
    if (!assignment) throw new AppError('Assignment not found or not yours', 404);
    assignment.attachments.forEach((a) => { try { fs.unlinkSync(a.path); } catch {} });
    sendSuccess(res, 'Assignment deleted');
  } catch (err) { next(err); }
};

const getAssignments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.user.role === 'TEACHER') {
      const teacher = await getTeacherByUserId(req.user.userId);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      filter.teacher = teacher._id;
    }
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.subject) filter.subject = req.query.subject;
    const total = await Assignment.countDocuments(filter);
    const assignments = await Assignment.find(filter).populate(POPULATE).sort({ dueDate: 1 }).skip((page - 1) * limit).limit(limit).lean();

    // Attach submissionCount + totalStudents to each assignment
    const assignmentIds = assignments.map((a) => a._id);
    const [submissionCounts, studentCounts] = await Promise.all([
      AssignmentSubmission.aggregate([
        { $match: { assignment: { $in: assignmentIds } } },
        { $group: { _id: '$assignment', count: { $sum: 1 } } },
      ]),
      Assignment.aggregate([
        { $match: { _id: { $in: assignmentIds } } },
        { $lookup: { from: 'students', let: { cls: '$class', sec: '$section' }, pipeline: [
          { $match: { $expr: { $and: [
            { $eq: ['$class', '$$cls'] },
            { $eq: ['$status', 'ACTIVE'] },
            { $or: [{ $eq: ['$$sec', null] }, { $eq: ['$section', '$$sec'] }] },
          ] } } },
        ], as: 'students' } },
        { $project: { count: { $size: '$students' } } },
      ]),
    ]);
    const subMap = new Map(submissionCounts.map((s) => [s._id.toString(), s.count]));
    const stuMap = new Map(studentCounts.map((s) => [s._id.toString(), s.count]));
    const enriched = assignments.map((a) => ({
      ...a,
      submissionCount: subMap.get(a._id.toString()) ?? 0,
      totalStudents: stuMap.get(a._id.toString()) ?? 0,
    }));

    sendSuccess(res, 'Assignments fetched', enriched, 200, { total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate(POPULATE).lean();
    if (!assignment) throw new AppError('Assignment not found', 404);
    sendSuccess(res, 'Assignment fetched', assignment);
  } catch (err) { next(err); }
};

const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.id })
      .populate([{ path: 'student', select: 'name studentId rollNumber' }])
      .sort({ submittedAt: -1 }).lean();
    sendSuccess(res, 'Submissions fetched', submissions);
  } catch (err) { next(err); }
};

const gradeSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await AssignmentSubmission.findByIdAndUpdate(
      req.params.submissionId,
      { $set: { marks, feedback, status: 'GRADED', gradedAt: new Date(), gradedBy: new mongoose.Types.ObjectId(req.user.userId) } },
      { new: true }
    ).populate([{ path: 'student', select: 'name studentId' }]);
    if (!submission) throw new AppError('Submission not found', 404);
    sendSuccess(res, 'Submission graded', submission);
  } catch (err) { next(err); }
};

const getMyAssignments = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.userId }).select('class section academicYear');
    if (!student) throw new AppError('Student profile not found', 404);
    const filter = { class: student.class, academicYear: student.academicYear };
    if (student.section) filter.$or = [{ section: student.section }, { section: { $exists: false } }];
    const assignments = await Assignment.find(filter).populate(POPULATE).sort({ dueDate: 1 }).lean();
    const studentDoc = await Student.findOne({ user: req.user.userId }).select('_id');
    const submissions = await AssignmentSubmission.find({
      assignment: { $in: assignments.map((a) => a._id) },
      student: studentDoc._id,
    }).lean();
    const subMap = new Map(submissions.map((s) => [s.assignment.toString(), s]));
    const result = assignments.map((a) => ({ ...a, submission: subMap.get(a._id.toString()) ?? null }));
    sendSuccess(res, 'Assignments fetched', result);
  } catch (err) { next(err); }
};

const submitAssignment = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.userId }).select('_id');
    if (!student) throw new AppError('Student profile not found', 404);
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new AppError('Assignment not found', 404);
    const existing = await AssignmentSubmission.findOne({ assignment: req.params.id, student: student._id });
    if (existing) throw new AppError('Already submitted', 409);
    const files = req.files ?? [];
    const attachments = files.map(fileToAttachment);
    const isLate = new Date() > assignment.dueDate;
    const submission = await AssignmentSubmission.create({
      assignment: req.params.id,
      student: student._id,
      attachments,
      note: req.body.note,
      status: isLate ? 'LATE' : 'SUBMITTED',
      submittedAt: new Date(),
    });
    sendSuccess(res, 'Assignment submitted', submission, 201);
  } catch (err) { next(err); }
};

const getMySubmission = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.userId }).select('_id');
    if (!student) throw new AppError('Student profile not found', 404);
    const submission = await AssignmentSubmission.findOne({ assignment: req.params.id, student: student._id }).lean();
    sendSuccess(res, 'Submission fetched', submission);
  } catch (err) { next(err); }
};

const downloadFile = async (req, res, next) => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
    if (!fs.existsSync(filePath)) throw new AppError('File not found', 404);
    res.download(filePath);
  } catch (err) { next(err); }
};

module.exports = { createAssignment, updateAssignment, deleteAssignment, getAssignments, getAssignment, getSubmissions, gradeSubmission, getMyAssignments, submitAssignment, getMySubmission, downloadFile };
