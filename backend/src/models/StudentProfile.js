/**
 * StudentProfile.js — New Schema (Rebuilt)
 * ─────────────────────────────────────────────────────────────────────────
 * Streamlined, career-focused schema. Designed as the single source of truth
 * for both the UI forms and the Grok AI context payload.
 * ─────────────────────────────────────────────────────────────────────────
 */
const mongoose = require('mongoose');

// ── Sub-document Schemas ─────────────────────────────────────────────────

const educationSchema = new mongoose.Schema({
    institution: { type: String, required: true, trim: true, maxlength: 150 },
    degree: {
        type: String, required: true,
        enum: ["Bachelor's", "Master's", 'PhD', 'Diploma', 'HND', 'Certificate', 'Other'],
    },
    field: { type: String, required: true, trim: true, maxlength: 100 },
    startYear: { type: Number, required: true, min: 1990, max: 2100 },
    endYear: { type: Number, min: 1990, max: 2100 },
    isCurrent: { type: Boolean, default: false },
    gpa: { type: Number, min: 0, max: 4.0 },
    description: { type: String, trim: true, maxlength: 400, default: '' },
}, { _id: true });

const experienceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, required: true, trim: true, maxlength: 100 },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance', 'volunteer'],
        default: 'full-time',
    },
    location: { type: String, trim: true, maxlength: 100 },
    isRemote: { type: Boolean, default: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 600, default: '' },
    skills: { type: [String], default: [] },
}, { _id: true });

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 600, default: '' },
    techStack: { type: [String], default: [] },
    githubUrl: { type: String, trim: true, maxlength: 300, default: '' },
    liveUrl: { type: String, trim: true, maxlength: 300, default: '' },
    impact: { type: String, trim: true, maxlength: 300, default: '' },
    images: { type: [String], default: [] },
}, { _id: true });

const technicalSkillSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: {
        type: String,
        enum: ['language', 'framework', 'database', 'cloud', 'devops', 'mobile', 'design', 'data-science', 'testing', 'tool', 'other'],
        default: 'other',
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
    },
}, { _id: true });

const softSkillSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 60 },
    level: { type: String, enum: ['developing', 'proficient', 'advanced', 'expert'], default: 'proficient' },
}, { _id: true });

// ── Main Schema ──────────────────────────────────────────────────────────

const studentProfileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

        // ── Personal
        firstName: { type: String, trim: true, maxlength: 60, default: '' },
        lastName: { type: String, trim: true, maxlength: 60, default: '' },
        headline: { type: String, trim: true, maxlength: 120, default: '' },
        bio: { type: String, trim: true, maxlength: 800, default: '' },
        phone: { type: String, trim: true, maxlength: 20, default: '' },
        avatarUrl: { type: String, default: '' },
        resumeUrl: { type: String, default: '' },

        // ── Location
        location: {
            city: { type: String, trim: true, maxlength: 80, default: '' },
            country: { type: String, trim: true, maxlength: 80, default: 'Sri Lanka' },
            isOpenToRelocation: { type: Boolean, default: false },
        },

        // ── Academic
        university: { type: String, trim: true, maxlength: 150, default: '' },
        faculty: { type: String, trim: true, maxlength: 100, default: '' },
        major: { type: String, trim: true, maxlength: 100, default: '' },
        yearOfStudy: { type: Number, min: 1, max: 6 },
        gpa: { type: Number, min: 0, max: 4.0 },
        studentId: { type: String, trim: true, maxlength: 20, default: '' },

        // ── Sub-document arrays
        education: { type: [educationSchema], default: [] },
        experience: { type: [experienceSchema], default: [] },
        projects: { type: [projectSchema], default: [] },
        technicalSkills: { type: [technicalSkillSchema], default: [] },
        softSkills: { type: [softSkillSchema], default: [] },

        // ── Career Goals
        careerGoals: {
            targetRoles: { type: [String], default: [] },
            preferredIndustries: { type: [String], default: [] },
            careerObjective: { type: String, trim: true, maxlength: 600, default: '' },
        },

        // ── Social
        socialLinks: {
            linkedin: { type: String, trim: true, default: '' },
            github: { type: String, trim: true, default: '' },
            portfolio: { type: String, trim: true, default: '' },
            twitter: { type: String, trim: true, default: '' },
            stackoverflow: { type: String, trim: true, default: '' },
        },

        // ── Meta
        isPublic: { type: Boolean, default: true },
        isActivelyLooking: { type: Boolean, default: false },
        profileCompleteness: { type: Number, min: 0, max: 100, default: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Virtuals ─────────────────────────────────────────────────────────────

studentProfileSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

/**
 * grokContext — compact, token-efficient AI context string.
 * Injected into every Grok system prompt as the student "Source of Truth".
 */
studentProfileSchema.virtual('grokContext').get(function () {
    const tech = (this.technicalSkills || [])
        .map(s => `${s.name}(${s.level})`).join(', ') || 'None';
    const soft = (this.softSkills || [])
        .map(s => s.name).join(', ') || 'None';
    const edu = (this.education || [])
        .map(e => `${e.degree} in ${e.field} @ ${e.institution}${e.gpa ? ` GPA:${e.gpa}` : ''}`).join('; ') || 'None';
    const exp = (this.experience || [])
        .map(e => `${e.title} @ ${e.company} (${e.isCurrent ? 'Current' : 'Past'})`).join('; ') || 'None';
    const projects = (this.projects || [])
        .map(p => `"${p.title}" [${(p.techStack || []).join(', ')}]`).join('; ') || 'None';

    return [
        `=== NEXAR AI STUDENT CONTEXT ===`,
        `NAME: ${this.firstName} ${this.lastName}`,
        `HEADLINE: ${this.headline || 'N/A'}`,
        `UNIVERSITY: ${this.university || 'N/A'} | MAJOR: ${this.major || 'N/A'} | YEAR: ${this.yearOfStudy || 'N/A'} | GPA: ${this.gpa || 'N/A'}`,
        `BIO: ${this.bio || 'Not provided'}`,
        `TECHNICAL SKILLS: ${tech}`,
        `SOFT SKILLS: ${soft}`,
        `EDUCATION: ${edu}`,
        `EXPERIENCE: ${exp}`,
        `PROJECTS: ${projects}`,
        `TARGET ROLES: ${(this.careerGoals?.targetRoles || []).join(', ') || 'Not specified'}`,
        `CAREER OBJECTIVE: ${this.careerGoals?.careerObjective || 'Not specified'}`,
        `ACTIVELY LOOKING: ${this.isActivelyLooking ? 'Yes' : 'No'}`,
        `PROFILE COMPLETENESS: ${this.profileCompleteness}%`,
        `=== END CONTEXT ===`,
    ].join('\n');
});

// ── Pre-save: Completeness Calculation ───────────────────────────────────

studentProfileSchema.pre('save', function (next) {
    const checks = {
        name: !!(this.firstName && this.lastName),           // 15
        bio: !!(this.bio && this.bio.length >= 30),         // 10
        headline: !!this.headline,                               //  5
        academic: !!(this.university && this.major),             // 10
        avatar: !!this.avatarUrl,                              //  5
        education: this.education.length > 0,                     // 10
        experience: this.experience.length > 0,                    // 10
        techSkills: this.technicalSkills.length >= 3,              // 15
        softSkills: this.softSkills.length >= 2,                   //  5
        projects: this.projects.length > 0,                      // 10
        social: !!(this.socialLinks?.linkedin || this.socialLinks?.github), // 5
    };
    const weights = {
        name: 15, bio: 10, headline: 5, academic: 10, avatar: 5,
        education: 10, experience: 10, techSkills: 15, softSkills: 5, projects: 10, social: 5,
    };
    this.profileCompleteness = Object.entries(checks).reduce(
        (score, [key, passed]) => score + (passed ? weights[key] : 0), 0
    );
    next();
});

// ── Indexes ──────────────────────────────────────────────────────────────

// studentProfileSchema.index({ user: 1 }, { unique: true }); // Redundant: unique:true is set in field definition
studentProfileSchema.index({ isPublic: 1, isActivelyLooking: 1 });
studentProfileSchema.index({ 'technicalSkills.name': 1 });
studentProfileSchema.index({ profileCompleteness: -1 });
studentProfileSchema.index(
    { firstName: 'text', lastName: 'text', bio: 'text', headline: 'text' },
    { name: 'profile_text_search' }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
