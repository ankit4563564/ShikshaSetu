import type { TeacherProfile } from '../models/index';

const FACULTY: TeacherProfile[] = [
  { id: 'a1000000-0000-4000-8000-000000000001', firstName: 'Ananya', lastName: 'Mehra', email: 'ananya.mehra@shikshasetu.edu.in', subjects: ['Physics', 'Science'], isClassTeacher: true, classes: [{ grade: '9', section: 'A' }], phone: '9876543210' },
  { id: 'a1000000-0000-4000-8000-000000000002', firstName: 'Vikram', lastName: 'Joshi', email: 'vikram.joshi@shikshasetu.edu.in', subjects: ['Mathematics'], isClassTeacher: true, classes: [{ grade: '10', section: 'A' }], phone: '9876543211' },
  { id: 'a1000000-0000-4000-8000-000000000003', firstName: 'Kavita', lastName: 'Deshmukh', email: 'kavita.d@shikshasetu.edu.in', subjects: ['Chemistry', 'Science'], isClassTeacher: true, classes: [{ grade: '11', section: 'A' }], phone: '9876543212' },
  { id: 'a1000000-0000-4000-8000-000000000004', firstName: 'Rajesh', lastName: 'Sharma', email: 'rajesh.s@shikshasetu.edu.in', subjects: ['English', 'History'], isClassTeacher: true, classes: [{ grade: '8', section: 'B' }], phone: '9876543213' },
  { id: 'a1000000-0000-4000-8000-000000000005', firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@shikshasetu.edu.in', subjects: ['Biology', 'Science'], isClassTeacher: true, classes: [{ grade: '7', section: 'A' }], phone: '9876543214' },
  { id: 'a1000000-0000-4000-8000-000000000006', firstName: 'Amit', lastName: 'Kumar', email: 'amit.kumar@shikshasetu.edu.in', subjects: ['Physical Education'], isClassTeacher: false, classes: [], phone: '9876543215' },
  { id: 'a1000000-0000-4000-8000-000000000007', firstName: 'Sunita', lastName: 'Reddy', email: 'sunita.r@shikshasetu.edu.in', subjects: ['Computer Science'], isClassTeacher: true, classes: [{ grade: '6', section: 'A' }], phone: '9876543216' },
  { id: 'a1000000-0000-4000-8000-000000000008', firstName: 'Deepak', lastName: 'Menon', email: 'deepak.m@shikshasetu.edu.in', subjects: ['Art'], isClassTeacher: false, classes: [], phone: '9876543217' },
  { id: 'a1000000-0000-4000-8000-000000000009', firstName: 'Fatima', lastName: 'Khan', email: 'fatima.k@shikshasetu.edu.in', subjects: ['Hindi', 'Music'], isClassTeacher: true, classes: [{ grade: '5', section: 'B' }], phone: '9876543218' },
  { id: 'a1000000-0000-4000-8000-000000000010', firstName: 'Suresh', lastName: 'Patel', email: 'suresh.p@shikshasetu.edu.in', subjects: ['Social Studies', 'Geography'], isClassTeacher: true, classes: [{ grade: '4', section: 'A' }], phone: '9876543219' },
  { id: 'a1000000-0000-4000-8000-000000000011', firstName: 'Lakshmi', lastName: 'Iyer', email: 'lakshmi.i@shikshasetu.edu.in', subjects: ['Mathematics', 'Science'], isClassTeacher: true, classes: [{ grade: '3', section: 'A' }], phone: '9876543220' },
];

export function getTeacherById(id: string): TeacherProfile | undefined {
  return FACULTY.find(t => t.id === id);
}

export function getTeacherByName(name: string): TeacherProfile | undefined {
  const lower = name.toLowerCase();
  return FACULTY.find(t =>
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(lower)
  );
}

export function getTeachersBySubject(subject: string): TeacherProfile[] {
  const lower = subject.toLowerCase();
  return FACULTY.filter(t => t.subjects.some(s => s.toLowerCase().includes(lower)));
}

export function getTeachersByGrade(grade: string): TeacherProfile[] {
  return FACULTY.filter(t => t.classes?.some(c => c.grade === grade) ?? false);
}

export function getClassTeachers(): TeacherProfile[] {
  return FACULTY.filter(t => t.isClassTeacher);
}

export function getAllFaculty(): TeacherProfile[] {
  return FACULTY;
}
