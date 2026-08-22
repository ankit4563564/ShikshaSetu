import { describe, it, expect } from 'vitest';
import {
  buildVisualMindMapModel,
  isValidVisualConceptTitle,
  sanitizeConceptLabel,
} from '@/lib/mindmap/visualMindMapModel';
import { deriveDeterministicKnowledgeGraphFromNotes } from '@/lib/mindmap/knowledgeGraphExtractor';
import type { KnowledgeGraph } from '@/lib/mindmap/types';

describe('VisualMindMapModel — Strict Academic Projection & Quality Gate Tests', () => {
  it('1. should reject sentence fragments, questions, OCR junk, and isolated variables', () => {
    // Bad fragments that must NEVER be visual nodes
    expect(isValidVisualConceptTitle('How much current will flow through the circuit?')).toBe(false);
    expect(isValidVisualConceptTitle('What is the resistance of a conductor?')).toBe(false);
    expect(isValidVisualConceptTitle('given by')).toBe(false);
    expect(isValidVisualConceptTitle('V')).toBe(false);
    expect(isValidVisualConceptTitle('R Ω')).toBe(false);
    expect(isValidVisualConceptTitle('12V')).toBe(false);
    expect(isValidVisualConceptTitle('Page 200')).toBe(false);
    expect(isValidVisualConceptTitle('Fig. 11.2')).toBe(false);
    expect(isValidVisualConceptTitle('Activity 11.1')).toBe(false);
    expect(isValidVisualConceptTitle('resistance of a metal wire of length 1 m')).toBe(false);
    expect(isValidVisualConceptTitle('You need not memorise this table.')).toBe(false);

    // Good concepts that must pass
    expect(isValidVisualConceptTitle('Electric Current')).toBe(true);
    expect(isValidVisualConceptTitle('Potential Difference')).toBe(true);
    expect(isValidVisualConceptTitle("Ohm's Law")).toBe(true);
    expect(isValidVisualConceptTitle('Resistance')).toBe(true);
    expect(isValidVisualConceptTitle('Factors Affecting Resistance')).toBe(true);
    expect(isValidVisualConceptTitle("Joule's Law of Heating")).toBe(true);
  });

  it('2. should build clean VisualMindMapModel filtering out low-value and fragment nodes', () => {
    const noisyGraph: KnowledgeGraph = {
      title: 'Electricity',
      subject: 'Physics',
      grade: '10',
      summary: 'Study of electrical phenomena and circuits.',
      nodes: [
        { id: 'root-1', title: 'Electricity', type: 'root', parentId: null, importance: 'critical' },
        { id: 'sec-1', title: "Ohm's Law", type: 'section', parentId: 'root-1', importance: 'high' },
        { id: 'topic-1', title: 'Resistance', type: 'topic', parentId: 'sec-1', importance: 'medium' },
        { id: 'frag-1', title: 'How much current will flow?', type: 'topic', parentId: 'sec-1', importance: 'low' },
        { id: 'frag-2', title: 'given by', type: 'topic', parentId: 'sec-1', importance: 'low' },
        { id: 'frag-3', title: '12V', type: 'topic', parentId: 'sec-1', importance: 'low' },
        { id: 'frag-4', title: 'Page 204', type: 'topic', parentId: 'sec-1', importance: 'low' },
      ],
      relationships: [
        { fromNodeId: 'root-1', toNodeId: 'sec-1', type: 'contains' },
        { fromNodeId: 'sec-1', toNodeId: 'topic-1', type: 'contains' },
        { fromNodeId: 'sec-1', toNodeId: 'frag-1', type: 'contains' },
        { fromNodeId: 'sec-1', toNodeId: 'frag-2', type: 'contains' },
      ],
    };

    const visualModel = buildVisualMindMapModel(noisyGraph);

    // Root should be present
    expect(visualModel.tree.label).toBe('Electricity');

    // "Ohm's Law" and "Resistance" should be present
    const labels = Object.values(visualModel.nodes).map((n) => n.label);
    expect(labels).toContain("Ohm's Law");
    expect(labels).toContain('Resistance');

    // Fragments and questions must NOT be in the visual model
    expect(labels).not.toContain('How much current will flow?');
    expect(labels).not.toContain('given by');
    expect(labels).not.toContain('12V');
    expect(labels).not.toContain('Page 204');
  });

  it('3. should group excessive children (>7) into semantic subcategories', () => {
    const broadSectionGraph: KnowledgeGraph = {
      title: 'Thermodynamics',
      subject: 'Physics',
      grade: '11',
      nodes: [
        { id: 'root', title: 'Thermodynamics', type: 'root', parentId: null, importance: 'critical' },
        { id: 'sec-1', title: 'Heat Transfer', type: 'section', parentId: 'root', importance: 'high' },
        ...Array.from({ length: 12 }, (_, i) => ({
          id: `child-${i}`,
          title: `Mechanism ${i + 1}`,
          type: 'topic' as const,
          parentId: 'sec-1',
          importance: 'medium' as const,
        })),
      ],
      relationships: [],
    };

    const visualModel = buildVisualMindMapModel(broadSectionGraph);
    const heatTransferNode = Object.values(visualModel.nodes).find((n) => n.label === 'Heat Transfer');

    expect(heatTransferNode).toBeDefined();
    // Direct children should be grouped sub-categories rather than 12 flat cards
    expect(heatTransferNode!.childIds.length).toBeLessThanOrEqual(3);
  });

  it('4. should extract Electricity fixture into a clean student-ready visual hierarchy', () => {
    const electricityNotes = `Chapter: Electricity and Circuits
1. Electric Charge and Current:
Electric current is rate of flow of charge: I = Q / t. SI Unit: Ampere (A).
2. Potential Difference:
Work done per unit charge: V = W / Q. SI Unit: Volt (V).
3. Ohm's Law and Resistance:
At constant temperature, potential difference is proportional to current: V = I * R. SI Unit: Ohm (Ω).
4. Series and Parallel Resistors:
Series: R_s = R1 + R2. Parallel: 1 / R_p = 1 / R1 + 1 / R2.
5. Joule's Law of Heating:
Heat produced: H = I^2 * R * t.`;

    const canonicalGraph = deriveDeterministicKnowledgeGraphFromNotes(
      'Electricity and Circuits',
      'Physics',
      '10',
      electricityNotes
    );

    const visualModel = buildVisualMindMapModel(canonicalGraph);

    // 1. Root verification
    expect(visualModel.tree.label).toContain('Electricity');
    expect(visualModel.tree.depth).toBe(0);

    // 2. Depth 1 Major Concepts (Between 4 and 8)
    const majorConcepts = visualModel.tree.children || [];
    expect(majorConcepts.length).toBeGreaterThanOrEqual(3);
    expect(majorConcepts.length).toBeLessThanOrEqual(8);

    const majorLabels = majorConcepts.map((c) => c.label.toLowerCase());
    expect(majorLabels.some((l) => l.includes('current'))).toBe(true);
    expect(majorLabels.some((l) => l.includes('potential') || l.includes('difference'))).toBe(true);
    expect(majorLabels.some((l) => l.includes("ohm's law") || l.includes('resistance'))).toBe(true);

    // 3. Formula preservation in metadata (attached to concept, not standalone loose nodes)
    const allVisualLabels = Object.values(visualModel.nodes).map((n) => n.label);
    expect(allVisualLabels).not.toContain('V = I * R');
    expect(allVisualLabels).not.toContain('I = Q / t');

    // Formulas are attached to node metadata
    const ohmsNode = Object.values(visualModel.nodes).find(
      (n) => n.label.toLowerCase().includes("ohm's law") || n.label.toLowerCase().includes('resistance')
    );
    expect(ohmsNode?.formulas && ohmsNode.formulas.length > 0).toBe(true);
  });
});
