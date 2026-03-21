const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { interviewEventValidator, careerDayEventValidator, normalDayEventValidator } = require('../middleware/validators');

router.use(protect); // All interview routes require authentication

// ── Analytics (admin) ─────────────────────────────────────────────
router.get('/events/stats', restrictTo('admin'), interviewController.getEventStats);

// ── Student: my bookings ──────────────────────────────────────────
router.get('/events/my-bookings', restrictTo('student'), interviewController.getMyBookings);

// ── Admin: create events ──────────────────────────────────────────
router.post('/events', restrictTo('admin'), interviewEventValidator, validate, interviewController.createEvent);
router.post('/events/career-day', restrictTo('admin'), careerDayEventValidator, validate, interviewController.createCareerDayEvent);
router.post('/events/normal-day', restrictTo('admin'), normalDayEventValidator, validate, interviewController.createNormalDayEvent);

// ── Shared: view events ───────────────────────────────────────────
router.get('/events', interviewController.getEvents);
router.get('/events/:id', interviewController.getEventById);

// ── Admin: manage events ──────────────────────────────────────────
router.patch('/events/:id/publish', restrictTo('admin'), interviewController.publishEvent);
router.patch('/events/:id', restrictTo('admin'), interviewController.updateEvent);
router.delete('/events/:id', restrictTo('admin'), interviewController.cancelEvent);

// ── Student: booking actions ──────────────────────────────────────
router.post('/events/:id/book/:slotId', restrictTo('student'), interviewController.bookSlot);
router.delete('/events/:id/book/:slotId', restrictTo('student'), interviewController.cancelBooking);

module.exports = router;
