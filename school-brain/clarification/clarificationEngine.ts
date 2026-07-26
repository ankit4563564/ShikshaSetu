import type { ClassifiedIntent, SchoolBrainContext } from '../models/index';

export interface ClarificationRequest {
  isAmbiguous: boolean;
  question: string;
  options: { label: string; queryToTrigger: string }[];
}

export function evaluateClarificationNeed(
  classified: ClassifiedIntent,
  queryText: string,
  context: SchoolBrainContext
): ClarificationRequest | null {
  const lower = queryText.trim().toLowerCase();

  // "Show report" or "report" without specifying student, grade, or report type
  if (lower === 'show report' || lower === 'report' || lower === 'get report' || lower === 'view report') {
    return {
      isAmbiguous: true,
      question: 'Which report would you like to view?',
      options: [
        { label: 'Student Performance Report', queryToTrigger: "Show Aarav's report" },
        { label: 'Class Attendance Report', queryToTrigger: 'Show attendance report for Class 8A' },
        { label: 'Pending Homework Report', queryToTrigger: 'Which homework is overdue?' },
        { label: 'PTM Summary Report', queryToTrigger: 'Generate PTM summary for Grade 8A' },
      ],
    };
  }

  // "Compare" without specifying who to compare
  if (lower === 'compare' || lower === 'comparison' || lower === 'compare students') {
    return {
      isAmbiguous: true,
      question: 'Which students would you like to compare?',
      options: [
        { label: 'Compare Aarav and Rohan', queryToTrigger: 'Compare Aarav and Rohan' },
        { label: 'Compare Class 8A vs Class 8B', queryToTrigger: 'Compare Grade 8A vs Grade 8B attendance' },
      ],
    };
  }

  // Low confidence intent without entity parameters
  if (classified.confidence < 0.35 && classified.entities.length === 0 && lower.split(' ').length <= 2) {
    return {
      isAmbiguous: true,
      question: `I want to make sure I get you the right information. What are you looking for?`,
      options: [
        { label: "Today's Timetable", queryToTrigger: "What is today's timetable?" },
        { label: 'Students Needing Attention', queryToTrigger: 'Who needs attention today?' },
        { label: 'Overdue Homework', queryToTrigger: 'Which homework is overdue?' },
        { label: 'School Calendar & Events', queryToTrigger: 'Show upcoming school events' },
      ],
    };
  }

  return null;
}
