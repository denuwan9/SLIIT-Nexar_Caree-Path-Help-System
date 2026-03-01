const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { interviewEventValidator } = require('../middleware/validators');

router.use(protect); // All interview routes require authentication

// Admin — manage events
router.post('/events', restrictTo('admin'), interviewEventValidator, validate, interviewController.createEvent);
router.patch('/events/:id/publish', restrictTo('admin'), interviewController.publishEvent);

// Shared — view events
router.get('/events', interviewController.getEvents);
router.get('/events/:id', interviewController.getEventById);

// Student — booking actions
router.post('/events/:id/book/:slotId', restrictTo('student'), interviewController.bookSlot);
router.delete('/events/:id/book/:slotId', restrictTo('student'), interviewController.cancelBooking);

module.exports = router;
