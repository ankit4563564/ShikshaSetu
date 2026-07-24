import type { TimetableEntry } from '../models/index';

export const DEMO_TIMETABLE: TimetableEntry[] = [
  // Class 8A Schedule (Monday to Friday)
  // Monday (dayOfWeek: 0)
  { id: 'tt-8a-m1', grade: '8', section: 'A', dayOfWeek: 0, dayName: 'Monday', periodNumber: 1, subject: 'Mathematics', teacherId: 't-101', teacherName: 'Ananya Sharma', startTime: '08:00', endTime: '08:45', room: 'Room 201' },
  { id: 'tt-8a-m2', grade: '8', section: 'A', dayOfWeek: 0, dayName: 'Monday', periodNumber: 2, subject: 'Physics', teacherId: 't-102', teacherName: 'Rajesh Mehra', startTime: '08:45', endTime: '09:30', room: 'Physics Lab 1' },
  { id: 'tt-8a-m3', grade: '8', section: 'A', dayOfWeek: 0, dayName: 'Monday', periodNumber: 3, subject: 'English', teacherId: 't-103', teacherName: 'Priya Nair', startTime: '09:45', endTime: '10:30', room: 'Room 201' },
  { id: 'tt-8a-m4', grade: '8', section: 'A', dayOfWeek: 0, dayName: 'Monday', periodNumber: 4, subject: 'Chemistry', teacherId: 't-104', teacherName: 'Sunil Verma', startTime: '10:30', endTime: '11:15', room: 'Chemistry Lab 2' },
  { id: 'tt-8a-m5', grade: '8', section: 'A', dayOfWeek: 0, dayName: 'Monday', periodNumber: 5, subject: 'Computer Science', teacherId: 't-106', teacherName: 'Amitabh Sen', startTime: '11:45', endTime: '12:30', room: 'IT Lab A' },
  { id: 'tt-8a-m6', grade: '8', section: 'A', dayOfWeek: 0, dayName: 'Monday', periodNumber: 6, subject: 'Social Studies', teacherId: 't-105', teacherName: 'Kavita Deshmukh', startTime: '12:30', endTime: '01:15', room: 'Room 201' },

  // Tuesday (dayOfWeek: 1)
  { id: 'tt-8a-t1', grade: '8', section: 'A', dayOfWeek: 1, dayName: 'Tuesday', periodNumber: 1, subject: 'Mathematics', teacherId: 't-101', teacherName: 'Ananya Sharma', startTime: '08:00', endTime: '08:45', room: 'Room 201' },
  { id: 'tt-8a-t2', grade: '8', section: 'A', dayOfWeek: 1, dayName: 'Tuesday', periodNumber: 2, subject: 'Hindi', teacherId: 't-107', teacherName: 'Deepa Kulkarni', startTime: '08:45', endTime: '09:30', room: 'Room 201' },
  { id: 'tt-8a-t3', grade: '8', section: 'A', dayOfWeek: 1, dayName: 'Tuesday', periodNumber: 3, subject: 'Physical Education', teacherId: 't-108', teacherName: 'Vikram Rathore', startTime: '09:45', endTime: '10:30', room: 'Sports Ground' },
  { id: 'tt-8a-t4', grade: '8', section: 'A', dayOfWeek: 1, dayName: 'Tuesday', periodNumber: 4, subject: 'French', teacherId: 't-114', teacherName: 'Gaurav Tiwari', startTime: '10:30', endTime: '11:15', room: 'Language Center' },
  { id: 'tt-8a-t5', grade: '8', section: 'A', dayOfWeek: 1, dayName: 'Tuesday', periodNumber: 5, subject: 'Physics', teacherId: 't-102', teacherName: 'Rajesh Mehra', startTime: '11:45', endTime: '12:30', room: 'Room 201' },

  // Wednesday (dayOfWeek: 2)
  { id: 'tt-8a-w1', grade: '8', section: 'A', dayOfWeek: 2, dayName: 'Wednesday', periodNumber: 1, subject: 'Chemistry', teacherId: 't-104', teacherName: 'Sunil Verma', startTime: '08:00', endTime: '08:45', room: 'Chemistry Lab 2' },
  { id: 'tt-8a-w2', grade: '8', section: 'A', dayOfWeek: 2, dayName: 'Wednesday', periodNumber: 2, subject: 'Mathematics', teacherId: 't-101', teacherName: 'Ananya Sharma', startTime: '08:45', endTime: '09:30', room: 'Room 201' },
  { id: 'tt-8a-w3', grade: '8', section: 'A', dayOfWeek: 2, dayName: 'Wednesday', periodNumber: 3, subject: 'Art & Craft', teacherId: 't-111', teacherName: 'Shalini Gupta', startTime: '09:45', endTime: '10:30', room: 'Art Studio 302' },
  { id: 'tt-8a-w4', grade: '8', section: 'A', dayOfWeek: 2, dayName: 'Wednesday', periodNumber: 4, subject: 'English', teacherId: 't-103', teacherName: 'Priya Nair', startTime: '10:30', endTime: '11:15', room: 'Room 201' },
  { id: 'tt-8a-w5', grade: '8', section: 'A', dayOfWeek: 2, dayName: 'Wednesday', periodNumber: 5, subject: 'Social Studies', teacherId: 't-105', teacherName: 'Kavita Deshmukh', startTime: '11:45', endTime: '12:30', room: 'Room 201' },

  // Thursday (dayOfWeek: 3)
  { id: 'tt-8a-th1', grade: '8', section: 'A', dayOfWeek: 3, dayName: 'Thursday', periodNumber: 1, subject: 'Biology', teacherId: 't-109', teacherName: 'Meenakshi Sundaram', startTime: '08:00', endTime: '08:45', room: 'Bio Lab 204' },
  { id: 'tt-8a-th2', grade: '8', section: 'A', dayOfWeek: 3, dayName: 'Thursday', periodNumber: 2, subject: 'Mathematics', teacherId: 't-101', teacherName: 'Ananya Sharma', startTime: '08:45', endTime: '09:30', room: 'Room 201' },
  { id: 'tt-8a-th3', grade: '8', section: 'A', dayOfWeek: 3, dayName: 'Thursday', periodNumber: 3, subject: 'Physics', teacherId: 't-102', teacherName: 'Rajesh Mehra', startTime: '09:45', endTime: '10:30', room: 'Physics Lab 1' },
  { id: 'tt-8a-th4', grade: '8', section: 'A', dayOfWeek: 3, dayName: 'Thursday', periodNumber: 4, subject: 'English', teacherId: 't-103', teacherName: 'Priya Nair', startTime: '10:30', endTime: '11:15', room: 'Room 201' },

  // Friday (dayOfWeek: 4)
  { id: 'tt-8a-f1', grade: '8', section: 'A', dayOfWeek: 4, dayName: 'Friday', periodNumber: 1, subject: 'Mathematics', teacherId: 't-101', teacherName: 'Ananya Sharma', startTime: '08:00', endTime: '08:45', room: 'Room 201' },
  { id: 'tt-8a-f2', grade: '8', section: 'A', dayOfWeek: 4, dayName: 'Friday', periodNumber: 2, subject: 'Computer Science', teacherId: 't-106', teacherName: 'Amitabh Sen', startTime: '08:45', endTime: '09:30', room: 'IT Lab A' },
  { id: 'tt-8a-f3', grade: '8', section: 'A', dayOfWeek: 4, dayName: 'Friday', periodNumber: 3, subject: 'Social Studies', teacherId: 't-105', teacherName: 'Kavita Deshmukh', startTime: '09:45', endTime: '10:30', room: 'Room 201' },
  { id: 'tt-8a-f4', grade: '8', section: 'A', dayOfWeek: 4, dayName: 'Friday', periodNumber: 4, subject: 'Library & Reading', teacherId: 't-103', teacherName: 'Priya Nair', startTime: '10:30', endTime: '11:15', room: 'Central Library' },
];

export function getTimetableByGrade(grade: string, section: string = 'A', dayOfWeek?: number): TimetableEntry[] {
  return DEMO_TIMETABLE.filter(t =>
    t.grade === grade &&
    t.section === section &&
    (dayOfWeek !== undefined ? t.dayOfWeek === dayOfWeek : true)
  );
}

export function getClassTeachersList(grade: string, section: string = 'A'): string[] {
  const entries = DEMO_TIMETABLE.filter(t => t.grade === grade && t.section === section);
  const teachers = Array.from(new Set(entries.map(e => `${e.subject}: ${e.teacherName}`)));
  return teachers;
}
