import api from '../api/axios';
import type { StudentProfile, ProfileUpdateData, Education, Experience, TechnicalSkill, SoftSkill, Language } from '../types/profile';
import type { ApiResponse } from '../types/auth';

const profileService = {
    getMe: async () => {
        const response = await api.get<ApiResponse<{ profile: StudentProfile }>>('/profile/me');
        return response.data.data.profile;
    },

    updateMe: async (data: ProfileUpdateData) => {
        const response = await api.put<ApiResponse<{ profile: StudentProfile }>>('/profile/me', data);
        return response.data.data.profile;
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post<ApiResponse<{ avatarUrl: string }>>('/profile/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data.avatarUrl;
    },

    // Education
    addEducation: async (data: Omit<Education, '_id'>) => {
        const response = await api.post<ApiResponse<{ education: Education[] }>>('/profile/me/education', data);
        return response.data.data.education;
    },

    removeEducation: async (eduId: string) => {
        const response = await api.delete<ApiResponse<{ education: Education[] }>>(`/profile/me/education/${eduId}`);
        return response.data.data.education;
    },

    // Experience
    addExperience: async (data: Omit<Experience, '_id'>) => {
        const response = await api.post<ApiResponse<{ experience: Experience[] }>>('/profile/me/experience', data);
        return response.data.data.experience;
    },

    removeExperience: async (expId: string) => {
        const response = await api.delete<ApiResponse<{ experience: Experience[] }>>(`/profile/me/experience/${expId}`);
        return response.data.data.experience;
    },

    // Technical Skills
    addTechnicalSkill: async (data: Omit<TechnicalSkill, '_id'>) => {
        const response = await api.post<ApiResponse<{ technicalSkills: TechnicalSkill[] }>>('/profile/me/skills/technical', data);
        return response.data.data.technicalSkills;
    },

    removeTechnicalSkill: async (skillId: string) => {
        const response = await api.delete<ApiResponse<{ technicalSkills: TechnicalSkill[] }>>(`/profile/me/skills/technical/${skillId}`);
        return response.data.data.technicalSkills;
    },

    // Soft Skills
    addSoftSkill: async (data: Omit<SoftSkill, '_id'>) => {
        const response = await api.post<ApiResponse<{ softSkills: SoftSkill[] }>>('/profile/me/skills/soft', data);
        return response.data.data.softSkills;
    },

    removeSoftSkill: async (skillId: string) => {
        const response = await api.delete<ApiResponse<{ softSkills: SoftSkill[] }>>(`/profile/me/skills/soft/${skillId}`);
        return response.data.data.softSkills;
    },

    // Languages
    addLanguage: async (data: Omit<Language, '_id'>) => {
        const response = await api.post<ApiResponse<{ languages: Language[] }>>('/profile/me/languages', data);
        return response.data.data.languages;
    },

    removeLanguage: async (langId: string) => {
        const response = await api.delete<ApiResponse<{ languages: Language[] }>>(`/profile/me/languages/${langId}`);
        return response.data.data.languages;
    },
};

export default profileService;
