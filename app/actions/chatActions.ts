'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { recordEcosystemEvent } from '@/lib/ecosystem';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

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
 */
export async function fetchChatMessagesAction(studentId: string): Promise<ChatMessageData[]> {
  await requireAuth();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });

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
 */
export async function sendChatMessageAction(data: {
  studentId: string;
  text: string;
  senderRole: 'teacher' | 'parent';
  senderId: string;
  isContextFlag?: boolean;
}): Promise<{ success: boolean; message?: ChatMessageData; error?: string }> {
  await requireAuth();
  const supabase = createClient();

  const { data: newRow, error } = await supabase
    .from('chat_messages')
    .insert({
      student_id: data.studentId,
      sender_id: data.senderId,
      sender_role: data.senderRole,
      content: data.text,
      is_context_flag: data.isContextFlag || false,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    console.error(`[sendChatMessageAction] Error:`, error.message);
    return { success: false, error: error.message };
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'chat_message_sent',
    studentId: data.studentId,
    actorId: data.senderId,
    actorRole: data.senderRole,
    title: data.isContextFlag ? 'Parent context note sent' : 'Chat message sent',
    body: data.text,
    metadata: {
      messageId: newRow.id,
      isContextFlag: data.isContextFlag || false,
    },
  });

  // Revalidate paths to sync data
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
}
