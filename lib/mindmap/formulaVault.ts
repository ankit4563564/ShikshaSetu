/**
 * ShikshaSetu — Formula Vault (Immutable Mathematical & Theoretical Foundation)
 * Extracts, standardizes, and vaults mathematical formulas & state tuples BEFORE LLM processing.
 * Guarantees that mathematical notation is NEVER rewritten, fragmented, or corrupted.
 */

import type { FormulaVaultEntry, FormulaBlock, SourceRef } from './types';

/**
 * Strict semantic and syntax validator to ensure candidate text is a genuine mathematical formula
 * and reject PDF metadata, CSS/HTML tokens, file paths, URLs, and English sentences.
 */
export function isValidMathematicalFormula(raw: string): boolean {
  if (!raw || typeof raw !== 'string') return false;
  const trimmed = raw.trim();

  // Length constraints
  if (trimmed.length < 2 || trimmed.length > 250) return false;

  // 1. Reject URLs and web links
  if (/^(?:https?:\/\/|www\.|\/\/|mailto:)/i.test(trimmed) || /\b(?:https?:\/\/\S+|www\.\S+)/i.test(trimmed)) {
    return false;
  }

  // 2. Reject file paths and system artifacts
  if (/(?:^[A-Za-z]:\\|^\/[A-Za-z0-9_\.\-]+|\b\.(?:pdf|docx|html|css|js|ts|json|png|jpg)\b)/i.test(trimmed)) {
    return false;
  }

  // 3. Reject HTML/CSS properties and DOM tags
  if (/<[A-Za-z\/][^>]*>|font-(?:size|family|weight)|margin|padding|background|border|color\s*:|class=|id=/i.test(trimmed)) {
    return false;
  }

  // 4. Reject PDF structural metadata, stream markers, and binary internals
  if (/\/Type\s*\/|\/Filter\s*\/|<<|>>|\bobj\b|\bendobj\b|\bxref\b|\btrailer\b|\bstream\b|\bendstream\b|FlateDecode/i.test(trimmed)) {
    return false;
  }

  // 5. Reject English explanatory sentences disguised as formulas (e.g. "X = the student who studied")
  const words = trimmed.split(/\s+/);
  const commonEnglishWords = trimmed.match(/\b(?:the|this|that|these|those|is|are|was|were|has|have|had|with|without|from|into|about|because|which|where|when|who|whose)\b/gi);
  if (commonEnglishWords && commonEnglishWords.length >= 3 && !/[ΣδερλΩπ\+\*\/\^\\\{\}]/.test(trimmed)) {
    return false;
  }

  // 6. Must contain mathematical indicator: operators, Greek characters, state tuples, or fractions
  const hasMathSymbols = /[=><≤≥≠≈≡∈⊆∪∩×·\+\-\*\/\\^_{}\(\)ΣδερλΩπ]/.test(trimmed);
  const hasTupleStructure = /^\([A-Za-z0-9_,\s\Sigma\delta\ε\λ]+\)$/.test(trimmed);
  const hasSetStructure = /^(?:[A-Za-z0-9_]+\s*=\s*)?\{[^\}]*\}$/.test(trimmed);

  return hasMathSymbols || hasTupleStructure || hasSetStructure;
}

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
    .replace(/ρ|\brho\b/g, '\\rho')
    .replace(/Ω|\bOhm\b|\bohms\b/gi, '\\Omega')
    .replace(/π|\bpi\b/gi, '\\pi')
    .replace(/θ|\btheta\b/gi, '\\theta')
    .replace(/μ|\bmu\b/gi, '\\mu')
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
    .replace(/\bR3\b/g, 'R_3')
    .replace(/\bI\^2\b/g, 'I^2')
    .replace(/\bV\^2\b/g, 'V^2');

  // Clean double spaces
  formula = formula.replace(/\s{2,}/g, ' ');

  return formula.trim();
}

/**
 * Discrete formula boundary extractor with balanced bracket support.
 * Extracts mathematically clean expressions without trailing English clauses or broken bracket chops.
 */
function extractBalancedFormulaAt(line: string, startIndex: number): string {
  let index = startIndex;
  const len = line.length;
  let braces = 0;
  let parens = 0;
  let brackets = 0;
  
  while (index < len) {
    const char = line[index];
    if (char === '{') braces++;
    else if (char === '}') braces--;
    else if (char === '(') parens++;
    else if (char === ')') parens--;
    else if (char === '[') brackets++;
    else if (char === ']') brackets--;
    
    // Check if we hit an English word boundary (e.g. " where ", " is ", " and ", " let ")
    if (braces === 0 && parens === 0 && brackets === 0) {
      const remaining = line.slice(index);
      if (/^\s+(?:where|is|for|and|let|with|has|defined|given)\b/i.test(remaining)) {
        break;
      }
      // If we encounter a comma/period/semicolon followed by space and an English word or capital letter
      if (/^[,\.;]\s+[A-Za-z]/i.test(remaining) && !/^[,\.;]\s+\d/i.test(remaining)) {
        break;
      }
    }
    
    index++;
    
    // If all balances are 0 and we hit a character that cannot possibly be in a formula, stop
    if (braces === 0 && parens === 0 && brackets === 0) {
      if (char === '}' || char === ')') {
        break;
      }
    }
  }
  
  let raw = line.slice(startIndex, index).trim();
  if (raw.endsWith('.') || raw.endsWith(',')) {
    raw = raw.slice(0, -1).trim();
  }
  return raw;
}

function extractDiscreteFormulasFromLine(line: string): Array<{ raw: string; start: number; end: number }> {
  const matches: Array<{ raw: string; start: number; end: number }> = [];
  const trimmed = line.trim();
  if (!trimmed) return matches;

  // Strict domain-specific and mathematical formula prefixes
  const PREFIXES = [
    /\b(?:L|Σ|Sigma)\s*=\s*(?:\\\{|\{|∅|\\emptyset|Σ\*|\\Sigma\*|Σ\+|\\Sigma\+)/gi,
    /(?:δ|\\delta|delta)\s*:\s*/gi,
    /\((?:Q|q|Q_0|q_0),\s*(?:Σ|\\Sigma|Sigma)/gi,
    /\b(?:R|R_s|1\s*\/\s*R_p|R_p)\s*=\s*(?:[A-Za-z0-9_\+\-\*\/\(\)\{\}\\\.\s\rho\Omega]+)/gi,
    /\|(?:ε|\\varepsilon|w)\|\s*=\s*/gi,
    /\b(?:V|I|H|P|W|E|F|a|v|u|s|t)\s*=\s*(?:[A-Za-z0-9_\+\-\*\/\(\)\{\}\\\.\s]+)/gi,
    /\b(?:[A-Za-z0-9_]+)\s*=\s*(?:\\[A-Za-z]+|[A-Za-z0-9_]+\s*[\+\-\*\/\^]\s*[A-Za-z0-9_]+)/gi
  ];

  for (const regex of PREFIXES) {
    let match: RegExpExecArray | null;
    regex.lastIndex = 0;
    while ((match = regex.exec(line)) !== null) {
      const startIndex = match.index;
      const rawFormula = extractBalancedFormulaAt(line, startIndex);
      const start = startIndex;
      const end = startIndex + rawFormula.length;
      
      // Strict semantic and mathematical syntax check
      if (isValidMathematicalFormula(rawFormula)) {
        const overlaps = matches.some((m) => Math.max(m.start, start) < Math.min(m.end, end));
        if (!overlaps) {
          matches.push({ raw: rawFormula, start, end });
        }
      }
    }
  }

  return matches.sort((a, b) => a.start - b.start);
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
  const seenSpans = new Set<string>();

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

      const spanStart = lineStart + item.start;
      const spanEnd = lineStart + item.end;
      const spanKey = `${spanStart}-${spanEnd}`;

      if (!seenSpans.has(spanKey) && normalized.length >= 2) {
        seenSpans.add(spanKey);
        const formulaId = `FORMULA_${counter++}`;
        const sourceSpanId = `src-form-${formulaId.toLowerCase()}`;

        const span: SourceRef = {
          id: sourceSpanId,
          start: spanStart,
          end: spanEnd,
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
  vault.forEach((v) => {
    vaultMap.set(v.id, v);
    vaultMap.set(v.id.toLowerCase(), v);
    vaultMap.set(v.id.replace(/_/g, '-').toLowerCase(), v);
    vaultMap.set(v.id.replace(/-/g, '_').toLowerCase(), v);
    vaultMap.set(v.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(), v);
  });

  const resolved: FormulaBlock[] = [];
  const seenIds = new Set<string>();

  for (const ref of refs) {
    if (!ref) continue;
    const cleanRefKey = ref.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const entry = vaultMap.get(cleanRefKey) || vaultMap.get(ref) || vaultMap.get(ref.toLowerCase());
    if (entry && !seenIds.has(entry.id)) {
      seenIds.add(entry.id);
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
