const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendTokenResponse, verifyRefreshToken, signAccessToken } = require('../services/jwtService');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Public — create a new user account
 */
exports.register = async (req, res, next) => {
    try {
        const { fullName, eduEmail, password, currentMajor, skillSet, targetRole, role } = req.body;

        // Prevent self-registration as admin
        if (role === 'admin' && (!req.user || req.user.role !== 'admin')) {
            return next(new AppError('You are not authorized to create admin accounts.', 403));
        }

        const existingUser = await User.findOne({ eduEmail });
        if (existingUser) {
            return next(new AppError('An account with this institutional email already exists.', 409));
        }

        const user = await User.create({
            fullName,
            eduEmail,
            password,
            currentMajor,
            skillSet: skillSet || [],
            targetRole,
            role: role || 'student'
        });

        logger.info(`New user registered: ${user.eduEmail} (${user.role})`);
        const refreshToken = sendTokenResponse(user, 201, res);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
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
        const { eduEmail, password } = req.body;

        // Select password explicitly
        const user = await User.findOne({ eduEmail }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError('Incorrect email or password.', 401));
        }

        if (!user.isActive) {
            return next(new AppError('Your account has been deactivated. Contact support.', 403));
        }

        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        logger.info(`User logged in: ${user.eduEmail}`);
        const refreshToken = sendTokenResponse(user, 200, res);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
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
