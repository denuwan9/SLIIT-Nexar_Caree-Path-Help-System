const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadAvatarMiddleware } = require('../middleware/upload');
const {
    profileValidator,
    educationValidator,
    experienceValidator,
    technicalSkillValidator,
    softSkillValidator,
    languageValidator,
} = require('../middleware/validators');

// All profile routes require a logged-in user
router.use(protect);

// ── Student: own profile ──────────────────────────────────────────

// GET /api/v1/profile/me          → 200 — get own profile
router.get('/me', restrictTo('student'), profileController.getMyProfile);

// PUT /api/v1/profile/me          → 200 — update personal info / links etc.
router.put(
    '/me',
    restrictTo('student'),
    profileValidator, validate,
    profileController.updateMyProfile
);

// POST /api/v1/profile/me/avatar  → 200 — upload profile picture
router.post(
    '/me/avatar',
    restrictTo('student'),
    uploadAvatarMiddleware,          // multer: validates type & size
    profileController.uploadAvatar
);

// ── Student: education sub-resource ──────────────────────────────

// POST   /api/v1/profile/me/education           → 201 — add entry
router.post(
    '/me/education',
    restrictTo('student'),
    educationValidator, validate,
    profileController.addEducation
);

// DELETE /api/v1/profile/me/education/:eduId    → 200 — remove entry
router.delete(
    '/me/education/:eduId',
    restrictTo('student'),
    profileController.removeEducation
);

// ── Student: experience sub-resource ─────────────────────────────

// POST   /api/v1/profile/me/experience          → 201 — add entry
router.post(
    '/me/experience',
    restrictTo('student'),
    experienceValidator, validate,
    profileController.addExperience
);

// DELETE /api/v1/profile/me/experience/:expId   → 200 — remove entry
router.delete(
    '/me/experience/:expId',
    restrictTo('student'),
    profileController.removeExperience
);

// ── Student: technical skills ─────────────────────────────────────

// POST   /api/v1/profile/me/skills/technical           → 201 — add (409 if duplicate)
router.post(
    '/me/skills/technical',
    restrictTo('student'),
    technicalSkillValidator, validate,
    profileController.addTechnicalSkill
);

// DELETE /api/v1/profile/me/skills/technical/:skillId  → 200 — remove
router.delete(
    '/me/skills/technical/:skillId',
    restrictTo('student'),
    profileController.removeTechnicalSkill
);

// ── Student: soft skills ──────────────────────────────────────────

// POST   /api/v1/profile/me/skills/soft                → 201 — add (409 if duplicate)
router.post(
    '/me/skills/soft',
    restrictTo('student'),
    softSkillValidator, validate,
    profileController.addSoftSkill
);

// DELETE /api/v1/profile/me/skills/soft/:skillId       → 200 — remove
router.delete(
    '/me/skills/soft/:skillId',
    restrictTo('student'),
    profileController.removeSoftSkill
);

// ── Student: languages ────────────────────────────────────────────

// POST   /api/v1/profile/me/languages           → 201 — add (409 if duplicate)
router.post(
    '/me/languages',
    restrictTo('student'),
    languageValidator, validate,
    profileController.addLanguage
);

// DELETE /api/v1/profile/me/languages/:langId   → 200 — remove
router.delete(
    '/me/languages/:langId',
    restrictTo('student'),
    profileController.removeLanguage
);

// ── Admin: all profiles ───────────────────────────────────────────

// GET /api/v1/profile              → paginated list, filterable
router.get('/', restrictTo('admin'), profileController.getAllProfiles);

// GET /api/v1/profile/:id          → single profile by user ObjectId
router.get('/:id', restrictTo('admin'), profileController.getProfileById);

module.exports = router;
