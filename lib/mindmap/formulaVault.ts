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
 * Discrete formula boundary extractor.
 * Extracts mathematically clean expressions without trailing English clauses.
 */
function extractDiscreteFormulasFromLine(line: string): string[] {
  const formulas: string[] = [];
  const trimmed = line.trim();
  if (!trimmed) return formulas;

  // 1. 5-Tuple definitions: (Q, Σ, δ, q0, F)
  const tupleMatch = trimmed.match(/\((?:Q|q),\s*(?:Σ|\\Sigma|Sigma),\s*(?:δ|\\delta|delta),\s*(?:q0|q_0),\s*F\)/i);
  if (tupleMatch) {
    formulas.push(tupleMatch[0]);
  }

  // 2. Transition functions: δ: Q × Σ → Q or δ: Q × (Σ ∪ {ε}) → 2^Q
  const transMatch = trimmed.match(/(?:δ|\\delta|delta)\s*:\s*Q\s*(?:×|\\times)\s*(?:\([^\)]+\)|[A-Za-zΣ\\{\\}ε]+)\s*(?:→|->|\\rightarrow)\s*(?:2\^Q|P\(Q\)|Q)/i);
  if (transMatch) {
    formulas.push(transMatch[0]);
  }

  // 3. Arden's & Regular Expression Equations: R = Q + RP, R = QP*, X = AX + B, X = A*B
  const reEqMatches = trimmed.matchAll(/\b([R|X|L|V|I|H|W])\s*=\s*([^,;\.\n]+?)(?=\s+(?:has|where|is|if|then|with|and|given|\(|$)|[,;\.]|$)/gi);
  for (const m of reEqMatches) {
    const fullExpr = `${m[1]} = ${m[2]}`.trim();
    // Validate that it looks like a valid mathematical/theoretical equation
    if (/[=\+\-\*\/\^\\_×→∪ε∅Σ\{]/.test(fullExpr) && fullExpr.length >= 3 && fullExpr.length <= 50) {
      // Exclude simple plain english words falsely matched
      if (!/\b(?:is|are|the|this|that|can|be|for)\b/i.test(fullExpr)) {
        formulas.push(fullExpr);
      }
    }
  }

  // 4. Language definitions: L = {a, ab}, L = {a^n : n >= 0}, L = ∅, L = Σ*
  const langMatch = trimmed.match(/\bL\s*=\s*(?:\\\{[^\}]+\\\}|\{[^\}]+\}|∅|\\emptyset|Σ\*|\\Sigma\*|\{[^:]+:\s*[^}]+\})/);
  if (langMatch && !formulas.some((f) => f.includes(langMatch[0]))) {
    formulas.push(langMatch[0]);
  }

  // 5. String length / empty string: |w|, |ε| = 0
  const strLenMatch = trimmed.match(/\|(?:ε|\\varepsilon|w)\|\s*=\s*0/);
  if (strLenMatch) {
    formulas.push(strLenMatch[0]);
  }

  // 6. Physics/Circuit equations: V = I * R, I = Q / t, V = W / Q, H = I^2 * R * t, R_s = R1 + R2, 1 / R_p = 1 / R1 + 1 / R2
  const physicsMatches = trimmed.matchAll(/\b(?:V\s*=\s*I\s*[\*·\s]\s*R|I\s*=\s*Q\s*\/\s*t|V\s*=\s*W\s*\/\s*Q|H\s*=\s*I\^?2\s*[\*·\s]\s*R\s*[\*·\s]\s*t|R_s\s*=\s*R1\s*\+\s*R2|1\s*\/\s*R_p\s*=\s*1\s*\/\s*R1\s*\+\s*1\s*\/\s*R2)/gi);
  for (const pm of physicsMatches) {
    if (!formulas.some((f) => f.includes(pm[0]))) {
      formulas.push(pm[0]);
    }
  }

  return formulas;
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

    for (const rawFormula of discreteFormulas) {
      const normalized = normalizeMathFormula(rawFormula);
      const normKey = normalized.replace(/\s+/g, '');

      if (!seenNormalized.has(normKey) && normalized.length >= 2) {
        seenNormalized.add(normKey);
        const formulaId = `FORMULA_${counter++}`;
        const sourceSpanId = `src-form-${formulaId.toLowerCase()}`;

        const matchIdx = line.indexOf(rawFormula);
        const span: SourceRef = {
          id: sourceSpanId,
          start: lineStart + (matchIdx >= 0 ? matchIdx : 0),
          end: lineStart + (matchIdx >= 0 ? matchIdx : 0) + rawFormula.length,
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
