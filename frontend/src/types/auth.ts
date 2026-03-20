export type UserRole = 'student' | 'admin';

export interface User {
    _id: string;
    fullName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    avatarUrl?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}
