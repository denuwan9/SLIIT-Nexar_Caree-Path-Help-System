// ─── AI Feature Type Definitions ─────────────────────────────────────────

// Chat
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

// Career Simulator
export interface CareerPhase {
    phase: string;
    goal: string;
    actions: string[];
    keySkills: string[];
    resources: string[];
}

export interface CareerRoadmap {
    targetRole: string;
    overallStrategy: string;
    readinessScore: number;
    shortTerm: CareerPhase;
    midTerm: CareerPhase;
    longTerm: CareerPhase;
}

// Skill Gap
export interface MissingSkill {
    skill: string;
    priority: 'critical' | 'important' | 'nice-to-have';
    reason: string;
}

export interface RecommendedResource {
    skill: string;
    resource: string;
    url?: string;
    estimatedHours?: number;
}

export interface SkillGapResult {
    matchScore: number;
    strengths: string[];
    missingSkills: MissingSkill[];
    recommendedResources: RecommendedResource[];
    urgencyScore: number;
    summary: string;
}

// Resume Analysis
export interface ResumeImprovement {
    section: string;
    issue: string;
    fix: string;
}

export interface ResumeScoreBreakdown {
    keywordDensity: number;
    formatting: number;
    quantifiedAchievements: number;
    actionVerbs: number;
}

export interface ResumeAnalysisResult {
    atsScore: number;
    scoreBreakdown: ResumeScoreBreakdown;
    keywordsToAdd: string[];
    strengths: string[];
    improvements: ResumeImprovement[];
    overallFeedback: string;
}
