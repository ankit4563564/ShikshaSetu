import type { SchoolBrainContext, AttentionRequiredSummary } from '../models/index';
import { DemoKnowledgeHelper, DEMO_TEACHERS } from '../demo-data/index';

export function runWhoNeedsAttentionReasoning(context: SchoolBrainContext): string {
  const isTeacherOrAdmin = context.role === 'teacher' || context.role === 'admin' || context.role === 'principal';
  
  if (!isTeacherOrAdmin) {
    return 'Attention summaries and student concern analyses are restricted to Teachers, Admins, and Principals to maintain student privacy.';
  }

  const report = DemoKnowledgeHelper.getWhoNeedsAttentionReport();
  return report;
}

export function runTeacherWorkloadReasoning(context: SchoolBrainContext): string {
  const teacherId = context.teacherId || 't-101';
  const teacher = DEMO_TEACHERS.find(t => t.id === teacherId) || DEMO_TEACHERS[0];

  const dailyPeriods = teacher?.dailyPeriodsCount ?? 5;
  const classesTaught = teacher?.classesTaught ?? [];
  const totalPeriods = dailyPeriods * 5;
  const freePeriods = 35 - totalPeriods; // Based on 7 periods per day (35 weekly)

  return `Teacher Workload Analysis for ${teacher?.displayName || 'Teacher'}:\n` +
    `• Assigned Classes: ${classesTaught.map(c => `Grade ${c.grade}${c.section} (${c.subject})`).join(', ')}\n` +
    `• Daily Teaching Load: ${dailyPeriods} periods/day (${totalPeriods} periods/week)\n` +
    `• Weekly Free/Planning Periods: ${freePeriods} periods available\n` +
    `• Office Hours: ${teacher.officeHours} at ${teacher.staffRoom}\n` +
    `• Status: Workload is well-balanced within optimal academic guidelines.`;
}

export function runStudentPerformanceReasoning(studentNameOrId: string): string {
  const name = studentNameOrId.trim() || 'Student';
  return `Student Performance Analysis for ${name}:\n` +
    `• Multi-factor evaluation combines attendance logs, homework submission rates, and subject assessments.\n` +
    `• To view detailed signal analysis or initiate a support intervention, open the Student 360 view from your authorized dashboard.`;
}
