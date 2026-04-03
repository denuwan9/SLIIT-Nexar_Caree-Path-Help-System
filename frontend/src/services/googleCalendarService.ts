import api from '../api/axios';

export interface GoogleSyncStatus {
    isLinked: boolean;
}

export interface GoogleSyncSummary {
    planned: number;
    added: number;
    updated: number;
    skippedDuplicates: number;
    skippedOverlaps: number;
    skippedInvalid: number;
    removedFromOtherPlans: number;
    removedStaleInCurrentPlan: number;
    overlapSamples?: Array<{
        task: string;
        conflictWith: string;
        start: string;
        end: string;
    }>;
}

export interface GoogleSyncResult {
    status: string;
    message: string;
    syncSummary: GoogleSyncSummary;
}

export interface GoogleCalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    link?: string;
}

export const googleCalendarService = {
    /**
     * Get user's Google Calendar linking status
     */
    getStatus: async (): Promise<GoogleSyncStatus> => {
        const res = await api.get('/google-calendar/status');
        return res.data;
    },

    /**
     * Handle the OAuth2 result from the popup/redirect
     */
    linkAccount: async (code: string): Promise<void> => {
        await api.post('/google-calendar/link', { code });
    },

    /**
     * Sync a specific plan to Google Calendar
     */
    syncPlan: async (planId: string): Promise<GoogleSyncResult> => {
        const res = await api.post(`/google-calendar/sync/${planId}`, {});
        return res.data;
    },

    /**
     * Load Nexar study events synced to Google Calendar
     */
    getEvents: async (): Promise<GoogleCalendarEvent[]> => {
        const res = await api.get('/google-calendar/events');
        return res.data.events || [];
    },
};
