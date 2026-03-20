/**
 * systemRoutes.js
 */
const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/systemController');

const router = express.Router();

router.use(protect);

router.get('/init', ctrl.initSystemData);

module.exports = router;
