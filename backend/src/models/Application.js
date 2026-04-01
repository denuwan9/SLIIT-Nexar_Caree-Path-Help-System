const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        jobPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'JobPost',
            required: true,
        },
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'accepted', 'rejected'],
            default: 'pending',
        },
        coverLetter: {
            type: String,
            maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
        },
        // Optional resume file path
        resume: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ jobPost: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);