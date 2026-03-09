import axios from '../api/axios';
import type {
    StudentProfile,
    ProfileUpdateData,
    Education,
    Experience,
    Project,
    TechnicalSkill,
    SoftSkill,
    SocialLinks,
    CareerGoals
} from '../types/profile';

class ProfileService {
    // ── Core
    async getMe(): Promise<StudentProfile> {
        const response = await axios.get('/profile/me');
        return response.data.data.profile;
    }

    async updateMe(data: ProfileUpdateData): Promise<StudentProfile> {
        const response = await axios.put('/profile/me', data);
        return response.data.data.profile;
    }

    async uploadAvatar(file: File): Promise<{ avatarUrl: string; profile: StudentProfile }> {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await axios.post('/profile/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    }

    // ── Arrays: Education
    async addEducation(data: Omit<Education, '_id'>): Promise<Education[]> {
        const response = await axios.post('/profile/me/education', data);
        return response.data.data.education;
    }

    async removeEducation(id: string): Promise<Education[]> {
        const response = await axios.delete(`/profile/me/education/${id}`);
        return response.data.data.education;
    }

    // ── Arrays: Experience
    async addExperience(data: Omit<Experience, '_id'>): Promise<Experience[]> {
        const response = await axios.post('/profile/me/experience', data);
        return response.data.data.experience;
    }

    async removeExperience(id: string): Promise<Experience[]> {
        const response = await axios.delete(`/profile/me/experience/${id}`);
        return response.data.data.experience;
    }

    // ── Arrays: Projects
    async addProject(data: Omit<Project, '_id'>): Promise<Project[]> {
        const response = await axios.post('/profile/me/projects', data);
        return response.data.data.projects;
    }

    async removeProject(id: string): Promise<Project[]> {
        const response = await axios.delete(`/profile/me/projects/${id}`);
        return response.data.data.projects;
    }

    // ── Arrays: Technical Skills
    async addTechnicalSkill(data: Omit<TechnicalSkill, '_id'>): Promise<TechnicalSkill[]> {
        const response = await axios.post('/profile/me/skills/technical', data);
        return response.data.data.technicalSkills;
    }

    async removeTechnicalSkill(id: string): Promise<TechnicalSkill[]> {
        const response = await axios.delete(`/profile/me/skills/technical/${id}`);
        return response.data.data.technicalSkills;
    }

    // ── Arrays: Soft Skills
    async addSoftSkill(data: Omit<SoftSkill, '_id'>): Promise<SoftSkill[]> {
        const response = await axios.post('/profile/me/skills/soft', data);
        return response.data.data.softSkills;
    }

    async removeSoftSkill(id: string): Promise<SoftSkill[]> {
        const response = await axios.delete(`/profile/me/skills/soft/${id}`);
        return response.data.data.softSkills;
    }

    // ── Objects: Social & Career
    async updateSocialLinks(data: SocialLinks): Promise<SocialLinks> {
        const response = await axios.patch('/profile/me/social', data);
        return response.data.data.socialLinks;
    }

    async updateCareerGoals(data: CareerGoals): Promise<CareerGoals> {
        const response = await axios.patch('/profile/me/career-goals', data);
        return response.data.data.careerGoals;
    }
}

export default new ProfileService();
