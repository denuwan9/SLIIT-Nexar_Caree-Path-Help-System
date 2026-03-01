import type { User } from './auth';

export type DegreeType = 'Certificate' | 'Diploma' | 'HND' | "Bachelor's" | "Master's" | 'PhD' | 'Other';
export type EmploymentType = 'full-time' | 'part-time' | 'internship' | 'contract' | 'freelance' | 'volunteer' | 'project';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type LanguageProficiency = 'elementary' | 'limited-working' | 'professional' | 'full-professional' | 'native';

export interface Education {
    _id?: string;
    institution: string;
    degree: DegreeType;
    field: string;
    startDate: string;
    endDate?: string;
    isCurrentlyEnrolled: boolean;
    gpa?: number;
    grade?: string;
    description?: string;
    achievements?: string[];
}

export interface Experience {
    _id?: string;
    title: string;
    company: string;
    type: EmploymentType;
    location?: string;
    isRemote: boolean;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    responsibilities?: string[];
    skills?: string[];
}

export interface TechnicalSkill {
    _id?: string;
    name: string;
    category: 'programming-language' | 'framework' | 'database' | 'cloud' | 'devops' | 'mobile' | 'design' | 'data-science' | 'testing' | 'other';
    level: SkillLevel;
    yearsOfExp: number;
}

export interface SoftSkill {
    _id?: string;
    name: string;
    level: 'developing' | 'proficient' | 'advanced' | 'expert';
}

export interface Language {
    _id?: string;
    name: string;
    proficiency: LanguageProficiency;
}

export interface SocialLinks {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
    twitter?: string;
    stackoverflow?: string;
}

export interface StudentProfile {
    id: string;
    user: User | string;
    firstName: string;
    lastName: string;
    headline?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | '';
    phone?: string;
    location?: {
        city?: string;
        country?: string;
        isOpenToRelocation?: boolean;
    };
    university?: string;
    faculty?: string;
    major?: string;
    yearOfStudy?: number;
    gpa?: number;
    studentId?: string;
    careerField?: string;
    careerObjective?: string;
    avatarUrl?: string;
    education: Education[];
    experience: Experience[];
    technicalSkills: TechnicalSkill[];
    softSkills: SoftSkill[];
    languages: Language[];
    socialLinks: SocialLinks;
    resumeUrl?: string;
    profileCompleteness: number;
    isPublic: boolean;
    isActivelyLooking: boolean;
}

export interface ProfileUpdateData extends Partial<Omit<StudentProfile, 'id' | 'user' | 'profileCompleteness'>> { }
