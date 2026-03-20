/**
 * GrokService.js
 * ──────────────────────────────────────────────────────────────────────────
 * Singleton service that wraps xAI's Grok API (OpenAI-compatible REST).
 * Every method receives a `studentProfile` document and builds a rich system
 * prompt from it so all responses are hyper-personalised.
 *
 * Environment variable required:
 *   GROK_API_KEY=xai-...   (from https://console.x.ai)
 * ──────────────────────────────────────────────────────────────────────────
 */

const OpenAI = require('openai');
const logger = require('../utils/logger');

// ── Models ───────────────────────────────────────────────────────────────
// grok-3-mini  → reasoning model, great for open-ended chat
// grok-2-1212  → stable instruction-following model, use for JSON outputs
const CHAT_MODEL = 'grok-3-mini';
const JSON_MODEL = 'grok-2-1212'; // supports response_format: json_object

// ── Singleton state ──────────────────────────────────────────────────────
let instance = null;

class GrokService {
    constructor() {
        if (!process.env.GROK_API_KEY) {
            console.warn('[GrokService] WARNING: GROK_API_KEY is not set. AI features will not work.');
        }
        this.client = new OpenAI({
            apiKey: process.env.GROK_API_KEY || 'missing-key',
            baseURL: 'https://api.x.ai/v1',
        });
    }

    // ── Static factory ────────────────────────────────────────────────────
    static getInstance() {
        if (!instance) instance = new GrokService();
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
     * Core system prompt — establishes Grok's persona and injects the
     * student profile JSON as ground truth for EVERY conversation.
     */
    _buildSystemPrompt(profile) {
        const profileJson = this._buildProfileContext(profile);
        return `You are NEXAR — an elite AI Career Mentor built specifically for students at SLIIT (Sri Lanka Institute of Information Technology).

Your mission: Deliver hyper-personalized, brutally honest, and actionable career guidance grounded entirely in the student's actual profile below.

RULES YOU MUST FOLLOW:
1. NEVER give generic advice. Every response MUST reference specific details from the student profile (their actual skills, GPA, projects, experience).
2. Local Context: You must provide advice relevant to the Sri Lankan tech landscape (e.g., WSO2, LSEG, Virtusa, IFS, Sysco LABS) and the SLIIT curriculum structure (SE, IT, CSNE, ISE).
3. Explicit Gap Analysis: When a student asks "What should I build next?" or asks about career paths, you MUST compare their current tech stack against high-paying industry roles to recommend specific projects that fill missing gaps.
4. Voice: Professional, supportive, yet "brutally honest". If a project is too simple, tell them: "This project is a good start, but to stand out, you need to add complex state management or backend scaling." Maintain an "Ayubowan!" greeting if the user says hello.
5. Action Cards: Instead of plain text for gaps or next steps, you MUST return interactive Actionable Cards using exactly this markdown syntax: [ACTION_CARD: Title | Content]
   Example: [ACTION_CARD: 70% ready for React Role | You are missing Redux. Build a dashboard to master state management.]
6. Always end advisory responses with 1 concrete, immediately-actionable step labelled "⚡ Your Next Move:".

═══════════════════════════════════════════════════
STUDENT PROFILE (Source of Truth — treat as gospel)
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
        logger.error(`[GrokService] JSON extraction failed. Raw response (first 500 chars):\n${raw.slice(0, 500)}`);
        throw new Error('Could not extract valid JSON from AI response');
    }

    // ═════════════════════════════════════════════════════════════════════
    //  PUBLIC METHODS
    // ═════════════════════════════════════════════════════════════════════

    /**
     * TASK 02 — Conversational Advisor Chat
     */
    async generateCareerAdvice(studentProfile, userMessage, history = []) {
        const messages = [
            { role: 'system', content: this._buildSystemPrompt(studentProfile) },
            ...history.slice(-10),
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
     * TASK 03a — Career Path Simulator
     * Returns a structured JSON roadmap across 3 phases.
     */
    async simulateCareerPath(studentProfile, targetRole) {
        const profileJson = this._buildProfileContext(studentProfile);

        const systemPrompt = `You are NEXAR, an elite AI Career Mentor for SLIIT students.
Analyse the student profile and target role, then respond with a structured career roadmap.

STUDENT PROFILE:
${profileJson}

OUTPUT FORMAT: Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences.
Use exactly this structure:
{
  "targetRole": "<the role>",
  "overallStrategy": "<2 sentences referencing the student's current skills/state>",
  "readinessScore": <integer 1-100>,
  "shortTerm": {
    "phase": "Short-Term (0-6 months)",
    "goal": "<specific milestone>",
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
        logger.info(`[GrokService] simulate raw length: ${raw.length}`);
        return this._extractJSON(raw);
    }

    /**
     * TASK 03b — Skill Gap Analyzer
     * Compares student skills vs. a job description.
     */
    async analyzeSkillGap(studentProfile, jobDescription) {
        const profileJson = this._buildProfileContext(studentProfile);

        const systemPrompt = `You are NEXAR, an elite AI Career Mentor for SLIIT students.
Compare the student profile against the job description and produce a gap analysis.

STUDENT PROFILE:
${profileJson}

OUTPUT FORMAT: Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences.
Use exactly this structure:
{
  "matchScore": <integer 0-100>,
  "strengths": ["<matching skill>"],
  "missingSkills": [
    { "skill": "<name>", "priority": "critical", "reason": "<why needed>" }
  ],
  "recommendedResources": [
    { "skill": "<name>", "resource": "<platform/course>", "url": "<URL or empty string>", "estimatedHours": <integer> }
  ],
  "urgencyScore": <integer 1-10>,
  "summary": "<2 sentences personalised to this student>"
}`;

        const completion = await this.client.chat.completions.create({
            model: JSON_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Job Description:\n${jobDescription}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 1600,
        });

        const raw = completion.choices[0].message.content;
        logger.info(`[GrokService] skill-gap raw length: ${raw.length}`);
        return this._extractJSON(raw);
    }

    /**
     * TASK 03c — Resume / ATS Analyzer
     */
    async analyzeResume(studentProfile, resumeText) {
        const profileJson = this._buildProfileContext(studentProfile);

        const systemPrompt = `You are NEXAR, an expert ATS & Resume coach for SLIIT students.
Analyse the resume text and produce an ATS optimisation report.

STUDENT PROFILE (for cross-reference):
${profileJson}

OUTPUT FORMAT: Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences.
Use exactly this structure:
{
  "atsScore": <integer 0-100>,
  "scoreBreakdown": {
    "keywordDensity": <integer 0-100>,
    "formatting": <integer 0-100>,
    "quantifiedAchievements": <integer 0-100>,
    "actionVerbs": <integer 0-100>
  },
  "keywordsToAdd": ["<keyword>"],
  "strengths": ["<what is already good>"],
  "improvements": [
    { "section": "<section name>", "issue": "<problem>", "fix": "<specific fix>" }
  ],
  "overallFeedback": "<2-3 sentence brutally honest summary>"
}`;

        const completion = await this.client.chat.completions.create({
            model: JSON_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Resume Text:\n${resumeText}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 1800,
        });

        const raw = completion.choices[0].message.content;
        logger.info(`[GrokService] resume raw length: ${raw.length}`);
        return this._extractJSON(raw);
    }
}

module.exports = GrokService.getInstance();
