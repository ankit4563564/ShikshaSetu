import type { BehaviourRecord, AttentionRequiredSummary } from '../models/index';
import { DEMO_STUDENTS } from './students';
import { getMissedHomeworkStudents } from './homework';
import { DEMO_STUDENT_MARKS } from './examsAndMarks';

export const DEMO_BEHAVIOUR_RECORDS: BehaviourRecord[] = [
  {
    id: 'beh-101',
    studentId: 's-8a-03',
    studentName: 'Rohan Gupta',
    grade: '8',
    section: 'A',
    date: '2026-07-21',
    type: 'Concern',
    note: 'Repeatedly distracted during Mathematics period. Missed 3 homework submissions this month.',
    teacherName: 'Ananya Sharma',
  },
  {
    id: 'beh-102',
    studentId: 's-8a-05',
    studentName: 'Kabir Mehta',
    grade: '8',
    section: 'A',
    date: '2026-07-20',
    type: 'Concern',
    note: 'Frequent late arrivals (4 times in July). Low score in Unit Test 1 (38%). Parent meeting requested.',
    teacherName: 'Ananya Sharma',
  },
  {
    id: 'beh-103',
    studentId: 's-8b-03',
    studentName: 'Dev Tiwari',
    grade: '8',
    section: 'B',
    date: '2026-07-18',
    type: 'Concern',
    note: 'Struggling with focus in Science class and incomplete lab record book.',
    teacherName: 'Sunil Verma',
  },
  {
    id: 'beh-104',
    studentId: 's-8a-04',
    studentName: 'Ananya Iyer',
    grade: '8',
    section: 'A',
    date: '2026-07-19',
    type: 'Praise',
    note: 'Outstanding presentation during Science Fair preparation. Awarded 15 House Points.',
    teacherName: 'Rajesh Mehra',
  },
  {
    id: 'beh-105',
    studentId: 's-8a-01',
    studentName: 'Aarav Singh',
    grade: '8',
    section: 'A',
    date: '2026-07-15',
    type: 'Praise',
    note: 'Helped classmate with Mathematics problem solving during peer tutor session.',
    teacherName: 'Ananya Sharma',
  },
];

export function getStudentsNeedingAttention(): AttentionRequiredSummary[] {
  // Multi-factor reasoning algorithm:
  // Evaluates attendance < 85%, failing marks (< 50%), pending homework, and concern behaviour records.
  const atRiskStudents = DEMO_STUDENTS.filter(s =>
    s.attendanceRate < 85 || s.feeStatus === 'Overdue'
  );

  const missedMaths = getMissedHomeworkStudents('Mathematics', '8');

  return atRiskStudents.map(s => {
    const marks = DEMO_STUDENT_MARKS.filter(m => m.studentId === s.id && m.percentage < 50);
    const concerns = DEMO_BEHAVIOUR_RECORDS.filter(b => b.studentId === s.id && b.type === 'Concern');
    const missedHw = missedMaths.includes(s.id);

    const failingSubjects = marks.map(m => `${m.subject} (${m.percentage}%)`);
    const reasons: string[] = [];

    if (s.attendanceRate < 85) reasons.push(`Low attendance (${s.attendanceRate}%)`);
    if (failingSubjects.length > 0) reasons.push(`Failing subjects: ${failingSubjects.join(', ')}`);
    if (missedHw) reasons.push('Pending Maths homework');
    if (concerns.length > 0) reasons.push(`${concerns.length} behaviour note(s) logged by teacher`);

    return {
      studentId: s.id,
      studentName: s.displayName,
      grade: s.grade,
      section: s.section,
      attendancePct: s.attendanceRate,
      failingSubjects: failingSubjects,
      pendingHomeworkCount: missedHw ? 1 : 0,
      behaviourConcernsCount: concerns.length,
      primaryConcernReason: reasons.join(' • '),
      recommendedActions: [
        `Schedule 1-on-1 parent consultation with ${s.parentName} (${s.parentPhone})`,
        `Assign peer tutor for ${failingSubjects.length > 0 ? failingSubjects[0] : 'Mathematics'}`,
        `Monitor attendance for the upcoming week`,
      ],
    };
  });
}
