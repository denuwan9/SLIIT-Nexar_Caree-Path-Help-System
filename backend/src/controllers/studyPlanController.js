const StudyPlan = require('../models/StudyPlan');
const AppError = require('../utils/AppError');

// ─── AI Study Plan Engine ─────────────────────────────────────────
/**
 * Generates a weighted daily study schedule based on subject difficulty,
 * credit hours, exam proximity, and available hours per day.
 */
const generateStudySessions = (subjects, examStartDate, examEndDate, hoursPerDay) => {
    const start = new Date(examStartDate);
    const end = new Date(examEndDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    // Weight each subject: difficulty + credit hours + custom weight
    const difficultyMap = { easy: 1, medium: 2, hard: 3 };
    const totalWeight = subjects.reduce((sum, s) => {
        return sum + (difficultyMap[s.difficulty] || 2) * (s.creditHours || 3) * (s.weight || 1);
    }, 0);

    // Allocate total hours proportionally
    const totalHours = totalDays * hoursPerDay;
    const allocations = subjects.map((s) => {
        const subjectWeight = (difficultyMap[s.difficulty] || 2) * (s.creditHours || 3) * (s.weight || 1);
        return {
            ...s,
            allocatedHours: Math.round((subjectWeight / totalWeight) * totalHours * 10) / 10,
        };
    });

    // Build day-by-day sessions
    const sessions = [];
    let currentDate = new Date(start);
    let allocationCursors = allocations.map((a) => ({ ...a, remainingHours: a.allocatedHours }));

    for (let day = 1; day <= totalDays; day++) {
        const daySubjects = [];
        let dayHoursLeft = hoursPerDay;

        for (const alloc of allocationCursors) {
            if (alloc.remainingHours <= 0 || dayHoursLeft <= 0) continue;

            const hoursToday = Math.min(alloc.remainingHours, dayHoursLeft, hoursPerDay / 2);
            daySubjects.push({
                subjectName: alloc.name,
                topic: alloc.syllabusTopics?.[0] || 'General revision',
                durationHours: Math.round(hoursToday * 10) / 10,
                priority: alloc.difficulty === 'hard' ? 'critical' : alloc.difficulty === 'medium' ? 'high' : 'medium',
            });
            alloc.remainingHours -= hoursToday;
            dayHoursLeft -= hoursToday;
        }

        sessions.push({
            day,
            date: new Date(currentDate),
            subjects: daySubjects,
            totalStudyHours: hoursPerDay - dayHoursLeft,
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
};

const generateAISummary = (subjects, hoursPerDay, totalDays) => {
    const hardSubjects = subjects.filter((s) => s.difficulty === 'hard').map((s) => s.name);
    const tips = [];

    if (hardSubjects.length > 0) {
        tips.push(`Focus extra attention on: ${hardSubjects.join(', ')} — these are high-difficulty subjects.`);
    }
    tips.push(`You have ${hoursPerDay} study hours per day across ${totalDays} days.`);
    tips.push('Use the Pomodoro technique: 25-minute sessions with 5-minute breaks.');
    tips.push('Review completed sessions and mark them as done to track your progress.');

    return tips.join(' ');
};

// ── Controllers ───────────────────────────────────────────────────

/**
 * POST /api/study-plans
 * Student — generate a new AI-based study plan
 */
exports.createStudyPlan = async (req, res, next) => {
    try {
        const { title, examStartDate, examEndDate, subjects, availableHoursPerDay } = req.body;

        const hoursPerDay = availableHoursPerDay || 4;
        const start = new Date(examStartDate);
        const end = new Date(examEndDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        const sessions = generateStudySessions(subjects, examStartDate, examEndDate, hoursPerDay);
        const aiSummary = generateAISummary(subjects, hoursPerDay, totalDays);

        const plan = await StudyPlan.create({
            student: req.user._id,
            title, examStartDate, examEndDate, subjects,
            availableHoursPerDay: hoursPerDay,
            sessions,
            aiSummary,
            totalStudyDays: totalDays,
        });

        res.status(201).json({ status: 'success', data: { plan } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/study-plans
 * Student — list own study plans
 */
exports.getMyStudyPlans = async (req, res, next) => {
    try {
        const plans = await StudyPlan.find({ student: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: plans.length, data: { plans } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/study-plans/:id
 * Student — get a specific plan
 */
exports.getStudyPlanById = async (req, res, next) => {
    try {
        const plan = await StudyPlan.findOne({ _id: req.params.id, student: req.user._id });
        if (!plan) return next(new AppError('Study plan not found.', 404));
        res.status(200).json({ status: 'success', data: { plan } });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/study-plans/:id/sessions/:sessionId/:subjectIdx/complete
 * Student — mark a study session subject as completed
 */
exports.markSubjectComplete = async (req, res, next) => {
    try {
        const plan = await StudyPlan.findOne({ _id: req.params.id, student: req.user._id });
        if (!plan) return next(new AppError('Study plan not found.', 404));

        const session = plan.sessions.id(req.params.sessionId);
        if (!session) return next(new AppError('Session not found.', 404));

        const subjectIdx = parseInt(req.params.subjectIdx, 10);
        if (!session.subjects[subjectIdx]) return next(new AppError('Subject not found in session.', 404));

        session.subjects[subjectIdx].isCompleted = true;

        // Recalculate overall progress
        const total = plan.sessions.reduce((s, sess) => s + sess.subjects.length, 0);
        const done = plan.sessions.reduce((s, sess) => s + sess.subjects.filter((sub) => sub.isCompleted).length, 0);
        plan.overallProgress = total > 0 ? Math.round((done / total) * 100) : 0;

        await plan.save();
        res.status(200).json({ status: 'success', data: { plan } });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/study-plans/:id
 * Student — delete a study plan
 */
exports.deleteStudyPlan = async (req, res, next) => {
    try {
        const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, student: req.user._id });
        if (!plan) return next(new AppError('Study plan not found.', 404));
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};
