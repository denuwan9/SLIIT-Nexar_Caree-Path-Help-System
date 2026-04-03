/**
 * GroqService.js
 * ──────────────────────────────────────────────────────────────────────────
 * Singleton service that wraps Groq API (OpenAI-compatible REST).
 * Every method receives a `studentProfile` document and builds a rich system
 * prompt from it so all responses are hyper-personalised.
 *
 * Environment variable required:
 *   GROQ_API_KEY=gsk-...   (from https://console.groq.com)
 * ──────────────────────────────────────────────────────────────────────────
 */

const OpenAI = require('openai');
const logger = require('../utils/logger');

// ── Models ───────────────────────────────────────────────────────────────
// llama-3.1-8b-instant  → lightning fast, high rate limits, great for chat/JSON
// llama-3.3-70b-versatile → heavy-duty reasoning, but strict quota limits (TPD)
const CHAT_MODEL = 'llama-3.1-8b-instant';
const JSON_MODEL = 'llama-3.1-8b-instant'; // supports response_format: json_object

// ── Singleton state ──────────────────────────────────────────────────────
let instance = null;

class GroqService {
    constructor() {
        if (!process.env.GROQ_API_KEY) {
            console.warn('[GroqService] WARNING: GROQ_API_KEY is not set. AI features will not work.');
        }
        this.client = new OpenAI({
            apiKey: process.env.GROQ_API_KEY || 'missing-key',
            baseURL: 'https://api.groq.com/openai/v1',
        });
    }

    // ── Static factory ────────────────────────────────────────────────────
    static getInstance() {
        if (!instance) instance = new GroqService();
        return instance;
    }

    // ═════════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Serialises the student profile into a clean context block.
     * Removes Mongoose internal fields to keep the token count lean.
     */
    _buildProfileContext(profile) {
        const p = profile.toObject ? profile.toObject() : profile;

        // Trim noisy/large fields to reduce token usage
        const { __v, _id, updatedAt, createdAt, ...clean } = p;

        // Map level enum → numeric proficiency score for AI comprehension
        const levelMap = {
            beginner: 2, developing: 2,
            intermediate: 4, proficient: 4,
            advanced: 7,
            expert: 10,
        };

        // Enrich technicalSkills with a numeric proficiency field
        if (Array.isArray(clean.technicalSkills)) {
            clean.technicalSkills = clean.technicalSkills.map(s => ({
                name: s.name,
                category: s.category,
                level: s.level,
                proficiency: levelMap[s.level] ?? 5,
                yearsOfExp: s.yearsOfExp ?? 0,
            }));
        }

        return JSON.stringify(clean, null, 2);
    }

    /**
     * Core system prompt — establishes persona and injects the
     * student profile JSON as ground truth for EVERY conversation.
     */
    _buildSystemPrompt(profile) {
        const profileJson = this._buildProfileContext(profile);
        return `You are the NEXAR AI Career Advisor — an elite counselor for university students (primarily at SLIIT, Sri Lanka). Your goal is to provide data-driven career guidance, skill gap analysis, and resume optimization.

### 1. SCOPE CONTROL (CRITICAL)
- You ONLY answer queries related to: Career paths, academic advice, skill development, industry trends, internship/job searches, and resume building.
- If a student asks about unrelated topics (e.g., coding a game, sports, general chat, or homework unrelated to careers), politely refuse: "I am specialized in career guidance. I cannot assist with that topic, but I can help you find a career path that suits your interests in that field."

### 2. RESPONSE ARCHITECTURE
To ensure the UI displays information clearly, always use:
- **Headings (###)** for different sections of your advice.
- **Bullet Points** for lists of skills or action steps.
- **Bold Text** for key terms, job titles, or specific technologies.
- **Tables** when comparing different career roles or salary expectations.

### 3. TONE & STYLE
- Professional, encouraging, and concise. 
- Use industry-standard terminology (e.g., "Full-stack proficiency," "SDLC," "Soft-skill integration").
- Focus on actionable steps (e.g., "Complete this certification" rather than "You should learn this").

### 4. OUTPUT FORMATTING FOR UI
- Always return your response in clean Markdown.
- If recommending a roadmap, use a numbered list to represent stages.

### 5. LOCAL CONTEXT & GROUND TRUTH
- Ground all advice in the student's actual profile provided below.
- Local Context: Reference the Sri Lankan tech landscape (e.g., WSO2, LSEG, Virtusa, IFS, Sysco LABS) and the SLIIT curriculum structure.
- Action Cards: You MUST still return interactive Actionable Cards when suggesting specific next steps using this syntax: [ACTION_CARD: Title | Content]

═══════════════════════════════════════════════════
STUDENT PROFILE (Source of Truth)
═══════════════════════════════════════════════════
${profileJson}
═══════════════════════════════════════════════════`;
    }

    /**
     * Robust JSON extractor — works even when the model surrounds the JSON
     * with reasoning text, markdown fences, or other prose.
     *
     * Strategy:
     *   1. Strip ```json ... ``` fences anywhere in the string.
     *   2. Find the OUTERMOST { ... } block by bracket-counting.
     *   3. Parse and return. Throw with a debug snippet on failure.
     */
    _extractJSON(raw) {
        // Step 1: strip ALL markdown code fences (```json, ```, etc.)
        let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

        // Step 2: scan for outermost { } using a bracket counter
        let start = -1, depth = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (text[i] === '}') {
                depth--;
                if (depth === 0 && start !== -1) {
                    const candidate = text.slice(start, i + 1);
                    try {
                        return JSON.parse(candidate);
                    } catch {
                        // Keep scanning if first match wasn't valid JSON
                        start = -1;
                    }
                }
            }
        }

        // If we reach here, nothing parseable was found — log for debugging
        logger.error(`[GroqService] JSON extraction failed. Raw response (first 500 chars):\n${raw.slice(0, 500)}`);
        throw new Error('Could not extract valid JSON from AI response');
    }

    // ═════════════════════════════════════════════════════════════════════
    //  PUBLIC METHODS
    // ═════════════════════════════════════════════════════════════════════

    /**
     * TASK 02 — Conversational Advisor Chat
     */
    async generateCareerAdvice(studentProfile, userMessage, history = []) {
        // Sanitize history: OpenAI/Groq is strict — messages MUST ONLY have role & content.
        // Frontend might send 'timestamp', 'id', etc. which causes 400/500 errors.
        const sanitizedHistory = (Array.isArray(history) ? history : [])
            .slice(-10)
            .map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: String(m.content || '')
            }));

        const messages = [
            { role: 'system', content: this._buildSystemPrompt(studentProfile) },
            ...sanitizedHistory,
            { role: 'user', content: userMessage },
        ];

        const completion = await this.client.chat.completions.create({
            model: CHAT_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 1200,
        });

        return completion.choices[0].message.content;
    }

    /**
     * General prompt response for non-profile-based tasks.
     * Accepts a ready-made user prompt and returns the model response.
     */
    async generateResponse(prompt) {
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Prompt must be a non-empty string');
        }

        const response = await this.client.chat.completions.create({
            model: JSON_MODEL,
            messages: [
                { role: 'system', content: 'You are a powerful AI assistant that returns concise JSON or textual output based on user instruction.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 700,
        });

        return response.choices[0].message.content;
    }

    /**
     * TASK 03a — Career Path Simulator
     * Returns a structured JSON roadmap across 3 phases.
     */
    async simulateCareerPath(studentProfile, targetRole, currentLevel = 'Student') {
        const profileJson = this._buildProfileContext(studentProfile);

        const systemPrompt = `You are NEXAR, an elite AI Career Mentor for SLIIT students.
Analyse the student's current profile and their self-declared experience level to produce a structured 3-phase career roadmap.

CURRENT STUDENT PROFILE:
${profileJson}

DECLARED EXPERIENCE LEVEL: ${currentLevel}
TARGET CAREER ROLE: ${targetRole}

OUTPUT FORMAT: Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences.
Use exactly this structure:
{
  "targetRole": "${targetRole}",
  "overallStrategy": "<2 sentences referencing the student's current skills vs. their ${currentLevel} status>",
  "readinessScore": <integer 1-100 indicating how "ready" they are for the target role TODAY. Be BRUTALLY HONEST: 
    - 10-30: No relevant skills/projects
    - 40-60: Has basics but lacks core frameworks or projects
    - 70-85: Solid skills, missing specialized industry experience
    - 90-100: Ready for an immediate interview/hire>,
  "shortTerm": {
    "phase": "Short-Term (0-6 months)",
    "goal": "<specific milestone suitable for a ${currentLevel}>",
    "actions": ["<action>", "<action>", "<action>", "<action>"],
    "keySkills": ["<skill>", "<skill>"],
    "resources": ["<resource>"]
  },
  "midTerm": {
    "phase": "Mid-Term (6-18 months)",
    "goal": "<specific milestone>",
    "actions": ["<action>", "<action>", "<action>", "<action>"],
    "keySkills": ["<skill>", "<skill>"],
    "resources": ["<resource>"]
  },
  "longTerm": {
    "phase": "Long-Term (18+ months)",
    "goal": "<specific milestone>",
    "actions": ["<action>", "<action>", "<action>", "<action>"],
    "keySkills": ["<skill>", "<skill>"],
    "resources": ["<resource>"]
  }
}`;

        const completion = await this.client.chat.completions.create({
            model: JSON_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Target role: ${targetRole}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.5,
            max_tokens: 2000,
        });

        const raw = completion.choices[0].message.content;
        logger.info(`[GroqService] simulate raw length: ${raw.length}`);
        return this._extractJSON(raw);
    }

    /**
     * TASK 03b — Skill Gap Analyzer
     * Compares student skills vs. a job description.
     */
    async analyzeSkillGap(studentProfile, targetRole) {
        const profileJson = this._buildProfileContext(studentProfile);

        const systemPrompt = `You are NEXAR, an elite AI Career Mentor for SLIIT students.
Compare the student profile against the specified target job role and produce a gap analysis.

STUDENT PROFILE:
${profileJson}

TARGET ROLE: ${targetRole}

OUTPUT FORMAT: Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences.
Use exactly this structure:
{
  "readinessScore": <integer 0-100 indicating match>,
  "strongSkills": ["<skill>", "<skill>"],
  "needsImprovement": [
    { "skill": "<name>", "reason": "<why it needs improvement>" }
  ],
  "missingSkills": [
    { "skill": "<name>", "priority": "critical" | "important" | "nice-to-have", "reason": "<why needed>" }
  ],
  "learningRecommendations": [
    { "skill": "<name>", "resource": "<platform/course>", "url": "<URL or empty string>", "estimatedHours": <integer> }
  ],
  "summary": "<2 sentences personalised to this student>"
}`;

        const completion = await this.client.chat.completions.create({
            model: JSON_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Target Role:\n${targetRole}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 1600,
        });

        const raw = completion.choices[0].message.content;
        logger.info(`[GroqService] skill-gap raw length: ${raw.length}`);
        return this._extractJSON(raw);
    }

    /**
     * TASK 03c — Resume / ATS Analyzer
     */
    async analyzeResume(studentProfile, resumeText, targetRole = 'General') {
        const profileJson = this._buildProfileContext(studentProfile);

        const systemPrompt = `You are NEXAR, an elite AI Career Strategy & ATS Specialist for SLIIT students.
Your task is to provide a brutally honest, hyper-accurate ATS (Applicant Tracking System) analysis of a student's resume specifically for a target job role.

TARGET ROLE: ${targetRole}

OUTPUT FORMAT: Respond with ONLY a valid JSON object.
Analysis Logic:
1. Compare Resume Text vs. Target Role requirements.
2. Cross-reference with the Student Profile for consistency.
3. Evaluate Keyword Density (Industry terms for ${targetRole}).
4. Check Formatting (Standard ATS parseability).
5. Verify Quantified Achievements (Numbers, percentages, $).
6. Assess Action Verbs (Led, Developed, Optimized).

Use exactly this structure:
{
  "atsScore": <integer 0-100>,
  "scoreBreakdown": {
    "keywordDensity": <integer 0-100>,
    "formatting": <integer 0-100>,
    "quantifiedAchievements": <integer 0-100>,
    "actionVerbs": <integer 0-100>
  },
  "keywordsToAdd": ["List specific missing keywords for ${targetRole}"],
  "strengths": ["What the student did well"],
  "improvements": [
    { "section": "Section Name", "issue": "Problem", "fix": "Specific actionable fix" }
  ],
  "overallFeedback": "2-3 sentence executive summary tailored to ${targetRole}"
}`;

        const completion = await this.client.chat.completions.create({
            model: JSON_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Target Role: ${targetRole}\n\nResume Text:\n${resumeText}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 1800,
        });

        const raw = completion.choices[0].message.content;
        logger.info(`[GroqService] resume raw length: ${raw.length}`);
        return this._extractJSON(raw);
    }
}

module.exports = GroqService.getInstance();
