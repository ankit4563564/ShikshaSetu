import type { EvidenceItem } from '@/types';

export interface ParentNoteResult {
  note: string;
  prompt: string;
  tone: 'positive' | 'neutral' | 'concern';
  statusLabel: string;
}

const SYSTEM_PROMPT = `You are an educational assistant that helps parents understand their child's daily school progress in plain, warm, and natural language.
Your task is to take the student's name, calculated status ("On Track", "Worth Watching", or "Needs Attention"), and the provided evidence items, and generate a JSON response with:
1. "note": A warm, encouraging, jargon-free summary sentence of the student's recent progress (attendance, homework, grades, and mood). Focus on positive reinforcement if "On Track", constructive support if "Worth Watching", or supportive concern if "Needs Attention". Never use raw decimals, percentages, risk scores, or ratios (e.g. write "missed some homework tasks" instead of "0.4 homework gap" or "40% gap").
2. "prompt": A caring, specific question or conversation starter for the parent to ask their child, based on their recent activities (e.g. "What was your favorite science topic this week?" or "Shall we look over that Math work together tonight?").
3. "tone": The emotional tone of the note ("positive" for On Track, "neutral" for Worth Watching, "concern" for Needs Attention).
4. "statusLabel": A parent-friendly status descriptor ("All is well", "Worth watching", "Needs attention").

Output format: Return ONLY a JSON object with this exact structure:
{
  "note": "summary text...",
  "prompt": "conversation starter...",
  "tone": "positive" | "neutral" | "concern",
  "statusLabel": "All is well" | "Worth watching" | "Needs attention"
}`;

export function generateParentOfflineFallback(
  studentName: string,
  calculatedStatus: 'On Track' | 'Worth Watching' | 'Needs Attention'
): ParentNoteResult {
  const firstName = studentName.split(' ')[0] || studentName;
  if (calculatedStatus === 'On Track') {
    return {
      note: `${firstName} is doing great across the board, attending classes regularly, completing homework, and staying positive.`,
      prompt: `What has been the most interesting thing you learned in school this week, ${firstName}?`,
      tone: 'positive',
      statusLabel: 'All is well',
    };
  } else if (calculatedStatus === 'Worth Watching') {
    return {
      note: `${firstName} is doing fine overall, but has missed some homework assignments recently or shown minor grade dips.`,
      prompt: `Hey ${firstName}, how are you finding your classes lately? Is there any subject you'd like to spend a bit more time on?`,
      tone: 'neutral',
      statusLabel: 'Worth watching',
    };
  } else {
    return {
      note: `${firstName} has recently missed multiple days of school or assignments, and has seemed a bit tired or overwhelmed during checks.`,
      prompt: `Hey ${firstName}, how are you feeling about school this week? Let me know if there's anything I can help you with.`,
      tone: 'concern',
      statusLabel: 'Needs attention',
    };
  }
}

async function fetchGroqParentNote(prompt: string): Promise<ParentNoteResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not defined');

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
        max_tokens: 300,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Groq API status ${response.status}`);
    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content?.trim();
    if (!resultText) throw new Error('Groq returned empty response');

    return JSON.parse(resultText) as ParentNoteResult;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchGeminiParentNote(prompt: string): Promise<ParentNoteResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('Neither GEMINI_API_KEY nor GOOGLE_AI_API_KEY is defined');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${SYSTEM_PROMPT}\n\nHere is the student data:\n${prompt}\n\nReturn ONLY the JSON object.` }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
        }
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Gemini API status ${response.status}`);
    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!resultText) throw new Error('Gemini returned empty response');

    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : resultText;
    return JSON.parse(jsonString) as ParentNoteResult;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateParentDailyNote(
  studentId: string,
  studentName: string,
  calculatedStatus: 'On Track' | 'Worth Watching' | 'Needs Attention',
  evidence: EvidenceItem[]
): Promise<ParentNoteResult> {
  // Format evidence bullets to supply context to the LLM
  const bulletsList = evidence
    .map((item) => {
      const category = item.id.split('-')[1] || 'general';
      return `[${category.toUpperCase()} - ${item.status.toUpperCase()}]: ${item.headline}\n` +
        item.bullets.map((b) => `  * ${b}`).join('\n');
    })
    .join('\n');

  const prompt = `Student: ${studentName}\nStatus: ${calculatedStatus}\n\nEvidence Points:\n${bulletsList}\n\nPlease generate parent JSON:`;

  // 1. Try Groq (Primary)
  try {
    return await fetchGroqParentNote(prompt);
  } catch (groqError) {
    console.warn('[Parent Note] Groq AI Generation failed, trying Gemini...', groqError);
    
    // 2. Try Gemini (Secondary)
    try {
      return await fetchGeminiParentNote(prompt);
    } catch (geminiError) {
      console.warn('[Parent Note] Gemini AI Generation failed, falling back to local templates.', geminiError);
      
      // 3. Deterministic Local Template Fallback
      return generateParentOfflineFallback(studentName, calculatedStatus);
    }
  }
}
