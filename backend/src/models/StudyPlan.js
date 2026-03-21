const mongoose = require('mongoose');

// ── Sub-document: Individual Study Session ────────────────────────
const studySessionSchema = new mongoose.Schema(
    {
        day: { type: Number, required: true },       // day number (1, 2, 3...)
        date: { type: Date, required: true },
        subjects: [
            {
                subjectName: { type: String, required: true },
                title: { type: String, default: '' },
                topic: { type: String, default: '' },
                taskType: {
                    type: String,
                    enum: ['reading', 'summarizing', 'practice', 'revision', 'self-test', null],
                    default: null,
                },
                instruction: { type: String, default: '' },
                durationHours: { type: Number, required: true, min: 0.25 },
                durationMinutes: { type: Number },
                technique: {
                    type: String,
                    enum: ['pomodoro', 'spaced', 'mixed', null],
                    default: null,
                },
                resources: [{ type: String }],
                priority: {
                    type: String,
                    enum: ['low', 'medium', 'high', 'critical'],
                    default: 'medium',
                },
                isCompleted: { type: Boolean, default: false },
                status: {
                    type: String,
                    enum: ['pending', 'in-progress', 'completed'],
                    default: 'pending',
                },
            },
        ],
        totalStudyHours: { type: Number, default: 0 },
        notes: { type: String, default: '' },
    },
    { _id: true }
);

// ── Main Study Plan Schema ────────────────────────────────────────
const studyPlanSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Study plan title is required'],
            trim: true,
        },
        examStartDate: {
            type: Date,
            required: [true, 'Exam start date is required'],
        },
        examEndDate: {
            type: Date,
            required: [true, 'Exam end date is required'],
        },
        subjects: [
            {
                name: { type: String, required: true },
                creditHours: { type: Number, default: 3 },
                difficulty: {
                    type: String,
                    enum: ['easy', 'medium', 'hard'],
                    default: 'medium',
                },
                syllabusTopics: [{ type: String }],
                examDate: { type: Date },
                weight: { type: Number, default: 1 }, // relative weight for allocation
            },
        ],
        internshipStartTime: { type: String }, // HH:MM (24h)
        internshipEndTime: { type: String },   // HH:MM (24h)
        internshipHoursPerDay: { type: Number },
        availableHoursPerDay: { type: Number, default: 4, min: 1, max: 16 },
        sessions: [studySessionSchema],  // AI-generated daily sessions
        aiSummary: { type: String, default: '' }, // AI-generated advice text
        totalStudyDays: { type: Number, default: 0 },
        overallProgress: { type: Number, default: 0, min: 0, max: 100 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

studyPlanSchema.index({ student: 1 });
studyPlanSchema.index({ isActive: 1 });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
