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
  const lower = studentNameOrId.toLowerCase();
  
  if (lower.includes('rohan') || lower.includes('s-8a-03')) {
    return `Multi-Factor Analysis for Rohan Gupta (Grade 8A):\n` +
      `• Academic Standing: Below average (Unit Test 1 Maths: 48%, Physics: 42%)\n` +
      `• Homework Consistency: 3 pending assignments in Mathematics\n` +
      `• Attendance Trend: 78% overall (declining over past 3 weeks)\n` +
      `• Behaviour Observations: Distracted during math periods; teacher logged 1 concern note\n` +
      `• Diagnostic Insight: Attendance drops strongly correlate with decline in physics & math scores.\n` +
      `• Actionable Plan: 1-on-1 counseling + parent consultation + peer mentoring with Aarav Singh.`;
  }

  if (lower.includes('aarav') || lower.includes('s-8a-01')) {
    return `Multi-Factor Analysis for Aarav Singh (Grade 8A):\n` +
      `• Academic Standing: Excellent (Mathematics: 92%, Physics: 85%, English: 88%)\n` +
      `• Homework Consistency: 100% submitted on time\n` +
      `• Attendance Trend: 94% consistent\n` +
      `• House Points & Conduct: 45 House Points in Vayu House; Praise note logged for peer tutoring\n` +
      `• Health Note: Mild asthma (inhaler registered at infirmary)\n` +
      `• Diagnostic Insight: High engagement across STEM subjects and extracurricular robotics.`;
  }

  return `Student performance analysis relies on cross-referencing attendance, marksheet trends, and teacher observations. Specify a student name (e.g. Rohan Gupta or Aarav Singh) for a deep dive.`;
}
