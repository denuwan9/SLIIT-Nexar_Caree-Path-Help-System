const JobPost = require('../models/JobPost');
const StudentProfile = require('../models/StudentProfile');
const AppError = require('../utils/AppError');

// ─── AI-based Post Quality Rater ─────────────────────────────────
/**
 * Analyses a job post and returns a score (0–100) with structured feedback.
 * In production, this can be replaced with an LLM API call.
 */
const rateJobPost = (post) => {
    let score = 0;
    const strengths = [];
    const improvements = [];

    // 1. Summary quality (up to 30 pts)
    const summaryLen = post.summary?.length || 0;
    if (summaryLen >= 200) { score += 30; strengths.push('Comprehensive professional summary'); }
    else if (summaryLen >= 100) { score += 18; improvements.push('Expand summary to at least 200 characters for better impact'); }
    else { score += 5; improvements.push('Summary is too short. Aim for at least 200 characters'); }

    // 2. Skills listed (up to 25 pts)
    const skillCount = post.skills?.length || 0;
    if (skillCount >= 6) { score += 25; strengths.push('Strong skills set presented'); }
    else if (skillCount >= 3) { score += 15; improvements.push('Add more skills to reach 6+ for higher visibility'); }
    else { score += 5; improvements.push('List at least 3 relevant skills'); }

    // 3. Profile links (up to 20 pts)
    const links = [post.profileSnapshot?.linkedinUrl, post.profileSnapshot?.githubUrl, post.profileSnapshot?.portfolioUrl];
    const linked = links.filter(Boolean).length;
    if (linked === 3) { score += 20; strengths.push('All professional profiles linked'); }
    else if (linked >= 1) { score += 10; improvements.push(`Add ${3 - linked} more profile link(s) (LinkedIn, GitHub, Portfolio)`); }
    else { improvements.push('No profile links found. Add LinkedIn, GitHub, or Portfolio URL'); }

    // 4. Target role specified (up to 15 pts)
    if (post.targetRole && post.targetRole.length > 3) { score += 15; strengths.push('Clear target role specified'); }
    else { improvements.push('Specify a clear target role'); }

    // 5. Salary expectation (up to 10 pts)
    if (post.salaryExpectation?.min && post.salaryExpectation?.max) { score += 10; strengths.push('Salary expectation clearly stated'); }
    else { improvements.push('Consider adding a salary expectation range'); }

    return {
        score: Math.min(score, 100),
        feedback: score >= 80 ? 'Excellent post!' : score >= 50 ? 'Good post with room for improvement.' : 'Post needs significant improvements.',
        strengths,
        improvements,
        ratedAt: new Date(),
    };
};

// ── Controllers ───────────────────────────────────────────────────

/**
 * POST /api/jobs
 * Student — create a job post with auto-populated profile data
 */
exports.createJobPost = async (req, res, next) => {
    try {
        // Auto-populate profile snapshot
        const profile = await StudentProfile.findOne({ user: req.user._id });

        const profileSnapshot = profile
            ? {
                university: profile.university,
                major: profile.major,
                gpa: profile.gpa,
                linkedinUrl: profile.linkedinUrl,
                githubUrl: profile.githubUrl,
                portfolioUrl: profile.portfolioUrl,
            }
            : {};

        const postData = { ...req.body, student: req.user._id, profileSnapshot };

        // Run AI rating immediately
        const aiRating = rateJobPost(postData);
        postData.aiRating = aiRating;

        const post = await JobPost.create(postData);

        res.status(201).json({ status: 'success', data: { post } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/jobs/me
 * Student — get own job posts, Admin — get all job posts
 */
exports.getMyJobPosts = async (req, res, next) => {
    try {
        const query = req.user.role === 'admin' ? {} : { student: req.user._id };
        const posts = await JobPost.find(query).sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: posts.length, data: { posts } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/jobs/:id
 * Student (own) + Admin
 */
exports.getJobPostById = async (req, res, next) => {
    try {
        const post = await JobPost.findById(req.params.id).populate('student', 'name email');
        if (!post) return next(new AppError('Job post not found.', 404));

        // Students can only access their own posts
        if (req.user.role === 'student' && post.student._id.toString() !== req.user._id.toString()) {
            return next(new AppError('Access denied.', 403));
        }

        // Increment view count for admin views or student views of other posts
        if (req.user.role === 'admin' || (req.user.role === 'student' && post.student._id.toString() !== req.user._id.toString())) {
            await JobPost.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
            post.viewCount += 1; // Update the in-memory object for immediate response
        }

        res.status(200).json({ status: 'success', data: { post } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/jobs
 * Admin — list all posts with filter by status
 */
exports.getAllJobPosts = async (req, res, next) => {
    try {
        console.log('getAllJobPosts called by user:', req.user?.email, 'role:', req.user?.role);
        const filter = {};
        if (req.query.status) filter['adminReview.status'] = req.query.status;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const posts = await JobPost.find(filter)
            .populate('student', 'name email')
            .skip(skip).limit(limit)
            .sort({ createdAt: -1 });

        const total = await JobPost.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            results: posts.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: { posts },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/jobs/:id/review
 * Admin — approve / reject / flag a job post
 */
exports.reviewJobPost = async (req, res, next) => {
    try {
        const { status, adminNotes } = req.body;
        if (!['approved', 'rejected', 'flagged'].includes(status)) {
            return next(new AppError('Status must be approved, rejected, or flagged.', 400));
        }

        const post = await JobPost.findByIdAndUpdate(
            req.params.id,
            {
                'adminReview.status': status,
                'adminReview.reviewedBy': req.user._id,
                'adminReview.reviewedAt': new Date(),
                'adminReview.adminNotes': adminNotes || '',
                isPublished: status === 'approved',
            },
            { new: true }
        );

        if (!post) return next(new AppError('Job post not found.', 404));
        res.status(200).json({ status: 'success', data: { post } });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/jobs/:id
 * Student (own) — update a job post
 */
exports.updateJobPost = async (req, res, next) => {
    try {
        const updateData = {
            title: req.body.title,
            summary: req.body.summary,
            targetRole: req.body.targetRole,
            jobType: req.body.jobType,
            skills: req.body.skills,
            preferredLocation: req.body.preferredLocation,
            isRemoteOk: req.body.isRemoteOk,
            salaryExpectation: req.body.salaryExpectation,
        };

        const post = await JobPost.findOneAndUpdate(
            { _id: req.params.id, student: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!post) return next(new AppError('Job post not found or you are not the owner.', 404));

        post.aiRating = rateJobPost(post);
        await post.save({ validateBeforeSave: false });

        res.status(200).json({ status: 'success', data: { post } });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/jobs/:id
 * Student (own) — delete a job post
 */
exports.deleteJobPost = async (req, res, next) => {
    try {
        const post = await JobPost.findOneAndDelete({ _id: req.params.id, student: req.user._id });
        if (!post) return next(new AppError('Job post not found or you are not the owner.', 404));
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};
