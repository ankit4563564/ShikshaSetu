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
 * Stage 1: Robust Text Normalizer (GraphifyPDF content purification pattern).
 * Cleans OCR artifacts, PDF streams, HTML/CSS garbage, and page markers while preserving all mathematical Unicode symbols and numbering.
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

  // 2. Strip HTML/CSS tags, inline scripts, and stylesheets
  text = text
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ');

  // 3. Strip PDF internal stream objects, xref tables, and metadata tags
  text = text
    .replace(/\/Type\s*\/[A-Za-z0-9]+/gi, '')
    .replace(/\/Filter\s*\/[A-Za-z0-9]+/gi, '')
    .replace(/\bobj\b[\s\S]*?\bendobj\b/gi, '')
    .replace(/\bxref\b[\s\S]*?\btrailer\b/gi, '')
    .replace(/\bstream\b[\s\S]*?\bendstream\b/gi, '')
    .replace(/<<\s*\/[^\>]+>>/g, '');

  // 4. Strip page headers/footers and OCR artifacts like "[Page 1]", "Page 1 of 5", "--- Page 2 ---"
  text = text
    .replace(/\[\s*Page\s*\d+\s*(?:of\s*\d+)?\s*\]/gi, '')
    .replace(/---\s*Page\s*\d+\s*---/gi, '')
    .replace(/^Page\s*\d+\s*(?:of\s*\d+)?\s*$/gim, '');

  // 5. Clean trailing whitespace & filter out binary/base64 noise lines
  const lines = text.split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => {
      const trimmed = l.trim();
      if (!trimmed) return true; // keep blank line delimiters
      // Drop standalone binary/base64 garbage lines (over 40 chars without spaces and without math symbols)
      if (trimmed.length > 40 && !trimmed.includes(' ') && !/[=+\-*/\\{}\(\)ΣδερλΩπ]/.test(trimmed)) {
        return false;
      }
      return true;
    });

  const cleaned = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  // 6. Generate base source span
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
  pattern: 'unit' | 'chapter' | 'roman' | 'alphabetic' | 'numeric' | 'bullet' | 'step' | 'heading' | 'unknown' | 'text';
  inlineBody?: string;
}

export function detectStructuralPrefix(line: string): PrefixMatch | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 2) return null;

  // Level 1: Unit / Chapter / Semester Course Root (e.g. "UNIT – 1", "UNIT 1:", "Chapter: Theory of Computation", "BCA 5th SEMESTER")
  const unitMatch = trimmed.match(/^(?:UNIT\s*[-–:]?\s*(\d+|[I|V|X]+)|Chapter\s*[:\-]\s*(.+)|(?:BCA|B\.Tech|B\.Sc|Class|Grade)\s*\d+.*)/i);
  if (unitMatch) {
    const isChapter = trimmed.toLowerCase().includes('chapter');
    return {
      prefix: unitMatch[0],
      title: trimmed.replace(/^[#\-*\s]+/, '').replace(/^UNIT\s*[-–:]?\s*\d+\s*[:\-]?\s*/i, '').trim() || trimmed,
      level: 1,
      type: 'unit',
      pattern: isChapter ? 'chapter' : 'unit',
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
      pattern: 'heading',
    };
  }

  // Level 2: Major Section Numbering (e.g. "1. Formal Languages:", "2. Finite Automata:", "(a) Introduction", "I. Automata")
  const majorNumMatch = trimmed.match(/^(?:([0-9]{1,2})\.|\(([a-z])\)|([I|V|X]+)\.)\s+([A-Za-z0-9\s&,'\-\(\)\/]{3,80})(?::\s*(.*))?$/i);
  if (majorNumMatch) {
    const pat = majorNumMatch[1] ? 'numeric' : majorNumMatch[2] ? 'alphabetic' : 'roman';
    return {
      prefix: majorNumMatch[1] ? `${majorNumMatch[1]}.` : majorNumMatch[2] ? `(${majorNumMatch[2]})` : `${majorNumMatch[3]}.`,
      title: majorNumMatch[4].replace(/[:\-#]+$/, '').trim(),
      level: 2,
      type: 'section',
      pattern: pat,
      inlineBody: majorNumMatch[5]?.trim(),
    };
  }

  // Level 3: Subsection / Topic Numbering (e.g. "a. Alphabets: ...", "b. Strings: ...", "i) Formal Languages", "1.1 Alphabets")
  const subNumMatch = trimmed.match(/^(?:([a-z])[\.\)]|\(([0-9]{1,2})\)|([i|v|x]+)\b\)|\b(\d+\.\d+)\b)\s*([^:\n]{2,75})(?::\s*(.*))?$/i);
  if (subNumMatch) {
    const rawTitle = subNumMatch[5].replace(/[:\-#]+$/, '').trim();
    const isStep = /^Step\s*\d+/i.test(rawTitle);
    const isAlgo = /algorithm|procedure|conversion/i.test(rawTitle);
    const pat = subNumMatch[1] ? 'alphabetic' : subNumMatch[2] ? 'numeric' : subNumMatch[3] ? 'roman' : 'numeric';

    return {
      prefix: subNumMatch[0].split(/\s+/)[0],
      title: rawTitle,
      level: isStep ? 4 : 3,
      type: isStep ? 'step' : isAlgo ? 'algorithm' : 'topic',
      pattern: isStep ? 'step' : pat,
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
      pattern: 'step',
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
      pattern: 'bullet',
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

    if (prefixInfo) {
      const spanId = `src-node-${nodeCounter}`;
      const sourceSpan: SourceRef = {
        id: spanId,
        start: lineStart,
        end: lineStart + line.length,
        rawText: line,
        type: prefixInfo.type === 'step' ? 'step' : prefixInfo.type === 'algorithm' ? 'algorithm' : 'heading',
      };
      allSourceSpans.push(sourceSpan);

      // Check if active parent already has a child with the same normalized title
      const parentTarget =
        prefixInfo.level === 1
          ? null
          : prefixInfo.level === 2
          ? currentUnitNode
          : prefixInfo.type === 'algorithm'
          ? (currentSectionNode || currentUnitNode)
          : prefixInfo.level === 3
          ? (currentSectionNode || currentUnitNode)
          : (currentAlgorithmNode || currentTopicNode || currentSectionNode || currentUnitNode);

      const targetList = parentTarget ? parentTarget.children : rootNodes;
      const normTitle = prefixInfo.title.trim().toLowerCase();
      const existing = targetList.find((c) => c.title.trim().toLowerCase() === normTitle);

      if (existing) {
        // Merge refs and text instead of duplicating node
        if (prefixInfo.inlineBody) {
          (existing as any).rawText = (existing.rawText ? existing.rawText + '\n' : '') + prefixInfo.inlineBody;
        }
        if (matchedFormulaRefs.length > 0) {
          (existing as any).formulaRefs = Array.from(new Set([...(existing.formulaRefs || []), ...matchedFormulaRefs]));
        }
        if (matchedTableRefs.length > 0) {
          (existing as any).tableRefs = Array.from(new Set([...(existing.tableRefs || []), ...matchedTableRefs]));
        }
        continue;
      }

      const node: StructuralEvidenceNode = {
        id: `struct-node-${nodeCounter++}`,
        title: prefixInfo.title,
        level: prefixInfo.level,
        rawText: prefixInfo.inlineBody ? prefixInfo.inlineBody : line,
        numberingPrefix: prefixInfo.prefix,
        detectedType: prefixInfo.type,
        pattern: prefixInfo.pattern,
        parentId: parentTarget ? parentTarget.id : null,
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
      // Descriptive body sentence: append into active node's descriptive content and attach refs cleanly
      const activeNode = currentAlgorithmNode || currentTopicNode || currentSectionNode || currentUnitNode;
      if (activeNode) {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0) {
          (activeNode as any).rawText = activeNode.rawText ? `${activeNode.rawText}\n${trimmedLine}` : trimmedLine;
          if (matchedFormulaRefs.length > 0) {
            (activeNode as any).formulaRefs = Array.from(new Set([...(activeNode.formulaRefs || []), ...matchedFormulaRefs]));
          }
          if (matchedTableRefs.length > 0) {
            (activeNode as any).tableRefs = Array.from(new Set([...(activeNode.tableRefs || []), ...matchedTableRefs]));
          }
        }
      }
    }
  }

  // Fail-safe: if no structural headings were detected, split cleanedText into paragraphs and create virtual topic nodes under a section node
  if (rootNodes.length === 0) {
    const paragraphs = cleanedText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);

    if (paragraphs.length > 0) {
      const sectionNode: StructuralEvidenceNode = {
        id: `struct-node-vsec`,
        title: 'Key Concepts & Summary',
        level: 2,
        rawText: 'Key Concepts & Summary',
        detectedType: 'section',
        pattern: 'heading',
        parentId: null,
        children: [],
        formulaRefs: [],
        tableRefs: [],
        sourceSpan: {
          id: 'src-node-vsec',
          start: 0,
          end: Math.min(100, cleanedText.length),
          rawText: 'Key Concepts & Summary',
          type: 'heading',
        },
      };

      paragraphs.forEach((para, pIdx) => {
        const topicNode: StructuralEvidenceNode = {
          id: `struct-node-vtop-${pIdx}`,
          title: para.slice(0, 50).replace(/[:\-#\.]+$/, '').trim() || `Concept ${pIdx + 1}`,
          level: 3,
          rawText: para,
          detectedType: 'topic',
          pattern: 'heading',
          parentId: sectionNode.id,
          children: [],
          formulaRefs: findMatchingFormulaRefs(para, formulaResult.vault),
          tableRefs: [],
          sourceSpan: {
            id: `src-node-vtop-span-${pIdx}`,
            start: cleanedText.indexOf(para),
            end: cleanedText.indexOf(para) + para.length,
            rawText: para,
            type: 'text',
          },
        };
        sectionNode.children.push(topicNode);
      });

      rootNodes.push(sectionNode);
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
