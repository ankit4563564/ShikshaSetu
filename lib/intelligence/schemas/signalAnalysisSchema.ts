export type SignalSeverity = 'low' | 'medium' | 'high';

export interface SupportingSignalEvidence {
  readonly source: 'attendance' | 'homework' | 'academics' | 'wellness' | 'teacher_notes';
  readonly metric: string;
  readonly value: string;
  readonly direction: 'declining' | 'stable' | 'improving';
  readonly evidenceText: string;
}

export interface RecommendedInterventionAction {
  readonly action: string;
  readonly category: 'academic_tutoring' | 'parent_conference' | 'counselor_checkin' | 'attendance_contract';
  readonly rationale: string;
  readonly priority: 'urgent' | 'standard' | 'low';
}

export interface EarlySignalAnalysisResult {
  readonly concernDetected: boolean;
  readonly severity: SignalSeverity;
  readonly confidenceScore: number; // 0.0 to 1.0
  readonly explanation: string;
  readonly signals: ReadonlyArray<SupportingSignalEvidence>;
  readonly recommendedActions: ReadonlyArray<RecommendedInterventionAction>;
  readonly metadata: {
    readonly studentId: string;
    readonly schoolId: string;
    readonly evaluatedAt: string;
  };
}

export function validateSignalAnalysisResult(payload: any): EarlySignalAnalysisResult {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Invalid AI response payload: Must be a JSON object');
  }

  const concernDetected = Boolean(payload.concernDetected);
  const severity: SignalSeverity = ['low', 'medium', 'high'].includes(payload.severity)
    ? payload.severity
    : 'medium';

  const confidenceScore = typeof payload.confidenceScore === 'number'
    ? Math.min(1, Math.max(0, payload.confidenceScore))
    : 0.85;

  const explanation = typeof payload.explanation === 'string' && payload.explanation.length > 5
    ? payload.explanation
    : 'Early warning signals indicate potential academic or attendance decline requiring teacher review.';

  const signals: SupportingSignalEvidence[] = Array.isArray(payload.signals)
    ? payload.signals.map((s: any) => ({
        source: s.source || 'academics',
        metric: s.metric || 'Score',
        value: String(s.value || 'N/A'),
        direction: ['declining', 'stable', 'improving'].includes(s.direction) ? s.direction : 'declining',
        evidenceText: String(s.evidenceText || s.evidence || 'Metric change observed'),
      }))
    : [];

  const recommendedActions: RecommendedInterventionAction[] = Array.isArray(payload.recommendedActions)
    ? payload.recommendedActions.map((a: any) => ({
        action: String(a.action || 'Schedule check-in'),
        category: a.category || 'academic_tutoring',
        rationale: String(a.rationale || 'Support student progress'),
        priority: ['urgent', 'standard', 'low'].includes(a.priority) ? a.priority : 'standard',
      }))
    : [];

  return {
    concernDetected,
    severity,
    confidenceScore,
    explanation,
    signals: Object.freeze(signals),
    recommendedActions: Object.freeze(recommendedActions),
    metadata: {
      studentId: payload.metadata?.studentId || 'unknown',
      schoolId: payload.metadata?.schoolId || 'unknown',
      evaluatedAt: new Date().toISOString(),
    },
  };
}
