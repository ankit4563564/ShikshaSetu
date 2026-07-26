import type { DomainContext } from '../context/types';

export interface UIAdapterProps {
  greeting: string;
  placeholder: string;
  contextBanner: string;
  suggestions: { title: string; prompt: string; icon: string; bg: string }[];
  quickActions: string[];
}

export function adaptContextToUI(ctx: DomainContext): UIAdapterProps {
  const student = ctx.studentName || 'Aarav Sharma';
  const cls = `${ctx.classGrade || '8'}${ctx.classSection || 'A'}`;

  if (ctx.role === 'parent') {
    return {
      greeting: `Welcome, ${student}'s Parent 👋`,
      placeholder: `Ask about ${student}'s safety, attendance, or bus...`,
      contextBanner: `Viewing Safety & Progress for ${student}`,
      suggestions: [
        { title: 'Child Performance', prompt: `Show ${student}'s academic report.`, icon: '👤', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
        { title: 'Safety & Arrival', prompt: 'Was my child safe today? Show arrival logs.', icon: '🛡️', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        { title: 'Where is Bus?', prompt: 'Where is the school bus right now?', icon: '🚌', bg: 'bg-rose-50 text-rose-700 border-rose-100' },
      ],
      quickActions: ['Attendance Rate', 'Overdue Homework', 'Bus Live Location', 'Teacher Note'],
    };
  }

  switch (ctx.module) {
    case 'attendance':
      return {
        greeting: `Classroom Attendance • Class ${cls} 👋`,
        placeholder: `Ask about Class ${cls} attendance trends or drop reasons...`,
        contextBanner: `Viewing Attendance • Class ${cls}`,
        suggestions: [
          { title: 'Low Attendance', prompt: `Who has low attendance this week in Class ${cls}?`, icon: '🎯', bg: 'bg-rose-50 text-rose-700 border-rose-100' },
          { title: 'Attendance Drop', prompt: 'Explain Monday attendance drop.', icon: '📊', bg: 'bg-amber-50 text-amber-700 border-amber-100' },
          { title: 'Draft Reminder', prompt: `Generate attendance reminder for Class ${cls} parents.`, icon: '✉️', bg: 'bg-purple-50 text-purple-700 border-purple-100' },
        ],
        quickActions: ['Low Attendance List', 'Compare 8A vs 8B', 'Draft Parent Notice', 'Monthly Average'],
      };

    case 'marks':
      return {
        greeting: `Academic Marks & Assessments • Class ${cls} 👋`,
        placeholder: `Ask about assessment marks or growth trends for Class ${cls}...`,
        contextBanner: `Viewing Marks • Class ${cls}`,
        suggestions: [
          { title: 'Term Comparison', prompt: 'Compare Term 1 and Term 3 science marks.', icon: '📈', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { title: 'Top Improvers', prompt: `Which students improved most in Class ${cls}?`, icon: '🌟', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
          { title: 'Support Needed', prompt: `Who needs academic support in Science?`, icon: '⚠️', bg: 'bg-rose-50 text-rose-700 border-rose-100' },
        ],
        quickActions: ['Term 1 vs Term 3', 'Subject Performance', 'Support List', 'Grade Breakdown'],
      };

    case 'homework':
      return {
        greeting: `Homework Submissions & Tasks 👋`,
        placeholder: `Ask about pending or overdue homework tasks...`,
        contextBanner: `Viewing Homework • Class ${cls}`,
        suggestions: [
          { title: 'Pending Homework', prompt: `Who has pending homework in Class ${cls}?`, icon: '📅', bg: 'bg-amber-50 text-amber-700 border-amber-100' },
          { title: 'Draft Reminder', prompt: 'Generate homework reminder for Class 8A parents.', icon: '✉️', bg: 'bg-purple-50 text-purple-700 border-purple-100' },
          { title: 'Submission Rate', prompt: 'What is the homework completion rate this week?', icon: '📊', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        ],
        quickActions: ['Overdue List', 'Draft Reminder', 'Submission Rate', 'Science Task'],
      };

    default:
      return {
        greeting: `Good Day, Educator 👋`,
        placeholder: `Ask about a student, attendance, marks, or PTM...`,
        contextBanner: `Viewing Active Workspace • Class ${cls}`,
        suggestions: [
          { title: 'Support Radar', prompt: 'Which students need support today?', icon: '🎯', bg: 'bg-rose-50 text-rose-700 border-rose-100' },
          { title: 'Student Report', prompt: `Show ${student}'s performance report.`, icon: '👤', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
          { title: 'PTM Draft', prompt: `Generate PTM summary update for Class ${cls}.`, icon: '✉️', bg: 'bg-purple-50 text-purple-700 border-purple-100' },
        ],
        quickActions: ['Support List', 'Student Profile', 'Attendance Rate', 'Draft PTM'],
      };
  }
}
