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
export const simulateCareer = async (targetRole: string): Promise<CareerRoadmap> => {
    const res = await api.post('/ai/simulate', { targetRole });
    return res.data.data.roadmap as CareerRoadmap;
};

// ── 3. Skill Gap Analyzer ──────────────────────────────────────────────────
export const analyzeSkillGap = async (jobDescription: string): Promise<SkillGapResult> => {
    const res = await api.post('/ai/skill-gap', { jobDescription });
    return res.data.data.analysis as SkillGapResult;
};

// ── 4. Resume Analyzer ─────────────────────────────────────────────────────
export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysisResult> => {
    const res = await api.post('/ai/resume', { resumeText });
    return res.data.data.report as ResumeAnalysisResult;
};
