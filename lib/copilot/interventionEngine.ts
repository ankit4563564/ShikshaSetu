/**
 * Living Intervention Lifecycle Engine — ShikshaSetu
 * Core Principle: "Tracks the complete lifecycle from flag to resolution."
 */

export interface InterventionMilestone {
  id: string;
  timestamp: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
  actor: string;
  details?: string;
}

export interface SupportIntervention {
  id: string;
  studentId: string;
  studentName: string;
  flagTitle: string;
  status: 'active' | 'resolved' | 'pending_review';
  timeSavedMinutes: number;
  milestones: InterventionMilestone[];
  outcomeSummary?: string;
}

export const DEMO_INTERVENTION_AARAV: SupportIntervention = {
  id: 'int_001',
  studentId: 's001',
  studentName: 'Aarav Sharma',
  flagTitle: 'Homework missed 3 consecutive days',
  status: 'active',
  timeSavedMinutes: 48,
  milestones: [
    {
      id: 'm1',
      timestamp: 'Jul 28 · 07:30 AM',
      title: 'Signal Flagged: Homework missed 3 consecutive days',
      status: 'completed',
      actor: 'Academic Telemetry',
    },
    {
      id: 'm2',
      timestamp: 'Jul 28 · 07:31 AM',
      title: 'Pattern Matched in School Memory (28 historical cases)',
      status: 'completed',
      actor: 'School Memory Engine',
    },
    {
      id: 'm3',
      timestamp: 'Jul 28 · 08:02 AM',
      title: 'Teacher Approved Intervention Package',
      status: 'completed',
      actor: 'Mrs. Kavita Rao',
    },
    {
      id: 'm4',
      timestamp: 'Jul 28 · 08:03 AM',
      title: 'Parent Notified via WhatsApp & Push Signal',
      status: 'completed',
      actor: 'Automated Copilot',
    },
    {
      id: 'm5',
      timestamp: 'Jul 28 · 08:04 AM',
      title: 'Practice Worksheet B assigned to Student Study Plan',
      status: 'completed',
      actor: 'Automated Copilot',
    },
    {
      id: 'm6',
      timestamp: 'Tomorrow · 10:15 AM',
      title: '1-on-1 Teacher Check-in Scheduled',
      status: 'current',
      actor: 'Mrs. Kavita Rao',
    },
    {
      id: 'm7',
      timestamp: 'Pending Submission',
      title: 'Homework Completion Verification',
      status: 'pending',
      actor: 'System Verification',
    },
  ],
  outcomeSummary: 'Support Case Active. Estimated recovery within 5 days.',
};

export function getDemoIntervention(): SupportIntervention {
  return DEMO_INTERVENTION_AARAV;
}
