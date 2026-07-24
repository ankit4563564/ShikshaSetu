/**
 * AI Categorization for Voice-First Quick Log (PRD §15)
 * 
 * Takes a transcribed voice note and uses AI to:
 * 1. Identify which student the note refers to
 * 2. Categorize the evidence type (attendance, homework, grades, mood, behavior)
 * 3. Generate a structured headline and bullets for evidence_logs
 */

export interface VoiceNoteCategorization {
  studentId: string;
  studentName: string;
  sourceType: 'attendance' | 'homework' | 'grades' | 'mood' | 'behavior';
  headline: string;
  bullets: string[];
  confidence: number;
}

function getSystemPrompt(studentsRoster?: { id: string; display_name: string }[]): string {
  const studentListText = studentsRoster && studentsRoster.length > 0
    ? studentsRoster.map((s) => `- ${s.display_name} (ID: ${s.id})`).join('\n')
    : `- Aarav Sharma (ID: b1000000-0000-4000-8000-000000000001)
- Priya Patel (ID: b1000000-0000-4000-8000-000000000002)  
- Rohan Singh (ID: b1000000-0000-4000-8000-000000000003)`;

  return `You are an educational assistant that helps teachers categorize voice notes about students.
Your task is to analyze a transcribed voice note and extract:
1. Which student is mentioned (by name)
2. What category of evidence this is (attendance, homework, grades, mood, or behavior)
3. A concise headline summarizing the observation
4. 2-3 bullet points with specific details

Available students in this class:
${studentListText}

Evidence categories:
- attendance: about being present/absent/late to class
- homework: about assignments, submissions, missing work
- grades: about test scores, quiz performance, academic marks
- mood: about emotional state, behavior during check-ins, attitude
- behavior: about classroom conduct, interactions with peers/teachers

Output format: Return ONLY a JSON object with this exact structure:
{
  "studentId": "UUID",
  "studentName": "Full Name",
  "sourceType": "category",
  "headline": "one-line summary",
  "bullets": ["detail 1", "detail 2"],
  "confidence": 0.95
}

If the student name is unclear or not in the class, set studentId to "unknown" and confidence below 0.5.`;
}

/**
 * Uses Groq API to categorize the voice note (Primary LLM Provider)
 */
async function categorizeWithGroq(transcript: string, systemPrompt: string): Promise<VoiceNoteCategorization> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Voice note transcript: "${transcript}"` },
        ],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' },
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

    const parsed = JSON.parse(resultText);
    return parsed as VoiceNoteCategorization;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Uses Gemini API to categorize the voice note (Secondary LLM Provider)
 */
async function categorizeWithGemini(transcript: string, systemPrompt: string): Promise<VoiceNoteCategorization> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Neither GEMINI_API_KEY nor GOOGLE_AI_API_KEY is defined');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

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
                text: `${systemPrompt}\n\nVoice note transcript: "${transcript}"\n\nReturn ONLY the JSON object.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 300,
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

    // Extract JSON from response (Gemini sometimes wraps in markdown)
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : resultText;
    const parsed = JSON.parse(jsonString);
    return parsed as VoiceNoteCategorization;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Rule-based fallback when AI providers are unavailable
 */
function categorizeWithRules(transcript: string, studentsRoster?: { id: string; display_name: string }[]): VoiceNoteCategorization {
  const lowerTranscript = transcript.toLowerCase();
  
  // Try to identify student from roster
  let studentId = 'unknown';
  let studentName = 'Unknown Student';

  const roster = studentsRoster && studentsRoster.length > 0 ? studentsRoster.map(s => ({
    id: s.id,
    name: s.display_name
  })) : [
    { id: 'b1000000-0000-4000-8000-000000000001', name: 'Aarav Sharma' },
    { id: 'b1000000-0000-4000-8000-000000000002', name: 'Priya Patel' },
    { id: 'b1000000-0000-4000-8000-000000000003', name: 'Rohan Singh' }
  ];
  
  for (const student of roster) {
    const firstName = student.name.split(' ')[0].toLowerCase();
    if (lowerTranscript.includes(firstName)) {
      studentId = student.id;
      studentName = student.name;
      break;
    }
  }
  
  // Try to identify category
  let sourceType: 'attendance' | 'homework' | 'grades' | 'mood' | 'behavior' = 'behavior';
  
  if (lowerTranscript.includes('absent') || lowerTranscript.includes('present') || lowerTranscript.includes('late') || lowerTranscript.includes('attendance')) {
    sourceType = 'attendance';
  } else if (lowerTranscript.includes('homework') || lowerTranscript.includes('assignment') || lowerTranscript.includes('submit')) {
    sourceType = 'homework';
  } else if (lowerTranscript.includes('grade') || lowerTranscript.includes('test') || lowerTranscript.includes('score') || lowerTranscript.includes('quiz')) {
    sourceType = 'grades';
  } else if (lowerTranscript.includes('mood') || lowerTranscript.includes('feeling') || lowerTranscript.includes('happy') || lowerTranscript.includes('sad') || lowerTranscript.includes('upset')) {
    sourceType = 'mood';
  }
  
  // Generate headline and bullets from transcript
  const headline = transcript.length > 60 ? transcript.substring(0, 60) + '...' : transcript;
  const bullets = [transcript];
  
  return {
    studentId,
    studentName,
    sourceType,
    headline,
    bullets,
    confidence: studentId === 'unknown' ? 0.3 : 0.6,
  };
}

/**
 * Main entry point for categorizing voice notes
 * Implements multi-provider fallback: Groq → Gemini → Rules
 */
export async function categorizeVoiceNote(
  transcript: string,
  studentsRoster?: { id: string; display_name: string }[]
): Promise<VoiceNoteCategorization> {
  const systemPrompt = getSystemPrompt(studentsRoster);

  // 1. Try Groq (Primary)
  try {
    console.log('[Voice Categorization] Attempting Groq categorization...');
    const result = await categorizeWithGroq(transcript, systemPrompt);
    console.log('[Voice Categorization] Groq succeeded:', result);
    return result;
  } catch (error: any) {
    console.warn(`[Voice Categorization] Groq failed: ${error?.message || error}. Trying Gemini...`);

    // 2. Try Gemini (Secondary Fallback)
    try {
      const result = await categorizeWithGemini(transcript, systemPrompt);
      console.log('[Voice Categorization] Gemini succeeded:', result);
      return result;
    } catch (geminiError: any) {
      console.warn(`[Voice Categorization] Gemini failed: ${geminiError?.message || geminiError}. Falling back to rules...`);

      // 3. Try Rule-based (Final Fallback)
      const result = categorizeWithRules(transcript, studentsRoster);
      console.log('[Voice Categorization] Rules-based fallback:', result);
      return result;
    }
  }
}
