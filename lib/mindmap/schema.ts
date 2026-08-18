/**
 * ShikshaSetu — Visual Revision Mind Map & Knowledge Graph Zod Schemas
 * Semantic Hierarchy, Node Classification, and Extended Relationship Validation
 */

import { z } from 'zod';
import type { ConceptMindMap, ConceptAccentColor, KnowledgeGraph } from './types';

const ACCENT_COLORS: ConceptAccentColor[] = ['blue', 'green', 'orange', 'purple', 'red', 'teal'];

export const SourceReferenceSchema = z.object({
  id: z.string().optional(),
  sourceType: z.enum(['uploaded_notes', 'textbook', 'lecture']).optional().default('uploaded_notes'),
  page: z.number().int().positive().optional(),
  section: z.string().optional(),
  excerpt: z.string().default(''),
});

export const FormulaBlockSchema = z.object({
  latex: z.string().min(1, 'Formula latex cannot be empty'),
  meaning: z.string().optional(),
  variables: z.string().optional(),
  unit: z.string().optional(),
  condition: z.string().optional(),
});

export const TableStructureSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

// ──────────────────────────────────────────
// SEMANTIC KNOWLEDGE GRAPH SCHEMAS
// ──────────────────────────────────────────

export const KnowledgeNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  parentId: z.string().nullable().optional(),
  title: z.string().min(1, 'Node title is required'),
  type: z.enum([
    'chapter',
    'section',
    'concept',
    'sub_concept',
    'definition',
    'property',
    'formula',
    'theorem',
    'law',
    'algorithm',
    'algorithm_step',
    'example',
    'comparison',
    'application',
    'condition',
    'warning',
    'summary',
    'study_tip',
  ]),
  importance: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  summary: z.string().optional(),
  
  definitions: z.array(z.string()).optional().default([]),
  properties: z.array(z.string()).optional().default([]),
  keyPoints: z.array(z.string()).optional().default([]),
  formulas: z.array(FormulaBlockSchema).optional().default([]),
  examples: z.array(z.string()).optional().default([]),
  applications: z.array(z.string()).optional().default([]),
  conditions: z.array(z.string()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
  studyTips: z.array(z.string()).optional().default([]),

  purpose: z.string().optional(),
  steps: z.array(z.string()).optional().default([]),

  statement: z.string().optional(),
  proofTechnique: z.string().optional(),

  table: TableStructureSchema.optional(),

  sourceReferences: z.array(SourceReferenceSchema).optional().default([]),
});

export const KnowledgeRelationshipSchema = z.object({
  fromNodeId: z.string().min(1, 'fromNodeId is required'),
  toNodeId: z.string().min(1, 'toNodeId is required'),
  type: z.enum([
    'contains',
    'has_property',
    'defined_by',
    'has_formula',
    'uses_algorithm',
    'has_step',
    'equivalent_to',
    'contrasts_with',
    'example_of',
    'application_of',
    'depends_on',
    'leads_to',
    'summarized_by',
  ]),
  label: z.string().optional(),
});

export const KnowledgeGraphSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(1, 'Knowledge Graph title is required'),
    subject: z.string().default('General Science'),
    grade: z.string().default('8'),
    summary: z.string().min(1, 'Knowledge Graph summary is required'),
    nodes: z.array(KnowledgeNodeSchema).min(1, 'Knowledge Graph must contain at least one node'),
    relationships: z.array(KnowledgeRelationshipSchema).default([]),
    sourceReferences: z.array(SourceReferenceSchema).optional().default([]),
  })
  .superRefine((kg, ctx) => {
    const nodeIds = new Set<string>();
    const nodeMap = new Map<string, z.infer<typeof KnowledgeNodeSchema>>();
    const relKeySet = new Set<string>();

    let rootCount = 0;

    // 1. Check duplicate node IDs & count roots
    for (let i = 0; i < kg.nodes.length; i++) {
      const node = kg.nodes[i];
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate node ID detected: ${node.id}`,
          path: ['nodes', i, 'id'],
        });
      }
      nodeIds.add(node.id);
      nodeMap.set(node.id, node);

      if (!node.parentId || node.type === 'chapter') {
        rootCount++;
      }
    }

    // 2. Validate parentId references & semantic containment
    for (let i = 0; i < kg.nodes.length; i++) {
      const node = kg.nodes[i];
      if (node.parentId) {
        if (!nodeIds.has(node.parentId) && node.parentId !== node.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Node ${node.id} references non-existent parentId: ${node.parentId}`,
            path: ['nodes', i, 'parentId'],
          });
        }

        const parentNode = nodeMap.get(node.parentId);
        // Rule: algorithm_step must have an algorithm parent
        if (node.type === 'algorithm_step' && parentNode && parentNode.type !== 'algorithm') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Algorithm step "${node.title}" must have an algorithm parent (found: ${parentNode.type})`,
            path: ['nodes', i, 'type'],
          });
        }
      }
    }

    // 3. Validate relationship references & prevent duplicate relationships
    for (let i = 0; i < kg.relationships.length; i++) {
      const rel = kg.relationships[i];
      if (!nodeIds.has(rel.fromNodeId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Relationship references non-existent fromNodeId: ${rel.fromNodeId}`,
          path: ['relationships', i, 'fromNodeId'],
        });
      }
      if (!nodeIds.has(rel.toNodeId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Relationship references non-existent toNodeId: ${rel.toNodeId}`,
          path: ['relationships', i, 'toNodeId'],
        });
      }

      const relKey = `${rel.fromNodeId}->${rel.toNodeId}:${rel.type}`;
      if (relKeySet.has(relKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate relationship detected: ${relKey}`,
          path: ['relationships', i],
        });
      }
      relKeySet.add(relKey);
    }
  });

// ──────────────────────────────────────────
// HIERARCHICAL CONCEPT ARCHITECT TREE SCHEMA
// ──────────────────────────────────────────

export const HierarchicalConceptTreeNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    title: z.string().min(1, 'Title is required'),
    summary: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
    example: z.string().optional(),
    formulas: z.array(z.string()).optional().default([]),
    children: z.array(HierarchicalConceptTreeNodeSchema).optional().default([]),
  })
);

export const HierarchicalConceptTreeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().optional().default(''),
  children: z.array(HierarchicalConceptTreeNodeSchema).default([]),
});

export function convertConceptTreeToKnowledgeGraph(
  tree: z.infer<typeof HierarchicalConceptTreeSchema>,
  subject = 'Computer Science',
  grade = 'University'
): KnowledgeGraph {
  const rootId = 'node-chapter-root';
  const nodes: any[] = [
    {
      id: rootId,
      parentId: null,
      title: tree.title,
      type: 'chapter',
      importance: 'critical',
      summary: tree.summary,
      keyPoints: [],
    },
  ];
  const relationships: any[] = [];

  let nodeCounter = 1;

  function traverse(node: any, parentId: string, depth: number) {
    const currentId = `node-concept-${nodeCounter++}`;
    const isStep = /^(?:step\s*\d+|create\s*dfa\s*states|initial\s*dfa\s*state|for\s*each\s*dfa\s*state|final\s*dfa\s*states)/i.test(node.title);
    const isAlgo = /subset\s*construction|algorithm|conversion/i.test(node.title);
    const isTheorem = /theorem|law/i.test(node.title);

    const type = isStep
      ? 'algorithm_step'
      : isAlgo
      ? 'algorithm'
      : isTheorem
      ? 'theorem'
      : depth === 1
      ? 'section'
      : 'concept';

    const kNode: any = {
      id: currentId,
      parentId,
      title: node.title,
      type,
      importance: node.priority === 'high' ? 'critical' : node.priority === 'low' ? 'low' : 'medium',
      summary: node.summary,
      definitions: node.summary ? [node.summary] : [],
      examples: node.example ? [node.example] : [],
      keyPoints: [],
      formulas: [],
      properties: [],
      steps: [],
    };

    if (node.formulas && Array.isArray(node.formulas)) {
      kNode.formulas = node.formulas.map((f: string) => ({ latex: f }));
    }

    nodes.push(kNode);

    relationships.push({
      fromNodeId: parentId,
      toNodeId: currentId,
      type: isStep ? 'has_step' : isAlgo ? 'uses_algorithm' : 'contains',
      label: isStep ? 'Step' : 'Child concept',
    });

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child, currentId, depth + 1);
      }
    }
  }

  if (tree.children && Array.isArray(tree.children)) {
    for (const topChild of tree.children) {
      traverse(topChild, rootId, 1);
    }
  }

  return {
    title: tree.title,
    subject,
    grade,
    summary: tree.summary || `Concept map for ${tree.title}`,
    nodes,
    relationships,
  };
}

export function safeValidateKnowledgeGraph(raw: unknown): { success: true; data: KnowledgeGraph } | { success: false; error: string } {
  try {
    // 1. Try direct KnowledgeGraph parsing
    const validated = KnowledgeGraphSchema.parse(raw);
    return { success: true, data: validated };
  } catch (err: any) {
    // 2. Try Hierarchical Concept Tree parsing
    try {
      const treeParsed = HierarchicalConceptTreeSchema.parse(raw);
      if (treeParsed.children && treeParsed.children.length > 0) {
        const converted = convertConceptTreeToKnowledgeGraph(treeParsed);
        return { success: true, data: converted };
      }
    } catch {
      // Fall through
    }
    return { success: false, error: err.message || 'Invalid knowledge graph schema' };
  }
}

// ──────────────────────────────────────────
// VISUAL MIND MAP SCHEMAS
// ──────────────────────────────────────────

export const MindMapItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().default(() => `item-${Math.random().toString(36).slice(2, 9)}`),
    type: z.enum([
      'concept',
      'definition',
      'formula',
      'example',
      'condition',
      'comparison',
      'key_point',
      'warning',
      'process',
      'diagram',
    ]),
    title: z.string().optional(),
    content: z.string().min(1, 'Item content cannot be empty'),
    details: z.string().optional(),
    condition: z.string().optional(),
    unit: z.string().optional(),
    diagramType: z.enum([
      'process-flow',
      'comparison',
      'hierarchy',
      'physics-setup',
      'circuit-capacitor',
    ]).optional(),
    diagramData: z.record(z.string(), z.any()).optional(),
    source: SourceReferenceSchema.optional(),
    children: z.array(MindMapItemSchema).optional().default([]),
  })
);

export const MindMapRelationshipSchema = z.object({
  fromSectionId: z.string(),
  toSectionId: z.string(),
  label: z.string().optional(),
  type: z.enum(['depends_on', 'contrasts_with', 'derives', 'combines_to']).optional().default('depends_on'),
});

export const MindMapSectionSchema = z.object({
  id: z.string().default(() => `sec-${Math.random().toString(36).slice(2, 9)}`),
  title: z.string().min(1, 'Section title is required'),
  accentColor: z.enum(['blue', 'green', 'orange', 'purple', 'red', 'teal']).optional(),
  importance: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  layoutSpan: z.enum(['full', 'half', 'third']).optional().default('half'),
  density: z.enum(['compact', 'normal', 'dense']).optional().default('normal'),
  summary: z.string().optional(),
  definition: z.string().optional(),
  formulas: z.array(FormulaBlockSchema).optional().default([]),
  keyPoints: z.array(z.string()).optional().default([]),
  conditions: z.array(z.string()).optional().default([]),
  examples: z.array(z.string()).optional().default([]),
  applications: z.array(z.string()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
  items: z.array(MindMapItemSchema).min(1, 'Each section must contain at least one item'),
  relatedSectionIds: z.array(z.string()).default([]),
});

export const ConceptMindMapSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Mind map title is required'),
  subject: z.string().default('General Science'),
  grade: z.string().default('8'),
  summary: z.string().min(1, 'Chapter summary is required'),
  sections: z.array(MindMapSectionSchema).min(1, 'Mind map must contain at least one section'),
  relationships: z.array(MindMapRelationshipSchema).default([]),
  sourceReferences: z.array(SourceReferenceSchema).optional().default([]),
  knowledgeGraph: KnowledgeGraphSchema.optional(),
});

export function normalizeConceptMindMap(raw: unknown): ConceptMindMap {
  const parsed = ConceptMindMapSchema.parse(raw);

  const sectionsWithColors = parsed.sections.map((sec, idx) => {
    const accentColor = (sec.accentColor && ACCENT_COLORS.includes(sec.accentColor as any))
      ? sec.accentColor
      : ACCENT_COLORS[idx % ACCENT_COLORS.length];

    const isMajor = sec.importance === 'critical' || sec.importance === 'high' || sec.title.toLowerCase().includes('ohm') || sec.title.toLowerCase().includes('joule') || sec.title.toLowerCase().includes('heating') || sec.title.toLowerCase().includes('automata') || sec.title.toLowerCase().includes('regex');
    const layoutSpan = sec.layoutSpan || (isMajor ? 'full' : 'half');

    return {
      ...sec,
      accentColor,
      layoutSpan,
    };
  });

  return {
    ...parsed,
    sections: sectionsWithColors,
  };
}

export function safeValidateConceptMindMap(raw: unknown): { success: true; data: ConceptMindMap } | { success: false; error: string } {
  try {
    const validated = normalizeConceptMindMap(raw);
    return { success: true, data: validated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Invalid mind map data schema' };
  }
}
