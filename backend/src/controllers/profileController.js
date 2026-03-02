const path = require('path');
const fs = require('fs');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
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

/** Delete a file from disk safely (No longer used for Cloudinary) */
const deleteFile = (filePath) => {
    // Cloudinary deletion would require public_id or API call
    // For now, we just update the URL in DB
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

        // If firstName/lastName changed, sync with User model first
        if (data.firstName || data.lastName) {
            // Get current profile to build full name
            const current = await StudentProfile.findOne({ user: req.user._id }).select('firstName lastName');
            const firstName = data.firstName || current?.firstName || '';
            const lastName = data.lastName || current?.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            await User.findByIdAndUpdate(req.user._id, { name: fullName });
        }

        // Use findOneAndUpdate to bypass schema validators on untouched fields (e.g. avatarUrl)
        let profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: data },
            { new: true, runValidators: false, upsert: true }
        ).populate('user', 'name email avatarUrl');

        // Manually recalculate profileCompleteness and save quietly
        if (profile) {
            const completeness = profile.calculateCompleteness ? profile.calculateCompleteness() : null;
            if (completeness !== null) {
                await StudentProfile.findByIdAndUpdate(profile._id, { profileCompleteness: completeness });
                profile.profileCompleteness = completeness;
            }
        }

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

        // multer-storage-cloudinary provides the secure_url in path or file.path
        const publicUrl = req.file.path;

        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: { avatarUrl: publicUrl } },
            { new: true, upsert: true }
        );

        // Sync avatar with User model
        await User.findByIdAndUpdate(req.user._id, { avatarUrl: publicUrl });

        res.status(200).json({
            status: 'success',
            data: { avatarUrl: publicUrl, profile },
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
//  5.2 PROJECTS
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/profile/me/projects
 * 201 — pushes a new project entry
 */
exports.addProject = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $push: { projects: req.body } },
            { new: true, runValidators: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(201).json({ status: 'success', data: { projects: profile.projects } });
    } catch (error) { next(error); }
};

/**
 * DELETE /api/v1/profile/me/projects/:projectId
 * 200 — removes a project entry
 */
exports.removeProject = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { projects: { _id: req.params.projectId } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({ status: 'success', data: { projects: profile.projects } });
    } catch (error) { next(error); }
};

/**
 * POST /api/v1/profile/me/projects/:projectId/images
 * 200 — uploads multiple images for a project
 */
exports.uploadProjectImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next(new AppError('No images provided.', 400));
        }

        const imageUrls = req.files.map(file => file.path);

        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id, 'projects._id': req.params.projectId },
            { $push: { 'projects.$.images': { $each: imageUrls } } },
            { new: true }
        );

        if (!profile) return next(new AppError('Project not found.', 404));

        res.status(200).json({
            status: 'success',
            message: 'Project images uploaded successfully.',
            data: { projects: profile.projects }
        });
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
