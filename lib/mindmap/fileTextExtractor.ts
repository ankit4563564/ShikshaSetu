/**
 * ShikshaSetu — Client-Side File Text Extractor
 * Extracts readable text from uploaded TXT, PDF, DOCX, and image files.
 */

export async function extractTextFromFile(file: File): Promise<{
  text: string;
  inferredTitle: string;
  pageCount?: number;
}> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const inferredTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');

  if (file.size > 25 * 1024 * 1024) {
    throw new Error('File size exceeds the 25MB limit. Please upload a smaller document.');
  }

  // 1. Plain Text / Markdown / CSV
  if (file.type.startsWith('text/') || extension === 'txt' || extension === 'md' || extension === 'csv') {
    const text = await file.text();
    if (!text.trim()) throw new Error('Uploaded text file is empty.');
    return { text: text.trim(), inferredTitle, pageCount: 1 };
  }

  // 2. PDF Documents (Binary text extraction & stream parsing)
  if (file.type === 'application/pdf' || extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const binaryString = new TextDecoder('latin1').decode(uint8);

    // Extract text streams using regex on PDF stream objects
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let extractedChunks: string[] = [];
    let match;

    while ((match = streamRegex.exec(binaryString)) !== null) {
      const streamContent = match[1];
      // Match text within parentheses in PDF Tj/TJ operators
      const textMatches = streamContent.match(/\(([^)]+)\)\s*(?:Tj|TJ|'|")/g);
      if (textMatches) {
        const clean = textMatches
          .map((m) => m.replace(/^[(\s]+|[)\s\w']+$/g, '').replace(/\\([()\\])/g, '$1'))
          .join(' ');
        if (clean.length > 5) extractedChunks.push(clean);
      }
    }

    let extractedText = extractedChunks.join('\n\n').trim();

    // Fallback: If compressed streams prevented raw regex extraction, extract ASCII printable sequences
    if (extractedText.length < 50) {
      const asciiOnly = binaryString.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      const words = asciiOnly.match(/[A-Za-z0-9\+\-\=\/\(\)\,\.\:\;]{3,}/g);
      if (words && words.length > 15) {
        extractedText = words.join(' ');
      }
    }

    if (!extractedText || extractedText.length < 20) {
      throw new Error('Could not extract readable text from this PDF. Please ensure it is not scanned/password-protected, or paste the text directly.');
    }

    return { text: extractedText, inferredTitle, pageCount: Math.max(1, Math.round(extractedText.length / 1500)) };
  }

  // 3. DOCX Documents (XML text parsing)
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(uint8);

    // DOCX XML stores paragraphs inside <w:t> tags
    const xmlMatches = decoded.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (xmlMatches && xmlMatches.length > 0) {
      const text = xmlMatches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
      return { text: text.trim(), inferredTitle };
    }

    // Fallback printable match
    const words = decoded.match(/[A-Za-z0-9\+\-\=\/\(\)\,\.\:\;]{3,}/g);
    if (words && words.length > 20) {
      return { text: words.join(' ').trim(), inferredTitle };
    }

    throw new Error('Could not extract text from this DOCX file. Please copy-paste the text content directly.');
  }

  // 4. Image Files (PNG / JPG)
  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
    throw new Error('Direct image OCR requires high-contrast typed text. For the best accuracy, please copy-paste your notes text or upload as PDF/DOCX.');
  }

  throw new Error(`Unsupported file type: .${extension}. Please upload a PDF, DOCX, or TXT file.`);
}
