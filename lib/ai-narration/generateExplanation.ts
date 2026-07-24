import type { EvidenceItem } from '@/types';

/**
 * AI Narration — generates warm, plain-language summaries for teachers.
 *
 * Design contract (from cursorrules §5):
 * - NO banned words in the UI: risk score, confidence interval, algorithm,
 *   model output, inference, vector, embedding, threshold, weighted formula, etc.
 * - Only rephrase the given evidence bullets, do not invent claims or diagnoses.
 * - Single-sentence warm delivery.
 * - Robust multi-provider fallback flow: Groq (primary) → Gemini (secondary) → Offline template.
 */

const SYSTEM_PROMPT = `You are an educational assistant that helps school teachers summarize student progress in plain, warm, and natural language.
Your task is to take the provided bullet points of evidence regarding a student's attendance, assignments, grades, and mood check-ins, and synthesize them into exactly ONE cohesive, warm, and natural sentence for the teacher.

Strict Constraints:
1. Rely ONLY on the facts provided in the evidence. Do NOT make up new claims, diagnoses, or external explanations (e.g. do not say the student has "family problems", "health issues", or is "unmotivated" unless explicitly written in the evidence).
2. Write exactly ONE sentence. Keep it clear, concise, and focused.
3. Use a warm, professional, human tone.
4. DO NOT use any of these banned words: risk score, sentiment score, confidence interval, confidence level, model output, inference, vector, embedding, threshold, weighted formula, API, engine, algorithm.
5. Do not include any introductory remarks, explanations, or quotes. Output ONLY the final sentence.`;

/**
 * Builds the offline template-based fallback sentence when LLM providers are unavailable.
 */
export function generateOfflineFallback(studentName: string, evidence: EvidenceItem[]): string {
  // Find items that are not 'on-track' to focus on concerns
  const concerns = evidence.filter((item) => item.status !== 'on-track');
  const itemsToUse = concerns.length > 0 ? concerns : evidence;

  // Map headlines to lower case and clean up basic punctuation
  const descriptions = itemsToUse.map((item) => {
    let desc = item.headline.trim();
    // Lowercase first letter if it doesn't look like a proper noun
    if (desc && desc[0] === desc[0].toUpperCase() && desc[1] === desc[1].toLowerCase()) {
      desc = desc[0].toLowerCase() + desc.slice(1);
    }
    // Remove trailing period
    if (desc.endsWith('.')) {
      desc = desc.slice(0, -1);
    }
    return desc;
  });

  if (concerns.length === 0) {
    return `${studentName} is doing well and is currently on track across all monitored areas.`;
  }

  if (descriptions.length === 1) {
    return `Recent observations show that ${studentName} has ${descriptions[0]}.`;
  }

  if (descriptions.length === 2) {
    return `Recent observations show that ${studentName} has ${descriptions[0]} and ${descriptions[1]}.`;
  }

  const last = descriptions.pop();
  return `Recent observations show that ${studentName} has ${descriptions.join(', ')}, and ${last}.`;
}

/**
 * Fetches the explanation from Groq API (Primary LLM Provider)
 */
async function fetchGroqExplanation(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 150,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Groq API returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content?.trim();
    if (!resultText) {
      throw new Error('Groq returned an empty response');
    }

    return resultText;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches the explanation from Gemini API (Secondary LLM Provider)
 */
async function fetchGeminiExplanation(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Neither GEMINI_API_KEY nor GOOGLE_AI_API_KEY is defined');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nHere is the student data:\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 150,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!resultText) {
      throw new Error('Gemini returned an empty response');
    }

    return resultText;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Main entry point for generating warm, plain-language student summaries for teachers.
 */
export async function generateExplanation(
  studentName: string,
  evidence: EvidenceItem[]
): Promise<string> {
  // Format the evidence into a clean text prompt
  const bulletsList = evidence
    .map((item) => {
      const category = item.id.split('-')[1] || 'general';
      return `[${category.toUpperCase()} - ${item.status.toUpperCase()}]: ${item.headline}\n` +
        item.bullets.map((b) => `  * ${b}`).join('\n');
    })
    .join('\n');

  const prompt = `Student: ${studentName}\n\nEvidence Points:\n${bulletsList}\n\nPlease generate the warm summary sentence:`;

  // 1. Try Groq (Primary)
  try {
    console.log(`[AI Narration] Attempting Groq explanation for ${studentName}...`);
    const explanation = await fetchGroqExplanation(prompt);
    return explanation;
  } catch (error: any) {
    console.warn(`[AI Narration] Groq failed: ${error?.message || error}. Trying Gemini...`);

    // 2. Try Gemini (Secondary Fallback)
    try {
      const explanation = await fetchGeminiExplanation(prompt);
      return explanation;
    } catch (geminiError: any) {
      console.warn(`[AI Narration] Gemini failed: ${geminiError?.message || geminiError}. Falling back to offline template...`);

      // 3. Try Offline Template (Final Fallback)
      return generateOfflineFallback(studentName, evidence);
    }
  }
}
