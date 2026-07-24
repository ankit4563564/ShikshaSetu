import { createAdminClient } from '@/lib/supabase/admin';
import type { NotificationChannel, NotificationPriority, QueueStatus } from './types';
import { getAdapter } from './adapters';

const db = createAdminClient();

const RETRY_DELAYS_MS = [5_000, 30_000, 120_000, 300_000];

let _queueExists: boolean | null = null;

async function checkQueueTable(): Promise<boolean> {
  if (_queueExists !== null) return _queueExists;
  try {
    const { error } = await db.from('notification_queue').select('id').limit(1);
    _queueExists = !error;
  } catch {
    _queueExists = false;
  }
  return _queueExists;
}

export async function enqueueNotification(params: {
  notificationId: string;
  channel: NotificationChannel;
  recipientId: string;
  recipientRole: string;
  payload: Record<string, unknown>;
  priority?: NotificationPriority;
}): Promise<string> {
  const hasQueue = await checkQueueTable();
  if (!hasQueue) return '';

  const { error, data } = await db
    .from('notification_queue')
    .insert({
      notification_id: params.notificationId,
      channel: params.channel,
      recipient_id: params.recipientId,
      recipient_role: params.recipientRole,
      payload: params.payload,
      priority: params.priority || 'normal',
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[NotificationQueue] Enqueue error:', error.message);
    throw new Error(error.message);
  }

  return data.id;
}

export async function processQueue(batchSize = 10): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const hasQueue = await checkQueueTable();
  if (!hasQueue) return { processed: 0, succeeded: 0, failed: 0 };

  let items: any[] = [];

  try {
    const { data, error } = await db.rpc('process_notification_queue', {
      p_batch_size: batchSize,
    });

    if (error) {
      console.warn('[NotificationQueue] RPC failed, falling back to direct query:', error.message);
      const { data: fallbackData, error: fallbackError } = await db
        .from('notification_queue')
        .select('id, channel')
        .in('status', ['pending', 'retrying'])
        .or('next_retry_at.is.null,next_retry_at.lte.' + new Date().toISOString())
        .order('created_at', { ascending: true })
        .limit(batchSize);

      if (fallbackError) {
        console.error('[NotificationQueue] Fallback query also failed:', fallbackError.message);
        return { processed: 0, succeeded: 0, failed: 0 };
      }

      items = (fallbackData || []).map((d: any) => ({ processed_id: d.id, channel: d.channel }));

      for (const item of items) {
        await db
          .from('notification_queue')
          .update({ status: 'processing' })
          .eq('id', item.processed_id);
      }
    } else {
      items = data || [];
    }
  } catch (e) {
    console.error('[NotificationQueue] Process error:', e);
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  if (!items || items.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;

  for (const item of items) {
    const result = await processItem(item.processed_id, item.channel);
    if (result) succeeded++;
    else failed++;
  }

  return { processed: items.length, succeeded, failed };
}

async function processItem(queueId: string, channel: string): Promise<boolean> {
  const { data: queueItem, error: fetchError } = await db
    .from('notification_queue')
    .select('*')
    .eq('id', queueId)
    .single();

  if (fetchError || !queueItem) {
    console.error('[NotificationQueue] Failed to fetch queue item:', fetchError?.message);
    return false;
  }

  const adapter = getAdapter(channel);
  if (!adapter) {
    await markFailed(queueId, `No adapter for channel: ${channel}`, null);
    return false;
  }

  const deliveryRecord = await createDeliveryRecord(
    queueItem.notification_id,
    channel,
    queueItem.recipient_id,
    queueItem.attempts + 1
  );

  try {
    const result = await adapter.send({
      to: queueItem.recipient_id,
      title: queueItem.payload.title as string,
      body: (queueItem.payload.body as string) || '',
      metadata: (queueItem.payload.metadata as Record<string, unknown>) || {},
    });

    if (result.success) {
      await markCompleted(queueId, deliveryRecord, result.providerId);
      return true;
    } else {
      await markFailed(queueId, result.error || 'Unknown error', deliveryRecord);
      return false;
    }
  } catch (e: any) {
    await markFailed(queueId, e.message, deliveryRecord);
    return false;
  }
}

async function markCompleted(
  queueId: string,
  deliveryId: string | null,
  providerId?: string
): Promise<void> {
  await db
    .from('notification_queue')
    .update({ status: 'completed', processed_at: new Date().toISOString() })
    .eq('id', queueId);

  if (deliveryId) {
    await db
      .from('notification_deliveries')
      .update({
        status: 'delivered',
        provider_id: providerId || null,
        delivered_at: new Date().toISOString(),
      })
      .eq('id', deliveryId);
  }
}

async function markFailed(
  queueId: string,
  error: string,
  deliveryId: string | null
): Promise<void> {
  const { data: item } = await db
    .from('notification_queue')
    .select('attempts, max_attempts')
    .eq('id', queueId)
    .single();

  const attempts = (item?.attempts || 0) + 1;
  const maxAttempts = item?.max_attempts || 3;

  if (attempts >= maxAttempts) {
    await db
      .from('notification_queue')
      .update({
        status: 'failed',
        last_error: error,
        attempts,
        processed_at: new Date().toISOString(),
      })
      .eq('id', queueId);
  } else {
    const delayMs = RETRY_DELAYS_MS[Math.min(attempts - 1, RETRY_DELAYS_MS.length - 1)];
    const nextRetry = new Date(Date.now() + delayMs).toISOString();

    await db
      .from('notification_queue')
      .update({
        status: 'retrying',
        last_error: error,
        attempts,
        next_retry_at: nextRetry,
      })
      .eq('id', queueId);
  }

  if (deliveryId) {
    await db
      .from('notification_deliveries')
      .update({ status: 'failed', error_message: error })
      .eq('id', deliveryId);
  }
}

async function createDeliveryRecord(
  notificationId: string,
  channel: string,
  recipientId: string,
  attempt: number
): Promise<string | null> {
  const hasQueue = await checkQueueTable();
  if (!hasQueue) return null;

  const { data, error } = await db
    .from('notification_deliveries')
    .insert({
      notification_id: notificationId,
      channel,
      recipient_id: recipientId,
      status: 'pending',
      attempt,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[NotificationQueue] Failed to create delivery record:', error.message);
    return null;
  }
  return data.id;
}

export async function retryFailedNotifications(): Promise<number> {
  const hasQueue = await checkQueueTable();
  if (!hasQueue) return 0;

  const { data, error } = await db
    .from('notification_queue')
    .select('id')
    .eq('status', 'failed')
    .order('created_at', { ascending: true })
    .limit(50);

  if (error || !data) return 0;

  let count = 0;
  for (const item of data) {
    await db
      .from('notification_queue')
      .update({ status: 'retrying', attempts: 0, next_retry_at: new Date().toISOString() })
      .eq('id', item.id);
    count++;
  }

  return count;
}
