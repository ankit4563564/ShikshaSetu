import type { Intent, SchoolRole, ConfidenceLevel } from '../models/index';

export interface UserFeedbackRecord {
  id: string;
  intent: Intent;
  role: SchoolRole;
  strategy: string;
  confidence: ConfidenceLevel;
  rating: 'helpful' | 'not_helpful';
  comment?: string;
  timestamp: string;
}

const feedbackStore: UserFeedbackRecord[] = [];

export function recordUserFeedback(
  intent: Intent,
  role: SchoolRole,
  strategy: string,
  confidence: ConfidenceLevel,
  rating: 'helpful' | 'not_helpful',
  comment?: string
): UserFeedbackRecord {
  const record: UserFeedbackRecord = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    intent,
    role,
    strategy,
    confidence,
    rating,
    comment,
    timestamp: new Date().toISOString(),
  };

  feedbackStore.push(record);
  console.log(`[SchoolGPT Feedback Engine] Logged ${rating.toUpperCase()} feedback for intent: ${intent}`);
  return record;
}

export function getFeedbackSummary() {
  const total = feedbackStore.length;
  const helpful = feedbackStore.filter(f => f.rating === 'helpful').length;
  const notHelpful = feedbackStore.filter(f => f.rating === 'not_helpful').length;
  const satisfactionRatePct = total > 0 ? Math.round((helpful / total) * 100) : 100;

  return { total, helpful, notHelpful, satisfactionRatePct, records: feedbackStore };
}
