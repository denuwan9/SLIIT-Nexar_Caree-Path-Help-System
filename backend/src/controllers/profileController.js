const StudentProfile = require('../models/StudentProfile');
const AppError = require('../utils/AppError');

/**
 * GET /api/profile/me
 * Student — get own profile
 */
exports.getMyProfile = async (req, res, next) => {
    try {
        let profile = await StudentProfile.findOne({ user: req.user._id }).populate('user', 'name email');

        if (!profile) {
            // Auto-create an empty profile on first access
            profile = await StudentProfile.create({ user: req.user._id });
        }

        res.status(200).json({ status: 'success', data: { profile } });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/profile/me
 * Student — update own profile (partial update supported)
 */
exports.updateMyProfile = async (req, res, next) => {
    try {
        // Fields students are NOT allowed to change via this endpoint
        const excluded = ['user', '_id', 'profileCompleteness'];
        excluded.forEach((f) => delete req.body[f]);

        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: req.body },
            { new: true, runValidators: true, upsert: true }
        ).populate('user', 'name email');

        // Recalculate completeness
        profile.profileCompleteness = calculateCompleteness(profile);
        await profile.save();

        res.status(200).json({ status: 'success', data: { profile } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/profile/:id
 * Admin — get any student's profile by user ID
 */
exports.getProfileById = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.params.id }).populate('user', 'name email role');
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({ status: 'success', data: { profile } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/profile
 * Admin — list all student profiles
 */
exports.getAllProfiles = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const profiles = await StudentProfile.find()
            .populate('user', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await StudentProfile.countDocuments();

        res.status(200).json({
            status: 'success',
            results: profiles.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: { profiles },
        });
    } catch (error) {
        next(error);
    }
};

// ── Helper ─────────────────────────────────────────────────────────
const calculateCompleteness = (profile) => {
    let score = 0;
    const checks = [
        profile.university, profile.major, profile.bio, profile.location,
        profile.linkedinUrl, profile.avatarUrl,
        profile.skills?.length > 0,
        profile.education?.length > 0,
        profile.experience?.length > 0,
        profile.languages?.length > 0,
    ];
    checks.forEach((c) => { if (c) score += 10; });
    return Math.min(score, 100);
};
