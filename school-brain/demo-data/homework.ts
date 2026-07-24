import type { HomeworkAssignment } from '../models/index';

export const DEMO_HOMEWORK: HomeworkAssignment[] = [
  {
    id: 'hw-8a-math-01',
    grade: '8',
    section: 'A',
    subject: 'Mathematics',
    title: 'Algebraic Identities Worksheet Chapter 4',
    description: 'Solve exercises 4.1 to 4.3 from NCERT textbook in homework notebook.',
    assignedDate: '2026-07-20',
    dueDate: '2026-07-23', // Due tomorrow
    assignedByTeacherId: 't-101',
    assignedByTeacherName: 'Ananya Sharma',
    submittedStudentIds: ['s-8a-01', 's-8a-02', 's-8a-04'],
    pendingStudentIds: ['s-8a-03', 's-8a-05'], // Rohan Gupta, Kabir Mehta missed Maths homework!
  },
  {
    id: 'hw-8a-phy-01',
    grade: '8',
    section: 'A',
    subject: 'Physics',
    title: 'Force and Pressure Numerical Problems',
    description: 'Calculate pressure exerted on various surface areas for questions 1 through 10.',
    assignedDate: '2026-07-21',
    dueDate: '2026-07-24',
    assignedByTeacherId: 't-102',
    assignedByTeacherName: 'Rajesh Mehra',
    submittedStudentIds: ['s-8a-01', 's-8a-02'],
    pendingStudentIds: ['s-8a-03', 's-8a-04', 's-8a-05'],
  },
  {
    id: 'hw-8b-math-01',
    grade: '8',
    section: 'B',
    subject: 'Mathematics',
    title: 'Linear Equations Word Problems',
    description: 'Complete problems 1-15 on page 78.',
    assignedDate: '2026-07-20',
    dueDate: '2026-07-23',
    assignedByTeacherId: 't-101',
    assignedByTeacherName: 'Ananya Sharma',
    submittedStudentIds: ['s-8b-01', 's-8b-02'],
    pendingStudentIds: ['s-8b-03'], // Dev Tiwari missed Maths homework!
  },
  {
    id: 'hw-9a-eng-01',
    grade: '9',
    section: 'A',
    subject: 'English',
    title: 'Essay on Climate Action & Sustainability',
    description: 'Write a 400-word formal essay focusing on renewable energy initiatives.',
    assignedDate: '2026-07-19',
    dueDate: '2026-07-22',
    assignedByTeacherId: 't-103',
    assignedByTeacherName: 'Priya Nair',
    submittedStudentIds: ['s-9a-01', 's-9a-02', 's-9a-03'],
    pendingStudentIds: [],
  },
];

export function getMissedHomeworkStudents(subject: string = 'Mathematics', grade: string = '8'): string[] {
  const matching = DEMO_HOMEWORK.filter(h =>
    h.subject.toLowerCase().includes(subject.toLowerCase()) && h.grade === grade
  );
  const studentIds = new Set<string>();
  matching.forEach(h => h.pendingStudentIds.forEach(id => studentIds.add(id)));
  return Array.from(studentIds);
}

export function getPendingHomeworkForStudent(studentId: string): HomeworkAssignment[] {
  return DEMO_HOMEWORK.filter(h => h.pendingStudentIds.includes(studentId));
}
