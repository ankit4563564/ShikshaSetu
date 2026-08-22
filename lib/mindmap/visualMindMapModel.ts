import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeRelationship,
  ConceptMindMap,
  MindMapSection,
  FormulaBlock,
} from './types';

// ──────────────────────────────────────────────────────────
// VISUAL MIND MAP MODEL TYPES
// ──────────────────────────────────────────────────────────

export type VisualNodeType =
  | 'root'
  | 'major_concept'
  | 'concept'
  | 'subconcept'
  | 'category_group'
  | 'formula'
  | 'process'
  | 'comparison';

export interface VisualMindMapNode {
  id: string;
  label: string; // Concise, student-friendly academic title (e.g. "Ohm's Law", "Resistance")
  type: VisualNodeType;
  importance: 'critical' | 'high' | 'medium';
  parentId: string | null;
  depth: number;
  collapsedByDefault: boolean;
  childIds: string[];

  // Rich metadata for the Concept Detail Panel (never rendered as visual clutter)
  summary?: string;
  definition?: string;
  keyPoints?: string[];
  formulas?: {
    id?: string;
    latex: string;
    raw?: string;
    meaning?: string;
    variables?: string;
    unit?: string;
  }[];
  examples?: string[];
  properties?: string[];
  steps?: string[];
  sourceRefs?: string[];
  sourceNodeIds: string[];
  accentColor?: string;
}

export interface VisualTreeNode {
  id: string;
  label: string;
  type: VisualNodeType;
  importance: 'critical' | 'high' | 'medium';
  depth: number;
  color: string;
  node: VisualMindMapNode;
  children?: VisualTreeNode[];
}

export interface VisualMindMapLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'hierarchy' | 'depends_on' | 'causes' | 'contrasts_with' | 'converts_to';
  label?: string;
}

export interface VisualMindMapModel {
  title: string;
  subject: string;
  grade: string;
  rootNodeId: string;
  nodes: Record<string, VisualMindMapNode>;
  tree: VisualTreeNode;
  crossLinks: VisualMindMapLink[];
  totalKnowledgeNodes: number;
  visualNodeCount: number;
}

const ACCENT_PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
];

// ──────────────────────────────────────────────────────────
// QUALITY GATE & JUNK PATTERN REJECTION
// ──────────────────────────────────────────────────────────

const JUNK_NODE_PATTERNS = [
  /^(?:how\s+much|what\s+is|calculate|find\s+the|why\s+does|can\s+you|let\s+us|suppose|consider|activity|fig\b|figure\b|table\b|page\b)/i,
  /\?$/, // Questions must never be visual mind map nodes
  /^(?:given\s+by|where\s+|such\s+that|in\s+other\s+words|it\s+is\s+defined|we\s+know\s+that|note\s+that|you\s+need\s+not|memorise|memorize)/i,
  /^[0-9\.\s\-\+\*\/\=\(\)\,\:\;\%\$]+$/, // Pure numbers, math symbols or punctuation
  /^[a-zA-Z\s]{1,2}$/, // 1 or 2 letter fragments (e.g. "V", "R", "I", "l")
  /^(?:r\s*Ω|12v|220v|5a|10\s*v|1\.5\s*v|\d+\s*w|\d+\s*j|\d+\s*ohm|\d+\s*a)$/i, // Isolated values
  /^(?:source|reference|page\s*\d+|section\s*\d+|fig\.\s*\d+)/i, // Metadata fragments
];

/**
 * Validates whether a candidate string qualifies as a clean, standalone academic concept node.
 */
export function isValidVisualConceptTitle(title: string): boolean {
  if (!title || typeof title !== 'string') return false;
  const trimmed = title.trim();
  if (trimmed.length < 3 || trimmed.length > 65) return false;

  // Reject sentence fragments that start with lowercase
  if (/^[a-z]/.test(trimmed)) return false;

  // Reject against all junk patterns
  for (const pattern of JUNK_NODE_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  // Reject full prose sentences (>4 words and ends with period)
  if (trimmed.endsWith('.') && trimmed.split(/\s+/).length > 4) {
    return false;
  }

  return true;
}

/**
 * Cleans and normalizes a candidate title into a concise concept label.
 */
export function sanitizeConceptLabel(title: string): string {
  return title
    .replace(/^(?:chapter|unit|\d+\.|\d+\.\d+|\([a-z]\))\s*/i, '')
    .replace(/:\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ──────────────────────────────────────────────────────────
// BUILD VISUAL MIND MAP MODEL FROM CANONICAL KNOWLEDGE GRAPH
// ──────────────────────────────────────────────────────────

export function buildVisualMindMapModel(
  kgOrMindMap: KnowledgeGraph | ConceptMindMap,
  subject = 'Science',
  grade = 'Class 10'
): VisualMindMapModel {
  // Case A: Input is Canonical KnowledgeGraph
  if ('nodes' in kgOrMindMap && Array.isArray((kgOrMindMap as any).nodes) && 'relationships' in kgOrMindMap) {
    return buildFromKnowledgeGraph(kgOrMindMap as KnowledgeGraph);
  }

  // Case B: Input is ConceptMindMap (Revision Sheet model)
  return buildFromConceptMindMap(kgOrMindMap as ConceptMindMap, subject, grade);
}

function buildFromKnowledgeGraph(kg: KnowledgeGraph): VisualMindMapModel {
  const rootKnowledgeNode = kg.nodes.find((n) => n.type === 'root') || kg.nodes[0];
  const rootId = 'visual-root';
  const nodesRecord: Record<string, VisualMindMapNode> = {};
  const crossLinks: VisualMindMapLink[] = [];

  const rawTitle = sanitizeConceptLabel(kg.title || rootKnowledgeNode?.title || 'Concept Mind Map');

  const rootNode: VisualMindMapNode = {
    id: rootId,
    label: rawTitle,
    type: 'root',
    importance: 'critical',
    parentId: null,
    depth: 0,
    collapsedByDefault: false,
    childIds: [],
    summary: kg.summary || rootKnowledgeNode?.summary,
    sourceNodeIds: rootKnowledgeNode ? [rootKnowledgeNode.id] : [],
    accentColor: '#3b82f6',
  };
  nodesRecord[rootId] = rootNode;

  // 1. Identify Major Concept / Section Nodes (Depth 1 candidates)
  let majorNodes = kg.nodes.filter(
    (n) => n.id !== rootKnowledgeNode?.id && (n.parentId === rootKnowledgeNode?.id || n.type === 'section' || n.type === 'unit')
  );

  // If there's only 1 container wrapper node (e.g. "UNIT - 1" or "Chapter: Electricity"), unpack its children as major concepts
  if (majorNodes.length === 1 && (majorNodes[0].type === 'unit' || /^(?:unit|chapter)\b/i.test(majorNodes[0].title))) {
    const singleMajor = majorNodes[0];
    const subChildren = kg.nodes.filter((n) => n.parentId === singleMajor.id && n.id !== singleMajor.id);
    if (subChildren.length >= 2) {
      majorNodes = subChildren;
    }
  }

  // Fallback: If still empty, take top-level nodes
  if (majorNodes.length === 0) {
    majorNodes = kg.nodes.filter((n) => n.id !== rootKnowledgeNode?.id && (!n.parentId || n.type === 'topic')).slice(0, 8);
  }

  const seenLabels = new Set<string>();
  seenLabels.add(rawTitle.toLowerCase());

  let colorIdx = 0;

  // Map Major Concepts (Depth 1)
  majorNodes.forEach((majorNode) => {
    const cleanLabel = sanitizeConceptLabel(majorNode.title);
    if (!isValidVisualConceptTitle(cleanLabel)) return;
    const normKey = cleanLabel.toLowerCase();
    if (seenLabels.has(normKey)) return;
    seenLabels.add(normKey);

    const majorVisualId = `vis-${majorNode.id}`;
    const branchColor = ACCENT_PALETTE[colorIdx % ACCENT_PALETTE.length];
    colorIdx++;

    // Find children of this major node
    const childKnowledgeNodes = kg.nodes.filter((n) => n.parentId === majorNode.id && n.id !== majorNode.id);

    // Grouping & Filtering for Depth 2 Children
    const validChildren: VisualMindMapNode[] = [];

    childKnowledgeNodes.forEach((childKNode) => {
      const childLabel = sanitizeConceptLabel(childKNode.title);
      if (!isValidVisualConceptTitle(childLabel)) return;
      const childNormKey = childLabel.toLowerCase();
      if (seenLabels.has(childNormKey) || childNormKey === normKey) return;
      seenLabels.add(childNormKey);

      const childVisualId = `vis-${childKNode.id}`;
      const childType: VisualNodeType =
        childKNode.type === 'algorithm' || childKNode.type === 'algorithm_step'
          ? 'process'
          : childKNode.type === 'theorem' || childKNode.type === 'law'
          ? 'concept'
          : 'subconcept';

      const childVisualNode: VisualMindMapNode = {
        id: childVisualId,
        label: childLabel,
        type: childType,
        importance: childKNode.importance === 'critical' ? 'critical' : childKNode.importance === 'high' ? 'high' : 'medium',
        parentId: majorVisualId,
        depth: 2,
        collapsedByDefault: true,
        childIds: [],
        summary: childKNode.summary,
        definition: childKNode.definitions?.[0],
        formulas: childKNode.formulas?.map((f) => ({
          id: f.id,
          latex: f.latex,
          raw: f.raw,
          meaning: f.meaning,
          variables: f.variables,
          unit: f.unit,
        })),
        keyPoints: childKNode.keyPoints,
        properties: childKNode.properties,
        steps: childKNode.steps,
        sourceRefs: childKNode.sourceRefs,
        sourceNodeIds: [childKNode.id],
        accentColor: branchColor,
      };

      nodesRecord[childVisualId] = childVisualNode;
      validChildren.push(childVisualNode);
    });

    // Smart Visual Node Budget: If more than 7 children, cluster them into semantic groups
    let finalChildIds: string[] = [];

    if (validChildren.length > 7) {
      // Create sub-group categories
      const conceptGroup: VisualMindMapNode = {
        id: `${majorVisualId}-grp-concepts`,
        label: `${cleanLabel} Concepts`,
        type: 'category_group',
        importance: 'medium',
        parentId: majorVisualId,
        depth: 2,
        collapsedByDefault: true,
        childIds: [],
        accentColor: branchColor,
        sourceNodeIds: [majorNode.id],
      };

      const applicationGroup: VisualMindMapNode = {
        id: `${majorVisualId}-grp-apps`,
        label: 'Applications & Processes',
        type: 'category_group',
        importance: 'medium',
        parentId: majorVisualId,
        depth: 2,
        collapsedByDefault: true,
        childIds: [],
        accentColor: branchColor,
        sourceNodeIds: [majorNode.id],
      };

      validChildren.forEach((child) => {
        if (child.type === 'process' || /application|process|step|method|experiment/i.test(child.label)) {
          child.parentId = applicationGroup.id;
          child.depth = 3;
          applicationGroup.childIds.push(child.id);
        } else {
          child.parentId = conceptGroup.id;
          child.depth = 3;
          conceptGroup.childIds.push(child.id);
        }
      });

      if (conceptGroup.childIds.length > 0) {
        nodesRecord[conceptGroup.id] = conceptGroup;
        finalChildIds.push(conceptGroup.id);
      }
      if (applicationGroup.childIds.length > 0) {
        nodesRecord[applicationGroup.id] = applicationGroup;
        finalChildIds.push(applicationGroup.id);
      }
    } else {
      finalChildIds = validChildren.map((c) => c.id);
    }

    const majorVisualNode: VisualMindMapNode = {
      id: majorVisualId,
      label: cleanLabel,
      type: 'major_concept',
      importance: 'high',
      parentId: rootId,
      depth: 1,
      collapsedByDefault: false,
      childIds: finalChildIds,
      summary: majorNode.summary,
      definition: majorNode.definitions?.[0],
      formulas: majorNode.formulas?.map((f) => ({
        id: f.id,
        latex: f.latex,
        raw: f.raw,
        meaning: f.meaning,
        variables: f.variables,
        unit: f.unit,
      })),
      keyPoints: majorNode.keyPoints,
      properties: majorNode.properties,
      steps: majorNode.steps,
      sourceRefs: majorNode.sourceRefs,
      sourceNodeIds: [majorNode.id],
      accentColor: branchColor,
    };

    nodesRecord[majorVisualId] = majorVisualNode;
    rootNode.childIds.push(majorVisualId);
  });

  // 2. Build Curated Cross Links (Semantic non-hierarchical edges)
  if (kg.relationships && kg.relationships.length > 0) {
    const validCrossTypes = new Set(['depends_on', 'causes', 'contrasts_with', 'converts_to']);
    const seenLinks = new Set<string>();

    kg.relationships.forEach((rel, idx) => {
      if (validCrossTypes.has(rel.type)) {
        const srcVisId = `vis-${rel.fromNodeId}`;
        const tgtVisId = `vis-${rel.toNodeId}`;

        if (nodesRecord[srcVisId] && nodesRecord[tgtVisId] && srcVisId !== tgtVisId) {
          const linkKey = `${srcVisId}->${tgtVisId}`;
          if (!seenLinks.has(linkKey)) {
            seenLinks.add(linkKey);
            crossLinks.push({
              id: `link-${idx}`,
              sourceId: srcVisId,
              targetId: tgtVisId,
              type: rel.type as any,
              label: rel.label,
            });
          }
        }
      }
    });
  }

  // 3. Build Strict D3 Tree Structure
  function buildTreeNode(nodeId: string): VisualTreeNode {
    const node = nodesRecord[nodeId];
    return {
      id: node.id,
      label: node.label,
      type: node.type,
      importance: node.importance,
      depth: node.depth,
      color: node.accentColor || '#3b82f6',
      node,
      children: node.childIds && node.childIds.length > 0
        ? node.childIds.map(buildTreeNode)
        : undefined,
    };
  }

  const tree = buildTreeNode(rootId);

  return {
    title: rawTitle,
    subject: kg.subject || 'Science',
    grade: kg.grade || 'Class 10',
    rootNodeId: rootId,
    nodes: nodesRecord,
    tree,
    crossLinks,
    totalKnowledgeNodes: kg.nodes.length,
    visualNodeCount: Object.keys(nodesRecord).length,
  };
}

function buildFromConceptMindMap(
  mindMap: ConceptMindMap,
  subject: string,
  grade: string
): VisualMindMapModel {
  const rootId = 'visual-root';
  const nodesRecord: Record<string, VisualMindMapNode> = {};
  const rawTitle = sanitizeConceptLabel(mindMap.title || 'Chapter Concept Map');

  const rootNode: VisualMindMapNode = {
    id: rootId,
    label: rawTitle,
    type: 'root',
    importance: 'critical',
    parentId: null,
    depth: 0,
    collapsedByDefault: false,
    childIds: [],
    summary: mindMap.summary,
    sourceNodeIds: [],
    accentColor: '#3b82f6',
  };
  nodesRecord[rootId] = rootNode;

  const seenLabels = new Set<string>();
  seenLabels.add(rawTitle.toLowerCase());

  mindMap.sections.forEach((sec, sIdx) => {
    const cleanSectionTitle = sanitizeConceptLabel(sec.title);
    if (!isValidVisualConceptTitle(cleanSectionTitle)) return;
    const normKey = cleanSectionTitle.toLowerCase();
    if (seenLabels.has(normKey)) return;
    seenLabels.add(normKey);

    const sectionVisualId = `vis-sec-${sec.id || sIdx}`;
    const branchColor = ACCENT_PALETTE[sIdx % ACCENT_PALETTE.length];

    const childNodes: VisualMindMapNode[] = [];

    if (sec.items) {
      sec.items.forEach((item, iIdx) => {
        const itemLabel = sanitizeConceptLabel(item.title || item.content);
        if (!isValidVisualConceptTitle(itemLabel)) return;
        const itemNormKey = itemLabel.toLowerCase();
        if (seenLabels.has(itemNormKey) || itemNormKey === normKey) return;
        seenLabels.add(itemNormKey);

        const itemVisualId = `vis-item-${sec.id || sIdx}-${iIdx}`;
        const itemVisualNode: VisualMindMapNode = {
          id: itemVisualId,
          label: itemLabel,
          type: item.type === 'process' ? 'process' : 'concept',
          importance: 'medium',
          parentId: sectionVisualId,
          depth: 2,
          collapsedByDefault: true,
          childIds: [],
          summary: item.details,
          definition: item.details,
          sourceNodeIds: [item.id],
          accentColor: branchColor,
        };

        nodesRecord[itemVisualId] = itemVisualNode;
        childNodes.push(itemVisualNode);
      });
    }

    const sectionVisualNode: VisualMindMapNode = {
      id: sectionVisualId,
      label: cleanSectionTitle,
      type: 'major_concept',
      importance: 'high',
      parentId: rootId,
      depth: 1,
      collapsedByDefault: false,
      childIds: childNodes.map((c) => c.id),
      summary: sec.summary,
      definition: sec.definition,
      formulas: sec.formulas?.map((f) => ({
        latex: f.latex,
        variables: f.variables,
        meaning: f.meaning,
        unit: f.unit,
      })),
      sourceNodeIds: [sec.id],
      accentColor: branchColor,
    };

    nodesRecord[sectionVisualId] = sectionVisualNode;
    rootNode.childIds.push(sectionVisualId);
  });

  function buildTreeNode(nodeId: string): VisualTreeNode {
    const node = nodesRecord[nodeId];
    return {
      id: node.id,
      label: node.label,
      type: node.type,
      importance: node.importance,
      depth: node.depth,
      color: node.accentColor || '#3b82f6',
      node,
      children: node.childIds && node.childIds.length > 0
        ? node.childIds.map(buildTreeNode)
        : undefined,
    };
  }

  const tree = buildTreeNode(rootId);

  return {
    title: rawTitle,
    subject: mindMap.subject || subject,
    grade: mindMap.grade || grade,
    rootNodeId: rootId,
    nodes: nodesRecord,
    tree,
    crossLinks: [],
    totalKnowledgeNodes: mindMap.sections.length,
    visualNodeCount: Object.keys(nodesRecord).length,
  };
}
