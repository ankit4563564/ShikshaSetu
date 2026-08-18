'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaRendererProps {
  latex: string;
  inline?: boolean;
  className?: string;
}

export default function FormulaRenderer({
  latex,
  inline = false,
  className = '',
}: FormulaRendererProps) {
  const renderedHtml = useMemo(() => {
    if (!latex || typeof latex !== 'string') return '';
    try {
      // Clean up common wrapped delimiters like $...$ or $$...$$
      let cleaned = latex.trim();
      if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
        cleaned = cleaned.slice(2, -2).trim();
      } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
        cleaned = cleaned.slice(1, -1).trim();
      }

      return katex.renderToString(cleaned, {
        displayMode: !inline,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (error) {
      console.warn('[FormulaRenderer] KaTeX rendering failed for expression:', latex, error);
      return null;
    }
  }, [latex, inline]);

  if (!renderedHtml) {
    return (
      <code className={`font-mono text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 ${className}`}>
        {latex}
      </code>
    );
  }

  return (
    <span
      className={`katex-equation-wrapper select-text font-serif leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
