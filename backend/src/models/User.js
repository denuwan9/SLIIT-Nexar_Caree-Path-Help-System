const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name must not exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name must not exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@(my\.)?sliit\.lk$/, 'Only @sliit.lk and @my.sliit.lk domains are permitted'],
        },
        currentMajor: {
            type: String,
            trim: true,
            default: 'Undeclared',
        },
        skillSet: {
            type: [String],
            default: [],
        },
        targetRole: {
            type: String,
            trim: true,
            default: 'Student',
        },
        avatarUrl: {
            type: String,
            default: '',
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        refreshToken: {
            type: String,
            select: false,
        },
        googleRefreshToken: {
            type: String,
            select: false,
        },
        lastLogin: {
            type: Date,
        },
        passwordChangedAt: Date,
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            select: false,
        },
        verificationTokenExpire: {
            type: Date,
            select: false,
        },
        resetOTP: {
            type: String,
            select: false,
        },
        resetOTPExpires: {
            type: Date,
            select: false,
        },
        resetOTPVerified: {
            type: Boolean,
            default: false,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Virtuals ──────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

// ── Indexes ────────────────────────────────────────────────────────
// NOTE: email index is already created by `unique: true` in the field definition above.
userSchema.index({ role: 1 });

// ── Pre-save Hook: Hash password ───────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    // Only set passwordChangedAt when it's a password change on an existing user,
    // not on the initial registration (isNew === true)
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000; // ensure token created after
    }
    next();
});

// ── Instance Method: Compare password ─────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: Check if password changed after JWT was issued ─
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// ── Instance Method: Create Email Verification Token ─────────────
userSchema.methods.createVerificationToken = function () {
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Token expires in 24 hours
    this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

    return verificationToken;
};

module.exports = mongoose.model('User', userSchema);
