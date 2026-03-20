const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name must not exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        currentMajor: {
            type: String,
            required: [true, 'Current major is required'],
            trim: true,
        },
        skillSet: {
            type: [String],
            default: [],
        },
        targetRole: {
            type: String,
            required: [true, 'Target role is required'],
            trim: true,
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
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

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

module.exports = mongoose.model('User', userSchema);
