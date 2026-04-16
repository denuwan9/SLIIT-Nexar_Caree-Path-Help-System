const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// ── Uncaught exception handler ─────────────────────────────────────
process.on('uncaughtException', (err) => {
    logger.error(`UNCAUGHT EXCEPTION: ${err.name} — ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});

// ── Start server ──────────────────────────────────────────────────
const startServer = async () => {
    await connectDB();

    const server = app.listen(PORT, () => {
        logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        logger.info(`📡 API base URL: http://localhost:${PORT}/api/v1`);
    });

    // ── Unhandled promise rejections ──────────────────────────────────
    process.on('unhandledRejection', (err) => {
        logger.error(`UNHANDLED REJECTION: ${err.name} — ${err.message}`);
        // In development, log the error but keep the server running
        // so that a single bad request (e.g. Cloudinary config) doesn't kill dev workflow
        if (process.env.NODE_ENV === 'production') {
            server.close(() => {
                logger.warn('Server closed due to unhandled rejection. Exiting...');
                process.exit(1);
            });
        } else {
            logger.warn('Unhandled rejection caught in development — server kept alive.');
        }
    });

    // ── Graceful shutdown on SIGTERM (e.g., Docker / cloud platforms) ─
    process.on('SIGTERM', () => {
        logger.info('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            logger.info('Process terminated.');
        });
    });
};

startServer();
