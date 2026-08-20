/**
 * ShikshaSetu — Table Extractor & Vault Engine
 * Detects Markdown, ASCII, Comparison, and State Transition tables.
 * Prevents tables from being fragmented into unrelated bullet points.
 */

import type { TableVaultEntry, TableStructure, SourceRef } from './types';

/**
 * Parses markdown, ASCII, and pipe-delimited tables from text.
 */
export function extractTableVault(rawText: string): {
  vault: TableVaultEntry[];
  sanitizedText: string;
  sourceSpans: SourceRef[];
} {
  const vault: TableVaultEntry[] = [];
  const sourceSpans: SourceRef[] = [];

  const lines = rawText.split('\n');
  let inTable = false;
  let tableLines: string[] = [];
  let tableStartOffset = 0;
  let currentOffset = 0;
  let tableCounter = 1;

  const resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStart = currentOffset;
    currentOffset += line.length + 1;

    const isPipeRow = line.trim().startsWith('|') && line.trim().endsWith('|') && line.includes('|');
    const isDivider = /^\|\s*[-:]+\s*(\|\s*[-:]+\s*)+\|$/.test(line.trim());

    if (isPipeRow || isDivider) {
      if (!inTable) {
        inTable = true;
        tableLines = [line];
        tableStartOffset = lineStart;
      } else {
        tableLines.push(line);
      }
    } else {
      if (inTable) {
        // Table ended: parse collected table lines
        if (tableLines.length >= 2) {
          const parsed = parseTableLines(tableLines);
          if (parsed.columns.length >= 2 && parsed.rows.length >= 1) {
            const tableId = `TABLE_${tableCounter++}`;
            const spanId = `src-tbl-${tableId.toLowerCase()}`;

            const span: SourceRef = {
              id: spanId,
              start: tableStartOffset,
              end: currentOffset - line.length - 1,
              rawText: tableLines.join('\n'),
              type: 'table',
            };

            sourceSpans.push(span);
            vault.push({
              id: tableId,
              columns: parsed.columns,
              rows: parsed.rows,
              sourceRef: spanId,
            });

            resultLines.push(`[TABLE_REF: ${tableId}]`);
          } else {
            resultLines.push(...tableLines);
          }
        } else {
          resultLines.push(...tableLines);
        }
        inTable = false;
        tableLines = [];
      }
      resultLines.push(line);
    }
  }

  // Handle trailing table at end of document
  if (inTable && tableLines.length >= 2) {
    const parsed = parseTableLines(tableLines);
    if (parsed.columns.length >= 2 && parsed.rows.length >= 1) {
      const tableId = `TABLE_${tableCounter++}`;
      const spanId = `src-tbl-${tableId.toLowerCase()}`;

      const span: SourceRef = {
        id: spanId,
        start: tableStartOffset,
        end: currentOffset,
        rawText: tableLines.join('\n'),
        type: 'table',
      };

      sourceSpans.push(span);
      vault.push({
        id: tableId,
        columns: parsed.columns,
        rows: parsed.rows,
        sourceRef: spanId,
      });
      resultLines.push(`[TABLE_REF: ${tableId}]`);
    } else {
      resultLines.push(...tableLines);
    }
  }

  return {
    vault,
    sanitizedText: resultLines.join('\n'),
    sourceSpans,
  };
}

/**
 * Parses raw table lines into clean columns and rows.
 */
function parseTableLines(lines: string[]): { columns: string[]; rows: string[][] } {
  const cleanRows = lines
    .map((l) => l.trim())
    .filter((l) => !/^\|\s*[-:]+\s*(\|\s*[-:]+\s*)+\|$/.test(l)) // filter divider line
    .map((l) =>
      l
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
    );

  if (cleanRows.length === 0) return { columns: [], rows: [] };

  const columns = cleanRows[0];
  const rows = cleanRows.slice(1);

  return { columns, rows };
}

/**
 * Resolves Table Vault IDs into TableStructure objects for UI rendering.
 */
export function resolveTableRefs(refs: string[], vault: TableVaultEntry[]): TableStructure[] {
  if (!refs || refs.length === 0 || !vault || vault.length === 0) return [];

  const vaultMap = new Map<string, TableVaultEntry>();
  vault.forEach((v) => {
    vaultMap.set(v.id, v);
    vaultMap.set(v.id.toLowerCase(), v);
    vaultMap.set(v.id.replace(/_/g, '-').toLowerCase(), v);
    vaultMap.set(v.id.replace(/-/g, '_').toLowerCase(), v);
    vaultMap.set(v.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(), v);
  });

  const resolved: TableStructure[] = [];
  const seenIds = new Set<string>();

  for (const ref of refs) {
    if (!ref) continue;
    const cleanRefKey = ref.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const entry = vaultMap.get(cleanRefKey) || vaultMap.get(ref) || vaultMap.get(ref.toLowerCase());
    if (entry && !seenIds.has(entry.id)) {
      seenIds.add(entry.id);
      resolved.push({
        id: entry.id,
        headers: entry.columns,
        rows: entry.rows,
        sourceRef: entry.sourceRef,
      });
    }
  }

  return resolved;
}
