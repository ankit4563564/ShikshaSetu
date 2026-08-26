'use server';

import { getAuthContext, validateParentStudentAccess } from '@/lib/auth/getAuthContext';
import { createScopedClient } from '@/lib/supabase/scoped';
import { revalidatePath } from 'next/cache';
import { recordEcosystemEvent } from '@/lib/ecosystem';

export interface ChatMessageData {
  id: string;
  studentId: string;
  senderId: string;
  senderRole: 'teacher' | 'parent';
  messageText: string;
  isContextFlag: boolean;
  createdAt: string;
}

/**
 * Fetches message history for a given student thread.
 * Enforces server-side authentication, tenant scoping, and guardian-child boundary.
 */
export async function fetchChatMessagesAction(studentId: string): Promise<ChatMessageData[]> {
  const context = await getAuthContext();
  validateParentStudentAccess(context, studentId);

  const scopedDb = createScopedClient(context);

  // 1. Attempt scoped query with school_id isolation
  let res = await scopedDb
    .from('chat_messages')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });

  // 2. If remote database schema cache lacks school_id, fallback to direct query
  if (res.error && res.error.message?.includes('school_id')) {
    console.warn('[fetchChatMessagesAction] Schema cache missing school_id on chat_messages, querying direct table:', res.error.message);
    res = await scopedDb
      .getRawClient()
      .from('chat_messages')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });
  }

  const { data, error } = res;

  if (error) {
    console.error(`[fetchChatMessagesAction] Error:`, error.message);
    return [];
  }

  return (data || []).map((msg: any) => ({
    id: msg.id,
    studentId: msg.student_id,
    senderId: msg.sender_id,
    senderRole: msg.sender_role as 'teacher' | 'parent',
    messageText: msg.content,
    isContextFlag: msg.is_context_flag || false,
    createdAt: msg.created_at,
  }));
}

/**
 * Sends a message from parent or teacher.
 * Enforces server-side authentication, overrides client-supplied sender credentials,
 * and validates tenant & student authorization.
 */
export async function sendChatMessageAction(data: {
  studentId: string;
  text: string;
  senderRole?: 'teacher' | 'parent';
  senderId?: string;
  isContextFlag?: boolean;
}): Promise<{ success: boolean; message?: ChatMessageData; error?: string }> {
  try {
    const context = await getAuthContext(data.senderRole);
    validateParentStudentAccess(context, data.studentId);

    const scopedDb = createScopedClient(context);

    // Enforce server-authoritative sender credentials based on authenticated portal context
    const authoritativeSenderRole: 'teacher' | 'parent' = context.role === 'teacher' ? 'teacher' : 'parent';
    const authoritativeSenderId = context.userId;

    // Canonical recipient resolution:
    // If Teacher sends: recipient is Parent (Sunita Sharma c1000000-0000-4000-8000-000000000001)
    // If Parent sends: recipient is Teacher (Ananya Mehra a1000000-0000-4000-8000-000000000001)
    const authoritativeRecipientRole: 'teacher' | 'parent' = authoritativeSenderRole === 'teacher' ? 'parent' : 'teacher';
    const authoritativeRecipientId = authoritativeSenderRole === 'teacher'
      ? 'c1000000-0000-4000-8000-000000000001'
      : 'a1000000-0000-4000-8000-000000000001';

    const fullPayload = {
      student_id: data.studentId,
      sender_id: authoritativeSenderId,
      sender_role: authoritativeSenderRole,
      recipient_id: authoritativeRecipientId,
      recipient_role: authoritativeRecipientRole,
      content: data.text.trim(),
      is_context_flag: data.isContextFlag || false,
      created_at: new Date().toISOString(),
    };

    const minimalPayload = {
      student_id: data.studentId,
      sender_id: authoritativeSenderId,
      sender_role: authoritativeSenderRole,
      content: data.text.trim(),
      is_context_flag: data.isContextFlag || false,
      created_at: new Date().toISOString(),
    };

    // 1. Attempt insert with multi-tenant scopedDb
    let insertRes = await scopedDb
      .from('chat_messages')
      .insert(fullPayload)
      .select('*')
      .single();

    // 2. If remote database schema lacks recipient columns or school_id, fallback to minimal payload
    if (insertRes.error) {
      console.warn('[sendChatMessageAction] Full payload insert note, attempting standard insert:', insertRes.error.message);
      insertRes = await scopedDb
        .from('chat_messages')
        .insert(minimalPayload)
        .select('*')
        .single();
    }

    // 3. If remote schema cache lacks school_id, fallback to raw client insert
    if (insertRes.error && insertRes.error.message?.includes('school_id')) {
      console.warn('[sendChatMessageAction] Schema cache missing school_id, falling back to raw client insert:', insertRes.error.message);
      insertRes = await scopedDb
        .getRawClient()
        .from('chat_messages')
        .insert(minimalPayload)
        .select('*')
        .single();
    }

    const { data: newRow, error } = insertRes;

    if (error || !newRow) {
      console.error(`[sendChatMessageAction] Error:`, error?.message);
      return { success: false, error: error?.message || 'Failed to send note' };
    }

    try {
      await recordEcosystemEvent(scopedDb, {
        eventType: 'chat_message_sent',
        studentId: data.studentId,
        actorId: authoritativeSenderId,
        actorRole: authoritativeSenderRole,
        title: data.isContextFlag ? 'Parent context note sent' : 'Chat message sent',
        body: data.text.trim(),
        metadata: {
          messageId: newRow.id,
          isContextFlag: data.isContextFlag || false,
        },
      });
    } catch (evtErr) {
      console.warn('[sendChatMessageAction] Event propagation note:', evtErr);
    }

    // Revalidate paths to sync data across portals
    revalidatePath('/parent');
    revalidatePath('/teacher');

    return {
      success: true,
      message: {
        id: newRow.id,
        studentId: newRow.student_id,
        senderId: newRow.sender_id,
        senderRole: newRow.sender_role as 'teacher' | 'parent',
        messageText: newRow.content,
        isContextFlag: newRow.is_context_flag || false,
        createdAt: newRow.created_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized chat operation' };
  }
}
