const express = require('express');
const router = express.Router();
const googleCalendarController = require('../controllers/googleCalendarController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/status', googleCalendarController.getSyncStatus);
router.post('/link', googleCalendarController.linkCalendar);
router.post('/sync/:planId', googleCalendarController.syncStudyPlan);

module.exports = router;
