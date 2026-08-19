import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  deriveDeterministicKnowledgeGraphFromNotes,
  convertKnowledgeGraphToMindMap,
} from '@/lib/mindmap/knowledgeGraphExtractor';
import { parseDocumentStructure } from '@/lib/mindmap/documentStructureParser';
import { validateSourceCoverage, auditKnowledgeGraph } from '@/lib/mindmap/criticEngine';

describe('Mind Engine — Academic Knowledge Preservation & Coverage Tests', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'theory-of-computation.txt');
  const sourceText = fs.readFileSync(fixturePath, 'utf-8');

  it('1. should preserve substantial academic concepts and not over-compress into ~11 nodes', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    // Knowledge graph must retain full academic details (>= 20 nodes)
    expect(graph.nodes.length).toBeGreaterThanOrEqual(20);

    const allTitles = graph.nodes.map((n) => n.title.toLowerCase());
    const allSummaries = graph.nodes.map((n) => (n.summary || '').toLowerCase()).join(' ');

    // Major branches of TOC
    expect(allTitles.some((t) => t.includes('automata theory')) || allSummaries.includes('automata theory')).toBe(true);
    expect(allTitles.some((t) => t.includes('computability')) || allSummaries.includes('computability')).toBe(true);
    expect(allTitles.some((t) => t.includes('complexity')) || allSummaries.includes('complexity')).toBe(true);

    // Languages, Alphabets & Strings
    expect(allTitles.some((t) => t.includes('alphabets'))).toBe(true);
    expect(allTitles.some((t) => t.includes('strings'))).toBe(true);
    expect(allTitles.some((t) => t.includes('languages'))).toBe(true);

    // Automata Models
    expect(allTitles.some((t) => t.includes('dfa'))).toBe(true);
    expect(allTitles.some((t) => t.includes('nfa'))).toBe(true);
    expect(allTitles.some((t) => t.includes('transition'))).toBe(true);

    // Regular Expressions & Theorems
    expect(allTitles.some((t) => t.includes('operators') || t.includes('precedence'))).toBe(true);
    expect(allTitles.some((t) => t.includes('kleene'))).toBe(true);
    expect(allTitles.some((t) => t.includes('arden'))).toBe(true);
    expect(allTitles.some((t) => t.includes('application'))).toBe(true);
  });

  it('2. should pass deterministic source coverage validation with high score', () => {
    const evidence = parseDocumentStructure('Theory of Computation', sourceText);
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const coverage = validateSourceCoverage(evidence, graph);
    expect(coverage.headingCoverage).toBeGreaterThanOrEqual(80);
    expect(coverage.stepCoverage).toBe(100);
    expect(coverage.orphanSteps.length).toBe(0);

    const audit = auditKnowledgeGraph(graph, evidence);
    expect(audit.score).toBeGreaterThanOrEqual(85);
  });

  it('3. should project the complete KnowledgeGraph into structured MindMap cards without deleting knowledge', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    const mindMap = convertKnowledgeGraphToMindMap(graph);
    expect(mindMap.sections.length).toBeGreaterThanOrEqual(2);

    const totalRenderedItems = mindMap.sections.reduce((sum, sec) => sum + sec.items.length, 0);
    expect(totalRenderedItems).toBeGreaterThanOrEqual(6);
  });
});
