const { Router } = require('express');
const { login, logout, refresh, getMe, changePassword, register } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateLogin, validateChangePassword, validateRegister } = require('../validators/authValidator');

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.patch('/change-password', authenticate, validateChangePassword, changePassword);

module.exports = router;
