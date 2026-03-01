const path = require('path');
const fs = require('fs');
const StudentProfile = require('../models/StudentProfile');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

const PROTECTED_FIELDS = ['user', '_id', 'profileCompleteness', '__v', 'createdAt', 'updatedAt'];
const sanitize = (body) => {
    PROTECTED_FIELDS.forEach((f) => delete body[f]);
    return body;
};

/** Case-insensitive duplicate check for arrays that have a `name` field */
const hasDuplicate = (arr, name) =>
    arr.some((item) => item.name.toLowerCase().trim() === name.toLowerCase().trim());

/** Delete a file from disk safely (used when replacing avatar) */
const deleteFile = (filePath) => {
    if (!filePath) return;
    try {
        const fullPath = path.join(process.cwd(), 'uploads', 'avatars', path.basename(filePath));
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch (err) {
        logger.warn(`Could not delete old avatar: ${err.message}`);
    }
};

// ═══════════════════════════════════════════════════════════════════
//  1. GET MY PROFILE — auto-create if first access
// ═══════════════════════════════════════════════════════════════════
/**
 * GET /api/v1/profile/me
 * 200 — returns own profile (creates empty one on first call)
 */
exports.getMyProfile = async (req, res, next) => {
    try {
        let profile = await StudentProfile.findOne({ user: req.user._id })
            .populate('user', 'name email');

        if (!profile) {
            const nameParts = (req.user.name || '').split(' ');
            profile = await StudentProfile.create({
                user: req.user._id,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
            });
            logger.info(`Auto-created profile for user ${req.user._id}`);
        }

        res.status(200).json({ status: 'success', data: { profile } });
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════
//  2. CREATE / UPDATE PROFILE — partial update via PUT
// ═══════════════════════════════════════════════════════════════════
/**
 * PUT /api/v1/profile/me
 * 200 — updates profile fields (upserts if no profile yet)
 * Ownership: only the authenticated student can modify their own profile.
 */
exports.updateMyProfile = async (req, res, next) => {
    try {
        const data = sanitize(req.body);

        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: data },
            { new: true, runValidators: true, upsert: true, context: 'query' }
        ).populate('user', 'name email');

        res.status(200).json({ status: 'success', data: { profile } });
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════
//  3. AVATAR UPLOAD
// ═══════════════════════════════════════════════════════════════════
/**
 * POST /api/v1/profile/me/avatar
 * 200 — stores image on disk, returns the public URL
 * - Only JPEG/PNG/WebP allowed (enforced by multer middleware)
 * - Max 2MB (enforced by multer middleware)
 */
exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('No image file provided.', 400));
        }

        const publicUrl = `/uploads/avatars/${req.file.filename}`;

        // Get old avatar to delete it from disk
        const existing = await StudentProfile.findOne({ user: req.user._id }).select('avatarUrl');

        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: { avatarUrl: publicUrl } },
            { new: true, upsert: true }
        );

        // Delete old avatar file after successful save
        if (existing?.avatarUrl) deleteFile(existing.avatarUrl);

        res.status(200).json({
            status: 'success',
            message: 'Profile image uploaded successfully.',
            data: { avatarUrl: publicUrl },
        });
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════
//  4. EDUCATION
// ═══════════════════════════════════════════════════════════════════
/**
 * POST /api/v1/profile/me/education
 * 201 — pushes a new education entry
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
    } catch (error) { next(error); }
};

/**
 * DELETE /api/v1/profile/me/education/:eduId
 * 200 — removes an education entry by its sub-document _id
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
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════
//  5. EXPERIENCE
// ═══════════════════════════════════════════════════════════════════
/**
 * POST /api/v1/profile/me/experience
 * 201 — pushes a new experience entry
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
    } catch (error) { next(error); }
};

/**
 * DELETE /api/v1/profile/me/experience/:expId
 * 200 — removes an experience entry by its sub-document _id
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
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════
//  6. TECHNICAL SKILLS — unique by name
// ═══════════════════════════════════════════════════════════════════
/**
 * POST /api/v1/profile/me/skills/technical
 * 201 — adds a technical skill
 * 409 — if skill name already exists (case-insensitive)
 */
exports.addTechnicalSkill = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.user._id });
        if (!profile) return next(new AppError('Profile not found.', 404));

        // Duplicate check
        if (hasDuplicate(profile.technicalSkills, req.body.name)) {
            return next(new AppError(
                `Technical skill "${req.body.name}" already exists on your profile.`, 409
            ));
        }

        // Max-30 cap
        if (profile.technicalSkills.length >= 30) {
            return next(new AppError('Maximum of 30 technical skills reached.', 400));
        }

        profile.technicalSkills.push(req.body);
        await profile.save();

        res.status(201).json({
            status: 'success',
            message: 'Technical skill added.',
            data: { technicalSkills: profile.technicalSkills },
        });
    } catch (error) { next(error); }
};

/**
 * DELETE /api/v1/profile/me/skills/technical/:skillId
 * 200 — removes a technical skill by sub-document _id
 */
exports.removeTechnicalSkill = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { technicalSkills: { _id: req.params.skillId } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({
            status: 'success',
            message: 'Technical skill removed.',
            data: { technicalSkills: profile.technicalSkills },
        });
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════
//  7. SOFT SKILLS — unique by name
// ═══════════════════════════════════════════════════════════════════
/**
 * POST /api/v1/profile/me/skills/soft
 * 201 — adds a soft skill
 * 409 — if skill name already exists
 */
exports.addSoftSkill = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.user._id });
        if (!profile) return next(new AppError('Profile not found.', 404));

        if (hasDuplicate(profile.softSkills, req.body.name)) {
            return next(new AppError(
                `Soft skill "${req.body.name}" already exists on your profile.`, 409
            ));
        }

        if (profile.softSkills.length >= 20) {
            return next(new AppError('Maximum of 20 soft skills reached.', 400));
        }

        profile.softSkills.push(req.body);
        await profile.save();

        res.status(201).json({
            status: 'success',
            message: 'Soft skill added.',
            data: { softSkills: profile.softSkills },
        });
    } catch (error) { next(error); }
};

/**
 * DELETE /api/v1/profile/me/skills/soft/:skillId
 * 200 — removes a soft skill by sub-document _id
 */
exports.removeSoftSkill = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { softSkills: { _id: req.params.skillId } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({
            status: 'success',
            message: 'Soft skill removed.',
            data: { softSkills: profile.softSkills },
        });
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════
//  8. LANGUAGES
// ═══════════════════════════════════════════════════════════════════
/**
 * POST /api/v1/profile/me/languages
 * 201 — adds a language entry
 * 409 — if language name already exists
 */
exports.addLanguage = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.user._id });
        if (!profile) return next(new AppError('Profile not found.', 404));

        if (hasDuplicate(profile.languages, req.body.name)) {
            return next(new AppError(
                `Language "${req.body.name}" already exists on your profile.`, 409
            ));
        }

        if (profile.languages.length >= 10) {
            return next(new AppError('Maximum of 10 languages reached.', 400));
        }

        profile.languages.push(req.body);
        await profile.save();

        res.status(201).json({
            status: 'success',
            message: 'Language added.',
            data: { languages: profile.languages },
        });
    } catch (error) { next(error); }
};

/**
 * DELETE /api/v1/profile/me/languages/:langId
 * 200 — removes a language entry by sub-document _id
 */
exports.removeLanguage = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { languages: { _id: req.params.langId } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({
            status: 'success',
            message: 'Language removed.',
            data: { languages: profile.languages },
        });
    } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════
/**
 * GET /api/v1/profile
 * Admin — paginated list with optional filters & full-text search
 */
exports.getAllProfiles = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.careerField) filter.careerField = req.query.careerField;
        if (req.query.isActivelyLooking) filter.isActivelyLooking = req.query.isActivelyLooking === 'true';
        if (req.query.search) filter.$text = { $search: req.query.search };

        const [profiles, total] = await Promise.all([
            StudentProfile.find(filter)
                .populate('user', 'name email')
                .skip(skip).limit(limit)
                .sort({ profileCompleteness: -1, createdAt: -1 }),
            StudentProfile.countDocuments(filter),
        ]);

        res.status(200).json({
            status: 'success',
            results: profiles.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: { profiles },
        });
    } catch (error) { next(error); }
};

/**
 * GET /api/v1/profile/:id
 * Admin — get a single profile by user ID
 */
exports.getProfileById = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.params.id })
            .populate('user', 'name email role');
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({ status: 'success', data: { profile } });
    } catch (error) { next(error); }
};
