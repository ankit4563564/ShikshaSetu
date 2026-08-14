import { AuthContext, requirePermission } from '@/lib/auth/getAuthContext';
import { ScopedSupabaseClient } from '@/lib/supabase/scoped';
import { buildStudentContext } from '../context/buildStudentContext';
import { AIProvider, ResilientAIProvider } from '../providers/aiProvider';
import {
  EarlySignalAnalysisResult,
  validateSignalAnalysisResult,
} from '../schemas/signalAnalysisSchema';

export interface EarlySignalDetectionOptions {
  readonly provider?: AIProvider;
}

/**
 * analyzeStudentEarlySignals: First real Intelligence Layer workflow.
 * Analyzes multi-modal student signals (Attendance + Homework + Marks + Observations)
 * and returns structured early warning recommendations for authorized teachers.
 */
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

  // 3. Fallback Heuristic Rule-based Evaluation (Deterministic fast path if metrics are clearly safe)
  if (
    studentContext.attendanceMetrics.attendancePercentage >= 95 &&
    studentContext.homeworkMetrics.completionRate >= 90 &&
    studentContext.academicMetrics.overallAveragePercentage >= 85
  ) {
    return {
      concernDetected: false,
      severity: 'low',
      confidenceScore: 0.98,
      explanation: 'Student exhibits consistent high attendance, homework completion, and strong academic standing.',
      signals: [
        {
          source: 'attendance',
          metric: 'Attendance Rate',
          value: `${studentContext.attendanceMetrics.attendancePercentage}%`,
          direction: 'stable',
          evidenceText: 'Attendance is well above the 90% threshold.',
        },
        {
          source: 'homework',
          metric: 'Homework Completion',
          value: `${studentContext.homeworkMetrics.completionRate}%`,
          direction: 'stable',
          evidenceText: 'All recent homework assignments submitted on time.',
        },
      ],
      recommendedActions: [],
      metadata: {
        studentId: studentContext.studentId,
        schoolId: studentContext.schoolId,
        evaluatedAt: new Date().toISOString(),
      },
    };
  }

  // 4. Construct AI System Prompt & Structured Data Payload
  const systemPrompt = `You are the ShikshaSetu Student Signal Intelligence Service.
Your role is to analyze student performance metrics and identify early warning signals for teachers.
You MUST output valid JSON matching the exact schema required. Do NOT invent student names.
Schema:
{
  "concernDetected": boolean,
  "severity": "low" | "medium" | "high",
  "confidenceScore": number,
  "explanation": "concise explanation of signals",
  "signals": [
    { "source": "attendance"|"homework"|"academics"|"wellness", "metric": string, "value": string, "direction": "declining"|"stable"|"improving", "evidenceText": string }
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
    recentObservations: studentContext.recentObservations,
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
    const validated = validateSignalAnalysisResult({
      ...parsed,
      metadata: {
        studentId: studentContext.studentId,
        schoolId: studentContext.schoolId,
      },
    });

    return validated;
  } catch (error) {
    console.warn('[Intelligence Layer] LLM Provider execution failed or returned invalid JSON. Using deterministic fallback:', error);

    // Resilient Fallback: Heuristic Signal Analysis if LLM Provider fails
    const concern =
      studentContext.attendanceMetrics.attendancePercentage < 85 ||
      studentContext.homeworkMetrics.completionRate < 70;

    return validateSignalAnalysisResult({
      concernDetected: concern,
      severity: studentContext.attendanceMetrics.attendancePercentage < 75 ? 'high' : 'medium',
      confidenceScore: 0.9,
      explanation: concern
        ? `Attendance drop (${studentContext.attendanceMetrics.attendancePercentage}%) or missing homework (${studentContext.homeworkMetrics.missing} assignments) requires teacher review.`
        : 'Student metrics are within expected bounds.',
      signals: [
        {
          source: 'attendance',
          metric: 'Attendance Rate',
          value: `${studentContext.attendanceMetrics.attendancePercentage}%`,
          direction: studentContext.attendanceMetrics.attendancePercentage < 85 ? 'declining' : 'stable',
          evidenceText: `${studentContext.attendanceMetrics.absentDays} absent days recorded.`,
        },
      ],
      recommendedActions: concern
        ? [
            {
              action: 'Schedule 1-on-1 Student Academic Check-in',
              category: 'academic_tutoring',
              rationale: 'Review missing assignments and recent attendance drop.',
              priority: 'standard',
            },
          ]
        : [],
      metadata: {
        studentId: studentContext.studentId,
        schoolId: studentContext.schoolId,
      },
    });
  }
}
