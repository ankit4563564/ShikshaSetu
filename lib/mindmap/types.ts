/**
 * ShikshaSetu — Visual Revision Mind Map & Knowledge Graph Type Definitions
 * Phase B Knowledge Graph Model & Editorial Revision Specification
 */

export type ConceptAccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal';

export type MindMapItemType =
  | 'concept'
  | 'definition'
  | 'formula'
  | 'example'
  | 'condition'
  | 'comparison'
  | 'key_point'
  | 'warning'
  | 'process'
  | 'diagram';

export type ImportanceLevel = 'high' | 'medium' | 'low';
export type DensityLevel = 'compact' | 'normal' | 'dense';
export type LayoutSpan = 'full' | 'half' | 'third';

export type DeclarativeDiagramType =
  | 'process-flow'
  | 'comparison'
  | 'hierarchy'
  | 'physics-setup'
  | 'circuit-capacitor';

export interface SourceReference {
  readonly id?: string;
  readonly sourceType?: 'uploaded_notes' | 'textbook' | 'lecture';
  readonly page?: number;
  readonly section?: string;
  readonly excerpt: string;
}

export interface FormulaBlock {
  readonly latex: string;
  readonly meaning?: string;
  readonly variables?: string;
  readonly unit?: string;
  readonly condition?: string;
}

// ──────────────────────────────────────────
// PHASE B: KNOWLEDGE GRAPH MODEL
// ──────────────────────────────────────────

export type KnowledgeNodeType =
  | 'root'
  | 'chapter'
  | 'topic'
  | 'subtopic'
  | 'concept'
  | 'definition'
  | 'theorem'
  | 'formula'
  | 'algorithm'
  | 'example';

export type KnowledgeRelationshipType =
  | 'contains'
  | 'depends_on'
  | 'equivalent_to'
  | 'contrasts_with'
  | 'leads_to'
  | 'example_of'
  | 'application_of'
  | 'part_of';

export interface KnowledgeNode {
  readonly id: string;
  readonly parentId?: string | null;
  readonly title: string;
  readonly type: KnowledgeNodeType;
  readonly importance: ImportanceLevel;
  readonly summary?: string;
  readonly definitions?: string[];
  readonly keyPoints?: string[];
  readonly formulas?: FormulaBlock[];
  readonly examples?: string[];
  readonly applications?: string[];
  readonly conditions?: string[];
  readonly warnings?: string[];
  readonly sourceReferences?: SourceReference[];
}

export interface KnowledgeRelationship {
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly type: KnowledgeRelationshipType;
  readonly label?: string;
}

export interface KnowledgeGraph {
  readonly id?: string;
  readonly title: string;
  readonly subject: string;
  readonly grade: string;
  readonly summary: string;
  readonly nodes: KnowledgeNode[];
  readonly relationships: KnowledgeRelationship[];
  readonly sourceReferences?: SourceReference[];
}

// ──────────────────────────────────────────
// VISUAL MIND MAP (CONSUMER OF KNOWLEDGE GRAPH)
// ──────────────────────────────────────────

export interface MindMapItem {
  readonly id: string;
  readonly type: MindMapItemType;
  readonly title?: string;
  readonly content: string;
  readonly details?: string;
  readonly condition?: string;
  readonly unit?: string;
  readonly diagramType?: DeclarativeDiagramType;
  readonly diagramData?: Record<string, any>;
  readonly source?: SourceReference;
}

export interface MindMapRelationship {
  readonly fromSectionId: string;
  readonly toSectionId: string;
  readonly label?: string;
  readonly type?: 'depends_on' | 'contrasts_with' | 'derives' | 'combines_to';
}

export interface MindMapSection {
  readonly id: string;
  readonly title: string;
  readonly accentColor: ConceptAccentColor;
  readonly importance: ImportanceLevel;
  readonly layoutSpan?: LayoutSpan;
  readonly density?: DensityLevel;
  readonly summary?: string;
  readonly definition?: string;
  readonly formulas?: FormulaBlock[];
  readonly keyPoints?: string[];
  readonly conditions?: string[];
  readonly examples?: string[];
  readonly applications?: string[];
  readonly warnings?: string[];
  readonly items: MindMapItem[];
  readonly relatedSectionIds: string[];
}

export interface ConceptMindMap {
  readonly id?: string;
  readonly title: string;
  readonly subject: string;
  readonly grade: string;
  readonly summary: string;
  readonly sections: MindMapSection[];
  readonly relationships: MindMapRelationship[];
  readonly sourceReferences?: SourceReference[];
  readonly knowledgeGraph?: KnowledgeGraph;
}
