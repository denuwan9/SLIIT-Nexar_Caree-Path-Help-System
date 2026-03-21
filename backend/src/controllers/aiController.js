/**
 * aiController.js
 * ──────────────────────────────────────────────────────────────────────────
 * Handles all four AI-powered endpoints:
 *   POST /api/v1/ai/chat      — conversational career advisor
 *   POST /api/v1/ai/simulate  — 3-phase career path simulator
 *   POST /api/v1/ai/skill-gap — skill gap analyzer vs. job description
 *   POST /api/v1/ai/resume    — ATS resume analyzer
 *
 * All routes are protected (JWT auth). The student's profile is fetched
 * from MongoDB and injected into every Grok prompt automatically.
 * ──────────────────────────────────────────────────────────────────────────
 */

const AppError = require('../utils/AppError');
const StudentProfile = require('../models/StudentProfile');
const pdfParse = require('pdf-parse');
const groqService = require('../services/GroqService');
const logger = require('../utils/logger');

// ── Helper: Load the requesting student's profile ─────────────────────────
const getStudentProfile = async (userId) => {
    const profile = await StudentProfile.findOne({ user: userId });
    if (!profile) {
        throw new AppError(
            'No student profile found. Please complete your profile before using AI features.',
            404
        );
    }
    return profile;
};

// ═══════════════════════════════════════════════════════════════════════════
//  1. CONVERSATIONAL AI ADVISOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/ai/chat
 * Body: { message: string, history?: [{role, content}] }
 */
exports.chat = async (req, res, next) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return next(new AppError('Message is required.', 400));
        }
        if (message.trim().length > 2000) {
            return next(new AppError('Message cannot exceed 2000 characters.', 400));
        }

        const profile = await getStudentProfile(req.user._id);

        const reply = await groqService.generateCareerAdvice(
            profile,
            message.trim(),
            history
        );

        res.status(200).json({
            status: 'success',
            data: { reply },
        });
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════════════
//  2. CAREER PATH SIMULATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/ai/simulate
 * Body: { targetRole: string }
 * Returns 3-phase JSON roadmap from GrokService
 */
exports.simulateCareer = async (req, res, next) => {
    try {
        const { targetRole, currentLevel } = req.body;

        if (!targetRole || typeof targetRole !== 'string' || targetRole.trim().length === 0) {
            return next(new AppError('targetRole is required.', 400));
        }
        if (targetRole.trim().length > 150) {
            return next(new AppError('Target role cannot exceed 150 characters.', 400));
        }

        const profile = await getStudentProfile(req.user._id);

        let roadmap;
        try {
            roadmap = await groqService.simulateCareerPath(profile, targetRole.trim(), currentLevel);
        } catch (_parseErr) {
            return next(new AppError('AI returned an unexpected format. Please try again.', 502));
        }

        res.status(200).json({
            status: 'success',
            data: { roadmap },
        });
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════════════
//  3. SKILL GAP ANALYZER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/ai/skill-gap
 * Body: { jobDescription: string }
 * Returns missingSkills[], recommendedResources[], urgencyScore
 */
exports.analyzeSkillGap = async (req, res, next) => {
    try {
        const { targetRole } = req.body;

        if (!targetRole || typeof targetRole !== 'string' || targetRole.trim().length < 2) {
            return next(new AppError('Please provide a target role of at least 2 characters.', 400));
        }
        if (targetRole.trim().length > 150) {
            return next(new AppError('Target role cannot exceed 150 characters.', 400));
        }

        const profile = await getStudentProfile(req.user._id);

        let analysis;
        try {
            analysis = await groqService.analyzeSkillGap(profile, targetRole.trim());
        } catch (_parseErr) {
            return next(new AppError('AI returned an unexpected format. Please try again.', 502));
        }

        res.status(200).json({
            status: 'success',
            data: { analysis },
        });
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════════════
//  4. RESUME ATS ANALYZER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/ai/resume
 * Body: { resumeText: string }
 * Returns atsScore, keywordsToAdd[], improvements[]
 */
exports.analyzeResume = async (req, res, next) => {
    try {
        const { resumeText, targetRole = 'General' } = req.body;

        if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 100) {
            return next(new AppError('Please paste your resume text (at least 100 characters).', 400));
        }
        if (resumeText.trim().length > 10000) {
            return next(new AppError('Resume text cannot exceed 10000 characters.', 400));
        }

        const profile = await getStudentProfile(req.user._id);

        let report;
        try {
            report = await groqService.analyzeResume(profile, resumeText.trim(), targetRole);
        } catch (_parseErr) {
            return next(new AppError('AI returned an unexpected format. Please try again.', 502));
        }

        res.status(200).json({
            status: 'success',
            data: { report },
        });
    } catch (error) { next(error); }
};

/**
 * POST /api/v1/ai/extract-text
 * Accepts a PDF file and returns extracted text.
 */
exports.extractText = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('Please upload a PDF file.', 400));
        }

        // Check if it's a PDF
        if (req.file.mimetype !== 'application/pdf') {
            return next(new AppError('Only PDF files are supported for text extraction.', 400));
        }

        const dataBuffer = req.file.buffer;
        const data = await pdfParse(dataBuffer);

        res.status(200).json({
            status: 'success',
            data: {
                text: data.text,
                pageCount: data.numpages
            }
        });
    } catch (error) {
        return next(new AppError(`Text extraction failed: ${error.message}`, 500));
    }
};
