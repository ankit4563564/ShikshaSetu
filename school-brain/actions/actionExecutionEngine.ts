import type { Intent, SchoolRole } from '../models/index';

export interface ActionObject {
  id: string;
  type: 'message' | 'intervention_plan' | 'report' | 'export';
  title: string;
  preview: string;
  actions: string[]; // e.g. ['Preview', 'Copy', 'Send', 'Download PDF', 'Export', 'Save']
  payload?: Record<string, any>;
}

export function generateActionObject(
  intent: Intent,
  queryText: string = '',
  retrievedData: string = '',
  role: SchoolRole = 'teacher'
): ActionObject | null {
  const lower = queryText.toLowerCase();

  if (lower.includes('inform parent') || lower.includes('send reminder') || lower.includes('notify parent') || lower.includes('draft message')) {
    return {
      id: `act-${Date.now()}-msg`,
      type: 'message',
      title: 'Parent Notification Draft',
      preview: `Dear Parent, This is a gentle reminder from ShikshaSetu regarding pending homework assignments for your child. Please review the student portal for details. Thank you.`,
      actions: ['Preview', 'Copy', 'Send'],
      payload: {
        recipientType: 'parents',
        channel: 'SMS/WhatsApp',
      },
    };
  }

  if (lower.includes('intervention plan') || lower.includes('counseling plan') || intent === 'who_needs_attention') {
    return {
      id: `act-${Date.now()}-plan`,
      type: 'intervention_plan',
      title: 'Student Academic Intervention Plan',
      preview: `Structured Intervention Strategy:\n1. 1-on-1 Math Revision Sessions (2x weekly)\n2. Peer Mentoring paired with top performer\n3. Bi-weekly Parent Progress Check-in`,
      actions: ['Preview', 'Export', 'Copy', 'Save'],
      payload: {
        planType: 'Academic Support',
        durationWeeks: 4,
      },
    };
  }

  if (lower.includes('ptm summary') || lower.includes('generate report') || lower.includes('download report') || intent === 'ptm') {
    return {
      id: `act-${Date.now()}-rpt`,
      type: 'report',
      title: 'Term 1 PTM & Academic Performance Brief',
      preview: `Official Term 1 Academic & Attendance Summary Report generated for Class 8A. Contains subject averages, attendance trends, and teacher notes.`,
      actions: ['Preview', 'Download PDF', 'Copy', 'Share'],
      payload: {
        documentType: 'PDF',
        term: 'Term 1 (2026)',
      },
    };
  }

  return null;
}
