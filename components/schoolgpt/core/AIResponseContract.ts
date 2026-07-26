export type SurfacePreference = 'inline' | 'drawer' | 'workspace' | 'document';

export interface AIActionItem {
  id: string;
  label: string;
  actionType: 'pdf' | 'whatsapp' | 'workspace' | 'copy';
  payload?: any;
}

export interface AIResponse {
  title: string;
  summary: string;
  evidence: Array<{ module: string; label: string }>;
  recommendations: string[];
  actions: AIActionItem[];
  followUps: string[];
  preferredSurface: SurfacePreference;
  confidence?: 'HIGH' | 'MEDIUM' | 'GENERAL' | 'LIMITED';
  rawText: string;
}

export function parseToAIResponse(
  rawText: string,
  confidence: 'HIGH' | 'MEDIUM' | 'GENERAL' | 'LIMITED' = 'HIGH',
  sources: string[] = ['Attendance Records', 'Gradebook Marks']
): AIResponse {
  if (!rawText) {
    return {
      title: 'SchoolGPT Response',
      summary: '',
      evidence: [],
      recommendations: [],
      actions: [],
      followUps: [],
      preferredSurface: 'inline',
      confidence,
      rawText: '',
    };
  }

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  let title = lines[0]?.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, '') || 'SchoolGPT Assistant Response';

  const lower = rawText.toLowerCase();

  // Determine Preferred Surface
  let preferredSurface: SurfacePreference = 'inline';
  if (lower.includes('ptm summary') || lower.includes('intervention plan') || lower.includes('comparative report')) {
    preferredSurface = 'document';
  } else if (lower.includes('compare term 1') || lower.includes('student profile') || lower.includes('attendance breakdown')) {
    preferredSurface = 'drawer';
  } else if (lower.includes('lesson plan') || lower.includes('term growth analytics')) {
    preferredSurface = 'workspace';
  }

  // Build Evidence Chips
  const evidence = sources.map((src) => ({
    module: src.toLowerCase().includes('attendance') ? 'Attendance' : 'Marks',
    label: `✓ ${src}`,
  }));

  // Build Follow-up Suggestions
  const followUps = [
    'Compare with Class Average',
    'Generate Parent Summary',
    'Schedule Homeroom Check-in',
  ];

  // Build Interactive Actions if actionable
  const actions: AIActionItem[] = [];
  if (lower.includes('ptm') || lower.includes('parent') || lower.includes('intervention') || lower.includes('report')) {
    actions.push(
      { id: 'act-wa', label: '✉️ Send via WhatsApp', actionType: 'whatsapp' },
      { id: 'act-pdf', label: '📥 Download PDF', actionType: 'pdf' },
      { id: 'act-copy', label: '📋 Copy Text', actionType: 'copy' }
    );
  }

  return {
    title,
    summary: rawText,
    evidence,
    recommendations: [
      'Monitor weekly attendance trends',
      'Follow up on homework submissions',
      'Schedule term check-in with parents',
    ],
    actions,
    followUps,
    preferredSurface,
    confidence,
    rawText,
  };
}
