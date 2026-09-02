import { Router } from 'express';
import { login, logout, refresh, getMe, changePassword, register } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateLogin, validateChangePassword, validateRegister } from '../validators/authValidator';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.patch('/change-password', authenticate, validateChangePassword, changePassword);

export default router;
