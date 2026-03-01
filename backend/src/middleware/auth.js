const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * protect — verifies the JWT access token.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
    try {
        // 1) Extract token
        let token;
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in. Please log in to get access.', 401));
        }

        // 2) Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
        if (!currentUser) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        // 4) Check if user account is active
        if (!currentUser.isActive) {
            return next(new AppError('Your account has been deactivated. Contact an administrator.', 403));
        }

        // 5) Check if password was changed after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('User recently changed password. Please log in again.', 401));
        }

        // 6) Grant access
        req.user = currentUser;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token. Please log in again.', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Your session has expired. Please log in again.', 401));
        }
        logger.error(`Auth middleware error: ${error.message}`);
        next(error);
    }
};

/**
 * restrictTo — role-based access control.
 * Usage: restrictTo('admin')  or  restrictTo('admin', 'student')
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action.', 403)
            );
        }
        next();
    };
};

module.exports = { protect, restrictTo };
