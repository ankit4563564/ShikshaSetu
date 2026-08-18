/**
 * ShikshaSetu — Visual Revision Mind Map AI Extractor Service
 * Pure content-driven extraction without preseeded mock data.
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { safeValidateConceptMindMap } from './schema';
import type { ConceptMindMap, ConceptAccentColor, MindMapSection, MindMapItem } from './types';

export interface ExtractMindMapOptions {
  title: string;
  subject?: string;
  grade?: string;
  notesText: string;
}

export interface ExtractMindMapResult {
  success: boolean;
  mindMap?: ConceptMindMap;
  error?: string;
}

const ACCENT_PALETTE: ConceptAccentColor[] = ['blue', 'green', 'purple', 'orange', 'red', 'teal'];

/**
 * Deterministic text parser strictly derived from the actual uploaded notes.
 * Used only if external LLM provider is unreachable or returns malformed response.
 * Never injects hardcoded Capacitance/Newton/Photosynthesis concepts!
 */
function deriveDeterministicMindMapFromNotes(
  title: string,
  subject: string,
  grade: string,
  notesText: string
): ConceptMindMap {
  const cleanTitle = title.trim() || 'Uploaded Study Notes';
  const paragraphs = notesText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 15);

  const sections: MindMapSection[] = [];
  const lines = notesText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Group lines into 3-5 concept blocks based on numbering or headings
  let currentSectionTitle = 'Core Principles & Overview';
  let currentItems: MindMapItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(?:[0-9]+[\.\)]|Chapter|Section|[A-Z\s]{4,}|\#+)\s*(.*)/i);

    if (headingMatch && headingMatch[1].length > 3 && currentItems.length > 0) {
      // Flush previous section
      sections.push({
        id: `sec-${sections.length + 1}`,
        title: currentSectionTitle,
        accentColor: ACCENT_PALETTE[sections.length % ACCENT_PALETTE.length],
        importance: sections.length === 0 ? 'high' : 'medium',
        items: currentItems,
        relatedSectionIds: [],
      });
      currentSectionTitle = headingMatch[1].replace(/[:\-#]+$/, '').trim();
      currentItems = [];
    } else {
      // Detect if line contains a mathematical equation or formula
      const isFormula = /[=\+\-\*\/\^\\_]/.test(line) && line.length < 80 && /\b[A-Za-z]\s*=/.test(line);

      currentItems.push({
        id: `item-${sections.length + 1}-${currentItems.length + 1}`,
        type: isFormula ? 'formula' : currentItems.length === 0 ? 'definition' : 'concept',
        content: line.replace(/^[\*\-\•\d\.\)]+\s*/, ''),
      });

      if (currentItems.length >= 4) {
        sections.push({
          id: `sec-${sections.length + 1}`,
          title: currentSectionTitle,
          accentColor: ACCENT_PALETTE[sections.length % ACCENT_PALETTE.length],
          importance: 'medium',
          items: currentItems,
          relatedSectionIds: [],
        });
        currentSectionTitle = `Key Concepts Part ${sections.length + 1}`;
        currentItems = [];
      }
    }
  }

  // Flush remaining items
  if (currentItems.length > 0) {
    sections.push({
      id: `sec-${sections.length + 1}`,
      title: currentSectionTitle,
      accentColor: ACCENT_PALETTE[sections.length % ACCENT_PALETTE.length],
      importance: 'medium',
      items: currentItems,
      relatedSectionIds: [],
    });
  }

  // Ensure at least 1 section exists
  if (sections.length === 0) {
    sections.push({
      id: 'sec-1',
      title: cleanTitle,
      accentColor: 'blue',
      importance: 'high',
      items: [
        {
          id: 'item-1',
          type: 'concept',
          content: notesText.slice(0, 180),
        },
      ],
      relatedSectionIds: [],
    });
  }

  // Build relationships between sequential sections
  const relationships = sections.slice(1).map((sec, idx) => ({
    fromSectionId: sections[idx].id,
    toSectionId: sec.id,
    label: 'Connects to',
    type: 'depends_on' as const,
  }));

  return {
    title: cleanTitle,
    subject: subject || 'General Subject',
    grade: grade || '8',
    summary: paragraphs[0] ? paragraphs[0].slice(0, 200) : `Comprehensive revision summary for ${cleanTitle}.`,
    sections,
    relationships,
    sourceReferences: [
      { excerpt: notesText.slice(0, 150) },
    ],
  };
}

export async function extractConceptMindMapFromText(
  options: ExtractMindMapOptions
): Promise<ExtractMindMapResult> {
  const { title, subject = 'General Subject', grade = '8', notesText } = options;

  if (!notesText || notesText.trim().length < 20) {
    return {
      success: false,
      error: 'Not enough readable content to generate a reliable revision map. Please provide more detailed notes (at least 20 characters).',
    };
  }

  const systemPrompt = `You are the ShikshaSetu Educational Concept Mind-Map Generator.
Your task is to transform the provided uploaded textbook/lesson notes into a dense, structured, exam-revision concept map (like an educational revision poster sheet).

RULES:
1. Strictly base all concepts, definitions, formulas, and examples ONLY on the provided notes text.
2. Group related ideas into 3-6 visually distinct Concept Sections.
3. Assign each section ONE distinct accent color from: ["blue", "green", "orange", "purple", "red", "teal"].
4. Identify any mathematical/scientific formulas and express them in standard LaTeX notation (e.g. "E = mc^2", "F = ma").
5. Include definitions, conditions, examples, comparisons, warnings, and relationships between sections.
6. Allowed diagram tokens: "process-flow", "comparison", "hierarchy", "physics-setup", "circuit-capacitor".
7. Retain source references (page / section / excerpt) where identifiable.

OUTPUT STRICT JSON MATCHING THIS EXACT SCHEMA:
{
  "title": string,
  "subject": string,
  "grade": string,
  "summary": string,
  "sections": [
    {
      "id": string,
      "title": string,
      "accentColor": "blue"|"green"|"orange"|"purple"|"red"|"teal",
      "importance": "high"|"medium"|"low",
      "preferredRegion": "top"|"left"|"center"|"right"|"bottom",
      "summary": string,
      "items": [
        {
          "id": string,
          "type": "concept"|"definition"|"formula"|"example"|"condition"|"comparison"|"key_point"|"warning"|"process"|"diagram",
          "title": string,
          "content": string,
          "details": string,
          "diagramType": "process-flow"|"comparison"|"hierarchy"|"physics-setup"|"circuit-capacitor",
          "source": { "page": number, "section": string, "excerpt": string }
        }
      ],
      "relatedSectionIds": string[]
    }
  ],
  "relationships": [
    { "fromSectionId": string, "toSectionId": string, "label": string, "type": "depends_on"|"contrasts_with"|"derives"|"combines_to" }
  ],
  "sourceReferences": [
    { "page": number, "section": string, "excerpt": string }
  ]
}`;

  const userMessage = JSON.stringify({
    title,
    subject,
    grade,
    uploadedNotesContent: notesText.slice(0, 4500),
  });

  const aiProvider = new ResilientAIProvider();

  try {
    const response = await aiProvider.generateCompletion({
      systemPrompt,
      userMessage,
      temperature: 0.2,
      maxTokens: 2500,
    });

    const parsedJson = JSON.parse(response.text);
    const validation = safeValidateConceptMindMap(parsedJson);

    if (validation.success) {
      return { success: true, mindMap: validation.data };
    } else {
      console.warn('[MindMapExtractor] AI returned invalid JSON structure, deriving map directly from uploaded text:', validation.error);
      const derived = deriveDeterministicMindMapFromNotes(title, subject, grade, notesText);
      return { success: true, mindMap: derived };
    }
  } catch (err: any) {
    console.warn('[MindMapExtractor] AI Provider call failed, deriving structured map directly from uploaded text:', err?.message);
    const derived = deriveDeterministicMindMapFromNotes(title, subject, grade, notesText);
    return { success: true, mindMap: derived };
  }
}
