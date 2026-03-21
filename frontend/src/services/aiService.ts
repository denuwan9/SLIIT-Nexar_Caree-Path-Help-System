/**
 * aiService.ts
 * Axios service functions for all 4 AI backend endpoints.
 */

import api from '../api/axios';
import type { ChatMessage, CareerRoadmap, SkillGapResult, ResumeAnalysisResult } from '../types/ai';

// ── 1. Chat Advisor ───────────────────────────────────────────────────────
export const sendChatMessage = async (
    message: string,
    history: ChatMessage[]
): Promise<string> => {
    const payload = {
        message,
        history: history.map(m => ({ role: m.role, content: m.content })),
    };
    const res = await api.post('/ai/chat', payload);
    return res.data.data.reply as string;
};

// ── 2. Career Simulator ────────────────────────────────────────────────────
export const simulateCareer = async (targetRole: string, currentLevel: string): Promise<CareerRoadmap> => {
    const res = await api.post('/ai/simulate', { targetRole, currentLevel });
    return res.data.data.roadmap as CareerRoadmap;
};

// ── 3. Skill Gap Analyzer ──────────────────────────────────────────────────
export const analyzeSkillGap = async (jobDescription: string): Promise<SkillGapResult> => {
    const res = await api.post('/ai/skill-gap', { jobDescription });
    return res.data.data.analysis as SkillGapResult;
};

// ── 4. Resume Analyzer ─────────────────────────────────────────────────────
export const analyzeResume = async (
    resume: string | File,
    jobDescription?: string,
    targetRole?: string
): Promise<ResumeAnalysisResult> => {
    if (resume instanceof File) {
        const formData = new FormData();
        formData.append('resume', resume);
        if (jobDescription) formData.append('jobDescription', jobDescription);
        if (targetRole) formData.append('targetRole', targetRole);

        const res = await api.post('/ai/resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data.report as ResumeAnalysisResult;
    } else {
        const res = await api.post('/ai/resume', { resumeText: resume, jobDescription, targetRole });
        return res.data.data.report as ResumeAnalysisResult;
    }
};
