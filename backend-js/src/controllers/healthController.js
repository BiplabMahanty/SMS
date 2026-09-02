const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/response');

const healthCheck = (_req, res) => {
  sendSuccess(res, 'Student Management API is running', {
    status: 'healthy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};

module.exports = { healthCheck };
