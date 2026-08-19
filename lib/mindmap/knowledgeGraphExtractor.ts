/**
 * ShikshaSetu — Canonical Knowledge Graph & Mind Map Multi-Stage Extraction Engine
 * Multi-Stage Pipeline: Ingestion ➔ Structural Parsing ➔ Architect LLM ➔ Knowledge Synthesis ➔ Critic & Repair ➔ Mind Map Projection
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { safeValidateKnowledgeGraph } from './schema';
import { extractFormulaVault, resolveFormulaRefs, normalizeMathFormula, deduplicateFormulas } from './formulaVault';
import { extractTableVault, resolveTableRefs } from './tableExtractor';
import { parseDocumentStructure } from './documentStructureParser';
import { auditKnowledgeGraph, autoRepairKnowledgeGraph, validateSourceCoverage, runAICritic } from './criticEngine';
import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeRelationship,
  KnowledgeNodeType,
  SemanticImportance,
  ConceptMindMap,
  MindMapSection,
  MindMapItem,
  ConceptAccentColor,
  DocumentStructureEvidence,
  FormulaBlock,
} from './types';

export interface ExtractKnowledgeGraphOptions {
  title: string;
  subject?: string;
  grade?: string;
  notesText: string;
}

export interface ExtractKnowledgeGraphResult {
  success: boolean;
  knowledgeGraph?: KnowledgeGraph;
  mindMap?: ConceptMindMap;
  error?: string;
}

const ACCENT_PALETTE: ConceptAccentColor[] = ['blue', 'green', 'purple', 'orange', 'red', 'teal'];

/**
 * Classifies raw text chunks into explicit semantic node types based on linguistic and academic signals.
 */
export function classifySemanticRole(text: string, title?: string): {
  type: KnowledgeNodeType;
  importance: SemanticImportance;
} {
  const lower = (text + ' ' + (title || '')).toLowerCase();

  if (/^(?:step\s*\d+|create\s*dfa\s*states|initial\s*dfa\s*state|for\s*each\s*dfa\s*state|final\s*dfa\s*states)/i.test(text)) {
    return { type: 'algorithm_step', importance: 'medium' };
  }
  if (/subset\s*construction|algorithm|conversion\s*method|procedure/i.test(lower)) {
    return { type: 'algorithm', importance: 'critical' };
  }
  if (/theorem|kleene's|arden's|pythagorean/i.test(lower)) {
    return { type: 'theorem', importance: 'critical' };
  }
  if (/law|ohm's|joule's|newton's|coulomb/i.test(lower)) {
    return { type: 'law', importance: 'critical' };
  }
  if (/study\s*tip|exam\s*tip|preparation|key\s*takeaway/i.test(lower)) {
    return { type: 'study_tip', importance: 'low' };
  }
  if (/application|lexical\s*analyzer|pattern\s*matching|compiler|used\s*in/i.test(lower)) {
    return { type: 'application', importance: 'medium' };
  }
  if (/property|characteristic|exactly\s*one\s*transition|deterministic\s*behavior/i.test(lower)) {
    return { type: 'property', importance: 'medium' };
  }
  if (/[=\+\-\*\/\^\\_]/.test(text) && /\b[A-Za-z0-9_]\s*=|\\frac|\\delta|\(Q,\s*Σ|\\Sigma/.test(text)) {
    return { type: 'formula', importance: 'high' };
  }
  if (/is\s*defined\s*as|is\s*a\s*5-tuple|is\s*the\s*rate\s*of|is\s*work\s*done/i.test(lower)) {
    return { type: 'definition', importance: 'high' };
  }

  return { type: 'topic', importance: 'medium' };
}

/**
 * Deterministic Fallback Pipeline:
 * Constructs a fully valid Canonical KnowledgeGraph from the structural evidence tree when AI is unavailable.
 */
export function deriveDeterministicKnowledgeGraphFromNotes(
  title: string,
  subject: string,
  grade: string,
  notesText: string
): KnowledgeGraph {
  const evidence: DocumentStructureEvidence = parseDocumentStructure(title, notesText);
  const rootId = 'node-chapter-root';

  const nodes: KnowledgeNode[] = [
    {
      id: rootId,
      parentId: null,
      title: evidence.title || 'Course Chapter',
      type: 'root',
      importance: 'critical',
      summary: `Canonical semantic knowledge graph for ${evidence.title}.`,
      keyPoints: [],
      sourceRefs: ['src-root-doc'],
    },
  ];

  const relationships: KnowledgeRelationship[] = [];
  let nodeCounter = 1;

  function processEvidenceNode(
    evNode: any,
    parentId: string,
    depth: number,
    sectionPath: string[] = []
  ) {
    const cleanTitle = evNode.title || 'Key Concept';
    const isStep = evNode.detectedType === 'step' || /^Step\s*\d+/i.test(cleanTitle);
    const isAlgo = evNode.detectedType === 'algorithm' || /subset\s*construction|algorithm|conversion/i.test(cleanTitle);
    const isTheorem = /theorem|law/i.test(cleanTitle);
    const isListItem = evNode.detectedType === 'list_item';

    const nodeType: KnowledgeNodeType = isStep
      ? 'algorithm_step'
      : isAlgo
      ? 'algorithm'
      : isTheorem
      ? 'theorem'
      : isListItem
      ? 'property'
      : depth === 1
      ? 'section'
      : 'topic';

    const nodeId = `node-${nodeType}-${nodeCounter++}`;
    const formulas = resolveFormulaRefs(evNode.formulaRefs || [], evidence.formulaVault);
    const tables = resolveTableRefs(evNode.tableRefs || [], evidence.tableVault);

    const definitionText = evNode.rawText &&
      !evNode.rawText.startsWith('1.') &&
      !evNode.rawText.startsWith('2.') &&
      !evNode.rawText.startsWith('3.') &&
      !evNode.rawText.startsWith('4.') &&
      !evNode.rawText.startsWith('5.') &&
      !evNode.rawText.startsWith('UNIT') &&
      !evNode.rawText.startsWith('Chapter') &&
      evNode.rawText !== cleanTitle
      ? evNode.rawText
      : undefined;

    const currentPath = [...sectionPath, cleanTitle];

    const kNode: KnowledgeNode = {
      id: nodeId,
      parentId,
      title: cleanTitle,
      type: nodeType,
      importance: isAlgo || isTheorem || depth <= 2 ? 'high' : 'medium',
      summary: definitionText,
      definitions: definitionText ? [definitionText] : [],
      formulas: formulas.length > 0 ? formulas : undefined,
      formulaRefs: evNode.formulaRefs,
      table: tables.length > 0 ? tables[0] : undefined,
      tableRefs: evNode.tableRefs,
      sourceRefs: [evNode.sourceSpan.id],
      context: {
        sourceSpanId: evNode.sourceSpan.id,
        outlineNodeId: evNode.id,
        parentKnowledgeNodeId: parentId,
        sectionPath: currentPath,
      },
      steps: isAlgo ? [] : undefined,
    };

    nodes.push(kNode);

    relationships.push({
      fromNodeId: parentId,
      toNodeId: nodeId,
      type: isStep ? 'has_step' : isAlgo ? 'uses_algorithm' : 'contains',
      label: isStep ? 'Algorithm Step' : 'Child concept',
    });

    if (evNode.children && evNode.children.length > 0) {
      for (const child of evNode.children) {
        processEvidenceNode(child, nodeId, depth + 1, currentPath);
      }
    }
  }

  // Process root structural nodes
  if (evidence.rootNodes.length > 0) {
    for (const topNode of evidence.rootNodes) {
      processEvidenceNode(topNode, rootId, 1, [evidence.title]);
    }
  }

  // Cross-link semantic relationships
  for (let i = 1; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];

      if (
        (n1.title.toLowerCase().includes('dfa') && n2.title.toLowerCase().includes('nfa')) ||
        (n1.title.toLowerCase().includes('series') && n2.title.toLowerCase().includes('parallel'))
      ) {
        relationships.push({
          fromNodeId: n1.id,
          toNodeId: n2.id,
          type: 'compared_with',
          label: 'Compared with',
        });
      } else if (
        n1.title.toLowerCase().includes('equivalence') && n2.type === 'algorithm'
      ) {
        relationships.push({
          fromNodeId: n1.id,
          toNodeId: n2.id,
          type: 'uses_algorithm',
          label: 'Solved via Subset Construction',
        });
      }
    }
  }

  const rawGraph: KnowledgeGraph = {
    title: evidence.title,
    subject: subject || 'Computer Science',
    grade: grade || 'University',
    summary: `Canonical semantic knowledge graph for ${evidence.title}.`,
    nodes,
    relationships,
    formulas: evidence.formulaVault,
    tables: evidence.tableVault,
    sourceRefs: evidence.sourceRefs,
  };

  // Run auto-repair to guarantee zero orphan steps and resolve all vaulted formulas
  return autoRepairKnowledgeGraph(rawGraph, evidence);
}

/**
 * Bridges a Canonical KnowledgeGraph into ConceptMindMap format for visual rendering.
 * Strictly guarantees that child concepts remain nested under their parent nodes,
 * using parentId relationships from the KnowledgeGraph as the single source of truth.
 */
export function convertKnowledgeGraphToMindMap(graph: KnowledgeGraph): ConceptMindMap {
  const rootNode = graph.nodes.find((n) => n.type === 'root' || n.type === 'chapter' || n.parentId === null) || graph.nodes[0];
  const rootId = rootNode ? rootNode.id : null;

  // 1. Top-level section cards are the direct children of the root node or major section nodes
  let sectionNodes = graph.nodes.filter((n) => n.id !== rootId && (n.parentId === rootId || n.type === 'section' || n.type === 'unit'));

  // Fallback: If no direct root children exist, group by top-level parentless nodes
  if (sectionNodes.length === 0) {
    const parentIdSet = new Set(graph.nodes.map((n) => n.parentId).filter(Boolean));
    sectionNodes = graph.nodes.filter((n) => n.id !== rootId && !parentIdSet.has(n.id));
  }

  if (sectionNodes.length === 0) {
    sectionNodes = graph.nodes.filter((n) => n.id !== rootId);
  }

  // Recursive item builder for child nodes
  function buildItemsForNode(parentNodeId: string): MindMapItem[] {
    // Exclude algorithm_step from being rendered as standalone child items to avoid duplication
    const childNodes = graph.nodes.filter((n) => n.parentId === parentNodeId && n.type !== 'algorithm_step');
    const items: MindMapItem[] = [];

    for (const child of childNodes) {
      const grandChildren = buildItemsForNode(child.id);

      // Extract algorithm steps if this is an algorithm node
      const stepNodes = graph.nodes.filter((n) => n.parentId === child.id && n.type === 'algorithm_step');
      const allSteps = (child.steps && child.steps.length > 0)
        ? child.steps
        : stepNodes.map((s) => s.definitions?.[0] || s.title);

      const itemChildren: MindMapItem[] = [...grandChildren];

      // Add child formulas as sub-items (resolving from vault)
      let childFormulas: FormulaBlock[] = child.formulas || [];
      if (child.formulaRefs && graph.formulas) {
        const vaultFormulas = resolveFormulaRefs(child.formulaRefs, graph.formulas);
        childFormulas = [...childFormulas, ...vaultFormulas];
      }

      if (childFormulas.length > 0) {
        const deduped = deduplicateFormulas(childFormulas);
        deduped.forEach((f, fIdx) => {
          itemChildren.unshift({
            id: `${child.id}-form-${fIdx}`,
            type: 'formula',
            content: f.latex,
            details: f.variables || f.meaning,
            unit: f.unit,
            condition: f.condition,
          });
        });
      }

      // Add table if present
      if (child.table) {
        itemChildren.push({
          id: `${child.id}-tbl`,
          type: 'table',
          title: child.table.title || 'Comparison Table',
          content: child.table.headers.join(' | '),
          table: child.table,
        });
      }

      // Add algorithm process as sub-item
      if (allSteps.length > 0) {
        itemChildren.push({
          id: `${child.id}-algo-steps`,
          type: 'process',
          content: `${child.title} (${allSteps.length} Steps)`,
          details: allSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        });
      }

      items.push({
        id: `item-${child.id}`,
        type: (child.type === 'algorithm' ? 'process' : child.type === 'theorem' || child.type === 'law' ? 'concept' : 'concept') as any,
        title: child.title,
        content: child.title,
        details: child.definitions?.[0] || child.summary,
        table: child.table,
        children: itemChildren.length > 0 ? itemChildren : undefined,
      });
    }

    return items;
  }

  const sections: MindMapSection[] = [];

  for (let idx = 0; idx < sectionNodes.length; idx++) {
    const node = sectionNodes[idx];
    const items: MindMapItem[] = [];

    // 1. Section definition
    if (node.definitions && node.definitions.length > 0) {
      node.definitions.forEach((def, dIdx) => {
        if (def && def !== node.title) {
          items.push({
            id: `${node.id}-def-${dIdx}`,
            type: 'definition',
            content: def,
          });
        }
      });
    }

    // 2. Section formulas
    let nodeFormulas: FormulaBlock[] = node.formulas || [];
    if (node.formulaRefs && graph.formulas) {
      const vaultFormulas = resolveFormulaRefs(node.formulaRefs, graph.formulas);
      nodeFormulas = [...nodeFormulas, ...vaultFormulas];
    }

    if (nodeFormulas.length > 0) {
      const deduped = deduplicateFormulas(nodeFormulas);
      deduped.forEach((f, fIdx) => {
        items.push({
          id: `${node.id}-form-${fIdx}`,
          type: 'formula',
          content: f.latex,
          details: f.variables || f.meaning,
          unit: f.unit,
          condition: f.condition,
        });
      });
    }

    // 3. Section properties
    if (node.properties && node.properties.length > 0) {
      node.properties.forEach((prop, pIdx) => {
        items.push({
          id: `${node.id}-prop-${pIdx}`,
          type: 'key_point',
          content: `Property: ${prop}`,
        });
      });
    }

    // 4. Algorithm steps on the section node itself
    const directSteps = graph.nodes.filter((n) => n.parentId === node.id && n.type === 'algorithm_step');
    const allDirectSteps = (node.steps && node.steps.length > 0)
      ? node.steps
      : directSteps.map((s) => s.definitions?.[0] || s.title);

    if (allDirectSteps.length > 0 && node.type === 'algorithm') {
      items.push({
        id: `${node.id}-algo-process`,
        type: 'process',
        content: `Algorithm: ${node.title} — ${allDirectSteps.length} Steps`,
        details: allDirectSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      });
    }

    // 5. Nested child concepts & subconcepts (preserving hierarchy)
    const nestedChildItems = buildItemsForNode(node.id);
    items.push(...nestedChildItems);

    // 6. Section Table if present
    if (node.table) {
      items.push({
        id: `${node.id}-tbl`,
        type: 'table',
        title: node.table.title || 'Table',
        content: node.table.headers.join(' | '),
        table: node.table,
      });
    }

    // 7. Key points & applications
    if (node.keyPoints && node.keyPoints.length > 0) {
      node.keyPoints.forEach((kp, kpIdx) => {
        items.push({
          id: `${node.id}-kp-${kpIdx}`,
          type: 'key_point',
          content: kp,
        });
      });
    }

    if (node.applications && node.applications.length > 0) {
      node.applications.forEach((app, aIdx) => {
        items.push({
          id: `${node.id}-app-${aIdx}`,
          type: 'example',
          content: `Application: ${app}`,
        });
      });
    }

    if (items.length === 0) {
      items.push({
        id: `${node.id}-default`,
        type: 'concept',
        content: node.summary || node.title,
      });
    }

    const isMajor =
      node.importance === 'critical' ||
      node.importance === 'high' ||
      node.type === 'theorem' ||
      node.type === 'law' ||
      node.type === 'section' ||
      node.type === 'unit';

    sections.push({
      id: `sec-${node.id}`,
      title: node.title,
      accentColor: ACCENT_PALETTE[sections.length % ACCENT_PALETTE.length],
      importance: node.importance,
      layoutSpan: isMajor ? 'full' : 'half',
      summary: node.summary,
      definition: node.definitions?.[0],
      formulas: nodeFormulas.length > 0 ? deduplicateFormulas(nodeFormulas) : [],
      keyPoints: node.keyPoints,
      items,
      relatedSectionIds: graph.relationships
        .filter((r) => r.fromNodeId === node.id || r.toNodeId === node.id)
        .map((r) => (r.fromNodeId === node.id ? `sec-${r.toNodeId}` : `sec-${r.fromNodeId}`)),
    });
  }

  // Filter relationship connections to existing section IDs
  const sectionIdSet = new Set(sections.map((s) => s.id));
  const relationships = graph.relationships
    .filter((r) => sectionIdSet.has(`sec-${r.fromNodeId}`) && sectionIdSet.has(`sec-${r.toNodeId}`))
    .map((r) => ({
      fromSectionId: `sec-${r.fromNodeId}`,
      toSectionId: `sec-${r.toNodeId}`,
      label: r.label,
      type: (r.type === 'equivalent_to' || r.type === 'compared_with' ? 'contrasts_with' : r.type === 'leads_to' ? 'derives' : 'depends_on') as any,
    }));

  const mindMap: ConceptMindMap = {
    title: graph.title,
    subject: graph.subject,
    grade: graph.grade,
    summary: graph.summary,
    sections: sections.slice(0, 12),
    relationships,
    sourceReferences: graph.sourceReferences,
    knowledgeGraph: graph,
  };

  console.log(
    `[MindMap] ${mindMap.title}: ${mindMap.sections.length} sections →`,
    mindMap.sections.map((s) => `"${s.title}" (${s.items.length} items)`).join(', ')
  );

  return mindMap;
}

/**
 * Stage 3 & 4: Architect LLM Call & Knowledge Synthesis.
 * Extracts academic knowledge hierarchy while referencing immutable Formula and Table Vaults.
 */
export async function extractKnowledgeGraphFromText(
  options: ExtractKnowledgeGraphOptions
): Promise<ExtractKnowledgeGraphResult> {
  const { title, subject = 'Computer Science', grade = 'University', notesText } = options;

  if (!notesText || notesText.trim().length < 20) {
    return {
      success: false,
      error: 'Not enough readable content to generate a knowledge graph. Please provide at least 20 characters.',
    };
  }

  // 1. Evidence Extraction & Vaulting
  const evidence = parseDocumentStructure(title, notesText);

  const systemPrompt = `You are ShikshaSetu's Academic Knowledge Architect Engine.
Your task is to understand and reconstruct the academic structure of the provided notes into a canonical Knowledge Graph.

CRITICAL RULES:
1. STRUCTURE & HIERARCHY:
   - Identify: ROOT ➔ UNIT ➔ MAJOR SECTIONS ➔ TOPICS ➔ SUBTOPICS.
   - Algorithms/Procedures: An algorithm is ONE node. Its steps are strictly child nodes under it (type: "algorithm_step").
   - Group basic operators, theorems, laws, and definitions under their appropriate topic.
2. IMMUTABLE FORMULAS & TABLES:
   - Reference formula vault IDs (e.g. "formulaRefs": ["FORMULA_1", "FORMULA_2"]) rather than writing raw formulas.
   - Reference table vault IDs (e.g. "tableRefs": ["TABLE_1"]) if tables exist.
3. ACADEMIC SYNTHESIS:
   - One concept = one meaningful idea. Do not fragment sentences across concepts.
   - Attach properties, definitions, applications, and examples to the node they describe.

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema with NO markdown fences:
{
  "title": "string",
  "summary": "string",
  "children": [
    {
      "title": "string",
      "summary": "string",
      "priority": "high"|"medium"|"low",
      "formulaRefs": ["string"],
      "tableRefs": ["string"],
      "children": []
    }
  ]
}`;

  const userMessage = JSON.stringify({
    title: evidence.title,
    subject,
    grade,
    structuralOutline: evidence.rootNodes.map((r) => ({
      title: r.title,
      type: r.detectedType,
      formulaRefs: r.formulaRefs,
      tableRefs: r.tableRefs,
    })),
    vaultedFormulas: evidence.formulaVault.map((f) => ({ id: f.id, raw: f.raw, meaning: f.meaning })),
    vaultedTables: evidence.tableVault.map((t) => ({ id: t.id, columns: t.columns })),
    uploadedNotesContent: evidence.cleanedText.slice(0, 5000),
  });

  const aiProvider = new ResilientAIProvider();

  try {
    const response = await aiProvider.generateCompletion({
      systemPrompt,
      userMessage,
      temperature: 0.15,
      maxTokens: 3800,
    });

    const cleanText = response.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsedJson = JSON.parse(cleanText);
    const validation = safeValidateKnowledgeGraph(parsedJson);

    if (validation.success && validation.data.nodes.length >= 3) {
      // Stage 5: Critic Audit & Auto-Repair
      const repairedGraph = autoRepairKnowledgeGraph(validation.data, evidence);
      const mindMap = convertKnowledgeGraphToMindMap(repairedGraph);

      return {
        success: true,
        knowledgeGraph: repairedGraph,
        mindMap,
      };
    } else {
      console.warn('[KnowledgeGraphExtractor] AI output failed validation, using deterministic fallback parser:', validation.error);
      const derived = deriveDeterministicKnowledgeGraphFromNotes(title, subject, grade, notesText);
      const mindMap = convertKnowledgeGraphToMindMap(derived);
      return { success: true, knowledgeGraph: derived, mindMap };
    }
  } catch (err: any) {
    console.warn('[KnowledgeGraphExtractor] AI Provider call failed, using deterministic fallback parser:', err?.message);
    const derived = deriveDeterministicKnowledgeGraphFromNotes(title, subject, grade, notesText);
    const mindMap = convertKnowledgeGraphToMindMap(derived);
    return { success: true, knowledgeGraph: derived, mindMap };
  }
}
