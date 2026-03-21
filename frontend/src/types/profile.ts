export interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string;
}

export type DegreeType = "Bachelor's" | "Master's" | "PhD" | "Diploma" | "HND" | "Certificate" | "Other";
export type EmploymentType = "full-time" | "part-time" | "internship" | "contract" | "freelance" | "volunteer";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type SoftSkillLevel = "developing" | "proficient" | "advanced" | "expert";

export interface Education {
    _id?: string;
    institution: string;
    degree: DegreeType;
    field: string;
    startYear: number;
    endYear?: number;
    isCurrent: boolean;
    gpa?: number;
    description?: string;
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
    skills?: string[];
}

export interface Project {
    _id?: string;
    title: string;
    description?: string;
    techStack?: string[];
    githubUrl?: string;
    liveUrl?: string;
    impact?: string;
    images?: string[];
}

export interface TechnicalSkill {
    _id?: string;
    name: string;
    category: string;
    level: SkillLevel;
}

export interface SoftSkill {
    _id?: string;
    name: string;
    level: SoftSkillLevel;
}

export interface CareerGoals {
    targetRoles?: string[];
    preferredIndustries?: string[];
    careerObjective?: string;
}

export interface SocialLinks {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    stackoverflow?: string;
}

export interface StudentProfile {
    _id: string;
    user: string | User;
    firstName: string;
    lastName: string;
    fullName?: string;
    headline?: string;
    bio?: string;
    phone?: string;
    avatarUrl?: string;
    resumeUrl?: string;
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

    // Sub-arrays
    education: Education[];
    experience: Experience[];
    projects: Project[];
    technicalSkills: TechnicalSkill[];
    softSkills: SoftSkill[];

    careerGoals: CareerGoals;
    socialLinks: SocialLinks;

    isPublic: boolean;
    isActivelyLooking: boolean;
    profileCompleteness: number;
}

export type ProfileUpdateData = Partial<Omit<StudentProfile, '_id' | 'user' | 'profileCompleteness' | 'fullName'>>;
