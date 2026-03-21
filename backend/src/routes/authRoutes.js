const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidator, loginValidator } = require('../middleware/validators');

// Public routes (rate-limited)
router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(protect);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.put('/change-password', authController.changePassword);
router.put('/change-email', authController.changeEmail);
router.delete('/delete-account', authController.deleteAccount);

module.exports = router;
