export * from './students';
export * from './teachers';
export * from './parents';
export * from './timetable';
export * from './examsAndMarks';
export * from './homework';
export * from './attendanceAndBehaviour';
export * from './transport';
export * from './library';
export * from './canteen';
export * from './eventsAndCalendar';
export * from './feesAndHealth';

import { DEMO_STUDENTS, getStudentByName, getStudentsByGrade } from './students';
import { DEMO_TEACHERS } from './teachers';
import { getUnrepliedParents } from './parents';
import { getTimetableByGrade, getClassTeachersList } from './timetable';
import { getUpcomingExams, getStudentMarksheet } from './examsAndMarks';
import { getMissedHomeworkStudents, getPendingHomeworkForStudent } from './homework';
import { getStudentsNeedingAttention } from './attendanceAndBehaviour';
import { getStudentsForBus, getBusRouteByNumber } from './transport';
import { getBooksBorrowedByStudent, getStudentsWithLibraryDues } from './library';
import { getTodayCanteenMenu } from './canteen';
import { getSportsDayInfo, getUpcomingEvents } from './eventsAndCalendar';
import { SCHOOL_POLICIES, getPolicyByCategory } from '../policies/schoolPolicies';

export const DemoKnowledgeHelper = {
  getWhoTeachesClass(grade: string = '8', section: string = 'A'): string {
    const list = getClassTeachersList(grade, section);
    const classTeacher = DEMO_TEACHERS.find(t => t.classTeacherOf === `${grade}${section}`);
    return `Class ${grade}${section} assigned faculty:\nClass Teacher: ${classTeacher ? `${classTeacher.displayName} (${classTeacher.email})` : 'Ananya Sharma'}\nSubject Teachers:\n${list.map(t => `• ${t}`).join('\n')}`;
  },

  getWhoHasLibraryDues(): string {
    const dues = getStudentsWithLibraryDues();
    if (dues.length === 0) return 'There are currently no overdue library books or unpaid fines.';
    const lines = dues.map(d => `• ${d.studentName} — "${d.bookTitle}" (Due ${d.dueDate}, Fine: ₹${d.fineAmount})`);
    return `Students with pending library dues:\n${lines.join('\n')}`;
  },

  getTomorrowsTimetable(grade: string = '8', section: string = 'A'): string {
    // Tomorrow is Thursday (dayOfWeek: 3)
    const entries = getTimetableByGrade(grade, section, 3);
    if (entries.length === 0) return `No timetable entries found for Class ${grade}${section} tomorrow.`;
    const lines = entries.map(e => `Period ${e.periodNumber} (${e.startTime}-${e.endTime}): ${e.subject} with ${e.teacherName} in ${e.room}`);
    return `Tomorrow's Timetable (Thursday) for Class ${grade}${section}:\n${lines.join('\n')}`;
  },

  getSportsDayDetails(): string {
    const info = getSportsDayInfo();
    return `[Sports Day Information]\nEvent: ${info.name}\nDates: ${info.startDate} to ${info.endDate}\nVenue: ${info.venue}\nTarget Audience: ${info.targetAudience}\nDescription: ${info.description}`;
  },

  getStudentsWhoMissedHomework(subject: string = 'Mathematics', grade: string = '8'): string {
    const ids = getMissedHomeworkStudents(subject, grade);
    const students = ids.map(id => DEMO_STUDENTS.find(s => s.id === id)).filter(Boolean);
    if (students.length === 0) return `All students in Grade ${grade} have submitted their ${subject} homework!`;
    const lines = students.map(s => `• ${s?.displayName} (Roll No: ${s?.rollNumber}, Parent: ${s?.parentName} - ${s?.parentPhone})`);
    return `Students in Grade ${grade} who missed ${subject} homework:\n${lines.join('\n')}`;
  },

  getTomorrowsExams(grade: string = '8'): string {
    // Tomorrow is 2026-07-23
    const exams = getUpcomingExams(grade, '2026-07-23');
    if (exams.length === 0) {
      const allExams = getUpcomingExams(grade);
      if (allExams.length === 0) return `No upcoming exams scheduled for Grade ${grade}.`;
      return `Upcoming exams for Grade ${grade}:\n${allExams.map(e => `• ${e.subject}: ${e.examName} on ${e.examDate} (${e.startTime}-${e.endTime}) in ${e.room}`).join('\n')}`;
    }
    const lines = exams.map(e => `• ${e.subject}: ${e.examName} (${e.startTime}-${e.endTime}) in ${e.room}. Topics covered: ${e.topics.join(', ')}`);
    return `Tomorrow's Exam Schedule (2026-07-23) for Grade ${grade}:\n${lines.join('\n')}`;
  },

  getBusUsageCount(busNumber: string = 'Bus 3'): string {
    const count = getStudentsForBus(busNumber);
    const route = getBusRouteByNumber(busNumber);
    return `Bus 3 (Route 3) Details:\nTotal Students Assigned: ${count} students\nDriver: ${route?.driverName || 'Manoj Kumar'} (Phone: ${route?.driverPhone || '9899112255'})\nVehicle Reg: ${route?.vehicleNumber || 'DL-01-AB-9101'}\nMain Stops: ${route?.stops.map(s => `${s.stopName} (${s.morningPickupTime})`).join(' → ') || 'Vasant Kunj → Green Park Metro → Munirka'}`;
  },

  getUnrepliedParentsReport(): string {
    const unreplied = getUnrepliedParents();
    if (unreplied.length === 0) return 'All parents have acknowledged recent notices and confirmed PTM attendance.';
    const lines = unreplied.map(p => `• ${p.displayName} (Parent of ${p.children.map(c => `${c.name} - ${c.grade}${c.section}`).join(', ')}, Phone: ${p.phone}) — PTM Status: ${p.ptmAttendanceStatus}, Notice Acknowledged: ${p.lastNoticeAcknowledged ? 'Yes' : 'No'}`);
    return `Parents who have not yet replied to PTM invitations / recent notices (${unreplied.length} total):\n${lines.join('\n')}`;
  },

  getUniformPolicy(): string {
    const policies = getPolicyByCategory('uniform');
    if (policies.length === 0) return SCHOOL_POLICIES[0].summary;
    return `[${policies[0].title}]\n${policies[0].summary}\nKey Rules:\n${policies[0].details.map(d => `• ${d}`).join('\n')}`;
  },

  getBooksBorrowedByAarav(): string {
    const books = getBooksBorrowedByStudent('Aarav Singh');
    if (books.length === 0) return 'Aarav Singh currently has no books checked out from the library.';
    const lines = books.map(b => `• "${b.bookTitle}" (Issued: ${b.issuedDate}, Due: ${b.dueDate})`);
    return `Library books currently borrowed by Aarav Singh:\n${lines.join('\n')}`;
  },

  getCanteenMenuToday(): string {
    const menu = getTodayCanteenMenu('Wednesday');
    return `Today's Canteen Menu (${menu.day} - ${menu.category}):\nMain Meal Items:\n${menu.items.map(i => `• ${i}`).join('\n')}\nChef's Special: ${menu.specialItem}`;
  },

  getWhoNeedsAttentionReport(): string {
    const summaries = getStudentsNeedingAttention();
    if (summaries.length === 0) return 'All students are performing well with clean attendance and submission records.';
    const lines = summaries.map(s =>
      `• ${s.studentName} (Grade ${s.grade}${s.section}):\n  - Attendance: ${s.attendancePct}%\n  - Concerns: ${s.primaryConcernReason}\n  - Recommended Actions: ${s.recommendedActions.join('; ')}`
    );
    return `Students Requiring Academic & Behavioural Attention (${summaries.length} total):\n\n${lines.join('\n\n')}`;
  },
};
