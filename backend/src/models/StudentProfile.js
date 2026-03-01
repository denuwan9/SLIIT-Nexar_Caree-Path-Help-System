const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        university: { type: String, trim: true, default: '' },
        major: { type: String, trim: true, default: '' },
        yearOfStudy: { type: Number, min: 1, max: 6, default: 1 },
        gpa: { type: Number, min: 0, max: 4.0 },
        bio: { type: String, maxlength: 500, default: '' },
        avatarUrl: { type: String, default: '' },
        linkedinUrl: { type: String, default: '' },
        githubUrl: { type: String, default: '' },
        portfolioUrl: { type: String, default: '' },
        location: { type: String, default: '' },
        skills: [
            {
                name: { type: String, required: true },
                level: {
                    type: String,
                    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
                    default: 'beginner',
                },
                yearsOfExp: { type: Number, default: 0 },
            },
        ],
        education: [
            {
                institution: { type: String, required: true },
                degree: { type: String, required: true },
                field: { type: String, default: '' },
                startDate: { type: Date },
                endDate: { type: Date },
                gpa: { type: Number },
            },
        ],
        experience: [
            {
                title: { type: String, required: true },
                company: { type: String, required: true },
                type: {
                    type: String,
                    enum: ['internship', 'part-time', 'full-time', 'project', 'volunteer'],
                    default: 'internship',
                },
                description: { type: String, default: '' },
                startDate: { type: Date },
                endDate: { type: Date },
                isCurrent: { type: Boolean, default: false },
            },
        ],
        languages: [
            {
                name: { type: String, required: true },
                proficiency: {
                    type: String,
                    enum: ['basic', 'conversational', 'professional', 'native'],
                    default: 'basic',
                },
            },
        ],
        profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Virtual: full name from populated user ────────────────────────
studentProfileSchema.index({ user: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
