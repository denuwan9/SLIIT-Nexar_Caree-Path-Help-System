const Application = require('../models/Application');
const JobPost = require('../models/JobPost');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Apply for a job post
exports.applyForJob = async (req, res, next) => {
    try {
        const jobPostId = req.body.jobPostId || req.params.id;
        const { coverLetter, resume } = req.body;
        const applicantId = req.user.id;

        if (!jobPostId) {
            return next(new AppError('Job post ID is required', 400));
        }

        // Check if job post exists
        const jobPost = await JobPost.findById(jobPostId);
        if (!jobPost) {
            return next(new AppError('Job post not found', 404));
        }

        // Check if user already applied
        const existingApplication = await Application.findOne({
            jobPost: jobPostId,
            applicant: applicantId,
        });
        if (existingApplication) {
            return next(new AppError('You have already applied for this job post', 400));
        }

        // Create application
        const application = await Application.create({
            jobPost: jobPostId,
            applicant: applicantId,
            coverLetter,
            resume,
        });

        // Populate applicant info
        await application.populate('applicant', 'name email');

        res.status(201).json({
            status: 'success',
            data: {
                application,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get applications for a specific job post (only job post owner)
exports.getApplicationsForJobPost = async (req, res, next) => {
    try {
        const { jobPostId } = req.params;
        const userId = req.user.id;

        // Check if job post exists and user is the owner or admin
        const jobPost = await JobPost.findById(jobPostId);
        if (!jobPost) {
            return next(new AppError('Job post not found', 404));
        }

        if (jobPost.student.toString() !== userId && userRole !== 'admin') {
            return next(new AppError('You can only view applications for your own job posts', 403));
        }

        // Get applications with applicant details
        const applications = await Application.find({ jobPost: jobPostId })
            .populate('applicant', 'name email')
            .sort('-appliedAt');

        res.status(200).json({
            status: 'success',
            results: applications.length,
            data: {
                applications,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Update application status (job post owner or admin)
exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Find application
        const application = await Application.findById(id).populate('jobPost');
        if (!application) {
            return next(new AppError('Application not found', 404));
        }

        // Check permissions
        const isOwner = application.jobPost.student.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return next(new AppError('You can only update applications for your own job posts', 403));
        }

        // Update status
        application.status = status;
        await application.save();

        // Populate updated application
        await application.populate('applicant', 'name email');

        res.status(200).json({
            status: 'success',
            data: {
                application,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get my applications
exports.getMyApplications = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get applications where applicant is the current user
        const applications = await Application.find({ applicant: userId })
            .populate('jobPost')
            .sort('-appliedAt');

        res.status(200).json({
            status: 'success',
            results: applications.length,
            data: {
                applications,
            },
        });
    } catch (error) {
        next(error);
    }
};