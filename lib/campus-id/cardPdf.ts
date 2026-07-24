/**
 * Server-side physical card PDF generator.
 * 
 * Generates a printable HTML page for the physical Campus ID card.
 * The card has:
 *   Front: Student Photo, Name, Class, Section, Roll Number, School Logo
 *   Back: Large QR Code
 * 
 * Sensitive info (blood group, emergency contact) is NOT included.
 * The QR contains a rotating signed token — no PII.
 */

import QRCode from 'qrcode';

export interface PhysicalCardData {
  studentName: string;
  grade: string;
  section: string | null;
  rollNumber: string | null;
  photoUrl: string | null;
  qrContent: string;
  schoolName?: string;
}

export async function generateCardHtml(data: PhysicalCardData): Promise<string> {
  const schoolName = data.schoolName || 'ShikshaSetu';
  const photoHtml = data.photoUrl
    ? `<img src="${escapeHtml(data.photoUrl)}" alt="Student Photo" class="photo" />`
    : `<div class="photo-placeholder">🧑</div>`;

  const qrDataUrl = await QRCode.toDataURL(data.qrContent, { width: 400, margin: 1 });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Campus ID Card — ${escapeHtml(data.studentName)}</title>
  <style>
    @page { margin: 0; size: 85.6mm 54mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    
    .card-container { width: 85.6mm; height: 54mm; position: relative; }
    
    .card-front {
      width: 85.6mm; height: 54mm;
      background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
      border-radius: 3mm;
      padding: 3mm 4mm;
      display: flex;
      flex-direction: column;
      page-break-after: always;
    }
    
    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(135deg, #3f51b5, #5967d0);
      margin: -3mm -4mm 2.5mm -4mm;
      padding: 2mm 4mm;
      border-radius: 3mm 3mm 0 0;
    }
    
    .school-name { color: white; font-size: 4mm; font-weight: 800; letter-spacing: 0.3mm; }
    .card-type { color: rgba(255,255,255,0.8); font-size: 2mm; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5mm; background: rgba(255,255,255,0.15); padding: 0.5mm 2mm; border-radius: 2mm; }
    
    .card-body { display: flex; gap: 3mm; flex: 1; align-items: center; }
    
    .photo { width: 14mm; height: 14mm; border-radius: 2mm; object-fit: cover; border: 0.5mm solid rgba(63,81,181,0.15); }
    .photo-placeholder { width: 14mm; height: 14mm; border-radius: 2mm; background: rgba(63,81,181,0.05); display: flex; align-items: center; justify-content: center; font-size: 7mm; }
    
    .student-info { flex: 1; }
    .student-name { font-size: 4.5mm; font-weight: 800; color: #1a1a2e; line-height: 1.2; }
    .student-details { font-size: 2.5mm; color: #555; margin-top: 0.8mm; font-weight: 600; }
    
    .card-back {
      width: 85.6mm; height: 54mm;
      background: white;
      border-radius: 3mm;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      page-break-after: always;
    }
    
    .qr-img { width: 38mm; height: 38mm; }
    
    .qr-token-hint { font-size: 1.8mm; color: #aaa; text-transform: uppercase; letter-spacing: 0.3mm; font-weight: 600; }
    
    @media print {
      .card-back { page-break-before: always; }
    }
  </style>
</head>
<body>
  <!-- Card Front -->
  <div class="card-container">
    <div class="card-front">
      <div class="card-header">
        <span class="school-name">${escapeHtml(schoolName)}</span>
        <span class="card-type">Student ID</span>
      </div>
      <div class="card-body">
        ${photoHtml}
        <div class="student-info">
          <div class="student-name">${escapeHtml(data.studentName)}</div>
          <div class="student-details">
            Class ${escapeHtml(data.grade)}${data.section ? ` &middot; ${escapeHtml(data.section)}` : ''}
            ${data.rollNumber ? ` &middot; Roll ${escapeHtml(data.rollNumber)}` : ''}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Card Back -->
  <div class="card-container">
    <div class="card-back">
      <img src="${qrDataUrl}" alt="Campus ID QR Code" class="qr-img" />
      <div class="qr-token-hint">Token refreshes every 3 minutes</div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
