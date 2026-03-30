import api from '../api/axios';
import type { CreateStudyPlanInput, StudyPlan, StudyTaskStatus } from '../types/studyPlan';

export const createStudyPlan = async (payload: CreateStudyPlanInput): Promise<StudyPlan> => {
    const res = await api.post('/study-plans', payload);
    return res.data.data.plan as StudyPlan;
};

export const createStudyPlanWithDocs = async (formData: FormData): Promise<StudyPlan> => {
    const res = await api.post('/study-plans/with-docs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.plan as StudyPlan;
};

export const fetchStudyPlans = async (): Promise<StudyPlan[]> => {
    const res = await api.get('/study-plans');
    return res.data.data.plans as StudyPlan[];
};

export const fetchStudyPlan = async (id: string): Promise<StudyPlan> => {
    const res = await api.get(`/study-plans/${id}`);
    return res.data.data.plan as StudyPlan;
};

export const markStudySubjectComplete = async (
    planId: string,
    sessionId: string,
    subjectIdx: number
): Promise<StudyPlan> => {
    const res = await api.patch(`/study-plans/${planId}/sessions/${sessionId}/${subjectIdx}/complete`);
    return res.data.data.plan as StudyPlan;
};

export const updateSubjectStatus = async (
    planId: string,
    sessionId: string,
    subjectIdx: number,
    status: StudyTaskStatus
): Promise<StudyPlan> => {
    const res = await api.patch(`/study-plans/${planId}/sessions/${sessionId}/${subjectIdx}/status`, { status });
    return res.data.data.plan as StudyPlan;
};

export const updateSubjectTime = async (
    planId: string,
    sessionId: string,
    subjectIdx: number,
    data: { date?: string; customStartTime?: string | null }
): Promise<StudyPlan> => {
    const res = await api.patch(`/study-plans/${planId}/sessions/${sessionId}/${subjectIdx}/time`, data);
    return res.data.data.plan as StudyPlan;
};

export const deleteStudyPlan = async (id: string): Promise<void> => {
    await api.delete(`/study-plans/${id}`);
};
