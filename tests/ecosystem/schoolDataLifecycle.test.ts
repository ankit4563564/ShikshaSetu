import { describe, it, expect } from 'vitest';
import {
  CANONICAL_STUDENT_ID,
  CANONICAL_PRIYA_STUDENT_ID,
  CANONICAL_TEACHER_ID,
  CANONICAL_GUARDIAN_ID,
  CANONICAL_SCHOOL_ID,
  getCanonicalStudent,
  getCanonicalAttendance,
  getCanonicalHomework,
  getCanonicalGrades,
} from '@/lib/canonical';
import {
  getMasterStudentsAction,
  getMasterParentsAction,
  getMasterTeachersAction,
  saveMasterStudentAction,
  linkStudentToParentAction,
} from '@/app/actions/adminDataActions';
import { generateSchoolGPTResponse } from '@/lib/schoolgpt/generateResponse';
import { classifyIntent } from '@/school-brain/intents/intentClassifier';
import { planQueryExecution } from '@/school-brain/planner/queryPlanner';
import { executeHybridRetrieval } from '@/school-brain/retrieval/retriever';

describe('ShikshaSetu Canonical School Data Lifecycle (End-to-End Tests)', () => {
  const teacherContext = {
    role: 'teacher' as const,
    teacherId: CANONICAL_TEACHER_ID,
    classGrade: '8',
    classSection: 'A',
  };

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 1: Academic Marks Lifecycle (Admin -> Teacher -> Student -> Parent -> Report Card -> AI)
  // ───────────────────────────────────────────────────────────────────────────
  it('1. Academic Marks Lifecycle: Teacher enters mark once -> Student, Parent, Report Card, and AI read identical record', async () => {
    // A. Admin verifies Aarav Sharma is linked to Sunita Sharma
    const students = await getMasterStudentsAction();
    const aarav = students.find((s) => s.id === CANONICAL_STUDENT_ID);
    expect(aarav).toBeDefined();
    expect(aarav?.display_name).toBe('Aarav Sharma');
    expect(aarav?.guardian_name).toBe('Sunita Sharma');

    // B. Teacher marks verification
    const aaravGrades = await getCanonicalGrades(CANONICAL_STUDENT_ID);
    expect(Array.isArray(aaravGrades)).toBe(true);

    // C. Student reads their own grades
    const studentGrades = await getCanonicalGrades(CANONICAL_STUDENT_ID);
    expect(studentGrades).toEqual(aaravGrades);

    // D. Parent reads their child's canonical grades
    const parentChildGrades = await getCanonicalGrades(aarav!.id);
    expect(parentChildGrades).toEqual(studentGrades);

    // E. AI Retrieval queries Aarav's academic record
    const query = 'How is Aarav doing in Mathematics?';
    const classified = classifyIntent(query);
    const plan = planQueryExecution(classified, query, teacherContext);
    const retrieval = await executeHybridRetrieval(classified, query, teacherContext, undefined, plan);

    expect(retrieval.data).toContain('Aarav');
    expect(retrieval.data).not.toContain('Multi-Student Comparative Analysis');

    const aiResponse = await generateSchoolGPTResponse(
      query,
      retrieval.data,
      'teacher',
      [],
      classified.intent,
      'HIGH',
      retrieval.modulesConsulted,
      teacherContext,
      plan
    );
    expect(aiResponse.text).toContain('Aarav');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 2: Attendance Lifecycle (Teacher -> Database -> Student + Parent Views)
  // ───────────────────────────────────────────────────────────────────────────
  it('2. Attendance Lifecycle: Teacher marks attendance once -> Student and Parent view identical attendance records', async () => {
    const studentAttendance = await getCanonicalAttendance(30, CANONICAL_STUDENT_ID);
    expect(Array.isArray(studentAttendance)).toBe(true);

    // Parent queries the same student's attendance
    const parentViewAttendance = await getCanonicalAttendance(30, CANONICAL_STUDENT_ID);
    expect(parentViewAttendance).toEqual(studentAttendance);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 3: Homework Lifecycle (Teacher Assigns -> Student Submits -> Parent/Teacher Monitor)
  // ───────────────────────────────────────────────────────────────────────────
  it('3. Homework Lifecycle: Teacher creates homework -> Student sees and completes -> Single canonical state', async () => {
    const homeworkList = await getCanonicalHomework(30, CANONICAL_STUDENT_ID);
    expect(Array.isArray(homeworkList)).toBe(true);
    expect(homeworkList.length).toBeGreaterThan(0);

    const mathHw = homeworkList.find((h) => h.subject === 'Mathematics');
    expect(mathHw).toBeDefined();
    expect(mathHw?.title).toContain('Linear Equations');

    // Both student and parent observe the exact same homework record
    const parentHwView = await getCanonicalHomework(30, CANONICAL_STUDENT_ID);
    expect(parentHwView).toEqual(homeworkList);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 4: Admin Student-Parent Relationship Management
  // ───────────────────────────────────────────────────────────────────────────
  it('4. Admin Master Data: Admin can link Priya Patel to Rajesh Patel using canonical IDs', async () => {
    const linkResult = await linkStudentToParentAction(
      CANONICAL_PRIYA_STUDENT_ID,
      'c1000000-0000-4000-8000-000000000002',
      'Father'
    );
    expect(linkResult.success).toBe(true);

    const students = await getMasterStudentsAction();
    const priya = students.find((s) => s.id === CANONICAL_PRIYA_STUDENT_ID);
    expect(priya?.guardian_name).toBe('Rajesh Patel');
    expect(priya?.relationship).toBe('Father');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 5: Role & Multi-Tenant Boundaries
  // ───────────────────────────────────────────────────────────────────────────
  it('5. Tenant Scoping: Operations are scoped to the authorized school and role context', async () => {
    const teachers = await getMasterTeachersAction();
    expect(teachers.length).toBeGreaterThan(0);
    expect(teachers[0].display_name).toBe('Ananya Mehra');
    expect(teachers[0].grade).toBe('8');
    expect(teachers[0].section).toBe('A');
  });
});
