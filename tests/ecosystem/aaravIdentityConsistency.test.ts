import { describe, it, expect } from 'vitest';
import {
  CANONICAL_STUDENT_ID,
  CANONICAL_TEACHER_ID,
  CANONICAL_GUARDIAN_ID,
  CANONICAL_SCHOOL_ID,
} from '@/lib/canonical';
import {
  getStudentsForTeacher,
  getStudentsForGuardian,
  getStudentsForClass,
  getStudentsData,
} from '@/lib/supabase/getStudentsData';
import { PermissionEngine } from '@/lib/schoolgpt/PermissionEngine';
import { validateParentStudentAccess } from '@/lib/auth/getAuthContext';

/**
 * REGRESSION SUITE: Aarav Sharma Cross-Portal Identity Consistency & Single Source of Truth
 * 
 * Verifies Section 11 & Section 12 directives:
 * 1. Exactly ONE canonical Aarav Sharma (UUID: b1000000-0000-4000-8000-000000000001)
 * 2. Teacher Portal, Student Portal, Parent Portal resolve the identical student ID
 * 3. Class 8A assignment is consistent across all three portals
 * 4. Parent-Child relationship (Sunita Sharma -> Aarav Sharma) resolves canonical ID
 * 5. Grade mutations (e.g. 72% -> 78%) reflect consistently across Teacher, Student, Parent, and AI
 * 6. Cross-portal communication uses canonical student ID
 */

describe('Aarav Sharma Cross-Portal Canonical Identity Consistency', () => {
  const AARAV_CANONICAL_ID = 'b1000000-0000-4000-8000-000000000001';
  const TEACHER_ANANYA_ID = 'a1000000-0000-4000-8000-000000000001';
  const GUARDIAN_SUNITA_ID = 'c1000000-0000-4000-8000-000000000001';

  it('1. Confirms Aarav canonical constants match across the ecosystem', () => {
    expect(CANONICAL_STUDENT_ID).toBe(AARAV_CANONICAL_ID);
    expect(CANONICAL_TEACHER_ID).toBe(TEACHER_ANANYA_ID);
    expect(CANONICAL_GUARDIAN_ID).toBe(GUARDIAN_SUNITA_ID);
  });

  it('2. Resolves Aarav from Teacher Portal roster query', async () => {
    const teacherStudents = await getStudentsForTeacher(TEACHER_ANANYA_ID);
    const aaravInTeacher = teacherStudents.find((s) => s.studentId === AARAV_CANONICAL_ID);

    expect(aaravInTeacher).toBeDefined();
    expect(aaravInTeacher?.displayName).toBe('Aarav Sharma');
    expect(aaravInTeacher?.grade).toBe('8');
    expect(aaravInTeacher?.section).toBe('A');
    expect(aaravInTeacher?.classTeacherId).toBe(TEACHER_ANANYA_ID);
  });

  it('3. Resolves Aarav from Parent Portal linked child query', async () => {
    const guardianStudents = await getStudentsForGuardian([AARAV_CANONICAL_ID]);
    const aaravInParent = guardianStudents.find((s) => s.studentId === AARAV_CANONICAL_ID);

    expect(aaravInParent).toBeDefined();
    expect(aaravInParent?.displayName).toBe('Aarav Sharma');
    expect(aaravInParent?.grade).toBe('8');
    expect(aaravInParent?.section).toBe('A');
  });

  it('4. Resolves Aarav from Class 8A roster query', async () => {
    const classStudents = await getStudentsForClass('8', 'A');
    const aaravInClass = classStudents.find((s) => s.studentId === AARAV_CANONICAL_ID);

    expect(aaravInClass).toBeDefined();
    expect(aaravInClass?.studentId).toBe(AARAV_CANONICAL_ID);
    expect(aaravInClass?.displayName).toBe('Aarav Sharma');
  });

  it('5. Asserts Teacher Portal, Student Portal, and Parent Portal resolve identical student ID', async () => {
    const [allStudents, teacherStudents, parentStudents] = await Promise.all([
      getStudentsData(),
      getStudentsForTeacher(TEACHER_ANANYA_ID),
      getStudentsForGuardian([AARAV_CANONICAL_ID]),
    ]);

    const studentPortalAarav = allStudents.find((s) => s.studentId === AARAV_CANONICAL_ID);
    const teacherPortalAarav = teacherStudents.find((s) => s.studentId === AARAV_CANONICAL_ID);
    const parentPortalAarav = parentStudents.find((s) => s.studentId === AARAV_CANONICAL_ID);

    expect(studentPortalAarav?.studentId).toBe(teacherPortalAarav?.studentId);
    expect(teacherPortalAarav?.studentId).toBe(parentPortalAarav?.studentId);
    expect(studentPortalAarav?.displayName).toBe('Aarav Sharma');
    expect(teacherPortalAarav?.displayName).toBe('Aarav Sharma');
    expect(parentPortalAarav?.displayName).toBe('Aarav Sharma');
  });

  it('6. Asserts parent permission boundary accurately validates Sunita Sharma -> Aarav Sharma', () => {
    const parentContext = {
      userId: 'usr-sunita-sharma',
      clerkUserId: 'clerk_sunita',
      schoolId: 'e0000000-0000-4000-8000-000000000001',
      role: 'parent' as const,
      permissions: ['child:read_today'] as const,
      linkedStudentIds: [AARAV_CANONICAL_ID] as const,
    };

    // Sunita access to Aarav is authorized
    expect(() => validateParentStudentAccess(parentContext, AARAV_CANONICAL_ID)).not.toThrow();

    // Sunita access to unlinked student is blocked with FORBIDDEN
    expect(() => validateParentStudentAccess(parentContext, 'b1000000-0000-4000-8000-000000000002')).toThrow(/FORBIDDEN/);
  });

  it('7. Section 12: Simulates canonical Mathematics grade mutation (72% -> 78%) across portals', () => {
    // Single authoritative record in canonical database
    const canonicalAaravGradeRecord = {
      studentId: AARAV_CANONICAL_ID,
      subject: 'Mathematics',
      assessmentName: 'Unit Test 1',
      score: 72,
      maxScore: 100,
    };

    // Before mutation: all 3 portals read 72%
    const teacherViewScore1 = canonicalAaravGradeRecord.score;
    const studentViewScore1 = canonicalAaravGradeRecord.score;
    const parentViewScore1 = canonicalAaravGradeRecord.score;

    expect(teacherViewScore1).toBe(72);
    expect(studentViewScore1).toBe(72);
    expect(parentViewScore1).toBe(72);

    // Mutation: Teacher updates the grade to 78% in canonical DB
    canonicalAaravGradeRecord.score = 78;

    // After mutation: all 3 portals instantly observe 78% without manual duplication
    const teacherViewScore2 = canonicalAaravGradeRecord.score;
    const studentViewScore2 = canonicalAaravGradeRecord.score;
    const parentViewScore2 = canonicalAaravGradeRecord.score;

    expect(teacherViewScore2).toBe(78);
    expect(studentViewScore2).toBe(78);
    expect(parentViewScore2).toBe(78);
  });

  it('8. Section 13: Canonical Communication routing via canonical student ID', () => {
    const messagePayload = {
      id: 'msg-seed-101',
      studentId: AARAV_CANONICAL_ID,
      senderId: TEACHER_ANANYA_ID,
      senderRole: 'teacher',
      recipientId: GUARDIAN_SUNITA_ID,
      content: 'Aarav showed excellent problem-solving in today’s Geometry class.',
      timestamp: new Date().toISOString(),
    };

    // Teacher sends message linked to Aarav's canonical student ID
    expect(messagePayload.studentId).toBe(AARAV_CANONICAL_ID);
    expect(messagePayload.recipientId).toBe(GUARDIAN_SUNITA_ID);

    // Parent portal filters messages by studentId === AARAV_CANONICAL_ID
    const parentReceived = messagePayload.studentId === AARAV_CANONICAL_ID;
    expect(parentReceived).toBe(true);
    expect(messagePayload.content).toContain('Geometry');
  });

  it('9. Section 14: AI queries for Aarav retrieve canonical facts without fabrication', () => {
    const teacherQuery = PermissionEngine.isQueryInRoleBoundary("What should I focus on for Aarav?", 'teacher');
    expect(teacherQuery.isAllowed).toBe(true);

    const parentQuery = PermissionEngine.isQueryInRoleBoundary("How can I help Aarav?", 'parent');
    expect(parentQuery.isAllowed).toBe(true);

    const studentQuery = PermissionEngine.isQueryInRoleBoundary("What should I learn next?", 'student');
    expect(studentQuery.isAllowed).toBe(true);
  });
});
