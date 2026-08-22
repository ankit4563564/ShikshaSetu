/**
 * ShikshaSetu — High-Fidelity File Text Extractor
 * Uses pdfjs-dist for accurate PDF text extraction and robust UTF-8 parsing for DOCX/TXT.
 *
 * IMPORTANT: The PDF.js worker file (`pdf.worker.min.mjs`) must be copied to the `public/`
 * directory from `node_modules/pdfjs-dist/build/pdf.worker.min.mjs`.
 */

export async function extractTextFromFile(file: File): Promise<{
  text: string;
  inferredTitle: string;
  pageCount?: number;
}> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const inferredTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');

  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File size exceeds the 50MB limit. Please upload a smaller document.');
  }

  // 1. Plain Text / Markdown / CSV
  if (file.type.startsWith('text/') || extension === 'txt' || extension === 'md' || extension === 'csv') {
    const text = await file.text();
    if (!text.trim()) throw new Error('Uploaded text file is empty.');
    return { text: text.trim(), inferredTitle, pageCount: 1 };
  }

  // 2. PDF Documents with PDF.js
  if (file.type === 'application/pdf' || extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();

    try {
      const pdfjsLib = await import('pdfjs-dist');

      // Use local worker from public/ directory (must match installed pdfjs-dist version)
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      const pageTexts: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        let lastY: number | null = null;
        let pageStr = '';

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          // Check for line break based on vertical position change
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageStr += '\n';
          } else if (pageStr.length > 0 && !pageStr.endsWith(' ') && !pageStr.endsWith('\n')) {
            pageStr += ' ';
          }
          pageStr += item.str;
          lastY = item.transform[5];
        }

        if (pageStr.trim().length > 0) {
          pageTexts.push(pageStr.trim());
        }
      }

      const rawFullText = pageTexts.join('\n\n');

      if (!rawFullText || rawFullText.trim().length < 20) {
        throw new Error('PDF text layer is empty — this document may be a scanned image. Please use OCR or paste the text manually.');
      }

      const cleanedText = deduplicateAndCleanExtractedText(rawFullText, numPages);

      console.log(
        `[extractTextFromFile] PDF.js extracted ${numPages} pages: ${rawFullText.length} raw chars -> ${cleanedText.length} deduped chars`
      );
      return { text: cleanedText, inferredTitle, pageCount: numPages };
    } catch (pdfErr: any) {
      console.error('[extractTextFromFile] PDF.js extraction failed:', pdfErr?.message);

      // Intelligent fallback: attempt to extract readable text streams from raw PDF
      // This handles cases where PDF.js worker fails but the PDF has embedded text streams
      const fallbackText = extractReadableTextFromRawPDF(new Uint8Array(arrayBuffer));

      if (fallbackText && fallbackText.trim().length >= 50) {
        const cleaned = deduplicateAndCleanExtractedText(fallbackText, 1);
        console.log(`[extractTextFromFile] Fallback extracted ${cleaned.length} characters from raw PDF streams`);
        return { text: cleaned, inferredTitle, pageCount: 1 };
      }

      throw new Error(
        'Could not extract text from this PDF. The file may be a scanned image without a text layer. ' +
        'Please try: (1) Paste the text directly, or (2) Use an OCR tool first to convert the scanned pages to text.'
      );
    }
  }

  // 3. DOCX Documents (XML text parsing)
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(uint8);

    // Parse w:t tags cleanly
    const xmlMatches = decoded.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (xmlMatches && xmlMatches.length > 0) {
      const text = xmlMatches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
      const cleaned = deduplicateAndCleanExtractedText(text, 1);
      return { text: cleaned, inferredTitle };
    }

    throw new Error('Could not extract text from this DOCX file. Please upload as PDF or paste notes directly.');
  }

  throw new Error(`Unsupported file type: .${extension}. Please upload a PDF, DOCX, or TXT file.`);
}

/**
 * Deduplicates and normalizes multi-page extracted text:
 * 1. Counts line frequencies across pages. Lines appearing >= 3 times (headers, footers, chapter labels) are stripped.
 * 2. Removes consecutive identical lines and duplicate paragraphs.
 * 3. Joins sentences broken across line wraps (preventing mid-sentence cuts).
 * 4. Eliminates duplicate OCR/visible text layers.
 */
export function deduplicateAndCleanExtractedText(rawText: string, numPages: number = 1): string {
  if (!rawText || typeof rawText !== 'string') return '';

  const lines = rawText.split('\n');
  const lineFrequency = new Map<string, number>();

  // Count frequency of normalized lines
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      lineFrequency.set(trimmed, (lineFrequency.get(trimmed) || 0) + 1);
    }
  });

  // Filter out running headers, repeated footers, and recurring page marks
  const filteredLines: string[] = [];
  let previousTrimmed = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      filteredLines.push('');
      continue;
    }

    // Skip verbatim consecutive duplicates
    if (trimmed === previousTrimmed) continue;

    const count = lineFrequency.get(trimmed) || 0;
    // Lines that appear >= 3 times across a multi-page document are headers/footers/running labels
    if (numPages >= 2 && count >= 3 && trimmed.length <= 100) {
      continue;
    }

    // Skip isolated page number lines like "Page 11", "12", "11.4" if isolated
    if (/^(?:Page\s*\d+|\d{1,3})$/i.test(trimmed)) {
      continue;
    }

    filteredLines.push(line);
    previousTrimmed = trimmed;
  }

  // Join lines within paragraphs where sentences were broken across lines
  const paragraphs: string[] = [];
  let currentParaLines: string[] = [];

  for (const line of filteredLines) {
    if (!line.trim()) {
      if (currentParaLines.length > 0) {
        paragraphs.push(joinParagraphLines(currentParaLines));
        currentParaLines = [];
      }
    } else {
      currentParaLines.push(line);
    }
  }
  if (currentParaLines.length > 0) {
    paragraphs.push(joinParagraphLines(currentParaLines));
  }

  // Deduplicate consecutive or identical paragraphs
  const uniqueParas: string[] = [];
  const seenParaSignatures = new Set<string>();

  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;
    // Signature: first 80 chars normalized
    const sig = trimmed.slice(0, 80).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sig.length > 15 && seenParaSignatures.has(sig)) {
      continue;
    }
    if (sig.length > 15) {
      seenParaSignatures.add(sig);
    }
    uniqueParas.push(trimmed);
  }

  return uniqueParas.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

function joinParagraphLines(lines: string[]): string {
  if (lines.length === 0) return '';
  let result = lines[0].trim();

  for (let i = 1; i < lines.length; i++) {
    const nextLine = lines[i].trim();
    if (!nextLine) continue;

    // Check if previous line ended with a terminal punctuation or heading marker
    const endsWithTerminal = /[.!?:;—–\-]$/.test(result);
    const startsWithHeading = /^(?:[0-9]{1,2}\.|\([a-z]\)|[•\*\-]|Step\s*\d+|UNIT|Chapter)/i.test(nextLine);

    if (startsWithHeading || endsWithTerminal) {
      result += '\n' + nextLine;
    } else {
      // Connect as continuation of the sentence
      result += ' ' + nextLine;
    }
  }

  return result;
}

/**
 * Intelligent raw PDF text stream extractor.
 * Instead of dumping all binary bytes as text, this extracts ONLY the readable text
 * from PDF text stream objects (BT...ET blocks and parenthesized strings).
 * Rejects binary data, xref tables, metadata objects, and stream markers.
 */
function extractReadableTextFromRawPDF(bytes: Uint8Array): string {
  const raw = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

  // Strategy 1: Extract text from BT...ET text blocks (PDF text operators)
  const textBlocks: string[] = [];
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let btMatch: RegExpExecArray | null;

  while ((btMatch = btEtRegex.exec(raw)) !== null) {
    const block = btMatch[1];
    // Extract parenthesized text strings: (Hello World) Tj
    const parenStrings = block.match(/\(([^)]*)\)/g);
    if (parenStrings) {
      for (const ps of parenStrings) {
        const cleaned = ps.slice(1, -1) // remove parens
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\t/g, ' ')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\')
          .trim();
        if (cleaned.length > 0) {
          textBlocks.push(cleaned);
        }
      }
    }
  }

  if (textBlocks.length > 5) {
    return textBlocks.join(' ').replace(/\s{2,}/g, ' ').trim();
  }

  // Strategy 2: Extract all parenthesized strings outside BT/ET (some PDFs use this)
  const allParenStrings = raw.match(/\(([^)]{2,200})\)/g);
  if (allParenStrings && allParenStrings.length > 10) {
    const readable = allParenStrings
      .map((s) => s.slice(1, -1).trim())
      .filter((s) => {
        // Keep only strings that look like real text (contain spaces or known word patterns)
        if (s.length < 2) return false;
        // Reject hex/binary noise
        if (/^[0-9A-Fa-f\s]+$/.test(s)) return false;
        // Reject PDF internal operators
        if (/^(?:\/[A-Za-z]+|<<|>>|obj|endobj|stream|endstream)/.test(s)) return false;
        // Must contain at least one letter
        return /[A-Za-z]/.test(s);
      });

    if (readable.length > 5) {
      return readable.join(' ').replace(/\s{2,}/g, ' ').trim();
    }
  }

  return '';
}
