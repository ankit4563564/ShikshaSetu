import type { SchoolRole, SchoolBrainContext } from '../models/index';

export interface ProactiveInsightCard {
  id: string;
  type: 'academic' | 'attendance' | 'homework' | 'behaviour' | 'event';
  title: string;
  message: string;
  actionText?: string;
  queryToTrigger?: string;
  severity: 'high' | 'medium' | 'low';
  confidenceScore: number;
  evidenceSources: string[];
}

export function generateProactiveInsights(
  role: SchoolRole = 'teacher',
  context?: SchoolBrainContext,
  minConfidenceThreshold: number = 0.75
): ProactiveInsightCard[] {
  const candidateCards: ProactiveInsightCard[] = [];

  if (role === 'teacher' || role === 'admin' || role === 'principal') {
    candidateCards.push({
      id: 'proactive-1',
      type: 'homework',
      title: 'Homework & Attendance Combined Alert',
      message: '💡 3 students (Rohan Gupta, Kabir Verma, Dev Sharma) show a 35% decline in homework completion combined with attendance drops below 82%.',
      actionText: 'Review Attention Roster',
      queryToTrigger: 'Who needs attention today?',
      severity: 'high',
      confidenceScore: 0.92,
      evidenceSources: ['Homework Submissions Tracker', 'Attendance Records Module', 'Status Flags'],
    });

    candidateCards.push({
      id: 'proactive-2',
      type: 'attendance',
      title: 'Class-wide Attendance & Exam Schedule Correlation',
      message: '💡 Grade 8A attendance dropped to 82% ahead of Mathematics Unit Test 2.',
      actionText: 'View Attendance Breakdown',
      queryToTrigger: 'Why was attendance lower this week?',
      severity: 'medium',
      confidenceScore: 0.85,
      evidenceSources: ['Attendance Records Module', 'Examination Controller Module'],
    });
  } else if (role === 'parent') {
    candidateCards.push({
      id: 'proactive-3',
      type: 'academic',
      title: 'Homework Completion & Assessment Readiness',
      message: '💡 Aarav completed 100% of homework for the week and scored 92% in latest Math test. Practice recommended for Physics Chapter 4.',
      actionText: 'View Test Schedule',
      queryToTrigger: "Show Aarav's exam schedule",
      severity: 'low',
      confidenceScore: 0.88,
      evidenceSources: ['Gradebook & Academic Records', 'Homework Submissions Tracker'],
    });

    candidateCards.push({
      id: 'proactive-4',
      type: 'event',
      title: 'PTM Schedule & Notice Acknowledgment',
      message: '💡 Term 1 Parent-Teacher Meeting is scheduled for Saturday, 25th July. Notice acknowledged by Class Teacher.',
      actionText: 'View PTM Agenda',
      queryToTrigger: 'Show PTM details and venue',
      severity: 'medium',
      confidenceScore: 0.95,
      evidenceSources: ['PTM Portal', 'Notice Board & Circulars'],
    });
  } else if (role === 'student') {
    candidateCards.push({
      id: 'proactive-5',
      type: 'academic',
      title: 'Upcoming Exam & Library Resource Match',
      message: '💡 Mathematics Unit Test 2 is in 3 days. 1 reference book currently issued from library.',
      actionText: 'Practice Quiz',
      queryToTrigger: 'Give practice questions for Math Unit Test',
      severity: 'medium',
      confidenceScore: 0.90,
      evidenceSources: ['Examination Controller Module', 'Central Library Module'],
    });
  }

  // Filter cards: Confidence >= threshold AND at least 2 independent sources
  return candidateCards.filter(
    card => card.confidenceScore >= minConfidenceThreshold && card.evidenceSources.length >= 2
  );
}

