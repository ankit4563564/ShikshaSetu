/**
 * ShikshaSetu — Phase B Knowledge Graph Extractor Service
 * Semantic Classification, Hierarchy Enforcement, and Algorithm/Theorem Atomicity
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { safeValidateKnowledgeGraph } from './schema';
import { normalizeMathFormula, deduplicateFormulas } from './formulaNormalizer';
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
 * Classifies raw text chunks into explicit semantic node types.
 */
export function classifySemanticRole(text: string, title?: string): {
  type: KnowledgeNodeType;
  importance: SemanticImportance;
} {
  const lower = (text + ' ' + (title || '')).toLowerCase();

  if (/^(?:step\s*\d+|create\s*dfa\s*states|initial\s*dfa\s*state|for\s*each\s*dfa\s*state|final\s*dfa\s*states)/i.test(text)) {
    return { type: 'algorithm_step', importance: 'medium' };
  }
  if (/subset\s*construction|algorithm|conversion\s*method/i.test(lower)) {
    return { type: 'algorithm', importance: 'critical' };
  }
  if (/arden's\s*theorem|kleene's\s*theorem|pythagorean\s*theorem/i.test(lower)) {
    return { type: 'theorem', importance: 'critical' };
  }
  if (/ohm's\s*law|joule's\s*law|newton's\s*law/i.test(lower)) {
    return { type: 'law', importance: 'critical' };
  }
  if (/study\s*tip|exam\s*tip|preparation|key\s*takeaway|focus\s*on/i.test(lower)) {
    return { type: 'study_tip', importance: 'low' };
  }
  if (/application|lexical\s*analyzer|pattern\s*matching|compiler|used\s*in/i.test(lower)) {
    return { type: 'application', importance: 'medium' };
  }
  if (/exactly\s*one\s*transition|deterministic\s*behavior|accepts\s*or\s*rejects|property|characteristic/i.test(lower)) {
    return { type: 'property', importance: 'medium' };
  }
  if (/[=\+\-\*\/\^\\_]/.test(text) && /\b[A-Za-z0-9_]\s*=|\\frac|\\delta|\(Q,\s*Σ|\\Sigma/.test(text)) {
    return { type: 'formula', importance: 'high' };
  }
  if (/is\s*defined\s*as|is\s*a\s*5-tuple|is\s*the\s*rate\s*of|is\s*work\s*done/i.test(lower)) {
    return { type: 'definition', importance: 'high' };
  }

  return { type: 'concept', importance: 'medium' };
}

/**
 * Deterministic Semantic Knowledge Graph generator.
 * Builds structured parent-child trees with algorithm steps, properties, and theorems properly nested.
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

  const rootId = 'node-chapter-root';
  const nodes: KnowledgeNode[] = [
    {
      id: rootId,
      parentId: null,
      title: cleanTitle,
      type: 'chapter',
      importance: 'critical',
      summary: `Comprehensive semantic knowledge graph for ${cleanTitle}.`,
      keyPoints: [],
    },
  ];

  const relationships: KnowledgeRelationship[] = [];

  let currentTopicId = rootId;
  let currentSubtopicId: string | null = null;
  let currentAlgorithmId: string | null = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // 1. Major Section Headings (e.g. "1. Formal Languages", "2. Finite Automata", "3. Regular Expressions")
    const majorHeadingMatch = line.match(/^(?:[0-9]{1,2}[\.\)]|[I|V|X]+[\.\)]|Chapter)\s*([A-Za-z0-9\s&,'\-\(\)\/]+)/i);

    // 2. Subtopic Headings (e.g. "a. Deterministic Finite Automata (DFA): ...", "d. DFA and NFA Equivalence:")
    const subHeadingMatch = line.match(/^(?:[a-z][\.\)]|[•\*\-])\s*([^:\n]{3,65}):/i);

    // 3. Algorithm Step Lines
    const isStepLine =
      /^Step\s*\d+[:\.]?/i.test(line) ||
      /^(?:(?:Step\s*\d+[:\.]?|\d+\.)\s*)?(?:Create\s*DFA\s*states|Initial\s*DFA\s*state|For\s*each\s*DFA\s*state|Final\s*DFA\s*states)/i.test(line);

    if (majorHeadingMatch) {
      const topicTitle = majorHeadingMatch[1].replace(/[:\-#]+$/, '').trim();
      const topicId = `node-section-${nodes.length + 1}`;
      currentTopicId = topicId;
      currentSubtopicId = null;
      currentAlgorithmId = null;

      nodes.push({
        id: topicId,
        parentId: rootId,
        title: topicTitle,
        type: 'section',
        importance: 'high',
        definitions: [],
        keyPoints: [],
        formulas: [],
        applications: [],
      });

      relationships.push({
        fromNodeId: rootId,
        toNodeId: topicId,
        type: 'contains',
        label: 'Section',
      });
    } else if (subHeadingMatch && currentTopicId !== rootId) {
      const fullHeadingMatch = subHeadingMatch[0];
      const subTitle = subHeadingMatch[1].replace(/[:\-#]+$/, '').trim();
      const inlineContent = line.slice(fullHeadingMatch.length).trim().replace(/^[:\-]+\s*/, '');
      const subId = `node-concept-${nodes.length + 1}`;
      currentSubtopicId = subId;

      const isAlgorithm = /subset\s*construction|algorithm|conversion/i.test(subTitle) || /subset\s*construction/i.test(inlineContent);
      const isTheorem = /theorem|law/i.test(subTitle);

      const nodeType: KnowledgeNodeType = isAlgorithm
        ? 'algorithm'
        : isTheorem
        ? 'theorem'
        : 'concept';

      const subNode: KnowledgeNode = {
        id: subId,
        parentId: currentTopicId,
        title: subTitle,
        type: nodeType,
        importance: isAlgorithm || isTheorem ? 'critical' : 'high',
        definitions: inlineContent.length > 5 ? [inlineContent] : [],
        properties: [],
        keyPoints: [],
        formulas: [],
        applications: [],
        steps: [],
      };

      if (isAlgorithm) {
        currentAlgorithmId = subId;
        subNode.purpose = inlineContent || 'Convert non-deterministic automaton to equivalent deterministic model.';
      } else {
        currentAlgorithmId = null;
      }

      if (inlineContent && /\(Q,\s*Σ|\\delta|[A-Za-z]\s*=|L\s*=|R\s*=/i.test(inlineContent)) {
        const norm = normalizeMathFormula(inlineContent.match(/\([^\)]+\)/)?.[0] || inlineContent);
        subNode.formulas = [
          {
            latex: norm,
            meaning: inlineContent,
          },
        ];
      }

      nodes.push(subNode);

      relationships.push({
        fromNodeId: currentTopicId,
        toNodeId: subId,
        type: 'contains',
        label: isAlgorithm ? 'Uses algorithm' : 'Contains concept',
      });
    } else if (isStepLine && currentAlgorithmId) {
      // Step belonging to an algorithm: attach as algorithm_step under the algorithm node
      const stepId = `node-step-${nodes.length + 1}`;
      const cleanStep = line.replace(/^(?:Step\s*\d+[:\.]?|\d+\.)\s*/i, '').trim();

      nodes.push({
        id: stepId,
        parentId: currentAlgorithmId,
        title: `Step ${nodes.filter((n) => n.parentId === currentAlgorithmId && n.type === 'algorithm_step').length + 1}`,
        type: 'algorithm_step',
        importance: 'medium',
        definitions: [cleanStep],
      });

      const algoNode = nodes.find((n) => n.id === currentAlgorithmId);
      if (algoNode) {
        algoNode.steps = algoNode.steps || [];
        algoNode.steps.push(cleanStep);
      }

      relationships.push({
        fromNodeId: currentAlgorithmId,
        toNodeId: stepId,
        type: 'has_step',
        label: 'Algorithm Step',
      });
    } else {
      // Content lines: attach definitions, properties, applications, or formulas to active node
      const targetNode = nodes.find((n) => n.id === (currentSubtopicId || currentTopicId));
      if (!targetNode) continue;

      const hasInlineFormula = /[=\+\-\*\/\^\\_]/.test(line) && /\b[A-Za-z0-9_]\s*=|\\frac|\\delta|\(Q,\s*Σ|L\s*=|R\s*=|H\s*=|V\s*=|I\s*=/i.test(line);

      if (hasInlineFormula) {
        const formulaMatch = line.match(/(?:[A-Za-z0-9_]+\s*=\s*[^;\.\n]+)/);
        const rawFormula = formulaMatch ? formulaMatch[0].trim() : line.trim();
        const norm = normalizeMathFormula(rawFormula);
        targetNode.formulas = targetNode.formulas || [];
        targetNode.formulas.push({
          latex: norm,
          meaning: line,
        });
        targetNode.formulas = deduplicateFormulas(targetNode.formulas);
      }

      const classification = classifySemanticRole(line, targetNode.title);

      if (classification.type === 'property') {
        targetNode.properties = targetNode.properties || [];
        targetNode.properties.push(line);
      } else if (classification.type === 'application') {
        targetNode.applications = targetNode.applications || [];
        targetNode.applications.push(line);
      } else if (classification.type === 'study_tip') {
        targetNode.studyTips = targetNode.studyTips || [];
        targetNode.studyTips.push(line);
      } else if (line.length > 5 && !hasInlineFormula) {
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

  // Cross-link semantic relationships across nodes
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
        n1.title.toLowerCase().includes('equivalence') && n2.type === 'algorithm'
      ) {
        relationships.push({
          fromNodeId: n1.id,
          toNodeId: n2.id,
          type: 'uses_algorithm',
          label: 'Solved via Subset Construction',
        });
      } else if (
        n1.title.toLowerCase().includes('kleene') && n2.title.toLowerCase().includes('regular')
      ) {
        relationships.push({
          fromNodeId: n1.id,
          toNodeId: n2.id,
          type: 'leads_to',
          label: 'Establishes FA = RE equivalence',
        });
      } else if (
        n1.title.toLowerCase().includes('arden') && n2.title.toLowerCase().includes('regular')
      ) {
        relationships.push({
          fromNodeId: n1.id,
          toNodeId: n2.id,
          type: 'application_of',
          label: 'Used for FA to RE conversion',
        });
      }
    }
  }

  return {
    title: cleanTitle,
    subject: subject || 'Computer Science',
    grade: grade || 'University',
    summary: nodes[1]?.definitions?.[0] || `Semantic knowledge graph for ${cleanTitle}.`,
    nodes,
    relationships,
    sourceReferences: [{ excerpt: normalizedText.slice(0, 180) }],
  };
}

/**
 * Bridges a structured KnowledgeGraph into ConceptMindMap format for visual rendering.
 * Strictly guarantees that algorithm steps and properties are encapsulated inside parent concepts.
 */
export function convertKnowledgeGraphToMindMap(graph: KnowledgeGraph): ConceptMindMap {
  // Exclude root and algorithm_step nodes from top-level sections
  const candidateNodes = graph.nodes.filter(
    (n) => n.type !== 'chapter' && n.type !== 'algorithm_step'
  );

  // Group candidate nodes: top-level sections or distinct concept nodes
  const sections: MindMapSection[] = [];

  // Determine section cards:
  // If there are subtopic/concept nodes (like DFA, NFA, Alphabets, etc.), use concept nodes as visual sections.
  // Otherwise, use section nodes.
  const conceptNodes = candidateNodes.filter(
    (n) => n.type === 'concept' || n.type === 'sub_concept' || n.type === 'theorem' || n.type === 'law' || n.type === 'algorithm'
  );

  const targetNodes = conceptNodes.length >= 4 ? conceptNodes : candidateNodes.filter((n) => n.type === 'section' || !n.parentId || n.parentId === 'node-chapter-root');

  for (let idx = 0; idx < targetNodes.length; idx++) {
    const node = targetNodes[idx];
    const childNodes = graph.nodes.filter((n) => n.parentId === node.id);

    const items: MindMapItem[] = [];

    // 1. Definition
    if (node.definitions && node.definitions.length > 0) {
      node.definitions.forEach((def, dIdx) => {
        items.push({
          id: `${node.id}-def-${dIdx}`,
          type: 'definition',
          content: def,
        });
      });
    }

    // 2. Formulas (deduplicated & normalized)
    if (node.formulas && node.formulas.length > 0) {
      const deduped = deduplicateFormulas(node.formulas);
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

    // 3. Properties
    if (node.properties && node.properties.length > 0) {
      node.properties.forEach((prop, pIdx) => {
        items.push({
          id: `${node.id}-prop-${pIdx}`,
          type: 'key_point',
          content: `Property: ${prop}`,
        });
      });
    }

    // 4. Algorithm Steps (encapsulated process block)
    const stepChildren = childNodes.filter((c) => c.type === 'algorithm_step');
    const allSteps = (node.steps && node.steps.length > 0)
      ? node.steps
      : stepChildren.map((s) => s.definitions?.[0] || s.title);

    if (allSteps.length > 0) {
      items.push({
        id: `${node.id}-algo-process`,
        type: 'process',
        content: `Algorithm: ${node.title} — ${allSteps.length} Steps`,
        details: allSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      });
    }

    // 5. Key Points
    if (node.keyPoints && node.keyPoints.length > 0) {
      node.keyPoints.forEach((kp, kpIdx) => {
        items.push({
          id: `${node.id}-kp-${kpIdx}`,
          type: 'key_point',
          content: kp,
        });
      });
    }

    // 6. Applications
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
      node.title.toLowerCase().includes('automata') ||
      node.title.toLowerCase().includes('regex') ||
      node.title.toLowerCase().includes('ohm') ||
      node.title.toLowerCase().includes('joule');

    sections.push({
      id: `sec-${node.id}`,
      title: node.title,
      accentColor: ACCENT_PALETTE[sections.length % ACCENT_PALETTE.length],
      importance: node.importance,
      layoutSpan: isMajor ? 'full' : 'half',
      summary: node.summary,
      definition: node.definitions?.[0],
      formulas: node.formulas ? deduplicateFormulas(node.formulas) : [],
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
      type: (r.type === 'equivalent_to' ? 'contrasts_with' : r.type === 'leads_to' ? 'derives' : 'depends_on') as any,
    }));

  return {
    title: graph.title,
    subject: graph.subject,
    grade: graph.grade,
    summary: graph.summary,
    sections: sections.slice(0, 10),
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

  const systemPrompt = `You are ShikshaSetu's Mind Map Intelligence Engine.
Your ONLY job is to convert the supplied educational notes into a semantic hierarchical mind map.

PRIMARY OBJECTIVE:
Identify: ROOT TOPIC -> MAJOR TOPICS -> CONCEPTS -> SUBCONCEPTS -> IMPORTANT DETAILS.
Build a coherent knowledge tree that answers "What concepts belong to what other concepts?" — NOT "What sentences appeared in the notes?".

CRITICAL RULES:
1. NEVER FLATTEN CONTENT:
   - Algorithms/Procedures: An algorithm is ONE node. Its steps are children. (e.g. DFA ↔ NFA Equivalence -> Subset Construction -> 4 Steps).
   - Operators: Group operators under "Basic Operators" -> Union, Concatenation, Kleene Star, etc.
   - Theorems: A theorem groups its statement, condition, formula, and applications (e.g. Arden's Theorem -> Statement: X = AX + B, Condition: A does not contain ε).
   - Conversions: Group methods by conversion direction (e.g. RE -> FA vs FA -> RE).
   - Applications: Group applications by domain (e.g. Compiler Design, Text Processing, Network Validation).
2. DEFINITIONS, FORMULAS & EXAMPLES:
   - Keep definitions, formulas, and examples attached to the concept they describe.
   - Preserve exact mathematical notation: (Q, \\Sigma, \\delta, q_0, F), \\delta: Q \\times \\Sigma \\to Q, \\delta: Q \\times (\\Sigma \\cup \\{\\varepsilon\\}) \\to 2^Q, X = AX + B, \\varepsilon, \\lambda, \\Sigma, \\delta, \\emptyset, \\cup, \\rightarrow, 2^Q, superscripts, subscripts.
3. ROOT & MAJOR TOPICS:
   - Exactly ONE root node representing the main subject (e.g. "Theory of Computation — Unit 1").
   - Depth limit: 3 to 4 levels. Short, scannable titles.
4. PRIORITY:
   - "high": Definitions, major concepts, formulas, theorems, algorithms, conversions.
   - "medium": Supporting concepts and useful explanations.
   - "low": Minor examples, applications, study tips.

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure with NO markdown formatting, NO \`\`\`json fences, and NO commentary:
{
  "title": "string",
  "summary": "string",
  "children": [
    {
      "title": "string",
      "summary": "string",
      "priority": "high"|"medium"|"low",
      "children": [
        {
          "title": "string",
          "summary": "string",
          "priority": "high"|"medium"|"low",
          "children": []
        }
      ]
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
      maxTokens: 3800,
    });

    const cleanText = response.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsedJson = JSON.parse(cleanText);
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
