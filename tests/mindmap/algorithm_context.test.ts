import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  deriveDeterministicKnowledgeGraphFromNotes,
  convertKnowledgeGraphToMindMap,
} from '@/lib/mindmap/knowledgeGraphExtractor';

describe('Mind Engine — Algorithm Context Invariant Tests', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'theory-of-computation.txt');
  const sourceText = fs.readFileSync(fixturePath, 'utf-8');

  it('1. should never allow an algorithm or step to escape to the document root', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const rootNode = graph.nodes.find((n) => n.type === 'root' || n.parentId === null);
    expect(rootNode).toBeDefined();

    // Check direct children of root
    const rootDirectChildren = graph.nodes.filter((n) => n.parentId === rootNode?.id);
    for (const child of rootDirectChildren) {
      expect(child.type).not.toBe('algorithm_step');
      expect(child.title.toLowerCase()).not.toContain('step 1');
      expect(child.title.toLowerCase()).not.toContain('algorithm & step');
    }
  });

  it('2. should strictly nest algorithm steps inside their algorithm parent node', () => {
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

  it('3. should ensure algorithm parent node is enclosed within its section subtree', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const algoNode = graph.nodes.find((n) => n.type === 'algorithm');
    expect(algoNode).toBeDefined();
    if (algoNode) {
      expect(algoNode.context).toBeDefined();
      expect(algoNode.context?.sectionPath.some((p) => p.toLowerCase().includes('finite automata') || p.toLowerCase().includes('equivalence'))).toBe(true);
    }
  });

  it('4. should ensure MindMap projection renders algorithm steps exclusively in process cards', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const mindMap = convertKnowledgeGraphToMindMap(graph);

    // Assert that no section is named after an individual step
    for (const sec of mindMap.sections) {
      expect(sec.title).not.toMatch(/^Step\s*\d+/i);
      expect(sec.title).not.toMatch(/^Create DFA states/i);
      expect(sec.title).not.toMatch(/^Initial DFA state/i);
      expect(sec.title).not.toMatch(/^For each DFA state/i);
      expect(sec.title).not.toMatch(/^Final DFA states/i);
    }
  });
});
