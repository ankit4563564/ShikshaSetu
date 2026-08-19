/**
 * ShikshaSetu — Visual Revision Mind Map & Knowledge Graph Zod Schemas
 * Semantic Hierarchy, Extended Node Roles, and Canonical Validation
 */

import { z } from 'zod';
import type { ConceptMindMap, ConceptAccentColor, KnowledgeGraph } from './types';

const ACCENT_COLORS: ConceptAccentColor[] = ['blue', 'green', 'orange', 'purple', 'red', 'teal'];

export const SourceSpanTypeSchema = z.enum(['text', 'heading', 'formula', 'table', 'list', 'step', 'algorithm']);

export const SourceRefSchema = z.object({
  id: z.string(),
  start: z.number(),
  end: z.number(),
  rawText: z.string(),
  type: SourceSpanTypeSchema,
  page: z.number().int().positive().optional(),
  section: z.string().optional(),
});

export const SourceReferenceSchema = z.object({
  id: z.string().optional(),
  sourceType: z.enum(['uploaded_notes', 'textbook', 'lecture']).optional().default('uploaded_notes'),
  page: z.number().int().positive().optional(),
  section: z.string().optional(),
  excerpt: z.string().default(''),
  start: z.number().optional(),
  end: z.number().optional(),
});

export const FormulaBlockSchema = z.object({
  id: z.string().optional(),
  latex: z.string().min(1, 'Formula latex cannot be empty'),
  raw: z.string().optional(),
  meaning: z.string().optional(),
  variables: z.string().optional(),
  unit: z.string().optional(),
  condition: z.string().optional(),
  sourceRef: z.string().optional(),
});

export const FormulaVaultEntrySchema = z.object({
  id: z.string(),
  raw: z.string(),
  latex: z.string(),
  meaning: z.string().optional(),
  variables: z.array(z.string()).optional(),
  sourceRef: z.string(),
  start: z.number().optional(),
  end: z.number().optional(),
});

export const TableStructureSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  sourceRef: z.string().optional(),
});

export const TableVaultEntrySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  sourceRef: z.string().optional(),
});

// ──────────────────────────────────────────
// SEMANTIC KNOWLEDGE GRAPH SCHEMAS
// ──────────────────────────────────────────

export const KnowledgeNodeTypeSchema = z.enum([
  'root',
  'unit',
  'chapter',
  'section',
  'topic',
  'subtopic',
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
  'table',
]);

export const KnowledgeRelationshipTypeSchema = z.enum([
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
  'proves',
  'applies_to',
  'is_a',
  'compared_with',
  'represented_by',
  'converts_to',
]);

export const ExtractionContextSchema = z.object({
  sourceSpanId: z.string(),
  outlineNodeId: z.string(),
  parentKnowledgeNodeId: z.string().nullable().optional(),
  sectionPath: z.array(z.string()),
});

export const KnowledgeNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  parentId: z.string().nullable().optional(),
  title: z.string().min(1, 'Node title is required'),
  type: KnowledgeNodeTypeSchema,
  importance: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  summary: z.string().optional(),
  level: z.number().optional(),
  sourceText: z.string().optional(),
  sourceSpanId: z.string().optional(),
  context: ExtractionContextSchema.optional(),
  
  definitions: z.array(z.string()).optional().default([]),
  properties: z.array(z.string()).optional().default([]),
  keyPoints: z.array(z.string()).optional().default([]),
  formulas: z.array(FormulaBlockSchema).optional().default([]),
  formulaRefs: z.array(z.string()).optional().default([]),
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
  tableRefs: z.array(z.string()).optional().default([]),

  sourceRefs: z.array(z.string()).optional().default([]),
  sourceReferences: z.array(SourceReferenceSchema).optional().default([]),
});

export const KnowledgeRelationshipSchema = z.object({
  fromNodeId: z.string().min(1, 'fromNodeId is required'),
  toNodeId: z.string().min(1, 'toNodeId is required'),
  type: KnowledgeRelationshipTypeSchema,
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
    formulas: z.array(FormulaVaultEntrySchema).optional().default([]),
    tables: z.array(TableVaultEntrySchema).optional().default([]),
    sourceRefs: z.array(SourceRefSchema).optional().default([]),
    sourceReferences: z.array(SourceReferenceSchema).optional().default([]),
    telemetry: z.record(z.any()).optional(),
    qualityReport: z.record(z.any()).optional(),
  })
  .superRefine((kg, ctx) => {
    const nodeIds = new Set<string>();
    const nodeMap = new Map<string, z.infer<typeof KnowledgeNodeSchema>>();
    const relKeySet = new Set<string>();

    // 1. Check duplicate node IDs
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
    }

    // 2. Validate parentId references & algorithm step containment
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
        if (node.type === 'algorithm_step' && parentNode && parentNode.type !== 'algorithm') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Algorithm step "${node.title}" must have an algorithm parent (found: ${parentNode.type})`,
            path: ['nodes', i, 'type'],
          });
        }
      }
    }

    // 3. Validate relationship references
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

    // 4. Validate duplicate source ownership
    const sourceOwnerMap = new Map<string, string>();
    for (let i = 0; i < kg.nodes.length; i++) {
      const node = kg.nodes[i];
      if (node.sourceRefs) {
        for (const refId of node.sourceRefs) {
          if (sourceOwnerMap.has(refId)) {
            const ownerId = sourceOwnerMap.get(refId);
            if (ownerId !== node.id && refId !== 'src-root-doc') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Duplicate source ownership: Span ${refId} is claimed by both ${ownerId} and ${node.id}`,
                path: ['nodes', i, 'sourceRefs'],
              });
            }
          }
          sourceOwnerMap.set(refId, node.id);
        }
      }
    }

    // 5. Validate missing source ownership
    if (kg.sourceRefs) {
      const claimedSpans = new Set<string>();
      for (const node of kg.nodes) {
        if (node.sourceRefs) {
          for (const refId of node.sourceRefs) {
            claimedSpans.add(refId);
          }
        }
      }

      for (let i = 0; i < kg.sourceRefs.length; i++) {
        const srcRef = kg.sourceRefs[i];
        if (srcRef.type !== 'noise' && srcRef.id !== 'src-root-doc') {
          if (!claimedSpans.has(srcRef.id)) {
            let referenced = false;
            if (srcRef.type === 'formula') {
              referenced = kg.nodes.some(
                (n) => n.formulaRefs?.includes(srcRef.id) || n.formulas?.some((f) => f.sourceRef === srcRef.id)
              );
            } else if (srcRef.type === 'table') {
              referenced = kg.nodes.some(
                (n) => n.tableRefs?.includes(srcRef.id) || n.table?.sourceRef === srcRef.id
              );
            }

            if (!referenced) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Missing source ownership: Source span ${srcRef.id} ("${srcRef.rawText.slice(0, 30)}") is not claimed by any node`,
                path: ['sourceRefs', i],
              });
            }
          }
        }
      }
    }

    // 6. Validate invalid source references
    if (kg.sourceRefs) {
      const validSpanIds = new Set(kg.sourceRefs.map((s) => s.id));
      validSpanIds.add('src-root-doc');
      if (kg.formulas) {
        kg.formulas.forEach((f) => validSpanIds.add(f.sourceRef));
      }
      if (kg.tables) {
        kg.tables.forEach((t) => {
          if (t.sourceRef) validSpanIds.add(t.sourceRef);
        });
      }

      for (let i = 0; i < kg.nodes.length; i++) {
        const node = kg.nodes[i];
        if (node.sourceRefs) {
          for (const refId of node.sourceRefs) {
            if (!validSpanIds.has(refId) && !refId.startsWith('src-node-')) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Node ${node.id} has invalid source reference: ${refId}`,
                path: ['nodes', i, 'sourceRefs'],
              });
            }
          }
        }
      }
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
    formulaRefs: z.array(z.string()).optional().default([]),
    tableRefs: z.array(z.string()).optional().default([]),
    sourceRefs: z.array(z.string()).optional().default([]),
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
      type: 'root',
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
      : 'topic';

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
      formulaRefs: node.formulaRefs || [],
      tableRefs: node.tableRefs || [],
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
    return { success: true, data: validated as KnowledgeGraph };
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
      'table',
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
    table: TableStructureSchema.optional(),
    source: SourceReferenceSchema.optional(),
    sourceRefs: z.array(z.string()).optional().default([]),
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
  telemetry: z.record(z.any()).optional(),
  qualityReport: z.record(z.any()).optional(),
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
