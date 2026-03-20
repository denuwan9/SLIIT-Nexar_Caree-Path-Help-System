const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
        language: { type: String, default: 'en' },
        privacyLevel: { type: String, enum: ['public', 'private', 'institutional'], default: 'institutional' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
