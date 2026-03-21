const mongoose = require('mongoose');

// ── Sub-document: Individual Interview Slot ───────────────────────
const slotSchema = new mongoose.Schema(
    {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        studentId: { type: String, default: '' }, // student index number
        status: {
            type: String,
            enum: ['available', 'booked', 'cancelled', 'completed'],
            default: 'available',
        },
        notes: { type: String, default: '' },
    },
    { _id: true }
);

// ── Sub-document: Company (for Career Day) ─────────────────────────
const companySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        interviewers: [{ type: String }], // list of interviewer names
        slots: [slotSchema],
    },
    { _id: true }
);

// ── Main Interview Event Schema ───────────────────────────────────
const interviewEventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
        },
        description: { type: String, default: '' },
        eventType: {
            type: String,
            enum: ['career-day', 'normal-day'],
            required: [true, 'Event type is required'],
            default: 'career-day',
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        eventDate: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        startTime: { type: String, default: '09:00' }, // HH:mm
        endTime: { type: String, default: '17:00' },   // HH:mm
        venue: { type: String, default: 'Online' },
        slotDurationMinutes: {
            type: Number,
            default: 30,
            min: [10, 'Slot must be at least 10 minutes'],
        },
        // ── Career Day specific ────────────────────────────────────
        companies: [companySchema],                    // 2–20 companies
        requireDifferentCompanies: { type: Boolean, default: true },
        maxBookingsPerStudent: {
            type: Number,
            default: 2,
            min: 1,
            max: 5,
        },
        // ── Normal Day specific ───────────────────────────────────
        companyName: { type: String, default: '' },    // single company
        slots: [slotSchema],                           // root-level slots
        maxCandidates: { type: Number, default: 50 },  // FCFS cap
        // ── Common ────────────────────────────────────────────────
        status: {
            type: String,
            enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
            default: 'draft',
        },
        targetYear: { type: Number },
        targetMajor: { type: String },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Virtuals ──────────────────────────────────────────────────────
interviewEventSchema.virtual('totalSlots').get(function () {
    if (this.eventType === 'career-day') {
        return this.companies.reduce((acc, c) => acc + c.slots.length, 0);
    }
    return this.slots.length;
});

interviewEventSchema.virtual('availableSlots').get(function () {
    if (this.eventType === 'career-day') {
        return this.companies.reduce(
            (acc, c) => acc + c.slots.filter((s) => s.status === 'available').length,
            0
        );
    }
    return this.slots.filter((s) => s.status === 'available').length;
});

interviewEventSchema.virtual('totalBookings').get(function () {
    if (this.eventType === 'career-day') {
        return this.companies.reduce(
            (acc, c) => acc + c.slots.filter((s) => s.status === 'booked').length,
            0
        );
    }
    return this.slots.filter((s) => s.status === 'booked').length;
});

interviewEventSchema.index({ eventDate: 1 });
interviewEventSchema.index({ status: 1 });
interviewEventSchema.index({ eventType: 1 });

module.exports = mongoose.model('InterviewEvent', interviewEventSchema);
