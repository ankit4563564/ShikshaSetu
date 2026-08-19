import { describe, it, expect } from 'vitest';
import {
  deriveDeterministicKnowledgeGraphFromNotes,
  convertKnowledgeGraphToMindMap,
} from '@/lib/mindmap/knowledgeGraphExtractor';
import {
  parseDocumentStructure,
} from '@/lib/mindmap/documentStructureParser';
import {
  auditKnowledgeGraph,
} from '@/lib/mindmap/criticEngine';

describe('Mind Engine — Textbook jesc111 Simulation Tests', () => {
  const simulatedNotes = `Class 8 Science
Chapter 11: Electricity

11.1 Electric Current and Circuit:
Electric current is defined as the rate of flow of electric charge through a cross-section.
Mathematical expression: I = Q / t.
SI Unit: Ampere (A).
Activity 11.1: Construct a simple circuit with battery, bulb, and ammeter.

11.2 Electric Potential and Potential Difference:
Electric potential difference between two points is work done per unit charge: V = W / Q.
SI Unit: Volt (V). Measured using a voltmeter.

11.3 Circuit Diagram:
A schematic representation using symbols for battery, key, ammeter, voltmeter, and resistors.

11.4 Ohm's Law:
Ohm's Law states that at constant temperature, current is directly proportional to potential difference: V = I * R.
Here, R is the resistance. SI Unit: Ohm (Ω).

11.5 Factors on which Resistance depends:
Resistance is proportional to length and inversely proportional to area: R = rho * l / A.

11.6 Series and Parallel combination:
Series: R_s = R1 + R2 + R3.
Parallel: 1/R_p = 1/R1 + 1/R2 + 1/R3.

11.7 Practical applications of Heating effect:
Electric bulb, electric iron, fuse wires protect circuits.`;

  it('should run end-to-end jesc111 simulation check', () => {
    console.log('[MIND ENGINE TEST] Running jesc111 simulation...');

    // 1. parseDocumentStructure
    const evidence = parseDocumentStructure('jesc111', simulatedNotes);
    console.log('[MIND ENGINE TEST] Checkpoint A - parsed evidence rootNodes count:', evidence.rootNodes.length);
    expect(evidence.rootNodes.length).toBeGreaterThan(0);

    // 2. deriveDeterministicKnowledgeGraphFromNotes
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'jesc111',
      'Science',
      '8',
      simulatedNotes
    );
    console.log('[MIND ENGINE TEST] Checkpoint B - derived graph nodes count:', graph.nodes.length);
    expect(graph.nodes.length).toBeGreaterThan(1);

    // 3. auditKnowledgeGraph
    const audit = auditKnowledgeGraph(graph, evidence);
    console.log('[MIND ENGINE TEST] Checkpoint C - audited fidelity score:', audit.score);
    expect(audit.score).toBeGreaterThanOrEqual(80);

    // 4. convertKnowledgeGraphToMindMap
    const mindMap = convertKnowledgeGraphToMindMap(graph);
    console.log('[MIND ENGINE TEST] Checkpoint D - converted mindmap sections count:', mindMap.sections.length);
    expect(mindMap.sections.length).toBeGreaterThan(0);

    // Check that we got actual cards
    for (const sec of mindMap.sections) {
      console.log(`[MIND ENGINE TEST] Section: "${sec.title}" with ${sec.items.length} items`);
    }
  });

  it('should fallback to paragraph virtual structure when notes have absolutely no structural prefixes', () => {
    const unformattedNotes = `Electric charge is a fundamental physical property of matter. It can be positive or negative. The flow of this electric charge constitutes an electric current in a closed loop.
    
    Electric potential is the electrical potential energy per unit charge. Potential difference is measured by an instrument called the voltmeter connected in parallel across the points.
    
    Ohm's Law establishes the relationship between potential difference and current. It states that the voltage across a conductor is proportional to the current flowing through it.
    
    Resistors can be connected in series or parallel. In series connections, resistance adds up directly. In parallel connections, the reciprocal of resistances add up.`;

    console.log('[MIND ENGINE TEST] Running unformatted notes fallback check...');

    const evidence = parseDocumentStructure('jesc111-unformatted', unformattedNotes);
    console.log('[MIND ENGINE TEST] Fallback Checkpoint A - parsed evidence rootNodes count:', evidence.rootNodes.length);
    expect(evidence.rootNodes.length).toBe(1);
    expect(evidence.rootNodes[0].title).toBe('Key Concepts & Summary');

    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'jesc111-unformatted',
      'Science',
      '8',
      unformattedNotes
    );
    console.log('[MIND ENGINE TEST] Fallback Checkpoint B - derived nodes count:', graph.nodes.length);
    expect(graph.nodes.length).toBeGreaterThan(2);

    const mindMap = convertKnowledgeGraphToMindMap(graph);
    console.log('[MIND ENGINE TEST] Fallback Checkpoint D - mindmap sections count:', mindMap.sections.length);
    expect(mindMap.sections.length).toBe(1);
    expect(mindMap.sections[0].title).toBe('Key Concepts & Summary');
    expect(mindMap.sections[0].items.length).toBe(4); // 4 paragraphs converted to subconcepts
  });
});
