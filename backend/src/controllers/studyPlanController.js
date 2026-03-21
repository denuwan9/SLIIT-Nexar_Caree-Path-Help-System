const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const StudyPlan = require('../models/StudyPlan');
const AppError = require('../utils/AppError');

// ─── AI Study Plan Engine ─────────────────────────────────────────

const DEFAULT_JSON_MODEL = 'grok-2-1212';

const parseTimeToMinutes = (timeStr = '') => {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};

const computeStudyHoursPerDay = ({ availableHoursPerDay, internshipStartTime, internshipEndTime }) => {
    const startMinutes = parseTimeToMinutes(internshipStartTime);
    const endMinutes = parseTimeToMinutes(internshipEndTime);

    if (startMinutes !== null && endMinutes !== null && endMinutes > startMinutes) {
        const internshipHours = Math.max(0, (endMinutes - startMinutes) / 60);
        const remaining = Math.max(1, 24 - internshipHours);
        return { hoursPerDay: Math.min(remaining, 16), internshipHours };
    }

    const fallback = availableHoursPerDay || 4;
    return { hoursPerDay: fallback, internshipHours: null };
};

const resolveAiKey = (req) => {
    return req.headers['x-ai-key'] || req.body.aiKey || process.env.GROK_API_KEY || '';
};

const readDocumentsToText = (files = []) => {
    const blobs = [];
    for (const file of files) {
        const fullPath = file.path || path.join(process.cwd(), file.destination || '', file.filename || '');
        const mime = file.mimetype || '';
        const ext = path.extname(file.originalname || '').toLowerCase();

        const canRead = mime.startsWith('text/') || ['.txt', '.md', '.json', '.csv'].includes(ext);
        if (canRead && fs.existsSync(fullPath)) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                blobs.push(`FILE: ${file.originalname}\n${content}`);
            } catch (err) {
                blobs.push(`FILE: ${file.originalname} (unreadable: ${err.message})`);
            }
        } else {
            // Without heavier parsers, keep a stub so AI knows the titles
            blobs.push(`FILE: ${file.originalname} (binary/unsupported type)`);
        }
    }
    return blobs.join('\n\n');
};

const fetchTopicsFromDocs = async ({ subjects, docsText, aiKey }) => {
    if (!docsText.trim()) return null;

    try {
        const client = new OpenAI({
            apiKey: aiKey || process.env.GROK_API_KEY,
            baseURL: 'https://api.x.ai/v1',
        });

        const systemPrompt = `You are a concise study-plan compiler. Given subjects and raw document text, extract the most relevant lecture-level topics per subject. Keep topics short (<=6 words). Return JSON only.`;

        const userPrompt = `SUBJECTS:
${JSON.stringify(subjects, null, 2)}

DOCUMENTS (trimmed):
${docsText.slice(0, 12000)}

Output JSON:
{ "subjects": [ { "name": "<subject>", "topics": ["topic1", "topic2"] } ] }
Rules: Use document content when possible. If a subject is not covered, infer 3-5 core topics from the course name. Max 8 topics per subject.`;

        const completion = await client.chat.completions.create({
            model: DEFAULT_JSON_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 1200,
        });

        const raw = completion.choices[0].message.content;
        const parsed = JSON.parse(raw);
        return parsed?.subjects || null;
    } catch (error) {
        console.warn('[StudyPlan] Topic extraction failed:', error.message);
        return null;
    }
};
const difficultyWeight = { easy: 1, medium: 2, hard: 3 };

const buildTaskBacklog = (subjects) => {
    const backlog = [];
    const taskTemplates = [
        { taskType: 'reading', title: (topic) => `Read ${topic} materials`, durationMinutes: 60, technique: 'pomodoro' },
        { taskType: 'summarizing', title: (topic) => `Summarize ${topic} in your words`, durationMinutes: 40, technique: 'pomodoro' },
        { taskType: 'practice', title: (topic) => `Practice problems on ${topic}`, durationMinutes: 45, technique: 'mixed' },
        { taskType: 'revision', title: (topic) => `Revision flashcards: ${topic}`, durationMinutes: 25, technique: 'spaced', offsetDays: 2 },
        { taskType: 'self-test', title: (topic) => `Self-test: explain ${topic} from memory`, durationMinutes: 25, technique: 'spaced', offsetDays: 4 },
    ];

    subjects.forEach((subj) => {
        const topics = (subj.syllabusTopics && subj.syllabusTopics.length > 0
            ? subj.syllabusTopics
            : [`${subj.name} core concepts`]).slice(0, 6);

        let taskCount = 0;
        topics.forEach((topic) => {
            taskTemplates.forEach((tpl) => {
                if (taskCount >= 30) return; // cap per subject
                backlog.push({
                    subjectName: subj.name,
                    topic,
                    title: tpl.title(topic),
                    taskType: tpl.taskType,
                    durationMinutes: tpl.durationMinutes,
                    durationHours: Math.round((tpl.durationMinutes / 60) * 100) / 100,
                    technique: tpl.technique,
                    resources: [],
                    instruction: '',
                    priority: subj.difficulty === 'hard' ? 'critical' : subj.difficulty === 'medium' ? 'high' : 'medium',
                    offsetDays: tpl.offsetDays || 0,
                    difficultyWeight: difficultyWeight[subj.difficulty] || 2,
                });
                taskCount += 1;
            });
        });
    });

    return backlog;
};

/**
 * Generates a weighted daily study schedule using task backlog, respecting
 * available hours per day and optional spaced offsets.
 */
const generateStudySessions = (subjects, examStartDate, examEndDate, hoursPerDay) => {
    const start = new Date(examStartDate);
    const end = new Date(examEndDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    const backlog = buildTaskBacklog(subjects);
    const sessions = [];
    let currentDate = new Date(start);

    for (let day = 0; day < totalDays; day++) {
        const daySubjects = [];
        let dayHoursLeft = hoursPerDay;

        const availableTasks = backlog
            .filter((t) => !t.scheduled && t.offsetDays <= day)
            .sort((a, b) => {
                const prioRank = { critical: 3, high: 2, medium: 1, low: 0 };
                if (prioRank[b.priority] !== prioRank[a.priority]) return prioRank[b.priority] - prioRank[a.priority];
                if (b.difficultyWeight !== a.difficultyWeight) return b.difficultyWeight - a.difficultyWeight;
                return (b.durationMinutes || 0) - (a.durationMinutes || 0);
            });

        while (dayHoursLeft > 0 && availableTasks.length > 0) {
            const task = availableTasks.shift();
            if (!task) break;
            const durationHours = task.durationHours || (task.durationMinutes ? task.durationMinutes / 60 : 1);
            if (durationHours > dayHoursLeft + 0.01) continue; // skip too large tasks for today

            daySubjects.push({
                subjectName: task.subjectName,
                topic: task.topic,
                title: task.title,
                taskType: task.taskType,
                durationHours: Math.round(durationHours * 100) / 100,
                durationMinutes: task.durationMinutes,
                technique: task.technique,
                resources: task.resources,
                instruction: task.instruction,
                priority: task.priority,
            });

            dayHoursLeft -= durationHours;
            task.scheduled = true;
        }

        sessions.push({
            day: day + 1,
            date: new Date(currentDate),
            subjects: daySubjects,
            totalStudyHours: Math.round((hoursPerDay - dayHoursLeft) * 100) / 100,
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
        const { title, examStartDate, examEndDate, internshipStartTime, internshipEndTime } = req.body;
        const subjects = typeof req.body.subjects === 'string' ? JSON.parse(req.body.subjects) : req.body.subjects;
        const availableHoursPerDay = typeof req.body.availableHoursPerDay === 'string'
            ? parseFloat(req.body.availableHoursPerDay)
            : req.body.availableHoursPerDay;
        const { hoursPerDay, internshipHours } = computeStudyHoursPerDay({
            availableHoursPerDay,
            internshipStartTime,
            internshipEndTime,
        });
        const start = new Date(examStartDate);
        const end = new Date(examEndDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        const sessions = generateStudySessions(subjects, examStartDate, examEndDate, hoursPerDay);
        const aiSummary = generateAISummary(subjects, hoursPerDay, totalDays);

        const plan = await StudyPlan.create({
            student: req.user._id,
            title, examStartDate, examEndDate, subjects,
            internshipStartTime,
            internshipEndTime,
            internshipHoursPerDay: internshipHours,
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
 * POST /api/study-plans/with-docs
 * Student — generate a new study plan using uploaded documents + AI topics
 */
exports.createStudyPlanWithDocs = async (req, res, next) => {
    try {
        const { title, examStartDate, examEndDate, aiKey, internshipStartTime, internshipEndTime } = req.body;
        const subjects = typeof req.body.subjects === 'string' ? JSON.parse(req.body.subjects) : req.body.subjects;
        const availableHoursPerDay = typeof req.body.availableHoursPerDay === 'string'
            ? parseFloat(req.body.availableHoursPerDay)
            : req.body.availableHoursPerDay;
        const { hoursPerDay, internshipHours } = computeStudyHoursPerDay({
            availableHoursPerDay,
            internshipStartTime,
            internshipEndTime,
        });
        const start = new Date(examStartDate);
        const end = new Date(examEndDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        // Read docs and fetch topics via AI (best effort)
        const docsText = readDocumentsToText(req.files || []);
        const aiTopics = await fetchTopicsFromDocs({ subjects, docsText, aiKey: aiKey || resolveAiKey(req) });

        const enrichedSubjects = subjects.map((s) => {
            const found = aiTopics?.find((t) => t.name?.toLowerCase() === s.name?.toLowerCase());
            if (found?.topics?.length) {
                return { ...s, syllabusTopics: found.topics.slice(0, 8) };
            }
            return s;
        });

        const sessions = generateStudySessions(enrichedSubjects, examStartDate, examEndDate, hoursPerDay);
        const aiSummary = generateAISummary(enrichedSubjects, hoursPerDay, totalDays);

        const plan = await StudyPlan.create({
            student: req.user._id,
            title,
            examStartDate,
            examEndDate,
            internshipStartTime,
            internshipEndTime,
            internshipHoursPerDay: internshipHours,
            subjects: enrichedSubjects,
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
