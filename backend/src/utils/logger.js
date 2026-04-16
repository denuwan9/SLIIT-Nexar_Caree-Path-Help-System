const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        // Console output (colorized in dev)
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                errors({ stack: true }),
                logFormat
            ),
        }),
    ],
});

// ── Only add File transports in development ─────────────────────────────
// Vercel serverless has a read-only filesystem, trying to write logs crashes it
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
    }));
    logger.add(new winston.transports.File({
        filename: path.join('logs', 'combined.log'),
    }));
}

module.exports = logger;
