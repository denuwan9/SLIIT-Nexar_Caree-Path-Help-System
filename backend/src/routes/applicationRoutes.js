const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { applicationValidator } = require('../middleware/validators');

router.use(protect);

// Get current user's applications
router.get('/me', applicationController.getMyApplications);

// Apply for a job post (students and admin can apply)
router.post('/', applicationValidator, validate, applicationController.applyForJob);

// Get applications for a specific job post (only the job post owner or admin can view)
router.get('/:jobPostId', restrictTo('student', 'admin'), applicationController.getApplicationsForJobPost);

// Update application status (only job post owner or admin)
router.patch('/:id/status', restrictTo('student', 'admin'), applicationController.updateApplicationStatus);

module.exports = router;