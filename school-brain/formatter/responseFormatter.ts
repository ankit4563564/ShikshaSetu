import type { Intent, ConfidenceLevel, SchoolRole } from '../models/index';

// ─────────────────────────────────────────────
// Response Formatter Engine
// Transforms raw data into beautiful, scannable, context-aware output
// ─────────────────────────────────────────────

export interface FormattedOutput {
  text: string;
  hasStructuredData: boolean;
  formatting: 'prose' | 'list' | 'table' | 'report' | 'narrative';
}

/**
 * Formats raw retrieval data into polished, role-aware output.
 * Uses intent-specific formatting strategies.
 */
export function formatForDisplay(
  rawData: string,
  intent: Intent,
  role: SchoolRole,
  confidence: ConfidenceLevel
): FormattedOutput {
  if (!rawData || rawData.trim().length === 0) {
    return {
      text: getEmptyStateFallback(intent, role),
      hasStructuredData: false,
      formatting: 'prose',
    };
  }

  // Detect if data already has structure (bullets, colons, newlines)
  const hasStructure = rawData.includes('•') || rawData.includes('\n') || rawData.includes(':');

  // Apply intent-specific formatting
  switch (intent) {
    case 'who_needs_attention':
      return formatAttentionReport(rawData, role);
    case 'timetable':
      return formatTimetable(rawData);
    case 'attendance':
      return formatAttendance(rawData, role);
    case 'homework':
      return formatHomework(rawData, role);
    case 'exams':
    case 'marks':
      return formatExams(rawData, role);
    case 'library':
      return formatLibrary(rawData);
    case 'bus':
      return formatTransport(rawData);
    case 'events':
    case 'sports':
      return formatEvents(rawData);
    case 'canteen':
      return formatCanteen(rawData);
    case 'rules':
      return formatPolicies(rawData);
    case 'faculty':
      return formatFaculty(rawData);
    case 'student_performance':
      return formatPerformanceReport(rawData);
    case 'greeting':
    case 'small_talk':
      return { text: rawData, hasStructuredData: false, formatting: 'prose' };
    default:
      return {
        text: rawData,
        hasStructuredData: hasStructure,
        formatting: hasStructure ? 'list' : 'prose',
      };
  }
}

function formatAttentionReport(data: string, role: SchoolRole): FormattedOutput {
  // Already well-structured from the reasoner, add summary header
  const studentCount = (data.match(/•/g) || []).length;

  const header = studentCount > 0
    ? `📊 Attention Report — ${studentCount} student${studentCount > 1 ? 's' : ''} flagged\n\n`
    : '';

  return {
    text: header + data,
    hasStructuredData: true,
    formatting: 'report',
  };
}

function formatTimetable(data: string): FormattedOutput {
  return {
    text: `📅 ${data}`,
    hasStructuredData: true,
    formatting: 'table',
  };
}

function formatAttendance(data: string, role: SchoolRole): FormattedOutput {
  return {
    text: data,
    hasStructuredData: data.includes('%'),
    formatting: data.includes('\n') ? 'list' : 'prose',
  };
}

function formatHomework(data: string, role: SchoolRole): FormattedOutput {
  const pendingCount = (data.match(/pending|missed|not submitted/gi) || []).length;

  return {
    text: data,
    hasStructuredData: true,
    formatting: 'list',
  };
}

function formatExams(data: string, role: SchoolRole): FormattedOutput {
  return {
    text: data,
    hasStructuredData: true,
    formatting: data.includes('%') ? 'report' : 'list',
  };
}

function formatLibrary(data: string): FormattedOutput {
  return {
    text: `📚 ${data}`,
    hasStructuredData: true,
    formatting: 'list',
  };
}

function formatTransport(data: string): FormattedOutput {
  return {
    text: `🚌 ${data}`,
    hasStructuredData: true,
    formatting: 'list',
  };
}

function formatEvents(data: string): FormattedOutput {
  return {
    text: data,
    hasStructuredData: true,
    formatting: 'list',
  };
}

function formatCanteen(data: string): FormattedOutput {
  return {
    text: `🍽️ ${data}`,
    hasStructuredData: true,
    formatting: 'list',
  };
}

function formatPolicies(data: string): FormattedOutput {
  return {
    text: data,
    hasStructuredData: true,
    formatting: 'report',
  };
}

function formatFaculty(data: string): FormattedOutput {
  return {
    text: data,
    hasStructuredData: true,
    formatting: 'list',
  };
}

function formatPerformanceReport(data: string): FormattedOutput {
  return {
    text: `📈 ${data}`,
    hasStructuredData: true,
    formatting: 'report',
  };
}

/**
 * Returns a natural, helpful fallback when no data is found,
 * instead of saying "No data found" or "Error".
 */
function getEmptyStateFallback(intent: Intent, role: SchoolRole): string {
  const fallbacks: Partial<Record<Intent, string>> = {
    attendance: "I couldn't locate specific attendance records for this query right now. You can check the Attendance module on the portal for live data, or ask me about a specific student or class.",
    homework: "I don't have homework records matching that query at the moment. Try asking about a specific subject or student — for example, 'Who missed Maths homework?'",
    timetable: "I couldn't find timetable data for that specific request. Try asking 'What's tomorrow's timetable for 8A?' or 'Show me the weekly schedule.'",
    exams: "No exam data matched your query. You can ask about upcoming exams for a grade, or specific exam results — for example, 'When is the next Science exam for Grade 8?'",
    marks: "I couldn't find marks or grades for that query. Try specifying a student name and subject, like 'Show Aarav's Maths marks.'",
    library: "No library records matched your query. You can ask things like 'Who has library dues?' or 'What books has Aarav borrowed?'",
    bus: "I couldn't find transport data for that query. Try asking about a specific bus number — like 'How many students use Bus 3?' or 'What is Bus 1's route?'",
    events: "No events matched your search. Ask about upcoming events, Sports Day, or the school calendar to get started.",
    canteen: "I couldn't find canteen information for that. Try asking 'What's today's canteen menu?' for the latest.",
    rules: "I couldn't find a specific policy matching your query. Ask about uniform rules, discipline policy, visitor guidelines, or fee structure.",
    faculty: "I couldn't find teacher information matching that. Try asking 'Who teaches Class 8A?' or 'Tell me about the Science department.'",
    who_needs_attention: "I couldn't generate an attention report right now. This analysis requires teacher or admin access to student records.",
    student_performance: "I couldn't find performance data for that student. Specify a name like 'How is Rohan Gupta doing?' for a detailed analysis.",
    clubs: "No club information matched your query. Try asking 'What clubs are available?' or 'When does Robotics Club meet?'",
    fees: "I couldn't locate fee records for that query. Ask about fee structure, pending dues, or payment deadlines.",
    health: "Health records are restricted. Please contact the school infirmary directly or ask about general health policies.",
    ptm: "I couldn't find PTM information. Try asking 'When is the next PTM?' or 'Which parents haven't replied?'",
    sports: "No sports data matched your search. Ask about Sports Day, team schedules, or athletic competitions.",
    announcements: "No recent announcements matched your query. Try asking 'Show recent notices' for the latest updates.",
    greeting: `Hello! I'm SchoolGPT — your intelligent School Operating System assistant. How can I help you today?`,
    small_talk: "I'm here to help with anything school-related! Try asking about classes, homework, attendance, exams, or school events.",
    general_education: "I'd be happy to help with educational questions! Could you rephrase or be more specific about the topic you'd like me to explain?",
    motivation: "I'm here to help motivate and support! What specific area would you like encouragement or strategies for?",
    career_guidance: "I'd love to help with career guidance! Ask me about stream selection, career options, or how to prepare for entrance exams.",
    subject_explanation: "I can explain concepts across subjects! Ask me something specific like 'Explain Newton's Laws' or 'What is photosynthesis?'",
    unknown: "I'm not sure I understood your question. Could you rephrase? I can help with attendance, homework, timetables, exams, school events, policies, and much more!",
  };

  return fallbacks[intent] || fallbacks.unknown!;
}

/**
 * Sanitizes LLM output to ensure clean, safe text.
 */
export function sanitizeOutput(text: string): string {
  return text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Adds contextual footer based on data source confidence.
 */
export function addConfidenceFooter(text: string, confidence: ConfidenceLevel, sources: string[]): string {
  if (confidence === 'HIGH') return text;

  if (confidence === 'LIMITED') {
    return `${text}\n\n💡 This response is based on limited data. For real-time accuracy, check the relevant portal module.`;
  }

  return text;
}
