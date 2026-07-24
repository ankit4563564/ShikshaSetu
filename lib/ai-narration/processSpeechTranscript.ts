export type SpeechLanguage = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'gu' | 'bn' | 'pa';

const LANGUAGE_NAMES: Record<SpeechLanguage, string> = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
  mr: 'Marathi', gu: 'Gujarati', bn: 'Bengali', pa: 'Punjabi',
};

export class SpeechProcessingError extends Error {}

function getGeminiKey() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new SpeechProcessingError('Language processing is temporarily unavailable. Please try again shortly.');
  return apiKey;
}

async function askGemini(prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${getGeminiKey()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0, maxOutputTokens: 700 } }),
        signal: controller.signal,
      },
    );
    if (!response.ok) throw new SpeechProcessingError('Language processing is temporarily unavailable. Please try again shortly.');
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new SpeechProcessingError('Language processing returned no result. Please try again.');
    return text;
  } catch (error) {
    if (error instanceof SpeechProcessingError) throw error;
    throw new SpeechProcessingError('Language processing could not be reached. Check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
}

function parseJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  try { return JSON.parse(match ? match[0] : text); } catch { throw new SpeechProcessingError('Language processing returned an invalid result. Please try again.'); }
}

export async function detectAndTranslateSpeech(originalTranscript: string): Promise<{ language: SpeechLanguage; analysisTranscript: string }> {
  const response = parseJson(await askGemini(`Detect the language of this school-related transcript. Supported codes: en, hi, ta, te, kn, ml, mr, gu, bn, pa. Then translate it to English only if it is not English. Return JSON only: {"language":"code","english":"translated or original text"}. Transcript: ${JSON.stringify(originalTranscript)}`));
  if (!LANGUAGE_NAMES[response.language as SpeechLanguage] || typeof response.english !== 'string' || !response.english.trim()) {
    throw new SpeechProcessingError('The spoken language could not be processed. Please try again or type your note.');
  }
  return { language: response.language as SpeechLanguage, analysisTranscript: response.english.trim() };
}

export async function translateSpeechTranscript(transcript: string, sourceLanguage: SpeechLanguage, targetLanguage: SpeechLanguage): Promise<string> {
  if (sourceLanguage === targetLanguage) return transcript;
  const response = parseJson(await askGemini(`Translate this school-related transcript from ${LANGUAGE_NAMES[sourceLanguage]} to ${LANGUAGE_NAMES[targetLanguage]}. Preserve names, dates, and facts. Return JSON only: {"translation":"..."}. Transcript: ${JSON.stringify(transcript)}`));
  if (typeof response.translation !== 'string' || !response.translation.trim()) throw new SpeechProcessingError('The translation could not be completed. Please try again.');
  return response.translation.trim();
}
