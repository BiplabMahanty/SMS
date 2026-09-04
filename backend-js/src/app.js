const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dns = require('dns');
const path = require('path');
const { config } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/health', require('./routes/health'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api', require('./routes/classesAcademicYears'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/study-materials', require('./routes/studyMaterials'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
