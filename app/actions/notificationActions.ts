'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth/getUser';
import { revalidatePath } from 'next/cache';
import type { Portal } from '@/types';
import type {
  NotificationRecord,
  NotificationCategory,
  NotificationPriority,
  NotificationFilters,
} from '@/lib/notifications/types';
import {
  fetchNotifications as fetchNotificationsService,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  archiveNotification as archiveNotificationService,
  unarchiveNotification as unarchiveNotificationService,
  deleteNotification as deleteNotificationService,
  getDeliveryLogs as getDeliveryLogsService,
  sendNotification as sendNotificationService,
} from '@/lib/notifications/service';
import { getAnalytics, getDeliveryStats } from '@/lib/notifications/analytics';
import { processQueue, retryFailedNotifications } from '@/lib/notifications/queue';

export interface DBNotificationData {
  id: string;
  recipientId: string;
  recipientRole: Portal;
  studentId: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  isRead: boolean;
  isArchived: boolean;
  readAt: string | null;
  channels: string[];
  scheduledFor: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function toDBNotification(n: NotificationRecord): DBNotificationData {
  return {
    id: n.id,
    recipientId: n.recipientId,
    recipientRole: n.recipientRole,
    studentId: n.studentId || '',
    title: n.title,
    body: n.body || '',
    category: n.category,
    priority: n.priority,
    isRead: n.isRead,
    isArchived: n.isArchived,
    readAt: n.readAt,
    channels: n.channels,
    scheduledFor: n.scheduledFor,
    metadata: n.metadata,
    createdAt: n.createdAt,
  };
}

export async function fetchNotificationsAction(
  recipientId: string,
  filters?: NotificationFilters
): Promise<DBNotificationData[]> {
  await requireAuth();
  const result = await fetchNotificationsService(recipientId, {
    category: filters?.category as NotificationCategory | 'all' | undefined,
    priority: filters?.priority as NotificationPriority | 'all' | undefined,
    status: filters?.status || 'all',
    search: filters?.search,
  });
  return result.notifications.map(toDBNotification);
}

export async function fetchNotificationsPaginatedAction(
  recipientId: string,
  filters?: NotificationFilters & { limit?: number; offset?: number }
): Promise<{ notifications: DBNotificationData[]; total: number }> {
  await requireAuth();
  const result = await fetchNotificationsService(recipientId, {
    category: filters?.category as NotificationCategory | 'all' | undefined,
    priority: filters?.priority as NotificationPriority | 'all' | undefined,
    status: filters?.status || 'all',
    search: filters?.search,
    limit: filters?.limit,
    offset: filters?.offset,
  });
  return {
    notifications: result.notifications.map(toDBNotification),
    total: result.total,
  };
}

export async function markNotificationAsReadAction(
  notificationId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  if (user.role !== 'admin' && recipientId !== user.dbUserId) {
    return { success: false, error: 'Unauthorized' };
  }
  const result = await markAsReadService(notificationId, recipientId);
  if (result.success) {
    revalidatePath('/parent');
    revalidatePath('/teacher');
    revalidatePath('/student');
    revalidatePath('/admin');
    revalidatePath('/driver');
    revalidatePath('/gate');
  }
  return result;
}

export async function markNotificationsAsReadAction(
  recipientId: string
): Promise<{ success: boolean; error?: string; count?: number }> {
  await requireAuth();
  const result = await markAllAsReadService(recipientId);
  if (result.success) {
    revalidatePath('/parent');
    revalidatePath('/teacher');
    revalidatePath('/student');
    revalidatePath('/admin');
    revalidatePath('/driver');
    revalidatePath('/gate');
  }
  return result;
}

export async function archiveNotificationAction(
  notificationId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const result = await archiveNotificationService(notificationId, recipientId);
  if (result.success) {
    revalidatePath('/parent');
    revalidatePath('/teacher');
    revalidatePath('/admin');
  }
  return result;
}

export async function unarchiveNotificationAction(
  notificationId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const result = await unarchiveNotificationService(notificationId, recipientId);
  if (result.success) {
    revalidatePath('/parent');
    revalidatePath('/teacher');
    revalidatePath('/admin');
  }
  return result;
}

export async function deleteNotificationAction(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  return deleteNotificationService(notificationId);
}

export async function sendNotificationAction(
  input: {
    title: string;
    body?: string;
    category: NotificationCategory;
    priority?: NotificationPriority;
    channels?: string[];
    recipientIds: string[];
    recipientRoles: Portal[];
    studentId?: string;
    metadata?: Record<string, unknown>;
    scheduledFor?: string;
  }
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  await requireRole(['admin', 'teacher']);
  return sendNotificationService({
    ...input,
    channels: input.channels as any,
  });
}

export async function getNotificationDeliveryLogsAction(
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
  await requireRole(['admin']);
  return getDeliveryLogsService(notificationId);
}

export async function getNotificationAnalyticsAction(options?: {
  dateFrom?: string;
  dateTo?: string;
  channel?: string;
  category?: string;
}): Promise<any[]> {
  await requireRole(['admin']);
  return getAnalytics(options as any);
}

export async function getNotificationDeliveryStatsAction(): Promise<{
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalPending: number;
  totalRetrying: number;
  byChannel: { channel: string; sent: number; delivered: number; failed: number }[];
}> {
  await requireRole(['admin']);
  return getDeliveryStats();
}

export async function processNotificationQueueAction(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  await requireRole(['admin']);
  return processQueue();
}

export async function retryFailedNotificationsAction(): Promise<{ retried: number }> {
  await requireRole(['admin']);
  const retried = await retryFailedNotifications();
  return { retried };
}
