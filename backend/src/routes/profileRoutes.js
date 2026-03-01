const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { profileValidator } = require('../middleware/validators');

router.use(protect); // All profile routes require login

// Student routes
router.get('/me', restrictTo('student'), profileController.getMyProfile);
router.put('/me', restrictTo('student'), profileValidator, validate, profileController.updateMyProfile);

// Admin routes
router.get('/', restrictTo('admin'), profileController.getAllProfiles);
router.get('/:id', restrictTo('admin'), profileController.getProfileById);

module.exports = router;
