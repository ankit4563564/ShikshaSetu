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

      const fullText = pageTexts.join('\n\n');

      if (!fullText || fullText.trim().length < 20) {
        throw new Error('PDF text layer is empty — this document may be a scanned image. Please use OCR or paste the text manually.');
      }

      console.log(`[extractTextFromFile] PDF.js extracted ${numPages} pages, ${fullText.length} characters`);
      return { text: fullText.trim(), inferredTitle, pageCount: numPages };
    } catch (pdfErr: any) {
      console.error('[extractTextFromFile] PDF.js extraction failed:', pdfErr?.message);

      // Intelligent fallback: attempt to extract readable text streams from raw PDF
      // This handles cases where PDF.js worker fails but the PDF has embedded text streams
      const fallbackText = extractReadableTextFromRawPDF(new Uint8Array(arrayBuffer));

      if (fallbackText && fallbackText.trim().length >= 50) {
        console.log(`[extractTextFromFile] Fallback extracted ${fallbackText.length} characters from raw PDF streams`);
        return { text: fallbackText.trim(), inferredTitle, pageCount: 1 };
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
      return { text: text.trim(), inferredTitle };
    }

    throw new Error('Could not extract text from this DOCX file. Please upload as PDF or paste notes directly.');
  }

  throw new Error(`Unsupported file type: .${extension}. Please upload a PDF, DOCX, or TXT file.`);
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
