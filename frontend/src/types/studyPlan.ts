export type StudyDifficulty = 'easy' | 'medium' | 'hard';
export type StudyPriority = 'low' | 'medium' | 'high' | 'critical';

export interface StudySubject {
    name: string;
    creditHours?: number;
    difficulty: StudyDifficulty;
    examDate?: string;
    weight?: number;
    syllabusTopics?: string[];
}

export interface StudySessionSubject {
    subjectName: string;
    topic?: string;
    durationHours: number;
    priority: StudyPriority;
    isCompleted?: boolean;
}

export interface StudySession {
    _id: string;
    day: number;
    date: string;
    subjects: StudySessionSubject[];
    totalStudyHours: number;
    notes?: string;
}

export interface StudyPlan {
    _id: string;
    title: string;
    examStartDate: string;
    examEndDate: string;
    subjects: StudySubject[];
    availableHoursPerDay: number;
    sessions: StudySession[];
    aiSummary: string;
    totalStudyDays: number;
    overallProgress: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStudyPlanInput {
    title: string;
    examStartDate: string;
    examEndDate: string;
    subjects: StudySubject[];
    availableHoursPerDay?: number;
}
