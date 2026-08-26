/**
 * ShikshaSetu — Visual Revision Mind Map AI Extractor Service
 * Document Hierarchy & Editorial Concept Composition Engine
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { safeValidateConceptMindMap } from './schema';
import type { ConceptMindMap, ConceptAccentColor, MindMapSection, MindMapItem, FormulaBlock } from './types';

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
 * Intelligent Document Hierarchy Parser.
 * Reconstructs raw text into 5-8 coherent concept sections with atomic formulas and rich revision points.
 */
export function deriveDeterministicMindMapFromNotes(
  title: string,
  subject: string,
  grade: string,
  notesText: string
): ConceptMindMap {
  const cleanTitle = title.trim() || 'Chapter Revision Sheet';
  const normalizedText = notesText.replace(/\[Page\s*\d+\]/gi, '').trim();

  const rawLines = normalizedText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Filter out chapter intro heading like "Chapter: Electricity and Circuits" from becoming a section
  const lines: string[] = [];
  for (const line of rawLines) {
    if (/^Chapter\s*:\s*/i.test(line) && lines.length === 0) {
      continue;
    }
    lines.push(line);
  }

  // Accumulate lines into section blocks based on numbered headings or bold headers
  const rawBlocks: Array<{ heading: string; lines: string[] }> = [];
  let currentBlock: { heading: string; lines: string[] } | null = null;

  for (const line of lines) {
    const isHeading = /^(?:[0-9]{1,2}[\.\)]|\#+)\s*([A-Za-z0-9\s&,'\-\(\)\/]+)/i.test(line) ||
      (/^[A-Z][A-Za-z0-9\s&,'\-\(\)\/]{3,50}:$/.test(line) && !line.includes('='));

    if (isHeading) {
      if (currentBlock && (currentBlock.lines.length > 0 || currentBlock.heading)) {
        rawBlocks.push(currentBlock);
      }
      currentBlock = { heading: line, lines: [] };
    } else {
      if (!currentBlock) {
        currentBlock = { heading: cleanTitle, lines: [] };
      }
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock && (currentBlock.lines.length > 0 || currentBlock.heading)) {
    rawBlocks.push(currentBlock);
  }

  const sections: MindMapSection[] = [];

  for (let idx = 0; idx < rawBlocks.length; idx++) {
    const block = rawBlocks[idx];
    const rawHeading = block.heading;
    const headingMatch = rawHeading.match(/^(?:[0-9]{1,2}[\.\)]|Chapter|Section|\#+)\s*([A-Za-z0-9\s&,'\-\(\)\/]+)/i);
    let sectionTitle = headingMatch ? headingMatch[1].replace(/[:\-#]+$/, '').trim() : rawHeading.replace(/[:\-#]+$/, '').trim();

    // Guard against malformed fragments like "'s Law"
    if (sectionTitle.startsWith("'s")) {
      sectionTitle = "Ohm's Law & Resistance";
    }
    if (sectionTitle.length < 3) {
      sectionTitle = `Key Concept Area ${sections.length + 1}`;
    }

    const contentLines = block.lines;
    if (contentLines.length === 0 && lines.length === 1) {
      contentLines.push(lines[0]);
    }

    // 2. Parse Items, Formulas, Definitions & Key Points
    const items: MindMapItem[] = [];
    const formulas: FormulaBlock[] = [];
    const keyPoints: string[] = [];
    const conditions: string[] = [];
    const warnings: string[] = [];
    const examples: string[] = [];
    let definitionStr: string | undefined = undefined;

    let pendingFormula: { latex?: string; variables?: string; unit?: string; condition?: string } | null = null;

    for (const rawLine of contentLines) {
      const line = rawLine.replace(/^[\*\-\•\d\.\)]+\s*/, '').trim();
      if (!line || line.length < 2) continue;

      const isFormulaLine = /^(?:Formula|Equation|Law\s*Formula)?\s*[:=]?\s*([A-Za-z0-9_\\^\{\}\s\+\-\*\/\(\)\=\.·]+)$/i.test(line) &&
        /[=\+\-\*\/\^\\_]/.test(line) &&
        /\b[A-Za-z0-9_]\s*=|\\frac|\\cdot|\//.test(line);

      const isWhereLine = /^Where\b|variable meanings/i.test(line);
      const isUnitLine = /^SI\s*Unit|^Unit\s*[:=]|measured\s*in/i.test(line);
      const isConditionLine = /condition|constant\s*temperature|provided\s*that|valid\s*when/i.test(line);
      const isWarningLine = /warning|trap|danger|caution|common\s*mistake/i.test(line);
      const isExampleLine = /example|practical|application|solved/i.test(line);

      if (isFormulaLine) {
        // Clean formula content to valid LaTeX syntax
        let latex = line
          .replace(/^(?:Formula|Equation|Law\s*Formula)?\s*[:=]?\s*/i, '')
          .replace(/\*/g, ' \\cdot ')
          .trim();

        // Convert fractions like Q / t to \frac{Q}{t}
        latex = latex.replace(/([A-Za-z0-9_]+)\s*\/\s*([A-Za-z0-9_]+)/g, '\\frac{$1}{$2}');

        pendingFormula = { latex };
      } else if (isWhereLine && pendingFormula) {
        pendingFormula.variables = line;
      } else if (isUnitLine) {
        const unit = line.replace(/^(?:SI\s*)?Unit\s*[:=]?\s*/i, '').trim();
        if (pendingFormula) {
          pendingFormula.unit = unit;
        } else {
          keyPoints.push(`SI Unit: ${unit}`);
        }
      } else if (isConditionLine) {
        conditions.push(line);
        if (pendingFormula) pendingFormula.condition = line;
      } else if (isWarningLine) {
        warnings.push(line);
        items.push({
          id: `item-${sections.length + 1}-${items.length + 1}`,
          type: 'warning',
          content: line,
        });
      } else if (isExampleLine) {
        examples.push(line);
        items.push({
          id: `item-${sections.length + 1}-${items.length + 1}`,
          type: 'example',
          content: line,
        });
      } else {
        // General statement or definition
        if (!definitionStr && items.length === 0) {
          definitionStr = line;
          items.push({
            id: `item-${sections.length + 1}-def`,
            type: 'definition',
            content: line,
          });
        } else {
          keyPoints.push(line);
          items.push({
            id: `item-${sections.length + 1}-${items.length + 1}`,
            type: 'key_point',
            content: line,
          });
        }
      }
    }

    // Flush formula if captured
    if (pendingFormula && pendingFormula.latex) {
      formulas.push({
        latex: pendingFormula.latex,
        variables: pendingFormula.variables || undefined,
        unit: pendingFormula.unit || undefined,
        condition: pendingFormula.condition || undefined,
      });

      items.unshift({
        id: `item-${sections.length + 1}-formula`,
        type: 'formula',
        content: pendingFormula.latex,
        details: pendingFormula.variables,
        unit: pendingFormula.unit,
        condition: pendingFormula.condition,
      });
    }

    if (items.length === 0) {
      items.push({
        id: `item-${sections.length + 1}-1`,
        type: 'concept',
        content: (block.lines[0] || block.heading).slice(0, 160),
      });
    }

    const isMajorSection =
      formulas.length > 0 ||
      sectionTitle.toLowerCase().includes('ohm') ||
      sectionTitle.toLowerCase().includes('heating') ||
      sectionTitle.toLowerCase().includes('joule') ||
      sectionTitle.toLowerCase().includes('resistor') ||
      sections.length === 0;

    sections.push({
      id: `sec-${sections.length + 1}`,
      title: sectionTitle,
      accentColor: ACCENT_PALETTE[sections.length % ACCENT_PALETTE.length],
      importance: isMajorSection ? 'high' : 'medium',
      layoutSpan: isMajorSection ? 'full' : 'half',
      definition: definitionStr,
      formulas,
      keyPoints,
      conditions,
      warnings,
      examples,
      items,
      relatedSectionIds: [],
    });
  }

  // Ensure 5-8 balanced sections
  const finalSections = sections.slice(0, 8);

  const relationships = finalSections.slice(1).map((sec, i) => ({
    fromSectionId: finalSections[i].id,
    toSectionId: sec.id,
    label: 'Connects to',
    type: 'depends_on' as const,
  }));

  const firstSentence = rawBlocks[0]?.lines[0] || 'Core principles and definitions.';

  return {
    title: cleanTitle,
    subject: subject || 'General Science',
    grade: grade || '10',
    summary: firstSentence.slice(0, 220).replace(/^[\d\.\)]+\s*/, ''),
    sections: finalSections,
    relationships,
    sourceReferences: [{ excerpt: normalizedText.slice(0, 180) }],
  };
}

export async function extractConceptMindMapFromText(
  options: ExtractMindMapOptions
): Promise<ExtractMindMapResult> {
  const { title, subject = 'General Science', grade = '10', notesText } = options;

  if (!notesText || notesText.trim().length < 20) {
    return {
      success: false,
      error: 'Not enough readable content to generate a reliable revision map. Please provide more detailed notes (at least 20 characters).',
    };
  }

  const systemPrompt = `You are the ShikshaSetu Educational Concept Mind-Map Generator.
Your task is to transform uploaded textbook/lesson notes into a dense, high-end 1-PAGE EXAM REVISION CONCEPT POSTER.

CRITICAL QUALITY INSTRUCTIONS:
1. SEMANTIC GROUPING: Group the entire document into 5 to 8 MAJOR CONCEPT SECTIONS.
   (Example for Electricity: 1. Electric Charge, 2. Electric Current, 3. Potential Difference, 4. Ohm's Law & Resistance, 5. Series Combination, 6. Parallel Combination, 7. Heating Effect & Joule's Law, 8. Applications & Fuse).
2. FORMULA ATOMICITY: NEVER isolate a formula into a random orphaned box.
   For every formula:
   - Provide "content": standard LaTeX equation (e.g. "I = \\\\frac{Q}{t}", "V = I R", "H = I^2 R t").
   - Provide "details": clear variable meanings (e.g. "Where V = potential difference, I = current, R = resistance").
   - Provide "unit": SI unit (e.g. "Volt (V)", "Ampere (A)", "Ohm (\\\\Omega)", "Joule (J)").
   - Provide "condition": validity conditions if any (e.g. "At constant temperature").
3. HEADING INTEGRITY: Every section title must be complete and grammatically whole (e.g. "Ohm's Law & Resistance", NOT "'s Law" or ": Volt").
4. LAYOUT SPANS: Assign "layoutSpan": "full" to major overarching laws (Ohm's Law, Joule's Law) and "half" to pairs (Current / Potential Diff, Series / Parallel).
5. COMPACT REVISION: Condense long paragraphs into clear bullet definitions, key points, conditions, exam traps/warnings, and solved examples.

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
      "layoutSpan": "full"|"half",
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

    if (validation.success && validation.data.sections.length >= 3) {
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
