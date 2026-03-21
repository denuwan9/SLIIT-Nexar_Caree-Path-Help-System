/**
 * aiRoutes.js
 * All four AI endpoints are protected — only authenticated students may use them.
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { uploadResumeMiddleware } = require('../middleware/upload');

// All routes require a valid JWT
router.use(protect);

// POST /api/v1/ai/chat       — conversational career advisor
router.post('/chat', aiController.chat);

// POST /api/v1/ai/simulate   — career path simulator (returns JSON roadmap)
router.post('/simulate', aiController.simulateCareer);

// POST /api/v1/ai/skill-gap  — skill gap analysis vs. job description
router.post('/skill-gap', aiController.analyzeSkillGap);

// POST /api/v1/ai/resume     — ATS resume analysis (Supports text or PDF upload)
router.post('/resume', uploadResumeMiddleware, aiController.analyzeResume);

module.exports = router;
