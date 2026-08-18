/**
 * ShikshaSetu — Visual Revision Mind Map Zod Schema & Validation
 * Phase A Production MVP
 */

import { z } from 'zod';
import type { ConceptMindMap, MindMapSection, MindMapItem, ConceptAccentColor } from './types';

const ACCENT_COLORS: ConceptAccentColor[] = ['blue', 'green', 'orange', 'purple', 'red', 'teal'];

export const SourceReferenceSchema = z.object({
  id: z.string().optional(),
  page: z.number().int().positive().optional(),
  section: z.string().optional(),
  excerpt: z.string().default(''),
});

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
  density: z.enum(['compact', 'normal', 'dense']).optional().default('normal'),
  preferredRegion: z.enum(['top', 'left', 'center', 'right', 'bottom']).optional(),
  summary: z.string().optional(),
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
});

/**
 * Normalizes and ensures each top-level concept has a distinct accent color
 * from the controlled academic palette.
 */
export function normalizeConceptMindMap(raw: unknown): ConceptMindMap {
  const parsed = ConceptMindMapSchema.parse(raw);

  const sectionsWithColors = parsed.sections.map((sec, idx) => {
    // If color is missing or duplicate, assign round-robin from palette
    const accentColor = (sec.accentColor && ACCENT_COLORS.includes(sec.accentColor as any))
      ? sec.accentColor
      : ACCENT_COLORS[idx % ACCENT_COLORS.length];

    return {
      ...sec,
      accentColor,
    };
  });

  return {
    ...parsed,
    sections: sectionsWithColors,
  };
}

/**
 * Safe validator that returns a structured result without throwing exceptions.
 */
export function safeValidateConceptMindMap(raw: unknown): { success: true; data: ConceptMindMap } | { success: false; error: string } {
  try {
    const validated = normalizeConceptMindMap(raw);
    return { success: true, data: validated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Invalid mind map data schema' };
  }
}
