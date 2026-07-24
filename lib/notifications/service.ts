import { createAdminClient } from '@/lib/supabase/admin';
import type {
  NotificationRecord,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
  SendNotificationInput,
} from './types';
import { enqueueNotification } from './queue';

const db = createAdminClient();

let _hasNewColumns: boolean | null = null;

async function checkNewColumns(): Promise<boolean> {
  if (_hasNewColumns !== null) return _hasNewColumns;
  try {
    const { error } = await db
      .from('notifications')
      .select('priority')
      .limit(1);
    _hasNewColumns = !error;
  } catch {
    _hasNewColumns = false;
  }
  return _hasNewColumns;
}

export async function sendNotification(
  input: SendNotificationInput
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    const channels = input.channels || ['in_app'];
    const hasNew = await checkNewColumns();

    const baseInsert: Record<string, unknown> = {
      recipient_id: undefined,
      recipient_role: undefined,
      student_id: input.studentId || null,
      title: input.title,
      body: input.body || null,
      category: input.category,
      is_read: false,
    };

    if (hasNew) {
      baseInsert.priority = input.priority || 'normal';
      baseInsert.channels = channels;
      baseInsert.metadata = input.metadata || {};
      baseInsert.scheduled_for = input.scheduledFor || null;
      baseInsert.expires_at = input.expiresAt || null;
      baseInsert.is_archived = false;
    }

    const notifications = input.recipientIds.map((recipientId, idx) => ({
      ...baseInsert,
      recipient_id: recipientId,
      recipient_role: input.recipientRoles[idx] || 'admin',
    }));

    const { data, error } = await db
      .from('notifications')
      .insert(notifications)
      .select('id, recipient_id, recipient_role');

    if (error) {
      console.error('[NotificationService] Insert error:', error.message);
      return { success: false, error: error.message };
    }

    if (hasNew) {
      const externalChannels = channels.filter(c => c !== 'in_app');
      if (externalChannels.length > 0 && data) {
        for (const row of data) {
          for (const channel of externalChannels) {
            try {
              await enqueueNotification({
                notificationId: row.id,
                channel: channel as NotificationChannel,
                recipientId: row.recipient_id,
                recipientRole: row.recipient_role,
                payload: {
                  title: input.title,
                  body: input.body || '',
                  metadata: input.metadata || {},
                },
                priority: input.priority || 'normal',
              });
            } catch (e) {
              console.error(`[NotificationService] Failed to enqueue ${channel}:`, e);
            }
          }
        }
      }
    }

    return { success: true, notificationId: data?.[0]?.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function archiveNotification(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const hasNew = await checkNewColumns();
  if (!hasNew) return { success: false, error: 'Archive requires migration 028' };

  const { error } = await db
    .from('notifications')
    .update({ is_archived: true })
    .eq('id', notificationId)
    .eq('recipient_id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function unarchiveNotification(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const hasNew = await checkNewColumns();
  if (!hasNew) return { success: false, error: 'Unarchive requires migration 028' };

  const { error } = await db
    .from('notifications')
    .update({ is_archived: false })
    .eq('id', notificationId)
    .eq('recipient_id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const hasNew = await checkNewColumns();

  if (hasNew) {
    const { data: existing } = await db
      .from('notifications')
      .select('read_by')
      .eq('id', notificationId)
      .single();

    const readBy = Array.isArray(existing?.read_by) ? existing.read_by : [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }

    const { error } = await db
      .from('notifications')
      .update({ is_read: true, read_by: readBy })
      .eq('id', notificationId);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function markAllAsRead(
  recipientId: string
): Promise<{ success: boolean; error?: string; count?: number }> {
  const { data, error } = await db
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', recipientId)
    .eq('is_read', false)
    .select('id');

  if (error) return { success: false, error: error.message };
  return { success: true, count: data?.length || 0 };
}

export async function fetchNotifications(
  recipientId: string,
  filters?: {
    category?: NotificationCategory | 'all';
    priority?: NotificationPriority | 'all';
    status?: 'read' | 'unread' | 'archived' | 'all';
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ notifications: NotificationRecord[]; total: number }> {
  const hasNew = await checkNewColumns();

  let query = db
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('recipient_id', recipientId);

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (hasNew && filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }

  if (hasNew) {
    if (filters?.status === 'read') {
      query = query.eq('is_read', true).eq('is_archived', false);
    } else if (filters?.status === 'unread') {
      query = query.eq('is_read', false).eq('is_archived', false);
    } else if (filters?.status === 'archived') {
      query = query.eq('is_archived', true);
    } else {
      query = query.eq('is_archived', false);
    }
  } else {
    if (filters?.status === 'read') {
      query = query.eq('is_read', true);
    } else if (filters?.status === 'unread') {
      query = query.eq('is_read', false);
    }
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  if (hasNew) {
    query = query
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[NotificationService] Fetch error:', error.message);
    return { notifications: [], total: 0 };
  }

  return {
    notifications: (data || []).map((n: any) => mapRecord(n, hasNew)),
    total: count || 0,
  };
}

export async function getNotificationById(
  id: string
): Promise<NotificationRecord | null> {
  const hasNew = await checkNewColumns();
  const { data, error } = await db
    .from('notifications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapRecord(data, hasNew);
}

export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await db
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getDeliveryLogs(
  notificationId: string
): Promise<{
  channel: string;
  status: string;
  attempt: number;
  error: string | null;
  providerId: string | null;
  createdAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
}[]> {
  const hasNew = await checkNewColumns();
  if (!hasNew) return [];

  const { data, error } = await db
    .from('notification_deliveries')
    .select('channel, status, attempt, error_message, provider_id, created_at, sent_at, delivered_at')
    .eq('notification_id', notificationId)
    .order('attempt', { ascending: true });

  if (error) return [];
  return (data || []).map((d: any) => ({
    channel: d.channel,
    status: d.status,
    attempt: d.attempt,
    error: d.error_message,
    providerId: d.provider_id,
    createdAt: d.created_at,
    sentAt: d.sent_at,
    deliveredAt: d.delivered_at,
  }));
}

function mapRecord(row: any, hasNew: boolean): NotificationRecord {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    recipientRole: row.recipient_role,
    studentId: row.student_id,
    title: row.title,
    body: row.body,
    category: row.category,
    priority: hasNew ? (row.priority || 'normal') : 'normal',
    isRead: row.is_read,
    isArchived: hasNew ? (row.is_archived || false) : false,
    readAt: hasNew ? row.read_at : null,
    channels: hasNew ? (row.channels || ['in_app']) : ['in_app'],
    scheduledFor: hasNew ? row.scheduled_for : null,
    expiresAt: hasNew ? row.expires_at : null,
    metadata: hasNew ? (row.metadata || {}) : {},
    readBy: hasNew ? (row.read_by || []) : [],
    createdAt: row.created_at,
  };
}
