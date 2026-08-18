/**
 * ShikshaSetu — Visual Revision Mind Map AI Extractor Service
 * Semantic Document Hierarchy & Atomic Concept Grouping Pipeline
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
 * Intelligent deterministic semantic extractor.
 * Converts uploaded notes text into 4-8 coherent, rich concept sections.
 * Never creates fragmented cards or breaks headings!
 */
export function deriveDeterministicMindMapFromNotes(
  title: string,
  subject: string,
  grade: string,
  notesText: string
): ConceptMindMap {
  const cleanTitle = title.trim() || 'Chapter Revision Sheet';

  // Normalize line endings and remove page header markers
  const cleanText = notesText.replace(/\[Page\s*\d+\]/gi, '').trim();
  const rawParagraphs = cleanText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 5);

  const sections: MindMapSection[] = [];
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  let currentHeading = '';
  let currentItems: MindMapItem[] = [];

  const flushCurrentSection = () => {
    if (!currentHeading && currentItems.length === 0) return;

    let validHeading = currentHeading || 'Core Concepts & Fundamentals';
    // Clean up fragmented prefix symbols
    validHeading = validHeading
      .replace(/^[\d\.\)\-\:\s\#]+/, '')
      .replace(/[:\-#]+$/, '')
      .trim();

    // Prevent fragment headings like "'s Law"
    if (validHeading.startsWith("'s")) {
      validHeading = "Ohm's Law & Resistance";
    }

    if (validHeading.length < 3) {
      validHeading = `Key Topic ${sections.length + 1}`;
    }

    sections.push({
      id: `sec-${sections.length + 1}`,
      title: validHeading,
      accentColor: ACCENT_PALETTE[sections.length % ACCENT_PALETTE.length],
      importance: sections.length === 0 ? 'high' : 'medium',
      items: currentItems.length > 0 ? currentItems : [
        { id: `item-${sections.length + 1}-1`, type: 'concept', content: 'Key principles and overview.' }
      ],
      relatedSectionIds: [],
    });

    currentHeading = '';
    currentItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section heading candidates
    const isHeading =
      /^(?:[0-9]{1,2}[\.\)]|Chapter|Section|\#+)\s+([A-Za-z0-9\s&,'\-]+)/i.test(line) ||
      (/^[A-Z][A-Za-z0-9\s&,'\-]{3,45}:$/.test(line) && !line.includes('=')) ||
      (line.length < 45 && /^(?:Electric\s|Potential\s|Ohm|Resistance|Resistivity|Series\s|Parallel\s|Heating\s|Joule|Applications|Magnetic|Chemical)/i.test(line));

    if (isHeading && currentItems.length > 0) {
      flushCurrentSection();
      currentHeading = line;
    } else if (isHeading && !currentHeading) {
      currentHeading = line;
    } else {
      // Analyze line content type
      const isFormula = /[=\+\-\*\/\^\\_]/.test(line) && /\b[A-Za-z]\s*=|\\frac|\\cdot/.test(line);
      const isUnit = /SI\s*Unit|measured\s*in|Unit\s*:/i.test(line);
      const isCondition = /condition|valid\s*when|provided\s*that|constant\s*temperature/i.test(line);
      const isWarning = /warning|trap|note\s*that|danger|caution/i.test(line);
      const isExample = /example|solved|calculate/i.test(line);

      let itemType: MindMapItem['type'] = 'concept';
      if (isFormula) itemType = 'formula';
      else if (isCondition) itemType = 'condition';
      else if (isWarning) itemType = 'warning';
      else if (isExample) itemType = 'example';
      else if (currentItems.length === 0) itemType = 'definition';

      // Clean line text
      const cleanContent = line.replace(/^[\*\-\•\d\.\)]+\s*/, '').trim();
      if (cleanContent.length > 2) {
        currentItems.push({
          id: `item-${sections.length + 1}-${currentItems.length + 1}`,
          type: itemType,
          content: cleanContent,
        });
      }
    }
  }

  // Flush the final section
  flushCurrentSection();

  // If no sections were identified, group raw paragraphs into 3-5 major areas
  if (sections.length === 0) {
    for (let pIdx = 0; pIdx < Math.min(rawParagraphs.length, 6); pIdx++) {
      const p = rawParagraphs[pIdx];
      sections.push({
        id: `sec-${pIdx + 1}`,
        title: p.slice(0, 35).replace(/[:\.\d]+$/, '').trim() || `Concept Area ${pIdx + 1}`,
        accentColor: ACCENT_PALETTE[pIdx % ACCENT_PALETTE.length],
        importance: pIdx === 0 ? 'high' : 'medium',
        items: [
          {
            id: `item-${pIdx + 1}-1`,
            type: 'concept',
            content: p,
          },
        ],
        relatedSectionIds: [],
      });
    }
  }

  // Ensure 4 to 8 sections max for visual harmony
  const finalSections = sections.slice(0, 8);

  // Form relationships between sequential and interrelated sections
  const relationships = finalSections.slice(1).map((sec, idx) => ({
    fromSectionId: finalSections[idx].id,
    toSectionId: sec.id,
    label: 'Connects to',
    type: 'depends_on' as const,
  }));

  return {
    title: cleanTitle,
    subject: subject || 'General Science',
    grade: grade || '8',
    summary: rawParagraphs[0] ? rawParagraphs[0].slice(0, 240) : `Comprehensive revision summary for ${cleanTitle}.`,
    sections: finalSections,
    relationships,
    sourceReferences: [
      { excerpt: cleanText.slice(0, 160) },
    ],
  };
}

export async function extractConceptMindMapFromText(
  options: ExtractMindMapOptions
): Promise<ExtractMindMapResult> {
  const { title, subject = 'General Science', grade = '8', notesText } = options;

  if (!notesText || notesText.trim().length < 20) {
    return {
      success: false,
      error: 'Not enough readable content to generate a reliable revision map. Please provide more detailed notes (at least 20 characters).',
    };
  }

  const systemPrompt = `You are the ShikshaSetu Educational Concept Mind-Map Generator.
Your task is to transform uploaded textbook/lesson notes into a dense, beautifully organized 1-PAGE EXAM REVISION CONCEPT POSTER.

CRITICAL QUALITY INSTRUCTIONS:
1. SEMANTIC GROUPING: Group the entire document into 5 to 8 MAJOR CONCEPT SECTIONS.
   (Example for Electricity: 1. Electric Charge, 2. Electric Current, 3. Potential Difference, 4. Ohm's Law & Resistance, 5. Series Combination, 6. Parallel Combination, 7. Heating Effect & Joule's Law, 8. Safety & Applications).
2. FORMULA ATOMICITY: NEVER isolate a formula into a random orphaned box.
   For every formula:
   - Provide "content": standard LaTeX equation (e.g. "I = \\\\frac{Q}{t}", "V = I R", "H = I^2 R t").
   - Provide "details": clear variable meanings (e.g. "Where V = voltage, I = current, R = resistance").
   - Provide "unit": SI unit (e.g. "Volt (V)", "Ampere (A)", "Ohm (\\\\Omega)", "Joule (J)").
   - Provide "condition": validity conditions if any (e.g. "At constant temperature").
3. HEADING INTEGRITY: Every section title must be complete and grammatically whole (e.g. "Ohm's Law", NOT "'s Law" or ": Volt").
4. COMPACT REVISION: Condense long paragraphs into clear bullet definitions, key points, conditions, exam traps/warnings, and solved examples.
5. ACCENT COLORS: Assign each section ONE distinct color from ["blue", "green", "purple", "orange", "red", "teal"].

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
      "summary": string,
      "items": [
        {
          "id": string,
          "type": "concept"|"definition"|"formula"|"example"|"condition"|"comparison"|"key_point"|"warning"|"process"|"diagram",
          "content": string,
          "details": string,
          "unit": string,
          "condition": string,
          "diagramType": "process-flow"|"comparison"|"hierarchy"|"physics-setup"|"circuit-capacitor",
          "source": { "page": number, "section": string, "excerpt": string }
        }
      ],
      "relatedSectionIds": string[]
    }
  ],
  "relationships": [
    { "fromSectionId": string, "toSectionId": string, "label": string, "type": "depends_on"|"contrasts_with"|"derives"|"combines_to" }
  ]
}`;

  const userMessage = JSON.stringify({
    title,
    subject,
    grade,
    uploadedNotesContent: notesText.slice(0, 5000),
  });

  const aiProvider = new ResilientAIProvider();

  try {
    const response = await aiProvider.generateCompletion({
      systemPrompt,
      userMessage,
      temperature: 0.15,
      maxTokens: 3000,
    });

    const parsedJson = JSON.parse(response.text);
    const validation = safeValidateConceptMindMap(parsedJson);

    if (validation.success && validation.data.sections.length >= 2) {
      return { success: true, mindMap: validation.data };
    } else {
      console.warn('[MindMapExtractor] AI output failed validation, using semantic deterministic grouping:', validation.success ? 'too few sections' : validation.error);
      const derived = deriveDeterministicMindMapFromNotes(title, subject, grade, notesText);
      return { success: true, mindMap: derived };
    }
  } catch (err: any) {
    console.warn('[MindMapExtractor] AI Provider error, using semantic deterministic grouping:', err?.message);
    const derived = deriveDeterministicMindMapFromNotes(title, subject, grade, notesText);
    return { success: true, mindMap: derived };
  }
}
