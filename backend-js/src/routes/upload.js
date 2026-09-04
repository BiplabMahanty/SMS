const { Router } = require('express');
const path = require('path');
const { upload } = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { sendSuccess } = require('../utils/response');
const { config } = require('../config/env');

const router = Router();
router.use(authenticate);

const profileUpload = upload.single('photo');

router.post('/profile-image', (req, res, next) => {
  profileUpload(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next(new Error('No file uploaded'));
    const baseUrl = config.baseUrl || `http://localhost:${config.port || 5000}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    sendSuccess(res, 'Photo uploaded', { url }, 201);
  });
});

module.exports = router;
