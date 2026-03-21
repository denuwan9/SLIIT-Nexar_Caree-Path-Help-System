/**
 * domainLock.js
 * Strictly enforces @sliit.lk institutional email access at the middleware level.
 */
const logger = require('../utils/logger');

const domainLock = (req, res, next) => {
    const { email } = req.body;

    if (!email) return next();

    const sliitRegex = /^[a-zA-Z0-9._%+-]+@sliit\.lk$/;

    if (!sliitRegex.test(email.toLowerCase())) {
        logger.warn(`[Security Alert] Non-SLIIT domain attempted access: ${email}`);
        return res.status(403).json({
            status: 'error',
            message: 'Access Restricted: Only @sliit.lk domains are permitted.',
            code: 'ENFORCE_DOMAIN_LOCK'
        });
    }

    next();
};

module.exports = domainLock;
