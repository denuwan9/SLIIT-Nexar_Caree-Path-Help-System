import { useState, useCallback } from 'react';
import api from '../api/axios';

export interface SystemBootData {
    UserPermissions: {
        role: string;
        isAdmin: boolean;
        accessLevel: number;
    };
    GlobalSettings: any;
    DashboardState: {
        unreadNotifications: number;
        systemStatus: string;
        lastSync: string;
    };
    ProfileData: any;
}

export const useSystemBoot = () => {
    const [bootData, setBootData] = useState<SystemBootData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const boot = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // High-precision parallel fetch handshake
            const response = await api.get('/system/boot');
            setBootData(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'System boot sequence failed');
            console.error('[System Boot Error]:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { boot, bootData, isLoading, error };
};
