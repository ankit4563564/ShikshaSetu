import type { DomainContext } from '../context/types';

export const AttendanceAnalysisCapability = {
  id: 'attendance-analysis',
  name: 'Classroom Attendance Analysis',
  description: 'Analyzes student attendance rates, absence patterns, and anomaly drops.',
  canHandle(intent: string) {
    return intent === 'attendance';
  },
  preferredSurface: 'inline' as const,
  getPrompt(ctx: DomainContext) {
    return `Analyze attendance for Class ${ctx.classGrade || '8'}${ctx.classSection || 'A'}`;
  },
};
