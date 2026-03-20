import api from '../../api/axios';

export interface UserDTO {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
}

export interface StudentAnalyticsDTO {
    _id: string;
    user: {
        _id: string;
        email: string;
        isActive: boolean;
        lastLogin?: string;
    };
    firstName: string;
    lastName: string;
    major: string;
    university?: string;
    profileCompleteness: number;
    gpa?: number;
    yearOfStudy?: number;
}

const adminService = {
    getAllUsers: async (): Promise<UserDTO[]> => {
        const response = await api.get('/admin/users');
        return response.data.data.users;
    },
    
    getAllStudents: async (): Promise<StudentAnalyticsDTO[]> => {
        const response = await api.get('/admin/students');
        return response.data.data.students;
    },

    toggleUserStatus: async (userId: string): Promise<UserDTO> => {
        const response = await api.patch(`/admin/users/${userId}/status`);
        return response.data.data.user;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/admin/users/${userId}`);
    },

    updateUserRole: async (userId: string, role: string): Promise<UserDTO> => {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data.data.user;
    },

    resetUserPassword: async (userId: string, newPassword: string): Promise<void> => {
        await api.put(`/admin/users/${userId}/password`, { newPassword });
    }
};

export default adminService;
