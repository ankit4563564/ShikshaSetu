import { SupportRadarSignal } from './types';

export const SUPPORT_RADAR_DATA: SupportRadarSignal[] = [
  {
    studentId: 'std-002',
    studentName: 'Priya Patel',
    priority: 'urgent',
    confidencePct: 94,
    recommendation: 'Priya Patel has shown a gradual decline in homework completion over the past 2 weeks. A brief supportive conversation during today\'s homeroom is recommended.',
    evidence: {
      homeworkDrop: '↓ 30% Over 14 Days',
      libraryVisits: '0 Visits in 14 Days',
      participation: 'Slight Decline',
      attendance: '✓ 98% Stable',
    },
    suggestedAction: '📅 Schedule Homeroom Check-in',
    whyGenerated: 'SchoolGPT flagged homework drop exceeding 25% threshold while attendance remains normal.',
  },
  {
    studentId: 'std-003',
    studentName: 'Kabir Khan',
    priority: 'watching',
    confidencePct: 88,
    recommendation: 'Kabir is consistently submitting homework but participation in class discussion remains under 65%. Group lab pairing suggested.',
    evidence: {
      homeworkDrop: '0% Drop (92% Done)',
      libraryVisits: '4 Visits in 14 Days',
      participation: 'Low (65%)',
      attendance: '✓ 98% Stable',
    },
    suggestedAction: '🤝 Pair in Group Science Lab',
    whyGenerated: 'High homework output contrasted with low classroom Q&A participation.',
  },
];
