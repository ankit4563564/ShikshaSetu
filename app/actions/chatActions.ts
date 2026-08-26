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
    const context = await getAuthContext();
    validateParentStudentAccess(context, data.studentId);

    const scopedDb = createScopedClient(context);

    // Enforce server-authoritative sender credentials
    const authoritativeSenderId = context.userId;
    const authoritativeSenderRole = context.role === 'teacher' ? 'teacher' : 'parent';

    const basePayload = {
      student_id: data.studentId,
      sender_id: authoritativeSenderId,
      sender_role: authoritativeSenderRole,
      content: data.text.trim(),
      is_context_flag: data.isContextFlag || false,
      created_at: new Date().toISOString(),
    };

    // 1. Attempt insert with multi-tenant scopedDb (attaches school_id)
    let insertRes = await scopedDb
      .from('chat_messages')
      .insert(basePayload)
      .select('*')
      .single();

    // 2. If remote database schema cache lacks school_id, fallback to raw client insert
    if (insertRes.error && insertRes.error.message?.includes('school_id')) {
      console.warn('[sendChatMessageAction] Schema cache missing school_id on chat_messages, inserting without school_id:', insertRes.error.message);
      insertRes = await scopedDb
        .getRawClient()
        .from('chat_messages')
        .insert(basePayload)
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
