import { z } from 'zod';

export const profileInfoSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name too long')
    .regex(/^[A-Za-z\s\-']+$/, 'First name should only contain letters, spaces, hyphens, or apostrophes'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name too long')
    .regex(/^[A-Za-z\s\-']+$/, 'Last name should only contain letters, spaces, hyphens, or apostrophes'),
  headline: z.string()
    .max(120, 'Headline must be under 120 characters')
    .regex(/^[A-Za-z\s\-'.|]+$/, 'Headline should only contain letters, spaces, or | - . \'')
    .optional().or(z.literal('')),
  bio: z.string().max(800, 'Bio must be under 800 characters').optional().or(z.literal('')),
  phone: z.string()
    .regex(/^\+?[\d\s-]{8,20}$/, 'Invalid phone format (e.g. +94 77 123 4567)')
    .optional()
    .or(z.literal('')),
  location: z.object({
    city: z.string().max(100, 'City name too long'),
    country: z.string().max(100, 'Country name too long'),
    isOpenToRelocation: z.boolean(),
  }),
  university: z.string()
    .max(150, 'University name too long')
    .regex(/^[A-Za-z\s\-'.]+$/, 'University should only contain letters, spaces, hyphens, or dots')
    .optional().or(z.literal('')),
  faculty: z.string()
    .max(100, 'Faculty name too long')
    .regex(/^[A-Za-z\s\-'.]+$/, 'Faculty should only contain letters, spaces, hyphens, or dots')
    .optional().or(z.literal('')),
  major: z.string()
    .max(100, 'Major name too long')
    .regex(/^[A-Za-z\s\-'.]+$/, 'Major should only contain letters, spaces, hyphens, or dots')
    .optional().or(z.literal('')),
  yearOfStudy: z.number().min(1).max(6).optional(),
  gpa: z.number().min(0).max(4.0, 'GPA should be between 0 and 4.0').optional(),
  studentId: z.string()
    .regex(/^([iI][tT]\d{8})?$/, 'Student ID must start with IT followed by 8 digits (e.g. IT21115536)')
    .transform(val => val ? val.toUpperCase() : undefined)
    .optional(),
  isActivelyLooking: z.boolean(),
  isPublic: z.boolean(),
});

export const educationSchema = z.object({
  institution: z.string()
    .min(2, 'Institution name is required')
    .regex(/^[A-Za-z\s\-'.]+$/, 'Institution name should only contain letters, spaces, hyphens, or dots'),
  degree: z.enum(["Bachelor's", "Master's", "PhD", "Diploma", "HND", "Certificate", "Other"]),
  field: z.string()
    .min(2, 'Field of study is required')
    .regex(/^[A-Za-z\s\-'.]+$/, 'Field of study should only contain letters, spaces, hyphens, or dots'),
  startYear: z.number().min(1950).max(new Date().getFullYear() + 10),
  endYear: z.number().min(1950).max(2100).optional(),
  isCurrent: z.boolean(),
  gpa: z.number().min(0).max(4.2, 'GPA should be between 0 and 4.2').optional(),
  description: z.string().max(1000, 'Description too long').optional().or(z.literal('')),
}).refine(data => data.isCurrent || (data.endYear && data.endYear >= data.startYear), {
  message: "End year must be after start year",
  path: ["endYear"],
});

export const experienceSchema = z.object({
  title: z.string()
    .min(2, 'Job title is required')
    .regex(/^[A-Za-z\s\-'.]+$/, 'Job title should only contain letters, spaces, hyphens, or dots'),
  company: z.string()
    .min(2, 'Company name is required')
    .regex(/^[A-Za-z\s\-'.]+$/, 'Company name should only contain letters, spaces, hyphens, or dots'),
  type: z.enum(["full-time", "part-time", "internship", "contract", "freelance", "volunteer"]),
  location: z.string().max(100).optional().or(z.literal('')),
  isRemote: z.boolean(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  isCurrent: z.boolean(),
  description: z.string().max(2000, 'Description too long').optional().or(z.literal('')),
});

export const projectSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  description: z.string().min(10, 'Description should be at least 10 characters').max(2000, 'Description too long'),
  liveUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  techStack: z.array(z.string()).min(1, 'Add at least one technology'),
  impact: z.string().max(500, 'Impact description too long').optional().or(z.literal('')),
});

export const technicalSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(50, 'Skill name too long'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
});

export const softSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(50, 'Skill name too long'),
  level: z.enum(['developing', 'proficient', 'advanced', 'expert']),
});

export const careerGoalsSchema = z.object({
  targetRoles: z.string().min(1, 'At least one target role is required').max(200, 'Too many roles specified'),
  preferredIndustries: z.string().min(1, 'At least one industry is required').max(200, 'Too many industries specified'),
  careerObjective: z.string()
    .min(10, 'Career objective should be at least 10 characters')
    .max(600, 'Career objective must be under 600 characters'),
});

export const socialLinksSchema = z.object({
  linkedin: z.string()
    .url('Invalid URL format')
    .regex(/linkedin\.com/, 'Must be a valid LinkedIn URL')
    .optional().or(z.literal('')),
  github: z.string()
    .url('Invalid URL format')
    .regex(/github\.com/, 'Must be a valid GitHub URL')
    .optional().or(z.literal('')),
  portfolio: z.string()
    .url('Invalid URL format')
    .optional().or(z.literal('')),
  twitter: z.string()
    .url('Invalid URL format')
    .regex(/(twitter\.com|x\.com)/, 'Must be a valid Twitter/X URL')
    .optional().or(z.literal('')),
  stackoverflow: z.string()
    .url('Invalid URL format')
    .regex(/stackoverflow\.com/, 'Must be a valid StackOverflow URL')
    .optional().or(z.literal('')),
});

export type ProfileInfoInput = z.infer<typeof profileInfoSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TechnicalSkillInput = z.infer<typeof technicalSkillSchema>;
export type SoftSkillInput = z.infer<typeof softSkillSchema>;
export type CareerGoalsInput = z.infer<typeof careerGoalsSchema>;
export type SocialLinksInput = z.infer<typeof socialLinksSchema>;
