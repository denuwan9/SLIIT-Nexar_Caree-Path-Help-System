/**
 * profileController.js (Rebuilt)
 * ─────────────────────────────────────────────────────────────────────────
 * Handles all CRUD for the student profile.
 * Pattern: inline try/catch → next(error) — consistent with project style.
 * ─────────────────────────────────────────────────────────────────────────
 */
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ── Protected fields that can never be updated via body ───────────────────
const IMMUTABLE = ['user', '_id', 'profileCompleteness', '__v', 'createdAt', 'updatedAt'];
const sanitize = (body) => {
    IMMUTABLE.forEach(f => delete body[f]);
    return body;
};

// ═══════════════════════════════════════════════════════════════════════════
//  1. GET MY PROFILE  (auto-create on first access)
// ═══════════════════════════════════════════════════════════════════════════
exports.getMyProfile = async (req, res, next) => {
    try {
        let profile = await StudentProfile.findOne({ user: req.user._id })
            .populate('user', 'fullName email avatarUrl');

        if (!profile) {
            const parts = (req.user.fullName || '').split(' ');
            profile = await StudentProfile.create({
                user: req.user._id,
                firstName: parts[0] || '',
                lastName: parts.slice(1).join(' ') || '',
            });
            profile = await profile.populate('user', 'fullName email avatarUrl');
            logger.info(`[Profile] Auto-created profile for user ${req.user._id}`);
        }

        res.status(200).json({ status: 'success', data: { profile } });
    } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════
//  2. UPDATE MY PROFILE  (partial update — any top-level field)
// ═══════════════════════════════════════════════════════════════════════════
exports.updateMyProfile = async (req, res, next) => {
    try {
        const data = sanitize({ ...req.body });

        // Sync name change to User model
        if (data.firstName !== undefined || data.lastName !== undefined) {
            const current = await StudentProfile.findOne({ user: req.user._id })
                .select('firstName lastName');
            const first = data.firstName ?? current?.firstName ?? '';
            const last = data.lastName ?? current?.lastName ?? '';
            await User.findByIdAndUpdate(req.user._id, { fullName: `${first} ${last}`.trim() });
        }

        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: data },
            { new: true, runValidators: true, upsert: true }
        ).populate('user', 'fullName email avatarUrl');

        // Recalculate completeness via pre-save
        await profile.save();

        res.status(200).json({ status: 'success', data: { profile } });
    } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════
//  3. AVATAR UPLOAD  (handled after Cloudinary middleware)
// ═══════════════════════════════════════════════════════════════════════════
exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) return next(new AppError('No image file provided.', 400));
        const avatarUrl = req.file.path; // Cloudinary secure_url

        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: { avatarUrl } },
            { new: true, upsert: true }
        );
        await User.findByIdAndUpdate(req.user._id, { avatarUrl });

        res.status(200).json({ status: 'success', data: { avatarUrl, profile } });
    } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════
//  4–9. SUB-ARRAY CRUD (Education, Experience, Projects, TechSkills, SoftSkills)
//  Generic pattern: push / pull from the sub-document array
// ═══════════════════════════════════════════════════════════════════════════

// ── Education ─────────────────────────────────────────────────────────────
exports.addEducation = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $push: { education: req.body } },
            { new: true, runValidators: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        await profile.save();
        res.status(201).json({ status: 'success', data: { education: profile.education } });
    } catch (err) { next(err); }
};

exports.removeEducation = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { education: { _id: req.params.id } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        await profile.save();
        res.status(200).json({ status: 'success', data: { education: profile.education } });
    } catch (err) { next(err); }
};

// ── Experience ────────────────────────────────────────────────────────────
exports.addExperience = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $push: { experience: req.body } },
            { new: true, runValidators: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        await profile.save();
        res.status(201).json({ status: 'success', data: { experience: profile.experience } });
    } catch (err) { next(err); }
};

exports.removeExperience = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { experience: { _id: req.params.id } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        await profile.save();
        res.status(200).json({ status: 'success', data: { experience: profile.experience } });
    } catch (err) { next(err); }
};

// ── Projects ──────────────────────────────────────────────────────────────
exports.addProject = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $push: { projects: req.body } },
            { new: true, runValidators: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        await profile.save();
        res.status(201).json({ status: 'success', data: { projects: profile.projects } });
    } catch (err) { next(err); }
};

exports.removeProject = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { projects: { _id: req.params.id } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        await profile.save();
        res.status(200).json({ status: 'success', data: { projects: profile.projects } });
    } catch (err) { next(err); }
};

// ── Technical Skills ──────────────────────────────────────────────────────
exports.addTechnicalSkill = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.user._id });
        if (!profile) return next(new AppError('Profile not found.', 404));

        const exists = profile.technicalSkills.some(
            s => s.name.toLowerCase() === (req.body.name || '').toLowerCase()
        );
        if (exists) return next(new AppError(`Skill "${req.body.name}" already exists.`, 409));
        if (profile.technicalSkills.length >= 40)
            return next(new AppError('Maximum 40 technical skills allowed.', 400));

        profile.technicalSkills.push(req.body);
        await profile.save();
        res.status(201).json({ status: 'success', data: { technicalSkills: profile.technicalSkills } });
    } catch (err) { next(err); }
};

exports.removeTechnicalSkill = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { technicalSkills: { _id: req.params.id } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        await profile.save();
        res.status(200).json({ status: 'success', data: { technicalSkills: profile.technicalSkills } });
    } catch (err) { next(err); }
};

// ── Soft Skills ───────────────────────────────────────────────────────────
exports.addSoftSkill = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.user._id });
        if (!profile) return next(new AppError('Profile not found.', 404));

        const exists = profile.softSkills.some(
            s => s.name.toLowerCase() === (req.body.name || '').toLowerCase()
        );
        if (exists) return next(new AppError(`Skill "${req.body.name}" already exists.`, 409));
        if (profile.softSkills.length >= 20)
            return next(new AppError('Maximum 20 soft skills allowed.', 400));

        profile.softSkills.push(req.body);
        await profile.save();
        res.status(201).json({ status: 'success', data: { softSkills: profile.softSkills } });
    } catch (err) { next(err); }
};

exports.removeSoftSkill = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { softSkills: { _id: req.params.id } } },
            { new: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        await profile.save();
        res.status(200).json({ status: 'success', data: { softSkills: profile.softSkills } });
    } catch (err) { next(err); }
};

// ── Social Links ──────────────────────────────────────────────────────────
exports.updateSocialLinks = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: { socialLinks: req.body } },
            { new: true, runValidators: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({ status: 'success', data: { socialLinks: profile.socialLinks } });
    } catch (err) { next(err); }
};

// ── Career Goals ──────────────────────────────────────────────────────────
exports.updateCareerGoals = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: { careerGoals: req.body } },
            { new: true, runValidators: true }
        );
        if (!profile) return next(new AppError('Profile not found.', 404));
        res.status(200).json({ status: 'success', data: { careerGoals: profile.careerGoals } });
    } catch (err) { next(err); }
};
