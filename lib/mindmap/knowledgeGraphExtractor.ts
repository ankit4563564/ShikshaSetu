/**
 * ShikshaSetu — Phase B Knowledge Graph Extractor Service
 * Extracts hierarchical concept trees, atomic formula/tuple nodes, and semantic relationships.
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { safeValidateKnowledgeGraph } from './schema';
import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeRelationship,
  ConceptMindMap,
  MindMapSection,
  MindMapItem,
  ConceptAccentColor,
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
 * Deterministic Knowledge Graph generator strictly derived from uploaded notes.
 * Used for offline/fallback modes and deterministic testing.
 */
export function deriveDeterministicKnowledgeGraphFromNotes(
  title: string,
  subject: string,
  grade: string,
  notesText: string
): KnowledgeGraph {
  const cleanTitle = title.trim() || 'Uploaded Course Notes';
  const normalizedText = notesText.replace(/\[Page\s*\d+\]/gi, '').trim();
  const rawLines = normalizedText.split('\n').map((l) => l.trim()).filter(Boolean);

  const rootId = 'node-root';
  const nodes: KnowledgeNode[] = [
    {
      id: rootId,
      parentId: null,
      title: cleanTitle,
      type: 'root',
      importance: 'high',
      summary: `Root concept graph for ${cleanTitle}.`,
      keyPoints: [],
    },
  ];

  const relationships: KnowledgeRelationship[] = [];

  // Group lines into topics based on numbered or bold headings
  let currentTopicId = rootId;
  let currentSubtopicId: string | null = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    const majorHeadingMatch = line.match(/^(?:[0-9]{1,2}[\.\)]|[I|V|X]+[\.\)]|Chapter)\s*([A-Za-z0-9\s&,'\-\(\)\/]+)/i);
    const subHeadingMatch = line.match(/^(?:[a-z][\.\)]|[•\*\-])\s*([^:\n]{3,60}):/i);

    if (majorHeadingMatch) {
      const topicTitle = majorHeadingMatch[1].replace(/[:\-#]+$/, '').trim();
      const topicId = `node-topic-${nodes.length + 1}`;
      currentTopicId = topicId;
      currentSubtopicId = null;

      nodes.push({
        id: topicId,
        parentId: rootId,
        title: topicTitle,
        type: 'topic',
        importance: 'high',
        definitions: [],
        keyPoints: [],
        formulas: [],
      });

      relationships.push({
        fromNodeId: rootId,
        toNodeId: topicId,
        type: 'contains',
        label: 'Includes',
      });
    } else if (subHeadingMatch && currentTopicId !== rootId) {
      const fullHeadingMatch = subHeadingMatch[0];
      const subTitle = subHeadingMatch[1].replace(/[:\-#]+$/, '').trim();
      const inlineContent = line.slice(fullHeadingMatch.length).trim().replace(/^[:\-]+\s*/, '');
      const subId = `node-sub-${nodes.length + 1}`;
      currentSubtopicId = subId;

      const subNode: KnowledgeNode = {
        id: subId,
        parentId: currentTopicId,
        title: subTitle,
        type: 'subtopic',
        importance: 'medium',
        definitions: inlineContent.length > 5 ? [inlineContent] : [],
        keyPoints: [],
        formulas: [],
      };

      if (inlineContent && /\(Q,\s*Σ|\\delta|[A-Za-z]\s*=/.test(inlineContent)) {
        subNode.formulas = [
          {
            latex: inlineContent.match(/\([^\)]+\)/)?.[0] || inlineContent,
            meaning: inlineContent,
          },
        ];
      }

      nodes.push(subNode);

      relationships.push({
        fromNodeId: currentTopicId,
        toNodeId: subId,
        type: 'contains',
        label: 'Subtopic',
      });
    } else {
      // Content lines: attach definitions, formulas, or key points to active node
      const targetNode = nodes.find((n) => n.id === (currentSubtopicId || currentTopicId));
      if (!targetNode) continue;

      const isFormula = /[=\+\-\*\/\^\\_]/.test(line) && /\b[A-Za-z0-9_]\s*=|\\frac|\\delta|\(Q,\s*Σ/.test(line);

      if (isFormula) {
        let latex = line.replace(/^(?:Formula|Tuple|Definition)?\s*[:=]?\s*/i, '').trim();
        targetNode.formulas = targetNode.formulas || [];
        targetNode.formulas.push({
          latex,
          meaning: line,
        });
      } else if (line.length > 5) {
        if (!targetNode.definitions || targetNode.definitions.length === 0) {
          targetNode.definitions = targetNode.definitions || [];
          targetNode.definitions.push(line);
        } else {
          targetNode.keyPoints = targetNode.keyPoints || [];
          targetNode.keyPoints.push(line);
        }
      }
    }
  }

  // Cross-link equivalent or dependent concepts (e.g. DFA <-> NFA, Series <-> Parallel)
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
          type: 'equivalent_to',
          label: 'Equivalent models',
        });
      } else if (
        n1.title.toLowerCase().includes('kleene') && n2.title.toLowerCase().includes('regular')
      ) {
        relationships.push({
          fromNodeId: n1.id,
          toNodeId: n2.id,
          type: 'leads_to',
          label: 'Establishes equivalence',
        });
      } else if (
        n1.title.toLowerCase().includes('arden') && n2.title.toLowerCase().includes('regular')
      ) {
        relationships.push({
          fromNodeId: n1.id,
          toNodeId: n2.id,
          type: 'application_of',
          label: 'Used for conversion',
        });
      }
    }
  }

  return {
    title: cleanTitle,
    subject: subject || 'Computer Science',
    grade: grade || 'University',
    summary: nodes[1]?.definitions?.[0] || `Hierarchical knowledge graph for ${cleanTitle}.`,
    nodes,
    relationships,
    sourceReferences: [{ excerpt: normalizedText.slice(0, 180) }],
  };
}

/**
 * Bridges a structured KnowledgeGraph into a ConceptMindMap for visual canvas/export rendering.
 */
export function convertKnowledgeGraphToMindMap(graph: KnowledgeGraph): ConceptMindMap {
  // Exclude root node from top-level section cards
  const nonRootNodes = graph.nodes.filter((n) => n.type !== 'root');

  // Group by parent topic or top-level nodes
  const sections: MindMapSection[] = [];
  const topicNodes = nonRootNodes.filter((n) => !n.parentId || n.parentId === 'node-root' || n.type === 'topic');

  for (let idx = 0; idx < (topicNodes.length > 0 ? topicNodes.length : nonRootNodes.length); idx++) {
    const node = topicNodes.length > 0 ? topicNodes[idx] : nonRootNodes[idx];
    const childNodes = nonRootNodes.filter((n) => n.parentId === node.id);

    const items: MindMapItem[] = [];

    // Add node's own definitions
    if (node.definitions) {
      node.definitions.forEach((def, dIdx) => {
        items.push({
          id: `${node.id}-def-${dIdx}`,
          type: 'definition',
          content: def,
        });
      });
    }

    // Add node's formulas
    if (node.formulas) {
      node.formulas.forEach((f, fIdx) => {
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

    // Add node's key points
    if (node.keyPoints) {
      node.keyPoints.forEach((kp, kpIdx) => {
        items.push({
          id: `${node.id}-kp-${kpIdx}`,
          type: 'key_point',
          content: kp,
        });
      });
    }

    // Add child nodes' concepts
    childNodes.forEach((child) => {
      if (child.definitions && child.definitions.length > 0) {
        items.push({
          id: `${child.id}-concept`,
          type: 'concept',
          content: `${child.title}: ${child.definitions[0]}`,
        });
      }
      if (child.formulas && child.formulas.length > 0) {
        child.formulas.forEach((cf, cfIdx) => {
          items.push({
            id: `${child.id}-form-${cfIdx}`,
            type: 'formula',
            content: cf.latex,
            details: `${child.title} — ${cf.variables || cf.meaning || ''}`,
            unit: cf.unit,
            condition: cf.condition,
          });
        });
      }
    });

    if (items.length === 0) {
      items.push({
        id: `${node.id}-default`,
        type: 'concept',
        content: node.summary || node.title,
      });
    }

    const isMajor = node.importance === 'high' || node.title.toLowerCase().includes('automata') || node.title.toLowerCase().includes('regex') || node.title.toLowerCase().includes('ohm') || node.title.toLowerCase().includes('joule');

    sections.push({
      id: `sec-${node.id}`,
      title: node.title,
      accentColor: ACCENT_PALETTE[sections.length % ACCENT_PALETTE.length],
      importance: node.importance,
      layoutSpan: isMajor ? 'full' : 'half',
      summary: node.summary,
      definition: node.definitions?.[0],
      formulas: node.formulas,
      keyPoints: node.keyPoints,
      items,
      relatedSectionIds: graph.relationships
        .filter((r) => r.fromNodeId === node.id || r.toNodeId === node.id)
        .map((r) => (r.fromNodeId === node.id ? `sec-${r.toNodeId}` : `sec-${r.fromNodeId}`)),
    });
  }

  // Map graph relationships to mind map relationships
  const relationships = graph.relationships.map((r) => ({
    fromSectionId: `sec-${r.fromNodeId}`,
    toSectionId: `sec-${r.toNodeId}`,
    label: r.label,
    type: (r.type === 'equivalent_to' ? 'contrasts_with' : r.type === 'leads_to' ? 'derives' : 'depends_on') as any,
  }));

  return {
    title: graph.title,
    subject: graph.subject,
    grade: graph.grade,
    summary: graph.summary,
    sections: sections.slice(0, 8),
    relationships,
    sourceReferences: graph.sourceReferences,
    knowledgeGraph: graph,
  };
}

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

  const systemPrompt = `You are the ShikshaSetu Knowledge Graph & Concept Hierarchy Architect.
Your task is to transform uploaded textbook/lesson notes into a strictly structured, comprehensive KNOWLEDGE GRAPH.

CRITICAL INSTRUCTIONS:
1. HIERARCHY:
   - Create a Root Node for the chapter.
   - Group ideas into major Topic nodes (e.g. "Formal Languages", "Finite Automata", "Regular Expressions").
   - Create Subtopic nodes under Topics (e.g. "DFA", "NFA", "Transition Diagrams", "Transition Tables").
   - Set "parentId" to establish the exact tree hierarchy.
2. ATOMIC FORMULAS & TUPLES:
   - Keep formulas, 5-tuples (e.g. DFA "(Q, \\Sigma, \\delta, q_0, F)"), variable meanings, and SI units inside their concept nodes.
   - Do NOT create fragmented single-variable cards for Q, Sigma, delta, etc.
3. RELATIONSHIPS:
   - Connect related nodes using exact types: ["contains", "depends_on", "equivalent_to", "contrasts_with", "leads_to", "example_of", "application_of", "part_of"].
   - E.g. DFA <-> NFA: "equivalent_to".
   - E.g. Kleene's Theorem -> Regular Expressions: "leads_to".
   - E.g. Arden's Theorem -> Regular Expression Conversion: "application_of".
4. COMPACT REVISION:
   - Condense long paragraphs into clear definitions and key points. Do NOT invent concepts outside the source.

OUTPUT STRICT JSON MATCHING THIS EXACT SCHEMA:
{
  "title": string,
  "subject": string,
  "grade": string,
  "summary": string,
  "nodes": [
    {
      "id": string,
      "parentId": string|null,
      "title": string,
      "type": "root"|"chapter"|"topic"|"subtopic"|"concept"|"definition"|"theorem"|"formula"|"algorithm"|"example",
      "importance": "high"|"medium"|"low",
      "summary": string,
      "definitions": string[],
      "keyPoints": string[],
      "formulas": [
        { "latex": string, "meaning": string, "variables": string, "unit": string, "condition": string }
      ],
      "examples": string[],
      "applications": string[],
      "conditions": string[],
      "warnings": string[]
    }
  ],
  "relationships": [
    {
      "fromNodeId": string,
      "toNodeId": string,
      "type": "contains"|"depends_on"|"equivalent_to"|"contrasts_with"|"leads_to"|"example_of"|"application_of"|"part_of",
      "label": string
    }
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
      maxTokens: 3500,
    });

    const parsedJson = JSON.parse(response.text);
    const validation = safeValidateKnowledgeGraph(parsedJson);

    if (validation.success && validation.data.nodes.length >= 3) {
      const mindMap = convertKnowledgeGraphToMindMap(validation.data);
      return {
        success: true,
        knowledgeGraph: validation.data,
        mindMap,
      };
    } else {
      console.warn('[KnowledgeGraphExtractor] AI output failed validation, using deterministic knowledge graph parser:', validation.error);
      const derived = deriveDeterministicKnowledgeGraphFromNotes(title, subject, grade, notesText);
      const mindMap = convertKnowledgeGraphToMindMap(derived);
      return { success: true, knowledgeGraph: derived, mindMap };
    }
  } catch (err: any) {
    console.warn('[KnowledgeGraphExtractor] AI Provider call failed, using deterministic knowledge graph parser:', err?.message);
    const derived = deriveDeterministicKnowledgeGraphFromNotes(title, subject, grade, notesText);
    const mindMap = convertKnowledgeGraphToMindMap(derived);
    return { success: true, knowledgeGraph: derived, mindMap };
  }
}
