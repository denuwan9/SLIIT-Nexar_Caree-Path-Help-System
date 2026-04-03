const logger = require('../utils/logger');
const groqService = require('./GroqService');

/**
 * Placeholder for AI Career Path Generation
 * Eventually connects to Gemini/OpenAI API
 */
exports.generateCareerPath = async (currentMajor, skillSet, targetRole) => {
    try {
        logger.info(`Generating career path for ${currentMajor} aiming for ${targetRole}`);

        // Placeholder logic: In a real app, this would call an AI model
        const roadmap = [
            { stage: 'Foundation', steps: [`Master core ${currentMajor} concepts`, 'Build basic projects'] },
            { stage: 'Skill Acquisition', steps: skillSet.length > 0 ? [`Deepen knowledge in ${skillSet.join(', ')}`] : ['Identify and learn key technical skills'] },
            { stage: 'Specialization', steps: [`Focus on ${targetRole} specific tools`, 'Obtain relevant certifications'] },
            { stage: 'Deployment', steps: ['Apply for internships', 'Prepare for technical interviews'] }
        ];

        return {
            status: 'success',
            major: currentMajor,
            target: targetRole,
            roadmap
        };
    } catch (error) {
        logger.error(`AI Generation Error: ${error.message}`);
        throw error;
    }
};

/**
 * AI-powered job post ranking based on natural language query
 * Uses Groq AI to analyze and score job posts
 */
exports.rankJobPosts = async (jobPosts, query) => {
    try {
        logger.info(`AI ranking ${jobPosts.length} job posts with query: ${query}`);

        const rankedPosts = [];

        // Process each job post individually to avoid token limits
        for (const jobPost of jobPosts) {
            try {
                const prompt = `
You are an expert career counselor and job market analyst. Analyze this job posting and rate how well it matches the following criteria:

CRITERIA QUERY: "${query}"

JOB POST DETAILS:
- Title: ${jobPost.title}
- Target Role: ${jobPost.targetRole}
- Summary: ${jobPost.summary}
- Skills: ${jobPost.skills?.join(', ') || 'Not specified'}
- Job Type: ${jobPost.jobType}
- Location: ${jobPost.preferredLocation || 'Not specified'}
- Remote Work: ${jobPost.isRemoteOk ? 'Yes' : 'No'}
- Salary Range: ${jobPost.salaryExpectation?.min ? `${jobPost.salaryExpectation.currency || 'LKR'} ${jobPost.salaryExpectation.min}` : 'Not specified'}${jobPost.salaryExpectation?.max ? ` - ${jobPost.salaryExpectation.currency || 'LKR'} ${jobPost.salaryExpectation.max}` : ''}

Please provide:
1. A score from 0-100 (where 100 is perfect match)
2. A brief explanation (2-3 sentences) of why this job post matches or doesn't match the criteria

Format your response as JSON:
{
  "score": <number>,
  "reason": "<explanation>"
}
`;

                const aiResponse = await groqService.generateResponse(prompt);
                let parsedResponse;

                try {
                    // Try to parse the AI response as JSON
                    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        parsedResponse = JSON.parse(jsonMatch[0]);
                    } else {
                        // Fallback parsing
                        const scoreMatch = aiResponse.match(/score["\s:]+(\d+)/i);
                        const reasonMatch = aiResponse.match(/reason["\s:]+[""]([^""]+)[""]/i) ||
                                           aiResponse.match(/reason["\s:]+([^}]+)/i);

                        parsedResponse = {
                            score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
                            reason: reasonMatch ? reasonMatch[1].trim() : 'AI analysis completed'
                        };
                    }
                } catch (parseError) {
                    logger.warn(`Failed to parse AI response for job post ${jobPost._id}: ${parseError.message}`);
                    parsedResponse = {
                        score: 50,
                        reason: 'AI analysis completed but response format was unclear'
                    };
                }

                rankedPosts.push({
                    _id: jobPost._id,
                    title: jobPost.title,
                    targetRole: jobPost.targetRole,
                    summary: jobPost.summary,
                    skills: jobPost.skills,
                    jobType: jobPost.jobType,
                    preferredLocation: jobPost.preferredLocation,
                    isRemoteOk: jobPost.isRemoteOk,
                    salaryExpectation: jobPost.salaryExpectation,
                    student: jobPost.student,
                    aiScore: Math.min(100, Math.max(0, parsedResponse.score || 50)),
                    aiReason: parsedResponse.reason || 'AI analysis completed'
                });

            } catch (error) {
                logger.error(`Error analyzing job post ${jobPost._id}: ${error.message}`);
                // Add with default score if AI analysis fails
                rankedPosts.push({
                    _id: jobPost._id,
                    title: jobPost.title,
                    targetRole: jobPost.targetRole,
                    summary: jobPost.summary,
                    skills: jobPost.skills,
                    jobType: jobPost.jobType,
                    preferredLocation: jobPost.preferredLocation,
                    isRemoteOk: jobPost.isRemoteOk,
                    salaryExpectation: jobPost.salaryExpectation,
                    student: jobPost.student,
                    aiScore: 50,
                    aiReason: 'AI analysis encountered an error, assigned default score'
                });
            }
        }

        // Sort by AI score in descending order (highest first)
        rankedPosts.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

        logger.info(`Successfully ranked ${rankedPosts.length} job posts`);
        return rankedPosts;

    } catch (error) {
        logger.error(`AI Job Post Ranking Error: ${error.message}`);
        throw new Error('Failed to rank job posts using AI');
    }
};
