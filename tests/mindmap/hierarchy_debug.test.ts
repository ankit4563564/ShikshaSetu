import { describe, it, expect } from 'vitest';
import {
  deriveDeterministicKnowledgeGraphFromNotes,
  convertKnowledgeGraphToMindMap,
} from '@/lib/mindmap/knowledgeGraphExtractor';
import { safeValidateKnowledgeGraph, convertConceptTreeToKnowledgeGraph } from '@/lib/mindmap/schema';

describe('Hierarchy Debug — trace where flattening happens', () => {
  const sampleNotes = `Theory of Computation

1. Finite Automata:
Finite automata are state machines that model computation with limited memory.
a. Deterministic Finite Automata (DFA): A DFA is a deterministic finite automaton.
b. Non-deterministic Finite Automata (NFA): An NFA allows multiple possible transitions.
c. DFA and NFA Equivalence: Every NFA can be converted to an equivalent DFA using Subset Construction (Powerset Construction).
Step 1: Create DFA states corresponding to subsets of NFA states.
Step 2: Initial DFA state = ε-closure of NFA initial state.
Step 3: For each DFA state and input symbol, compute transitions.
Step 4: Final DFA states contain at least one NFA final state.

2. Regular Expressions and Theorems:
Algebraic representations of regular languages.
a. Operators: Union (+), Concatenation (·), and Kleene Star (*). Precedence: Star > Concatenation > Union.
b. Arden's Theorem: If P and Q are regular expressions over Σ, and P does not contain ε, then equation R = Q + RP has a unique solution R = QP*. Used for converting finite automata to regular expressions.`;

  it('DEBUG 1: KnowledgeGraph parentId hierarchy from deterministic parser', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sampleNotes
    );

    // Print the node hierarchy
    console.log('\n=== KNOWLEDGE GRAPH NODE HIERARCHY ===');
    for (const node of graph.nodes) {
      const indent = node.parentId === null ? '' : node.parentId === 'node-chapter-root' ? '  ' : '    ';
      console.log(`${indent}[${node.type}] id=${node.id} parentId=${node.parentId} title="${node.title}"`);
    }

    // Verify hierarchy
    const root = graph.nodes.find(n => n.type === 'root' || n.type === 'chapter' || n.parentId === null);
    expect(root).toBeDefined();

    const sections = graph.nodes.filter(n => n.parentId === root?.id);
    console.log(`\nSections (direct children of root): ${sections.map(s => s.title).join(', ')}`);
    expect(sections.length).toBeGreaterThanOrEqual(2);

    // Check that algorithm steps are under an algorithm node
    const algoSteps = graph.nodes.filter(n => n.type === 'algorithm_step');
    console.log(`Algorithm steps: ${algoSteps.length}`);
    for (const step of algoSteps) {
      expect(step.parentId).toBeDefined();
      const parent = graph.nodes.find(n => n.id === step.parentId);
      expect(parent?.type).toBe('algorithm');
    }

    // Check concepts under sections
    const concepts = graph.nodes.filter(n => n.type === 'topic' || n.type === 'concept' || n.type === 'theorem' || n.type === 'algorithm');
    console.log(`\nConcepts/Theorems/Algorithms:`);
    for (const c of concepts) {
      const parent = graph.nodes.find(n => n.id === c.parentId);
      console.log(`  [${c.type}] "${c.title}" -> parent "${parent?.title}" (type: ${parent?.type})`);
    }
  });

  it('DEBUG 2: ConceptMindMap sections after convertKnowledgeGraphToMindMap', () => {
    const graph = deriveDeterministicKnowledgeGraphFromNotes(
      'Theory of Computation',
      'Computer Science',
      'University',
      sampleNotes
    );

    const mindMap = convertKnowledgeGraphToMindMap(graph);

    console.log('\n=== MIND MAP SECTIONS ===');
    console.log(`Total sections: ${mindMap.sections.length}`);
    for (const sec of mindMap.sections) {
      console.log(`\n--- SECTION: "${sec.title}" (id=${sec.id}) ---`);
      console.log(`  Items: ${sec.items.length}`);
      for (const item of sec.items) {
        console.log(`    [${item.type}] title="${item.title || ''}" content="${item.content.slice(0, 60)}"`);
        if (item.children && item.children.length > 0) {
          console.log(`    └── ${item.children.length} children:`);
          for (const child of item.children) {
            console.log(`        [${child.type}] "${child.title || child.content.slice(0, 50)}"`);
            if (child.children && child.children.length > 0) {
              for (const gc of child.children) {
                console.log(`            [${gc.type}] "${gc.title || gc.content.slice(0, 50)}"`);
              }
            }
          }
        }
      }
    }

    // KEY ASSERTIONS: child concepts must NOT become top-level sections
    const sectionTitles = mindMap.sections.map(s => s.title.toLowerCase());
    console.log('\n=== SECTION TITLES ===');
    sectionTitles.forEach(t => console.log(`  "${t}"`));

    // These should NOT be top-level sections
    expect(sectionTitles).not.toContain('deterministic finite automata (dfa)');
    expect(sectionTitles).not.toContain('operators');
    expect(sectionTitles.find(t => t.includes('union'))).toBeUndefined();
    expect(sectionTitles.find(t => t.includes('kleene'))).toBeUndefined();

    // These SHOULD be top-level sections
    expect(sectionTitles.find(t => t.includes('finite automata') || t.includes('automata'))).toBeDefined();
    expect(sectionTitles.find(t => t.includes('regular expressions') || t.includes('regular'))).toBeDefined();
  });

  it('DEBUG 3: AI HierarchicalConceptTree → KnowledgeGraph → MindMap pipeline', () => {
    // Simulate the exact AI response format
    const aiResponse = {
      title: 'Theory of Computation',
      summary: 'Mathematical models of computation, formal languages, and finite automata.',
      children: [
        {
          title: 'Finite Automata',
          summary: 'State machines with limited memory.',
          priority: 'high',
          children: [
            {
              title: 'DFA',
              summary: 'Deterministic finite automaton with unique transitions.',
              priority: 'high',
              children: [],
            },
            {
              title: 'NFA',
              summary: 'Non-deterministic finite automaton.',
              priority: 'high',
              children: [],
            },
            {
              title: 'DFA–NFA Equivalence',
              summary: 'Every NFA can be converted to an equivalent DFA.',
              priority: 'high',
              children: [
                {
                  title: 'Subset Construction',
                  summary: 'Algorithm converting NFA to equivalent DFA.',
                  priority: 'high',
                  children: [
                    { title: 'Step 1: Create DFA states from subsets', summary: 'Power set construction', priority: 'medium', children: [] },
                    { title: 'Step 2: Determine initial DFA state', summary: 'ε-closure of NFA initial state', priority: 'medium', children: [] },
                    { title: 'Step 3: Compute transitions', summary: 'For each DFA state and symbol', priority: 'medium', children: [] },
                    { title: 'Step 4: Determine final states', summary: 'States containing NFA final states', priority: 'medium', children: [] },
                  ],
                },
              ],
            },
          ],
        },
        {
          title: 'Regular Expressions',
          summary: 'Algebraic representations of regular languages.',
          priority: 'high',
          children: [
            {
              title: 'Operators',
              summary: 'Basic operations on regular expressions.',
              priority: 'high',
              children: [
                { title: 'Union', summary: 'L1 ∪ L2', priority: 'medium', children: [] },
                { title: 'Concatenation', summary: 'L1 · L2', priority: 'medium', children: [] },
                { title: 'Kleene Star', summary: 'L*', priority: 'medium', children: [] },
                { title: 'Kleene Plus', summary: 'L+', priority: 'medium', children: [] },
                { title: 'Optional', summary: 'L?', priority: 'medium', children: [] },
              ],
            },
            {
              title: "Arden's Theorem",
              summary: 'If P and Q are RE over Σ and P does not contain ε, then R = Q + RP has unique solution R = QP*.',
              priority: 'high',
              children: [],
            },
          ],
        },
      ],
    };

    // Step 1: validate as concept tree → KnowledgeGraph
    const validation = safeValidateKnowledgeGraph(aiResponse);
    expect(validation.success).toBe(true);
    if (!validation.success) return;

    const graph = validation.data;

    console.log('\n=== AI CONCEPT TREE → KNOWLEDGE GRAPH ===');
    for (const node of graph.nodes) {
      const depth = getNodeDepth(graph.nodes, node);
      const indent = '  '.repeat(depth);
      console.log(`${indent}[${node.type}] "${node.title}" (parentId=${node.parentId})`);
    }

    // Step 2: convert to MindMap
    const mindMap = convertKnowledgeGraphToMindMap(graph);

    console.log('\n=== FINAL MIND MAP FROM AI TREE ===');
    console.log(`Sections: ${mindMap.sections.length}`);
    for (const sec of mindMap.sections) {
      console.log(`\nSECTION: "${sec.title}"`);
      printItems(sec.items, '  ');
    }

    // KEY: "Operators" must NOT be a separate section
    const sectionTitles = mindMap.sections.map(s => s.title.toLowerCase());
    expect(sectionTitles).not.toContain('operators');
    expect(sectionTitles).not.toContain('union');
    expect(sectionTitles).not.toContain('kleene star');
    expect(sectionTitles).not.toContain('dfa');
    expect(sectionTitles).not.toContain('nfa');

    // Sections should be the MAJOR topics only
    expect(mindMap.sections.length).toBeLessThanOrEqual(4);
  });
});

function getNodeDepth(nodes: any[], node: any): number {
  let depth = 0;
  let current = node;
  while (current.parentId) {
    current = nodes.find((n: any) => n.id === current.parentId);
    if (!current) break;
    depth++;
  }
  return depth;
}

function printItems(items: any[], indent: string) {
  for (const item of items) {
    console.log(`${indent}[${item.type}] "${item.title || item.content.slice(0, 60)}"`);
    if (item.children && item.children.length > 0) {
      printItems(item.children, indent + '  ');
    }
  }
}
