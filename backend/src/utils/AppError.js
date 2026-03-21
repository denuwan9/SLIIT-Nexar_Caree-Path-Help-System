/**
 * Custom error class that extends the native Error object.
 * Allows setting an HTTP status code alongside the message.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // distinguish from programming errors

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
