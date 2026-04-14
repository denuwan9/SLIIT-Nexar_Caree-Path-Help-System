const { google } = require('googleapis');
const logger = require('../utils/logger');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const APP_TAG = 'nexar-study';
const COLOR_IDS = ['1', '2', '3', '4', '5', '7', '8', '9', '10', '11'];

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const parseEventDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value.dateTime || value.date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseTimeToHourMinute = (timeStr = '') => {
    const [h, m] = String(timeStr).split(':').map((v) => parseInt(v, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return { h, m };
};

const getSessionNominalStart = (sessionDateInput, plan) => {
    const sessionDate = new Date(sessionDateInput);
    if (Number.isNaN(sessionDate.getTime())) return null;

    let hour = 9;
    let minute = 0;

    const workDays = Array.isArray(plan.internshipDays) ? plan.internshipDays : [];
    const dayOfWeek = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });
    const isWorkDay = workDays.includes(dayOfWeek);

    if (isWorkDay && plan.internshipEndTime) {
        const parsedEnd = parseTimeToHourMinute(plan.internshipEndTime);
        if (parsedEnd) {
            hour = (parsedEnd.h + 1) % 24;
            minute = parsedEnd.m;
        }
    }

    sessionDate.setHours(hour, minute, 0, 0);
    return sessionDate;
};

const isOverlapping = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

const isSameRange = (aStart, aEnd, bStart, bEnd) => (
    aStart.getTime() === bStart.getTime() && aEnd.getTime() === bEnd.getTime()
);

const buildTaskKey = (planId, sessionId, subjectIdx) => `${planId}:${sessionId}:${subjectIdx}`;

const listCalendarEvents = async (calendar, params = {}) => {
    let pageToken;
    const all = [];

    do {
        const res = await calendar.events.list({
            calendarId: 'primary',
            singleEvents: true,
            showDeleted: false,
            maxResults: 2500,
            ...params,
            pageToken,
        });

        all.push(...(res.data.items || []));
        pageToken = res.data.nextPageToken;
    } while (pageToken);

    return all;
};

const isGoogleInvalidGrant = (error) => {
    const reason = error?.response?.data?.error || error?.code || '';
    const message = error?.message || '';
    return String(reason).includes('invalid_grant') || String(message).includes('invalid_grant');
};

const isGoogleInsufficientScope = (error) => {
    const message = error?.message || '';
    const status = error?.response?.status;
    return status === 403 && String(message).toLowerCase().includes('insufficient authentication scopes');
};

const isGoogleQuotaError = (error) => {
    const message = String(error?.message || '').toLowerCase();
    const status = error?.response?.status;
    return status === 429 || message.includes('quota exceeded') || message.includes('rate limit exceeded');
};

const toCalendarAppError = (error) => {
    if (error instanceof AppError) return error;

    if (isGoogleInvalidGrant(error)) {
        return new AppError('Google Calendar authorization expired. Please reconnect your Google account and sync again.', 401);
    }

    if (isGoogleInsufficientScope(error)) {
        return new AppError('Google Calendar permissions are outdated. Please reconnect and grant calendar access again.', 403);
    }

    if (isGoogleQuotaError(error)) {
        return new AppError('Google Calendar API quota exceeded. Please wait a minute and try syncing again.', 429);
    }

    return new AppError('Google Calendar sync failed. Please try again.', 500);
};

/**
 * Exchange Authorization Code for Access & Refresh Tokens
 */
exports.exchangeCode = async (code, userId) => {
    try {
        const { tokens } = await oauth2Client.getToken({
            code,
            redirect_uri: 'postmessage',
        });
        
        // A refresh token is required for server-side sync to keep working.
        if (!tokens.refresh_token) {
            throw new AppError('Google did not return a refresh token. Please reconnect and grant full calendar permissions.', 400);
        }

        await User.findByIdAndUpdate(userId, {
            googleRefreshToken: tokens.refresh_token,
        });
        
        return tokens;
    } catch (error) {
        logger.error(`OAuth Code Exchange Error: ${error.message}`);
        throw toCalendarAppError(error);
    }
};

/**
 * Get Authenticated Calendar Client for a User
 */
const getCalendarClient = async (user) => {
    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    if (!user.googleRefreshToken) {
        throw new Error('User has not linked Google Calendar');
    }

    client.setCredentials({
        refresh_token: user.googleRefreshToken
    });

    try {
        // Force token refresh now so invalid/revoked refresh tokens are detected early.
        await client.getAccessToken();
    } catch (error) {
        if (isGoogleInvalidGrant(error)) {
            await User.findByIdAndUpdate(user._id, { googleRefreshToken: null });
        }
        throw toCalendarAppError(error);
    }

    return google.calendar({ version: 'v3', auth: client });
};

/**
 * Fetch all Nexar study events from user's Google Calendar
 * Only returns events with privateExtendedProperty: app=nexar-study
 */
exports.fetchNexarEvents = async (user) => {
    try {
        const calendar = await getCalendarClient(user);
        const events = await listCalendarEvents(calendar, {
            privateExtendedProperty: `app=${APP_TAG}`,
            orderBy: 'startTime',
        });

        return events
            .filter((event) => event.status !== 'cancelled')
            .map((event) => ({
                id: event.id,
                title: event.summary,
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                description: event.description,
                link: event.htmlLink,
            }));
    } catch (error) {
        if (isGoogleInvalidGrant(error) || isGoogleInsufficientScope(error)) {
            await User.findByIdAndUpdate(user._id, { googleRefreshToken: null });
        }
        throw toCalendarAppError(error);
    }
};

/**
 * Sync study plan sessions to Google Calendar without overlaps or duplicates.
 */
exports.syncPlanToCalendar = async (user, plan) => {
    try {
        const calendar = await getCalendarClient(user);
        const currentPlanId = String(plan._id);
        const syncSummary = {
            planned: 0,
            added: 0,
            updated: 0,
            skippedDuplicates: 0,
            skippedOverlaps: 0,
            skippedInvalid: 0,
            removedFromOtherPlans: 0,
            removedStaleInCurrentPlan: 0,
            overlapSamples: [],
        };

        const sessions = Array.isArray(plan.sessions) ? plan.sessions : [];

        const subjectColorMap = new Map();
        const uniqueSubjects = [...new Set(sessions.flatMap((s) => (s.subjects || []).map((sub) => sub.subjectName || 'General')))];
        uniqueSubjects.forEach((sub, i) => subjectColorMap.set(sub, COLOR_IDS[i % COLOR_IDS.length]));

        const normalizedTasks = [];

        for (const session of sessions) {
            if (!session?.date || !Array.isArray(session.subjects)) continue;

            let nominalStart = getSessionNominalStart(session.date, plan);
            if (!nominalStart) continue;

            for (let idx = 0; idx < session.subjects.length; idx += 1) {
                const subject = session.subjects[idx];
                syncSummary.planned += 1;

                const duration = subject.durationMinutes || Math.round((subject.durationHours || 1) * 60);
                if (!duration || duration <= 0) {
                    syncSummary.skippedInvalid += 1;
                    continue;
                }

                const startDateTime = new Date(nominalStart);

                const customTime = parseTimeToHourMinute(subject.customStartTime);
                if (customTime) {
                    startDateTime.setHours(customTime.h, customTime.m, 0, 0);
                }

                if (Number.isNaN(startDateTime.getTime())) {
                    syncSummary.skippedInvalid += 1;
                    continue;
                }

                const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
                const taskName = subject.title || subject.topic || 'Study Task';
                const summary = `Study: ${subject.subjectName || 'General'} | ${taskName}`;
                const taskKey = buildTaskKey(String(plan._id), String(session._id), idx);

                normalizedTasks.push({
                    session,
                    subject,
                    idx,
                    summary,
                    taskName,
                    taskKey,
                    startDateTime,
                    endDateTime,
                    colorId: subjectColorMap.get(subject.subjectName || 'General') || '6',
                });

                nominalStart = new Date(nominalStart.getTime() + duration * 60000);
            }
        }

        const currentTaskKeys = new Set(normalizedTasks.map((task) => task.taskKey));

        // Remove old Nexar events that do not belong to the currently synced plan,
        // and remove stale events in the same plan that no longer exist in current tasks.
        const allNexarEvents = await listCalendarEvents(calendar, {
            privateExtendedProperty: `app=${APP_TAG}`,
        });

        const eventsToRemove = allNexarEvents.filter((event) => {
            if (event.status === 'cancelled') return false;

            const eventPlanId = event.extendedProperties?.private?.planId;
            const eventTaskKey = event.extendedProperties?.private?.taskKey;

            if (!eventPlanId || eventPlanId !== currentPlanId) return true;
            if (!eventTaskKey || !currentTaskKeys.has(eventTaskKey)) return true;

            return false;
        });

        for (const event of eventsToRemove) {
            try {
                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: event.id,
                });

                const eventPlanId = event.extendedProperties?.private?.planId;
                if (eventPlanId && eventPlanId === currentPlanId) {
                    syncSummary.removedStaleInCurrentPlan += 1;
                } else {
                    syncSummary.removedFromOtherPlans += 1;
                }
            } catch (deleteError) {
                logger.warn(`Failed to delete old calendar event ${event.id}: ${deleteError.message}`);
            }
        }

        if (!normalizedTasks.length) {
            return syncSummary;
        }

        const minStart = normalizedTasks.reduce((min, t) => (t.startDateTime < min ? t.startDateTime : min), normalizedTasks[0].startDateTime);
        const maxEnd = normalizedTasks.reduce((max, t) => (t.endDateTime > max ? t.endDateTime : max), normalizedTasks[0].endDateTime);

        const timeMin = new Date(minStart.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const timeMax = new Date(maxEnd.getTime() + 24 * 60 * 60 * 1000).toISOString();

        const existingEvents = await listCalendarEvents(calendar, {
            timeMin,
            timeMax,
            orderBy: 'startTime',
        });

        const eventByTaskKey = new Map();
        existingEvents.forEach((event) => {
            const key = event.extendedProperties?.private?.taskKey;
            if (key) {
                eventByTaskKey.set(key, event);
            }
        });

        for (const task of normalizedTasks) {
            const currentByKey = eventByTaskKey.get(task.taskKey);
            const resource = {
                summary: task.summary,
                description: [
                    `Plan: ${plan.title}`,
                    `Subject: ${task.subject.subjectName || 'General'}`,
                    `Task: ${task.taskName}`,
                    `Topic: ${task.subject.topic || '-'}`,
                    `Instruction: ${task.subject.instruction || '-'}`,
                ].join('\n'),
                start: { dateTime: task.startDateTime.toISOString() },
                end: { dateTime: task.endDateTime.toISOString() },
                extendedProperties: {
                    private: {
                        app: APP_TAG,
                        planId: String(plan._id),
                        sessionId: String(task.session._id),
                        subjectIdx: String(task.idx),
                        taskKey: task.taskKey,
                    },
                },
                reminders: {
                    useDefault: false,
                    overrides: [{ method: 'popup', minutes: 15 }],
                },
                colorId: task.colorId,
            };

            const hasExactDuplicate = existingEvents.some((event) => {
                if (event.status === 'cancelled') return false;
                const eventStart = parseEventDate(event.start);
                const eventEnd = parseEventDate(event.end);
                if (!eventStart || !eventEnd) return false;
                return (
                    event.summary === task.summary &&
                    isSameRange(task.startDateTime, task.endDateTime, eventStart, eventEnd)
                );
            });

            if (!currentByKey && hasExactDuplicate) {
                syncSummary.skippedDuplicates += 1;
                continue;
            }

            if (currentByKey) {
                const currentStart = parseEventDate(currentByKey.start);
                const currentEnd = parseEventDate(currentByKey.end);
                const unchanged = currentStart && currentEnd
                    ? currentByKey.summary === task.summary && isSameRange(task.startDateTime, task.endDateTime, currentStart, currentEnd)
                    : false;

                if (unchanged) {
                    syncSummary.skippedDuplicates += 1;
                    continue;
                }
            }

            const overlapEvent = existingEvents.find((event) => {
                if (event.status === 'cancelled') return false;
                if (currentByKey && event.id === currentByKey.id) return false;

                const eventStart = parseEventDate(event.start);
                const eventEnd = parseEventDate(event.end);
                if (!eventStart || !eventEnd) return false;

                return isOverlapping(task.startDateTime, task.endDateTime, eventStart, eventEnd);
            });

            if (overlapEvent) {
                syncSummary.skippedOverlaps += 1;
                if (syncSummary.overlapSamples.length < 5) {
                    syncSummary.overlapSamples.push({
                        task: task.summary,
                        conflictWith: overlapEvent.summary || 'Existing calendar event',
                        start: task.startDateTime.toISOString(),
                        end: task.endDateTime.toISOString(),
                    });
                }
                continue;
            }

            if (currentByKey) {
                const updated = await calendar.events.patch({
                    calendarId: 'primary',
                    eventId: currentByKey.id,
                    resource,
                });

                syncSummary.updated += 1;
                const existingIdx = existingEvents.findIndex((event) => event.id === currentByKey.id);
                if (existingIdx !== -1) {
                    existingEvents[existingIdx] = updated.data;
                }
                eventByTaskKey.set(task.taskKey, updated.data);
                continue;
            }

            const created = await calendar.events.insert({
                calendarId: 'primary',
                resource,
            });

            syncSummary.added += 1;
            existingEvents.push(created.data);
            eventByTaskKey.set(task.taskKey, created.data);
        }

        return syncSummary;
    } catch (error) {
        if (isGoogleInvalidGrant(error) || isGoogleInsufficientScope(error)) {
            await User.findByIdAndUpdate(user._id, { googleRefreshToken: null });
        }
        logger.error(`Critical Sync Error: ${error.message}`);
        throw toCalendarAppError(error);
    }
};
