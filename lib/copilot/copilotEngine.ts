/**
 * Central Copilot State Engine — ShikshaSetu
 * Core Principle: "Copilot prepares. Educators decide."
 *
 * Coordinates review queue states (Needs Review, Approved, Edited),
 * multi-portal real-time action sync, and global drawer visibility.
 */

import { HISTORICAL_SIMILAR_CASES } from './memoryEngine';
import { DEMO_INTERVENTION_AARAV, SupportIntervention } from './interventionEngine';

export interface PreparedActionItem {
  id: string;
  studentId: string;
  studentName: string;
  avatar?: string;
  priority: 'high' | 'medium' | 'info';
  title: string;
  whyFlagged: string[];
  confidenceScore: number;
  preparedActions: {
    label: string;
    detail: string;
  }[];
  expectedImpact: {
    approvalTime: string; // e.g. "35 seconds"
    timeSaved: string; // e.g. "45 minutes"
    outcomes: string[];
  };
  trustSignals: {
    used: string[];
    ignored: string[];
    reasoning: string;
  };
  historicalEvidence: {
    casesCount: number;
    successRate: number;
    recommendedApproach: string;
  };
  status: 'needs_review' | 'approved' | 'edited' | 'dismissed';
}

export interface CopilotState {
  isDrawerOpen: boolean;
  activeRole: 'teacher' | 'parent' | 'student' | 'admin';
  reviewQueue: {
    prepared: number;
    needsReview: number;
    approved: number;
    edited: number;
  };
  items: PreparedActionItem[];
  activeIntervention: SupportIntervention;
  lastActionTimestamp: number | null;
}

// ─── INITIAL CO-PILOT ITEMS DATASET ─────────────────────────────────────────
export const INITIAL_COPILOT_ITEMS: PreparedActionItem[] = [
  {
    id: 'act_001',
    studentId: 's001',
    studentName: 'Aarav Sharma',
    avatar: '/aarav.png',
    priority: 'high',
    title: 'Homework missed for 3 consecutive days',
    whyFlagged: [
      'Homework missed for 3 consecutive days',
      'Attendance dropped from 96% → 89% this week',
      'Teacher noted reduced classroom participation yesterday',
    ],
    confidenceScore: 87,
    preparedActions: [
      { label: 'Parent WhatsApp Message Drafted', detail: '"Hi Priya, Aarav missed homework for 3 days..."' },
      { label: 'Practice Worksheet B Prepared', detail: 'Algebra fractions review sheet auto-assigned' },
      { label: 'Tomorrow Check-in Scheduled', detail: '10:15 AM advisory slot reserved' },
    ],
    expectedImpact: {
      approvalTime: '35 seconds to approve',
      timeSaved: '45 minutes saved',
      outcomes: [
        'Parent informed today via WhatsApp',
        'Student receives targeted practice sheet',
        'Teacher follow-up automatically scheduled',
        'Risk of falling behind reduced before Friday assessment',
      ],
    },
    trustSignals: {
      used: ['Attendance Telemetry', 'Homework Register', 'Teacher Classroom Note'],
      ignored: ['Mood Check-in (unavailable)'],
      reasoning: 'Repeated homework misses combined with declining attendance usually indicate a student may benefit from an early teacher check-in.',
    },
    historicalEvidence: {
      casesCount: HISTORICAL_SIMILAR_CASES.count,
      successRate: HISTORICAL_SIMILAR_CASES.interventions[0].successRate,
      recommendedApproach: HISTORICAL_SIMILAR_CASES.recommendedApproach,
    },
    status: 'needs_review',
  },
  {
    id: 'act_002',
    studentId: 's003',
    studentName: 'Rohan Verma',
    avatar: '/rohan.png',
    priority: 'medium',
    title: 'Bus Route #04 Transit Delay Detected',
    whyFlagged: [
      'Bus #04 delayed 12 minutes due to Sector 39 rain traffic',
      'Rohan and 14 other students arriving after 8:15 AM bell',
    ],
    confidenceScore: 99,
    preparedActions: [
      { label: 'Parent Push Signal Sent', detail: 'Parents automatically notified. No teacher action required.' },
      { label: 'Gate Scan Tardy Exemption Logged', detail: 'Tardy flag auto-excused by transit telemetry' },
    ],
    expectedImpact: {
      approvalTime: 'Auto-resolved',
      timeSaved: '15 minutes saved',
      outcomes: ['Parents notified', 'Student record protected from invalid tardy flag'],
    },
    trustSignals: {
      used: ['GPS Bus Telemetry', 'Weather Signal'],
      ignored: [],
      reasoning: 'Transit delay is weather-related. Auto-notify parents and excuse gate tardy mark.',
    },
    historicalEvidence: {
      casesCount: 42,
      successRate: 96,
      recommendedApproach: 'Auto-excuse transit delays over 10 minutes.',
    },
    status: 'approved',
  },
  {
    id: 'act_003',
    studentId: 's002',
    studentName: 'Priya Mehta',
    avatar: '/priya.png',
    priority: 'info',
    title: 'PTM 1-Page Summary Briefs Ready',
    whyFlagged: ['3 PTM meetings scheduled for today 2:00 PM – 3:30 PM'],
    confidenceScore: 95,
    preparedActions: [
      { label: 'PTM Briefing Sheets Generated', detail: 'Synthesized academic, attendance & positive notes' },
    ],
    expectedImpact: {
      approvalTime: 'Instant view',
      timeSaved: '30 minutes saved',
      outcomes: ['Clear, structured discussion points ready for parents'],
    },
    trustSignals: {
      used: ['Exam Ledger', 'Attendance Log', 'SchoolGPT Summary Engine'],
      ignored: [],
      reasoning: 'Pre-compile 1-page summary briefs before parent-teacher meeting.',
    },
    historicalEvidence: {
      casesCount: 18,
      successRate: 98,
      recommendedApproach: 'Provide concise 1-page briefs for PTM meetings.',
    },
    status: 'approved',
  },
];

// Simple in-memory reactive store listeners for real-time state sync across portals
type Listener = (state: CopilotState) => void;

let globalState: CopilotState = {
  isDrawerOpen: false,
  activeRole: 'teacher',
  reviewQueue: {
    prepared: 27,
    needsReview: 1,
    approved: 25,
    edited: 1,
  },
  items: INITIAL_COPILOT_ITEMS,
  activeIntervention: DEMO_INTERVENTION_AARAV,
  lastActionTimestamp: Date.now(),
};

const listeners = new Set<Listener>();

export function getCopilotState(): CopilotState {
  return globalState;
}

export function subscribeCopilotState(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn(globalState));
}

export function setDrawerOpen(open: boolean) {
  globalState = { ...globalState, isDrawerOpen: open };
  notifyListeners();
}

export function toggleDrawer() {
  globalState = { ...globalState, isDrawerOpen: !globalState.isDrawerOpen };
  notifyListeners();
}

export function setCopilotRole(role: 'teacher' | 'parent' | 'student' | 'admin') {
  globalState = { ...globalState, activeRole: role };
  notifyListeners();
}

export function approveCopilotAction(id: string) {
  const updatedItems = globalState.items.map((item) => {
    if (item.id === id) {
      return { ...item, status: 'approved' as const };
    }
    return item;
  });

  const needsReviewCount = updatedItems.filter((i) => i.status === 'needs_review').length;
  const approvedCount = updatedItems.filter((i) => i.status === 'approved').length;

  globalState = {
    ...globalState,
    items: updatedItems,
    reviewQueue: {
      ...globalState.reviewQueue,
      needsReview: needsReviewCount,
      approved: approvedCount,
    },
    lastActionTimestamp: Date.now(),
  };

  notifyListeners();
}

export function undoCopilotAction(id: string) {
  const updatedItems = globalState.items.map((item) => {
    if (item.id === id) {
      return { ...item, status: 'needs_review' as const };
    }
    return item;
  });

  const needsReviewCount = updatedItems.filter((i) => i.status === 'needs_review').length;
  const approvedCount = updatedItems.filter((i) => i.status === 'approved').length;

  globalState = {
    ...globalState,
    items: updatedItems,
    reviewQueue: {
      ...globalState.reviewQueue,
      needsReview: needsReviewCount,
      approved: approvedCount,
    },
    lastActionTimestamp: Date.now(),
  };

  notifyListeners();
}

export function resetCopilotState() {
  globalState = {
    isDrawerOpen: false,
    activeRole: 'teacher',
    reviewQueue: {
      prepared: 27,
      needsReview: 1,
      approved: 25,
      edited: 1,
    },
    items: [
      {
        ...INITIAL_COPILOT_ITEMS[0],
        status: 'needs_review',
      },
      ...INITIAL_COPILOT_ITEMS.slice(1),
    ],
    activeIntervention: DEMO_INTERVENTION_AARAV,
    lastActionTimestamp: Date.now(),
  };

  notifyListeners();
}

