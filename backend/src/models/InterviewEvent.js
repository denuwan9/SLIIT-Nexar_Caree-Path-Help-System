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
        status: {
            type: String,
            enum: ['available', 'booked', 'cancelled', 'completed'],
            default: 'available',
        },
        notes: { type: String, default: '' },
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
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        eventDate: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        venue: { type: String, default: 'Online' },
        slotDurationMinutes: {
            type: Number,
            default: 30,
            min: [10, 'Slot must be at least 10 minutes'],
        },
        maxBookingsPerStudent: {
            type: Number,
            default: 1,
            min: 1,
        },
        slots: [slotSchema],
        status: {
            type: String,
            enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
            default: 'draft',
        },
        targetYear: { type: Number }, // e.g., only year-3 students
        targetMajor: { type: String }, // e.g., only CS students
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Virtual: total slots & available slots ────────────────────────
interviewEventSchema.virtual('totalSlots').get(function () {
    return this.slots.length;
});

interviewEventSchema.virtual('availableSlots').get(function () {
    return this.slots.filter((s) => s.status === 'available').length;
});

interviewEventSchema.index({ eventDate: 1 });
interviewEventSchema.index({ status: 1 });

module.exports = mongoose.model('InterviewEvent', interviewEventSchema);
