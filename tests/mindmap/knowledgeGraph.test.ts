import { describe, it, expect } from 'vitest';
import {
  KnowledgeGraphSchema,
  safeValidateKnowledgeGraph,
} from '@/lib/mindmap/schema';
import {
  deriveDeterministicKnowledgeGraphFromNotes,
  convertKnowledgeGraphToMindMap,
  extractKnowledgeGraphFromText,
  classifySemanticRole,
} from '@/lib/mindmap/knowledgeGraphExtractor';
import {
  normalizeMathFormula,
  deduplicateFormulas,
  extractFormulaVault,
  resolveFormulaRefs,
} from '@/lib/mindmap/formulaVault';
import {
  extractTableVault,
  resolveTableRefs,
} from '@/lib/mindmap/tableExtractor';
import {
  parseDocumentStructure,
  detectStructuralPrefix,
  normalizeDocumentText,
} from '@/lib/mindmap/documentStructureParser';
import {
  auditKnowledgeGraph,
  autoRepairKnowledgeGraph,
} from '@/lib/mindmap/criticEngine';
import type { KnowledgeGraph } from '@/lib/mindmap/types';

describe('ShikshaSetu Mind Engine — Canonical Multi-Stage Knowledge Graph & Mind Map Tests', () => {
  const tocNotes = `Chapter: Theory of Computation
UNIT – 1

1. Formal Languages:
Formal languages are mathematical abstractions of programming and natural languages.
a. Alphabets: A finite, non-empty set of symbols denoted by Sigma (Σ). Example: Σ = {0, 1}.
b. Strings: A finite sequence of symbols chosen from an alphabet. Length denoted by |w|. Empty string is epsilon (ε).
c. Languages: A set of strings over an alphabet. Can be finite or infinite. Example: L = {a, ab, abc}, L = {a^n : n >= 0}, L = ∅, L = Σ*.

2. Finite Automata:
Finite automata are state machines that model computation with limited memory.
a. Deterministic Finite Automata (DFA): A 5-tuple (Q, Σ, δ, q0, F) where Q is finite states, Σ is alphabet, δ: Q × Σ → Q is transition function, q0 is start state, F is accept states. Exactly one transition for each symbol. Deterministic behavior.
b. Non-deterministic Finite Automata (NFA): A 5-tuple (Q, Σ, δ, q0, F) where transition function δ: Q × (Σ ∪ {ε}) → 2^Q.
c. Transition Diagrams and Tables: Graphical and tabular representations of state transitions.
| State | Input 0 | Input 1 |
|-------|---------|---------|
| -> q0  | q0      | q1      |
| * q1  | q1      | q0      |
d. DFA and NFA Equivalence: Every NFA can be converted to an equivalent DFA using Subset Construction (Powerset Construction).
Step 1: Create DFA states corresponding to subsets of NFA states.
Step 2: Initial DFA state = ε-closure of NFA initial state.
Step 3: For each DFA state and input symbol, compute transitions.
Step 4: Final DFA states contain at least one NFA final state.

3. Regular Expressions and Theorems:
Algebraic representations of regular languages.
a. Operators: Union (+), Concatenation (·), and Kleene Star (*). Precedence: Star > Concatenation > Union.
b. Kleene's Theorem: A language is regular if and only if it is accepted by a finite automaton.
c. Arden's Theorem: If P and Q are regular expressions over Σ, and P does not contain ε, then equation R = Q + RP has a unique solution R = QP*. Used for converting finite automata to regular expressions.
d. Applications: Lexical analyzers (Lex), pattern matching, compilers, and text search tools.`;

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

  it('1. should accurately normalize mathematical formulas and state tuples into LaTeX', () => {
    expect(normalizeMathFormula('L = {a, ab, abc}')).toBe('L = \\{a, ab, abc\\}');
    expect(normalizeMathFormula('L = {a^n : n >= 0}')).toBe('L = \\{a^n : n \\ge 0\\}');
    expect(normalizeMathFormula('L = ∅')).toBe('L = \\emptyset');
    expect(normalizeMathFormula('L = Σ*')).toBe('L = \\Sigma^*');
    expect(normalizeMathFormula('δ: Q × Σ → Q')).toContain('\\delta');
    expect(normalizeMathFormula('δ: Q × Σ → Q')).toContain('\\Sigma');
    expect(normalizeMathFormula('(Q, Σ, δ, q0, F)')).toContain('q_0');
    expect(normalizeMathFormula('(Q, Σ, δ, q0, F)')).toContain('\\Sigma');
  });

  it('2. should extract and vault immutable formulas with unique IDs before processing', () => {
    const formulaResult = extractFormulaVault(tocNotes);
    expect(formulaResult.vault.length).toBeGreaterThanOrEqual(4);

    const tupleEntry = formulaResult.vault.find((f) => f.raw.includes('5-tuple') || f.raw.includes('Q, Σ'));
    expect(tupleEntry).toBeDefined();
    expect(tupleEntry?.id).toMatch(/^FORMULA_\d+/);
    expect(tupleEntry?.sourceRef).toBeDefined();

    // Test resolution
    if (tupleEntry) {
      const resolved = resolveFormulaRefs([tupleEntry.id], formulaResult.vault);
      expect(resolved.length).toBe(1);
      expect(resolved[0].latex).toContain('\\Sigma');
    }
  });

  it('3. should extract tables into structured columns and rows instead of fragmented bullets', () => {
    const tableResult = extractTableVault(tocNotes);
    expect(tableResult.vault.length).toBeGreaterThanOrEqual(1);

    const transitionTable = tableResult.vault[0];
    expect(transitionTable.columns).toEqual(['State', 'Input 0', 'Input 1']);
    expect(transitionTable.rows.length).toBe(2);
    expect(transitionTable.sourceRef).toBeDefined();
  });

  it('4. should detect structural numbering levels (Unit, Section, Subsection, Step)', () => {
    const unitMatch = detectStructuralPrefix('UNIT – 1');
    expect(unitMatch?.type).toBe('unit');
    expect(unitMatch?.level).toBe(1);

    const secMatch = detectStructuralPrefix('1. Formal Languages:');
    expect(secMatch?.type).toBe('section');
    expect(secMatch?.level).toBe(2);

    const subMatch = detectStructuralPrefix('a. Alphabets: A finite set');
    expect(subMatch?.type).toBe('topic');
    expect(subMatch?.level).toBe(3);

    const stepMatch = detectStructuralPrefix('Step 1: Create DFA states');
    expect(stepMatch?.type).toBe('step');
    expect(stepMatch?.level).toBe(4);
  });

  it('5. should parse document structure into a complete evidence outline with source spans', () => {
    const evidence = parseDocumentStructure('Theory of Computation', tocNotes);
    expect(evidence.title).toBe('Theory of Computation');
    expect(evidence.rootNodes.length).toBeGreaterThanOrEqual(1);
    expect(evidence.formulaVault.length).toBeGreaterThanOrEqual(4);
    expect(evidence.tableVault.length).toBeGreaterThanOrEqual(1);
    expect(evidence.sourceRefs.length).toBeGreaterThan(5);
  });

  it('6. should extract Theory of Computation notes into a valid Canonical Knowledge Graph', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    const validation = safeValidateKnowledgeGraph(graph);
    expect(validation.success).toBe(true);

    if (validation.success) {
      const root = graph.nodes.find((n) => n.type === 'root' || n.type === 'chapter');
      expect(root).toBeDefined();
      expect(root?.parentId).toBeNull();
      expect(graph.sourceRefs && graph.sourceRefs.length > 0).toBe(true);
    }
  });

  it('7. should strictly nest algorithm steps inside their algorithm parent node', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    const stepNodes = graph.nodes.filter((n) => n.type === 'algorithm_step');
    expect(stepNodes.length).toBeGreaterThanOrEqual(4);

    for (const step of stepNodes) {
      expect(step.parentId).toBeDefined();
      const parent = graph.nodes.find((n) => n.id === step.parentId);
      expect(parent?.type).toBe('algorithm');
    }
  });

  it('8. should ensure algorithm steps are NEVER top-level sections in the bridged mind map', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
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

  it('9. should audit fidelity and auto-repair orphan steps & missing parent references', () => {
    const malformedGraph: KnowledgeGraph = {
      title: 'Audit & Repair Test',
      subject: 'Computer Science',
      grade: 'University',
      summary: 'Testing auto-repair functionality',
      nodes: [
        { id: 'node-root', title: 'Root Chapter', type: 'root', importance: 'critical', parentId: null },
        { id: 'node-topic-1', title: 'Equivalence', type: 'section', importance: 'high', parentId: 'node-root' },
        // Step with invalid parent (parent is section instead of algorithm)
        { id: 'node-orphan-step-1', title: 'Step 1: Subset creation', type: 'algorithm_step', importance: 'medium', parentId: 'node-topic-1' },
      ],
      relationships: [],
    };

    const auditBefore = auditKnowledgeGraph(malformedGraph);
    expect(auditBefore.issues.some((i) => i.code === 'INVALID_STEP_PARENT')).toBe(true);

    const repaired = autoRepairKnowledgeGraph(malformedGraph);
    const auditAfter = auditKnowledgeGraph(repaired);
    expect(auditAfter.issues.filter((i) => i.code === 'INVALID_STEP_PARENT').length).toBe(0);

    const stepNode = repaired.nodes.find((n) => n.id === 'node-orphan-step-1');
    const newParent = repaired.nodes.find((n) => n.id === stepNode?.parentId);
    expect(newParent?.type).toBe('algorithm');
  });

  it('10. should extract Electricity regression fixture with uncorrupted formulas', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Electricity & Circuits',
      'Physics',
      '10',
      electricityNotes
    );

    const validation = safeValidateKnowledgeGraph(graph);
    expect(validation.success).toBe(true);

    const allFormulas = graph.nodes.flatMap((n) => n.formulas || []);
    expect(allFormulas.length).toBeGreaterThanOrEqual(3);
    expect(allFormulas.some((f) => f.latex.includes('I') && f.latex.includes('R'))).toBe(true);
  });
});
