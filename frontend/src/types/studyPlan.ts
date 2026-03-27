export type StudyDifficulty = 'easy' | 'medium' | 'hard';
export type StudyPriority = 'low' | 'medium' | 'high' | 'critical';
export type StudyTaskStatus = 'pending' | 'in-progress' | 'completed';

export interface StudySubject {
    name: string;
    creditHours?: number;
    difficulty: StudyDifficulty;
    examDate?: string;
    weight?: number;
    syllabusTopics?: string[];
}

export interface StudySessionSubject {
    title?: string;
    subjectName: string;
    topic?: string;
    taskType?: 'reading' | 'summarizing' | 'practice' | 'revision' | 'self-test';
    instruction?: string;
    durationHours: number;
    durationMinutes?: number;
    technique?: 'pomodoro' | 'spaced' | 'mixed';
    resources?: string[];
    priority: StudyPriority;
    isCompleted?: boolean;
    status?: StudyTaskStatus;
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
    internshipStartTime?: string;
    internshipEndTime?: string;
    internshipHoursPerDay?: number;
    internshipDays?: string[];
    internshipDaysPerWeek?: number;
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
    internshipStartTime?: string;
    internshipEndTime?: string;
    internshipHoursPerDay?: number;
    internshipDays?: string[];
    internshipDaysPerWeek?: number;
}
