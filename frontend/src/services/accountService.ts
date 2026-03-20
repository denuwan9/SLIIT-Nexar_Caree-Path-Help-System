import api from '../api/axios';

const accountService = {
    changePassword: async (currentPassword: string, newPassword: string) => {
        const res = await api.put('/auth/change-password', { currentPassword, newPassword });
        return res.data;
    },

    changeEmail: async (newEmail: string, password: string) => {
        const res = await api.put('/auth/change-email', { newEmail, password });
        return res.data;
    },

    deleteAccount: async (password: string) => {
        const res = await api.delete('/auth/delete-account', { data: { password } });
        return res.data;
    },
};

export default accountService;
