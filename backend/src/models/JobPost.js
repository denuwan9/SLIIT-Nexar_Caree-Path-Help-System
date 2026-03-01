const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
        },
        summary: {
            type: String,
            required: [true, 'Professional summary is required'],
            maxlength: [1000, 'Summary cannot exceed 1000 characters'],
        },
        targetRole: { type: String, required: true, trim: true },
        jobType: {
            type: String,
            enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance'],
            default: 'full-time',
        },
        skills: [{ type: String }],
        preferredLocation: { type: String, default: '' },
        isRemoteOk: { type: Boolean, default: false },
        salaryExpectation: {
            min: { type: Number },
            max: { type: Number },
            currency: { type: String, default: 'LKR' },
        },
        // Auto-populated from student profile
        profileSnapshot: {
            university: String,
            major: String,
            gpa: Number,
            linkedinUrl: String,
            githubUrl: String,
            portfolioUrl: String,
        },
        // AI-based quality analysis
        aiRating: {
            score: { type: Number, min: 0, max: 100, default: null },
            feedback: { type: String, default: '' },
            strengths: [{ type: String }],
            improvements: [{ type: String }],
            ratedAt: { type: Date },
        },
        // Admin review
        adminReview: {
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected', 'flagged'],
                default: 'pending',
            },
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reviewedAt: { type: Date },
            adminNotes: { type: String, default: '' },
        },
        isPublished: { type: Boolean, default: false },
        viewCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

jobPostSchema.index({ student: 1 });
jobPostSchema.index({ 'adminReview.status': 1 });
jobPostSchema.index({ isPublished: 1 });

module.exports = mongoose.model('JobPost', jobPostSchema);
