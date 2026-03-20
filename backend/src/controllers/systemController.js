const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const SystemSettings = require('../models/SystemSettings');
const logger = require('../utils/logger');

/**
 * GET /api/v1/system/init
 * Protected — Aggregates all essential data for frontend hydration
 */
exports.initSystemData = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // 1. Fetch Profile & User Data
        const profile = await StudentProfile.findOne({ user: userId })
            .populate('user', 'firstName lastName email avatarUrl role');

        // 2. Fetch Notifications (latest 5)
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5);

        // 3. Fetch/Create System Settings
        let settings = await SystemSettings.findOne({ user: userId });
        if (!settings) {
            settings = await SystemSettings.create({ user: userId });
            logger.info(`[System] Initialized settings for user ${userId}`);
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: profile.user,
                profile,
                notifications,
                settings,
                config: {
                    apiVersion: 'V1.0-Futuristic',
                    theme: settings.theme,
                    lastInitialized: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        logger.error(`[System Init Error]: ${error.message}`);
        next(error);
    }
};
/**
 * GET /api/v1/system/boot
 * High-precision system hydration handshake
 */
exports.bootSystem = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Fetch everything in parallel as requested
        const [user, profile, notifications, settings] = await Promise.all([
            User.findById(userId).select('+role'),
            StudentProfile.findOne({ user: userId }),
            Notification.countDocuments({ user: userId, read: false }),
            SystemSettings.findOne({ user: userId }) || SystemSettings.create({ user: userId })
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                UserPermissions: {
                    role: user.role,
                    isAdmin: user.role === 'admin',
                    accessLevel: user.role === 'admin' ? 10 : 1
                },
                GlobalSettings: settings,
                DashboardState: {
                    unreadNotifications: notifications,
                    systemStatus: 'OPERATIONAL',
                    lastSync: new Date().toISOString()
                },
                ProfileData: profile
            }
        });
    } catch (error) {
        logger.error(`[System Boot Error]: ${error.message}`);
        next(error);
    }
};
