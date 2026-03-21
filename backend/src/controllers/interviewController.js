const InterviewEvent = require('../models/InterviewEvent');
const AppError = require('../utils/AppError');

// ── Utility: generate time slots ──────────────────────────────────
const generateSlots = (eventDate, slotDurationMinutes, startHour = 9, endHour = 17) => {
    const slots = [];
    const start = new Date(eventDate);
    start.setHours(startHour, 0, 0, 0);

    const end = new Date(eventDate);
    end.setHours(endHour, 0, 0, 0);

    let current = new Date(start);
    while (current < end) {
        const slotEnd = new Date(current.getTime() + slotDurationMinutes * 60 * 1000);
        if (slotEnd > end) break;
        slots.push({ startTime: new Date(current), endTime: new Date(slotEnd) });
        current = slotEnd;
    }
    return slots;
};

/**
 * POST /api/interviews/events
 * Admin — create a new interview event with auto-generated slots
 */
exports.createEvent = async (req, res, next) => {
    try {
        const { title, description, eventDate, venue, slotDurationMinutes, maxBookingsPerStudent, targetYear, targetMajor } = req.body;

        const slots = generateSlots(eventDate, slotDurationMinutes || 30);
        if (slots.length === 0) {
            return next(new AppError('No valid slots could be generated for this event.', 400));
        }

        const event = await InterviewEvent.create({
            title, description, eventDate, venue, slotDurationMinutes,
            maxBookingsPerStudent, targetYear, targetMajor,
            organizer: req.user._id,
            slots,
        });

        res.status(201).json({ status: 'success', data: { event } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/interviews/events
 * Public (Students + Admin) — list published events
 */
exports.getEvents = async (req, res, next) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { status: 'published' };
        const events = await InterviewEvent.find(filter)
            .populate('organizer', 'name email')
            .sort({ eventDate: 1 });

        res.status(200).json({ status: 'success', results: events.length, data: { events } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/interviews/events/:id
 * Public — get a single event with its slots
 */
exports.getEventById = async (req, res, next) => {
    try {
        const event = await InterviewEvent.findById(req.params.id).populate('slots.bookedBy', 'name email');
        if (!event) return next(new AppError('Interview event not found.', 404));
        res.status(200).json({ status: 'success', data: { event } });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/interviews/events/:id/publish
 * Admin — publish a draft event
 */
exports.publishEvent = async (req, res, next) => {
    try {
        const event = await InterviewEvent.findByIdAndUpdate(
            req.params.id,
            { status: 'published' },
            { new: true }
        );
        if (!event) return next(new AppError('Interview event not found.', 404));
        res.status(200).json({ status: 'success', data: { event } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/interviews/events/:id/book/:slotId
 * Student — book a specific slot (with conflict detection)
 */
exports.bookSlot = async (req, res, next) => {
    try {
        const event = await InterviewEvent.findById(req.params.id);
        if (!event) return next(new AppError('Interview event not found.', 404));
        if (event.status !== 'published') {
            return next(new AppError('This event is not open for booking.', 400));
        }

        // Conflict detection: how many slots has this student already booked?
        const alreadyBooked = event.slots.filter(
            (s) => s.bookedBy?.toString() === req.user._id.toString() && s.status === 'booked'
        ).length;

        if (alreadyBooked >= event.maxBookingsPerStudent) {
            return next(
                new AppError(`You can only book ${event.maxBookingsPerStudent} slot(s) per event.`, 409)
            );
        }

        const slot = event.slots.id(req.params.slotId);
        if (!slot) return next(new AppError('Slot not found.', 404));
        if (slot.status !== 'available') {
            return next(new AppError('This slot is no longer available.', 409));
        }

        slot.bookedBy = req.user._id;
        slot.status = 'booked';
        await event.save();

        res.status(200).json({
            status: 'success',
            message: 'Slot booked successfully.',
            data: { slot },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/interviews/events/:id/book/:slotId
 * Student — cancel their own booking
 */
exports.cancelBooking = async (req, res, next) => {
    try {
        const event = await InterviewEvent.findById(req.params.id);
        if (!event) return next(new AppError('Event not found.', 404));

        const slot = event.slots.id(req.params.slotId);
        if (!slot) return next(new AppError('Slot not found.', 404));
        if (slot.bookedBy?.toString() !== req.user._id.toString()) {
            return next(new AppError('You did not book this slot.', 403));
        }

        slot.bookedBy = null;
        slot.status = 'available';
        await event.save();

        res.status(200).json({ status: 'success', message: 'Booking cancelled.' });
    } catch (error) {
        next(error);
    }
};
