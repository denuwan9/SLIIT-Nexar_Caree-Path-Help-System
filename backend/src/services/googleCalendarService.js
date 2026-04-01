/**
 * Fetch all Nexar study events from user's Google Calendar
 * Only returns events with privateExtendedProperty: app=nexar-study
 */
exports.fetchNexarEvents = async (user) => {
    const calendar = await getCalendarClient(user);
    let pageToken = undefined;
    const events = [];
    do {
        const listRes = await calendar.events.list({
            calendarId: 'primary',
            privateExtendedProperty: 'app=nexar-study',
            pageToken: pageToken,
        });
        const items = listRes.data.items || [];
        for (const event of items) {
            events.push({
                id: event.id,
                title: event.summary,
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                description: event.description,
            });
        }
        pageToken = listRes.data.nextPageToken;
    } while (pageToken);
    return events;
};
const { google } = require('googleapis');
const logger = require('../utils/logger');
const User = require('../models/User');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

/**
 * Exchange Authorization Code for Access & Refresh Tokens
 */
exports.exchangeCode = async (code, userId) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        
        // Persist the refresh token to the User if available
        if (tokens.refresh_token) {
            await User.findByIdAndUpdate(userId, { 
                googleRefreshToken: tokens.refresh_token 
            });
        }
        
        return tokens;
    } catch (error) {
        logger.error(`OAuth Code Exchange Error: ${error.message}`);
        throw new Error('Failed to exchange Google auth code');
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

    return google.calendar({ version: 'v3', auth: client });
};

/**
 * Sync Study Plan Sessions to Google Calendar with Deep Clean & Polish
 */
exports.syncPlanToCalendar = async (user, plan) => {
    try {
        const calendar = await getCalendarClient(user);
        
        // 1. RECURSIVE DEEP CLEAN (Paginated Deletion)
        logger.info(`Starting Deep Clean for user: ${user._id}`);
        let pageToken = undefined;
        let deletedCount = 0;

        do {
            const listRes = await calendar.events.list({
                calendarId: 'primary',
                privateExtendedProperty: 'app=nexar-study',
                pageToken: pageToken,
            });

            const items = listRes.data.items || [];
            if (items.length > 0) {
                // Delete in a tight loop
                await Promise.all(items.map(event => 
                    calendar.events.delete({ calendarId: 'primary', eventId: event.id })
                        .catch(e => logger.warn(`Delete failed for ${event.id}: ${e.message}`))
                ));
                deletedCount += items.length;
            }
            pageToken = listRes.data.nextPageToken;
        } while (pageToken);

        logger.info(`Deep Clean complete. Removed ${deletedCount} stale Nexar events.`);

        // 2. FRESH INSERTION WITH COLOR CODING
        const results = [];
        const subjectColorMap = new Map();
        const colors = ['1', '2', '3', '4', '5', '7', '8', '9', '10', '11']; // Google colorIds

        // Map colors to unique subjects in the plan
        const uniqueSubjects = [...new Set(plan.sessions.flatMap(s => s.subjects.map(sub => sub.subjectName)))];
        uniqueSubjects.forEach((sub, i) => subjectColorMap.set(sub, colors[i % colors.length]));

        for (const session of plan.sessions) {
            if (!session.date) continue;

            for (const subject of session.subjects) {
                try {
                    const dateStr = session.date instanceof Date 
                        ? session.date.toISOString().split('T')[0] 
                        : new Date(session.date).toISOString().split('T')[0];
                    const startTimeStr = subject.customStartTime || '09:00';
                    const duration = subject.durationMinutes || Math.round((subject.durationHours || 1) * 60);
                    const startDateTime = new Date(`${dateStr}T${startTimeStr}:00`);
                    if (isNaN(startDateTime.getTime())) continue;
                    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

                    // Extra check: skip if identical event already exists

                    // Compose a clear summary with subject and topic/task

                    const taskName = subject.title || subject.topic || 'Task';
                    const eventSummary = `${taskName} — ${subject.subjectName}`;


                    const existingEventsRes = await calendar.events.list({
                        calendarId: 'primary',
                        timeMin: startDateTime.toISOString(),
                        timeMax: endDateTime.toISOString(),
                        privateExtendedProperty: 'app=nexar-study',
                        q: eventSummary,
                    });
                    const exists = (existingEventsRes.data.items || []).some(ev =>
                        ev.summary === eventSummary &&
                        ev.start?.dateTime === startDateTime.toISOString() &&
                        ev.end?.dateTime === endDateTime.toISOString() &&
                        ev.extendedProperties?.private?.app === 'nexar-study'
                    );
                    if (exists) {
                        logger.info(`Skipped duplicate event for ${eventSummary} at ${startDateTime.toISOString()}`);
                        continue;
                    }

                    const event = {
                        summary: eventSummary,
                        description: `Subject: ${subject.subjectName}\nTask: ${taskName}\nTopic: ${subject.topic || ''}\nInstruction: ${subject.instruction || ''}\nFrom Nexar Study Plan: "${plan.title}"`,
                        start: { dateTime: startDateTime.toISOString(), timeZone: 'UTC' },
                        end: { dateTime: endDateTime.toISOString(), timeZone: 'UTC' },
                        extendedProperties: {
                            private: { app: 'nexar-study' }
                        },
                        reminders: {
                            useDefault: false,
                            overrides: [{ method: 'popup', minutes: 15 }],
                        },
                        colorId: subjectColorMap.get(subject.subjectName) || '6',
                    };

                    const created = await calendar.events.insert({
                        calendarId: 'primary',
                        resource: event,
                    });
                    results.push(created.data);
                } catch (e) {
                    logger.error(`Event placement failed: ${e.message}`);
                }
            }
        }

        return results;
    } catch (error) {
        logger.error(`Critical Sync Error: ${error.message}`);
        throw new Error('Sync failed. Please try again.');
    }
};
