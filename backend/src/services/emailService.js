const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Configure email transport
 * In development, we use Mailtrap. In production, you would use SendGrid/SES/etc.
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Utility to send email
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
    const mailOptions = {
        from: `SLIIT Nexar <no-reply@sliitnexar.lk>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Email sent to: ${options.email} | Subject: ${options.subject}`);
    } catch (error) {
        logger.error(`Error sending email to ${options.email}: ${error.message}`);
        throw new Error('Email could not be sent');
    }
};

/**
 * Send Verification Email
 * @param {Object} user - User object
 * @param {string} verificationUrl - URL for verification
 */
exports.sendVerificationEmail = async (user, verificationUrl) => {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Welcome to SLIIT Nexar!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hi ${user.firstName},</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">Thank you for joining our platform. To get started and access your dashboard, please verify your email address by clicking the button below:</p>
        <div style="margin: 32px 0; text-align: center;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #475569; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
        <p style="color: #94a3b8; font-size: 12px;">© 2024 SLIIT Nexar. All rights reserved.</p>
    </div>
    `;

    await sendEmail({
        email: user.email,
        subject: 'Verify your SLIIT Nexar Account',
        message: `Please verify your email by visiting: ${verificationUrl}`,
        html,
    });
};
