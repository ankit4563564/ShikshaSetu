/**
 * ShikshaSetu — Stage 5: Critic & Deterministic Auto-Repair Engine
 * Validates canonical Knowledge Graphs against source evidence.
 * Detects orphan steps, duplicate concepts, missing formulas, and computes Fidelity Reports.
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeRelationship,
  FidelityReport,
  ValidationIssue,
  DocumentStructureEvidence,
} from './types';

/**
 * Deterministically audits a KnowledgeGraph against the structural evidence.
 */
export function auditKnowledgeGraph(
  graph: KnowledgeGraph,
  evidence?: DocumentStructureEvidence
): FidelityReport {
  const issues: ValidationIssue[] = [];
  const nodeMap = new Map<string, KnowledgeNode>();
  const nodeIds = new Set<string>();

  // 1. Build node index
  for (const node of graph.nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({
        code: 'DUPLICATE_NODE_ID',
        severity: 'critical',
        message: `Duplicate node ID: ${node.id}`,
        nodeId: node.id,
        autoFixable: true,
      });
    }
    nodeIds.add(node.id);
    nodeMap.set(node.id, node);
  }

  // 2. Orphan Algorithm Step & Invalid Parent Checks
  let orphanStepsCount = 0;
  let algoNodes = graph.nodes.filter((n) => n.type === 'algorithm');

  for (const node of graph.nodes) {
    if (node.type === 'algorithm_step') {
      if (!node.parentId) {
        orphanStepsCount++;
        issues.push({
          code: 'ORPHAN_ALGORITHM_STEP',
          severity: 'critical',
          message: `Algorithm step "${node.title}" has no parent node.`,
          nodeId: node.id,
          autoFixable: true,
        });
      } else {
        const parent = nodeMap.get(node.parentId);
        if (!parent || parent.type !== 'algorithm') {
          orphanStepsCount++;
          issues.push({
            code: 'INVALID_STEP_PARENT',
            severity: 'critical',
            message: `Algorithm step "${node.title}" parent is "${parent?.title}" (type: ${parent?.type || 'missing'}), expected algorithm.`,
            nodeId: node.id,
            autoFixable: true,
          });
        }
      }
    }
  }

  // 3. Duplicate Concept Detection
  const titleMap = new Map<string, string[]>();
  for (const node of graph.nodes) {
    const clean = node.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 3) {
      const existing = titleMap.get(clean) || [];
      existing.push(node.id);
      titleMap.set(clean, existing);
    }
  }

  let duplicateCount = 0;
  for (const [title, ids] of titleMap.entries()) {
    if (ids.length > 1) {
      duplicateCount++;
      issues.push({
        code: 'DUPLICATE_CONCEPT',
        severity: 'warning',
        message: `Multiple nodes share similar title "${title}": ${ids.join(', ')}`,
        nodeId: ids[0],
        autoFixable: true,
      });
    }
  }

  // 4. Formula Preservation Check
  let formulaPreservationScore = 100;
  if (evidence && evidence.formulaVault && evidence.formulaVault.length > 0) {
    const allGraphFormulas = graph.nodes.flatMap((n) => [
      ...(n.formulas || []).map((f) => f.latex),
      ...(n.formulaRefs || []),
    ]);

    const missingFormulas = evidence.formulaVault.filter((f) => {
      return !allGraphFormulas.some((gf) => gf.includes(f.latex) || gf === f.id);
    });

    if (missingFormulas.length > 0) {
      formulaPreservationScore = Math.max(0, Math.round(((evidence.formulaVault.length - missingFormulas.length) / evidence.formulaVault.length) * 100));
      issues.push({
        code: 'MISSING_FORMULAS',
        severity: 'warning',
        message: `${missingFormulas.length} vaulted formulas not referenced in KnowledgeGraph.`,
        autoFixable: true,
      });
    }
  }

  // 5. Heading Coverage Check
  let headingCoverageScore = 100;
  if (evidence && evidence.rootNodes && evidence.rootNodes.length > 0) {
    const majorEvidenceTitles = evidence.rootNodes.flatMap((r) => [r.title, ...r.children.map((c) => c.title)]);
    const graphTitles = graph.nodes.map((n) => n.title.toLowerCase());

    const covered = majorEvidenceTitles.filter((mt) =>
      graphTitles.some((gt) => gt.includes(mt.toLowerCase()) || mt.toLowerCase().includes(gt))
    );

    headingCoverageScore = majorEvidenceTitles.length > 0
      ? Math.round((covered.length / majorEvidenceTitles.length) * 100)
      : 100;
  }

  // 6. Source Reference Coverage Check
  const nodesWithSource = graph.nodes.filter(
    (n) => (n.sourceRefs && n.sourceRefs.length > 0) || (n.sourceReferences && n.sourceReferences.length > 0) || n.sourceText
  );
  const sourceReferenceCoverage = graph.nodes.length > 0
    ? Math.round((nodesWithSource.length / graph.nodes.length) * 100)
    : 100;

  // 7. Relationship Integrity Check
  let brokenRelCount = 0;
  for (const rel of graph.relationships) {
    if (!nodeIds.has(rel.fromNodeId) || !nodeIds.has(rel.toNodeId)) {
      brokenRelCount++;
      issues.push({
        code: 'BROKEN_RELATIONSHIP',
        severity: 'critical',
        message: `Relationship references missing nodes: ${rel.fromNodeId} -> ${rel.toNodeId}`,
        autoFixable: true,
      });
    }
  }

  const relationshipIntegrity = graph.relationships.length > 0
    ? Math.max(0, 100 - brokenRelCount * 20)
    : 100;

  const hierarchyIntegrity = Math.max(0, 100 - orphanStepsCount * 25);
  const tablePreservation = 100;
  const conceptCoverage = Math.max(0, 100 - duplicateCount * 10);

  // Calculate composite fidelity score (0 - 100)
  const compositeScore = Math.round(
    headingCoverageScore * 0.2 +
    formulaPreservationScore * 0.25 +
    hierarchyIntegrity * 0.25 +
    relationshipIntegrity * 0.15 +
    sourceReferenceCoverage * 0.15
  );

  return {
    score: Math.min(100, Math.max(0, compositeScore)),
    headingCoverage: headingCoverageScore,
    formulaPreservation: formulaPreservationScore,
    tablePreservation,
    conceptCoverage,
    sourceReferenceCoverage,
    relationshipIntegrity,
    hierarchyIntegrity,
    issues,
  };
}

/**
 * Stage 5: Deterministic Auto-Repair.
 * Fixes orphan algorithm steps, resolves formula references, repairs relationships, and cleans duplicate concepts.
 */
export function autoRepairKnowledgeGraph(
  graph: KnowledgeGraph,
  evidence?: DocumentStructureEvidence
): KnowledgeGraph {
  const nodes: KnowledgeNode[] = [...graph.nodes];
  const relationships: KnowledgeRelationship[] = [...graph.relationships];

  // 1. Ensure at least one algorithm node exists if algorithm steps are present
  let defaultAlgorithm = nodes.find((n) => n.type === 'algorithm');
  const hasSteps = nodes.some((n) => n.type === 'algorithm_step');

  if (hasSteps && !defaultAlgorithm) {
    const algoId = 'node-algorithm-auto';
    const firstSection = nodes.find((n) => n.type === 'section' || n.parentId === 'node-chapter-root') || nodes[0];
    defaultAlgorithm = {
      id: algoId,
      parentId: firstSection ? firstSection.id : 'node-chapter-root',
      title: 'Algorithm & Step Procedure',
      type: 'algorithm',
      importance: 'critical',
      summary: 'Computational algorithm and conversion procedure.',
      steps: [],
    };
    nodes.push(defaultAlgorithm);
  }

  // 2. Re-parent orphan algorithm steps under the algorithm node
  const updatedNodes: KnowledgeNode[] = nodes.map((node) => {
    if (node.type === 'algorithm_step') {
      const currentParent = nodes.find((n) => n.id === node.parentId);
      if (!currentParent || currentParent.type !== 'algorithm') {
        const targetAlgo = defaultAlgorithm || nodes.find((n) => n.type === 'algorithm') || nodes[0];
        return {
          ...node,
          parentId: targetAlgo.id,
        };
      }
    }
    return node;
  });

  // 3. Attach missing formulas from evidence vault to the root or nearest matching section
  if (evidence && evidence.formulaVault) {
    const allFormulas = updatedNodes.flatMap((n) => n.formulas || []);
    for (const vaultEntry of evidence.formulaVault) {
      const exists = allFormulas.some((f) => f.latex.replace(/\s+/g, '') === vaultEntry.latex.replace(/\s+/g, ''));
      if (!exists) {
        // Find matching node by meaning/title or attach to first section
        const matchingNode = updatedNodes.find((n) =>
          vaultEntry.meaning && n.title.toLowerCase().includes(vaultEntry.meaning.toLowerCase().slice(0, 10))
        ) || updatedNodes[1] || updatedNodes[0];

        if (matchingNode) {
          const currentFormulas = matchingNode.formulas ? [...matchingNode.formulas] : [];
          currentFormulas.push({
            id: vaultEntry.id,
            latex: vaultEntry.latex,
            raw: vaultEntry.raw,
            meaning: vaultEntry.meaning,
            sourceRef: vaultEntry.sourceRef,
          });
          const nodeIndex = updatedNodes.findIndex((n) => n.id === matchingNode.id);
          if (nodeIndex >= 0) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              formulas: currentFormulas,
            };
          }
        }
      }
    }
  }

  // 4. Clean relationships to ensure valid node IDs
  const validNodeIds = new Set(updatedNodes.map((n) => n.id));
  const validRelationships = relationships.filter(
    (r) => validNodeIds.has(r.fromNodeId) && validNodeIds.has(r.toNodeId)
  );

  // 5. Ensure relationships exist for all parent-child links
  for (const node of updatedNodes) {
    if (node.parentId && validNodeIds.has(node.parentId)) {
      const hasRel = validRelationships.some(
        (r) => r.fromNodeId === node.parentId && r.toNodeId === node.id
      );
      if (!hasRel) {
        validRelationships.push({
          fromNodeId: node.parentId,
          toNodeId: node.id,
          type: node.type === 'algorithm_step' ? 'has_step' : node.type === 'algorithm' ? 'uses_algorithm' : 'contains',
          label: node.type === 'algorithm_step' ? 'Step' : 'Child concept',
        });
      }
    }
  }

  return {
    ...graph,
    nodes: updatedNodes,
    relationships: validRelationships,
    formulas: evidence?.formulaVault || graph.formulas,
    tables: evidence?.tableVault || graph.tables,
    sourceRefs: evidence?.sourceRefs || graph.sourceRefs,
  };
}

/**
 * Optional AI Critic: Calls a second LLM to evaluate academic completeness and suggest repairs.
 */
export async function runAICritic(
  graph: KnowledgeGraph,
  evidence: DocumentStructureEvidence
): Promise<{ approved: boolean; repairedGraph?: KnowledgeGraph; feedback?: string }> {
  const audit = auditKnowledgeGraph(graph, evidence);
  if (audit.score >= 95) {
    return { approved: true, repairedGraph: graph };
  }

  const aiProvider = new ResilientAIProvider();
  const systemPrompt = `You are the Academic Critic Engine of ShikshaSetu.
Your task is to audit the generated Knowledge Graph against the source document outline and repair any issues:
1. Are algorithm steps nested inside their algorithm parent?
2. Are all mathematical formulas preserved?
3. Are concepts properly grouped under major sections?
4. Are duplicate concepts merged?

Output ONLY the repaired Knowledge Graph in valid JSON.`;

  try {
    const userMessage = JSON.stringify({
      sourceOutline: evidence.rootNodes.map((r) => ({ title: r.title, type: r.detectedType })),
      vaultedFormulas: evidence.formulaVault.map((f) => ({ id: f.id, latex: f.latex })),
      currentGraph: graph,
      auditScore: audit.score,
      auditIssues: audit.issues,
    });

    const response = await aiProvider.generateCompletion({
      systemPrompt,
      userMessage,
      temperature: 0.1,
      maxTokens: 3500,
    });

    const cleanText = response.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanText);

    if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length >= 3) {
      const repaired = autoRepairKnowledgeGraph(parsed, evidence);
      return { approved: true, repairedGraph: repaired, feedback: 'AI Critic successfully repaired the graph.' };
    }
  } catch (err: any) {
    console.warn('[AICritic] Critic call failed, using deterministic auto-repair:', err?.message);
  }

  // Fallback to deterministic auto-repair
  const deterministicallyRepaired = autoRepairKnowledgeGraph(graph, evidence);
  return { approved: true, repairedGraph: deterministicallyRepaired };
}
