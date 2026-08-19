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

  it('should run the complete 13-stage multi-stage pipeline with mocked LLM and output telemetry and quality report', async () => {
    const { vi } = await import('vitest');
    const { ResilientAIProvider } = await import('@/lib/intelligence/providers/aiProvider');
    const { extractKnowledgeGraphFromText } = await import('@/lib/mindmap/knowledgeGraphExtractor');

    console.log('[MIND ENGINE TEST] Running multi-stage pipeline integration check...');

    const spy = vi.spyOn(ResilientAIProvider.prototype, 'generateCompletion');
    spy.mockImplementation(async (req) => {
      if (req.systemPrompt.includes('Academic Knowledge Architect')) {
        return {
          text: JSON.stringify({
            title: 'Class 8 Science Electricity',
            summary: 'A study of electric current and circuits.',
            structure: [
              {
                id: 'arch-sec-1',
                title: '11.1 Electric Current and Circuit',
                type: 'section',
                children: []
              },
              {
                id: 'arch-sec-2',
                title: '11.2 Electric Potential and Potential Difference',
                type: 'section',
                children: []
              }
            ]
          }),
          provider: 'mock',
          latencyMs: 10
        };
      }
      if (req.systemPrompt.includes('Academic Detail Extractor')) {
        return {
          text: JSON.stringify({
            definitions: ['Flow of charge'],
            properties: ['Measured in amperes'],
            keyPoints: ['Formula is I = Q/t'],
            examples: ['Bulb in a circuit'],
            applications: ['Lighting'],
            activities: ['Activity 11.1'],
            formulaRefs: ['formula-1'],
            tableRefs: []
          }),
          provider: 'mock',
          latencyMs: 10
        };
      }
      if (req.systemPrompt.includes('Semantic Link Modeler')) {
        return {
          text: JSON.stringify([
            { fromNodeId: 'arch-sec-1', toNodeId: 'arch-sec-2', type: 'depends_on', label: 'Depends on' }
          ]),
          provider: 'mock',
          latencyMs: 10
        };
      }
      if (req.systemPrompt.includes('Academic Critic Engine')) {
        return {
          text: JSON.stringify({
            score: 95,
            findings: [],
            sectionDepth: [
              { sectionTitle: '11.1 Electric Current and Circuit', score: 5, maxScore: 6 },
              { sectionTitle: '11.2 Electric Potential and Potential Difference', score: 4, maxScore: 6 }
            ]
          }),
          provider: 'mock',
          latencyMs: 10
        };
      }
      return { text: '{}', provider: 'mock', latencyMs: 10 };
    });

    const result = await extractKnowledgeGraphFromText({
      title: 'jesc111-electricity',
      subject: 'Science',
      grade: '8',
      notesText: simulatedNotes
    });

    expect(result.success).toBe(true);
    expect(result.mindMap).toBeDefined();
    
    const mindMap: any = result.mindMap;
    console.log('[MIND ENGINE TEST] Converted MindMap sections count:', mindMap.sections.length);
    expect(mindMap.sections.length).toBeGreaterThan(0);
    
    // Validate telemetry existence
    console.log('[MIND ENGINE TEST] Telemetry:', mindMap.telemetry);
    expect(mindMap.telemetry).toBeDefined();
    expect(mindMap.telemetry.architectMs).toBeGreaterThanOrEqual(0);
    expect(mindMap.telemetry.extractionMs).toBeGreaterThanOrEqual(0);

    // Validate quality report existence
    console.log('[MIND ENGINE TEST] Quality Report:', mindMap.qualityReport);
    expect(mindMap.qualityReport).toBeDefined();
    expect(mindMap.qualityReport.knowledgeNodeCount).toBeGreaterThanOrEqual(3);
    expect(mindMap.qualityReport.coverageScore).toBeGreaterThanOrEqual(80);
    expect(mindMap.qualityReport.qualityGate).toBe('PASS');

    spy.mockRestore();
  });
});
