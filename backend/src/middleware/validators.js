const { body } = require('express-validator');

// ── Auth validators ────────────────────────────────────────────────
const registerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number'),
    body('role')
        .optional()
        .isIn(['student', 'admin']).withMessage('Role must be student or admin'),
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

// ── Profile validators ─────────────────────────────────────────────
const profileValidator = [
    body('university').optional().trim().isLength({ max: 100 }),
    body('major').optional().trim().isLength({ max: 100 }),
    body('yearOfStudy').optional().isInt({ min: 1, max: 6 }).withMessage('Year must be 1–6'),
    body('gpa').optional().isFloat({ min: 0, max: 4.0 }).withMessage('GPA must be between 0 and 4.0'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
];

// ── Interview validators ───────────────────────────────────────────
const interviewEventValidator = [
    body('title').trim().notEmpty().withMessage('Event title is required'),
    body('eventDate')
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Event date must be a valid ISO date')
        .custom((value) => {
            if (new Date(value) < new Date()) throw new Error('Event date must be in the future');
            return true;
        }),
    body('slotDurationMinutes')
        .optional()
        .isInt({ min: 10 }).withMessage('Slot duration must be at least 10 minutes'),
    body('maxBookingsPerStudent')
        .optional()
        .isInt({ min: 1 }).withMessage('Must allow at least 1 booking per student'),
];

// ── Study Plan validators ──────────────────────────────────────────
const studyPlanValidator = [
    body('title').trim().notEmpty().withMessage('Study plan title is required'),
    body('examStartDate')
        .notEmpty().withMessage('Exam start date is required')
        .isISO8601().withMessage('Must be a valid date'),
    body('examEndDate')
        .notEmpty().withMessage('Exam end date is required')
        .isISO8601().withMessage('Must be a valid date')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.examStartDate)) {
                throw new Error('Exam end date must be after start date');
            }
            return true;
        }),
    body('availableHoursPerDay')
        .optional()
        .isFloat({ min: 1, max: 16 }).withMessage('Must be between 1 and 16 hours'),
    body('subjects')
        .isArray({ min: 1 }).withMessage('At least one subject is required'),
    body('subjects.*.name')
        .notEmpty().withMessage('Each subject must have a name'),
];

// ── Job Post validators ────────────────────────────────────────────
const jobPostValidator = [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('summary')
        .trim()
        .notEmpty().withMessage('Professional summary is required')
        .isLength({ max: 1000 }).withMessage('Summary cannot exceed 1000 characters'),
    body('targetRole').trim().notEmpty().withMessage('Target role is required'),
    body('jobType')
        .optional()
        .isIn(['full-time', 'part-time', 'internship', 'contract', 'freelance']),
    body('skills').optional().isArray(),
];

module.exports = {
    registerValidator,
    loginValidator,
    profileValidator,
    interviewEventValidator,
    studyPlanValidator,
    jobPostValidator,
};
