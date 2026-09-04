const { User } = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services/authService');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { name, email, password, profileImage } = req.body;
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) throw new AppError('Email already in use', 409);

    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password, role: 'ADMIN', profileImage });
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    user.refreshToken = refreshToken;
    await user.save();
    sendSuccess(res, 'Admin account created', { accessToken, refreshToken, user }, 201);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password', 401);
    if (user.status !== 'ACTIVE') throw new AppError('Your account has been suspended. Contact admin.', 403);

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();
    sendSuccess(res, 'Login successful', { accessToken, refreshToken, user });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { refreshToken: undefined });
    sendSuccess(res, 'Logged out successfully');
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token is required', 400);

    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) throw new AppError('Invalid refresh token', 401);
    if (user.status !== 'ACTIVE') throw new AppError('Account is inactive', 403);

    const newPayload = { userId: user._id.toString(), role: user.role };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);
    user.refreshToken = newRefreshToken;
    await user.save();
    sendSuccess(res, 'Token refreshed', { accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError('User not found', 404);
    sendSuccess(res, 'User fetched successfully', user);
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId).select('+password');
    if (!user) throw new AppError('User not found', 404);
    if (!(await user.comparePassword(currentPassword))) throw new AppError('Current password is incorrect', 400);
    user.password = newPassword;
    await user.save();
    sendSuccess(res, 'Password changed successfully');
  } catch (err) { next(err); }
};

module.exports = { register, login, logout, refresh, getMe, changePassword };
