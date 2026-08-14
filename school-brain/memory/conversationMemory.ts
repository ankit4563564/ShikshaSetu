import { DEMO_STUDENTS } from '../demo-data/students';
import { DEMO_TEACHERS } from '../demo-data/teachers';

// ─────────────────────────────────────────────
// Conversation Memory & Context Resolution
// Resolves pronouns, follow-up references, and
// maintains conversational continuity
// ─────────────────────────────────────────────

export interface MemoryContext {
  lastMentionedEntity?: string;
  lastMentionedStudents?: string[];
  lastMentionedTeacher?: string;
  lastDomain?: string;
  lastGrade?: string;
  lastSection?: string;
  lastSubject?: string;
}

export interface ConversationState {
  currentStudentId?: string;
  currentStudentName?: string;
  currentClassGrade?: string;
  currentClassSection?: string;
  currentSubject?: string;
  lastIntent?: string;
  lastRetrievedData?: string;
  turnCount: number;
}

/**
 * Resolves contextual references (pronouns, implicit references)
 * by analyzing conversation history.
 */
export function resolveContextualReferences(
  query: string,
  history: { role: string; content: string }[] = []
): { resolvedQuery: string; contextNotes: string; memoryContext: MemoryContext; state: ConversationState } {
  const memoryContext: MemoryContext = {};
  const state: ConversationState = {
    currentStudentId: undefined,
    currentStudentName: undefined,
    currentClassGrade: undefined,
    currentClassSection: undefined,
    turnCount: history.length,
  };

  if (!history || history.length === 0) {
    return { resolvedQuery: query, contextNotes: '', memoryContext, state };
  }

  const lowerQuery = query.toLowerCase();
  const recentHistory = history.slice(-8);
  const recentHistoryText = recentHistory.map(h => h.content).join('\n');
  const lowerHistory = recentHistoryText.toLowerCase();

  let contextNotes = '';
  let resolvedQuery = query;

  // ── Extract entities from history ──
  const mentionedStudents = extractMentionedStudents(lowerHistory);
  const mentionedTeachers = extractMentionedTeachers(lowerHistory);
  const mentionedGrade = extractMentionedGrade(lowerHistory);
  const mentionedSubject = extractMentionedSubject(lowerHistory);

  memoryContext.lastMentionedStudents = mentionedStudents;
  memoryContext.lastMentionedTeacher = mentionedTeachers.length > 0 ? mentionedTeachers[0] : undefined;
  memoryContext.lastGrade = mentionedGrade || undefined;
  memoryContext.lastSubject = mentionedSubject || undefined;

  if (mentionedStudents.length > 0) {
    state.currentStudentName = mentionedStudents[0];
    const s = DEMO_STUDENTS.find(st => st.displayName.toLowerCase() === mentionedStudents[0].toLowerCase());
    if (s) state.currentStudentId = s.id;
  }
  if (mentionedGrade) state.currentClassGrade = mentionedGrade;
  if (mentionedSubject) state.currentSubject = mentionedSubject;

  // ── Detect domain continuity ──
  if (lowerHistory.includes('attention') || lowerHistory.includes('struggling') || lowerHistory.includes('weak')) {
    memoryContext.lastDomain = 'who_needs_attention';
  } else if (lowerHistory.includes('attendance')) {
    memoryContext.lastDomain = 'attendance';
  } else if (lowerHistory.includes('homework') || lowerHistory.includes('assignment')) {
    memoryContext.lastDomain = 'homework';
  } else if (lowerHistory.includes('timetable') || lowerHistory.includes('schedule')) {
    memoryContext.lastDomain = 'timetable';
  } else if (lowerHistory.includes('bus') || lowerHistory.includes('transport')) {
    memoryContext.lastDomain = 'bus';
  } else if (lowerHistory.includes('library') || lowerHistory.includes('book')) {
    memoryContext.lastDomain = 'library';
  } else if (lowerHistory.includes('exam') || lowerHistory.includes('test') || lowerHistory.includes('marks')) {
    memoryContext.lastDomain = 'exams';
  }

  state.lastIntent = memoryContext.lastDomain;

  // ── Resolve pronouns (him, her, their, they, them, this student) ──
  const hasPronoun = /\b(their|them|they|his|her|him|that student|the weak students|those students|the student|these students|it|this)\b/i.test(lowerQuery);

  if (hasPronoun) {
    if (memoryContext.lastDomain === 'who_needs_attention' && mentionedStudents.length > 0) {
      const studentNames = mentionedStudents.slice(0, 5).join(', ');
      contextNotes = `Resolved pronoun → students needing attention: ${studentNames}.`;
      resolvedQuery = `${query} [Context: referring to students needing attention: ${studentNames}]`;
    } else if (mentionedStudents.length === 1) {
      contextNotes = `Resolved pronoun → ${mentionedStudents[0]}.`;
      resolvedQuery = `${query} [Context: referring to student ${mentionedStudents[0]}]`;
    } else if (mentionedStudents.length > 1) {
      const studentNames = mentionedStudents.join(', ');
      contextNotes = `Resolved pronoun → students: ${studentNames}.`;
      resolvedQuery = `${query} [Context: referring to students: ${studentNames}]`;
    } else if (memoryContext.lastDomain === 'bus') {
      const busMatch = lowerHistory.match(/bus\s*(\d+)/i);
      const busRef = busMatch ? `Bus ${busMatch[1]}` : 'the bus';
      contextNotes = `Resolved pronoun → ${busRef}.`;
      resolvedQuery = `${query} [Context: referring to ${busRef}]`;
    } else if (mentionedTeachers.length > 0) {
      contextNotes = `Resolved pronoun → teacher: ${mentionedTeachers[0]}.`;
      resolvedQuery = `${query} [Context: referring to teacher ${mentionedTeachers[0]}]`;
    }
  }

  // ── Resolve "what about X?" pattern ──
  const whatAboutMatch = lowerQuery.match(/what about\s+(.+?)(?:\?|$)/i);
  if (whatAboutMatch) {
    const ref = whatAboutMatch[1].trim();
    const student = DEMO_STUDENTS.find(s =>
      s.displayName.toLowerCase().includes(ref) || s.firstName.toLowerCase() === ref
    );
    if (student && memoryContext.lastDomain) {
      contextNotes = `Follow-up about ${student.displayName} in context of ${memoryContext.lastDomain}.`;
      resolvedQuery = `${query} [Context: asking about ${student.displayName} regarding ${memoryContext.lastDomain}]`;
      state.currentStudentName = student.displayName;
      state.currentStudentId = student.id;
    }
  }

  // ── Resolve implicit class/grade references ──
  if (mentionedGrade && !lowerQuery.match(/(?:class|grade)\s*\d/i)) {
    if (lowerQuery.includes('class') || lowerQuery.includes('student') || lowerQuery.includes('attendance') || lowerQuery.includes('homework')) {
      resolvedQuery += ` [Context: Grade ${mentionedGrade}]`;
    }
  }

  return { resolvedQuery, contextNotes, memoryContext, state };
}

// ── Entity Extraction from History ──

function extractMentionedStudents(text: string): string[] {
  const found: string[] = [];
  for (const student of DEMO_STUDENTS) {
    if (text.includes(student.displayName.toLowerCase()) || text.includes(student.firstName.toLowerCase())) {
      if (!found.includes(student.displayName)) {
        found.push(student.displayName);
      }
    }
  }
  return found;
}

function extractMentionedTeachers(text: string): string[] {
  const found: string[] = [];
  for (const teacher of DEMO_TEACHERS) {
    const teacherName = teacher.displayName ?? teacher.firstName;
    if (text.includes(teacherName.toLowerCase()) || text.includes(teacher.firstName.toLowerCase())) {
      if (!found.includes(teacherName)) {
        found.push(teacherName);
      }
    }
  }
  return found;
}

function extractMentionedGrade(text: string): string | null {
  const match = text.match(/(?:class|grade)\s*(\d+)/i);
  return match ? match[1] : null;
}

function extractMentionedSubject(text: string): string | null {
  const subjects = ['mathematics', 'maths', 'math', 'science', 'physics', 'chemistry', 'biology', 'english', 'hindi', 'social studies', 'computer'];
  for (const s of subjects) {
    if (text.includes(s)) {
      if (s === 'maths' || s === 'math') return 'Mathematics';
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
  }
  return null;
}

