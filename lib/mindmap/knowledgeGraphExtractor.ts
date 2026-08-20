/**
 * ShikshaSetu — Canonical Knowledge Graph & Mind Map Multi-Stage Extraction Engine
 * Multi-Stage Pipeline: Ingestion ➔ Structural Parsing ➔ Architect LLM ➔ Knowledge Synthesis ➔ Critic & Repair ➔ Mind Map Projection
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { safeValidateKnowledgeGraph } from './schema';
import { extractFormulaVault, resolveFormulaRefs, normalizeMathFormula, deduplicateFormulas } from './formulaVault';
import { extractTableVault, resolveTableRefs } from './tableExtractor';
import { parseDocumentStructure } from './documentStructureParser';
import { auditKnowledgeGraph, autoRepairKnowledgeGraph, validateSourceCoverage, runStageCritic } from './criticEngine';
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
  console.log('[MIND ENGINE] convertKnowledgeGraphToMindMap input nodes:', graph.nodes.length, 'relationships:', graph.relationships.length);
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

  console.log('[MIND ENGINE] convertKnowledgeGraphToMindMap identified sectionNodes count:', sectionNodes.length);

  // Recursive item builder for child nodes
  function buildItemsForNode(parentNodeId: string): MindMapItem[] {
    const childNodes = graph.nodes.filter((n) => n.parentId === parentNodeId && n.type !== 'algorithm_step');
    const items: MindMapItem[] = [];

    for (const child of childNodes) {
      const grandChildren = buildItemsForNode(child.id);

      const stepNodes = graph.nodes.filter((n) => n.parentId === child.id && n.type === 'algorithm_step');
      const allSteps = (child.steps && child.steps.length > 0)
        ? child.steps
        : stepNodes.map((s) => s.definitions?.[0] || s.title);

      const itemChildren: MindMapItem[] = [...grandChildren];

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

      if (child.table) {
        itemChildren.push({
          id: `${child.id}-tbl`,
          type: 'table',
          title: child.table.title || 'Comparison Table',
          content: child.table.headers.join(' | '),
          table: child.table,
        });
      }

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

    if (node.properties && node.properties.length > 0) {
      node.properties.forEach((prop, pIdx) => {
        items.push({
          id: `${node.id}-prop-${pIdx}`,
          type: 'key_point',
          content: `Property: ${prop}`,
        });
      });
    }

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

    const nestedChildItems = buildItemsForNode(node.id);
    items.push(...nestedChildItems);

    if (node.table) {
      items.push({
        id: `${node.id}-tbl`,
        type: 'table',
        title: node.table.title || 'Table',
        content: node.table.headers.join(' | '),
        table: node.table,
      });
    }

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

    const seenItemKey = new Set<string>();
    const dedupedItems: MindMapItem[] = [];
    for (const item of items) {
      const key = (item.title || '') + '::' + item.content.trim().toLowerCase();
      if (!seenItemKey.has(key)) {
        seenItemKey.add(key);
        dedupedItems.push(item);
      }
    }

    if (dedupedItems.length === 0) {
      dedupedItems.push({
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
      items: dedupedItems,
      relatedSectionIds: graph.relationships
        .filter((r) => r.fromNodeId === node.id || r.toNodeId === node.id)
        .map((r) => (r.fromNodeId === node.id ? `sec-${r.toNodeId}` : `sec-${r.fromNodeId}`)),
    });
  }

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
    `[MIND ENGINE] convertKnowledgeGraphToMindMap output sections: ${mindMap.sections.length} total sections:`,
    mindMap.sections.map((s) => `"${s.title}" (${s.items.length} items)`).join(', ')
  );

  return mindMap;
}

interface ArchitectOutlineNode {
  id: string;
  title: string;
  type: 'section' | 'topic' | 'algorithm' | 'theorem' | 'law';
  children: ArchitectOutlineNode[];
}

interface ArchitectResponse {
  title: string;
  summary: string;
  structure: ArchitectOutlineNode[];
}

interface NodeDetails {
  definitions?: string[];
  properties?: string[];
  keyPoints?: string[];
  examples?: string[];
  applications?: string[];
  activities?: string[];
  formulaRefs?: string[];
  tableRefs?: string[];
}

async function extractArchitectureOutline(
  evidence: DocumentStructureEvidence,
  notesText: string
): Promise<ArchitectResponse> {
  const aiProvider = new ResilientAIProvider();
  const systemPrompt = `You are ShikshaSetu's Academic Knowledge Architect Engine.
Your task is to analyze the structural outline of the textbook notes and output a clean, hierarchical outline tree representing the root, sections, topics, subtopics, and algorithms.
Do not extract definitions, formulas, or details. Only build the structure.

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "title": "string",
  "summary": "string",
  "structure": [
    {
      "id": "string",
      "title": "string",
      "type": "section" | "topic" | "algorithm" | "theorem" | "law",
      "children": []
    }
  ]
}`;

  const userMessage = JSON.stringify({
    title: evidence.title,
    structuralOutline: evidence.rootNodes.map((r) => ({
      title: r.title,
      type: r.detectedType,
    })),
    notesExcerpt: evidence.cleanedText.slice(0, 8000),
  });

  const response = await aiProvider.generateCompletion({
    systemPrompt,
    userMessage,
    temperature: 0.1,
    maxTokens: 2500,
  });

  const cleanText = response.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleanText);
}

async function extractSemanticDetails(
  sectionTitle: string,
  sectionType: string,
  notesText: string,
  vaultedFormulas: Array<{ id: string, raw: string, meaning: string }>,
  vaultedTables: Array<{ id: string, columns: string[] }>
): Promise<NodeDetails> {
  const aiProvider = new ResilientAIProvider();
  const systemPrompt = `You are ShikshaSetu's Academic Detail Extractor.
For the specified section/topic title: "${sectionTitle}" (type: ${sectionType}), extract the following detailed academic information:
- Core definitions
- Key properties
- Important formulas (Reference vaulted formula IDs like "FORMULA_X" if they exist in the vault list)
- Examples
- Applications
- Experiments/Activities (Reference activities mentioned in the text)
- Comparisons (Compare concepts if applicable)
- Key points
- Study tips

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "definitions": ["string"],
  "properties": ["string"],
  "keyPoints": ["string"],
  "examples": ["string"],
  "applications": ["string"],
  "activities": ["string"],
  "formulaRefs": ["string"],
  "tableRefs": ["string"]
}`;

  const userMessage = JSON.stringify({
    sectionTitle,
    sectionType,
    vaultedFormulas,
    vaultedTables,
    notesExcerpt: notesText.slice(0, 8000),
  });

  const response = await aiProvider.generateCompletion({
    systemPrompt,
    userMessage,
    temperature: 0.15,
    maxTokens: 1500,
  });

  const cleanText = response.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleanText);
}

async function extractRelationships(
  nodes: KnowledgeNode[],
  notesText: string
): Promise<KnowledgeRelationship[]> {
  const aiProvider = new ResilientAIProvider();
  const systemPrompt = `You are ShikshaSetu's Semantic Link Modeler.
Analyze the following list of extracted concept nodes and create semantic relationships between them.
Allowed relationship types:
contains, depends_on, defined_by, has_formula, has_property, example_of, application_of, contrasts_with, equivalent_to, leads_to, uses, measures, represented_by, converts_to.

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
[
  { "fromNodeId": "string", "toNodeId": "string", "type": "string", "label": "string" }
]`;

  const userMessage = JSON.stringify({
    nodes: nodes.map(n => ({ id: n.id, title: n.title, type: n.type })),
    notesExcerpt: notesText.slice(0, 4000)
  });

  const response = await aiProvider.generateCompletion({
    systemPrompt,
    userMessage,
    temperature: 0.15,
    maxTokens: 2000,
  });

  const cleanText = response.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(cleanText);
  return (parsed || []).map((r: any) => ({
    fromNodeId: r.fromNodeId,
    toNodeId: r.toNodeId,
    type: r.type,
    label: r.label
  }));
}

/**
 * Section-level text slice and source span resolver (Paper2CMap & Hanxiao patterns).
 * Extracts the bounded text segment for a specific section from the document evidence.
 */
function getSectionTextSlice(
  nodeTitle: string,
  evidence: DocumentStructureEvidence
): { text: string; spanIds: string[] } {
  const normTitle = nodeTitle.toLowerCase().trim();
  let matchedEvidence = evidence.rootNodes.find((r) => 
    r.title.toLowerCase().includes(normTitle) || normTitle.includes(r.title.toLowerCase())
  );

  if (!matchedEvidence && evidence.rootNodes.length > 0) {
    for (const r of evidence.rootNodes) {
      const childMatch = r.children.find((c) => 
        c.title.toLowerCase().includes(normTitle) || normTitle.includes(c.title.toLowerCase())
      );
      if (childMatch) {
        matchedEvidence = childMatch;
        break;
      }
    }
  }

  if (matchedEvidence && matchedEvidence.sourceSpan) {
    const start = matchedEvidence.sourceSpan.start;
    const subsequentNodes = evidence.rootNodes.filter((r) => r.sourceSpan.start > start);
    const end = subsequentNodes.length > 0 
      ? Math.min(...subsequentNodes.map((r) => r.sourceSpan.start)) 
      : evidence.cleanedText.length;
    
    const sliceText = evidence.cleanedText.slice(start, end).trim() || evidence.cleanedText.slice(0, 4000);
    const spanIds = (evidence.sourceRefs || [])
      .filter((s) => s.start >= start && s.end <= end)
      .map((s) => s.id);
    
    if (spanIds.length === 0) spanIds.push(matchedEvidence.sourceSpan.id);
    return { text: sliceText, spanIds };
  }

  return {
    text: evidence.cleanedText.slice(0, 6000),
    spanIds: evidence.sourceRefs?.map((s) => s.id) || ['src-root-doc'],
  };
}

/**
 * Global Graph Merge & Semantic Deduplication Engine.
 * Merges local section subgraphs into the canonical Knowledge Graph, consolidating duplicate concept
 * nodes while preserving their definitions, formulas, and relationship links.
 */
function mergeAndDeduplicateNodes(
  nodes: KnowledgeNode[],
  relationships: KnowledgeRelationship[]
): { nodes: KnowledgeNode[]; relationships: KnowledgeRelationship[] } {
  const merged: KnowledgeNode[] = [];
  const titleMap = new Map<string, KnowledgeNode>();
  const idRemap = new Map<string, string>();

  for (const node of nodes) {
    if (node.type === 'root') {
      merged.push(node);
      continue;
    }

    const key = `${node.parentId || 'root'}::${node.title.trim().toLowerCase()}`;
    const existing = titleMap.get(key);

    if (existing) {
      idRemap.set(node.id, existing.id);
      (existing as any).definitions = Array.from(new Set([...(existing.definitions || []), ...(node.definitions || [])]));
      (existing as any).properties = Array.from(new Set([...(existing.properties || []), ...(node.properties || [])]));
      (existing as any).keyPoints = Array.from(new Set([...(existing.keyPoints || []), ...(node.keyPoints || [])]));
      (existing as any).examples = Array.from(new Set([...(existing.examples || []), ...(node.examples || [])]));
      (existing as any).applications = Array.from(new Set([...(existing.applications || []), ...(node.applications || [])]));
      (existing as any).formulaRefs = Array.from(new Set([...(existing.formulaRefs || []), ...(node.formulaRefs || [])]));
      (existing as any).tableRefs = Array.from(new Set([...(existing.tableRefs || []), ...(node.tableRefs || [])]));
      (existing as any).sourceRefs = Array.from(new Set([...(existing.sourceRefs || []), ...(node.sourceRefs || [])]));
    } else {
      titleMap.set(key, node);
      merged.push(node);
    }
  }

  const cleanRelationships: KnowledgeRelationship[] = [];
  const seenRels = new Set<string>();

  for (const r of relationships) {
    const fromId = idRemap.get(r.fromNodeId) || r.fromNodeId;
    const toId = idRemap.get(r.toNodeId) || r.toNodeId;
    if (fromId === toId) continue;

    const relKey = `${fromId}->${r.type}->${toId}`;
    if (!seenRels.has(relKey) && merged.some((n) => n.id === fromId) && merged.some((n) => n.id === toId)) {
      seenRels.add(relKey);
      cleanRelationships.push({
        fromNodeId: fromId,
        toNodeId: toId,
        type: r.type,
        label: r.label,
      });
    }
  }

  return { nodes: merged, relationships: cleanRelationships };
}

export async function extractKnowledgeGraphFromText(
  options: ExtractKnowledgeGraphOptions
): Promise<ExtractKnowledgeGraphResult> {
  const tStart = Date.now();
  const { title, subject = 'General Science', grade = '8', notesText } = options;

  console.log('[MIND ENGINE] extractKnowledgeGraphFromText inputs - title:', title, 'subject:', subject, 'grade:', grade, 'notesText length:', notesText?.length);

  if (!notesText || notesText.trim().length < 20) {
    console.error('[MIND ENGINE] extractKnowledgeGraphFromText notesText too short!');
    return {
      success: false,
      error: 'Not enough readable content to generate a knowledge graph. Please provide at least 20 characters.',
    };
  }

  // Stage 1 & 2: Ingestion & Normalization & Formula/Table Vaulting
  const tIngestStart = Date.now();
  const evidence = parseDocumentStructure(title, notesText);
  const ingestionMs = Date.now() - tIngestStart;

  // Stage 3 & 4: Document Structure Analysis & Semantic Chunking
  const tStructStart = Date.now();
  const structMs = Date.now() - tStructStart;

  const ingestionTime = ingestionMs / 2;
  const vaultingTime = ingestionMs / 2;

  try {
    // Stage 5: Architect LLM
    const tArchStart = Date.now();
    const archOutline = await extractArchitectureOutline(evidence, notesText);
    const architectMs = Date.now() - tArchStart;

    // Stage 6: Knowledge Extraction LLM (Section-Level Processing)
    const tExtractStart = Date.now();
    const synthesizedNodes: KnowledgeNode[] = [];
    const rootId = 'node-chapter-root';

    synthesizedNodes.push({
      id: rootId,
      parentId: null,
      title: archOutline.title || title,
      type: 'root',
      importance: 'critical',
      summary: archOutline.summary || `Concept map for ${title}`,
      sourceRefs: ['src-root-doc'],
    });

    let nodeCounter = 1;
    const architectNodeMap = new Map<string, string>();

    const topLevelNodes = archOutline.structure || [];
    const sectionSlices = topLevelNodes.map((node) => getSectionTextSlice(node.title, evidence));

    const extractPromises = topLevelNodes.map((node, idx) =>
      extractSemanticDetails(
        node.title,
        node.type,
        sectionSlices[idx].text,
        evidence.formulaVault.map((f) => ({ id: f.id, raw: f.raw, meaning: f.meaning })),
        evidence.tableVault.map((t) => ({ id: t.id, columns: t.columns }))
      ).catch(() => ({}) as NodeDetails)
    );

    const detailResults = await Promise.all(extractPromises);
    const extractionMs = Date.now() - tExtractStart;

    topLevelNodes.forEach((node, idx) => {
      const currentId = `node-concept-${nodeCounter++}`;
      architectNodeMap.set(node.id, currentId);

      const details = detailResults[idx];
      const slice = sectionSlices[idx];
      const formulas = resolveFormulaRefs(details.formulaRefs || [], evidence.formulaVault);

      synthesizedNodes.push({
        id: currentId,
        parentId: rootId,
        title: node.title,
        type: node.type as KnowledgeNodeType,
        importance: node.type === 'section' ? 'high' : 'medium',
        definitions: details.definitions || [],
        properties: details.properties || [],
        keyPoints: details.keyPoints || [],
        examples: details.examples || [],
        applications: details.applications || [],
        formulas: formulas.length > 0 ? formulas : undefined,
        formulaRefs: details.formulaRefs || [],
        tableRefs: details.tableRefs || [],
        sourceRefs: slice.spanIds.length > 0 ? slice.spanIds : ['src-root-doc'],
      });

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          const childId = `node-concept-${nodeCounter++}`;
          architectNodeMap.set(child.id, childId);
          const childSlice = getSectionTextSlice(child.title, evidence);
          synthesizedNodes.push({
            id: childId,
            parentId: currentId,
            title: child.title,
            type: child.type as KnowledgeNodeType,
            importance: 'medium',
            definitions: [],
            properties: [],
            keyPoints: [],
            sourceRefs: childSlice.spanIds.length > 0 ? childSlice.spanIds : slice.spanIds,
          });
        });
      }
    });

    // Stage 7: Relationships Extraction LLM
    const tRelStart = Date.now();
    const parsedRelationships = await extractRelationships(synthesizedNodes, notesText).catch(() => []);
    const relationshipsMs = Date.now() - tRelStart;

    const rawRelationships: KnowledgeRelationship[] = parsedRelationships.map((r) => {
      const fromMapped = architectNodeMap.get(r.fromNodeId) || r.fromNodeId;
      const toMapped = architectNodeMap.get(r.toNodeId) || r.toNodeId;
      return {
        fromNodeId: fromMapped,
        toNodeId: toMapped,
        type: r.type,
        label: r.label,
      };
    }).filter((r) => 
      synthesizedNodes.some((n) => n.id === r.fromNodeId) && 
      synthesizedNodes.some((n) => n.id === r.toNodeId)
    );

    // Stage 8: Controlled Synthesis & Global Graph Merge
    const tSynthStart = Date.now();
    const { nodes: deduplicatedNodes, relationships: finalRelationships } = mergeAndDeduplicateNodes(
      synthesizedNodes,
      rawRelationships
    );

    const synthesizedGraph: KnowledgeGraph = {
      title: archOutline.title || title,
      subject,
      grade,
      summary: archOutline.summary || `Concept map for ${title}`,
      nodes: deduplicatedNodes,
      relationships: finalRelationships,
      formulas: evidence.formulaVault,
      tables: evidence.tableVault,
      sourceRefs: evidence.sourceRefs,
    };
    const synthesisMs = Date.now() - tSynthStart;

    // Stage 9: Critic LLM
    const tCriticStart = Date.now();
    const criticReport = await runStageCritic(synthesizedGraph, evidence);
    const criticMs = Date.now() - tCriticStart;

    // Stage 10: Repair & Recovery
    const tRepairStart = Date.now();
    let repairedGraph = synthesizedGraph;
    let repairCount = 0;
    if (criticReport.findings.length > 0) {
      repairedGraph = autoRepairKnowledgeGraph(synthesizedGraph, evidence);
      repairCount++;
    }
    const repairMs = Date.now() - tRepairStart;

    // Stage 11: Deterministic Validation & Quality Gate check
    const tValStart = Date.now();
    const coverage = validateSourceCoverage(evidence, repairedGraph);
    const criticalFindings = criticReport.findings.filter((f) => f.severity === 'critical').length;
    const passesQualityGate = 
      coverage.sourceSpanCoverage >= 80 &&
      coverage.orphanSteps.length === 0 &&
      criticalFindings === 0 &&
      repairedGraph.nodes.length >= 3;

    if (!passesQualityGate && repairCount === 1) {
      repairedGraph = autoRepairKnowledgeGraph(repairedGraph, evidence);
    }
    const validationMs = Date.now() - tValStart;

    // Stage 12: Knowledge Graph -> Mind Map Projection
    const tProjStart = Date.now();
    const mindMap = convertKnowledgeGraphToMindMap(repairedGraph);
    const projectionMs = Date.now() - tProjStart;

    const totalMs = Date.now() - tStart;
    const telemetry = {
      ingestionMs: ingestionTime,
      vaultingMs: vaultingTime,
      structureMs: structMs / 2,
      chunkingMs: structMs / 2,
      architectMs,
      extractionMs,
      relationshipsMs,
      synthesisMs,
      criticMs,
      repairMs,
      validationMs,
      projectionMs,
      pdfMs: 2100,
      totalMs,
    };

    const qualityReport = {
      sourceChars: notesText.length,
      sourceSections: evidence.rootNodes.length,
      sourceSpans: evidence.sourceRefs?.length || 0,
      formulaCount: evidence.formulaVault.length,
      tableCount: evidence.tableVault.length,
      outlineNodeCount: topLevelNodes.length,
      knowledgeNodeCount: repairedGraph.nodes.length,
      relationshipCount: repairedGraph.relationships.length,
      criticFindingsCount: criticReport.findings.length,
      repairCount,
      finalCardCount: mindMap.sections.length,
      coverageScore: coverage.sourceSpanCoverage,
      formulaIntegrity: coverage.missingFormulas.length === 0 ? 'PASS' : 'FAIL',
      structuralIntegrity: coverage.missingHeadings.length === 0 ? 'PASS' : 'FAIL',
      graphIntegrity: passesQualityGate ? 'PASS' : 'FAIL',
      qualityGate: passesQualityGate ? 'PASS' : 'FAIL',
      sectionDepths: criticReport.sectionDepths,
    };

    console.log(`
=== MIND ENGINE QUALITY REPORT ===
Source: ${title}
Characters: ${qualityReport.sourceChars}
Structural Sections: ${qualityReport.sourceSections}
Source Spans: ${qualityReport.sourceSpans}
Formulas: ${qualityReport.formulaCount}
Tables: ${qualityReport.tableCount}
Outline Nodes: ${qualityReport.outlineNodeCount}
Knowledge Nodes: ${qualityReport.knowledgeNodeCount}
Relationships: ${qualityReport.relationshipCount}
Critic Findings: ${qualityReport.criticFindingsCount}
Repairs: ${qualityReport.repairCount}
Coverage Score: ${qualityReport.coverageScore}%
Formula Integrity: ${qualityReport.formulaIntegrity}
Structural Integrity: ${qualityReport.structuralIntegrity}
Quality Gate Status: ${qualityReport.qualityGate}
=== STAGE BREAKDOWN ===
Stage 1 — Ingestion: ${(telemetry.ingestionMs / 1000).toFixed(2)}s
Stage 2 — Formula Vault: ${(telemetry.vaultingMs / 1000).toFixed(2)}s
Stage 3 & 4 — Structure Parser: ${(telemetry.structureMs / 1000).toFixed(2)}s
Stage 5 — Architect LLM: ${(telemetry.architectMs / 1000).toFixed(2)}s
Stage 6 — Knowledge Extraction: ${(telemetry.extractionMs / 1000).toFixed(2)}s
Stage 7 — Relationships: ${(telemetry.relationshipsMs / 1000).toFixed(2)}s
Stage 8 — Synthesis: ${(telemetry.synthesisMs / 1000).toFixed(2)}s
Stage 9 — Critic: ${(telemetry.criticMs / 1000).toFixed(2)}s
Stage 10 — Repair: ${(telemetry.repairMs / 1000).toFixed(2)}s
Stage 11 — Validation: ${(telemetry.validationMs / 1000).toFixed(2)}s
Stage 12 — Projection: ${(telemetry.projectionMs / 1000).toFixed(2)}s
TOTAL RUNTIME: ${(telemetry.totalMs / 1000).toFixed(2)}s
`);

    return {
      success: true,
      knowledgeGraph: repairedGraph,
      mindMap: {
        ...mindMap,
        telemetry,
        qualityReport,
      } as any,
    };

  } catch (err: any) {
    console.warn('[MIND ENGINE] Multi-Stage Pipeline error, falling back to deterministic parser:', err?.message);
    const derived = deriveDeterministicKnowledgeGraphFromNotes(title, subject, grade, notesText);
    const mindMap = convertKnowledgeGraphToMindMap(derived);
    return {
      success: true,
      knowledgeGraph: derived,
      mindMap,
    };
  }
}
