import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  extractFormulaVault,
  resolveFormulaRefs,
  normalizeMathFormula,
} from '@/lib/mindmap/formulaVault';
import {
  deriveDeterministicKnowledgeGraphFromNotes,
} from '@/lib/mindmap/knowledgeGraphExtractor';

describe('Mind Engine — Formula Vault Ownership & Immutability Tests', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'theory-of-computation.txt');
  const sourceText = fs.readFileSync(fixturePath, 'utf-8');

  it('1. should extract full set expressions with balanced braces and never truncate at commas', () => {
    const formulaResult = extractFormulaVault(sourceText);
    const vault = formulaResult.vault;

    // Check finite language full set
    const finiteLang = vault.find((f) => f.raw.includes('{a, ab, abc}'));
    expect(finiteLang).toBeDefined();
    expect(finiteLang?.latex).toBe('L = \\{a, ab, abc\\}');
    expect(finiteLang?.raw).not.toBe('L = {a');

    // Ensure no truncated 'L = {a' entry exists in the vault
    const truncated = vault.find((f) => f.raw.trim() === 'L = {a');
    expect(truncated).toBeUndefined();
  });

  it('2. should enforce single source span ownership for each mathematical expression', () => {
    const formulaResult = extractFormulaVault(sourceText);
    const seenSpans = new Set<string>();

    for (const span of formulaResult.sourceSpans) {
      const spanKey = `${span.start}-${span.end}`;
      expect(seenSpans.has(spanKey)).toBe(false);
      seenSpans.add(spanKey);
    }
  });

  it('3. should preserve exact state tuples and transition functions in immutable LaTeX', () => {
    const formulaResult = extractFormulaVault(sourceText);
    const vault = formulaResult.vault;

    const tuple = vault.find((f) => f.raw.includes('5-tuple') || f.raw.includes('Q, Σ'));
    expect(tuple).toBeDefined();
    expect(tuple?.latex).toContain('q_0');
    expect(tuple?.latex).toContain('\\Sigma');

    const trans = vault.find((f) => f.latex.includes('\\delta') && f.latex.includes('\\rightarrow'));
    expect(trans).toBeDefined();
    expect(trans?.latex).toContain('\\delta');
    expect(trans?.latex).toContain('\\Sigma');
  });

  it('4. should resolve formulaRefs in KnowledgeGraph directly to immutable FormulaVault entries', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sourceText
    );

    expect(graph.formulas).toBeDefined();
    expect(graph.formulas && graph.formulas.length > 0).toBe(true);

    const nodesWithFormulas = graph.nodes.filter((n) => n.formulaRefs && n.formulaRefs.length > 0);
    expect(nodesWithFormulas.length).toBeGreaterThanOrEqual(2);

    for (const node of nodesWithFormulas) {
      if (node.formulaRefs && graph.formulas) {
        const resolved = resolveFormulaRefs(node.formulaRefs, graph.formulas);
        expect(resolved.length).toBe(node.formulaRefs.length);
        for (const res of resolved) {
          expect(res.latex).toBeDefined();
          expect(res.latex.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
