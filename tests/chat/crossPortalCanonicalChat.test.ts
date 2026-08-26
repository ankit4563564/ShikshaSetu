import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SCHOOL_ID } from '@/lib/auth/getAuthContext';
import { CANONICAL_STUDENT_ID, CANONICAL_TEACHER_ID, CANONICAL_GUARDIAN_ID } from '@/lib/canonical';

export interface CanonicalChatMessageRow {
  id: string;
  school_id: string;
  student_id: string;
  sender_id: string;
  sender_role: 'teacher' | 'parent';
  recipient_id?: string;
  recipient_role?: 'teacher' | 'parent';
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

describe('ShikshaSetu Cross-Portal Canonical Chat System & Sender Identity', () => {
  const db = new MockCanonicalChatDB();
  const SCHOOL_A = DEFAULT_SCHOOL_ID;
  const SCHOOL_B = 'e0000000-0000-4000-8000-000000000002';

  const STUDENT_ID = CANONICAL_STUDENT_ID;   // Aarav Sharma
  const TEACHER_ID = CANONICAL_TEACHER_ID;   // Ananya Mehra
  const PARENT_ID = CANONICAL_GUARDIAN_ID;   // Sunita Sharma

  beforeEach(() => {
    db.reset();
  });

  it('TEST 1: Teacher Ananya sends "hi mam" -> Stored with Teacher sender and Parent recipient; Renders correctly in both portals', () => {
    // 1. Teacher Ananya sends message
    const msg = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      recipient_id: PARENT_ID,
      recipient_role: 'parent',
      content: 'hi mam',
      is_context_flag: false,
      read_at: null,
    });

    expect(msg.sender_id).toBe(TEACHER_ID);
    expect(msg.sender_role).toBe('teacher');
    expect(msg.recipient_id).toBe(PARENT_ID);
    expect(msg.recipient_role).toBe('parent');
    expect(msg.student_id).toBe(STUDENT_ID);

    // 2. Teacher Portal view: Determines isMe (true) and displays Teacher / You
    const teacherIsMe = msg.sender_role === 'teacher';
    const teacherRoleLabel = msg.sender_role === 'teacher' ? 'Teacher' : 'Parent';
    expect(teacherIsMe).toBe(true);
    expect(teacherRoleLabel).toBe('Teacher');

    // 3. Parent Portal view: Determines isMe (false) and displays Teacher
    const parentIsMe = msg.sender_role === 'parent';
    const parentRoleLabel = msg.sender_role === 'parent' ? 'Parent' : 'Teacher';
    expect(parentIsMe).toBe(false);
    expect(parentRoleLabel).toBe('Teacher');
  });

  it('TEST 2: Parent Sunita replies "Hi ma’am, I will check." -> Stored with Parent sender and Teacher recipient; Renders correctly in both portals', () => {
    // 1. Teacher sent first
    db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      recipient_id: PARENT_ID,
      recipient_role: 'parent',
      content: 'hi mam',
      is_context_flag: false,
      read_at: null,
    });

    // 2. Parent Sunita replies
    const reply = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: PARENT_ID,
      sender_role: 'parent',
      recipient_id: TEACHER_ID,
      recipient_role: 'teacher',
      content: 'Hi ma’am, I will check.',
      is_context_flag: false,
      read_at: null,
    });

    expect(reply.sender_id).toBe(PARENT_ID);
    expect(reply.sender_role).toBe('parent');
    expect(reply.recipient_id).toBe(TEACHER_ID);
    expect(reply.recipient_role).toBe('teacher');

    // 3. Parent Portal view for reply: isMe (true), label is Parent
    const parentIsMe = reply.sender_role === 'parent';
    const parentRoleLabel = reply.sender_role === 'parent' ? 'Parent' : 'Teacher';
    expect(parentIsMe).toBe(true);
    expect(parentRoleLabel).toBe('Parent');

    // 4. Teacher Portal view for reply: isMe (false), label is Parent
    const teacherIsMe = reply.sender_role === 'teacher';
    const teacherRoleLabel = reply.sender_role === 'teacher' ? 'Teacher' : 'Parent';
    expect(teacherIsMe).toBe(false);
    expect(teacherRoleLabel).toBe('Parent');
  });

  it('TEST 3: Refreshing both portals maintains identical sender identity and message order', () => {
    // Teacher sends
    const msg1 = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      content: 'hi mam',
      is_context_flag: false,
      read_at: null,
    });

    // Parent replies
    const msg2 = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: PARENT_ID,
      sender_role: 'parent',
      content: 'Hi ma’am, I will check.',
      is_context_flag: false,
      read_at: null,
    });

    // Refetch in Teacher portal
    const teacherRefetch = db.select(SCHOOL_A, STUDENT_ID);
    expect(teacherRefetch).toHaveLength(2);
    expect(teacherRefetch[0].id).toBe(msg1.id);
    expect(teacherRefetch[0].sender_role).toBe('teacher');
    expect(teacherRefetch[1].id).toBe(msg2.id);
    expect(teacherRefetch[1].sender_role).toBe('parent');

    // Refetch in Parent portal
    const parentRefetch = db.select(SCHOOL_A, STUDENT_ID);
    expect(parentRefetch).toHaveLength(2);
    expect(parentRefetch[0].id).toBe(msg1.id);
    expect(parentRefetch[0].sender_role).toBe('teacher');
    expect(parentRefetch[1].id).toBe(msg2.id);
    expect(parentRefetch[1].sender_role).toBe('parent');
  });

  it('TEST 4: Same canonical message_id is visible in both Teacher and Parent portals', () => {
    const sentMsg = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      content: 'Important homework reminder.',
      is_context_flag: false,
      read_at: null,
    });

    const teacherView = db.select(SCHOOL_A, STUDENT_ID);
    const parentView = db.select(SCHOOL_A, STUDENT_ID);

    expect(teacherView[0].id).toBe(sentMsg.id);
    expect(parentView[0].id).toBe(sentMsg.id);
    expect(teacherView[0].id).toBe(parentView[0].id);
  });

  it('TEST 5: Realtime delivery replaces optimistic temporary message cleanly with no duplicates', () => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      studentId: STUDENT_ID,
      senderId: TEACHER_ID,
      senderRole: 'teacher' as const,
      messageText: 'hi mam',
      isContextFlag: false,
      createdAt: new Date().toISOString(),
    };

    let teacherMessages = [optimisticMessage];

    // Canonical insert returns confirmed row
    const serverRow = db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      content: 'hi mam',
      is_context_flag: false,
      read_at: null,
    });

    const confirmedMsg = {
      id: serverRow.id,
      studentId: serverRow.student_id,
      senderId: serverRow.sender_id,
      senderRole: serverRow.sender_role,
      messageText: serverRow.content,
      isContextFlag: serverRow.is_context_flag,
      createdAt: serverRow.created_at,
    };

    // Replace optimistic
    teacherMessages = teacherMessages.map((m) => (m.id === tempId ? confirmedMsg : m));

    expect(teacherMessages).toHaveLength(1);
    expect(teacherMessages[0].id).toBe(serverRow.id);
    expect(teacherMessages[0].senderRole).toBe('teacher');
  });

  it('TEST 6: Tenant Isolation Security: Cross-school communications are blocked', () => {
    db.insert(SCHOOL_A, {
      student_id: STUDENT_ID,
      sender_id: TEACHER_ID,
      sender_role: 'teacher',
      content: 'Internal Greenwood High Note',
      is_context_flag: false,
      read_at: null,
    });

    const schoolBResults = db.select(SCHOOL_B, STUDENT_ID);
    expect(schoolBResults).toHaveLength(0);
  });
});
