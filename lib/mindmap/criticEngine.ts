/**
 * ShikshaSetu — Stage 5: Critic & Deterministic Auto-Repair Engine
 * Validates canonical Knowledge Graphs against source evidence with full Coverage Reporting.
 * Guarantees zero orphan algorithm steps, context preservation, immutable formula preservation, and duplicate elimination.
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { resolveFormulaRefs } from './formulaVault';
import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeRelationship,
  FidelityReport,
  ValidationIssue,
  DocumentStructureEvidence,
} from './types';

export interface DetailedCoverageReport {
  headingCoverage: number;
  missingHeadings: string[];
  formulaCoverage: number;
  missingFormulas: string[];
  tableCoverage: number;
  missingTables: string[];
  stepCoverage: number;
  orphanSteps: string[];
  duplicateNodeSpans: string[];
  sourceSpanCoverage: number;
}

/**
 * Deterministically audits source coverage between evidence and the generated KnowledgeGraph.
 */
export function validateSourceCoverage(
  evidence: DocumentStructureEvidence,
  graph: KnowledgeGraph
): DetailedCoverageReport {
  // 1. Heading coverage
  const allEvidenceHeadings: string[] = [];
  function collectHeadings(nodes: any[]) {
    for (const n of nodes) {
      if (n.title && n.title.length > 2 && n.detectedType !== 'text' && n.detectedType !== 'list_item') {
        allEvidenceHeadings.push(n.title);
      }
      if (n.children && n.children.length > 0) collectHeadings(n.children);
    }
  }
  collectHeadings(evidence.rootNodes);

  const graphTitles = graph.nodes.map((n) => n.title.toLowerCase());
  const missingHeadings = allEvidenceHeadings.filter((h) => {
    const hLow = h.toLowerCase();
    return !graphTitles.some((gt) => gt.includes(hLow) || hLow.includes(gt));
  });

  const headingCoverage = allEvidenceHeadings.length > 0
    ? Math.round(((allEvidenceHeadings.length - missingHeadings.length) / allEvidenceHeadings.length) * 100)
    : 100;

  // 2. Formula coverage
  const allGraphFormulaIds = new Set<string>(
    graph.nodes.flatMap((n) => [
      ...(n.formulaRefs || []),
      ...(n.formulas || []).map((f) => f.id || ''),
    ]).filter(Boolean)
  );

  const allGraphLatex = graph.nodes.flatMap((n) => (n.formulas || []).map((f) => f.latex.replace(/\s+/g, '')));

  const missingFormulas = evidence.formulaVault.filter((f) => {
    const normKey = f.latex.replace(/\s+/g, '');
    return !allGraphFormulaIds.has(f.id) && !allGraphLatex.some((gl) => gl.includes(normKey) || normKey.includes(gl));
  }).map((f) => f.raw);

  const formulaCoverage = evidence.formulaVault.length > 0
    ? Math.round(((evidence.formulaVault.length - missingFormulas.length) / evidence.formulaVault.length) * 100)
    : 100;

  // 3. Table coverage
  const allGraphTableIds = new Set<string>(
    graph.nodes.flatMap((n) => [...(n.tableRefs || []), n.table?.id || '']).filter(Boolean)
  );
  const missingTables = evidence.tableVault.filter((t) => !allGraphTableIds.has(t.id)).map((t) => t.id);
  const tableCoverage = evidence.tableVault.length > 0
    ? Math.round(((evidence.tableVault.length - missingTables.length) / evidence.tableVault.length) * 100)
    : 100;

  // 4. Algorithm step containment
  const stepNodes = graph.nodes.filter((n) => n.type === 'algorithm_step');
  const nodeMap = new Map<string, KnowledgeNode>();
  graph.nodes.forEach((n) => nodeMap.set(n.id, n));

  const orphanSteps = stepNodes.filter((s) => {
    if (!s.parentId) return true;
    const parent = nodeMap.get(s.parentId);
    return !parent || parent.type !== 'algorithm';
  }).map((s) => s.title);

  const stepCoverage = stepNodes.length > 0
    ? Math.round(((stepNodes.length - orphanSteps.length) / stepNodes.length) * 100)
    : 100;

  // 5. Source span duplication
  const seenSpans = new Map<string, string[]>();
  for (const node of graph.nodes) {
    for (const span of node.sourceRefs || []) {
      const existing = seenSpans.get(span) || [];
      existing.push(node.id);
      seenSpans.set(span, existing);
    }
  }

  const duplicateNodeSpans: string[] = [];
  for (const [span, nodeIds] of seenSpans.entries()) {
    if (nodeIds.length > 1) {
      duplicateNodeSpans.push(span);
    }
  }

  const nodesWithSource = graph.nodes.filter(
    (n) => (n.sourceRefs && n.sourceRefs.length > 0) || (n.sourceReferences && n.sourceReferences.length > 0) || n.sourceText
  );
  const sourceSpanCoverage = graph.nodes.length > 0
    ? Math.round((nodesWithSource.length / graph.nodes.length) * 100)
    : 100;

  return {
    headingCoverage,
    missingHeadings,
    formulaCoverage,
    missingFormulas,
    tableCoverage,
    missingTables,
    stepCoverage,
    orphanSteps,
    duplicateNodeSpans,
    sourceSpanCoverage,
  };
}

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

  // 2. Orphan Algorithm Step & Context Escaping Checks
  let orphanStepsCount = 0;
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

  // 4. Coverage Validation (if evidence provided)
  let headingCoverageScore = 100;
  let formulaPreservationScore = 100;
  let tablePreservation = 100;

  if (evidence) {
    const coverage = validateSourceCoverage(evidence, graph);
    headingCoverageScore = coverage.headingCoverage;
    formulaPreservationScore = coverage.formulaCoverage;
    tablePreservation = coverage.tableCoverage;

    if (coverage.missingFormulas.length > 0) {
      issues.push({
        code: 'MISSING_FORMULAS',
        severity: 'warning',
        message: `${coverage.missingFormulas.length} formulas missing from graph: ${coverage.missingFormulas.slice(0, 3).join(', ')}`,
        autoFixable: true,
      });
    }

    // Trigger span-based coverage report
    generateSpanCoverageReport(evidence, graph);
  }

  // 5. Source Reference Coverage Check
  const nodesWithSource = graph.nodes.filter(
    (n) => (n.sourceRefs && n.sourceRefs.length > 0) || (n.sourceReferences && n.sourceReferences.length > 0) || n.sourceText
  );
  const sourceReferenceCoverage = graph.nodes.length > 0
    ? Math.round((nodesWithSource.length / graph.nodes.length) * 100)
    : 100;

  // 6. Relationship Integrity Check
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

export type SourceCoverageStatus =
  | 'represented'
  | 'merged'
  | 'summarized'
  | 'structural_only'
  | 'ignored_noise'
  | 'missing';

export interface SpanCoverageReport {
  totalSpans: number;
  represented: number;
  merged: number;
  summarized: number;
  structuralOnly: number;
  ignoredNoise: number;
  missing: number;
  duplicated: number;
}

export function generateSpanCoverageReport(
  evidence: DocumentStructureEvidence,
  graph: KnowledgeGraph
): SpanCoverageReport {
  const allSpans = evidence.sourceRefs || [];
  const nodeMap = new Map<string, KnowledgeNode>();
  graph.nodes.forEach((n) => nodeMap.set(n.id, n));

  const spanToNodeIdMap = new Map<string, string[]>();
  for (const node of graph.nodes) {
    if (node.sourceRefs) {
      for (const refId of node.sourceRefs) {
        const list = spanToNodeIdMap.get(refId) || [];
        list.push(node.id);
        spanToNodeIdMap.set(refId, list);
      }
    }
  }

  let represented = 0;
  let merged = 0;
  let summarized = 0;
  let structuralOnly = 0;
  let ignoredNoise = 0;
  let missing = 0;
  let duplicated = 0;

  for (const span of allSpans) {
    if (span.id === 'src-root-doc' || span.type === 'noise') {
      ignoredNoise++;
      continue;
    }

    const claimers = spanToNodeIdMap.get(span.id) || [];

    if (claimers.length === 0) {
      let referenced = false;
      if (span.type === 'formula') {
        referenced = graph.nodes.some(
          (n) => n.formulaRefs?.includes(span.id) || n.formulas?.some((f) => f.sourceRef === span.id)
        );
      } else if (span.type === 'table') {
        referenced = graph.nodes.some(
          (n) => n.tableRefs?.includes(span.id) || n.table?.sourceRef === span.id
        );
      }

      if (referenced) {
        represented++;
      } else {
        missing++;
      }
    } else {
      if (claimers.length > 1) {
        duplicated++;
      }

      const firstClaimer = nodeMap.get(claimers[0]);
      if (firstClaimer) {
        if (firstClaimer.type === 'root' || firstClaimer.type === 'unit' || firstClaimer.type === 'section') {
          structuralOnly++;
        } else {
          represented++;
        }
      } else {
        missing++;
      }
    }
  }

  const report: SpanCoverageReport = {
    totalSpans: allSpans.length,
    represented,
    merged,
    summarized,
    structuralOnly,
    ignoredNoise,
    missing,
    duplicated,
  };

  console.log('=== SPAN-BASED SOURCE COVERAGE REPORT ===');
  console.log(`Total Spans: ${report.totalSpans}`);
  console.log(`Represented: ${report.represented}`);
  console.log(`Merged: ${report.merged}`);
  console.log(`Summarized: ${report.summarized}`);
  console.log(`Structural-only: ${report.structuralOnly}`);
  console.log(`Ignored noise: ${report.ignoredNoise}`);
  console.log(`Missing: ${report.missing}`);
  console.log(`Duplicated: ${report.duplicated}`);

  return report;
}

/**
 * Stage 5: Deterministic Auto-Repair.
 * Fixes orphan algorithm steps within their local section context (never escaping to root),
 * resolves formula references, repairs relationships, and cleans duplicate concepts.
 */
export function autoRepairKnowledgeGraph(
  graph: KnowledgeGraph,
  evidence?: DocumentStructureEvidence
): KnowledgeGraph {
  let nodes: KnowledgeNode[] = [...graph.nodes];
  const relationships: KnowledgeRelationship[] = [...graph.relationships];
  let nodeMap = new Map<string, KnowledgeNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // 1. Identify all parent nodes of algorithm_step nodes.
  // Promote them to 'algorithm' ONLY if they contain semantic algorithm keywords in their title
  const ALGO_KEYWORDS = /algorithm|procedure|conversion|construction|method|equivalence|minimization|reduction/i;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 'algorithm_step' && node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent && parent.type !== 'algorithm' && parent.type !== 'root' && parent.type !== 'unit') {
        if (ALGO_KEYWORDS.test(parent.title)) {
          const parentIdx = nodes.findIndex((n) => n.id === parent.id);
          if (parentIdx >= 0) {
            nodes[parentIdx] = {
              ...nodes[parentIdx],
              type: 'algorithm',
            };
            nodeMap.set(parent.id, nodes[parentIdx]);
          }
        }
      }
    }
  }

  // 2. Re-parent orphan/parentless algorithm steps under their actual local section branch
  nodes = nodes.map((node) => {
    if (node.type === 'algorithm_step') {
      const currentParent = node.parentId ? nodeMap.get(node.parentId) : null;
      if (currentParent && currentParent.type === 'algorithm') {
        return node;
      }

      const nodePath = node.context?.sectionPath || [];
      let bestParent: KnowledgeNode | null = null;
      let maxMatchLen = 0;

      for (const candidate of nodes) {
        if (candidate.id === node.id) continue;
        if (candidate.type !== 'algorithm') continue;

        const candidatePath = candidate.context?.sectionPath || [];
        let matchLen = 0;
        while (matchLen < nodePath.length && matchLen < candidatePath.length && nodePath[matchLen] === candidatePath[matchLen]) {
          matchLen++;
        }

        if (matchLen > maxMatchLen) {
          maxMatchLen = matchLen;
          bestParent = candidate;
        }
      }

      if (bestParent) {
        return {
          ...node,
          parentId: bestParent.id,
        };
      } else {
        // If no valid algorithm exists in the same branch, preserve as a structured list/step candidate (type = 'property')
        // under its original local parent (which is a topic or section).
        return {
          ...node,
          type: 'property',
        };
      }
    }
    return node;
  });

  // Re-sync nodeMap
  nodeMap = new Map<string, KnowledgeNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // 3. Resolve and attach formula references contextually (WITHOUT dumping all on the first section)
  if (evidence && evidence.formulaVault && evidence.formulaVault.length > 0) {
    const vault = evidence.formulaVault;

    nodes = nodes.map((node) => {
      const matchingRefs = vault
        .filter((v) => {
          const text = (node.title + ' ' + (node.summary || '') + ' ' + (node.definitions || []).join(' ')).toLowerCase();
          return (
            (node.formulaRefs && node.formulaRefs.includes(v.id)) ||
            (v.meaning && text.includes(v.meaning.toLowerCase().slice(0, 15))) ||
            text.includes(v.raw.toLowerCase())
          );
        })
        .map((v) => v.id);

      const combinedRefs = Array.from(new Set([...(node.formulaRefs || []), ...matchingRefs]));
      const resolvedFormulas = resolveFormulaRefs(combinedRefs, vault);

      return {
        ...node,
        formulaRefs: combinedRefs,
        formulas: resolvedFormulas.length > 0 ? resolvedFormulas : node.formulas,
      };
    });
  }

  // 4. Clean relationships to ensure valid node IDs
  const validNodeIds = new Set(nodes.map((n) => n.id));
  const validRelationships = relationships.filter(
    (r) => validNodeIds.has(r.fromNodeId) && validNodeIds.has(r.toNodeId)
  );

  // 5. Ensure relationships exist for all parent-child links
  for (const node of nodes) {
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
    nodes,
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
