import { describe, it, expect, vi } from 'vitest';
import { AuthContext, ROLE_PERMISSIONS } from '@/lib/auth/getAuthContext';
import { analyzeStudentEarlySignals } from '@/lib/intelligence/services/analyzeStudentSignals';
import { AIProvider, AIProviderResponse } from '@/lib/intelligence/providers/aiProvider';
import { validateSignalAnalysisResult } from '@/lib/intelligence/schemas/signalAnalysisSchema';

// Mock AI Provider for Unit Tests (No Real LLM API Calls)
class MockTestAIProvider implements AIProvider {
  constructor(private responseText: string, private shouldFail = false) {}

  async generateCompletion(): Promise<AIProviderResponse> {
    if (this.shouldFail) {
      throw new Error('Mock LLM network failure');
    }
    return {
      text: this.responseText,
      provider: 'mock',
      latencyMs: 15,
    };
  }
}

describe('Phase D Intelligence Layer Consolidation Suite', () => {
  const schoolA = 'e0000000-0000-4000-8000-000000000001';
  const teacherContext: AuthContext = {
    userId: 'teacher-01',
    clerkUserId: 'clerk-teacher-01',
    schoolId: schoolA,
    role: 'teacher',
    permissions: ROLE_PERMISSIONS['teacher'],
  };

  const parentContext: AuthContext = {
    userId: 'parent-01',
    clerkUserId: 'clerk-parent-01',
    schoolId: schoolA,
    role: 'parent',
    permissions: ROLE_PERMISSIONS['parent'],
    linkedStudentIds: ['stu-aarav'],
  };

  // Mock Scoped DB Client
  const createChain = () => {
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      limit: async () => ({ data: [], error: null }),
      single: async () => ({
        data: { id: 'stu-aarav', grade: '8', section: 'A', school_id: schoolA },
        error: null,
      }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    };
    return chain;
  };

  const mockScopedDb: any = {
    from: () => createChain(),
  };

  it('1. Enforces server-side teacher permissions for signal detection', async () => {
    // Parent attempting teacher-only signal detection -> Throws FORBIDDEN
    await expect(
      analyzeStudentEarlySignals(parentContext, mockScopedDb, 'stu-aarav')
    ).rejects.toThrow(/FORBIDDEN/);
  });

  it('2. Validates structured JSON schema output from AI Provider', () => {
    const validRawPayload = {
      concernDetected: true,
      severity: 'high',
      confidenceScore: 0.92,
      explanation: 'Attendance dropped below 80% over 14 days.',
      signals: [
        { source: 'attendance', metric: 'Attendance Rate', value: '78%', direction: 'declining', evidenceText: '3 absences' }
      ],
      recommendedActions: [
        { action: 'Attendance Contract', category: 'attendance_contract', rationale: 'Address truancy', priority: 'urgent' }
      ],
    };

    const validated = validateSignalAnalysisResult(validRawPayload);
    expect(validated.concernDetected).toBe(true);
    expect(validated.severity).toBe('high');
    expect(validated.signals.length).toBe(1);
    expect(validated.recommendedActions[0].priority).toBe('urgent');
  });

  it('3. Handles AI Provider failure gracefully with deterministic fallback', async () => {
    const failingProvider = new MockTestAIProvider('', true);

    const result = await analyzeStudentEarlySignals(teacherContext, mockScopedDb, 'stu-aarav', {
      provider: failingProvider,
    });

    expect(result).toBeDefined();
    expect(result.metadata.studentId).toBe('stu-aarav');
    expect(result.metadata.schoolId).toBe(schoolA);
  });
});
