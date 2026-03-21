import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../api/axios';
import type { AuthState } from '../../types/auth';
import type { SignupInput } from '../../features/auth/authSchemas';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<any>;
    signup: (data: SignupInput) => Promise<any>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: localStorage.getItem('accessToken'),
        isAuthenticated: false,
        isLoading: true,
    });

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        setState({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
        });
        return user;
    };

    const signup = async (data: SignupInput) => {
        const payload = {
            ...data,
            currentMajor: "Undeclared",
            targetRole: "Student"
        };
        const response = await api.post('/auth/register', payload);
        const { accessToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        setState({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
        });
        return user;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
            setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    };

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setState((prev) => ({ ...prev, isLoading: false }));
            return;
        }

        try {
            const response = await api.get('/auth/me');
            setState({
                user: response.data.data.user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            localStorage.removeItem('accessToken');
            setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, signup, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
