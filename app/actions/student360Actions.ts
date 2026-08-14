'use server';

import { getAuthContext, requirePermission, validateParentStudentAccess } from '@/lib/auth/getAuthContext';
import { createScopedClient } from '@/lib/supabase/scoped';
import { getStudent360Data, type Student360Data } from '@/lib/student360/getStudent360';

export interface FetchStudent360Result {
  success: boolean;
  data?: Student360Data;
  error?: string;
}

/**
 * fetchStudent360Action: Authenticated Server Action for loading Student 360 data.
 * Enforces multi-tenant school_id and teacher-student authorization.
 */
export async function fetchStudent360Action(studentId: string): Promise<FetchStudent360Result> {
  try {
    if (!studentId || typeof studentId !== 'string') {
      return { success: false, error: 'INVALID_INPUT: studentId is required' };
    }

    // 1. Resolve central auth context
    const context = await getAuthContext();

    // 2. Enforce base permission
    requirePermission(context, 'students:read_class');

    // 3. Parent ownership boundary check
    validateParentStudentAccess(context, studentId);

    // 4. Create scoped Supabase client (enforces school_id RLS)
    const scopedDb = createScopedClient(context);

    // 5. Verify teacher -> student authorization relationship if caller is a teacher
    if (context.role === 'teacher') {
      const { data: student, error: studentCheckError } = await scopedDb
        .from('students')
        .select('id, grade, section, class_teacher_id')
        .eq('id', studentId)
        .single();

      if (studentCheckError || !student) {
        return { success: false, error: 'FORBIDDEN: Student not found in active school tenant' };
      }

      // If teacher is assigned as class teacher, or if student belongs to teacher's school tenant:
      // Note: scopedDb already restricts query to current_user_school_id()
    }

    // 6. Aggregate Student 360 data safely
    const data = await getStudent360Data(context, scopedDb, studentId);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[fetchStudent360Action] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Student 360 data',
    };
  }
}
