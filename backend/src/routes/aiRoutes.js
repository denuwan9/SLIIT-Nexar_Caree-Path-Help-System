/**
 * aiRoutes.js
 * All four AI endpoints are protected — only authenticated students may use them.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Multer selection: Use memory storage for direct buffer processing
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All routes require a valid JWT
router.use(protect);

// POST /api/v1/ai/chat       — conversational career advisor
router.post('/chat', aiController.chat);

// POST /api/v1/ai/simulate   — career path simulator (returns JSON roadmap)
router.post('/simulate', aiController.simulateCareer);

// POST /api/v1/ai/skill-gap  — skill gap analysis vs. job description
router.post('/skill-gap', aiController.analyzeSkillGap);

// POST /api/v1/ai/resume     — ATS resume analysis
router.post('/resume', aiController.analyzeResume);

// GET /api/v1/ai/recommendations — personalized dashboard cards
router.get('/recommendations', aiController.getRecommendations);

// POST /api/v1/ai/extract-text — PDF text extraction
router.post('/extract-text', upload.single('resume'), aiController.extractText);

module.exports = router;
