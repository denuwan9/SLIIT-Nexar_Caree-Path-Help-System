/**
 * profileRoutes.js (Rebuilt)
 */
const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadAvatarMiddleware } = require('../middleware/cloudinaryUpload');
const ctrl = require('../controllers/profileController');

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// ── Core profile
router.get('/me', ctrl.getMyProfile);
router.put('/me', ctrl.updateMyProfile);

// ── Avatar
router.post('/me/avatar', uploadAvatarMiddleware, ctrl.uploadAvatar);

// ── Education
router.post('/me/education', ctrl.addEducation);
router.delete('/me/education/:id', ctrl.removeEducation);

// ── Experience
router.post('/me/experience', ctrl.addExperience);
router.delete('/me/experience/:id', ctrl.removeExperience);

// ── Projects
router.post('/me/projects', ctrl.addProject);
router.delete('/me/projects/:id', ctrl.removeProject);

// ── Technical Skills
router.post('/me/skills/technical', ctrl.addTechnicalSkill);
router.delete('/me/skills/technical/:id', ctrl.removeTechnicalSkill);

// ── Soft Skills
router.post('/me/skills/soft', ctrl.addSoftSkill);
router.delete('/me/skills/soft/:id', ctrl.removeSoftSkill);

// ── Social Links
router.patch('/me/social', ctrl.updateSocialLinks);

// ── Career Goals
router.patch('/me/career-goals', ctrl.updateCareerGoals);

module.exports = router;
