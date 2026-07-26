import { TeacherRecord } from './types';

export const TEACHERS_DATA: TeacherRecord[] = [
  {
    id: 'tch-001',
    name: 'Ms. Ananya Mehra',
    photo: '/teacher.png',
    role: 'Mathematics & Science Coordinator',
    subjects: ['Mathematics', 'Science (Physics & Chem)'],
    classes: ['Class 8A', 'Class 8B', 'Class 9A'],
    officeHours: 'Mon-Fri 02:30 PM - 03:30 PM',
    avgResponseTime: 'Under 15 minutes',
    classroomNumber: 'Classroom 8A (Main Block 2F)',
  },
  {
    id: 'tch-002',
    name: 'Dr. Rajesh Sharma',
    photo: '/teacher.png',
    role: 'Head of Humanities & History',
    subjects: ['Social Studies & History', 'Civics'],
    classes: ['Class 8A', 'Class 8B'],
    officeHours: 'Tue-Thu 03:00 PM - 04:00 PM',
    avgResponseTime: 'Within 30 minutes',
    classroomNumber: 'Classroom 8B (Main Block 2F)',
  },
];
