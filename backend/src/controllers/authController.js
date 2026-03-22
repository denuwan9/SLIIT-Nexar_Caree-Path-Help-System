const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AppError = require('../utils/AppError');
const { sendTokenResponse, verifyRefreshToken, signAccessToken } = require('../services/jwtService');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Public — create a new user account
 */
exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, currentMajor, skillSet, targetRole, role } = req.body;

        // Prevent self-registration as admin
        if (role === 'admin' && (!req.user || req.user.role !== 'admin')) {
            return next(new AppError('You are not authorized to create admin accounts.', 403));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('An account with this email already exists.', 409));
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            currentMajor,
            skillSet: skillSet || [],
            targetRole,
            role: role || 'student'
        });

        // ── Proactive Profile Creation ───────────────────────────────────
        // Ensures the dashboard can fetch a profile immediately
        await StudentProfile.create({
            user: user._id,
            firstName,
            lastName,
            major: currentMajor || '',
        });

        const { signRefreshToken } = require('../services/jwtService');
        const refreshToken = signRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        logger.info(`New user registered: ${user.email} (${user.role})`);
        sendTokenResponse(user, 201, res, refreshToken);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 * Public — authenticate user and issue tokens
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Select password explicitly
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError('Email or password incorrect.', 401));
        }

        if (!user.isActive) {
            return next(new AppError('Your account has been deactivated. Contact support.', 403));
        }

        const { signRefreshToken } = require('../services/jwtService');
        const refreshToken = signRefreshToken(user._id);

        user.lastLogin = Date.now();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        logger.info(`User logged in: ${user.email}`);
        sendTokenResponse(user, 200, res, refreshToken);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/refresh
 * Public — exchange refresh token for a new access token
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) return next(new AppError('No refresh token provided.', 401));

        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== token) {
            return next(new AppError('Invalid refresh token. Please log in again.', 401));
        }

        const newAccessToken = signAccessToken(user._id, user.role);
        res.status(200).json({ status: 'success', accessToken: newAccessToken });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Refresh token expired. Please log in again.', 401));
        }
        next(error);
    }
};

/**
 * POST /api/auth/logout
 * Protected — clear refresh token cookie and DB entry
 */
exports.logout = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

        res.cookie('refreshToken', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });

        res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me
 * Protected — return currently authenticated user
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/auth/change-password
 * Protected — update current user's password
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (!user || !(await user.comparePassword(currentPassword))) {
            return next(new AppError('Current password is incorrect.', 401));
        }

        user.password = newPassword;
        await user.save();

        logger.info(`Password changed for: ${user.email}`);
        res.status(200).json({ status: 'success', message: 'Password updated successfully.' });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/auth/change-email
 * Protected — update current user's email
 */
exports.changeEmail = async (req, res, next) => {
    try {
        const { newEmail, password } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError('Password is incorrect.', 401));
        }

        const existing = await User.findOne({ email: newEmail });
        if (existing) {
            return next(new AppError('An account with this email already exists.', 409));
        }

        user.email = newEmail;
        await user.save({ validateBeforeSave: true });

        logger.info(`Email changed. New email: ${newEmail}`);
        res.status(200).json({ status: 'success', message: 'Email updated successfully.' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(new AppError('Only @sliit.lk emails are permitted.', 422));
        }
        next(error);
    }
};

/**
 * DELETE /api/auth/delete-account
 * Protected — permanently delete user and profile
 */
exports.deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError('Password is incorrect. Account not deleted.', 401));
        }

        await StudentProfile.findOneAndDelete({ user: user._id });
        await User.findByIdAndDelete(user._id);

        res.cookie('refreshToken', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });

        logger.info(`Account deleted: ${user.email}`);
        res.status(200).json({ status: 'success', message: 'Account permanently deleted.' });
    } catch (error) {
        next(error);
    }
};
