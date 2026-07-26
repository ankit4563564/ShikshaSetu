import { STUDENTS_DATA } from './students';
import { TEACHERS_DATA } from './teachers';
import { PARENTS_DATA } from './parents';
import { ATTENDANCE_DATA } from './attendance';
import { HOMEWORK_DATA } from './homework';
import { MARKS_DATA } from './marks';
import { SUPPORT_RADAR_DATA } from './supportRadar';
import { GUARDIAN_JOURNEY_DATA } from './guardianJourney';

export function getStudentReport(studentId: string) {
  const student = STUDENTS_DATA.find((s) => s.id === studentId || s.name.toLowerCase().includes(studentId.toLowerCase())) || STUDENTS_DATA[0];
  const attendance = ATTENDANCE_DATA.filter((a) => a.studentId === student.id);
  const homework = HOMEWORK_DATA.filter((h) => h.studentId === student.id);
  const marks = MARKS_DATA.filter((m) => m.studentId === student.id);
  const radar = SUPPORT_RADAR_DATA.find((r) => r.studentId === student.id);
  const journey = GUARDIAN_JOURNEY_DATA.filter((g) => g.studentId === student.id);

  return {
    student,
    attendance,
    homework,
    marks,
    radar,
    journey,
    summary: `${student.name} is in ${student.classGrade}-${student.section}. Attendance is ${student.attendancePct}%, Homework completion is ${student.homeworkCompletionPct}%, with Term 3 Average of ${student.overallTerm3Average}%.`,
  };
}

export function getClassSummary(classGrade: string = 'Class 8A') {
  const students = STUDENTS_DATA.filter((s) => `${s.classGrade} ${s.section}`.toLowerCase().includes(classGrade.toLowerCase()) || classGrade.includes('8A'));
  const total = students.length;
  const avgAttendance = Math.round(students.reduce((acc, curr) => acc + curr.attendancePct, 0) / total);
  const avgHomework = Math.round(students.reduce((acc, curr) => acc + curr.homeworkCompletionPct, 0) / total);
  const avgPerformance = Math.round(students.reduce((acc, curr) => acc + curr.overallTerm3Average, 0) / total);
  const urgentCount = students.filter((s) => s.status === 'Needs Attention').length;

  return {
    classGrade: 'Class 8A',
    totalStudents: total,
    avgAttendance,
    avgHomework,
    avgPerformance,
    urgentCount,
    students,
    teacher: TEACHERS_DATA[0],
    summary: `Class 8A has ${total} students with ${avgAttendance}% average attendance, ${avgHomework}% homework completion, and ${avgPerformance}% Term 3 academic average. ${urgentCount} student(s) need homeroom check-in.`,
  };
}

export function getAttendanceHistory(studentId: string) {
  const report = getStudentReport(studentId);
  return {
    studentName: report.student.name,
    attendancePct: report.student.attendancePct,
    streak: report.student.attendanceStreak,
    records: report.attendance,
  };
}

export function getHomeworkSummary(studentId: string) {
  const report = getStudentReport(studentId);
  return {
    studentName: report.student.name,
    completionPct: report.student.homeworkCompletionPct,
    assignments: report.homework,
  };
}

export function getGuardianJourney(studentId: string) {
  const report = getStudentReport(studentId);
  return {
    studentName: report.student.name,
    busRoute: report.student.busRoute,
    busStop: report.student.busStop,
    timeline: report.journey,
  };
}

export function getGrowthAnalytics(studentId: string) {
  const report = getStudentReport(studentId);
  return {
    studentName: report.student.name,
    growthTrendPct: report.student.growthTrendPct,
    term3Average: report.student.overallTerm3Average,
    marks: report.marks,
  };
}

export function getSupportRadar(studentId?: string) {
  if (studentId) {
    return SUPPORT_RADAR_DATA.filter((r) => r.studentId === studentId);
  }
  return SUPPORT_RADAR_DATA;
}

export function generateParentSummary(studentId: string) {
  const report = getStudentReport(studentId);
  return {
    parentName: report.student.parentName,
    studentName: report.student.name,
    messageDraft: `Dear ${report.student.parentName}, ${report.student.name} is performing well in Class 8A with ${report.student.attendancePct}% attendance and ${report.student.overallTerm3Average}% Term 3 score. ${report.student.storySnippet}`,
  };
}

export function generateTeacherBrief(classId: string = 'Class 8A') {
  const summary = getClassSummary(classId);
  return {
    teacherName: summary.teacher.name,
    classId: summary.classGrade,
    briefingBullets: [
      `Attendance completed (${summary.avgAttendance}% Present Today)`,
      `${summary.urgentCount} student(s) need homeroom check-in (Priya Patel)`,
      `4 unread parent messages waiting`,
      `Mathematics Quiz scheduled at 11:00 AM`,
      `Overall class health: Stable (${summary.avgPerformance}%)`,
    ],
  };
}

export function searchKnowledge(query: string) {
  const q = query.toLowerCase();
  if (q.includes('uniform')) {
    return {
      title: 'School Uniform Policy',
      rule: 'Students must wear navy blue blazer, white collared shirt, and black school shoes.',
      source: 'Official School Rulebook Section 4.1',
    };
  }
  if (q.includes('gate') || q.includes('entry')) {
    return {
      title: 'Campus Gate & RFID Entry Policy',
      rule: 'All students must scan RFID campus card at Gate #1 prior to 08:15 AM.',
      source: 'Campus Security Protocol 2026',
    };
  }
  return {
    title: 'School General Information',
    rule: 'School operates Monday to Friday 08:00 AM to 02:30 PM.',
    source: 'ShikshaSetu Central Registry',
  };
}

export function getSchoolGPTContext(query: string) {
  const report = getStudentReport('std-001');
  const classSummary = getClassSummary('Class 8A');
  const knowledge = searchKnowledge(query);

  return {
    report,
    classSummary,
    knowledge,
  };
}
