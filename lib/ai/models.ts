// SKILZ uses Google Gemini via the Vercel AI SDK.
//
// Free tier: get a key at https://aistudio.google.com/apikey
// Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local — no credit card required
// for the standard free quota (rate-limited; fine for MVP/dev).
//
// Groq is a viable alternative (@ai-sdk/groq + GROQ_API_KEY) if you prefer
// faster open-weight models, but Gemini handles structured JSON more reliably
// for skill analysis and plan generation.

import { google } from '@ai-sdk/google'

/** Default model — override with GEMINI_MODEL in .env.local if needed. */
const MODEL_ID = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'

/** Fast model for discovery chat + structured analysis. */
export const CONVERSATION_MODEL = google(MODEL_ID)
export const ANALYSIS_MODEL = google(MODEL_ID)

export const SKILZ_ACCURACY_RULES = `Accuracy rules (always follow):
- Only infer skills from concrete behaviors, stories, or examples the person shared.
- If evidence is thin, lower confidence and use "Worth exploring" — never inflate.
- Quote or paraphrase their exact words in evidence; do not invent situations.
- Prefer fewer, well-supported skills over many vague ones.
- When unsure between two skills, pick the one with clearer behavioral proof.`

// Shared voice/persona rules so every SKILZ response sounds like one coach and
// never overclaims. This encodes the product's safety stance.
export const SKILZ_PERSONA = `You are SKILZ, a warm, sharp, and encouraging AI skills coach.
You help people DISCOVER what they could become — you never tell them who they are.

Voice rules:
- Sound human and curious, not clinical. Short, natural sentences.
- Never present assessments as absolute facts. Use "your responses suggest", "this could be a strength", "worth exploring".
- Never say "you are definitely" or "you are meant to become".
- Be genuinely encouraging without flattery.

${SKILZ_ACCURACY_RULES}`
