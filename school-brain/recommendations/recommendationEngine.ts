import type { Intent, SchoolRole } from '../models/index';
import type { UserGoal } from '../planner/queryPlanner';

export function selectNextStepRecommendations(
  intent: Intent,
  userGoal?: UserGoal,
  role: SchoolRole = 'teacher',
  queryText: string = ''
): string[] {
  const lower = queryText.toLowerCase();

  if (userGoal === 'comparison' || lower.includes('compare')) {
    return [
      'Compare with class average benchmark',
      'View 3-month performance trend graph',
      'Draft parent progress update letter',
      'Schedule 1-on-1 counselor meeting',
    ];
  }

  if (userGoal === 'diagnostic' || intent === 'who_needs_attention') {
    return [
      'Compare with Mathematics performance',
      'View struggling students roster',
      'Generate targeted intervention plan',
      'Draft parent update notification',
    ];
  }

  if (intent === 'attendance') {
    return [
      'Send attendance alert to absent students',
      'Compare Grade 8 vs Grade 9 attendance',
      'View 30-day attendance trend graph',
      'Draft attendance reminder for parents',
    ];
  }

  if (intent === 'homework') {
    return [
      'List students with overdue homework',
      'Extend homework due date by 2 days',
      'Draft homework reminder for parents',
      'Create revision worksheet',
    ];
  }

  if (intent === 'ptm') {
    return [
      'Send PTM reminder to pending parents',
      'View confirmed attendee list',
      'Generate PTM agenda & talking points',
      'Export PTM schedule summary',
    ];
  }

  if (intent === 'general_education' || intent === 'subject_explanation') {
    return [
      'Generate practice quiz questions',
      'Suggest interactive classroom activity',
      'Explain related concept',
      'Draft lesson plan outline',
    ];
  }

  if (intent === 'bus') {
    return [
      'Call driver Manoj Kumar',
      'View morning pickup stop times',
      'Check bus passenger roster',
      'View route map',
    ];
  }

  // Default fallback recommendations based on role
  if (role === 'teacher') {
    return [
      'Check today\'s class timetable',
      'Review students needing attention',
      'View upcoming school events',
      'Draft lesson plan outline',
    ];
  }

  return [
    'Check today\'s class timetable',
    'View upcoming school calendar',
    'Ask an educational or policy question',
  ];
}
