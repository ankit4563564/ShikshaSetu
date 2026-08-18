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
import { normalizeMathFormula, deduplicateFormulas } from '@/lib/mindmap/formulaNormalizer';
import type { KnowledgeGraph } from '@/lib/mindmap/types';

describe('ShikshaSetu Mind Map — Knowledge Graph, Formula Normalization & Pagination Tests', () => {
  const tocNotes = `Chapter: Theory of Computation
1. Formal Languages:
Formal languages are mathematical abstractions of programming and natural languages.
a. Alphabets: A finite, non-empty set of symbols denoted by Sigma (Σ). Example: Σ = {0, 1}.
b. Strings: A finite sequence of symbols chosen from an alphabet. Length denoted by |w|. Empty string is epsilon (ε).
c. Languages: A set of strings over an alphabet. Can be finite or infinite. Example: L = {a, ab, abc}, L = {a^n : n >= 0}, L = ∅, L = Σ*.

2. Finite Automata:
Finite automata are state machines that model computation with limited memory.
a. Deterministic Finite Automata (DFA): A 5-tuple (Q, Σ, δ, q0, F) where Q is finite states, Σ is alphabet, δ: Q × Σ → Q is transition function, q0 is start state, F is accept states. Exactly one transition for each symbol. Deterministic behavior.
b. Non-deterministic Finite Automata (NFA): A 5-tuple (Q, Σ, δ, q0, F) where transition function δ: Q × (Σ ∪ {ε}) → P(Q).
c. Transition Diagrams and Tables: Graphical and tabular representations of state transitions.
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

  it('1. should accurately normalize mathematical and theoretical formulas', () => {
    expect(normalizeMathFormula('L = {a, ab, abc}')).toBe('L = \\{a, ab, abc\\}');
    expect(normalizeMathFormula('L = {a^n : n >= 0}')).toBe('L = \\{a^n : n \\ge 0\\}');
    expect(normalizeMathFormula('L = ∅')).toBe('L = \\emptyset');
    expect(normalizeMathFormula('L = Σ*')).toBe('L = \\Sigma^*');
    expect(normalizeMathFormula('δ: Q × Σ → Q')).toContain('\\delta');
    expect(normalizeMathFormula('δ: Q × Σ → Q')).toContain('\\Sigma');
  });

  it('2. should deduplicate formulas with identical mathematical meaning', () => {
    const rawFormulas = [
      { latex: 'L = {a, ab}', meaning: 'Sample language' },
      { latex: 'L = \\{a, ab\\}', meaning: 'Duplicate language' },
      { latex: 'V = I * R', meaning: 'Ohm law' },
      { latex: 'V = I \\cdot R', meaning: 'Ohm law duplicate' },
    ];

    const deduped = deduplicateFormulas(rawFormulas);
    expect(deduped.length).toBe(2);
    expect(deduped[0].latex).toBe('L = \\{a, ab\\}');
    expect(deduped[1].latex).toContain('V = I');
  });

  it('3. should accurately classify semantic roles for different content types', () => {
    expect(classifySemanticRole('Step 1: Create DFA states corresponding to subsets').type).toBe('algorithm_step');
    expect(classifySemanticRole('Subset Construction Method').type).toBe('algorithm');
    expect(classifySemanticRole("Arden's Theorem for regular expressions").type).toBe('theorem');
    expect(classifySemanticRole("Ohm's Law across conductors").type).toBe('law');
    expect(classifySemanticRole('Exactly one transition for each symbol').type).toBe('property');
    expect(classifySemanticRole('V = I * R').type).toBe('formula');
    expect(classifySemanticRole('Compiler design and pattern matching').type).toBe('application');
    expect(classifySemanticRole('Study tip: focus on state transitions').type).toBe('study_tip');
  });

  it('4. should extract Theory of Computation notes into a valid Knowledge Graph with root chapter', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    const validation = safeValidateKnowledgeGraph(graph);
    expect(validation.success).toBe(true);

    if (validation.success) {
      const root = graph.nodes.find((n) => n.type === 'chapter');
      expect(root).toBeDefined();
      expect(root?.parentId).toBeNull();
    }
  });

  it('5. should nest algorithm steps strictly under their algorithm parent node', () => {
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

  it('6. should ensure algorithm steps are NEVER top-level sections in the bridged mind map', () => {
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

    // Assert that the algorithm card encapsulates all steps in a process item
    const faSection = mindMap.sections.find((s) => s.title.toLowerCase().includes('automata') || s.title.toLowerCase().includes('equivalence'));
    expect(faSection).toBeDefined();
    if (faSection) {
      const allItemStrings = JSON.stringify(faSection.items);
      expect(allItemStrings).toContain('Create DFA states');
      expect(allItemStrings).toContain('1.');
    }
  });

  it('7. should preserve formula and tuple atomicity within DFA and Ohm nodes', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    const dfaNode = graph.nodes.find((n) => n.title.toLowerCase().includes('dfa'));
    expect(dfaNode).toBeDefined();
    if (dfaNode) {
      const hasTuple =
        (dfaNode.formulas && dfaNode.formulas.length > 0) ||
        (dfaNode.definitions && dfaNode.definitions.some((d) => d.includes('5-tuple') || d.includes('Q')));
      expect(hasTuple).toBe(true);
    }
  });

  it('8. should reject invalid Knowledge Graph where algorithm_step has a non-algorithm parent', () => {
    const invalidGraph: KnowledgeGraph = {
      title: 'Invalid Step Parent Test',
      subject: 'Computer Science',
      grade: 'University',
      summary: 'Testing step parent validation',
      nodes: [
        { id: 'node-root', title: 'Root', type: 'chapter', importance: 'critical' },
        { id: 'node-concept-1', title: 'Concept', type: 'concept', importance: 'high', parentId: 'node-root' },
        { id: 'node-step-1', title: 'Step 1', type: 'algorithm_step', importance: 'medium', parentId: 'node-concept-1' },
      ],
      relationships: [],
    };

    const validation = safeValidateKnowledgeGraph(invalidGraph);
    expect(validation.success).toBe(false);
    expect(validation.error).toContain('must have an algorithm parent');
  });

  it('9. should correctly extract Electricity regression fixture with formulas attached to concepts', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Electricity & Circuits',
      'Physics',
      '10',
      electricityNotes
    );

    const validation = safeValidateKnowledgeGraph(graph);
    expect(validation.success).toBe(true);

    const ohmNode = graph.nodes.find((n) => n.title.toLowerCase().includes('ohm'));
    expect(ohmNode).toBeDefined();
    if (ohmNode) {
      expect(ohmNode.formulas && ohmNode.formulas.length > 0).toBe(true);
    }
  });

  it('10. should validate and convert HierarchicalConceptTree JSON format into KnowledgeGraph', () => {
    const rawConceptTree = {
      title: 'Theory of Computation — Unit 1',
      summary: 'Mathematical models of computation and formal languages.',
      children: [
        {
          title: 'Formal Languages',
          summary: 'Mathematical abstractions of programming languages.',
          priority: 'high',
          children: [
            {
              title: 'Alphabets',
              summary: 'Finite set of symbols.',
              priority: 'medium',
              children: [],
            },
          ],
        },
        {
          title: 'DFA ↔ NFA Equivalence',
          summary: 'Equivalence between deterministic and non-deterministic models.',
          priority: 'high',
          children: [
            {
              title: 'Subset Construction',
              summary: 'Algorithm converting NFA to equivalent DFA.',
              priority: 'high',
              children: [
                {
                  title: 'Step 1: Create DFA states from subsets',
                  summary: 'Power set construction',
                  priority: 'medium',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const validation = safeValidateKnowledgeGraph(rawConceptTree);
    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(validation.data.title).toBe('Theory of Computation — Unit 1');
      expect(validation.data.nodes.length).toBeGreaterThanOrEqual(4);
      const root = validation.data.nodes.find((n) => n.parentId === null);
      expect(root?.title).toBe('Theory of Computation — Unit 1');
    }
  });
});
