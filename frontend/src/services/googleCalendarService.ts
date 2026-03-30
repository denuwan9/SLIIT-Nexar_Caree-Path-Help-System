import api from '../api/axios';

export interface GoogleSyncStatus {
    isLinked: boolean;
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
    syncPlan: async (planId: string): Promise<void> => {
        await api.post(`/google-calendar/sync/${planId}`, {});
    }
};
