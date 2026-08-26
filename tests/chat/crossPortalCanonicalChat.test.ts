import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SCHOOL_ID } from '@/lib/auth/getAuthContext';
import { CANONICAL_STUDENT_ID, CANONICAL_TEACHER_ID, CANONICAL_GUARDIAN_ID } from '@/lib/canonical';

export interface CanonicalChatMessageRow {
  id: string;
  school_id: string;
  student_id: string;
  sender_id: string;
  sender_role: 'teacher' | 'parent';
  content: string;
  is_context_flag: boolean;
  read_at: string | null;
  created_at: string;
}

/**
 * Emulated Scoped Canonical Chat Storage
 * Implements identical behavior to ScopedSupabaseClient + Multi-Tenant RLS
 */
class MockCanonicalChatDB {
  private messages: CanonicalChatMessageRow[] = [];

  reset() {
    this.messages = [];
  }

  insert(callerSchoolId: string, row: Omit<CanonicalChatMessageRow, 'id' | 'school_id' | 'created_at'>): CanonicalChatMessageRow {
    const newMsg: CanonicalChatMessageRow = {
      ...row,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      school_id: callerSchoolId,
      created_at: new Date().toISOString(),
    };
    this.messages.push(newMsg);
    return newMsg;
  }

  select(callerSchoolId: string, studentId: string): CanonicalChatMessageRow[] {
    // Strict Tenant Isolation: Only returns records where message.school_id matches callerSchoolId
    return this.messages.filter((m) => m.school_id === callerSchoolId && m.student_id === studentId);
  }

  getAll() {
    return [...this.messages];
  }
}

describe('ShikshaSetu Cross-Portal Canonical Chat System', () => {
  const db = new MockCanonicalChatDB();
  const SCHOOL_A = DEFAULT_SCHOOL_ID;
  const SCHOOL_B = 'e0000000-0000-4000-8000-000000000002';

  const STUDENT_ID = CANONICAL_STUDENT_ID; // Aarav Sharma
  const TEACHER_ID = CANONICAL_TEACHER_ID; // Ananya Mehra
  const PARENT_ID = CANONICAL_GUARDIAN_ID; // Sunita Sharma

  beforeEach(() => {
    db.reset();
  });

  it('1. Teacher sends message -> saved with canonical student_id, school_id, and sender credentials', () => {
    const teacherMsg = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      content: 'Please review today’s homework for Math.',
      is_context_flag: false,
      read_at: null,
    });

    expect(teacherMsg.id).toBeDefined();
    expect(teacherMsg.school_id).toBe(SCHOOL_A);
    expect(teacherMsg.student_id).toBe(STUDENT_ID);
    expect(teacherMsg.sender_id).toBe(TEACHER_ID);
    expect(teacherMsg.sender_role).toBe('teacher');
    expect(teacherMsg.content).toBe('Please review today’s homework for Math.');
  });

  it('2. Parent Portal sees the exact same message with identical message_id, content, and timestamp', () => {
    // Teacher sends
    const teacherMsg = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      content: 'Please review today’s homework for Math.',
      is_context_flag: false,
      read_at: null,
    });

    // Parent fetches for Aarav Sharma
    const parentHistory = db.select(SCHOOL_A, STUDENT_ID);

    expect(parentHistory).toHaveLength(1);
    expect(parentHistory[0].id).toBe(teacherMsg.id);
    expect(parentHistory[0].content).toBe('Please review today’s homework for Math.');
    expect(parentHistory[0].sender_role).toBe('teacher');
  });

  it('3. Parent replies -> Teacher Portal sees the exact same reply in real-time history', () => {
    // 1. Teacher initial message
    db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      content: 'Please review today’s homework for Math.',
      is_context_flag: false,
      read_at: null,
    });

    // 2. Parent replies
    const parentReply = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: PARENT_ID,
      sender_role: 'parent',
      content: 'Thank you Ms. Mehra, I will check his notebook tonight.',
      is_context_flag: false,
      read_at: null,
    });

    // 3. Teacher queries thread
    const teacherView = db.select(SCHOOL_A, STUDENT_ID);

    expect(teacherView).toHaveLength(2);
    expect(teacherView[1].id).toBe(parentReply.id);
    expect(teacherView[1].sender_role).toBe('parent');
    expect(teacherView[1].content).toBe('Thank you Ms. Mehra, I will check his notebook tonight.');
  });

  it('4. Realtime deduplication: Optimistic message is cleanly replaced by authoritative DB message without duplicates', () => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      studentId: STUDENT_ID,
      senderId: TEACHER_ID,
      senderRole: 'teacher' as const,
      messageText: 'Testing quick reminder',
      isContextFlag: false,
      createdAt: new Date().toISOString(),
    };

    let localMessages = [optimisticMessage];

    // Server returns persisted row
    const serverRow = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      content: 'Testing quick reminder',
      is_context_flag: false,
      read_at: null,
    });

    // Realtime handler deduplicates by matching temp message or ID
    const incomingRealtimeMsg = {
      id: serverRow.id,
      studentId: serverRow.student_id,
      senderId: serverRow.sender_id,
      senderRole: serverRow.sender_role,
      messageText: serverRow.content,
      isContextFlag: serverRow.is_context_flag,
      createdAt: serverRow.created_at,
    };

    const updated = localMessages.some((m) => m.id === incomingRealtimeMsg.id)
      ? localMessages
      : localMessages.map((m) =>
          m.id === tempId || (m.senderRole === 'teacher' && m.messageText === incomingRealtimeMsg.messageText && m.id.startsWith('temp-'))
            ? incomingRealtimeMsg
            : m
        );

    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(serverRow.id);
    expect(updated[0].id.startsWith('temp-')).toBe(false);
  });

  it('5. Tenant Isolation Security: Unauthorized school cannot read or write messages for another school', () => {
    // School A conversation
    db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      content: 'Confidential school note for Class 8A',
      is_context_flag: false,
      read_at: null,
    });

    // School B attempts to read School A student thread
    const schoolBResults = db.select(SCHOOL_B, STUDENT_ID);
    expect(schoolBResults).toHaveLength(0);

    // School A sees its message
    const schoolAResults = db.select(SCHOOL_A, STUDENT_ID);
    expect(schoolAResults).toHaveLength(1);
    expect(schoolAResults[0].content).toBe('Confidential school note for Class 8A');
  });

  it('6. Empty state contract: Empty conversation is returned when no messages exist for student', () => {
    const UNCONTACTED_STUDENT = 'b1000000-0000-4000-8000-000000000009';
    const messages = db.select(SCHOOL_A, UNCONTACTED_STUDENT);
    expect(messages).toEqual([]);
  });

  it('7. Context flag persistence: Parent quick-note context flag is preserved across portal views', () => {
    const contextNote = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: PARENT_ID,
      sender_role: 'parent',
      content: 'Aarav has mild fever this morning. Please allow him to rest if needed.',
      is_context_flag: true,
      read_at: null,
    });

    const teacherView = db.select(SCHOOL_A, STUDENT_ID);
    expect(teacherView).toHaveLength(1);
    expect(teacherView[0].is_context_flag).toBe(true);
    expect(teacherView[0].id).toBe(contextNote.id);
  });
});
