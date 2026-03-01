const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlanController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { studyPlanValidator } = require('../middleware/validators');

router.use(protect, restrictTo('student')); // Study plans are student-only

router.post('/', studyPlanValidator, validate, studyPlanController.createStudyPlan);
router.get('/', studyPlanController.getMyStudyPlans);
router.get('/:id', studyPlanController.getStudyPlanById);
router.patch('/:id/sessions/:sessionId/:subjectIdx/complete', studyPlanController.markSubjectComplete);
router.delete('/:id', studyPlanController.deleteStudyPlan);

module.exports = router;
