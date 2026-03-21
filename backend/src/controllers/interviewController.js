const InterviewEvent = require('../models/InterviewEvent');
const AppError = require('../utils/AppError');

// ── Utility: parse "HH:mm" and set on a Date ─────────────────────
const applyTime = (baseDate, timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(baseDate);
    d.setHours(h, m, 0, 0);
    return d;
};

// ── Utility: generate time slots between two Date objects ─────────
const generateSlotsBetween = (start, end, durationMinutes) => {
    const slots = [];
    let current = new Date(start);
    while (current < end) {
        const slotEnd = new Date(current.getTime() + durationMinutes * 60 * 1000);
        if (slotEnd > end) break;
        slots.push({ startTime: new Date(current), endTime: new Date(slotEnd) });
        current = slotEnd;
    }
    return slots;
};

// ─────────────────────────────────────────────────────────────────
// ADMIN: Create a Career Day Event
// POST /api/v1/interviews/events/career-day
// ─────────────────────────────────────────────────────────────────
exports.createCareerDayEvent = async (req, res, next) => {
    try {
        const {
            title, description, eventDate, startTime, endTime,
            venue, slotDurationMinutes, maxBookingsPerStudent,
            requireDifferentCompanies, companies, targetYear, targetMajor,
        } = req.body;

        if (!companies || companies.length < 2 || companies.length > 20) {
            return next(new AppError('Career Day event must have between 2 and 20 companies.', 400));
        }

        const start = applyTime(eventDate, startTime || '09:00');
        const end = applyTime(eventDate, endTime || '17:00');
        const duration = slotDurationMinutes || 30;

        if (start >= end) {
            return next(new AppError('End time must be after start time.', 400));
        }

        // Auto-generate slots for each company
        const companiesWithSlots = companies.map((company) => ({
            name: company.name,
            description: company.description || '',
            interviewers: company.interviewers || [],
            slots: generateSlotsBetween(start, end, duration),
        }));

        const event = await InterviewEvent.create({
            title, description, eventType: 'career-day',
            eventDate, startTime: startTime || '09:00', endTime: endTime || '17:00',
            venue, slotDurationMinutes: duration,
            maxBookingsPerStudent: maxBookingsPerStudent || 2,
            requireDifferentCompanies: requireDifferentCompanies !== false,
            companies: companiesWithSlots,
            targetYear, targetMajor,
            organizer: req.user._id,
        });

        res.status(201).json({ status: 'success', data: { event } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN: Create a Normal Day Event (Urgent Hiring)
// POST /api/v1/interviews/events/normal-day
// ─────────────────────────────────────────────────────────────────
exports.createNormalDayEvent = async (req, res, next) => {
    try {
        const {
            title, description, companyName, eventDate, startTime, endTime,
            venue, slotDurationMinutes, maxCandidates, targetYear, targetMajor,
        } = req.body;

        if (!companyName || !companyName.trim()) {
            return next(new AppError('Company name is required for Normal Day event.', 400));
        }

        const start = applyTime(eventDate, startTime || '09:00');
        const end = applyTime(eventDate, endTime || '17:00');
        const duration = slotDurationMinutes || 30;

        if (start >= end) {
            return next(new AppError('End time must be after start time.', 400));
        }

        const slots = generateSlotsBetween(start, end, duration);
        const cappedSlots = slots.slice(0, maxCandidates || 50);

        const event = await InterviewEvent.create({
            title, description, eventType: 'normal-day',
            companyName, eventDate,
            startTime: startTime || '09:00', endTime: endTime || '17:00',
            venue, slotDurationMinutes: duration,
            maxCandidates: maxCandidates || 50,
            maxBookingsPerStudent: 1,
            slots: cappedSlots,
            targetYear, targetMajor,
            organizer: req.user._id,
        });

        res.status(201).json({ status: 'success', data: { event } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN: Create Event (legacy – kept for backward compat)
// POST /api/v1/interviews/events
// ─────────────────────────────────────────────────────────────────
exports.createEvent = async (req, res, next) => {
    try {
        const { title, description, eventDate, venue, slotDurationMinutes, maxBookingsPerStudent, targetYear, targetMajor } = req.body;

        const start = new Date(eventDate);
        start.setHours(9, 0, 0, 0);
        const end = new Date(eventDate);
        end.setHours(17, 0, 0, 0);
        const slots = generateSlotsBetween(start, end, slotDurationMinutes || 30);

        if (slots.length === 0) {
            return next(new AppError('No valid slots could be generated for this event.', 400));
        }

        const event = await InterviewEvent.create({
            title, description, eventDate, venue, slotDurationMinutes,
            maxBookingsPerStudent, targetYear, targetMajor,
            eventType: 'normal-day',
            organizer: req.user._id,
            slots,
        });

        res.status(201).json({ status: 'success', data: { event } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// SHARED: Get all events
// GET /api/v1/interviews/events
// ─────────────────────────────────────────────────────────────────
exports.getEvents = async (req, res, next) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { status: 'published' };
        const { type } = req.query;
        if (type && ['career-day', 'normal-day'].includes(type)) {
            filter.eventType = type;
        }

        const events = await InterviewEvent.find(filter)
            .populate('organizer', 'name firstName lastName email')
            .sort({ eventDate: 1 });

        res.status(200).json({ status: 'success', results: events.length, data: { events } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// SHARED: Get single event with slots
// GET /api/v1/interviews/events/:id
// ─────────────────────────────────────────────────────────────────
exports.getEventById = async (req, res, next) => {
    try {
        const event = await InterviewEvent.findById(req.params.id)
            .populate('slots.bookedBy', 'firstName lastName email')
            .populate('organizer', 'firstName lastName email');
        if (!event) return next(new AppError('Interview event not found.', 404));
        res.status(200).json({ status: 'success', data: { event } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN: Publish a draft event
// PATCH /api/v1/interviews/events/:id/publish
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// ADMIN: Update event details
// PATCH /api/v1/interviews/events/:id
// ─────────────────────────────────────────────────────────────────
exports.updateEvent = async (req, res, next) => {
    try {
        const allowed = ['title', 'description', 'eventDate', 'venue', 'startTime', 'endTime', 'status', 'maxBookingsPerStudent', 'maxCandidates', 'requireDifferentCompanies'];
        const updates = {};
        allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

        const event = await InterviewEvent.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!event) return next(new AppError('Interview event not found.', 404));
        res.status(200).json({ status: 'success', data: { event } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN: Cancel an event
// DELETE /api/v1/interviews/events/:id
// ─────────────────────────────────────────────────────────────────
exports.cancelEvent = async (req, res, next) => {
    try {
        const event = await InterviewEvent.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );
        if (!event) return next(new AppError('Interview event not found.', 404));
        res.status(200).json({ status: 'success', message: 'Event cancelled.', data: { event } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// ADMIN: Get analytics stats
// GET /api/v1/interviews/events/stats
// ─────────────────────────────────────────────────────────────────
exports.getEventStats = async (req, res, next) => {
    try {
        const events = await InterviewEvent.find();
        const totalEvents = events.length;
        const publishedEvents = events.filter((e) => e.status === 'published').length;
        const upcomingEvents = events.filter((e) => e.eventDate > new Date() && e.status !== 'cancelled').length;

        let totalSlots = 0, totalBookings = 0;
        events.forEach((e) => {
            totalSlots += e.totalSlots || 0;
            totalBookings += e.totalBookings || 0;
        });

        res.status(200).json({
            status: 'success',
            data: { totalEvents, publishedEvents, upcomingEvents, totalSlots, totalBookings },
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// STUDENT: Get my bookings across all events
// GET /api/v1/interviews/events/my-bookings
// ─────────────────────────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const events = await InterviewEvent.find({ status: { $ne: 'cancelled' } })
            .populate('organizer', 'firstName lastName email')
            .sort({ eventDate: 1 });

        const bookings = [];
        events.forEach((event) => {
            if (event.eventType === 'career-day') {
                event.companies.forEach((company) => {
                    company.slots.forEach((slot) => {
                        if (slot.bookedBy?.toString() === userId && slot.status === 'booked') {
                            bookings.push({
                                eventId: event._id,
                                eventTitle: event.title,
                                eventDate: event.eventDate,
                                eventType: event.eventType,
                                venue: event.venue,
                                eventStatus: event.status,
                                companyId: company._id,
                                companyName: company.name,
                                slotId: slot._id,
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                                slotStatus: slot.status,
                            });
                        }
                    });
                });
            } else {
                event.slots.forEach((slot) => {
                    if (slot.bookedBy?.toString() === userId && slot.status === 'booked') {
                        bookings.push({
                            eventId: event._id,
                            eventTitle: event.title,
                            eventDate: event.eventDate,
                            eventType: event.eventType,
                            venue: event.venue,
                            eventStatus: event.status,
                            companyId: null,
                            companyName: event.companyName,
                            slotId: slot._id,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            slotStatus: slot.status,
                        });
                    }
                });
            }
        });

        res.status(200).json({ status: 'success', results: bookings.length, data: { bookings } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// STUDENT: Book a slot
// POST /api/v1/interviews/events/:id/book/:slotId
// Body: { companyId } for career-day events
// ─────────────────────────────────────────────────────────────────
exports.bookSlot = async (req, res, next) => {
    try {
        const event = await InterviewEvent.findById(req.params.id);
        if (!event) return next(new AppError('Interview event not found.', 404));
        if (event.status !== 'published') {
            return next(new AppError('This event is not open for booking.', 400));
        }

        const userId = req.user._id.toString();

        if (event.eventType === 'career-day') {
            const { companyId } = req.body;
            if (!companyId) return next(new AppError('companyId is required for career day booking.', 400));

            const company = event.companies.id(companyId);
            if (!company) return next(new AppError('Company not found.', 404));

            // Count total bookings for this student in this event
            let totalStudentBookings = 0;
            const bookedCompanyIds = [];
            event.companies.forEach((c) => {
                c.slots.forEach((s) => {
                    if (s.bookedBy?.toString() === userId && s.status === 'booked') {
                        totalStudentBookings++;
                        bookedCompanyIds.push(c._id.toString());
                    }
                });
            });

            if (totalStudentBookings >= event.maxBookingsPerStudent) {
                return next(new AppError(`You can only book ${event.maxBookingsPerStudent} slot(s) per event.`, 409));
            }

            if (event.requireDifferentCompanies && bookedCompanyIds.includes(companyId.toString())) {
                return next(new AppError('You already have a booking with this company. Please choose a different company.', 409));
            }

            const slot = company.slots.id(req.params.slotId);
            if (!slot) return next(new AppError('Slot not found.', 404));
            if (slot.status !== 'available') {
                return next(new AppError('This slot is no longer available.', 409));
            }

            slot.bookedBy = req.user._id;
            slot.status = 'booked';
            await event.save();

            return res.status(200).json({
                status: 'success',
                message: 'Slot booked successfully.',
                data: { slot, companyName: company.name },
            });
        }

        // Normal Day booking
        const alreadyBooked = event.slots.filter(
            (s) => s.bookedBy?.toString() === userId && s.status === 'booked'
        ).length;

        if (alreadyBooked >= event.maxBookingsPerStudent) {
            return next(new AppError(`You can only book ${event.maxBookingsPerStudent} slot(s) per event.`, 409));
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

// ─────────────────────────────────────────────────────────────────
// STUDENT: Cancel booking
// DELETE /api/v1/interviews/events/:id/book/:slotId
// Body: { companyId } for career-day
// ─────────────────────────────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
    try {
        const event = await InterviewEvent.findById(req.params.id);
        if (!event) return next(new AppError('Event not found.', 404));

        const userId = req.user._id.toString();

        if (event.eventType === 'career-day') {
            const { companyId } = req.body;
            if (!companyId) return next(new AppError('companyId is required.', 400));
            const company = event.companies.id(companyId);
            if (!company) return next(new AppError('Company not found.', 404));
            const slot = company.slots.id(req.params.slotId);
            if (!slot) return next(new AppError('Slot not found.', 404));
            if (slot.bookedBy?.toString() !== userId) {
                return next(new AppError('You did not book this slot.', 403));
            }
            slot.bookedBy = null;
            slot.status = 'available';
            await event.save();
            return res.status(200).json({ status: 'success', message: 'Booking cancelled.' });
        }

        const slot = event.slots.id(req.params.slotId);
        if (!slot) return next(new AppError('Slot not found.', 404));
        if (slot.bookedBy?.toString() !== userId) {
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
