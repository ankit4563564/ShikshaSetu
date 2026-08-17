'use server';

import { getAuthContext, requirePermission } from '@/lib/auth/getAuthContext';
import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { sanitizeAiText } from '@/lib/intelligence/schemas/signalAnalysisSchema';

export interface HomeworkQuestion {
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'problem_solving';
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
  suggestedAnswer?: string;
}

export interface HomeworkDraftResult {
  title: string;
  instructions: string;
  subject: string;
  grade: string;
  questions: HomeworkQuestion[];
  estimatedMinutes: number;
  learningObjectives: string[];
}

export interface GenerateHomeworkDraftOptions {
  grade: string;
  subject: string;
  topic: string;
  lessonNotes: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount?: number;
}

export async function generateHomeworkDraftAction(
  options: GenerateHomeworkDraftOptions
): Promise<{ success: boolean; draft?: HomeworkDraftResult; error?: string }> {
  try {
    const context = await getAuthContext();
    requirePermission(context, 'homework:write');

    const { grade, subject, topic, lessonNotes, difficulty = 'medium', questionCount = 4 } = options;

    if (!grade || !subject || !topic) {
      return { success: false, error: 'Grade, subject, and topic are required.' };
    }

    if (!lessonNotes || lessonNotes.trim().length < 10) {
      return { success: false, error: 'Not enough lesson context to generate a reliable assignment. Please provide class notes.' };
    }

    const systemPrompt = `You are an AI assistant for teachers on ShikshaSetu.
Generate an age-appropriate, high-quality homework assignment draft based ONLY on the provided lesson notes.
Do NOT invent facts not present in the notes. Do NOT include student PII.
Output valid JSON matching exact schema:
{
  "title": string,
  "instructions": string,
  "subject": string,
  "grade": string,
  "questions": [
    { "question": string, "type": "multiple_choice"|"short_answer"|"problem_solving", "difficulty": "easy"|"medium"|"hard", "marks": number, "options": string[], "suggestedAnswer": string }
  ],
  "estimatedMinutes": number,
  "learningObjectives": string[]
}`;

    const userMessage = JSON.stringify({
      grade,
      subject,
      topic,
      lessonNotes: lessonNotes.slice(0, 2000), // Trim input for token efficiency
      targetDifficulty: difficulty,
      targetQuestionCount: Math.min(10, Math.max(1, questionCount)),
    });

    const aiProvider = new ResilientAIProvider();

    try {
      const response = await aiProvider.generateCompletion({
        systemPrompt,
        userMessage,
        temperature: 0.2,
      });

      const parsed = JSON.parse(response.text);

      const draft: HomeworkDraftResult = {
        title: sanitizeAiText(parsed.title || `${subject} Homework: ${topic}`),
        instructions: sanitizeAiText(parsed.instructions || 'Complete all questions clearly in your workbook.'),
        subject,
        grade,
        questions: Array.isArray(parsed.questions)
          ? parsed.questions.map((q: any, idx: number) => ({
              question: sanitizeAiText(q.question || `Question ${idx + 1}`),
              type: ['multiple_choice', 'short_answer', 'problem_solving'].includes(q.type) ? q.type : 'short_answer',
              difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : difficulty,
              marks: typeof q.marks === 'number' ? Math.max(1, q.marks) : 5,
              options: Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : undefined,
              suggestedAnswer: q.suggestedAnswer ? sanitizeAiText(String(q.suggestedAnswer)) : undefined,
            }))
          : [],
        estimatedMinutes: typeof parsed.estimatedMinutes === 'number' ? Math.max(5, parsed.estimatedMinutes) : 25,
        learningObjectives: Array.isArray(parsed.learningObjectives)
          ? parsed.learningObjectives.map((o: any) => sanitizeAiText(String(o)))
          : [`Understand core concepts of ${topic}`],
      };

      return { success: true, draft };
    } catch {
      // Deterministic Fallback if LLM provider fails
      const fallbackDraft: HomeworkDraftResult = {
        title: `${subject}: ${topic} Practice`,
        instructions: `Review your class notes on ${topic} and answer the following questions.`,
        subject,
        grade,
        questions: [
          {
            question: `Explain the main concept of ${topic} based on today's lesson notes.`,
            type: 'short_answer',
            difficulty: 'easy',
            marks: 5,
            suggestedAnswer: `Key principles of ${topic} as covered in class.`,
          },
          {
            question: `Solve 2 practice problems related to ${topic}.`,
            type: 'problem_solving',
            difficulty,
            marks: 10,
          },
        ],
        estimatedMinutes: 20,
        learningObjectives: [`Apply knowledge of ${topic} to practice questions.`],
      };

      return { success: true, draft: fallbackDraft };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Homework draft generation failed' };
  }
}
