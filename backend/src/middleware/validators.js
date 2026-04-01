const { body } = require('express-validator');

// ── Auth validators ────────────────────────────────────────────────
const registerValidator = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2–50 characters')
        .matches(/^[A-Za-z\s\-]+$/).withMessage('Only alphabets are allowed'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2–50 characters')
        .matches(/^[A-Za-z\s\-]+$/).withMessage('Only alphabets are allowed'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .matches(/^[a-zA-Z0-9._%+-]+@(my\.)?sliit\.lk$/).withMessage('Only @sliit.lk and @my.sliit.lk institutional emails are allowed')
        .normalizeEmail(),
    body('skillSet')
        .optional()
        .isArray().withMessage('Skill set must be an array'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must include at least one special character')
        .matches(/[0-9]/).withMessage('Password must include at least one number'),
    body('role')
        .optional()
        .isIn(['student', 'admin']).withMessage('Role must be student or admin'),
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .matches(/^[a-zA-Z0-9._%+-]+@(my\.)?sliit\.lk$/).withMessage('Please use your @sliit.lk or @my.sliit.lk email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

// ── Profile: general update validator ─────────────────────────────
const profileValidator = [
    body('firstName')
        .optional().trim()
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2–50 characters'),
    body('lastName')
        .optional().trim()
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2–50 characters'),
    body('headline')
        .optional().trim()
        .isLength({ max: 120 }).withMessage('Headline cannot exceed 120 characters'),
    body('bio')
        .optional().trim()
        .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),
    body('phone')
        .optional({ checkFalsy: true })
        .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Please provide a valid phone number'),
    body('dateOfBirth')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Date of birth must be a valid date')
        .custom((v) => { if (new Date(v) >= new Date()) throw new Error('Date of birth cannot be in the future'); return true; }),
    body('gender')
        .optional()
        .isIn(['male', 'female', 'non-binary', 'prefer-not-to-say', '']).withMessage('Invalid gender value'),
    body('university').optional().trim().isLength({ max: 150 }),
    body('faculty').optional().trim().isLength({ max: 150 }),
    body('major').optional().trim().isLength({ max: 100 }),
    body('yearOfStudy').optional().isInt({ min: 1, max: 6 }).withMessage('Year of study must be 1–6'),
    body('gpa').optional({ checkFalsy: true }).isFloat({ min: 0, max: 4.0 }).withMessage('GPA must be 0–4.0'),
    body('age').optional({ checkFalsy: true }).isInt({ min: 16 }).withMessage('Minimum age is 16'),
    body('address').optional().trim().isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
    body('preferredCareerField').optional().trim().isLength({ max: 100 }),
    body('careerField')
        .optional()
        .isIn(['software-engineering', 'data-science', 'cybersecurity', 'cloud-devops', 'ui-ux-design',
            'mobile-development', 'networking', 'ai-machine-learning', 'business-analysis',
            'project-management', 'other', ''])
        .withMessage('Invalid career field'),
    body('careerObjective').optional().trim().isLength({ max: 500 }),
    body('isPublic').optional().isBoolean(),
    body('isActivelyLooking').optional().isBoolean(),
    body('socialLinks.linkedin')
        .optional({ checkFalsy: true })
        .matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/.+/).withMessage('Invalid LinkedIn URL'),
    body('socialLinks.github')
        .optional({ checkFalsy: true })
        .matches(/^(https?:\/\/)?(www\.)?github\.com\/.+/).withMessage('Invalid GitHub URL'),
    body('socialLinks.portfolio')
        .optional({ checkFalsy: true })
        .isURL().withMessage('Portfolio must be a valid URL'),
    body('socialLinks.website')
        .optional({ checkFalsy: true })
        .isURL().withMessage('Website must be a valid URL'),
    body('resumeUrl')
        .optional({ checkFalsy: true })
        .isURL().withMessage('Resume URL must be a valid URL'),
];

// ── Profile: education entry validator ────────────────────────────
const educationValidator = [
    body('institution')
        .trim().notEmpty().withMessage('Institution name is required')
        .isLength({ max: 150 }).withMessage('Institution name cannot exceed 150 characters'),
    body('degree')
        .notEmpty().withMessage('Degree is required')
        .isIn(["Certificate", "Diploma", "HND", "Bachelor's", "Master's", "PhD", "Other"])
        .withMessage('Invalid degree type'),
    body('field')
        .trim().notEmpty().withMessage('Field of study is required')
        .isLength({ max: 100 }),
    body('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date'),
    body('endDate')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('End date must be a valid date')
        .custom((v, { req }) => {
            if (v && new Date(v) <= new Date(req.body.startDate)) throw new Error('End date must be after start date');
            return true;
        }),
    body('gpa').optional({ checkFalsy: true }).isFloat({ min: 0, max: 4.0 }).withMessage('GPA must be 0–4.0'),
    body('description').optional().trim().isLength({ max: 300 }),
    body('achievements').optional().isArray().withMessage('Achievements must be an array'),
    body('achievements.*').optional().isString().trim().isLength({ max: 200 }),
];

// ── Profile: experience entry validator ───────────────────────────
const experienceValidator = [
    body('title')
        .trim().notEmpty().withMessage('Job title is required')
        .isLength({ max: 100 }),
    body('company')
        .trim().notEmpty().withMessage('Company name is required')
        .isLength({ max: 100 }),
    body('type')
        .notEmpty().withMessage('Employment type is required')
        .isIn(['full-time', 'part-time', 'internship', 'contract', 'freelance', 'volunteer', 'project'])
        .withMessage('Invalid employment type'),
    body('location').optional().trim().isLength({ max: 100 }),
    body('isRemote').optional().isBoolean(),
    body('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date'),
    body('endDate')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('End date must be a valid date')
        .custom((v, { req }) => {
            if (v && new Date(v) <= new Date(req.body.startDate)) throw new Error('End date must be after start date');
            return true;
        }),
    body('isCurrent').optional().isBoolean(),
    body('description').optional().trim().isLength({ max: 800 }),
    body('responsibilities').optional().isArray().withMessage('Responsibilities must be an array'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
];

// ── Profile: project entry validator ──────────────────────────────
const projectValidator = [
    body('title')
        .trim().notEmpty().withMessage('Project title is required')
        .isLength({ max: 120 }),
    body('description').optional().trim().isLength({ max: 600 }),
    body('technologiesUsed').optional().isArray().withMessage('Technologies must be an array'),
    body('githubLink')
        .optional({ checkFalsy: true })
        .matches(/^(https?:\/\/)?(www\.)?github\.com\/.+/).withMessage('Invalid GitHub repository URL'),
];

// ── Profile: technical skill entry validator ──────────────────────
const technicalSkillValidator = [
    body('name')
        .trim().notEmpty().withMessage('Skill name is required')
        .isLength({ max: 60 }).withMessage('Skill name cannot exceed 60 characters'),
    body('category')
        .optional()
        .isIn(['programming-language', 'framework', 'database', 'cloud', 'devops', 'mobile',
            'design', 'data-science', 'testing', 'other'])
        .withMessage('Invalid skill category'),
    body('level')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
        .withMessage('Level must be beginner, intermediate, advanced, or expert'),
    body('yearsOfExp')
        .optional()
        .isFloat({ min: 0, max: 50 }).withMessage('Years of experience must be between 0 and 50'),
];

// ── Profile: soft skill entry validator ───────────────────────────
const softSkillValidator = [
    body('name')
        .trim().notEmpty().withMessage('Soft skill name is required')
        .isLength({ max: 60 }).withMessage('Soft skill name cannot exceed 60 characters'),
    body('level')
        .optional()
        .isIn(['developing', 'proficient', 'advanced', 'expert'])
        .withMessage('Invalid proficiency level'),
];

// ── Profile: language entry validator ─────────────────────────────
const languageValidator = [
    body('name')
        .trim().notEmpty().withMessage('Language name is required')
        .isLength({ max: 50 }),
    body('proficiency')
        .notEmpty().withMessage('Proficiency level is required')
        .isIn(['elementary', 'limited-working', 'professional', 'full-professional', 'native'])
        .withMessage('Invalid language proficiency level'),
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
            .custom((val, { req }) => {
                let parsed;
                if (Array.isArray(val)) {
                    parsed = val;
                } else {
                    try {
                        parsed = JSON.parse(val);
                    } catch {
                        throw new Error('Subjects must be an array');
                    }
                }
                if (!Array.isArray(parsed)) throw new Error('Subjects must be an array');

                const hasDocs = Array.isArray(req.files) && req.files.length > 0;
                if (!hasDocs && parsed.length === 0) {
                    throw new Error('Subjects must be a non-empty array when no study documents are uploaded');
                }
                return true;
            }),
    body('subjects.*.name')
        .optional()
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

// ── Application validator ──────────────────────────────────────────
const applicationValidator = [
    body('jobPostId')
        .notEmpty().withMessage('Job post ID is required')
        .isMongoId().withMessage('Invalid job post ID'),
    body('coverLetter')
        .optional()
        .isLength({ max: 2000 }).withMessage('Cover letter cannot exceed 2000 characters'),
    body('resume').optional().isString(),
];

// ── Career Day Event validator ─────────────────────────────────────
const careerDayEventValidator = [
    body('title').trim().notEmpty().withMessage('Event title is required'),
    body('eventDate')
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Event date must be a valid ISO date')
        .custom((value) => {
            if (new Date(value) < new Date()) throw new Error('Event date must be in the future');
            return true;
        }),
    body('startTime')
        .optional()
        .matches(/^\d{2}:\d{2}$/).withMessage('Start time must be in HH:mm format'),
    body('endTime')
        .optional()
        .matches(/^\d{2}:\d{2}$/).withMessage('End time must be in HH:mm format'),
    body('slotDurationMinutes')
        .optional()
        .isInt({ min: 10, max: 120 }).withMessage('Slot duration must be 10–120 minutes'),
    body('maxBookingsPerStudent')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Max bookings per student must be 1–5'),
    body('companies')
        .isArray({ min: 1, max: 20 }).withMessage('Career Day must have 1–20 companies'),
    body('companies.*.name')
        .trim().notEmpty().withMessage('Each company must have a name'),
];

// ── Normal Day Event validator ─────────────────────────────────────
const normalDayEventValidator = [
    body('title').trim().notEmpty().withMessage('Event title is required'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('eventDate')
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Event date must be a valid ISO date')
        .custom((value) => {
            if (new Date(value) < new Date()) throw new Error('Event date must be in the future');
            return true;
        }),
    body('startTime')
        .optional()
        .matches(/^\d{2}:\d{2}$/).withMessage('Start time must be in HH:mm format'),
    body('endTime')
        .optional()
        .matches(/^\d{2}:\d{2}$/).withMessage('End time must be in HH:mm format'),
    body('slotDurationMinutes')
        .optional()
        .isInt({ min: 10, max: 120 }).withMessage('Slot duration must be 10–120 minutes'),
    body('maxCandidates')
        .optional()
        .isInt({ min: 1, max: 500 }).withMessage('Max candidates must be 1–500'),
];

module.exports = {
    registerValidator,
    loginValidator,
    profileValidator,
    educationValidator,
    experienceValidator,
    projectValidator,
    technicalSkillValidator,
    softSkillValidator,
    languageValidator,
    interviewEventValidator,
    careerDayEventValidator,
    normalDayEventValidator,
    studyPlanValidator,
    jobPostValidator,
    applicationValidator,
};
