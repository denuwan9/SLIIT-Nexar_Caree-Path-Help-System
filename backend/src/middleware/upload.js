const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./cloudinaryUpload');
const AppError = require('../utils/AppError');

// ── Cloudinary storage configuration: study documents ───────────
const studyDocsStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'nexar/study-plans',
        // 'auto' allows raw files like PDF, DOCX, TXT as well as images
        resource_type: 'auto',
    },
});

// ── File type validation ──────────────────────────────────────────
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
        'text/csv',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new AppError('Unsupported file type for study documents.', 415), false);
};

// ── Multer instance ──────────────────────────────────────────────
const uploadStudyDocs = multer({
    storage: studyDocsStorage,
    fileFilter: studyDocsFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5 MB per file
});

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

module.exports = { uploadStudyDocsMiddleware };

