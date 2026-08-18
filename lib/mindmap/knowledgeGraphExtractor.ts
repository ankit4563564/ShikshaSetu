/**
 * ShikshaSetu — Phase B Knowledge Graph Extractor Service
 * Semantic Classification, Hierarchy Enforcement, and Algorithm/Theorem Atomicity
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { safeValidateKnowledgeGraph } from './schema';
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

  if (/^(?:step\s*\d+|create\s*dfa\s*states|initial\s*dfa\s*state|compute\s*transitions|final\s*dfa\s*states)/i.test(text)) {
    return { type: 'algorithm_step', importance: 'medium' };
  }
  if (/subset\s*construction|algorithm|conversion\s*method/i.test(lower)) {
    return { type: 'algorithm', importance: 'high' };
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
  if (/[=\+\-\*\/\^\\_]/.test(text) && /\b[A-Za-z0-9_]\s*=|\\frac|\\delta|\(Q,\s*Σ/.test(text)) {
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

    // 3. Algorithm Step Lines (e.g. "1. Create DFA states corresponding to subsets...", "Step 1: ...")
    const isStepLine = /^Step\s*\d+[:\.]?/i.test(line) ||
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

      const hasInlineFormula = /[=\+\-\*\/\^\\_]/.test(line) && /\b[A-Za-z0-9_]\s*=|\\frac|\\delta|\(Q,\s*Σ/.test(line);

      if (hasInlineFormula) {
        const formulaMatch = line.match(/(?:[A-Za-z0-9_]+\s*=\s*[^;\.\n]+)/);
        const latex = formulaMatch ? formulaMatch[0].trim() : line.trim();
        targetNode.formulas = targetNode.formulas || [];
        targetNode.formulas.push({
          latex,
          meaning: line,
        });
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
 * Bridges a structured KnowledgeGraph into ConceptMindMap format.
 * Ensures algorithm steps and properties are encapsulated inside their parent concept cards.
 */
export function convertKnowledgeGraphToMindMap(graph: KnowledgeGraph): ConceptMindMap {
  // Exclude root and standalone steps (which are already encapsulated inside algorithm parent)
  const nonRootNodes = graph.nodes.filter(
    (n) => n.type !== 'chapter' && n.type !== 'algorithm_step'
  );

  const sections: MindMapSection[] = [];
  const topicNodes = nonRootNodes.filter((n) => n.type === 'section' || !n.parentId || n.parentId === 'node-chapter-root');

  for (let idx = 0; idx < (topicNodes.length > 0 ? topicNodes.length : nonRootNodes.length); idx++) {
    const node = topicNodes.length > 0 ? topicNodes[idx] : nonRootNodes[idx];
    const childNodes = nonRootNodes.filter((n) => n.parentId === node.id);

    const items: MindMapItem[] = [];

    // 1. Definition
    if (node.definitions) {
      node.definitions.forEach((def, dIdx) => {
        items.push({
          id: `${node.id}-def-${dIdx}`,
          type: 'definition',
          content: def,
        });
      });
    }

    // 2. Formulas
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

    // 3. Properties
    if (node.properties) {
      node.properties.forEach((prop, pIdx) => {
        items.push({
          id: `${node.id}-prop-${pIdx}`,
          type: 'key_point',
          content: `Property: ${prop}`,
        });
      });
    }

    // 4. Algorithm Steps (encapsulated)
    if (node.steps && node.steps.length > 0) {
      items.push({
        id: `${node.id}-algo-process`,
        type: 'process',
        content: `Algorithm: ${node.title} — ${node.steps.length} Steps`,
        details: node.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      });
    }

    // 5. Key Points
    if (node.keyPoints) {
      node.keyPoints.forEach((kp, kpIdx) => {
        items.push({
          id: `${node.id}-kp-${kpIdx}`,
          type: 'key_point',
          content: kp,
        });
      });
    }

    // 6. Applications
    if (node.applications) {
      node.applications.forEach((app, aIdx) => {
        items.push({
          id: `${node.id}-app-${aIdx}`,
          type: 'example',
          content: `Application: ${app}`,
        });
      });
    }

    // 7. Child Nodes Content (encapsulated under parent)
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
      if (child.steps && child.steps.length > 0) {
        items.push({
          id: `${child.id}-steps`,
          type: 'process',
          content: `${child.title} (${child.steps.length} Steps)`,
          details: child.steps.map((s, i) => `${i + 1}. ${s}`).join(' | '),
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
      formulas: node.formulas,
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

  const systemPrompt = `You are the ShikshaSetu Semantic Knowledge Graph & Concept Hierarchy Architect.
Your task is to transform uploaded textbook/lesson notes into a strictly structured, comprehensive KNOWLEDGE GRAPH with explicit semantic node roles.

CRITICAL ARCHITECTURE RULES:
1. SEMANTIC NODE CLASSIFICATION:
   - "chapter": The single root node of the document.
   - "section": Major chapters or modules (e.g. "Formal Languages", "Finite Automata", "Regular Expressions").
   - "concept" / "sub_concept": Individual concepts (e.g. "DFA", "NFA", "Alphabets", "Strings").
   - "algorithm": Multi-step computational procedures (e.g. "Subset Construction Algorithm").
   - "algorithm_step": Individual steps belonging to an algorithm. MUST have an "algorithm" parent.
   - "theorem" / "law": Mathematical/scientific theorems with statements and conditions (e.g. "Arden's Theorem", "Kleene's Theorem", "Ohm's Law").
   - "property": Specific characteristics or constraints of a concept (e.g. "Exactly one transition for each symbol").
   - "application": Practical usages (e.g. "Lexical Analyzers", "Compilers").
   - "study_tip": Preparation or learning advice.
2. STRICT ATOMICITY:
   - "DFA": Keep 5-tuple "(Q, \\Sigma, \\delta, q_0, F)", state definitions, and properties INSIDE the DFA node. Do NOT create separate cards for Q, Sigma, delta!
   - "Subset Construction": Steps must be child nodes under the "Subset Construction" algorithm node.
3. EXPLICIT RELATIONSHIP TYPES:
   - ["contains", "has_property", "defined_by", "has_formula", "uses_algorithm", "has_step", "equivalent_to", "contrasts_with", "example_of", "application_of", "depends_on", "leads_to", "summarized_by"].
   - E.g. DFA <-> NFA: "equivalent_to".
   - E.g. DFA/NFA Equivalence -> Subset Construction: "uses_algorithm".
   - E.g. Subset Construction -> Step 1: "has_step".
   - E.g. Arden's Theorem -> Regular Expression Conversion: "application_of".

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
      "type": "chapter"|"section"|"concept"|"sub_concept"|"definition"|"property"|"formula"|"theorem"|"law"|"algorithm"|"algorithm_step"|"example"|"comparison"|"application"|"condition"|"warning"|"summary"|"study_tip",
      "importance": "critical"|"high"|"medium"|"low",
      "summary": string,
      "definitions": string[],
      "properties": string[],
      "keyPoints": string[],
      "formulas": [
        { "latex": string, "meaning": string, "variables": string, "unit": string, "condition": string }
      ],
      "purpose": string,
      "steps": string[],
      "statement": string,
      "applications": string[],
      "conditions": string[],
      "warnings": string[],
      "studyTips": string[]
    }
  ],
  "relationships": [
    {
      "fromNodeId": string,
      "toNodeId": string,
      "type": "contains"|"has_property"|"defined_by"|"has_formula"|"uses_algorithm"|"has_step"|"equivalent_to"|"contrasts_with"|"example_of"|"application_of"|"depends_on"|"leads_to"|"summarized_by",
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
      maxTokens: 3800,
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
