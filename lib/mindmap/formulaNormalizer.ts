/**
 * ShikshaSetu — Mathematical & Theoretical Formula Normalizer
 * Standardizes LaTeX expressions, cleans symbols, and prevents duplicate formula generation.
 */

export function normalizeMathFormula(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let formula = raw.trim();

  // Strip formula label prefixes like "Formula:", "Tuple:", "Equation:"
  formula = formula.replace(/^(?:Formula|Tuple|Equation|Law\s*Formula)\s*[:=]?\s*/i, '');

  // 1. Greek symbols
  formula = formula
    .replace(/Σ\*/g, '\\Sigma^*')
    .replace(/Σ/g, '\\Sigma')
    .replace(/δ/g, '\\delta')
    .replace(/ε/g, '\\varepsilon')
    .replace(/∅/g, '\\emptyset')
    .replace(/∈/g, '\\in')
    .replace(/∪/g, '\\cup')
    .replace(/∩/g, '\\cap');

  // 2. Comparison & arithmetic operators
  formula = formula
    .replace(/(?:>=|≥)\s*/g, '\\ge ')
    .replace(/(?:<=|≤)\s*/g, '\\le ')
    .replace(/(?:!=|≠)\s*/g, '\\ne ')
    .replace(/(?:->|→)\s*/g, '\\rightarrow ')
    .replace(/×/g, ' \\cdot ')
    .replace(/\b([A-Za-z0-9_]+)\s*\*\s*([A-Za-z0-9_]+)\b/g, '$1 \\cdot $2');

  // 3. Set notation braces: e.g. L = {a, ab} -> L = \{a, ab\}
  // Replace unescaped braces that are part of set definitions
  formula = formula.replace(/(?<!\\)\{([^\}]+)(?<!\\)\}/g, '\\{$1\\}');

  // 4. Fractions: e.g. Q / t -> \frac{Q}{t}, W / Q -> \frac{W}{Q}
  formula = formula.replace(/\b([A-Za-z0-9_]+)\s*\/\s*([A-Za-z0-9_]+)\b/g, '\\frac{$1}{$2}');

  return formula.trim();
}

/**
 * Deduplicates an array of formulas by normalized string representation.
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
