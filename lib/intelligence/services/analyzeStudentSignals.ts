import { AuthContext, requirePermission } from '@/lib/auth/getAuthContext';
import { ScopedSupabaseClient } from '@/lib/supabase/scoped';
import { buildStudentContext } from '../context/buildStudentContext';
import { AIProvider, ResilientAIProvider } from '../providers/aiProvider';
import {
  EarlySignalAnalysisResult,
  validateSignalAnalysisResult,
  SubjectSignalAnalysis,
  SupportingSignalEvidence,
  RecommendedInterventionAction,
} from '../schemas/signalAnalysisSchema';

export interface EarlySignalDetectionOptions {
  readonly provider?: AIProvider;
}

export async function analyzeStudentEarlySignals(
  authContext: AuthContext,
  scopedDb: ScopedSupabaseClient,
  studentId: string,
  options?: EarlySignalDetectionOptions
): Promise<EarlySignalAnalysisResult> {
  // 1. Enforce Server-Side Permission Check
  requirePermission(authContext, 'students:read_class');

  // 2. Build Structured & Anonymized Student Context (No PII)
  const studentContext = await buildStudentContext(authContext, scopedDb, studentId);

  // Calculate subject signals array from academic metrics
  const subjectSignals: SubjectSignalAnalysis[] = studentContext.academicMetrics.subjectTrends.map((s) => ({
    subject: s.subject,
    percentage: s.percentage,
    direction: s.trendDirection,
    trendText: `${s.subject} performance is ${s.percentage}% (${s.trendDirection}).`,
  }));

  // 3. Fast-Path Positive / Recovery Evaluation
  const isHighPerformer =
    studentContext.attendanceMetrics.attendancePercentage >= 90 &&
    studentContext.homeworkMetrics.completionRate >= 85 &&
    studentContext.academicMetrics.overallAveragePercentage >= 80;

  const isRecovering =
    studentContext.attendanceMetrics.trendDirection === 'improving' &&
    studentContext.homeworkMetrics.trendDirection === 'improving';

  if (isHighPerformer || (isRecovering && studentContext.academicMetrics.overallAveragePercentage >= 75)) {
    return validateSignalAnalysisResult({
      concernDetected: false,
      severity: 'low',
      confidenceScore: Math.round(0.98 * studentContext.dataCompleteness.confidenceModifier * 100) / 100,
      explanation: isRecovering
        ? 'Student exhibits recent positive recovery across attendance and homework completion trends.'
        : 'Student exhibits consistent high attendance, homework completion, and strong academic standing.',
      signals: [
        {
          source: 'attendance',
          metric: 'Attendance Rate',
          value: `${studentContext.attendanceMetrics.attendancePercentage}%`,
          direction: studentContext.attendanceMetrics.trendDirection,
          evidenceText: 'Attendance rate is stable and within expected threshold.',
        },
        {
          source: 'homework',
          metric: 'Homework Completion',
          value: `${studentContext.homeworkMetrics.completionRate}%`,
          direction: studentContext.homeworkMetrics.trendDirection,
          evidenceText: 'Homework completion rate meets academic standards.',
        },
      ],
      subjectSignals,
      dataCompleteness: studentContext.dataCompleteness,
      recommendedActions: [],
      metadata: {
        studentId: studentContext.studentId,
        schoolId: studentContext.schoolId,
        evaluatedAt: new Date().toISOString(),
      },
    });
  }

  // 4. Construct AI System Prompt & Structured Data Payload
  const systemPrompt = `You are the ShikshaSetu Student Signal Intelligence Service.
Your role is to analyze student performance metrics and identify early warning signals for teachers.
You MUST output valid JSON matching the exact schema required. Do NOT invent student names or use diagnostic medical/psychological terms.
Schema:
{
  "concernDetected": boolean,
  "severity": "low" | "medium" | "high",
  "confidenceScore": number,
  "explanation": "concise evidence-based explanation",
  "signals": [
    { "source": "attendance"|"homework"|"academics"|"wellness", "metric": string, "value": string, "direction": "declining"|"stable"|"improving", "evidenceText": string }
  ],
  "subjectSignals": [
    { "subject": string, "percentage": number, "direction": "declining"|"stable"|"improving", "trendText": string }
  ],
  "recommendedActions": [
    { "action": string, "category": "academic_tutoring"|"parent_conference"|"counselor_checkin"|"attendance_contract", "rationale": string, "priority": "urgent"|"standard"|"low" }
  ]
}`;

  const userMessage = JSON.stringify({
    grade: studentContext.grade,
    section: studentContext.section,
    attendance: studentContext.attendanceMetrics,
    homework: studentContext.homeworkMetrics,
    academics: studentContext.academicMetrics,
    dataCompleteness: studentContext.dataCompleteness,
    activeInterventions: studentContext.activeInterventionCount,
  });

  const aiProvider = options?.provider || new ResilientAIProvider();

  try {
    const aiResponse = await aiProvider.generateCompletion({
      systemPrompt,
      userMessage,
      temperature: 0.1,
    });

    const parsed = JSON.parse(aiResponse.text);

    // Duplicate Intervention Protection (Case I)
    let recommendedActions: RecommendedInterventionAction[] = parsed.recommendedActions || [];
    if (studentContext.activeInterventionCount > 0 && recommendedActions.length > 0) {
      recommendedActions = [
        {
          action: 'Review Active Support Plan',
          category: 'academic_tutoring',
          rationale: 'Student already has an active support plan. Review milestones instead of creating duplicate plan.',
          priority: 'standard',
        },
      ];
    }

    return validateSignalAnalysisResult({
      ...parsed,
      subjectSignals: parsed.subjectSignals || subjectSignals,
      dataCompleteness: studentContext.dataCompleteness,
      recommendedActions,
      metadata: {
        studentId: studentContext.studentId,
        schoolId: studentContext.schoolId,
      },
    });
  } catch {
    // Multi-Signal Deterministic Fallback Logic
    const attendanceDeclining = studentContext.attendanceMetrics.attendancePercentage < 80;
    const homeworkDeclining = studentContext.homeworkMetrics.completionRate < 70;
    const academicsDeclining = studentContext.academicMetrics.overallAveragePercentage < 65;

    const decliningSubject = studentContext.academicMetrics.subjectTrends.find((s) => s.trendDirection === 'declining' || s.percentage < 60);

    const signalCount = (attendanceDeclining ? 1 : 0) + (homeworkDeclining ? 1 : 0) + (academicsDeclining || decliningSubject ? 1 : 0);
    const concern = signalCount > 0;
    const severity = signalCount >= 2 ? 'high' : signalCount === 1 ? 'medium' : 'low';

    const fallbackSignals: SupportingSignalEvidence[] = [];
    if (attendanceDeclining) {
      fallbackSignals.push({
        source: 'attendance',
        metric: 'Attendance Rate',
        value: `${studentContext.attendanceMetrics.attendancePercentage}%`,
        direction: 'declining',
        evidenceText: `Recent attendance drop recorded (${studentContext.attendanceMetrics.absentDays} absences).`,
      });
    }
    if (homeworkDeclining) {
      fallbackSignals.push({
        source: 'homework',
        metric: 'Homework Completion',
        value: `${studentContext.homeworkMetrics.completionRate}%`,
        direction: 'declining',
        evidenceText: `${studentContext.homeworkMetrics.missing} missing homework submissions.`,
      });
    }
    if (decliningSubject) {
      fallbackSignals.push({
        source: 'academics',
        metric: `${decliningSubject.subject} Score`,
        value: `${decliningSubject.percentage}%`,
        direction: 'declining',
        evidenceText: `Subject-specific score decline in ${decliningSubject.subject}.`,
      });
    }

    // Explanation construction
    let explanation = 'Student metrics remain within expected ranges.';
    if (decliningSubject && !attendanceDeclining && !homeworkDeclining) {
      explanation = `Subject-specific academic decline detected in ${decliningSubject.subject} (${decliningSubject.percentage}%) while attendance remains stable.`;
    } else if (attendanceDeclining && !homeworkDeclining && !academicsDeclining) {
      explanation = `Attendance decline recorded (${studentContext.attendanceMetrics.attendancePercentage}%) while academic performance remains stable.`;
    } else if (concern) {
      explanation = `Multi-signal decline observed across ${signalCount} indicators requiring teacher check-in.`;
    }

    // Duplicate Intervention Protection (Case I)
    let recommendedActions: RecommendedInterventionAction[] = [];
    if (concern) {
      if (studentContext.activeInterventionCount > 0) {
        recommendedActions = [
          {
            action: 'Review Active Support Plan',
            category: 'academic_tutoring',
            rationale: 'Student already has an active support plan. Review milestones instead of creating duplicate plan.',
            priority: 'standard',
          },
        ];
      } else {
        recommendedActions = [
          {
            action: decliningSubject ? `Schedule 1-on-1 ${decliningSubject.subject} Check-in` : 'Schedule 1-on-1 Academic Check-in',
            category: 'academic_tutoring',
            rationale: 'Review missing assignments and recent performance changes.',
            priority: severity === 'high' ? 'urgent' : 'standard',
          },
        ];
      }
    }

    // Confidence Score Calculation (Scaled by Data Completeness)
    const baseConfidence = signalCount >= 2 ? 0.95 : signalCount === 1 ? 0.85 : 0.98;
    const confidenceScore = Math.round(baseConfidence * studentContext.dataCompleteness.confidenceModifier * 100) / 100;

    return validateSignalAnalysisResult({
      concernDetected: concern,
      severity,
      confidenceScore,
      explanation,
      signals: fallbackSignals,
      subjectSignals,
      dataCompleteness: studentContext.dataCompleteness,
      recommendedActions,
      metadata: {
        studentId: studentContext.studentId,
        schoolId: studentContext.schoolId,
      },
    });
  }
}
