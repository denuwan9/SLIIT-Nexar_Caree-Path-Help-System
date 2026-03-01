const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { profileValidator } = require('../middleware/validators');

router.use(protect); // All profile routes require login

// ── Student — own profile ─────────────────────────────────────────
router.get('/me', restrictTo('student'), profileController.getMyProfile);
router.put('/me', restrictTo('student'), profileValidator, validate, profileController.updateMyProfile);

// Education sub-resource
router.post('/me/education', restrictTo('student'), profileController.addEducation);
router.delete('/me/education/:eduId', restrictTo('student'), profileController.removeEducation);

// Experience sub-resource
router.post('/me/experience', restrictTo('student'), profileController.addExperience);
router.delete('/me/experience/:expId', restrictTo('student'), profileController.removeExperience);

// ── Admin — all profiles ──────────────────────────────────────────
router.get('/', restrictTo('admin'), profileController.getAllProfiles);
router.get('/:id', restrictTo('admin'), profileController.getProfileById);

module.exports = router;
