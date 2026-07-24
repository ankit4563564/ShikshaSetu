import type { TimetableEntry } from '../models/index';

const TIMETABLE = [
  { dayOfWeek: 0, periodNumber: 1, subject: 'Mathematics', teacherId: 'a1000000-0000-4000-8000-000000000002', teacherName: 'Vikram Joshi', startTime: '08:00', endTime: '08:40', room: '101' },
  { dayOfWeek: 0, periodNumber: 2, subject: 'English', teacherId: 'a1000000-0000-4000-8000-000000000004', teacherName: 'Rajesh Sharma', startTime: '08:45', endTime: '09:25', room: '102' },
  { dayOfWeek: 0, periodNumber: 3, subject: 'Science', teacherId: 'a1000000-0000-4000-8000-000000000001', teacherName: 'Ananya Mehra', startTime: '09:30', endTime: '10:10', room: 'Science Lab' },
  { dayOfWeek: 0, periodNumber: 4, subject: 'Hindi', teacherId: 'a1000000-0000-4000-8000-000000000009', teacherName: 'Fatima Khan', startTime: '10:15', endTime: '10:55', room: '103' },
  { dayOfWeek: 0, periodNumber: 5, subject: 'Social Studies', teacherId: 'a1000000-0000-4000-8000-000000000010', teacherName: 'Suresh Patel', startTime: '11:00', endTime: '11:40', room: '104' },
  { dayOfWeek: 0, periodNumber: 6, subject: 'Computer Science', teacherId: 'a1000000-0000-4000-8000-000000000007', teacherName: 'Sunita Reddy', startTime: '11:45', endTime: '12:25', room: 'Computer Lab' },
  { dayOfWeek: 1, periodNumber: 1, subject: 'Science', teacherId: 'a1000000-0000-4000-8000-000000000001', teacherName: 'Ananya Mehra', startTime: '08:00', endTime: '08:40', room: 'Science Lab' },
  { dayOfWeek: 1, periodNumber: 2, subject: 'Mathematics', teacherId: 'a1000000-0000-4000-8000-000000000002', teacherName: 'Vikram Joshi', startTime: '08:45', endTime: '09:25', room: '101' },
  { dayOfWeek: 1, periodNumber: 3, subject: 'English', teacherId: 'a1000000-0000-4000-8000-000000000004', teacherName: 'Rajesh Sharma', startTime: '09:30', endTime: '10:10', room: '102' },
  { dayOfWeek: 1, periodNumber: 4, subject: 'Art', teacherId: 'a1000000-0000-4000-8000-000000000008', teacherName: 'Deepak Menon', startTime: '10:15', endTime: '10:55', room: 'Art Room' },
  { dayOfWeek: 1, periodNumber: 5, subject: 'Physical Education', teacherId: 'a1000000-0000-4000-8000-000000000006', teacherName: 'Amit Kumar', startTime: '11:00', endTime: '11:40', room: 'Sports Complex' },
  { dayOfWeek: 2, periodNumber: 1, subject: 'English', teacherId: 'a1000000-0000-4000-8000-000000000004', teacherName: 'Rajesh Sharma', startTime: '08:00', endTime: '08:40', room: '102' },
  { dayOfWeek: 2, periodNumber: 2, subject: 'Hindi', teacherId: 'a1000000-0000-4000-8000-000000000009', teacherName: 'Fatima Khan', startTime: '08:45', endTime: '09:25', room: '103' },
  { dayOfWeek: 2, periodNumber: 3, subject: 'Mathematics', teacherId: 'a1000000-0000-4000-8000-000000000002', teacherName: 'Vikram Joshi', startTime: '09:30', endTime: '10:10', room: '101' },
  { dayOfWeek: 2, periodNumber: 4, subject: 'Science', teacherId: 'a1000000-0000-4000-8000-000000000001', teacherName: 'Ananya Mehra', startTime: '10:15', endTime: '10:55', room: 'Science Lab' },
  { dayOfWeek: 2, periodNumber: 5, subject: 'Music', teacherId: 'a1000000-0000-4000-8000-000000000009', teacherName: 'Fatima Khan', startTime: '11:00', endTime: '11:40', room: 'Music Room' },
  { dayOfWeek: 3, periodNumber: 1, subject: 'Mathematics', teacherId: 'a1000000-0000-4000-8000-000000000002', teacherName: 'Vikram Joshi', startTime: '08:00', endTime: '08:40', room: '101' },
  { dayOfWeek: 3, periodNumber: 2, subject: 'Science', teacherId: 'a1000000-0000-4000-8000-000000000001', teacherName: 'Ananya Mehra', startTime: '08:45', endTime: '09:25', room: 'Science Lab' },
  { dayOfWeek: 3, periodNumber: 3, subject: 'Social Studies', teacherId: 'a1000000-0000-4000-8000-000000000010', teacherName: 'Suresh Patel', startTime: '09:30', endTime: '10:10', room: '104' },
  { dayOfWeek: 3, periodNumber: 4, subject: 'English', teacherId: 'a1000000-0000-4000-8000-000000000004', teacherName: 'Rajesh Sharma', startTime: '10:15', endTime: '10:55', room: '102' },
  { dayOfWeek: 3, periodNumber: 5, subject: 'Library', teacherId: 'a1000000-0000-4000-8000-000000000007', teacherName: 'Sunita Reddy', startTime: '11:00', endTime: '11:40', room: 'Library' },
  { dayOfWeek: 4, periodNumber: 1, subject: 'Hindi', teacherId: 'a1000000-0000-4000-8000-000000000009', teacherName: 'Fatima Khan', startTime: '08:00', endTime: '08:40', room: '103' },
  { dayOfWeek: 4, periodNumber: 2, subject: 'Mathematics', teacherId: 'a1000000-0000-4000-8000-000000000002', teacherName: 'Vikram Joshi', startTime: '08:45', endTime: '09:25', room: '101' },
  { dayOfWeek: 4, periodNumber: 3, subject: 'Computer Science', teacherId: 'a1000000-0000-4000-8000-000000000007', teacherName: 'Sunita Reddy', startTime: '09:30', endTime: '10:10', room: 'Computer Lab' },
  { dayOfWeek: 4, periodNumber: 4, subject: 'Science', teacherId: 'a1000000-0000-4000-8000-000000000001', teacherName: 'Ananya Mehra', startTime: '10:15', endTime: '10:55', room: 'Science Lab' },
  { dayOfWeek: 4, periodNumber: 5, subject: 'Physical Education', teacherId: 'a1000000-0000-4000-8000-000000000006', teacherName: 'Amit Kumar', startTime: '11:00', endTime: '11:40', room: 'Sports Complex' },
] as TimetableEntry[];

export function getTimetableForClass(classGrade: string, classSection?: string): TimetableEntry[] {
  return TIMETABLE;
}

export function getTodayTimetable(classGrade: string, classSection?: string): TimetableEntry[] {
  const today = new Date().getDay();
  const adjustedDay = today === 0 ? 4 : today - 1;
  return TIMETABLE.filter(e => e.dayOfWeek === adjustedDay);
}

export function getTeacherTimetable(teacherId: string): TimetableEntry[] {
  return TIMETABLE.filter(e => e.teacherId === teacherId);
}

export function getNextPeriod(classGrade: string): TimetableEntry | undefined {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = now.getDay();
  const adjustedDay = today === 0 ? 4 : today - 1;

  const todayEntries = TIMETABLE
    .filter(e => e.dayOfWeek === adjustedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  for (const entry of todayEntries) {
    const [h, m] = entry.startTime.split(':').map(Number);
    const entryMinutes = h * 60 + m;
    if (entryMinutes > currentMinutes) return entry;
  }
  return undefined;
}
