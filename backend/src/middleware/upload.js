const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// ── Ensure upload directories exist ────────────────────────────────
const AVATAR_DIR = path.join(process.cwd(), 'uploads', 'avatars');
const STUDY_DOCS_DIR = path.join(process.cwd(), 'uploads', 'study-plans');
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });
if (!fs.existsSync(STUDY_DOCS_DIR)) fs.mkdirSync(STUDY_DOCS_DIR, { recursive: true });

// ── Disk storage configuration: avatars ────────────────────────────
const avatarStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
    filename: (req, _file, cb) => {
        const ext = path.extname(_file.originalname).toLowerCase();
        cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
    },
});

// ── Disk storage configuration: study documents ────────────────────
const studyDocsStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, STUDY_DOCS_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `studydoc-${req.user._id}-${Date.now()}${ext}`);
    },
});

// ── File type validation ──────────────────────────────────────────
const avatarFilter = (_req, file, cb) => {
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed.', 415), false);
};

const studyDocsFilter = (_req, file, cb) => {
    const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/markdown',
        'application/json',
    ];
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new AppError('Unsupported file type for study documents.', 415), false);
};

// ── Multer instances ──────────────────────────────────────────────
const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: avatarFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

const uploadStudyDocs = multer({
    storage: studyDocsStorage,
    fileFilter: studyDocsFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

/**
 * Middleware factory for single avatar upload.
 * Wraps multer errors into AppError for the global error handler.
 */
const uploadAvatarMiddleware = (req, res, next) => {
    const uploadSingle = uploadAvatar.single('avatar');
    uploadSingle(req, res, (err) => {
        if (!err) return next();

        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError('File too large. Maximum size is 2 MB.', 413));
            }
            return next(new AppError(`Upload error: ${err.message}`, 400));
        }

        next(err); // pass AppError from fileFilter
    });
};

/**
 * Middleware for study documents upload.
 * Accepts up to 5 files under field name `studyDocs`.
 */
const uploadStudyDocsMiddleware = (req, res, next) => {
    const uploadMany = uploadStudyDocs.array('studyDocs', 5);
    uploadMany(req, res, (err) => {
        if (!err) return next();

        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') return next(new AppError('File too large. Max size is 5 MB per document.', 413));
            return next(new AppError(`Upload error: ${err.message}`, 400));
        }

        next(err);
    });
};

module.exports = { uploadAvatarMiddleware, uploadStudyDocsMiddleware };
