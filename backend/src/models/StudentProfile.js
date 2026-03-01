const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════════
//  SUB-DOCUMENT SCHEMAS
// ═══════════════════════════════════════════════════════════════════

// ── Education Entry ───────────────────────────────────────────────
const educationSchema = new mongoose.Schema(
    {
        institution: {
            type: String,
            required: [true, 'Institution name is required'],
            trim: true,
            maxlength: [150, 'Institution name cannot exceed 150 characters'],
        },
        degree: {
            type: String,
            required: [true, 'Degree is required'],
            trim: true,
            enum: {
                values: ['Certificate', 'Diploma', 'HND', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other'],
                message: '{VALUE} is not a recognised degree type',
            },
        },
        field: {
            type: String,
            required: [true, 'Field of study is required'],
            trim: true,
            maxlength: [100, 'Field of study cannot exceed 100 characters'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    // endDate must be after startDate, or null (still studying)
                    return !v || v > this.startDate;
                },
                message: 'End date must be after the start date',
            },
        },
        isCurrentlyEnrolled: { type: Boolean, default: false },
        gpa: {
            type: Number,
            min: [0, 'GPA cannot be negative'],
            max: [4.0, 'GPA cannot exceed 4.0'],
        },
        grade: {
            type: String,
            trim: true,
            maxlength: [20, 'Grade cannot exceed 20 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [300, 'Description cannot exceed 300 characters'],
            default: '',
        },
        achievements: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 10,
                message: 'Cannot have more than 10 achievements per education entry',
            },
        },
    },
    { _id: true }
);

// ── Experience / Work History Entry ───────────────────────────────
const experienceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            maxlength: [100, 'Company name cannot exceed 100 characters'],
        },
        type: {
            type: String,
            required: [true, 'Employment type is required'],
            enum: {
                values: ['full-time', 'part-time', 'internship', 'contract', 'freelance', 'volunteer', 'project'],
                message: '{VALUE} is not a recognised employment type',
            },
            default: 'internship',
        },
        location: {
            type: String,
            trim: true,
            maxlength: [100, 'Location cannot exceed 100 characters'],
            default: '',
        },
        isRemote: { type: Boolean, default: false },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    return !v || v > this.startDate;
                },
                message: 'End date must be after the start date',
            },
        },
        isCurrent: { type: Boolean, default: false },
        description: {
            type: String,
            trim: true,
            maxlength: [800, 'Description cannot exceed 800 characters'],
            default: '',
        },
        responsibilities: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 10,
                message: 'Cannot list more than 10 responsibilities',
            },
        },
        skills: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 15,
                message: 'Cannot tag more than 15 skills per experience',
            },
        },
    },
    { _id: true }
);

// ── Technical Skill ───────────────────────────────────────────────
const technicalSkillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Skill name is required'],
            trim: true,
            maxlength: [60, 'Skill name cannot exceed 60 characters'],
        },
        category: {
            type: String,
            enum: {
                values: [
                    'programming-language',
                    'framework',
                    'database',
                    'cloud',
                    'devops',
                    'mobile',
                    'design',
                    'data-science',
                    'testing',
                    'other',
                ],
                message: '{VALUE} is not a valid skill category',
            },
            default: 'other',
        },
        level: {
            type: String,
            enum: {
                values: ['beginner', 'intermediate', 'advanced', 'expert'],
                message: '{VALUE} is not a valid proficiency level',
            },
            default: 'beginner',
        },
        yearsOfExp: {
            type: Number,
            min: [0, 'Years of experience cannot be negative'],
            max: [50, 'Years of experience seems unrealistic'],
            default: 0,
        },
    },
    { _id: true }
);

// ── Soft Skill ─────────────────────────────────────────────────────
const softSkillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Soft skill name is required'],
            trim: true,
            maxlength: [60, 'Soft skill name cannot exceed 60 characters'],
        },
        level: {
            type: String,
            enum: {
                values: ['developing', 'proficient', 'advanced', 'expert'],
                message: '{VALUE} is not a valid proficiency level',
            },
            default: 'proficient',
        },
    },
    { _id: true }
);

// ── Language Proficiency ───────────────────────────────────────────
const languageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Language name is required'],
            trim: true,
            maxlength: [50, 'Language name cannot exceed 50 characters'],
        },
        proficiency: {
            type: String,
            required: [true, 'Proficiency level is required'],
            enum: {
                values: ['elementary', 'limited-working', 'professional', 'full-professional', 'native'],
                message: '{VALUE} is not a valid language proficiency level',
            },
        },
    },
    { _id: true }
);

// ── Social & Professional Links ────────────────────────────────────
const socialLinksSchema = new mongoose.Schema(
    {
        linkedin: {
            type: String,
            trim: true,
            match: [
                /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/.+/,
                'Please provide a valid LinkedIn profile URL',
            ],
            default: '',
        },
        github: {
            type: String,
            trim: true,
            match: [
                /^(https?:\/\/)?(www\.)?github\.com\/.+/,
                'Please provide a valid GitHub profile URL',
            ],
            default: '',
        },
        portfolio: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+/, 'Portfolio URL must start with http:// or https://'],
            default: '',
        },
        website: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+/, 'Website URL must start with http:// or https://'],
            default: '',
        },
        twitter: {
            type: String,
            trim: true,
            match: [
                /^(https?:\/\/)?(www\.)?x\.com\/.+|^(https?:\/\/)?(www\.)?twitter\.com\/.+/,
                'Please provide a valid Twitter (X) profile URL',
            ],
            default: '',
        },
        stackoverflow: {
            type: String,
            trim: true,
            default: '',
        },
    },
    { _id: false } // embed directly — no need for its own ObjectId
);


// ═══════════════════════════════════════════════════════════════════
//  MAIN PROFILE SCHEMA
// ═══════════════════════════════════════════════════════════════════
const studentProfileSchema = new mongoose.Schema(
    {
        // ── Identity ──────────────────────────────────────────────────
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            unique: true,           // one profile per user account
            immutable: true,        // cannot be changed after creation
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            minlength: [2, 'First name must be at least 2 characters'],
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            minlength: [2, 'Last name must be at least 2 characters'],
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        headline: {
            type: String,
            trim: true,
            maxlength: [120, 'Headline cannot exceed 120 characters'],
            default: '',
            // e.g. "Final Year Computer Science Student at SLIIT"
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [1000, 'Bio cannot exceed 1000 characters'],
            default: '',
        },
        dateOfBirth: {
            type: Date,
            validate: {
                validator: (v) => !v || v < new Date(),
                message: 'Date of birth cannot be in the future',
            },
        },
        gender: {
            type: String,
            enum: {
                values: ['male', 'female', 'non-binary', 'prefer-not-to-say', ''],
                message: '{VALUE} is not a valid gender option',
            },
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            match: [/^\+?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
            default: '',
        },
        location: {
            city: { type: String, trim: true, maxlength: 80, default: '' },
            country: { type: String, trim: true, maxlength: 80, default: '' },
            isOpenToRelocation: { type: Boolean, default: false },
        },

        // ── Academic Information ──────────────────────────────────────
        university: {
            type: String,
            trim: true,
            maxlength: [150, 'University name cannot exceed 150 characters'],
            default: '',
        },
        faculty: {
            type: String,
            trim: true,
            maxlength: [150, 'Faculty name cannot exceed 150 characters'],
            default: '',
        },
        major: {
            type: String,
            trim: true,
            maxlength: [100, 'Major cannot exceed 100 characters'],
            default: '',
        },
        yearOfStudy: {
            type: Number,
            min: [1, 'Year of study must be at least 1'],
            max: [6, 'Year of study cannot exceed 6'],
            default: 1,
        },
        gpa: {
            type: Number,
            min: [0, 'GPA cannot be negative'],
            max: [4.0, 'GPA cannot exceed 4.0'],
        },
        studentId: {
            type: String,
            trim: true,
            maxlength: [30, 'Student ID cannot exceed 30 characters'],
            default: '',
        },

        // ── Career Field ──────────────────────────────────────────────
        careerField: {
            type: String,
            trim: true,
            enum: {
                values: [
                    'software-engineering',
                    'data-science',
                    'cybersecurity',
                    'cloud-devops',
                    'ui-ux-design',
                    'mobile-development',
                    'networking',
                    'ai-machine-learning',
                    'business-analysis',
                    'project-management',
                    'other',
                    '',
                ],
                message: '{VALUE} is not a recognised career field',
            },
            default: '',
        },
        careerObjective: {
            type: String,
            trim: true,
            maxlength: [500, 'Career objective cannot exceed 500 characters'],
            default: '',
        },

        // ── Profile Image ──────────────────────────────────────────────
        avatarUrl: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+/, 'Avatar URL must start with http:// or https://'],
            default: '',
        },

        // ── Education ─────────────────────────────────────────────────
        education: {
            type: [educationSchema],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 10,
                message: 'A profile can have at most 10 education entries',
            },
        },

        // ── Professional Experience ───────────────────────────────────
        experience: {
            type: [experienceSchema],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 20,
                message: 'A profile can have at most 20 experience entries',
            },
        },

        // ── Technical Skills (unique by name) ─────────────────────────
        technicalSkills: {
            type: [technicalSkillSchema],
            default: [],
            validate: [
                {
                    validator: (arr) => arr.length <= 30,
                    message: 'A profile can have at most 30 technical skills',
                },
                {
                    // Enforce no duplicate skill names (case-insensitive)
                    validator: function (arr) {
                        const names = arr.map((s) => s.name.toLowerCase().trim());
                        return names.length === new Set(names).size;
                    },
                    message: 'Technical skills must be unique — duplicate skill name detected',
                },
            ],
        },

        // ── Soft Skills (unique by name) ──────────────────────────────
        softSkills: {
            type: [softSkillSchema],
            default: [],
            validate: [
                {
                    validator: (arr) => arr.length <= 20,
                    message: 'A profile can have at most 20 soft skills',
                },
                {
                    validator: function (arr) {
                        const names = arr.map((s) => s.name.toLowerCase().trim());
                        return names.length === new Set(names).size;
                    },
                    message: 'Soft skills must be unique — duplicate skill name detected',
                },
            ],
        },

        // ── Languages ─────────────────────────────────────────────────
        languages: {
            type: [languageSchema],
            default: [],
            validate: [
                {
                    validator: (arr) => arr.length <= 10,
                    message: 'A profile can have at most 10 languages',
                },
                {
                    validator: function (arr) {
                        const names = arr.map((l) => l.name.toLowerCase().trim());
                        return names.length === new Set(names).size;
                    },
                    message: 'Language entries must be unique — duplicate language detected',
                },
            ],
        },

        // ── Social & Professional Links ───────────────────────────────
        socialLinks: {
            type: socialLinksSchema,
            default: () => ({}),
        },

        // ── CV / Resume ───────────────────────────────────────────────
        resumeUrl: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+/, 'Resume URL must start with http:// or https://'],
            default: '',
        },

        // ── Profile Status ────────────────────────────────────────────
        profileCompleteness: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        isPublic: {
            type: Boolean,
            default: true,  // other students and admins can view the profile
        },
        isActivelyLooking: {
            type: Boolean,
            default: false, // "open to opportunities" badge
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);


// ═══════════════════════════════════════════════════════════════════
//  VIRTUALS
// ═══════════════════════════════════════════════════════════════════

/** Full name virtual */
studentProfileSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

/** Total years of experience across all entries */
studentProfileSchema.virtual('totalExperienceYears').get(function () {
    if (!this.experience?.length) return 0;
    return this.experience.reduce((total, exp) => {
        const end = exp.isCurrent ? new Date() : (exp.endDate || new Date());
        const start = exp.startDate || new Date();
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
        return total + Math.max(0, years);
    }, 0).toFixed(1);
});


// ═══════════════════════════════════════════════════════════════════
//  PRE-SAVE: COMPLETENESS CALCULATION
// ═══════════════════════════════════════════════════════════════════

studentProfileSchema.pre('save', function (next) {
    const checks = {
        basicInfo: !!(this.firstName && this.lastName && this.bio && this.headline),    // 20 pts
        contactInfo: !!(this.phone && this.location?.city),                               // 10 pts
        academic: !!(this.university && this.major && this.yearOfStudy),               // 15 pts
        avatar: !!this.avatarUrl,                                                    //  5 pts
        education: this.education.length > 0,                                           // 10 pts
        experience: this.experience.length > 0,                                          // 10 pts
        techSkills: this.technicalSkills.length >= 3,                                    // 10 pts
        softSkills: this.softSkills.length >= 2,                                         //  5 pts
        languages: this.languages.length > 0,                                           //  5 pts
        socialLinks: !!(this.socialLinks?.linkedin || this.socialLinks?.github),          //  5 pts
        resume: !!this.resumeUrl,                                                    //  5 pts
    };

    const weights = {
        basicInfo: 20, contactInfo: 10, academic: 15, avatar: 5, education: 10,
        experience: 10, techSkills: 10, softSkills: 5, languages: 5, socialLinks: 5, resume: 5,
    };

    this.profileCompleteness = Object.entries(checks).reduce((score, [key, passed]) => {
        return score + (passed ? weights[key] : 0);
    }, 0);

    next();
});


// ═══════════════════════════════════════════════════════════════════
//  INDEXES
// ═══════════════════════════════════════════════════════════════════

studentProfileSchema.index({ user: 1 });                          // primary lookup
studentProfileSchema.index({ careerField: 1 });                   // filter by field
studentProfileSchema.index({ isPublic: 1, isActivelyLooking: 1 }); // "talent search" queries
studentProfileSchema.index({ 'technicalSkills.name': 1 });        // skill search
studentProfileSchema.index({ profileCompleteness: -1 });          // ranking by completion
studentProfileSchema.index(
    { firstName: 'text', lastName: 'text', bio: 'text', headline: 'text' },
    { name: 'profile_text_search' }                                 // full-text search
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
