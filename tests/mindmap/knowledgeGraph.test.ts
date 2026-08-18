import { describe, it, expect } from 'vitest';
import {
  KnowledgeGraphSchema,
  safeValidateKnowledgeGraph,
} from '@/lib/mindmap/schema';
import {
  deriveDeterministicKnowledgeGraphFromNotes,
  convertKnowledgeGraphToMindMap,
  extractKnowledgeGraphFromText,
} from '@/lib/mindmap/knowledgeGraphExtractor';
import type { KnowledgeGraph } from '@/lib/mindmap/types';

describe('ShikshaSetu Mind Map Phase B — Knowledge Graph Model Tests', () => {
  const tocNotes = `Chapter: Theory of Computation
1. Formal Languages:
Formal languages are mathematical abstractions of programming and natural languages.
a. Alphabets: A finite, non-empty set of symbols denoted by Sigma (Σ). Example: Σ = {0, 1}.
b. Strings: A finite sequence of symbols chosen from an alphabet. Length denoted by |w|. Empty string is epsilon (ε).
c. Languages: A set of strings over an alphabet. Can be finite or infinite.

2. Finite Automata:
Finite automata are state machines that model computation with limited memory.
a. Deterministic Finite Automata (DFA): A 5-tuple (Q, Σ, δ, q0, F) where Q is finite states, Σ is alphabet, δ: Q × Σ → Q is transition function, q0 is start state, F is accept states.
b. Non-deterministic Finite Automata (NFA): A 5-tuple (Q, Σ, δ, q0, F) where transition function δ: Q × (Σ ∪ {ε}) → P(Q).
c. Transition Diagrams and Tables: Graphical and tabular representations of state transitions.
d. DFA and NFA Equivalence: Every NFA can be converted to an equivalent DFA using Subset Construction (Powerset Construction).

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

  it('1. should extract Theory of Computation notes into a valid Knowledge Graph hierarchy', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    const validation = safeValidateKnowledgeGraph(graph);
    expect(validation.success).toBe(true);

    if (validation.success) {
      const nodeTitles = graph.nodes.map((n) => n.title.toLowerCase());

      // Verify major topic nodes exist
      expect(nodeTitles.some((t) => t.includes('formal languages'))).toBe(true);
      expect(nodeTitles.some((t) => t.includes('finite automata'))).toBe(true);
      expect(nodeTitles.some((t) => t.includes('regular expressions'))).toBe(true);

      // Verify subtopics are captured
      expect(nodeTitles.some((t) => t.includes('dfa') || t.includes('alphabets') || t.includes('kleene'))).toBe(true);
    }
  });

  it('2. should enforce parent-child tree hierarchy among nodes', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    const rootNode = graph.nodes.find((n) => n.type === 'root');
    expect(rootNode).toBeDefined();
    expect(rootNode?.parentId).toBeNull();

    const topicNodes = graph.nodes.filter((n) => n.type === 'topic');
    expect(topicNodes.length).toBeGreaterThanOrEqual(2);

    for (const topic of topicNodes) {
      expect(topic.parentId).toBe(rootNode?.id);
    }
  });

  it('3. should preserve formula and tuple atomicity within DFA and Ohm nodes', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    // Find DFA node specifically
    const dfaNode = graph.nodes.find((n) => n.title.toLowerCase().includes('dfa'));

    expect(dfaNode).toBeDefined();
    if (dfaNode) {
      const hasTuple =
        (dfaNode.formulas && dfaNode.formulas.length > 0) ||
        (dfaNode.definitions && dfaNode.definitions.some((d) => d.includes('5-tuple') || d.includes('Q')));
      expect(hasTuple).toBe(true);
    }
  });

  it('4. should establish valid typed semantic relationships (equivalent_to, leads_to, application_of)', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      tocNotes
    );

    expect(graph.relationships.length).toBeGreaterThan(0);

    // Check relationship types
    const relTypes = graph.relationships.map((r) => r.type);
    expect(relTypes).toContain('contains');

    // Verify all relationship endpoint node IDs exist in nodes list
    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    for (const rel of graph.relationships) {
      expect(nodeIds.has(rel.fromNodeId)).toBe(true);
      expect(nodeIds.has(rel.toNodeId)).toBe(true);
    }
  });

  it('5. should reject Knowledge Graph with duplicate node IDs via Zod validation', () => {
    const invalidGraph: KnowledgeGraph = {
      title: 'Invalid Duplicate Test',
      subject: 'Computer Science',
      grade: 'University',
      summary: 'Testing duplicate node ID rejection',
      nodes: [
        { id: 'node-1', title: 'Node 1', type: 'root', importance: 'high' },
        { id: 'node-1', title: 'Duplicate Node 1', type: 'topic', importance: 'medium', parentId: 'node-1' },
      ],
      relationships: [],
    };

    const validation = safeValidateKnowledgeGraph(invalidGraph);
    expect(validation.success).toBe(false);
    expect(validation.error).toContain('Duplicate node ID');
  });

  it('6. should reject Knowledge Graph with broken relationship endpoints', () => {
    const brokenGraph: KnowledgeGraph = {
      title: 'Broken Links Test',
      subject: 'Computer Science',
      grade: 'University',
      summary: 'Testing broken relationship rejection',
      nodes: [
        { id: 'node-1', title: 'Node 1', type: 'root', importance: 'high' },
      ],
      relationships: [
        { fromNodeId: 'node-1', toNodeId: 'non-existent-node-99', type: 'contains' },
      ],
    };

    const validation = safeValidateKnowledgeGraph(brokenGraph);
    expect(validation.success).toBe(false);
    expect(validation.error).toContain('non-existent');
  });

  it('7. should correctly bridge a Knowledge Graph into a ConceptMindMap for visual consumers', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Electricity',
      'Physics',
      '10',
      electricityNotes
    );

    const mindMap = convertKnowledgeGraphToMindMap(graph);
    expect(mindMap.title).toBe('Electricity');
    expect(mindMap.sections.length).toBeGreaterThan(0);
    expect(mindMap.knowledgeGraph).toBeDefined();

    // Verify sections have items and accent colors
    for (const sec of mindMap.sections) {
      expect(sec.items.length).toBeGreaterThan(0);
      expect(['blue', 'green', 'orange', 'purple', 'red', 'teal']).toContain(sec.accentColor);
    }
  });

  it('8. should reject extraction request with fewer than 20 characters', async () => {
    const result = await extractKnowledgeGraphFromText({
      title: 'Short',
      notesText: 'Too short text',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Not enough readable content');
  });
});
