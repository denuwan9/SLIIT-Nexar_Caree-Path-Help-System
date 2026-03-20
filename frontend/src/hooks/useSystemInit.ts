import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../components/auth/AuthProvider';

export interface SystemData {
    user: any;
    profile: any;
    notifications: any[];
    settings: any;
    config: {
        apiVersion: string;
        theme: string;
        lastInitialized: string;
    };
}

export const useSystemInit = () => {
    const [data, setData] = useState<SystemData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    const init = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/system/init');
            setData(response.data.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'System initialization failed');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            init();
        }
    }, [isAuthenticated]);

    return { data, isLoading, error, refetch: init };
};
