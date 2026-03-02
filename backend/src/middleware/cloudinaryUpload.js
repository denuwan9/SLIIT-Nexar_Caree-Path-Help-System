const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const AppError = require('../utils/AppError');

// ── Cloudinary Configuration ───────────────────────────────────────
// Always lowercase the cloud_name — Cloudinary stores/references names in lowercase
cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_NAME || '').toLowerCase(),
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage Configurations ─────────────────────────────────────────

// 1. Avatar Storage
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'nexar/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

// 2. Project Images Storage
const projectStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'nexar/projects',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }],
    },
});

// ── Multer Instances ───────────────────────────────────────────────

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

const mimeFilter = (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Only JPEG, PNG, or WebP images are allowed.', 400), false);
    }
};

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: mimeFilter,
});

const uploadProjectImages = multer({
    storage: projectStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: mimeFilter,
});

// ── Middleware Wrappers ────────────────────────────────────────────
// These wrap multer so ALL errors (multer + Cloudinary) go to next(err)
// and the server NEVER crashes from an unhandled rejection.

const uploadAvatarMiddleware = (req, res, next) => {
    uploadAvatar.single('avatar')(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File too large. Maximum size is 5 MB.', 413));
        }
        if (err instanceof multer.MulterError) {
            return next(new AppError(`Upload error: ${err.message}`, 400));
        }
        // Cloudinary or unexpected error — forward, never crash
        return next(new AppError(err.message || 'Image upload failed.', 500));
    });
};

const uploadProjectImagesMiddleware = (req, res, next) => {
    uploadProjectImages.array('images', 5)(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError('One or more files are too large. Maximum size is 5 MB.', 413));
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return next(new AppError('Maximum of 5 images allowed per project.', 400));
            }
            return next(new AppError(`Upload error: ${err.message}`, 400));
        }
        return next(new AppError(err.message || 'Image upload failed.', 500));
    });
};

module.exports = {
    cloudinary,
    uploadAvatarMiddleware,
    uploadProjectImagesMiddleware,
};
