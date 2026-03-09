const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { globalLimiter } = require('./middleware/rateLimiter');

// ── Route imports ──────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const studyPlanRoutes = require('./routes/studyPlanRoutes');
const jobPostRoutes = require('./routes/jobPostRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ── Security middleware ────────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// ── Logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ── Body parsers ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Static files: serve uploaded avatars ──────────────────────────
app.use('/uploads', express.static('uploads'));

// ── Global rate limiter ────────────────────────────────────────────
app.use('/api', globalLimiter);

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Career Path Simulator API is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ── API routes ────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/study-plans', studyPlanRoutes);
app.use('/api/v1/jobs', jobPostRoutes);
app.use('/api/v1/ai', aiRoutes);

// ── 404 handler ───────────────────────────────────────────────────
app.all('*', (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found on this server.`, 404));
});

// ── Global error handler ──────────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
