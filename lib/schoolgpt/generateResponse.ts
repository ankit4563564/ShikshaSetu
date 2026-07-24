import { buildSystemPrompt, buildQuickPrompt } from '@/school-brain/prompts/promptComposer';
import { buildFinalResponse } from '@/school-brain/response-builder/responseBuilder';
import type { SchoolRole, ConfidenceLevel, Intent, SchoolBrainContext } from '@/school-brain/models/index';

// ─────────────────────────────────────────────
// SchoolGPT LLM Orchestrator
// Dual-provider (Groq Primary → Gemini Fallback)
// with structured JSON output
// ─────────────────────────────────────────────

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export interface SchoolGPTResponse {
  text: string;
  sources: string[];
  suggestedFollowUps?: string[];
  source: string;
  confidence?: ConfidenceLevel;
}

async function groqGenerate(system: string, history: any[], user: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.startsWith('gsk_')) return null;

  try {
    const messages = [
      { role: 'system', content: system },
      ...history.slice(-15),
      { role: 'user', content: user },
    ];

    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return null;

    const result = await res.json();
    return result?.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.warn('[SchoolGPT Groq Primary] Failed:', e);
    return null;
  }
}

async function geminiGenerate(system: string, history: any[], user: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const contents = [];
    contents.push({
      role: 'user',
      parts: [{ text: `System Instruction: ${system}` }],
    });

    for (const msg of history.slice(-15)) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: user }],
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return null;

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (e) {
    console.warn('[SchoolGPT Gemini Fallback] Failed:', e);
    return null;
  }
}

export async function generateSchoolGPTResponse(
  question: string,
  data: string,
  role: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  intent: Intent = 'unknown',
  retrievedConfidence: ConfidenceLevel = 'MEDIUM',
  modulesConsulted: string[] = ['School Database'],
  brainContext?: SchoolBrainContext
): Promise<SchoolGPTResponse> {
  // Build context-aware system prompt with data injection
  const context: SchoolBrainContext = brainContext || { role: role as SchoolRole };
  const system = buildSystemPrompt(context, data, intent, retrievedConfidence);

  const user = `User Question: ${question}`;

  // 1. Try Groq (Primary LLM Provider)
  let resultText = await groqGenerate(system, history, user);

  // 2. Try Gemini (Secondary Fallback Provider)
  if (!resultText) {
    console.log('[SchoolGPT] Groq execution unavailable/failed. Invoking Gemini fallback...');
    resultText = await geminiGenerate(system, history, user);
  }

  if (resultText) {
    try {
      const parsed = JSON.parse(resultText);
      const brainRes = buildFinalResponse(
        parsed.text || data || 'I have consulted our school operating system records for your query.',
        parsed.sources || modulesConsulted,
        intent,
        parsed.confidence || retrievedConfidence,
        parsed.suggestedFollowUps,
        role as SchoolRole
      );
      return brainRes;
    } catch (e) {
      console.warn('[SchoolGPT] Failed to parse JSON response payload:', e);
      // If LLM returned non-JSON, try to use the raw text
      if (resultText.length > 20) {
        const brainRes = buildFinalResponse(
          resultText,
          modulesConsulted,
          intent,
          retrievedConfidence,
          undefined,
          role as SchoolRole
        );
        return brainRes;
      }
    }
  }

  // 3. Structured Fallback Response when LLM API keys are missing/offline
  const brainRes = buildFinalResponse(
    data || 'I couldn\'t find specific records matching your query in the current database. Please feel free to rephrase or explore the portal options.',
    modulesConsulted,
    intent,
    retrievedConfidence,
    undefined,
    role as SchoolRole
  );

  return brainRes;
}
