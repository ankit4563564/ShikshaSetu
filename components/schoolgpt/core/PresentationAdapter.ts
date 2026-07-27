import type { DomainContext } from '../context/types';

export interface UIAdapterProps {
  greeting: string;
  placeholder: string;
  contextBanner: string;
  suggestions: { title: string; prompt: string; icon: string; bg: string }[];
  quickActions: string[];
}

export function adaptContextToUI(ctx: DomainContext): UIAdapterProps {
  if (ctx.role === 'landing') {
    if (ctx.isDemoMode && ctx.demoRole) {
      if (ctx.demoRole === 'parent') {
        return {
          greeting: `Parent Experience`,
          placeholder: `Ask about Aarav's bus, homework, or attendance...`,
          contextBanner: `✓ Demo Context Loaded • Child: Aarav Sharma (Grade 8A)`,
          suggestions: [
            { title: 'Has Aarav reached school?', prompt: 'Has Aarav reached school?', icon: '🛡️', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { title: 'Where is the bus?', prompt: 'Where is the bus?', icon: '🚌', bg: 'bg-amber-50 text-amber-700 border-amber-100' },
            { title: "Today's homework", prompt: "Today's homework", icon: '📚', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
            { title: 'Attendance record', prompt: 'Show Aarav attendance summary', icon: '📊', bg: 'bg-purple-50 text-purple-700 border-purple-100' },
          ],
          quickActions: ['Has Aarav reached school?', 'Where is the bus?', "Today's homework", 'Attendance'],
        };
      }
      if (ctx.demoRole === 'teacher') {
        return {
          greeting: `Teacher Experience`,
          placeholder: `Ask about Class 8A performance or attention radar...`,
          contextBanner: `✓ Demo Context Loaded • Teacher | Class 8A (32 Students)`,
          suggestions: [
            { title: 'Attention Needed', prompt: 'Which students need attention today?', icon: '🎯', bg: 'bg-rose-50 text-rose-700 border-rose-100' },
            { title: 'PTM Summary', prompt: 'Generate PTM summary.', icon: '✉️', bg: 'bg-purple-50 text-purple-700 border-purple-100' },
            { title: 'Explain Homework', prompt: "Explain Aarav's homework.", icon: '📚', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
            { title: 'Compare Attendance', prompt: 'Compare attendance.', icon: '📊', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          ],
          quickActions: ['Which students need attention today?', 'Generate PTM summary', "Explain Aarav's homework", 'Compare attendance'],
        };
      }
      if (ctx.demoRole === 'student') {
        return {
          greeting: `Student Experience`,
          placeholder: `Ask for homework help, revision, or exam schedules...`,
          contextBanner: `✓ Demo Context Loaded • Student | Grade 8A`,
          suggestions: [
            { title: "Today's homework", prompt: "Today's homework", icon: '📚', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
            { title: 'Upcoming exams', prompt: 'Upcoming exams', icon: '📅', bg: 'bg-amber-50 text-amber-700 border-amber-100' },
            { title: 'Explain Chapter 5', prompt: 'Explain Chapter 5', icon: '💡', bg: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            { title: 'Practice questions', prompt: 'Practice questions', icon: '🎯', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          ],
          quickActions: ["Today's homework", 'Upcoming exams', 'Explain Chapter 5', 'Practice questions'],
        };
      }
      if (ctx.demoRole === 'admin') {
        return {
          greeting: `School Administration`,
          placeholder: `Ask about campus operations, transport, or analytics...`,
          contextBanner: `✓ Demo Context Loaded • Admin | Campus Telemetry`,
          suggestions: [
            { title: 'Attendance trends', prompt: 'Attendance trends', icon: '📊', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { title: 'Transport overview', prompt: 'Transport overview', icon: '🚌', bg: 'bg-amber-50 text-amber-700 border-amber-100' },
            { title: 'Teacher workload', prompt: 'Teacher workload', icon: '👩‍🏫', bg: 'bg-purple-50 text-purple-700 border-purple-100' },
            { title: 'School analytics', prompt: 'School analytics', icon: '📈', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
          ],
          quickActions: ['Attendance trends', 'Transport overview', 'Teacher workload', 'School analytics'],
        };
      }
    }

    return {
      greeting: `✨ SchoolGPT`,
      placeholder: `Ask what SchoolGPT can do or select an experience below...`,
      contextBanner: `Universal Product Companion • Connected School Ecosystem`,
      suggestions: [
        { title: 'What can SchoolGPT do?', prompt: 'What can SchoolGPT do?', icon: '✨', bg: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
        { title: 'Connected school day', prompt: 'Show me a connected school day.', icon: '🏫', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
        { title: 'Live bus tracking', prompt: 'How does live bus tracking work?', icon: '🚌', bg: 'bg-amber-50 text-amber-700 border-amber-100' },
        { title: 'Save teacher time', prompt: 'How do teachers save time?', icon: '⏱️', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        { title: 'Better than WhatsApp', prompt: 'Why is this better than WhatsApp groups?', icon: '💬', bg: 'bg-purple-50 text-purple-700 border-purple-100' },
        { title: 'AI for schools', prompt: 'How does SchoolGPT use AI?', icon: '🧠', bg: 'bg-rose-50 text-rose-700 border-rose-100' },
      ],
      quickActions: [
        'What can SchoolGPT do?',
        'How does live bus tracking work?',
        'How do teachers save time?',
        'How does SchoolGPT use AI?',
        'Show me a connected school day.',
        'Why is this better than WhatsApp groups?',
      ],
    };
  }

  const student = ctx.studentName || 'Aarav';
  const cls = `${ctx.classGrade || '8'}${ctx.classSection || 'A'}`;

  if (ctx.role === 'parent') {
    return {
      greeting: `Hi, ${student}'s Parent 👋`,
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

  if (ctx.role === 'teacher') {
    return {
      greeting: `Hi, Ms. Mehra (Class ${cls} Teacher) 👋`,
      placeholder: `Ask about Class ${cls} attendance, marks, or PTM...`,
      contextBanner: `Viewing Active Workspace • Class ${cls}`,
      suggestions: [
        { title: 'Support Radar', prompt: 'Which students need support today?', icon: '🎯', bg: 'bg-rose-50 text-rose-700 border-rose-100' },
        { title: 'Student Report', prompt: `Show ${student}'s performance report.`, icon: '👤', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
        { title: 'PTM Draft', prompt: `Generate PTM summary update for Class ${cls}.`, icon: '✉️', bg: 'bg-purple-50 text-purple-700 border-purple-100' },
      ],
      quickActions: ['Support List', 'Student Profile', 'Attendance Rate', 'Draft PTM'],
    };
  }

  if (ctx.role === 'admin') {
    return {
      greeting: `Hi, Campus Administrator 👋`,
      placeholder: `Ask about campus telemetry, transport, or gate logs...`,
      contextBanner: `Viewing School-Wide Mission Control`,
      suggestions: [
        { title: 'Campus Health Index', prompt: 'What is today\'s overall campus attendance?', icon: '📊', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        { title: 'Bus Fleet Status', prompt: 'Check live transport fleet telemetry.', icon: '🚌', bg: 'bg-amber-50 text-amber-700 border-amber-100' },
        { title: 'Gate Scan Summary', prompt: 'Summarize morning gate entry scans.', icon: '🚨', bg: 'bg-rose-50 text-rose-700 border-rose-100' },
      ],
      quickActions: ['Campus Attendance', 'Bus Fleet', 'Gate Logs', 'Fee Collections'],
    };
  }

  if (ctx.role === 'driver') {
    return {
      greeting: `Hi, Transit Driver 👋`,
      placeholder: `Ask about assigned route stops or student manifest...`,
      contextBanner: `Viewing Saket Route #4 Telemetry`,
      suggestions: [
        { title: 'Route Schedule', prompt: 'Show my bus route stops and timings.', icon: '🚌', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
        { title: 'Passenger Roster', prompt: 'Show assigned student list for Route #4.', icon: '📋', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      ],
      quickActions: ['Route Stops', 'Students Onboard', 'Emergency Contact'],
    };
  }

  if (ctx.role === 'gate') {
    return {
      greeting: `Hi, Gate Security 👋`,
      placeholder: `Ask about digital gate passes or visitor approvals...`,
      contextBanner: `Viewing Gate #2 Security Console`,
      suggestions: [
        { title: 'Verify Gate Pass', prompt: `Verify digital pickup gate pass for ${student}.`, icon: '🔑', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        { title: 'Today Scan Log', prompt: 'Show today gate entry count and status.', icon: '⏱️', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
      ],
      quickActions: ['Verify Pass', 'Exit Log', 'Visitor Pass'],
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
        greeting: `Hi, ${student} 👋`,
        placeholder: `Ask about a topic, attendance, marks, or homework...`,
        contextBanner: `Viewing Active Workspace • Class ${cls}`,
        suggestions: [
          { title: 'Explain Chapter', prompt: 'Explain Physics Chapter 4 in simple terms.', icon: '📚', bg: 'bg-sky-50 text-sky-700 border-sky-100' },
          { title: 'Practice Quiz', prompt: 'Give me 3 practice quiz questions.', icon: '🎯', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        ],
        quickActions: ['Explain Homework', 'Practice Quiz', 'Today Schedule', 'Library Books'],
      };
  }
}
