/**
 * Fetch all Nexar study events from user's Google Calendar
 */
exports.getCalendarEvents = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('+googleRefreshToken');
        if (!user.googleRefreshToken) {
            return next(new AppError('Please link your Google Calendar first', 400));
        }
        const events = await googleCalendarService.fetchNexarEvents(user);
        res.status(200).json({ events });
    } catch (error) {
        next(error);
    }
};
const googleCalendarService = require('../services/googleCalendarService');
const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Exchange Authorization Code for Tokens
 */
exports.linkCalendar = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) return next(new AppError('Authorization code is required', 400));

        await googleCalendarService.exchangeCode(code, req.user._id);

        res.status(200).json({
            status: 'success',
            message: 'Google Calendar successfully linked!'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Sync specific plan sessions to user's Google Calendar
 */
exports.syncStudyPlan = async (req, res, next) => {
    try {
        const { planId } = req.params;
        
        const plan = await StudyPlan.findById(planId);
        if (!plan) return next(new AppError('Study plan not found', 404));

        const user = await User.findById(req.user._id).select('+googleRefreshToken');
        if (!user.googleRefreshToken) {
            return next(new AppError('Please link your Google Calendar first', 400));
        }

        await googleCalendarService.syncPlanToCalendar(user, plan);

        res.status(200).json({
            status: 'success',
            message: 'All study sessions have been synced to your Google Calendar!'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check if user has linked Google Calendar
 */
exports.getSyncStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('+googleRefreshToken');
        
        res.status(200).json({
            status: 'success',
            isLinked: !!user.googleRefreshToken
        });
    } catch (error) {
        next(error);
    }
};
