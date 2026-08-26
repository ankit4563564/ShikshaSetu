import type { DomainContext } from '../context/types';

export interface UIAdapterProps {
  appName: string;
  roleBadge: string;
  greetingTitle: string;
  greetingSubtitle: string;
  placeholder: string;
  contextTag: string;
  suggestions: { title: string; prompt: string; icon: string }[];
  quickActions: string[];
}

export function adaptContextToUI(ctx: DomainContext): UIAdapterProps {
  const isTeacher = ctx.role === 'teacher' || (ctx.role === 'landing' && ctx.demoRole === 'teacher');
  const isParent = ctx.role === 'parent' || (ctx.role === 'landing' && ctx.demoRole === 'parent');
  const isStudent = ctx.role === 'student' || (ctx.role === 'landing' && ctx.demoRole === 'student');
  const isAdmin = ctx.role === 'admin' || (ctx.role === 'landing' && ctx.demoRole === 'admin');

  const grade = ctx.classGrade || '8';
  const section = ctx.classSection || 'A';
  const classLabel = `Class ${grade}${section}`;
  const student = ctx.studentName || 'Priya Patel';

  if (isTeacher) {
    return {
      appName: 'SchoolMitra',
      roleBadge: `${classLabel} · Teacher`,
      greetingTitle: 'Good morning, Ms. Mehra 👋',
      greetingSubtitle: 'What would you like to know about your class?',
      placeholder: `Ask anything about ${classLabel}...`,
      contextTag: `Using ${classLabel} data`,
      suggestions: [
        { title: 'Who needs my attention?', prompt: 'Which students need my attention today?', icon: '🎯' },
        { title: 'What should I teach next?', prompt: 'What concept or topic should I teach or review next?', icon: '📚' },
        { title: `How is ${classLabel} doing?`, prompt: `How is ${classLabel} performing this week?`, icon: '📊' },
        { title: "Show today's attendance", prompt: "Show today's attendance summary and anomalies.", icon: '📅' },
        { title: 'Any homework concerns?', prompt: 'Are there any pending or struggling homework submissions?', icon: '📖' },
      ],
      quickActions: ['Who needs attention?', 'What to teach next?', "Today's attendance", 'Homework concerns'],
    };
  }

  if (isParent) {
    return {
      appName: 'SchoolMitra',
      roleBadge: `${student} · Parent`,
      greetingTitle: `Hello, ${student}'s Family 👋`,
      greetingSubtitle: 'How can I help with your child’s school day?',
      placeholder: `Ask about ${student}'s school day, homework, or bus...`,
      contextTag: `Using ${student}'s school records`,
      suggestions: [
        { title: `How is ${student} doing?`, prompt: `How is ${student} doing in class and homework?`, icon: '📊' },
        { title: 'Where is the school bus?', prompt: 'Where is the school bus right now and ETA?', icon: '🚌' },
        { title: "What is today's homework?", prompt: `What homework was assigned to ${student} today?`, icon: '📖' },
        { title: 'Any home practice ideas?', prompt: `What can we practice at home to support ${student}?`, icon: '💡' },
      ],
      quickActions: ['Child progress', 'Bus location', "Today's homework", 'Home practice'],
    };
  }

  if (isStudent) {
    return {
      appName: 'SchoolMitra',
      roleBadge: `${classLabel} · Student`,
      greetingTitle: `Hi ${student} 👋`,
      greetingSubtitle: 'What would you like to learn or revise today?',
      placeholder: 'Ask about any concept, homework, or quiz...',
      contextTag: `Using ${classLabel} syllabus & notes`,
      suggestions: [
        { title: 'Explain Equivalent Fractions', prompt: 'Explain Equivalent Fractions with a simple worked example.', icon: '💡' },
        { title: '3 Quick Practice Questions', prompt: 'Give me 3 quick practice questions to test my understanding.', icon: '🎯' },
        { title: "What homework is due?", prompt: 'What homework or tasks are due this week?', icon: '📖' },
        { title: '1-Minute Cheat Sheet', prompt: 'Give me a 1-minute revision summary for my upcoming test.', icon: '⚡' },
      ],
      quickActions: ['Explain a topic', '3 Practice questions', 'Due homework', 'Quick cheat sheet'],
    };
  }

  if (isAdmin) {
    return {
      appName: 'SchoolMitra',
      roleBadge: 'Campus Administration',
      greetingTitle: 'Hello, Administrator 👋',
      greetingSubtitle: 'What campus operations would you like to review?',
      placeholder: 'Ask about attendance rates, bus fleets, or gate passes...',
      contextTag: 'Using campus telemetry records',
      suggestions: [
        { title: "Today's attendance rate", prompt: "What is today's overall school attendance rate?", icon: '📊' },
        { title: 'Live bus fleet status', prompt: 'Show active bus routes and arrival status.', icon: '🚌' },
        { title: 'Gate entry summary', prompt: 'Summarize morning gate scans and student safety checks.', icon: '🛡️' },
        { title: 'Fee collection updates', prompt: 'Show weekly fee collection status and pending invoices.', icon: '💳' },
      ],
      quickActions: ['Campus attendance', 'Bus fleet', 'Gate security', 'Fee collection'],
    };
  }

  // Universal / Landing default
  return {
    appName: 'SchoolMitra',
    roleBadge: 'Learning Ecosystem Assistant',
    greetingTitle: 'Hello there 👋',
    greetingSubtitle: 'What would you like to know about ShikshaSetu?',
    placeholder: 'Ask anything about the school ecosystem...',
    contextTag: 'Using verified school data',
    suggestions: [
      { title: 'How does SchoolMitra help teachers?', prompt: 'How does ShikshaSetu help teachers understand their class?', icon: '👩‍🏫' },
      { title: 'How does the learning loop work?', prompt: 'Explain the 58% to 78% continuous learning loop.', icon: '🔄' },
      { title: 'What do parents see?', prompt: 'What insights do parents receive about their child?', icon: '👨‍👩‍👧' },
      { title: 'How does live transport work?', prompt: 'How does live bus GPS tracking and driver telemetry work?', icon: '🚌' },
    ],
    quickActions: ['Teacher features', 'Learning loop', 'Parent insights', 'Bus tracking'],
  };
}
