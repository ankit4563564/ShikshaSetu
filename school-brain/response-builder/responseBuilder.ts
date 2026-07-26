import type { BrainResponse, ConfidenceLevel, Intent, SchoolRole } from '../models/index';
import { formatForDisplay, sanitizeOutput, addConfidenceFooter } from '../formatter/responseFormatter';
import { selectNextStepRecommendations } from '../recommendations/recommendationEngine';

// ─────────────────────────────────────────────
// Response Builder Engine
// Assembles the final response with:
// - Intelligent formatting
// - Recommendation Engine next steps
// - Confidence-aware output & transparent source attribution
// ─────────────────────────────────────────────

export function buildFinalResponse(
  rawText: string,
  sources: string[],
  intent: Intent,
  confidence: ConfidenceLevel = 'MEDIUM',
  suggestedFollowUps?: string[],
  role?: SchoolRole,
  queryText?: string,
  missingFields?: string[]
): BrainResponse {
  // Format and sanitize the output
  const cleanedText = sanitizeOutput(rawText);
  const formatted = formatForDisplay(cleanedText, intent, role || 'teacher', confidence);

  // Build transparent "Based on" sources and "Not included" missing data block
  let attributedText = formatted.text;
  const verifiedSourcesList = sources.length > 0 ? sources : ['School Knowledge Base'];
  
  if (!attributedText.includes('Based on')) {
    attributedText += `\n\n──────────────────────────────────────\n📌 **Based on verified sources**:\n${verifiedSourcesList.map(s => `  ✓ ${s}`).join('\n')}`;
  }

  if (missingFields && missingFields.length > 0 && !attributedText.includes('Not included')) {
    attributedText += `\n\n⚠️ **Not included in current records**:\n${missingFields.map(m => `  • ${m}`).join('\n')}`;
  }

  const withFooter = addConfidenceFooter(attributedText, confidence, sources);

  // Run Recommendation Engine to derive high-value next-step follow-ups
  const dynamicRecommendations = selectNextStepRecommendations(intent, undefined, role || 'teacher', queryText || '');
  const finalFollowUps = (suggestedFollowUps && suggestedFollowUps.length > 0)
    ? suggestedFollowUps
    : dynamicRecommendations;

  return {
    text: withFooter.trim(),
    sources: verifiedSourcesList,
    suggestedFollowUps: finalFollowUps.slice(0, 4),
    source: intent,
    confidence,
  };
}


function getDefaultFollowUps(intent: Intent): string[] {
  const followUpMap: Partial<Record<Intent, string[]>> = {
    who_needs_attention: [
      'Draft a message for their parents',
      'Schedule a 1-on-1 counseling session',
      "Compare with last month's attendance",
    ],
    attendance: [
      'View 30-day attendance trend graph',
      'Send attendance alert to absent students',
      'Compare Grade 8 vs Grade 9 attendance',
    ],
    homework: [
      'List students with pending submissions',
      'Extend homework due date by 2 days',
      'Draft homework reminder for parents',
    ],
    timetable: [
      'View full weekly timetable for Grade 8A',
      'Check free periods for teacher substitute',
      'Show classroom allocation map',
    ],
    exams: [
      "View syllabus topics for tomorrow's exam",
      'Check exam hall seating plan',
      'Download previous year question papers',
    ],
    marks: [
      'Show class-wise performance comparison',
      'View subject-wise topper list',
      'Analyze grade distribution',
    ],
    library: [
      'Send reminder to students with overdue books',
      'Check available copies of Physics books',
      'Renew borrowed book for another 14 days',
    ],
    bus: [
      'Call Bus 3 driver Manoj Kumar',
      'View morning pickup stop times',
      'Check Bus 1 route passenger count',
    ],
    canteen: [
      "View tomorrow's menu",
      'Check nutritional information',
      'See this week\'s specials',
    ],
    events: [
      'Show full school calendar',
      'Register for Sports Day events',
      'View event venue and timing',
    ],
    sports: [
      'View Sports Day schedule',
      'Check team registrations',
      'See house points leaderboard',
    ],
    rules: [
      'Show uniform specifications',
      'View discipline escalation process',
      'Check visitor pass requirements',
    ],
    faculty: [
      'Show teacher workload analysis',
      'View subject-wise teacher allocation',
      'Check office hours schedule',
    ],
    student_performance: [
      'View 3-month performance trend',
      'Compare with class average',
      'Draft parent update letter',
    ],
    behaviour: [
      'View full behaviour history',
      'Log a new observation note',
      'Escalate to counselor',
    ],
    fees: [
      'View quarterly fee breakdown',
      'Check pending payment deadlines',
      'Download fee receipt',
    ],
    health: [
      'View allergy list for the class',
      'Check infirmary visit logs',
      'Update medical records',
    ],
    ptm: [
      'Send PTM reminder to pending parents',
      'View confirmed attendees',
      'Generate PTM agenda',
    ],
    clubs: [
      'View club meeting schedule',
      'Check membership strength',
      'Register for a new club',
    ],
    announcements: [
      'Post a new notice',
      'View notice acknowledgement status',
      'Archive old notices',
    ],
    teacher_workload: [
      'Compare workload across department',
      'Suggest substitute allocation',
      'View leave calendar',
    ],
    greeting: [
      'Show today\'s class timetable',
      'Check if any students need attention',
      'View upcoming school events',
    ],
    small_talk: [
      'Check today\'s class timetable',
      'View upcoming school events',
      'Ask an educational question',
    ],
    general_education: [
      'Explain another concept',
      'Help plan a lesson',
      'Suggest teaching strategies',
    ],
    motivation: [
      'Suggest engagement activities',
      'Draft an encouraging message',
      'View student progress trends',
    ],
    career_guidance: [
      'Explore engineering streams',
      'Compare science vs commerce',
      'View entrance exam preparation tips',
    ],
    subject_explanation: [
      'Explain a related concept',
      'Give practice problems',
      'Suggest study resources',
    ],
    achievements: [
      'View house points leaderboard',
      'Check recent awards',
      'Nominate for achievement',
    ],
    administrative: [
      'Download admission form',
      'Check transfer certificate status',
      'View school timings',
    ],
    unknown: [
      'Check today\'s class timetable',
      'View upcoming school events',
      'Ask an educational or lesson planning question',
    ],
  };

  return followUpMap[intent] || followUpMap.unknown!;
}
