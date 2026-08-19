import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  deriveDeterministicKnowledgeGraphFromNotes,
  convertKnowledgeGraphToMindMap,
} from '@/lib/mindmap/knowledgeGraphExtractor';
import {
  parseDocumentStructure,
} from '@/lib/mindmap/documentStructureParser';
import {
  validateSourceCoverage,
  auditKnowledgeGraph,
} from '@/lib/mindmap/criticEngine';
import { safeValidateKnowledgeGraph } from '@/lib/mindmap/schema';

describe('Theory of Computation — Golden Regression Test Suite', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'theory-of-computation.txt');
  const expectedPath = path.join(__dirname, 'fixtures', 'theory-of-computation.expected.json');

  const sourceText = fs.readFileSync(fixturePath, 'utf-8');
  const expectedData = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));

  it('1. should extract and validate the Canonical Knowledge Graph from the golden fixture', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const validation = safeValidateKnowledgeGraph(graph);
    if (!validation.success) {
      console.log('VALIDATION ERRORS:', JSON.stringify(validation.error, null, 2));
    }
    expect(validation.success).toBe(true);

    const root = graph.nodes.find((n) => n.type === 'root' || n.type === 'chapter' || n.parentId === null);
    expect(root).toBeDefined();
  });

  it('2. should preserve exact mathematical formulas in the Formula Vault without corruption', () => {
    const evidence = parseDocumentStructure('Theory of Computation', sourceText);
    const vault = evidence.formulaVault;

    expect(vault.length).toBeGreaterThanOrEqual(6);

    // 5-tuple check
    const tuple = vault.find((f) => f.raw.includes('5-tuple') || f.raw.includes('Q, Σ'));
    expect(tuple).toBeDefined();
    expect(tuple?.latex).toContain('q_0');
    expect(tuple?.latex).toContain('\\Sigma');
    expect(tuple?.latex).not.toContain('is transition function');

    // Transition function check
    const trans = vault.find((f) => f.latex.includes('\\delta') && f.latex.includes('\\rightarrow'));
    expect(trans).toBeDefined();
    expect(trans?.latex).toContain('\\rightarrow');
    expect(trans?.latex).not.toContain('mapping');

    // Arden's equation check
    const arden = vault.find((f) => f.latex.includes('R = Q + RP') || f.latex.includes('QP^*'));
    expect(arden).toBeDefined();
    expect(arden?.latex).not.toContain('has a unique solution');
    expect(arden?.latex).not.toContain('whereX');

    // Language set definitions check
    const lang = vault.find((f) => f.latex.includes('\\{a, ab, abc\\}') || f.latex.includes('\\Sigma^*'));
    expect(lang).toBeDefined();
  });

  it('3. should enforce strict Algorithm -> Algorithm_Step hierarchy', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const stepNodes = graph.nodes.filter((n) => n.type === 'algorithm_step');
    expect(stepNodes.length).toBe(4);

    for (const step of stepNodes) {
      expect(step.parentId).toBeDefined();
      const parent = graph.nodes.find((n) => n.id === step.parentId);
      expect(parent).toBeDefined();
      expect(parent?.type).toBe('algorithm');
      expect(parent?.title.toLowerCase()).toContain('subset construction');
    }
  });

  it('4. should ensure algorithm steps are NEVER top-level sections in the Mind Map projection', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const mindMap = convertKnowledgeGraphToMindMap(graph);

    // Verify section titles
    for (const sec of mindMap.sections) {
      expect(sec.title).not.toMatch(/^Step\s*\d+/i);
      expect(sec.title).not.toMatch(/^Create DFA states/i);
      expect(sec.title).not.toMatch(/^Initial DFA state/i);
      expect(sec.title).not.toMatch(/^For each DFA state/i);
      expect(sec.title).not.toMatch(/^Final DFA states/i);
    }
  });

  it('5. should eliminate duplicate node definitions and repeated bullet points', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const mindMap = convertKnowledgeGraphToMindMap(graph);

    for (const sec of mindMap.sections) {
      // Ensure no section contains duplicate items with the same content
      const itemContents = sec.items.map((i) => (i.title || i.content).toLowerCase());
      const uniqueContents = new Set(itemContents);
      expect(itemContents.length).toBe(uniqueContents.size);
    }
  });

  it('6. should achieve high source fidelity score and pass coverage validation', () => {
    const evidence = parseDocumentStructure('Theory of Computation', sourceText);
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const coverage = validateSourceCoverage(evidence, graph);
    expect(coverage.headingCoverage).toBeGreaterThanOrEqual(80);
    expect(coverage.orphanSteps.length).toBe(0);
    expect(coverage.stepCoverage).toBe(100);

    const audit = auditKnowledgeGraph(graph, evidence);
    expect(audit.score).toBeGreaterThanOrEqual(85);
  });
});
