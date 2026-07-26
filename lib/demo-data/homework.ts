import { HomeworkRecord } from './types';

export const HOMEWORK_DATA: HomeworkRecord[] = [
  {
    id: 'hw-001',
    studentId: 'std-001',
    subject: 'Mathematics',
    title: 'Algebraic Equations Exercise 4.2',
    dueDate: '2026-07-26',
    estimatedEffort: '20 mins',
    isCompleted: true,
    score: 94,
    teacherFeedback: 'Outstanding work on quadratic formula steps!',
  },
  {
    id: 'hw-002',
    studentId: 'std-002',
    subject: 'Science (Physics)',
    title: 'Newton 2nd Law Problem Set',
    dueDate: '2026-07-26',
    estimatedEffort: '30 mins',
    isCompleted: false,
    teacherFeedback: 'Pending submission — 30% drop over 14 days.',
  },
  {
    id: 'hw-003',
    studentId: 'std-003',
    subject: 'English & Literature',
    title: 'Paragraph Summary & Essay Review',
    dueDate: '2026-07-27',
    estimatedEffort: '25 mins',
    isCompleted: true,
    score: 88,
    teacherFeedback: 'Very neat composition.',
  },
];
