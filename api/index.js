const app = require('../backend/src/app');
const mongoose = require('mongoose');
const logger = require('../backend/src/utils/logger');

// Cache the DB connection for serverless function reuse
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        logger.info('Vercel Function: MongoDB Connected');
    } catch (error) {
        logger.error(`Vercel Function: MongoDB Connection Error: ${error.message}`);
        // In serverless, we don't exit(1) easily, but we throw so Vercel can retry
        throw error;
    }
};

// Vercel Serverless Adapter
module.exports = async (req, res) => {
    // 1. Ensure DB is connected
    await connectDB();

    // 2. Delegate to the Express app
    return app(req, res);
};
