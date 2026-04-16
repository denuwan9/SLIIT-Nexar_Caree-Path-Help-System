const path = require('path');

// ── Load .env for local 'vercel dev' testing ──────────────────────────────
// In production Vercel injects env vars directly — dotenv is a no-op there.
// Locally (vercel dev), this ensures backend/.env is picked up correctly.
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const app = require('../backend/src/app');
const mongoose = require('mongoose');
const logger = require('../backend/src/utils/logger');

// ── Serverless DB connection with correct readyState guard ────────────────
// mongoose.connection.readyState values:
//   0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        // Already connected — reuse the existing connection (warm invocation)
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // Disable autoIndex in production — rebuilding indexes on every
            // cold start is slow and unnecessary (build indexes separately).
            autoIndex: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.info('Vercel Function: MongoDB Connected');
    } catch (error) {
        logger.error(`Vercel Function: MongoDB Connection Error: ${error.message}`);
        // Re-throw so Vercel can surface the error and retry
        throw error;
    }
};

// ── Vercel Serverless Adapter ─────────────────────────────────────────────
module.exports = async (req, res) => {
    // 1. Ensure DB is connected (cached across warm invocations)
    await connectDB();

    // 2. Delegate to the Express app
    return app(req, res);
};
