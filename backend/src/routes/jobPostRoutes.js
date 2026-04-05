const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/jobPostController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { jobPostValidator } = require('../middleware/validators');

router.use(protect);

// Student routes
router.post('/', restrictTo('student'), jobPostValidator, validate, jobPostController.createJobPost);
router.get('/me', restrictTo('student', 'admin'), jobPostController.getMyJobPosts);
router.patch('/:id', restrictTo('student'), jobPostValidator, validate, jobPostController.updateJobPost);
router.delete('/:id', restrictTo('student'), jobPostController.deleteJobPost);

// Admin routes
router.get('/', jobPostController.getAllJobPosts);
router.patch('/:id/review', restrictTo('admin'), jobPostController.reviewJobPost);

// Shared (student own + admin)
router.get('/:id', jobPostController.getJobPostById);

// Apply to a job post by ID (alias endpoint)
const applicationController = require('../controllers/applicationController');
router.post('/:id/apply', applicationController.applyForJob);

module.exports = router;
