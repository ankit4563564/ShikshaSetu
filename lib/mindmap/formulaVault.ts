/**
 * ShikshaSetu — Formula Vault (Immutable Mathematical & Theoretical Foundation)
 * Extracts, standardizes, and vaults mathematical formulas & state tuples BEFORE LLM processing.
 * Guarantees that mathematical notation is NEVER rewritten or corrupted by LLMs.
 */

import type { FormulaVaultEntry, FormulaBlock, SourceRef } from './types';

/**
 * Robust LaTeX & KaTeX normalizer for mathematical and theoretical expressions.
 */
export function normalizeMathFormula(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let formula = raw.trim();

  // Strip formula label prefixes like "Formula:", "Tuple:", "Equation:"
  formula = formula.replace(/^(?:Formula|Tuple|Equation|Law\s*Formula)\s*[:=]?\s*/i, '');

  // 1. Greek & special symbols
  formula = formula
    .replace(/Σ\*/g, '\\Sigma^*')
    .replace(/Σ/g, '\\Sigma')
    .replace(/δ/g, '\\delta')
    .replace(/ε/g, '\\varepsilon')
    .replace(/λ/g, '\\lambda')
    .replace(/∅/g, '\\emptyset')
    .replace(/∈/g, '\\in')
    .replace(/∪/g, '\\cup')
    .replace(/∩/g, '\\cap');

  // 2. State transition powerset / exponential notation
  formula = formula
    .replace(/P\(Q\)/g, '2^Q')
    .replace(/\b2\^Q\b/g, '2^Q')
    .replace(/q0/g, 'q_0')
    .replace(/q_0/g, 'q_0');

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

  // 6. Common powers and subscripts
  formula = formula
    .replace(/R_s/g, 'R_s')
    .replace(/R_p/g, 'R_p')
    .replace(/R1/g, 'R_1')
    .replace(/R2/g, 'R_2')
    .replace(/I\^2/g, 'I^2');

  return formula.trim();
}

/**
 * Regular expressions detecting mathematical equations, state tuples, and formal theoretical expressions.
 */
const FORMULA_PATTERNS: RegExp[] = [
  // 5-tuple automaton definition: (Q, Σ, δ, q0, F) or with Greek symbols
  /\((?:Q|q),\s*(?:Σ|\\Sigma|Sigma),\s*(?:δ|\\delta|delta),\s*(?:q0|q_0),\s*F\)/i,
  // Transition functions: δ: Q × Σ → Q, δ: Q × (Σ ∪ {ε}) → P(Q), etc.
  /(?:δ|\\delta|delta)\s*:\s*[A-Za-z0-9_\\^\{\}\s\+\-\*\/\(\)\=\.·×→∪ε\emptyset,]+/i,
  // Regular expressions theorems / formulas: R = Q + RP, R = QP*, etc.
  /\b[A-Za-z]\s*=\s*[A-Za-z0-9_\^\*\+\(\)\s\cdot\\\{]+(?:\*|\+)[A-Za-z0-9_\^\*\+\(\)\s\cdot\\\}]*/,
  // Language set definitions: L = { ... }, L = \emptyset, L = \Sigma*
  /\bL\s*=\s*(?:\\\{[^\}]+\\\}|\{[^\}]+\}|∅|\\emptyset|Σ\*|\\Sigma\*|\{[^:]+:\s*[^}]+\})/,
  // Physics & Electronics laws: V = I * R, I = Q / t, V = W / Q, H = I^2 * R * t, 1/R_p = 1/R_1 + 1/R_2
  /\b(?:V\s*=\s*I\s*[\*·\s]\s*R|I\s*=\s*Q\s*\/\s*t|V\s*=\s*W\s*\/\s*Q|H\s*=\s*I\^?2\s*[\*·\s]\s*R\s*[\*·\s]\s*t|R_s\s*=\s*R1\s*\+\s*R2|1\s*\/\s*R_p\s*=\s*1\s*\/\s*R1\s*\+\s*1\s*\/\s*R2)/i,
  // Standard equations: [Variable] = [Expression with math operators]
  /\b[A-Za-z_][A-Za-z0-9_]*\s*=\s*[^;\.\n,]{2,40}(?:[\+\-\*\/×·\^\\_]|\\frac|\\Sigma|\\delta)/,
  // Tuple definitions: e.g. 5-tuple (Q, \Sigma, ...)
  /5-tuple\s*\([^\)]+\)/i,
];

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

  let sanitized = rawText;
  let counter = 1;

  // Split lines to detect line-level or inline mathematical formulas
  const lines = rawText.split('\n');
  let currentOffset = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineStart = currentOffset;
    const lineEnd = currentOffset + line.length;
    currentOffset += line.length + 1; // +1 for newline

    for (const pattern of FORMULA_PATTERNS) {
      const match = line.match(pattern);
      if (match && match[0]) {
        const rawFormula = match[0].trim();
        const normalized = normalizeMathFormula(rawFormula);
        const normKey = normalized.replace(/\s+/g, '');

        if (!seenNormalized.has(normKey) && normalized.length > 1) {
          seenNormalized.add(normKey);
          const formulaId = `FORMULA_${counter++}`;
          const sourceSpanId = `src-form-${formulaId.toLowerCase()}`;

          const span: SourceRef = {
            id: sourceSpanId,
            start: lineStart + (match.index || 0),
            end: lineStart + (match.index || 0) + rawFormula.length,
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
  }

  return {
    vault,
    sanitizedText: sanitized,
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
