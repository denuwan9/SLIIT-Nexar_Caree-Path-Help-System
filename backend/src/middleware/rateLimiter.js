const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

/**
 * globalLimiter — applies to all /api routes.
 * 200 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new AppError('Too many requests from this IP, please try again after 15 minutes.', 429));
    },
});

/**
 * authLimiter — stricter limit for login/register endpoints.
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new AppError('Too many authentication attempts. Please try again later.', 429));
    },
});

module.exports = { globalLimiter, authLimiter };
