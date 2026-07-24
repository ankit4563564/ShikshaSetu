import type { ExamSchedule, StudentMarks } from '../models/index';

// Today is set as 2026-07-22 (Wednesday). Tomorrow is 2026-07-23 (Thursday).
export const DEMO_EXAM_SCHEDULES: ExamSchedule[] = [
  {
    id: 'ex-8a-01',
    grade: '8',
    subject: 'Mathematics',
    examName: 'Mid-Term Assessment 2026',
    examDate: '2026-07-23', // Tomorrow's exam!
    startTime: '08:30 AM',
    endTime: '10:30 AM',
    room: 'Main Examination Hall A',
    maxScore: 100,
    topics: ['Algebraic Expressions', 'Linear Equations', 'Quadrilaterals', 'Data Handling'],
  },
  {
    id: 'ex-8a-02',
    grade: '8',
    subject: 'Physics',
    examName: 'Mid-Term Assessment 2026',
    examDate: '2026-07-25',
    startTime: '08:30 AM',
    endTime: '10:30 AM',
    room: 'Main Examination Hall A',
    maxScore: 80,
    topics: ['Force and Pressure', 'Friction', 'Sound waves', 'Chemical Effects of Current'],
  },
  {
    id: 'ex-9a-01',
    grade: '9',
    subject: 'Chemistry',
    examName: 'Periodic Evaluation 2',
    examDate: '2026-07-23', // Tomorrow's exam for Grade 9!
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    room: 'Science Hall 202',
    maxScore: 80,
    topics: ['Matter in our Surroundings', 'Is Matter Around Us Pure', 'Atoms and Molecules'],
  },
  {
    id: 'ex-10a-01',
    grade: '10',
    subject: 'English Literature',
    examName: 'Pre-Board Mock Exam',
    examDate: '2026-07-24',
    startTime: '08:30 AM',
    endTime: '11:30 AM',
    room: 'Senior Wing Hall 3',
    maxScore: 100,
    topics: ['First Flight Prose', 'Footprints without Feet', 'Grammar & Editing', 'Formal Letters'],
  },
];

export const DEMO_STUDENT_MARKS: StudentMarks[] = [
  // Aarav Singh (s-8a-01)
  { studentId: 's-8a-01', studentName: 'Aarav Singh', subject: 'Mathematics', examName: 'Unit Test 1', score: 92, maxScore: 100, percentage: 92, gradeLetter: 'A1' },
  { studentId: 's-8a-01', studentName: 'Aarav Singh', subject: 'Physics', examName: 'Unit Test 1', score: 85, maxScore: 100, percentage: 85, gradeLetter: 'A2' },
  { studentId: 's-8a-01', studentName: 'Aarav Singh', subject: 'English', examName: 'Unit Test 1', score: 88, maxScore: 100, percentage: 88, gradeLetter: 'A2' },

  // Diya Patel (s-8a-02)
  { studentId: 's-8a-02', studentName: 'Diya Patel', subject: 'Mathematics', examName: 'Unit Test 1', score: 98, maxScore: 100, percentage: 98, gradeLetter: 'A1' },
  { studentId: 's-8a-02', studentName: 'Diya Patel', subject: 'Physics', examName: 'Unit Test 1', score: 95, maxScore: 100, percentage: 95, gradeLetter: 'A1' },

  // Rohan Gupta (s-8a-03)
  { studentId: 's-8a-03', studentName: 'Rohan Gupta', subject: 'Mathematics', examName: 'Unit Test 1', score: 48, maxScore: 100, percentage: 48, gradeLetter: 'C2' },
  { studentId: 's-8a-03', studentName: 'Rohan Gupta', subject: 'Physics', examName: 'Unit Test 1', score: 42, maxScore: 100, percentage: 42, gradeLetter: 'D' },

  // Kabir Mehta (s-8a-05)
  { studentId: 's-8a-05', studentName: 'Kabir Mehta', subject: 'Mathematics', examName: 'Unit Test 1', score: 38, maxScore: 100, percentage: 38, gradeLetter: 'E1' },
  { studentId: 's-8a-05', studentName: 'Kabir Mehta', subject: 'Physics', examName: 'Unit Test 1', score: 35, maxScore: 100, percentage: 35, gradeLetter: 'E1' },

  // Dev Tiwari (s-8b-03)
  { studentId: 's-8b-03', studentName: 'Dev Tiwari', subject: 'Mathematics', examName: 'Unit Test 1', score: 45, maxScore: 100, percentage: 45, gradeLetter: 'D' },
];

export function getUpcomingExams(grade?: string, date?: string): ExamSchedule[] {
  return DEMO_EXAM_SCHEDULES.filter(e =>
    (grade ? e.grade === grade : true) &&
    (date ? e.examDate === date : true)
  );
}

export function getStudentMarksheet(studentId: string): StudentMarks[] {
  return DEMO_STUDENT_MARKS.filter(m => m.studentId === studentId);
}
