'use server';

import { getAuthContext } from '@/lib/auth/getAuthContext';
import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { sanitizeAiText } from '@/lib/intelligence/schemas/signalAnalysisSchema';

// ─── 1. Core Revision Notes Types ──────────────────────────────────────────

export interface RevisionNoteDefinition {
  term: string;
  definition: string;
}

export interface RevisionNoteData {
  id?: string;
  title: string;
  subject: string;
  grade?: string;
  keyIdea: string;
  importantConcepts: string[];
  definitions: RevisionNoteDefinition[];
  rememberThis: string[];
  formulaOrEquation?: string;
  example: string;
  commonMistake: string;
  createdAt?: string;
}

export interface GenerateRevisionNotesOptions {
  subject: string;
  topic: string;
  chapterNotes?: string;
  grade?: string;
}

// ─── 2. Generate Revision Notes ────────────────────────────────────────────

export async function generateRevisionNotesAction(
  options: GenerateRevisionNotesOptions
): Promise<{ success: boolean; notes?: RevisionNoteData; error?: string }> {
  try {
    const { subject, topic, chapterNotes = '', grade = '8' } = options;

    if (!topic || !topic.trim()) {
      return { success: false, error: 'Topic is required to generate revision notes.' };
    }

    const systemPrompt = `You are a curriculum specialist and master study coach on ShikshaSetu.
Create structured, concise, student-friendly AI Revision Notes for school students.
DO NOT write long essays. Keep paragraphs short and scannable.
Ground all content in the provided notes if available; otherwise use standard CBSE/ICSE curriculum for Class ${grade} ${subject}.
Output valid JSON matching exact schema:
{
  "title": string,
  "subject": string,
  "keyIdea": string,
  "importantConcepts": string[],
  "definitions": [
    { "term": string, "definition": string }
  ],
  "rememberThis": string[],
  "formulaOrEquation": string,
  "example": string,
  "commonMistake": string
}`;

    const userMessage = JSON.stringify({
      subject,
      topic,
      grade,
      chapterNotes: chapterNotes.slice(0, 3000),
    });

    const aiProvider = new ResilientAIProvider();

    try {
      const response = await aiProvider.generateCompletion({
        systemPrompt,
        userMessage,
        temperature: 0.2,
      });

      const parsed = JSON.parse(response.text);

      const notes: RevisionNoteData = {
        id: `rev-${Date.now()}`,
        title: sanitizeAiText(parsed.title || topic),
        subject,
        grade,
        keyIdea: sanitizeAiText(parsed.keyIdea || `Core understanding of ${topic}.`),
        importantConcepts: Array.isArray(parsed.importantConcepts) && parsed.importantConcepts.length > 0
          ? parsed.importantConcepts.map((c: any) => sanitizeAiText(String(c)))
          : [topic, 'Core Principles', 'Application'],
        definitions: Array.isArray(parsed.definitions) && parsed.definitions.length > 0
          ? parsed.definitions.map((d: any) => ({
              term: sanitizeAiText(String(d.term)),
              definition: sanitizeAiText(String(d.definition)),
            }))
          : [{ term: topic, definition: `Primary topic investigated in ${subject}.` }],
        rememberThis: Array.isArray(parsed.rememberThis) && parsed.rememberThis.length > 0
          ? parsed.rememberThis.map((r: any) => sanitizeAiText(String(r)))
          : [`Always verify intermediate steps when solving ${topic} questions.`],
        formulaOrEquation: parsed.formulaOrEquation ? sanitizeAiText(String(parsed.formulaOrEquation)) : undefined,
        example: sanitizeAiText(parsed.example || `Standard working example for ${topic}.`),
        commonMistake: sanitizeAiText(parsed.commonMistake || `Confusing the base definition with derived cases.`),
        createdAt: new Date().toISOString(),
      };

      return { success: true, notes };
    } catch {
      // Deterministic Fallback grounded in topic
      const isMath = subject.toLowerCase().includes('math') || topic.toLowerCase().includes('fraction') || topic.toLowerCase().includes('equation');
      const isBio = topic.toLowerCase().includes('photo') || subject.toLowerCase().includes('bio') || topic.toLowerCase().includes('cell');

      const fallback: RevisionNoteData = {
        id: `rev-${Date.now()}`,
        title: topic,
        subject,
        grade,
        keyIdea: isBio
          ? 'Autotrophic organisms synthesize chemical energy using radiant solar light, water, and atmospheric carbon dioxide.'
          : isMath
          ? 'Fractions represent equal parts of a whole quantity; operations require finding common denominators or multiplicative scaling.'
          : `${topic} explains how fundamental components interact systematically under standard conditions.`,
        importantConcepts: isBio
          ? ['Chlorophyll in chloroplasts', 'Light-dependent reactions', 'Carbon dioxide absorption', 'Glucose synthesis & starch storage', 'Oxygen release as byproduct']
          : isMath
          ? ['Numerator & Denominator', 'Equivalent fractions', 'Simplest form / GCD', 'Adding with LCM', 'Decimal conversion']
          : ['Core Definition', 'Operational Laws', 'Key Variables', 'Everyday Applications'],
        definitions: [
          {
            term: isBio ? 'Photosynthesis' : isMath ? 'Equivalent Fractions' : topic,
            definition: isBio
              ? 'The biological process by which green plants and certain organisms transform light energy into chemical energy.'
              : isMath
              ? 'Fractions that express the same proportion or value, despite having different numerators and denominators (e.g. 1/2 = 2/4 = 3/6).'
              : `The fundamental standard concept studied in Class ${grade} ${subject}.`,
          },
        ],
        rememberThis: [
          isBio ? 'Chlorophyll is the green pigment in chloroplasts that absorbs sunlight.' : isMath ? 'To simplify a fraction, divide both numerator and denominator by their Highest Common Factor (HCF).' : 'Review the fundamental definitions before attempting numerical problems.',
          isBio ? 'Water enters through root hairs; gases exchange through stomata.' : isMath ? 'Never add denominators when adding fractions with the same denominator.' : 'Remember the boundary conditions and units of measurement.',
        ],
        formulaOrEquation: isBio
          ? '6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂'
          : isMath
          ? 'a/b + c/b = (a + c)/b'
          : undefined,
        example: isBio
          ? 'Green leaves exposed to sunlight produce starch, which turns blue-black when tested with iodine solution.'
          : isMath
          ? 'To add 1/4 + 2/4: since denominators are both 4, add numerators (1 + 2 = 3), resulting in 3/4.'
          : `Standard application problem demonstrating the core law in action.`,
        commonMistake: isBio
          ? 'Thinking photosynthesis happens at night (only respiration occurs without light).'
          : isMath
          ? 'Adding denominators directly (e.g. incorrectly calculating 1/3 + 1/3 as 2/6 instead of 2/3).'
          : `Ignoring units or applying the formula outside its valid assumptions.`,
        createdAt: new Date().toISOString(),
      };

      return { success: true, notes: fallback };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to generate revision notes' };
  }
}

// ─── 3. AI Concept Actions (Explain, Shorten, Example, Quiz) ─────────────────

export interface ExplainConceptResult {
  concept: string;
  simpleExplanation: string;
  analogy: string;
  checkQuestion: string;
}

export async function explainConceptSimplyAction(
  concept: string,
  topic: string,
  subject: string
): Promise<{ success: boolean; result?: ExplainConceptResult; error?: string }> {
  try {
    const systemPrompt = `You are a supportive AI study tutor on ShikshaSetu.
Explain the concept "${concept}" from the chapter "${topic}" in ${subject} clearly and simply for a middle/high school student.
Output valid JSON:
{
  "concept": string,
  "simpleExplanation": string,
  "analogy": string,
  "checkQuestion": string
}`;

    const userMessage = JSON.stringify({ concept, topic, subject });
    const aiProvider = new ResilientAIProvider();

    try {
      const response = await aiProvider.generateCompletion({
        systemPrompt,
        userMessage,
        temperature: 0.3,
      });
      const parsed = JSON.parse(response.text);
      return {
        success: true,
        result: {
          concept,
          simpleExplanation: sanitizeAiText(parsed.simpleExplanation || `${concept} is easy to understand when broken into small parts.`),
          analogy: sanitizeAiText(parsed.analogy || `Think of ${concept} like a recipe where every ingredient has a fixed role.`),
          checkQuestion: sanitizeAiText(parsed.checkQuestion || `Can you tell what happens if you double the main factor in ${concept}?`),
        },
      };
    } catch {
      return {
        success: true,
        result: {
          concept,
          simpleExplanation: `${concept} is the key rule that tells us how different parts of ${topic} work together. Instead of memorizing the whole sentence, remember what causes what.`,
          analogy: `Think of ${concept} like sharing a pizza evenly among friends: each slice must be the exact same size for the share to be fair.`,
          checkQuestion: `Why does changing the denominator change the size of each part?`,
        },
      };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Explanation failed' };
  }
}

export interface RevisionQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function generateRevisionQuizAction(
  topic: string,
  notesContent: string
): Promise<{ success: boolean; questions?: RevisionQuizQuestion[]; error?: string }> {
  try {
    const systemPrompt = `You are a study quiz generator on ShikshaSetu.
Generate 3 to 4 quick diagnostic multiple-choice questions based ONLY on the provided revision notes for "${topic}".
Each question must test understanding (not trickery).
Output valid JSON:
{
  "questions": [
    {
      "id": string,
      "question": string,
      "options": string[],
      "correctAnswer": string,
      "explanation": string
    }
  ]
}`;

    const userMessage = JSON.stringify({ topic, notesContent: notesContent.slice(0, 2000) });
    const aiProvider = new ResilientAIProvider();

    try {
      const response = await aiProvider.generateCompletion({
        systemPrompt,
        userMessage,
        temperature: 0.2,
      });
      const parsed = JSON.parse(response.text);
      const questions = Array.isArray(parsed.questions) && parsed.questions.length > 0
        ? parsed.questions.map((q: any, i: number) => ({
            id: q.id || `rq-${i + 1}`,
            question: sanitizeAiText(q.question),
            options: Array.isArray(q.options) ? q.options.map((o: any) => sanitizeAiText(String(o))) : ['A', 'B', 'C', 'D'],
            correctAnswer: sanitizeAiText(String(q.correctAnswer)),
            explanation: sanitizeAiText(String(q.explanation || 'Review the key idea in the revision notes.')),
          }))
        : [];

      if (questions.length > 0) {
        return { success: true, questions };
      }
      throw new Error('Empty questions from AI');
    } catch {
      // Deterministic Fallback
      return {
        success: true,
        questions: [
          {
            id: 'rq-1',
            question: `What is the primary key idea of ${topic}?`,
            options: [
              `It provides the foundational method to solve related problems`,
              `It only works for negative numbers`,
              `It is never used in real-world scenarios`,
              `It requires memorizing 50 formulas`,
            ],
            correctAnswer: `It provides the foundational method to solve related problems`,
            explanation: `As highlighted in the Key Idea section, understanding the foundational method is essential.`,
          },
          {
            id: 'rq-2',
            question: `Which of the following is considered a common mistake in ${topic}?`,
            options: [
              `Applying the rule without checking common denominators or units`,
              `Simplifying step by step`,
              `Using worked examples to double check`,
              `Reading the question carefully`,
            ],
            correctAnswer: `Applying the rule without checking common denominators or units`,
            explanation: `Review the Common Mistakes section of the notes to avoid this frequent exam error.`,
          },
          {
            id: 'rq-3',
            question: `How can you quickly check if your answer in ${topic} makes sense?`,
            options: [
              `Substitute values back into the original condition or example`,
              `Assume the first calculation is always correct`,
              `Skip reading the units`,
              `Write down random numbers`,
            ],
            correctAnswer: `Substitute values back into the original condition or example`,
            explanation: `Checking your answer against a worked example ensures complete accuracy.`,
          },
        ],
      };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Quiz generation failed' };
  }
}

// ─── 4. Saved Notes Persistence Store ──────────────────────────────────────

declare global {
  var __SHIKSHASETU_SAVED_NOTES__: RevisionNoteData[] | undefined;
}

export async function saveRevisionNoteAction(
  note: RevisionNoteData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!note || !note.title) {
      return { success: false, error: 'Valid revision note is required' };
    }

    if (typeof globalThis !== 'undefined') {
      if (!globalThis.__SHIKSHASETU_SAVED_NOTES__) {
        globalThis.__SHIKSHASETU_SAVED_NOTES__ = [];
      }
      // Remove existing note with same title/id if any
      globalThis.__SHIKSHASETU_SAVED_NOTES__ = globalThis.__SHIKSHASETU_SAVED_NOTES__.filter(
        (n) => n.id !== note.id && n.title !== note.title
      );
      globalThis.__SHIKSHASETU_SAVED_NOTES__.unshift({
        ...note,
        id: note.id || `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save note' };
  }
}

export async function getSavedRevisionNotesAction(): Promise<{
  success: boolean;
  notes: RevisionNoteData[];
}> {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.__SHIKSHASETU_SAVED_NOTES__) {
      return { success: true, notes: globalThis.__SHIKSHASETU_SAVED_NOTES__ };
    }
    return { success: true, notes: [] };
  } catch {
    return { success: true, notes: [] };
  }
}

export async function deleteSavedRevisionNoteAction(
  noteId: string
): Promise<{ success: boolean }> {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.__SHIKSHASETU_SAVED_NOTES__) {
      globalThis.__SHIKSHASETU_SAVED_NOTES__ = globalThis.__SHIKSHASETU_SAVED_NOTES__.filter(
        (n) => n.id !== noteId
      );
    }
    return { success: true };
  } catch {
    return { success: true };
  }
}
