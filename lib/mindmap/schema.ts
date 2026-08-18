/**
 * ShikshaSetu — Visual Revision Mind Map & Knowledge Graph Zod Schemas
 * Phase B Knowledge Graph Model Validation & Normalization
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

// ──────────────────────────────────────────
// PHASE B: KNOWLEDGE GRAPH SCHEMAS
// ──────────────────────────────────────────

export const KnowledgeNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  parentId: z.string().nullable().optional(),
  title: z.string().min(1, 'Node title is required'),
  type: z.enum([
    'root',
    'chapter',
    'topic',
    'subtopic',
    'concept',
    'definition',
    'theorem',
    'formula',
    'algorithm',
    'example',
  ]),
  importance: z.enum(['high', 'medium', 'low']).default('medium'),
  summary: z.string().optional(),
  definitions: z.array(z.string()).optional().default([]),
  keyPoints: z.array(z.string()).optional().default([]),
  formulas: z.array(FormulaBlockSchema).optional().default([]),
  examples: z.array(z.string()).optional().default([]),
  applications: z.array(z.string()).optional().default([]),
  conditions: z.array(z.string()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
  sourceReferences: z.array(SourceReferenceSchema).optional().default([]),
});

export const KnowledgeRelationshipSchema = z.object({
  fromNodeId: z.string().min(1, 'fromNodeId is required'),
  toNodeId: z.string().min(1, 'toNodeId is required'),
  type: z.enum([
    'contains',
    'depends_on',
    'equivalent_to',
    'contrasts_with',
    'leads_to',
    'example_of',
    'application_of',
    'part_of',
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
    }

    // 2. Validate parentId references
    for (let i = 0; i < kg.nodes.length; i++) {
      const node = kg.nodes[i];
      if (node.parentId && !nodeIds.has(node.parentId) && node.parentId !== node.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Node ${node.id} references non-existent parentId: ${node.parentId}`,
          path: ['nodes', i, 'parentId'],
        });
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
    }
  });

export function safeValidateKnowledgeGraph(raw: unknown): { success: true; data: KnowledgeGraph } | { success: false; error: string } {
  try {
    const validated = KnowledgeGraphSchema.parse(raw);
    return { success: true, data: validated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Invalid knowledge graph schema' };
  }
}

// ──────────────────────────────────────────
// VISUAL MIND MAP SCHEMAS
// ──────────────────────────────────────────

export const MindMapItemSchema = z.object({
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
});

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
  importance: z.enum(['high', 'medium', 'low']).default('medium'),
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

    const isMajor = sec.importance === 'high' || sec.title.toLowerCase().includes('ohm') || sec.title.toLowerCase().includes('joule') || sec.title.toLowerCase().includes('heating') || sec.title.toLowerCase().includes('automata') || sec.title.toLowerCase().includes('regex');
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
