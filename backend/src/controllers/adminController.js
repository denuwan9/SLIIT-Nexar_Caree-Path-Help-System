const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AppError = require('../utils/AppError');

/**
 * GET /api/v1/admin/users
 * Protected (Admin) — Get all users with basic info
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password -refreshToken').sort('-createdAt');
        
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/admin/students
 * Protected (Admin) — Get all student profiles for analytics
 */
exports.getAllStudents = async (req, res, next) => {
    try {
        // Find all student profiles, but strictly populate users who are only 'students'
        const students = await StudentProfile.find()
            .populate({
                path: 'user',
                match: { role: 'student' },
                select: 'email isActive lastLogin role'
            })
            .sort('-profileCompleteness');
            
        // Filter out profiles where the user role did not match 'student' (the populated user is null)
        const validStudents = students.filter(student => student.user !== null);
            
        res.status(200).json({
            status: 'success',
            results: validStudents.length,
            data: { students: validStudents }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/admin/users/:id/status
 * Protected (Admin) — Toggle user's isActive status
 */
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return next(new AppError('No user found with that ID', 404));
        }
        
        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString()) {
            return next(new AppError('You cannot deactivate your own admin account.', 403));
        }

        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/admin/users/:id
 * Protected (Admin) — Permanently delete user and their profile
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new AppError('No user found with that ID', 404));
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return next(new AppError('You cannot delete your own admin account.', 403));
        }

        await StudentProfile.findOneAndDelete({ user: user._id });
        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            status: 'success',
            message: 'User securely removed from the system.',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/admin/users/:id/role
 * Protected (Admin) — Update a user's role
 */
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new AppError('No user found with that ID', 404));
        }

        if (!['student', 'admin'].includes(role)) {
            return next(new AppError('Invalid role specified.', 400));
        }

        // Prevent admin from demoting themselves
        if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
            return next(new AppError('You cannot demote your own admin account.', 403));
        }

        user.role = role;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: `User role updated to ${role}.`,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/admin/users/:id/password
 * Protected (Admin) — Reset a user's password
 */
exports.resetUserPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id).select('+password');

        if (!user) {
            return next(new AppError('No user found with that ID', 404));
        }

        // Prevent admin from changing their own password via this route (they should use the standard profile settings)
        if (user._id.toString() === req.user._id.toString()) {
            return next(new AppError('Please use your profile settings to change your own password.', 403));
        }

        if (!newPassword || newPassword.length < 8) {
            return next(new AppError('Password must be at least 8 characters long.', 400));
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: true }); // triggers pre-save hash hook

        res.status(200).json({
            status: 'success',
            message: 'User password reset successfully.',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/admin/students/:id
 * Protected (Admin) — Get a single detailed student profile
 */
exports.getStudentProfileById = async (req, res, next) => {
    try {
        const student = await StudentProfile.findById(req.params.id)
            .populate('user', 'firstName lastName email isActive lastLogin role');

        if (!student) {
            return next(new AppError('No student profile found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { student }
        });
    } catch (error) {
        next(error);
    }
};
