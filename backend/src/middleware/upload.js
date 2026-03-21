const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// ── Ensure upload directory exists ─────────────────────────────────
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Disk storage configuration ────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, _file, cb) => {
        // Pattern: avatar-<userId>-<timestamp>.ext
        const ext = path.extname(_file.originalname).toLowerCase();
        const filename = `avatar-${req.user._id}-${Date.now()}${ext}`;
        cb(null, filename);
    },
});

// ── File type validation ──────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError('Only JPEG, PNG, and WebP images are allowed.', 415),
            false
        );
    }
};

// ── Multer instance ────────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB max
        files: 1,
    },
});

/**
 * Middleware factory for single avatar upload.
 * Wraps multer errors into AppError for the global error handler.
 */
const uploadAvatarMiddleware = (req, res, next) => {
    const uploadSingle = upload.single('avatar');
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
 * Middleware for single resume PDF upload using memory storage.
 * Useful for transient analysis without disk persistence.
 */
const uploadResumeMiddleware = (req, res, next) => {
    const memoryLoader = multer({
        storage: multer.memoryStorage(),
        fileFilter: (_req, file, cb) => {
            const ALLOWED_TYPES = ['application/pdf'];
            if (ALLOWED_TYPES.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new AppError('Only PDF files are allowed for resume analysis.', 415), false);
            }
        },
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    }).single('resume');

    memoryLoader(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError('File too large. Maximum size is 5 MB.', 413));
            }
            return next(new AppError(`Upload error: ${err.message}`, 400));
        }
        next(err);
    });
};

module.exports = { uploadAvatarMiddleware, uploadResumeMiddleware };
