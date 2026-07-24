import { createAdminClient } from '@/lib/supabase/admin';
import type { NotificationChannel, NotificationCategory, NotificationAnalytics } from './types';

const db = createAdminClient();

export async function trackDelivery(
  notificationId: string,
  channel: NotificationChannel,
  category: NotificationCategory,
  success: boolean
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await db
    .from('notification_analytics')
    .select('id, total_sent, total_delivered, total_failed')
    .eq('date', today)
    .eq('channel', channel)
    .eq('category', category)
    .single();

  if (existing) {
    const updates: Record<string, number> = { total_sent: existing.total_sent + 1 };
    if (success) updates.total_delivered = existing.total_delivered + 1;
    else updates.total_failed = existing.total_failed + 1;

    await db
      .from('notification_analytics')
      .update(updates)
      .eq('id', existing.id);
  } else {
    await db
      .from('notification_analytics')
      .insert({
        date: today,
        channel,
        category,
        total_sent: 1,
        total_delivered: success ? 1 : 0,
        total_failed: success ? 0 : 1,
        total_read: 0,
      });
  }
}

export async function trackRead(category: NotificationCategory): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await db
    .from('notification_analytics')
    .select('id, total_read')
    .eq('date', today)
    .eq('channel', 'in_app')
    .eq('category', category)
    .single();

  if (existing) {
    await db
      .from('notification_analytics')
      .update({ total_read: existing.total_read + 1 })
      .eq('id', existing.id);
  }
}

export async function getAnalytics(options?: {
  dateFrom?: string;
  dateTo?: string;
  channel?: NotificationChannel | 'all';
  category?: NotificationCategory | 'all';
}): Promise<NotificationAnalytics[]> {
  let query = db
    .from('notification_analytics')
    .select('*')
    .order('date', { ascending: false });

  if (options?.dateFrom) query = query.gte('date', options.dateFrom);
  if (options?.dateTo) query = query.lte('date', options.dateTo);
  if (options?.channel && options.channel !== 'all') query = query.eq('channel', options.channel);
  if (options?.category && options.category !== 'all') query = query.eq('category', options.category);

  const { data, error } = await query;

  if (error) {
    console.error('[NotificationAnalytics] Fetch error:', error.message);
    return [];
  }

  return (data || []).map((row: any) => ({
    date: row.date,
    channel: row.channel,
    category: row.category,
    totalSent: row.total_sent,
    totalDelivered: row.total_delivered,
    totalFailed: row.total_failed,
    totalRead: row.total_read,
    avgDeliveryMs: row.avg_delivery_ms,
  }));
}

export async function getDeliveryStats(): Promise<{
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalPending: number;
  totalRetrying: number;
  byChannel: { channel: string; sent: number; delivered: number; failed: number }[];
}> {
  const { data: queueStats } = await db
    .from('notification_queue')
    .select('channel, status');

  const channelMap = new Map<string, { sent: number; delivered: number; failed: number }>();
  let totalPending = 0;
  let totalRetrying = 0;

  for (const item of queueStats || []) {
    if (!channelMap.has(item.channel)) {
      channelMap.set(item.channel, { sent: 0, delivered: 0, failed: 0 });
    }
    const stats = channelMap.get(item.channel)!;
    if (item.status === 'completed') stats.delivered++;
    else if (item.status === 'failed') stats.failed++;
    else stats.sent++;

    if (item.status === 'pending') totalPending++;
    if (item.status === 'retrying') totalRetrying++;
  }

  const byChannel = Array.from(channelMap.entries()).map(([channel, stats]) => ({
    channel,
    ...stats,
  }));

  const totalSent = byChannel.reduce((sum, c) => sum + c.sent + c.delivered + c.failed, 0);
  const totalDelivered = byChannel.reduce((sum, c) => sum + c.delivered, 0);
  const totalFailed = byChannel.reduce((sum, c) => sum + c.failed, 0);

  return { totalSent, totalDelivered, totalFailed, totalPending, totalRetrying, byChannel };
}
