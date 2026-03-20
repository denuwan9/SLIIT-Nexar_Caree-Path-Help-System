const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// All admin routes must be protected and restricted to 'admin' role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentProfileById);

router.patch('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/password', adminController.resetUserPassword);

module.exports = router;
