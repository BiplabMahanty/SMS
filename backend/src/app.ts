import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import studentRouter from './routes/students';
import teacherRouter from './routes/teachers';
import subjectRouter from './routes/subjects';
import timetableRouter from './routes/timetable';
import attendanceRouter from './routes/attendance';
import classesRouter from './routes/classesAcademicYears';
import assignmentsRouter from './routes/assignments';
import studyMaterialsRouter from './routes/studyMaterials';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

// 👇 ADD THESE 2 LINES
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/students', studentRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/subjects', subjectRouter);
app.use('/api/timetable', timetableRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api', classesRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/study-materials', studyMaterialsRouter);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;
