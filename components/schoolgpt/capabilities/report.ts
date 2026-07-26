import type { DomainContext } from '../context/types';

export const StudentReportCapability = {
  id: 'student-report',
  name: 'Student Academic & Behavioral Report',
  description: 'Generates comprehensive student performance summary across attendance, marks, and homework.',
  canHandle(intent: string) {
    return intent === 'student_performance' || intent === 'marks' || intent === 'who_needs_attention';
  },
  preferredSurface: 'drawer' as const,
  getPrompt(ctx: DomainContext) {
    return `Generate complete academic report for ${ctx.studentName || 'student'}`;
  },
};
