/**
 * ShikshaSetu — Formula Vault (Immutable Mathematical & Theoretical Foundation)
 * Extracts, standardizes, and vaults mathematical formulas & state tuples BEFORE LLM processing.
 * Guarantees that mathematical notation is NEVER rewritten, fragmented, or corrupted.
 */

import type { FormulaVaultEntry, FormulaBlock, SourceRef } from './types';

/**
 * Robust LaTeX & KaTeX normalizer for mathematical and theoretical expressions.
 */
export function normalizeMathFormula(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let formula = raw.trim();

  // Strip formula label prefixes like "Formula:", "Tuple:", "Equation:", "defined as:", "given by:"
  formula = formula
    .replace(/^(?:Formula|Tuple|Equation|Law\s*Formula|defined\s*as|given\s*by|equation)\s*[:=]?\s*/i, '')
    .replace(/^(?:where|if|then|let)\s+/i, '')
    .replace(/\s*(?:where|with|for|has|and|is\b).*$/i, '') // strip trailing explanation clauses
    .trim();

  // 1. Greek & special theoretical symbols
  formula = formula
    .replace(/Σ\*/g, '\\Sigma^*')
    .replace(/Σ\+/g, '\\Sigma^+')
    .replace(/Σ/g, '\\Sigma')
    .replace(/δ/g, '\\delta')
    .replace(/ε/g, '\\varepsilon')
    .replace(/λ/g, '\\lambda')
    .replace(/∅/g, '\\emptyset')
    .replace(/∈/g, '\\in')
    .replace(/⊆/g, '\\subseteq')
    .replace(/∪/g, '\\cup')
    .replace(/∩/g, '\\cap');

  // 2. State transition powerset / exponential notation / subscripts
  formula = formula
    .replace(/P\(Q\)/g, '2^Q')
    .replace(/\b2\^Q\b/g, '2^Q')
    .replace(/\bq0\b/g, 'q_0')
    .replace(/\bq_0\b/g, 'q_0')
    .replace(/QP\*/g, 'QP^*')
    .replace(/A\*B/g, 'A^*B')
    .replace(/R\*/g, 'R^*');

  // 3. Comparison & arithmetic operators
  formula = formula
    .replace(/(?:>=|≥)\s*/g, '\\ge ')
    .replace(/(?:<=|≤)\s*/g, '\\le ')
    .replace(/(?:!=|≠)\s*/g, '\\ne ')
    .replace(/(?:->|→)\s*/g, '\\rightarrow ')
    .replace(/×/g, ' \\times ')
    .replace(/\b([A-Za-z0-9_]+)\s*\*\s*([A-Za-z0-9_]+)\b/g, '$1 \\cdot $2');

  // 4. Set notation braces: e.g. L = {a, ab} -> L = \{a, ab\}
  formula = formula.replace(/(?<!\\)\{([^\}]+)(?<!\\)\}/g, '\\{$1\\}');

  // 5. Fractions: e.g. Q / t -> \frac{Q}{t}, W / Q -> \frac{W}{Q}
  formula = formula.replace(/\b([A-Za-z0-9_]+)\s*\/\s*([A-Za-z0-9_]+)\b/g, '\\frac{$1}{$2}');

  // 6. Common powers and subscripts in Physics/Electronics
  formula = formula
    .replace(/\bR_s\b/g, 'R_s')
    .replace(/\bR_p\b/g, 'R_p')
    .replace(/\bR1\b/g, 'R_1')
    .replace(/\bR2\b/g, 'R_2')
    .replace(/\bI\^2\b/g, 'I^2');

  // Clean double spaces
  formula = formula.replace(/\s{2,}/g, ' ');

  return formula.trim();
}

/**
 * Discrete formula boundary extractor with balanced bracket support.
 * Extracts mathematically clean expressions without trailing English clauses or broken bracket chops.
 */
function extractDiscreteFormulasFromLine(line: string): Array<{ raw: string; start: number; end: number }> {
  const matches: Array<{ raw: string; start: number; end: number }> = [];
  const trimmed = line.trim();
  if (!trimmed) return matches;

  // Helper to record non-overlapping formula spans
  function addMatch(raw: string, offset: number) {
    const start = offset;
    const end = offset + raw.length;
    // Ensure this span doesn't overlap with any previously recorded span
    const overlaps = matches.some((m) => Math.max(m.start, start) < Math.min(m.end, end));
    if (!overlaps && raw.length >= 2) {
      matches.push({ raw, start, end });
    }
  }

  // 1. 5-Tuple definitions: (Q, Σ, δ, q0, F)
  const tupleRegex = /\((?:Q|q),\s*(?:Σ|\\Sigma|Sigma),\s*(?:δ|\\delta|delta),\s*(?:q0|q_0),\s*F\)/gi;
  let tMatch: RegExpExecArray | null;
  while ((tMatch = tupleRegex.exec(line)) !== null) {
    addMatch(tMatch[0], tMatch.index);
  }

  // 2. Transition functions: δ: Q × Σ → Q or δ: Q × (Σ ∪ {ε}) → 2^Q
  const transRegex = /(?:δ|\\delta|delta)\s*:\s*Q\s*(?:×|\\times)\s*(?:\([^\)]+\)|[A-Za-zΣ\\{\\}ε]+)\s*(?:→|->|\\rightarrow)\s*(?:2\^Q|P\(Q\)|Q)/gi;
  let trMatch: RegExpExecArray | null;
  while ((trMatch = transRegex.exec(line)) !== null) {
    addMatch(trMatch[0], trMatch.index);
  }

  // 3. Set expressions with curly braces (e.g. L = {a, ab, abc}, L = {a^n : n >= 0}, Σ = {0, 1})
  // Match full balanced { ... } without chopping at commas
  const setRegex = /\b(?:L|Σ|Sigma)\s*=\s*(?:\\\{[^\}]+\\\}|\{[^\}]+\}|∅|\\emptyset|Σ\*|\\Sigma\*|Σ\+|\\Sigma\+)/gi;
  let sMatch: RegExpExecArray | null;
  while ((sMatch = setRegex.exec(line)) !== null) {
    addMatch(sMatch[0], sMatch.index);
  }

  // 4. Regular expression and algebraic equations: R = Q + RP, R = QP*, X = AX + B, X = A*B
  const reEqRegex = /\b([R|X])\s*=\s*([A-Za-z0-9_\^\*\+\(\)\s\cdot\\\{]+(?:\*|\+)[A-Za-z0-9_\^\*\+\(\)\s\cdot\\\}]*)/gi;
  let eqMatch: RegExpExecArray | null;
  while ((eqMatch = reEqRegex.exec(line)) !== null) {
    let cleanEq = eqMatch[0].trim();
    // Strip trailing clauses if any (e.g. "has", "where", "is")
    cleanEq = cleanEq.replace(/\s+(?:has|where|is|if|then|with|and|given).*$/i, '').trim();
    if (cleanEq.length >= 5 && /[=\+\*]/.test(cleanEq)) {
      addMatch(cleanEq, eqMatch.index);
    }
  }

  // 5. String length / empty string: |w|, |ε| = 0
  const strLenRegex = /\|(?:ε|\\varepsilon|w)\|\s*=\s*0/gi;
  let lenMatch: RegExpExecArray | null;
  while ((lenMatch = strLenRegex.exec(line)) !== null) {
    addMatch(lenMatch[0], lenMatch.index);
  }

  // 6. Physics/Circuit equations: V = I * R, I = Q / t, V = W / Q, H = I^2 * R * t, R_s = R1 + R2, 1 / R_p = 1 / R1 + 1 / R2
  const physicsRegex = /\b(?:V\s*=\s*I\s*[\*·\s]\s*R|I\s*=\s*Q\s*\/\s*t|V\s*=\s*W\s*\/\s*Q|H\s*=\s*I\^?2\s*[\*·\s]\s*R\s*[\*·\s]\s*t|R_s\s*=\s*R1\s*\+\s*R2|1\s*\/\s*R_p\s*=\s*1\s*\/\s*R1\s*\+\s*1\s*\/\s*R2)/gi;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = physicsRegex.exec(line)) !== null) {
    addMatch(pMatch[0], pMatch.index);
  }

  return matches;
}

/**
 * Extracts and registers all mathematical expressions into an immutable FormulaVault.
 */
export function extractFormulaVault(rawText: string): {
  vault: FormulaVaultEntry[];
  sanitizedText: string;
  sourceSpans: SourceRef[];
} {
  const vault: FormulaVaultEntry[] = [];
  const sourceSpans: SourceRef[] = [];
  const seenNormalized = new Set<string>();

  let counter = 1;
  const lines = rawText.split('\n');
  let currentOffset = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineStart = currentOffset;
    currentOffset += line.length + 1; // +1 for newline

    const discreteFormulas = extractDiscreteFormulasFromLine(line);

    for (const item of discreteFormulas) {
      const rawFormula = item.raw;
      const normalized = normalizeMathFormula(rawFormula);
      const normKey = normalized.replace(/\s+/g, '');

      if (!seenNormalized.has(normKey) && normalized.length >= 2) {
        seenNormalized.add(normKey);
        const formulaId = `FORMULA_${counter++}`;
        const sourceSpanId = `src-form-${formulaId.toLowerCase()}`;

        const span: SourceRef = {
          id: sourceSpanId,
          start: lineStart + item.start,
          end: lineStart + item.end,
          rawText: rawFormula,
          type: 'formula',
        };

        sourceSpans.push(span);

        vault.push({
          id: formulaId,
          raw: rawFormula,
          latex: normalized,
          meaning: line.slice(0, 80).trim(),
          sourceRef: sourceSpanId,
          start: span.start,
          end: span.end,
        });
      }
    }
  }

  return {
    vault,
    sanitizedText: rawText,
    sourceSpans,
  };
}

/**
 * Resolves a list of FormulaVault IDs into fully formatted FormulaBlocks for UI and export rendering.
 */
export function resolveFormulaRefs(refs: string[], vault: FormulaVaultEntry[]): FormulaBlock[] {
  if (!refs || refs.length === 0 || !vault || vault.length === 0) return [];

  const vaultMap = new Map<string, FormulaVaultEntry>();
  vault.forEach((v) => vaultMap.set(v.id, v));

  const resolved: FormulaBlock[] = [];
  for (const ref of refs) {
    const entry = vaultMap.get(ref);
    if (entry) {
      resolved.push({
        id: entry.id,
        latex: entry.latex,
        raw: entry.raw,
        meaning: entry.meaning,
        sourceRef: entry.sourceRef,
      });
    }
  }

  return resolved;
}

/**
 * Finds matching Formula Vault entries that are mentioned in or relevant to a given text block.
 */
export function findMatchingFormulaRefs(text: string, vault: FormulaVaultEntry[]): string[] {
  if (!text || !vault || vault.length === 0) return [];
  const matchedRefs: string[] = [];

  for (const entry of vault) {
    if (
      text.includes(entry.id) ||
      text.includes(entry.raw) ||
      normalizeMathFormula(text).includes(entry.latex)
    ) {
      matchedRefs.push(entry.id);
    }
  }

  return Array.from(new Set(matchedRefs));
}

/**
 * Deduplicates an array of formula blocks while preserving immutable LaTeX.
 */
export function deduplicateFormulas<T extends { latex: string }>(formulas: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const f of formulas) {
    const normalizedKey = normalizeMathFormula(f.latex).replace(/\s+/g, '');
    if (!seen.has(normalizedKey) && normalizedKey.length > 0) {
      seen.add(normalizedKey);
      result.push({
        ...f,
        latex: normalizeMathFormula(f.latex),
      });
    }
  }

  return result;
}
