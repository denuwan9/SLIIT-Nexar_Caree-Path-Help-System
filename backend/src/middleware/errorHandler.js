const logger = require('../utils/logger');

// ── Specific error handlers ────────────────────────────────────────

/** Mongoose cast error (e.g., invalid ObjectId) */
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    const AppError = require('../utils/AppError');
    return new AppError(message, 400);
};

/** Mongoose duplicate key error */
const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value "${value}" for field "${field}". Please use a different value.`;
    const AppError = require('../utils/AppError');
    return new AppError(message, 400);
};

/** Mongoose validation error */
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    const AppError = require('../utils/AppError');
    return new AppError(message, 400);
};

/** JWT signature invalid */
const handleJWTError = () => {
    const AppError = require('../utils/AppError');
    return new AppError('Invalid token. Please log in again.', 401);
};

/** JWT expired */
const handleJWTExpiredError = () => {
    const AppError = require('../utils/AppError');
    return new AppError('Your session has expired. Please log in again.', 401);
};

// ── Response senders ──────────────────────────────────────────────

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or unknown error: don't leak details
        logger.error('UNEXPECTED ERROR:', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong. Please try again later.',
        });
    }
};

// ── Global Error Handler (4-argument Express signature) ───────────
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    logger.error(
        `[${req.method}] ${req.originalUrl} → ${err.statusCode}: ${err.message}`
    );

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err, message: err.message, name: err.name };

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

module.exports = globalErrorHandler;
