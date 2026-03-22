const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const StudyPlan = require('../models/StudyPlan');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ─── AI Study Plan Engine ─────────────────────────────────────────

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

/**
 * Get the Groq AI client using environment key
 */
const getGroqClient = (apiKeyOverride) => {
    const apiKey = apiKeyOverride || process.env.GROQ_API_KEY;
    if (!apiKey) {
        logger.warn('[StudyPlan] GROQ_API_KEY not set and no aiKey provided. AI features will not work.');
        return null;
    }
    return new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
    });
};

const readDocumentsToText = async (files = []) => {
    const blobs = await Promise.all(
        files.map(async (file) => {
            const fullPath = file.path || path.join(process.cwd(), file.destination || '', file.filename || '');
            const mime = file.mimetype || '';
            const ext = path.extname(file.originalname || '').toLowerCase();

            if (!fs.existsSync(fullPath)) {
                return `FILE: ${file.originalname} (missing on disk)`;
            }

            const isPlainText = mime.startsWith('text/') || ['.txt', '.md', '.json', '.csv'].includes(ext);

            if (ext === '.pdf') {
                try {
                    const buffer = fs.readFileSync(fullPath);
                    const parsed = await pdfParse(buffer);
                    const body = parsed.text || '(no text extracted)';
                    return `FILE: ${file.originalname}\n${body}`;
                } catch (err) {
                    return `FILE: ${file.originalname} (pdf unreadable: ${err.message})`;
                }
            }

            if (isPlainText) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    return `FILE: ${file.originalname}\n${content}`;
                } catch (err) {
                    return `FILE: ${file.originalname} (unreadable: ${err.message})`;
                }
            }

            return `FILE: ${file.originalname} (binary/unsupported type — ${ext || mime || 'unknown'})`;
        })
    );

    return blobs.join('\n\n');
};

// ─── AI-Powered Study Plan Generation ─────────────────────────────

/**
 * Uses Groq AI to deeply analyze documents and generate a comprehensive study plan.
 * Produces detailed daily sessions with specific tasks, instructions, and study techniques.
 */
const generateAIStudyPlan = async ({ subjects, docsText, hoursPerDay, totalDays, examStartDate, examEndDate, internshipStartTime, internshipEndTime, aiKey }) => {
    const client = getGroqClient(aiKey);
    if (!client) return null;

    const subjectsJson = JSON.stringify(subjects, null, 2);

    const systemPrompt = `You are an intelligent academic study planner.

A student has uploaded study materials (PDFs, lecture notes, or documents). Your job is to:
1) Carefully analyze the uploaded material content and file names. The documents are the source of truth.
2) Identify main topics, subtopics, key concepts, and important definitions/formulas/theories from the documents.
3) Break the content into SMALL, ACTIONABLE STUDY TASKS that are document-specific.

IMPORTANT RULES:
- Do NOT generate generic tasks like "read" or "study". Tasks must be specific to the document content.
- Tasks must feel like real work (e.g., "Understand TCP 3-way handshake", not "Read networking").
- Avoid repeating the same type of task; mix reading, practice, summarizing, testing, revising.
- No duplicate tasks; keep logical order (basic → advanced); break large topics into smaller steps.
- If documents are binary/unreadable (PDF, images), still use FILE NAMES to infer subjects/topics.
- Ignore subject names that do not appear in the documents; align subjects/topics to the docs instead.
- Schedule study blocks OUTSIDE internship hours (${internshipStartTime || 'N/A'} to ${internshipEndTime || 'N/A'}).
- Vary task types: reading, summarizing, practice problems, revision flashcards, self-testing, mind-mapping, past paper practice.
- Give each task a clear, actionable instruction telling the student exactly what to do.
- Prioritize harder subjects and topics closer to exam dates.
- Include break recommendations and study technique tips.

Return ONLY valid JSON. No markdown, no explanation.`;

    const userPrompt = `UPLOADED DOCUMENTS (analyze and extract all subjects/topics from these):
${docsText.slice(0, 15000)}

ORIGINAL SUBJECT HINTS (use only if they match document-derived topics):
${subjectsJson}

CONSTRAINTS:
- Exam period: ${examStartDate} to ${examEndDate} (${totalDays} days)
- Available study hours per day: ${hoursPerDay}
- Internship time: ${internshipStartTime || 'none'} to ${internshipEndTime || 'none'} (schedule study OUTSIDE this window)

Generate a complete study plan in this exact JSON format:
{
  "sessions": [
    {
      "day": 1,
      "date": "${examStartDate}",
      "dayTheme": "Focus on [main subject] fundamentals",
      "subjects": [
        {
          "subjectName": "Exact subject name from the list",
          "topic": "Specific topic from the documents (e.g., Chapter 3: Binary Trees)",
          "title": "Clear task title (e.g., Read and annotate Binary Trees chapter)",
          "taskType": "reading|summarizing|practice|revision|self-test",
          "instruction": "Detailed step-by-step instruction for this study block (2-3 sentences)",
          "durationMinutes": 45,
          "durationHours": 0.75,
          "technique": "pomodoro|spaced|mixed",
          "resources": ["Lecture slides Ch3", "Textbook pp. 45-60"],
          "priority": "critical|high|medium|low"
        }
      ],
      "totalStudyHours": 4,
      "notes": "AI tip for this day"
    }
  ],
  "aiSummary": "A personalized 3-4 sentence study strategy summary that references the student's specific subjects, exam dates, and uploaded materials",
  "extractedTopics": [
    { "subjectName": "Subject", "topics": ["Topic 1 from docs", "Topic 2 from docs"] }
  ]
}

CRITICAL:
- Generate sessions for ALL ${totalDays} days
- Each day should have ${hoursPerDay} hours of study content
- Create AT LEAST 3-4 tasks per day, each 25-60 minutes
- Extract REAL topics from the documents, not generic placeholders
- Task instructions must be specific and actionable
- Spread subjects across days using spaced repetition
- Place revision tasks 2-3 days after initial reading
- Include self-test tasks before exam dates`;

    try {
        const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 8000,
        });

        const raw = completion.choices[0].message.content;
        logger.info(`[StudyPlan] AI response length: ${raw.length}`);

        // Robust JSON extraction
        let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
        let start = -1, depth = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (text[i] === '}') {
                depth--;
                if (depth === 0 && start !== -1) {
                    const candidate = text.slice(start, i + 1);
                    try {
                        return JSON.parse(candidate);
                    } catch {
                        start = -1;
                    }
                }
            }
        }
        return JSON.parse(raw);
    } catch (error) {
        logger.error(`[StudyPlan] AI generation failed: ${error.message}`);
        return null;
    }
};

// ─── Fallback: Local Study Plan Generation ───────────────────────

const difficultyWeight = { easy: 1, medium: 2, hard: 3 };

const buildTaskBacklog = (subjects) => {
    const backlog = [];
    const taskTemplates = [
        { taskType: 'reading', title: (topic, subj) => `Read & annotate: ${topic}`, instruction: (topic, subj) => `Read through ${topic} materials for ${subj}. Highlight key concepts, definitions, and formulas. Write margin notes for anything unclear.`, durationMinutes: 50, technique: 'pomodoro' },
        { taskType: 'summarizing', title: (topic) => `Create summary notes: ${topic}`, instruction: (topic) => `Summarize ${topic} in your own words. Create a one-page cheat sheet with key points, diagrams, and formulas. Use bullet points for quick review.`, durationMinutes: 40, technique: 'pomodoro' },
        { taskType: 'practice', title: (topic) => `Practice problems: ${topic}`, instruction: (topic) => `Work through practice problems on ${topic}. Try solving without notes first, then check. Note any gaps in understanding for later review.`, durationMinutes: 45, technique: 'mixed' },
        { taskType: 'revision', title: (topic) => `Quick revision: ${topic}`, instruction: (topic) => `Review your summary notes and flashcards for ${topic}. Test yourself on key definitions and concepts. Spend extra time on areas you found difficult.`, durationMinutes: 25, technique: 'spaced', offsetDays: 2 },
        { taskType: 'self-test', title: (topic) => `Self-test: ${topic}`, instruction: (topic) => `Close all notes and try to explain ${topic} from memory. Write down everything you remember, then compare with your notes. Fill in any gaps.`, durationMinutes: 25, technique: 'spaced', offsetDays: 4 },
    ];

    subjects.forEach((subj) => {
        const topics = (subj.syllabusTopics && subj.syllabusTopics.length > 0
            ? subj.syllabusTopics
            : [`${subj.name} fundamentals`, `${subj.name} key concepts`, `${subj.name} applications`]).slice(0, 6);

        let taskCount = 0;
        topics.forEach((topic) => {
            taskTemplates.forEach((tpl) => {
                if (taskCount >= 30) return;
                backlog.push({
                    subjectName: subj.name,
                    topic,
                    title: tpl.title(topic, subj.name),
                    taskType: tpl.taskType,
                    instruction: tpl.instruction(topic, subj.name),
                    durationMinutes: tpl.durationMinutes,
                    durationHours: Math.round((tpl.durationMinutes / 60) * 100) / 100,
                    technique: tpl.technique,
                    resources: [],
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
            if (durationHours > dayHoursLeft + 0.01) continue;

            daySubjects.push({
                subjectName: task.subjectName,
                topic: task.topic,
                title: task.title,
                taskType: task.taskType,
                instruction: task.instruction,
                durationHours: Math.round(durationHours * 100) / 100,
                durationMinutes: task.durationMinutes,
                technique: task.technique,
                resources: task.resources,
                priority: task.priority,
            });

            dayHoursLeft -= durationHours;
            task.scheduled = true;
        }

        // Generate a day theme based on subjects covered
        const uniqueSubjects = [...new Set(daySubjects.map(s => s.subjectName))];
        const dayTheme = uniqueSubjects.length > 0
            ? `Focus: ${uniqueSubjects.join(' & ')}`
            : 'Rest day';

        sessions.push({
            day: day + 1,
            date: new Date(currentDate),
            subjects: daySubjects,
            totalStudyHours: Math.round((hoursPerDay - dayHoursLeft) * 100) / 100,
            notes: dayTheme,
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
 * Student — generate a new AI-based study plan (no documents)
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
 * Student — generate a study plan by analyzing uploaded documents with AI
 */
exports.createStudyPlanWithDocs = async (req, res, next) => {
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

        // Read docs and generate AI-powered study plan
        const docsText = await readDocumentsToText(req.files || []);
        const aiKey = typeof req.body.aiKey === 'string' ? req.body.aiKey.trim() : undefined;

        // Try AI-powered generation first
        const aiResult = await generateAIStudyPlan({
            subjects,
            docsText,
            hoursPerDay,
            totalDays,
            examStartDate,
            examEndDate,
            internshipStartTime,
            internshipEndTime,
            aiKey,
        });

        let sessions, aiSummary, enrichedSubjects;

        if (aiResult && aiResult.sessions && aiResult.sessions.length > 0) {
            logger.info('[StudyPlan] Using AI-generated study plan');

            // Process AI sessions — ensure dates are valid
            sessions = aiResult.sessions.map((session, idx) => ({
                day: session.day || idx + 1,
                date: session.date ? new Date(session.date) : new Date(new Date(examStartDate).getTime() + idx * 86400000),
                subjects: (session.subjects || []).map(subj => ({
                    subjectName: subj.subjectName || 'Unknown',
                    title: subj.title || subj.topic || 'Study session',
                    topic: subj.topic || '',
                    taskType: ['reading', 'summarizing', 'practice', 'revision', 'self-test'].includes(subj.taskType) ? subj.taskType : 'reading',
                    instruction: subj.instruction || '',
                    durationHours: subj.durationHours || (subj.durationMinutes ? subj.durationMinutes / 60 : 1),
                    durationMinutes: subj.durationMinutes || Math.round((subj.durationHours || 1) * 60),
                    technique: ['pomodoro', 'spaced', 'mixed'].includes(subj.technique) ? subj.technique : 'pomodoro',
                    resources: subj.resources || [],
                    priority: ['low', 'medium', 'high', 'critical'].includes(subj.priority) ? subj.priority : 'medium',
                })),
                totalStudyHours: session.totalStudyHours || hoursPerDay,
                notes: session.dayTheme || session.notes || '',
            }));

            aiSummary = aiResult.aiSummary || generateAISummary(subjects, hoursPerDay, totalDays);

            // Enrich subjects with extracted topics from AI
            if (aiResult.extractedTopics) {
                enrichedSubjects = subjects.map((s) => {
                    const found = aiResult.extractedTopics.find((t) => t.subjectName?.toLowerCase() === s.name?.toLowerCase());
                    if (found?.topics?.length) {
                        return { ...s, syllabusTopics: found.topics.slice(0, 10) };
                    }
                    return s;
                });
            } else {
                enrichedSubjects = subjects;
            }
        } else {
            logger.info('[StudyPlan] AI generation failed, using fallback local generation');
            sessions = generateStudySessions(subjects, examStartDate, examEndDate, hoursPerDay);
            aiSummary = generateAISummary(subjects, hoursPerDay, totalDays);
            enrichedSubjects = subjects;
        }

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
 * Student — mark a study session subject as completed (legacy)
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
        session.subjects[subjectIdx].status = 'completed';

        // Recalculate overall progress
        const total = plan.sessions.reduce((s, sess) => s + sess.subjects.length, 0);
        const done = plan.sessions.reduce((s, sess) => s + sess.subjects.filter((sub) => sub.isCompleted || sub.status === 'completed').length, 0);
        const inProgress = plan.sessions.reduce((s, sess) => s + sess.subjects.filter((sub) => sub.status === 'in-progress').length, 0);
        plan.overallProgress = total > 0 ? Math.round(((done + inProgress * 0.5) / total) * 100) : 0;

        await plan.save();
        res.status(200).json({ status: 'success', data: { plan } });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/study-plans/:id/sessions/:sessionId/:subjectIdx/status
 * Student — update task status: pending | in-progress | completed
 */
exports.updateSubjectStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['pending', 'in-progress', 'completed'].includes(status)) {
            return next(new AppError('Status must be: pending, in-progress, or completed', 400));
        }

        const plan = await StudyPlan.findOne({ _id: req.params.id, student: req.user._id });
        if (!plan) return next(new AppError('Study plan not found.', 404));

        const session = plan.sessions.id(req.params.sessionId);
        if (!session) return next(new AppError('Session not found.', 404));

        const subjectIdx = parseInt(req.params.subjectIdx, 10);
        if (!session.subjects[subjectIdx]) return next(new AppError('Subject not found in session.', 404));

        session.subjects[subjectIdx].status = status;
        session.subjects[subjectIdx].isCompleted = status === 'completed';

        // Recalculate overall progress (completed = 100%, in-progress = 50%)
        const total = plan.sessions.reduce((s, sess) => s + sess.subjects.length, 0);
        const completed = plan.sessions.reduce((s, sess) =>
            s + sess.subjects.filter((sub) => sub.status === 'completed' || sub.isCompleted).length, 0);
        const inProgress = plan.sessions.reduce((s, sess) =>
            s + sess.subjects.filter((sub) => sub.status === 'in-progress' && !sub.isCompleted).length, 0);
        plan.overallProgress = total > 0 ? Math.round(((completed + inProgress * 0.5) / total) * 100) : 0;

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
