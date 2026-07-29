/**
 * Central Copilot State Engine — ShikshaSetu
 * Core Principle: "Copilot prepares. Educators decide."
 *
 * Deterministic decision-support engine that generates recommendations
 * from actual student records using the rules-based support signal engine.
 * No AI/ML - explainable, traceable, data-driven recommendations.
 */

import { getCanonicalSupportSignal, type SupportSignal } from '@/lib/support-signals';
import { getCanonicalStudentState } from '@/lib/canonical';
import { approveSupportPlanAction, type ApproveSupportPlanInput } from '@/app/actions/interventionActions';

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
  signalEvidence: {
    source: string;
    description: string;
    value: any;
    timestamp: string;
  }[];
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
  lastActionTimestamp: number | null;
}

// ─── Convert Support Signal to Copilot Item ─────────────────────────────────────
function supportSignalToCopilotItem(signal: SupportSignal): PreparedActionItem {
  const priority = signal.severity === 'high' ? 'high' : signal.severity === 'medium' ? 'medium' : 'info';
  const confidenceScore = signal.severity === 'high' ? 92 : signal.severity === 'medium' ? 78 : 65;

  const preparedActions = signal.recommendedActions.map(action => ({
    label: action.action,
    detail: action.description,
  }));

  const whyFlagged = signal.evidence.map(e => e.description);

  return {
    id: signal.id,
    studentId: signal.studentId,
    studentName: signal.studentName,
    priority,
    title: signal.signalType === 'homework_gap' ? 'Homework gap detected' :
           signal.signalType === 'attendance_decline' ? 'Attendance decline detected' :
           signal.signalType === 'grade_drop' ? 'Grade drop detected' :
           signal.signalType === 'wellness_concern' ? 'Wellness concern detected' :
           'Multiple concerning patterns detected',
    whyFlagged,
    confidenceScore,
    preparedActions,
    expectedImpact: {
      approvalTime: '30 seconds to approve',
      timeSaved: '45 minutes saved',
      outcomes: preparedActions.map(a => a.label),
    },
    trustSignals: {
      used: signal.evidence.map(e => e.source),
      ignored: [],
      reasoning: `Based on ${signal.evidence.length} data points from ${[...new Set(signal.evidence.map(e => e.source))].join(', ')}.`,
    },
    signalEvidence: signal.evidence,
    status: signal.status === 'pending' ? 'needs_review' as const : signal.status as any,
  };
}

// Simple in-memory reactive store listeners for real-time state sync across portals
type Listener = (state: CopilotState) => void;

let globalState: CopilotState = {
  isDrawerOpen: false,
  activeRole: 'teacher',
  reviewQueue: {
    prepared: 0,
    needsReview: 0,
    approved: 0,
    edited: 0,
  },
  items: [],
  lastActionTimestamp: Date.now(),
};

// ─── Load Copilot Items from Support Signals ───────────────────────────────────
export async function loadCopilotItems() {
  try {
    const signal = await getCanonicalSupportSignal();
    
    if (signal) {
      const item = supportSignalToCopilotItem(signal);
      globalState = {
        ...globalState,
        items: [item],
        reviewQueue: {
          prepared: 1,
          needsReview: item.status === 'needs_review' ? 1 : 0,
          approved: item.status === 'approved' ? 1 : 0,
          edited: 0,
        },
        lastActionTimestamp: Date.now(),
      };
      notifyListeners();
    }
  } catch (error) {
    console.error('Failed to load copilot items:', error);
  }
}

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

export async function approveCopilotAction(id: string, teacherId: string): Promise<{ success: boolean; taskId?: string; error?: string }> {
  const item = globalState.items.find(i => i.id === id);
  
  if (!item) {
    console.error('Item not found:', id);
    return { success: false, error: 'Item not found' };
  }

  // Call real server action to approve support plan
  const input: ApproveSupportPlanInput = {
    studentId: item.studentId,
    studentName: item.studentName,
    teacherId,
    signalId: item.id,
    signalType: item.signalEvidence[0]?.source || 'unknown',
    recommendedActions: item.preparedActions.map((a, i) => ({
      id: `act-${i}`,
      action: a.label,
      category: 'academic', // Default for now
      priority: item.priority,
      description: a.detail,
    })),
  };

  const result = await approveSupportPlanAction(input);

  if (!result.success) {
    console.error('Failed to approve support plan:', result.error);
    return { success: false, error: result.error };
  }

  // Update local state
  const updatedItems = globalState.items.map((i) => {
    if (i.id === id) {
      return { ...i, status: 'approved' as const };
    }
    return i;
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
  
  return { success: true, taskId: result.taskId };
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
      prepared: 0,
      needsReview: 0,
      approved: 0,
      edited: 0,
    },
    items: [],
    lastActionTimestamp: Date.now(),
  };

  notifyListeners();
}

