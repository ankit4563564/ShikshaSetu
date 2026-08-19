/**
 * ShikshaSetu — Document Ingestion, Normalization & Structural Evidence Parser
 * Extracts hierarchical outline evidence from academic notes (Units, Chapters, Sections, Subsections, Algorithm Steps, List Items).
 * Preserves mathematical Unicode symbols, comprehensive academic content, and tracks exact source spans.
 */

import { extractFormulaVault, findMatchingFormulaRefs } from './formulaVault';
import { extractTableVault } from './tableExtractor';
import type {
  StructuralEvidenceNode,
  DocumentStructureEvidence,
  SourceRef,
} from './types';

/**
 * Stage 1: Robust Text Normalizer.
 * Cleans OCR artifacts and page markers while preserving all mathematical Unicode symbols and numbering.
 */
export function normalizeDocumentText(rawText: string): {
  cleanedText: string;
  sourceSpans: SourceRef[];
} {
  if (!rawText || typeof rawText !== 'string') {
    return { cleanedText: '', sourceSpans: [] };
  }

  // 1. Normalize line endings & remove zero-width noise
  let text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 2. Strip page headers/footers and OCR artifacts like "[Page 1]", "Page 1 of 5", "--- Page 2 ---"
  text = text
    .replace(/\[\s*Page\s*\d+\s*(?:of\s*\d+)?\s*\]/gi, '')
    .replace(/---\s*Page\s*\d+\s*---/gi, '')
    .replace(/^Page\s*\d+\s*(?:of\s*\d+)?\s*$/gim, '');

  // 3. Clean trailing whitespace per line
  const lines = text.split('\n').map((l) => l.trimEnd());
  const cleaned = lines.join('\n').trim();

  // 4. Generate base source span
  const baseSpan: SourceRef = {
    id: 'src-root-doc',
    start: 0,
    end: cleaned.length,
    rawText: cleaned.slice(0, 200),
    type: 'text',
  };

  return {
    cleanedText: cleaned,
    sourceSpans: [baseSpan],
  };
}

/**
 * Structural outline classifier.
 * Analyzes line prefixes (Roman, Alphabetic, Numeric, Step, Bullets) to classify hierarchy level.
 */
interface PrefixMatch {
  prefix: string;
  title: string;
  level: number;
  type: 'unit' | 'section' | 'topic' | 'subtopic' | 'algorithm' | 'step' | 'list_item' | 'text';
  inlineBody?: string;
}

export function detectStructuralPrefix(line: string): PrefixMatch | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 2) return null;

  // Level 1: Unit / Chapter / Semester Course Root (e.g. "UNIT – 1", "UNIT 1:", "Chapter: Theory of Computation", "BCA 5th SEMESTER")
  const unitMatch = trimmed.match(/^(?:UNIT\s*[-–:]?\s*(\d+|[I|V|X]+)|Chapter\s*[:\-]\s*(.+)|(?:BCA|B\.Tech|B\.Sc|Class|Grade)\s*\d+.*)/i);
  if (unitMatch) {
    return {
      prefix: unitMatch[0],
      title: trimmed.replace(/^[#\-*\s]+/, '').replace(/^UNIT\s*[-–:]?\s*\d+\s*[:\-]?\s*/i, '').trim() || trimmed,
      level: 1,
      type: 'unit',
    };
  }

  // Algorithm Header (e.g. "Subset Construction Algorithm:", "Euclidean Algorithm:", "Conversion Procedure:")
  const algoMatch = trimmed.match(/^([^:\n]{3,65}(?:Algorithm|Procedure|Conversion Method|Construction Method|Method))\s*[:\-]?\s*$/i);
  if (algoMatch) {
    return {
      prefix: 'Algorithm',
      title: algoMatch[1].trim(),
      level: 3,
      type: 'algorithm',
    };
  }

  // Level 2: Major Section Numbering (e.g. "1. Formal Languages:", "2. Finite Automata:", "(a) Introduction", "I. Automata")
  const majorNumMatch = trimmed.match(/^(?:([0-9]{1,2})\.|\(([a-z])\)|([I|V|X]+)\.)\s+([A-Za-z0-9\s&,'\-\(\)\/]{3,80})(?::\s*(.*))?$/i);
  if (majorNumMatch) {
    return {
      prefix: majorNumMatch[1] ? `${majorNumMatch[1]}.` : majorNumMatch[2] ? `(${majorNumMatch[2]})` : `${majorNumMatch[3]}.`,
      title: majorNumMatch[4].replace(/[:\-#]+$/, '').trim(),
      level: 2,
      type: 'section',
      inlineBody: majorNumMatch[5]?.trim(),
    };
  }

  // Level 3: Subsection / Topic Numbering (e.g. "a. Alphabets: ...", "b. Strings: ...", "i) Formal Languages", "1.1 Alphabets")
  const subNumMatch = trimmed.match(/^(?:([a-z])[\.\)]|\(([0-9]{1,2})\)|([i|v|x]+)\)|\b(\d+\.\d+)\b)\s*([^:\n]{2,75})(?::\s*(.*))?$/i);
  if (subNumMatch) {
    const rawTitle = subNumMatch[5].replace(/[:\-#]+$/, '').trim();
    const isStep = /^Step\s*\d+/i.test(rawTitle);
    const isAlgo = /algorithm|procedure|conversion/i.test(rawTitle);

    return {
      prefix: subNumMatch[0].split(/\s+/)[0],
      title: rawTitle,
      level: isStep ? 4 : 3,
      type: isStep ? 'step' : isAlgo ? 'algorithm' : 'topic',
      inlineBody: subNumMatch[6]?.trim(),
    };
  }

  // Level 4: Algorithm Step (e.g. "Step 1: Create DFA states...", "Step 2: Initial state...")
  const stepMatch = trimmed.match(/^(?:Step\s*(\d+)[:\.]?|(\d+)\.\s*(?:Create|Determine|Initial|Compute|Final|Check|Add|Set|Repeat|While|For))\s*(.+)/i);
  if (stepMatch) {
    return {
      prefix: stepMatch[1] ? `Step ${stepMatch[1]}` : `Step`,
      title: stepMatch[3] ? stepMatch[3].trim() : trimmed,
      level: 4,
      type: 'step',
    };
  }

  // Level 5: List Items / Bullets / Keypoints (e.g. "• Automata Theory: Study of abstract state machines", "• Q is a finite set...")
  const bulletMatch = trimmed.match(/^(?:[•\*\-]|--)\s+(.+)/);
  if (bulletMatch) {
    const content = bulletMatch[1].trim();
    const colonIdx = content.indexOf(':');
    const bulletTitle = colonIdx > 2 && colonIdx < 40 ? content.slice(0, colonIdx).trim() : content;
    const inlineBody = colonIdx > 2 && colonIdx < 40 ? content.slice(colonIdx + 1).trim() : undefined;

    return {
      prefix: '•',
      title: bulletTitle,
      level: 5,
      type: 'list_item',
      inlineBody,
    };
  }

  return null;
}

/**
 * Stage 2: Structural Evidence Parser.
 * Builds the structural hierarchy evidence tree from normalized notes while preserving ALL academic details.
 */
export function parseDocumentStructure(
  title: string,
  rawText: string
): DocumentStructureEvidence {
  const { cleanedText, sourceSpans } = normalizeDocumentText(rawText);

  // Pre-extract formulas and tables into immutable vaults
  const formulaResult = extractFormulaVault(cleanedText);
  const tableResult = extractTableVault(formulaResult.sanitizedText);

  const allSourceSpans = [...sourceSpans, ...formulaResult.sourceSpans, ...tableResult.sourceSpans];

  const lines = tableResult.sanitizedText.split('\n');
  const rootNodes: StructuralEvidenceNode[] = [];

  let currentUnitNode: StructuralEvidenceNode | null = null;
  let currentSectionNode: StructuralEvidenceNode | null = null;
  let currentTopicNode: StructuralEvidenceNode | null = null;
  let currentAlgorithmNode: StructuralEvidenceNode | null = null;

  let nodeCounter = 1;
  let currentOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStart = currentOffset;
    currentOffset += line.length + 1;

    if (!line.trim()) continue;

    const prefixInfo = detectStructuralPrefix(line);

    // Extract formula references matching this line
    const matchedFormulaRefs = findMatchingFormulaRefs(line, formulaResult.vault);

    // Extract table references matching this line
    const tableRefMatch = line.match(/\[TABLE_REF:\s*(TABLE_\d+)\]/);
    const matchedTableRefs = tableRefMatch ? [tableRefMatch[1]] : [];

    const spanId = `src-node-${nodeCounter}`;
    const sourceSpan: SourceRef = {
      id: spanId,
      start: lineStart,
      end: lineStart + line.length,
      rawText: line,
      type: prefixInfo?.type === 'step' ? 'step' : prefixInfo?.type === 'algorithm' ? 'algorithm' : 'heading',
    };
    allSourceSpans.push(sourceSpan);

    if (prefixInfo) {
      const node: StructuralEvidenceNode = {
        id: `struct-node-${nodeCounter++}`,
        title: prefixInfo.title,
        level: prefixInfo.level,
        rawText: prefixInfo.inlineBody ? prefixInfo.inlineBody : line,
        numberingPrefix: prefixInfo.prefix,
        detectedType: prefixInfo.type,
        parentId: null,
        children: [],
        formulaRefs: matchedFormulaRefs,
        tableRefs: matchedTableRefs,
        sourceSpan,
      };

      if (prefixInfo.level === 1) {
        // Unit level
        currentUnitNode = node;
        currentSectionNode = null;
        currentTopicNode = null;
        currentAlgorithmNode = null;
        rootNodes.push(node);
      } else if (prefixInfo.level === 2) {
        // Major section level
        currentSectionNode = node;
        currentTopicNode = null;
        currentAlgorithmNode = null;
        if (currentUnitNode) {
          (node as any).parentId = currentUnitNode.id;
          currentUnitNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else if (prefixInfo.type === 'algorithm' || /subset\s*construction|algorithm|conversion/i.test(prefixInfo.title)) {
        // Algorithm node (Strictly preserved as type = 'algorithm')
        currentAlgorithmNode = node;
        currentTopicNode = node;
        if (currentSectionNode) {
          (node as any).parentId = currentSectionNode.id;
          currentSectionNode.children.push(node);
        } else if (currentUnitNode) {
          (node as any).parentId = currentUnitNode.id;
          currentUnitNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else if (prefixInfo.level === 3) {
        // Topic / Subsection level
        currentTopicNode = node;
        currentAlgorithmNode = null;
        if (currentSectionNode) {
          (node as any).parentId = currentSectionNode.id;
          currentSectionNode.children.push(node);
        } else if (currentUnitNode) {
          (node as any).parentId = currentUnitNode.id;
          currentUnitNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else if (prefixInfo.level === 4 || prefixInfo.type === 'step') {
        // Algorithm Step level (Strictly parented to enclosing algorithm node)
        const targetParent = currentAlgorithmNode || currentTopicNode || currentSectionNode;
        if (targetParent) {
          (node as any).parentId = targetParent.id;
          targetParent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        // List item / supporting bullet (Preserved in tree!)
        const targetParent = currentTopicNode || currentAlgorithmNode || currentSectionNode || currentUnitNode;
        if (targetParent) {
          (node as any).parentId = targetParent.id;
          targetParent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      }
    } else {
      // Descriptive content line: capture as a content child rather than dropping it!
      const activeNode = currentAlgorithmNode || currentTopicNode || currentSectionNode || currentUnitNode;
      if (activeNode) {
        const textNode: StructuralEvidenceNode = {
          id: `struct-node-${nodeCounter++}`,
          title: line.slice(0, 60).replace(/[:\-#]+$/, '').trim(),
          level: 6,
          rawText: line,
          detectedType: 'text',
          parentId: activeNode.id,
          children: [],
          formulaRefs: matchedFormulaRefs,
          tableRefs: matchedTableRefs,
          sourceSpan,
        };
        activeNode.children.push(textNode);
      }
    }
  }

  return {
    title: title || 'Academic Notes',
    rawText,
    cleanedText,
    rootNodes,
    sourceRefs: allSourceSpans,
    formulaVault: formulaResult.vault,
    tableVault: tableResult.vault,
  };
}
