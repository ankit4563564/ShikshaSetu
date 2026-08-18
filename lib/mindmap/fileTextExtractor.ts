/**
 * ShikshaSetu — High-Fidelity File Text Extractor
 * Uses pdfjs-dist for accurate PDF text extraction and robust UTF-8 parsing for DOCX/TXT.
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
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source if available
      if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
      }

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
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
          // Check for line break based on vertical position
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageStr += '\n';
          } else if (pageStr.length > 0 && !pageStr.endsWith(' ') && !pageStr.endsWith('\n')) {
            pageStr += ' ';
          }
          pageStr += item.str;
          lastY = item.transform[5];
        }

        if (pageStr.trim().length > 0) {
          pageTexts.push(`[Page ${i}]\n${pageStr.trim()}`);
        }
      }

      const fullText = pageTexts.join('\n\n');

      if (!fullText || fullText.trim().length < 20) {
        throw new Error('Could not extract readable text from PDF (document may be scanned or empty).');
      }

      return { text: fullText.trim(), inferredTitle, pageCount: numPages };
    } catch (pdfErr: any) {
      console.warn('[extractTextFromFile] PDF.js extraction encountered an issue, trying text fallback:', pdfErr?.message);
      
      // Secondary fallback for pure ASCII text streams
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const decoded = new TextDecoder('utf-8', { fatal: false }).decode(uint8);
      const asciiWords = decoded.match(/[A-Za-z0-9\+\-\=\/\(\)\,\.\:\;]{2,}/g);
      
      if (asciiWords && asciiWords.length > 20) {
        return { text: asciiWords.join(' '), inferredTitle, pageCount: 1 };
      }

      throw new Error(pdfErr?.message || 'Could not extract text from this PDF file.');
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
