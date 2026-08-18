/**
 * ShikshaSetu — Visual Revision Mind Map & Knowledge Graph Type Definitions
 * Semantic Hierarchy, Extended Node Roles, and Algorithm/Theorem Specifications
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

export type SemanticImportance = 'critical' | 'high' | 'medium' | 'low';
export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';
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
// SEMANTIC KNOWLEDGE GRAPH MODEL
// ──────────────────────────────────────────

export type KnowledgeNodeType =
  | 'chapter'
  | 'section'
  | 'concept'
  | 'sub_concept'
  | 'definition'
  | 'property'
  | 'formula'
  | 'theorem'
  | 'law'
  | 'algorithm'
  | 'algorithm_step'
  | 'example'
  | 'comparison'
  | 'application'
  | 'condition'
  | 'warning'
  | 'summary'
  | 'study_tip';

export type KnowledgeRelationshipType =
  | 'contains'
  | 'has_property'
  | 'defined_by'
  | 'has_formula'
  | 'uses_algorithm'
  | 'has_step'
  | 'equivalent_to'
  | 'contrasts_with'
  | 'example_of'
  | 'application_of'
  | 'depends_on'
  | 'leads_to'
  | 'summarized_by';

export interface TableStructure {
  readonly headers: string[];
  readonly rows: string[][];
}

export interface KnowledgeNode {
  readonly id: string;
  readonly parentId?: string | null;
  readonly title: string;
  readonly type: KnowledgeNodeType;
  readonly importance: SemanticImportance;
  readonly summary?: string;
  
  // Specific semantic structures
  readonly definitions?: string[];
  readonly properties?: string[];
  readonly keyPoints?: string[];
  readonly formulas?: FormulaBlock[];
  readonly examples?: string[];
  readonly applications?: string[];
  readonly conditions?: string[];
  readonly warnings?: string[];
  readonly studyTips?: string[];

  // Algorithm-specific attributes
  readonly purpose?: string;
  readonly steps?: string[];

  // Theorem/Law-specific attributes
  readonly statement?: string;
  readonly proofTechnique?: string;

  // Comparison/Table-specific attributes
  readonly table?: TableStructure;

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
// HIERARCHICAL CONCEPT ARCHITECT TREE MODEL
// ──────────────────────────────────────────

export interface HierarchicalConceptTreeNode {
  readonly title: string;
  readonly summary?: string;
  readonly priority?: 'high' | 'medium' | 'low';
  readonly example?: string;
  readonly formulas?: string[];
  readonly children?: HierarchicalConceptTreeNode[];
}

export interface HierarchicalConceptTree {
  readonly title: string;
  readonly summary: string;
  readonly children: HierarchicalConceptTreeNode[];
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
  readonly children?: MindMapItem[];
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
