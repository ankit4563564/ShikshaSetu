import type { StudentProfile } from '../models/index';
import { CLUBS } from './clubs';

// Knowledge seed data is intentionally lightweight; other modules enrich it at runtime.
const STUDENTS = [
  { id: 'b1000000-0000-4000-8000-000000000001', firstName: 'Aarav', lastName: 'Singh', displayName: 'Aarav Singh', grade: '9', section: 'A', rollNumber: '9A01', dateOfBirth: '2012-03-15', classTeacherId: 'a1000000-0000-4000-8000-000000000001', busRoute: 'R1', busStop: 'Green Park Metro', clubs: ['club-001', 'club-006', 'club-010'], bloodGroup: 'B+', emergencyContact: '9876500001' },
  { id: 'b1000000-0000-4000-8000-000000000002', firstName: 'Diya', lastName: 'Patel', displayName: 'Diya Patel', grade: '9', section: 'A', rollNumber: '9A02', dateOfBirth: '2012-07-22', classTeacherId: 'a1000000-0000-4000-8000-000000000001', busRoute: 'R2', busStop: 'Lajpat Nagar', clubs: ['club-002', 'club-007'], bloodGroup: 'O+', emergencyContact: '9876500002' },
  { id: 'b1000000-0000-4000-8000-000000000003', firstName: 'Rohan', lastName: 'Gupta', displayName: 'Rohan Gupta', grade: '9', section: 'A', rollNumber: '9A03', dateOfBirth: '2012-01-10', classTeacherId: 'a1000000-0000-4000-8000-000000000001', busRoute: 'R3', busStop: 'Vasant Kunj', clubs: ['club-001', 'club-006'], bloodGroup: 'A+', emergencyContact: '9876500003' },
  { id: 'b1000000-0000-4000-8000-000000000004', firstName: 'Sneha', lastName: 'Reddy', displayName: 'Sneha Reddy', grade: '10', section: 'A', rollNumber: '10A01', dateOfBirth: '2011-11-05', classTeacherId: 'a1000000-0000-4000-8000-000000000002', busRoute: 'R1', busStop: 'Hauz Khas Village', clubs: ['club-002', 'club-003'], bloodGroup: 'AB+', emergencyContact: '9876500004' },
  { id: 'b1000000-0000-4000-8000-000000000005', firstName: 'Kabir', lastName: 'Mehta', displayName: 'Kabir Mehta', grade: '10', section: 'A', rollNumber: '10A02', dateOfBirth: '2011-05-18', classTeacherId: 'a1000000-0000-4000-8000-000000000002', busRoute: 'R4', busStop: 'Dwarka Sec 12', clubs: ['club-004', 'club-009'], bloodGroup: 'O-', emergencyContact: '9876500005' },
  { id: 'b1000000-0000-4000-8000-000000000006', firstName: 'Ananya', lastName: 'Iyer', displayName: 'Ananya Iyer', grade: '8', section: 'B', rollNumber: '8B01', dateOfBirth: '2013-09-12', classTeacherId: 'a1000000-0000-4000-8000-000000000004', busRoute: 'R5', busStop: 'Greater Kailash I', clubs: ['club-001', 'club-008'], bloodGroup: 'A-', emergencyContact: '9876500006' },
  { id: 'b1000000-0000-4000-8000-000000000007', firstName: 'Vivaan', lastName: 'Sharma', displayName: 'Vivaan Sharma', grade: '7', section: 'A', rollNumber: '7A01', dateOfBirth: '2014-02-28', classTeacherId: 'a1000000-0000-4000-8000-000000000005', busRoute: 'R2', busStop: 'Kailash Colony', clubs: ['club-001', 'club-006', 'club-010'], bloodGroup: 'B-', emergencyContact: '9876500007' },
  { id: 'b1000000-0000-4000-8000-000000000008', firstName: 'Meera', lastName: 'Nair', displayName: 'Meera Nair', grade: '6', section: 'A', rollNumber: '6A01', dateOfBirth: '2015-06-08', classTeacherId: 'a1000000-0000-4000-8000-000000000007', busRoute: 'R3', busStop: 'Munirka', clubs: ['club-001', 'club-008', 'club-010'], bloodGroup: 'O+', emergencyContact: '9876500008' },
  { id: 'b1000000-0000-4000-8000-000000000009', firstName: 'Arjun', lastName: 'Verma', displayName: 'Arjun Verma', grade: '5', section: 'B', rollNumber: '5B01', dateOfBirth: '2016-12-01', classTeacherId: 'a1000000-0000-4000-8000-000000000009', busRoute: 'R4', busStop: 'Janakpuri', clubs: ['club-004', 'club-005'], bloodGroup: 'A+', emergencyContact: '9876500009' },
  { id: 'b1000000-0000-4000-8000-000000000010', firstName: 'Ishita', lastName: 'Das', displayName: 'Ishita Das', grade: '4', section: 'A', rollNumber: '4A01', dateOfBirth: '2017-04-17', classTeacherId: 'a1000000-0000-4000-8000-000000000010', busRoute: 'R5', busStop: 'CR Park', clubs: ['club-002', 'club-003', 'club-005'], bloodGroup: 'B+', emergencyContact: '9876500010' },
] as StudentProfile[];

export function getStudentById(id: string): StudentProfile | undefined {
  return STUDENTS.find(s => s.id === id);
}

export function getStudentByName(name: string): StudentProfile | undefined {
  const lower = name.toLowerCase();
  return STUDENTS.find(s =>
    s.displayName.toLowerCase().includes(lower) ||
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(lower)
  );
}

export function getStudentsByGrade(grade: string, section?: string): StudentProfile[] {
  return STUDENTS.filter(s =>
    s.grade === grade && (section ? s.section === section : true)
  );
}

export function searchStudents(query: string): StudentProfile[] {
  const lower = query.toLowerCase();
  return STUDENTS.filter(s =>
    s.displayName.toLowerCase().includes(lower) ||
    s.grade.includes(lower) ||
    s.section.toLowerCase().includes(lower)
  );
}

export function getStudentsByClub(clubId: string): StudentProfile[] {
  return STUDENTS.filter(s => s.clubs.includes(clubId));
}
