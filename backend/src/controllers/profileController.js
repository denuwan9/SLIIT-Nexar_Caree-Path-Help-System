const StudentProfile = require('../models/StudentProfile');
const AppError = require('../utils/AppError');

// ── Helper: sanitize body — remove protected fields ────────────────
const PROTECTED_FIELDS = ['user', '_id', 'profileCompleteness', '__v', 'createdAt', 'updatedAt'];
const sanitize = (body) => {
    PROTECTED_FIELDS.forEach((f) => delete body[f]);
    return body;
};

// ── Helper: enforce no duplicate skills ───────────────────────────
const deduplicateByName = (arr) => {
    if (!Array.isArray(arr)) return arr;
    const seen = new Set();
    return arr.filter((item) => {
        const key = (item.name || '').toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

/**
 * GET /api/v1/profile/me
 * Student — get own profile (auto-creates empty profile on first access)
 */
exports.getMyProfile = async (req, res, next) => {
    try {
        let profile = await StudentProfile.findOne({ user: req.user._id }).populate('user', 'name email');

        if (!profile) {
            const nameParts = req.user.name?.split(' ') || [];
            profile = await StudentProfile.create({
                user: req.user._id,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
            });
        }

        res.status(200).json({ status: 'success', data: { profile } });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/profile/me
 * Student — full or partial update of own profile
 */
exports.updateMyProfile = async (req, res, next) => {
    try {
        const data = sanitize(req.body);

        // Deduplicate skills and languages before saving
        if (data.technicalSkills) data.technicalSkills = deduplicateByName(data.technicalSkills);
        if (data.softSkills) data.softSkills = deduplicateByName(data.softSkills);
        if (data.languages) {
            const seen = new Set();
            data.languages = data.languages.filter((l) => {
                const key = (l.name || '').toLowerCase().trim();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }

        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: data },
            { new: true, runValidators: true, upsert: true, context: 'query' }
        ).populate('user', 'name email');

        res.status(200).json({ status: 'success', data: { profile } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/profile/me/education
 * Student — add an education entry
 */
exports.addEducation = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $push: { education: req.body } },
            { new: true, runValidators: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(201).json({ status: 'success', data: { education: profile.education } });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/profile/me/education/:eduId
 * Student — remove an education entry
 */
exports.removeEducation = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { education: { _id: req.params.eduId } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({ status: 'success', data: { education: profile.education } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/profile/me/experience
 * Student — add an experience entry
 */
exports.addExperience = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $push: { experience: req.body } },
            { new: true, runValidators: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(201).json({ status: 'success', data: { experience: profile.experience } });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/profile/me/experience/:expId
 * Student — remove an experience entry
 */
exports.removeExperience = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { experience: { _id: req.params.expId } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({ status: 'success', data: { experience: profile.experience } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/profile
 * Admin — paginated list of all student profiles
 */
exports.getAllProfiles = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Filters
        const filter = {};
        if (req.query.careerField) filter.careerField = req.query.careerField;
        if (req.query.isActivelyLooking) filter.isActivelyLooking = req.query.isActivelyLooking === 'true';

        // Full-text search
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        const profiles = await StudentProfile.find(filter)
            .populate('user', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ profileCompleteness: -1, createdAt: -1 });

        const total = await StudentProfile.countDocuments(filter);

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

/**
 * GET /api/v1/profile/:id
 * Admin — get any profile by user ID
 */
exports.getProfileById = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.params.id })
            .populate('user', 'name email role');
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({ status: 'success', data: { profile } });
    } catch (error) {
        next(error);
    }
};
