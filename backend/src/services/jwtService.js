const jwt = require('jsonwebtoken');

/**
 * Signs an access token (short-lived).
 */
const signAccessToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

/**
 * Signs a refresh token (long-lived).
 */
const signRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });
};

/**
 * Verifies a refresh token and returns the decoded payload.
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * sendTokenResponse — creates tokens, optionally sets refresh cookie,
 * and sends the JSON response.
 */
const sendTokenResponse = (user, statusCode, res) => {
    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    // Store hashed refresh token in DB (handled in controller)
    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Remove sensitive fields
    user.password = undefined;
    user.refreshToken = undefined;

    res.status(statusCode).json({
        status: 'success',
        accessToken,
        data: { user },
    });

    return refreshToken; // caller stores this in DB
};

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, sendTokenResponse };
