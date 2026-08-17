export type SignalSeverity = 'low' | 'medium' | 'high';

export interface SupportingSignalEvidence {
  readonly source: 'attendance' | 'homework' | 'academics' | 'wellness' | 'teacher_notes';
  readonly metric: string;
  readonly value: string;
  readonly direction: 'declining' | 'stable' | 'improving';
  readonly evidenceText: string;
}

export interface SubjectSignalAnalysis {
  readonly subject: string;
  readonly percentage: number;
  readonly direction: 'declining' | 'stable' | 'improving';
  readonly trendText: string;
}

export interface DataCompletenessMetadata {
  readonly attendanceAvailable: boolean;
  readonly attendanceRecordCount: number;
  readonly homeworkAvailable: boolean;
  readonly homeworkRecordCount: number;
  readonly academicAvailable: boolean;
  readonly assessmentCount: number;
  readonly previousYearAvailable: boolean;
  readonly confidenceModifier: number; // 0.0 to 1.0 based on data coverage
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
  readonly subjectSignals: ReadonlyArray<SubjectSignalAnalysis>;
  readonly dataCompleteness: DataCompletenessMetadata;
  readonly recommendedActions: ReadonlyArray<RecommendedInterventionAction>;
  readonly metadata: {
    readonly studentId: string;
    readonly schoolId: string;
    readonly evaluatedAt: string;
  };
}

export function sanitizeAiText(text: string): string {
  if (!text) return 'Emerging academic pattern observed.';
  return text
    .replace(/will fail/gi, 'needs extra academic support')
    .replace(/dropout/gi, 'attendance monitoring recommended')
    .replace(/depressed|anxious|disorder|mental illness/gi, 'wellness check-in suggested');
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

  const rawExplanation = typeof payload.explanation === 'string' && payload.explanation.length > 5
    ? payload.explanation
    : 'Recent signals indicate academic or attendance changes requiring teacher check-in.';

  const explanation = sanitizeAiText(rawExplanation);

  const signals: SupportingSignalEvidence[] = Array.isArray(payload.signals)
    ? payload.signals.map((s: any) => ({
        source: s.source || 'academics',
        metric: s.metric || 'Score',
        value: String(s.value || 'N/A'),
        direction: ['declining', 'stable', 'improving'].includes(s.direction) ? s.direction : 'declining',
        evidenceText: sanitizeAiText(String(s.evidenceText || s.evidence || 'Metric change observed')),
      }))
    : [];

  const subjectSignals: SubjectSignalAnalysis[] = Array.isArray(payload.subjectSignals)
    ? payload.subjectSignals.map((sub: any) => ({
        subject: String(sub.subject || 'General'),
        percentage: typeof sub.percentage === 'number' ? Math.max(0, Math.min(100, sub.percentage)) : 75,
        direction: ['declining', 'stable', 'improving'].includes(sub.direction) ? sub.direction : 'stable',
        trendText: sanitizeAiText(String(sub.trendText || `${sub.subject} performance recorded.`)),
      }))
    : [];

  const dataCompleteness: DataCompletenessMetadata = {
    attendanceAvailable: Boolean(payload.dataCompleteness?.attendanceAvailable ?? true),
    attendanceRecordCount: Number(payload.dataCompleteness?.attendanceRecordCount ?? 30),
    homeworkAvailable: Boolean(payload.dataCompleteness?.homeworkAvailable ?? true),
    homeworkRecordCount: Number(payload.dataCompleteness?.homeworkRecordCount ?? 10),
    academicAvailable: Boolean(payload.dataCompleteness?.academicAvailable ?? true),
    assessmentCount: Number(payload.dataCompleteness?.assessmentCount ?? 5),
    previousYearAvailable: Boolean(payload.dataCompleteness?.previousYearAvailable ?? false),
    confidenceModifier: Number(payload.dataCompleteness?.confidenceModifier ?? 1.0),
  };

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
    subjectSignals: Object.freeze(subjectSignals),
    dataCompleteness: Object.freeze(dataCompleteness),
    recommendedActions: Object.freeze(recommendedActions),
    metadata: {
      studentId: payload.metadata?.studentId || 'unknown',
      schoolId: payload.metadata?.schoolId || 'unknown',
      evaluatedAt: new Date().toISOString(),
    },
  };
}
