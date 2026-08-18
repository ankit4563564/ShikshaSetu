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
import type { KnowledgeGraph } from '@/lib/mindmap/types';

describe('ShikshaSetu Mind Map — Semantic Hierarchy & Knowledge Graph Tests', () => {
  const tocNotes = `Chapter: Theory of Computation
1. Formal Languages:
Formal languages are mathematical abstractions of programming and natural languages.
a. Alphabets: A finite, non-empty set of symbols denoted by Sigma (Σ). Example: Σ = {0, 1}.
b. Strings: A finite sequence of symbols chosen from an alphabet. Length denoted by |w|. Empty string is epsilon (ε).
c. Languages: A set of strings over an alphabet. Can be finite or infinite.

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

  it('1. should accurately classify semantic roles for different content types', () => {
    expect(classifySemanticRole('Step 1: Create DFA states corresponding to subsets').type).toBe('algorithm_step');
    expect(classifySemanticRole('Subset Construction Method').type).toBe('algorithm');
    expect(classifySemanticRole("Arden's Theorem for regular expressions").type).toBe('theorem');
    expect(classifySemanticRole("Ohm's Law across conductors").type).toBe('law');
    expect(classifySemanticRole('Exactly one transition for each symbol').type).toBe('property');
    expect(classifySemanticRole('V = I * R').type).toBe('formula');
    expect(classifySemanticRole('Compiler design and pattern matching').type).toBe('application');
    expect(classifySemanticRole('Study tip: focus on state transitions').type).toBe('study_tip');
  });

  it('2. should extract Theory of Computation notes into a valid Knowledge Graph with root chapter', () => {
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

  it('3. should nest algorithm steps strictly under their algorithm parent node', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    // Find the algorithm node (Subset Construction or DFA/NFA Equivalence)
    const algoNode = graph.nodes.find((n) => n.type === 'algorithm' || n.title.toLowerCase().includes('subset') || n.title.toLowerCase().includes('equivalence'));
    expect(algoNode).toBeDefined();

    const stepNodes = graph.nodes.filter((n) => n.type === 'algorithm_step');
    expect(stepNodes.length).toBeGreaterThan(0);

    for (const step of stepNodes) {
      expect(step.parentId).toBeDefined();
      const parent = graph.nodes.find((n) => n.id === step.parentId);
      expect(parent?.type).toBe('algorithm');
    }
  });

  it('4. should preserve formula and tuple atomicity within DFA and Ohm nodes', () => {
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

  it('5. should establish explicit relationship types (has_step, equivalent_to, uses_algorithm, application_of)', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    expect(graph.relationships.length).toBeGreaterThan(0);

    const relTypes = graph.relationships.map((r) => r.type);
    expect(relTypes).toContain('contains');
    expect(relTypes.some((t) => t === 'has_step' || t === 'uses_algorithm' || t === 'equivalent_to' || t === 'application_of')).toBe(true);
  });

  it('6. should reject invalid Knowledge Graph where algorithm_step has a non-algorithm parent', () => {
    const invalidGraph: KnowledgeGraph = {
      title: 'Invalid Step Parent Test',
      subject: 'Computer Science',
      grade: 'University',
      summary: 'Testing step parent validation',
      nodes: [
        { id: 'node-root', title: 'Root', type: 'chapter', importance: 'critical' },
        { id: 'node-concept-1', title: 'Concept', type: 'concept', importance: 'high', parentId: 'node-root' },
        { id: 'node-step-1', title: 'Step 1', type: 'algorithm_step', importance: 'medium', parentId: 'node-concept-1' }, // Invalid! parent is concept, not algorithm
      ],
      relationships: [],
    };

    const validation = safeValidateKnowledgeGraph(invalidGraph);
    expect(validation.success).toBe(false);
    expect(validation.error).toContain('must have an algorithm parent');
  });

  it('7. should reject Knowledge Graph with duplicate relationship links', () => {
    const duplicateRelGraph: KnowledgeGraph = {
      title: 'Duplicate Rel Test',
      subject: 'Computer Science',
      grade: 'University',
      summary: 'Testing duplicate relationship detection',
      nodes: [
        { id: 'node-root', title: 'Root', type: 'chapter', importance: 'critical' },
        { id: 'node-topic-1', title: 'Topic 1', type: 'section', importance: 'high', parentId: 'node-root' },
      ],
      relationships: [
        { fromNodeId: 'node-root', toNodeId: 'node-topic-1', type: 'contains' },
        { fromNodeId: 'node-root', toNodeId: 'node-topic-1', type: 'contains' }, // Duplicate!
      ],
    };

    const validation = safeValidateKnowledgeGraph(duplicateRelGraph);
    expect(validation.success).toBe(false);
    expect(validation.error).toContain('Duplicate relationship detected');
  });

  it('8. should correctly bridge a Knowledge Graph into a ConceptMindMap without top-level step fragmentation', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    const mindMap = convertKnowledgeGraphToMindMap(graph);
    expect(mindMap.title).toBe('Theory of Computation');
    expect(mindMap.sections.length).toBeGreaterThan(0);

    // Verify no section is named "Step 1" or "Step 2"
    for (const sec of mindMap.sections) {
      expect(sec.title).not.toMatch(/^Step\s*\d+/i);
      expect(sec.items.length).toBeGreaterThan(0);
    }
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
});
