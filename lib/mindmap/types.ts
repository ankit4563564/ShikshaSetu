/**
 * ShikshaSetu — Visual Revision Mind Map Type Definitions
 * Rich Semantic Grouping & Formula Atomicity Model
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
export type PreferredRegion = 'top' | 'left' | 'center' | 'right' | 'bottom';

export type DeclarativeDiagramType =
  | 'process-flow'
  | 'comparison'
  | 'hierarchy'
  | 'physics-setup'
  | 'circuit-capacitor';

export interface SourceReference {
  readonly id?: string;
  readonly page?: number;
  readonly section?: string;
  readonly excerpt: string;
}

export interface MindMapItem {
  readonly id: string;
  readonly type: MindMapItemType;
  readonly title?: string;
  readonly content: string;
  readonly details?: string; // Variable meanings and explanations
  readonly condition?: string; // Conditions for validity (e.g. "At constant temperature")
  readonly unit?: string; // SI units (e.g. "Ampere (A)", "Volt (V)", "Ohm (Ω)")
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
  readonly density?: DensityLevel;
  readonly preferredRegion?: PreferredRegion;
  readonly summary?: string;
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
}
