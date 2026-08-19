/**
 * ShikshaSetu — Visual Revision Mind Map & Canonical Knowledge Graph Type Definitions
 * General-Purpose Multi-Stage Academic Knowledge Engine
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
  | 'diagram'
  | 'table';

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

// ──────────────────────────────────────────
// 1. SOURCE PROVENANCE & SPANS
// ──────────────────────────────────────────

export type SourceSpanType = 'text' | 'heading' | 'formula' | 'table' | 'list' | 'step' | 'algorithm';

export interface SourceRef {
  readonly id: string;
  readonly start: number;
  readonly end: number;
  readonly rawText: string;
  readonly type: SourceSpanType;
  readonly page?: number;
  readonly section?: string;
}

export interface SourceReference {
  readonly id?: string;
  readonly sourceType?: 'uploaded_notes' | 'textbook' | 'lecture';
  readonly page?: number;
  readonly section?: string;
  readonly excerpt: string;
  readonly start?: number;
  readonly end?: number;
}

export interface ExtractionContext {
  readonly sourceSpanId: string;
  readonly outlineNodeId: string;
  readonly parentKnowledgeNodeId?: string | null;
  readonly sectionPath: string[];
}

// ──────────────────────────────────────────
// 2. FORMULA VAULT (IMMUTABLE MATHEMATICS)
// ──────────────────────────────────────────

export interface FormulaBlock {
  readonly id?: string;
  readonly latex: string;
  readonly raw?: string;
  readonly meaning?: string;
  readonly variables?: string;
  readonly unit?: string;
  readonly condition?: string;
  readonly sourceRef?: string;
}

export interface FormulaVaultEntry {
  readonly id: string;
  readonly raw: string;
  readonly latex: string;
  readonly meaning?: string;
  readonly variables?: string[];
  readonly sourceRef?: string;
  readonly start?: number;
  readonly end?: number;
}

// ──────────────────────────────────────────
// 3. TABLE VAULT (STRUCTURED TABULAR DATA)
// ──────────────────────────────────────────

export interface TableStructure {
  readonly id?: string;
  readonly title?: string;
  readonly headers: string[];
  readonly rows: string[][];
  readonly sourceRef?: string;
}

export interface TableVaultEntry {
  readonly id: string;
  readonly title?: string;
  readonly columns: string[];
  readonly rows: string[][];
  readonly sourceRef?: string;
}

// ──────────────────────────────────────────
// 4. CANONICAL KNOWLEDGE GRAPH MODEL
// ──────────────────────────────────────────

export type KnowledgeNodeType =
  | 'root'
  | 'unit'
  | 'chapter'
  | 'section'
  | 'topic'
  | 'subtopic'
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
  | 'study_tip'
  | 'table';

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
  | 'summarized_by'
  | 'proves'
  | 'applies_to'
  | 'is_a'
  | 'compared_with'
  | 'represented_by'
  | 'converts_to';

export interface KnowledgeNode {
  readonly id: string;
  readonly parentId?: string | null;
  readonly title: string;
  readonly type: KnowledgeNodeType;
  readonly importance: SemanticImportance;
  readonly summary?: string;
  readonly level?: number;
  readonly sourceText?: string;
  readonly sourceSpanId?: string;
  readonly context?: ExtractionContext;
  
  // Specific semantic structures
  readonly definitions?: string[];
  readonly properties?: string[];
  readonly keyPoints?: string[];
  readonly formulas?: FormulaBlock[];
  readonly formulaRefs?: string[];
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
  readonly tableRefs?: string[];

  // Source Provenance
  readonly sourceRefs?: string[];
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
  readonly formulas?: FormulaVaultEntry[];
  readonly tables?: TableVaultEntry[];
  readonly sourceRefs?: SourceRef[];
  readonly sourceReferences?: SourceReference[];
}

// ──────────────────────────────────────────
// 5. STRUCTURAL PARSING EVIDENCE & OUTLINES
// ──────────────────────────────────────────

export interface StructuralEvidenceNode {
  readonly id: string;
  readonly title: string;
  readonly level: number;
  readonly rawText: string;
  readonly numberingPrefix?: string;
  readonly detectedType: 'unit' | 'section' | 'topic' | 'subtopic' | 'algorithm' | 'step' | 'list_item' | 'table' | 'text';
  readonly parentId?: string | null;
  readonly children: StructuralEvidenceNode[];
  readonly formulaRefs: string[];
  readonly tableRefs: string[];
  readonly sourceSpan: SourceRef;
}

export interface DocumentStructureEvidence {
  readonly title: string;
  readonly rawText: string;
  readonly cleanedText: string;
  readonly rootNodes: StructuralEvidenceNode[];
  readonly sourceRefs: SourceRef[];
  readonly formulaVault: FormulaVaultEntry[];
  readonly tableVault: TableVaultEntry[];
}

// ──────────────────────────────────────────
// 6. VALIDATION & CRITIC REPORTS
// ──────────────────────────────────────────

export interface ValidationIssue {
  readonly code: string;
  readonly severity: 'critical' | 'warning' | 'info';
  readonly message: string;
  readonly nodeId?: string;
  readonly autoFixable?: boolean;
}

export interface FidelityReport {
  readonly score: number; // 0 - 100
  readonly headingCoverage: number;
  readonly formulaPreservation: number;
  readonly tablePreservation: number;
  readonly conceptCoverage: number;
  readonly sourceReferenceCoverage: number;
  readonly relationshipIntegrity: number;
  readonly hierarchyIntegrity: number;
  readonly issues: ValidationIssue[];
}

// ──────────────────────────────────────────
// 7. HIERARCHICAL CONCEPT ARCHITECT TREE MODEL
// ──────────────────────────────────────────

export interface HierarchicalConceptTreeNode {
  readonly title: string;
  readonly summary?: string;
  readonly priority?: 'high' | 'medium' | 'low';
  readonly example?: string;
  readonly formulas?: string[];
  readonly formulaRefs?: string[];
  readonly tableRefs?: string[];
  readonly sourceRefs?: string[];
  readonly children?: HierarchicalConceptTreeNode[];
}

export interface HierarchicalConceptTree {
  readonly title: string;
  readonly summary: string;
  readonly children: HierarchicalConceptTreeNode[];
}

// ──────────────────────────────────────────
// 8. VISUAL MIND MAP (CONSUMER OF KNOWLEDGE GRAPH)
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
  readonly table?: TableStructure;
  readonly source?: SourceReference;
  readonly sourceRefs?: string[];
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
