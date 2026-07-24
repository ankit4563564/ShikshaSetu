import type { Portal } from '@/types/portal';

export type NotificationChannel = 'push' | 'email' | 'sms' | 'whatsapp' | 'in_app';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationCategory =
  | 'academic'
  | 'wellness'
  | 'safety'
  | 'chat'
  | 'system'
  | 'transport'
  | 'gate';

export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

export type ScheduleRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface NotificationRecord {
  id: string;
  recipientId: string;
  recipientRole: Portal;
  studentId: string | null;
  title: string;
  body: string | null;
  category: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  readAt: string | null;
  channels: NotificationChannel[];
  scheduledFor: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
  readBy: string[];
  createdAt: string;
}

export interface NotificationQueueItem {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  recipientId: string;
  recipientRole: Portal;
  payload: Record<string, unknown>;
  priority: NotificationPriority;
  status: QueueStatus;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  nextRetryAt: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  recipientId: string;
  status: DeliveryStatus;
  attempt: number;
  errorMessage: string | null;
  providerId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
}

export interface NotificationSchedule {
  id: string;
  title: string;
  body: string | null;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  recipientIds: string[];
  recipientRoles: Portal[];
  scheduledFor: string;
  recurrence: ScheduleRecurrence;
  status: 'scheduled' | 'sent' | 'cancelled';
  metadata: Record<string, unknown>;
  createdAt: string;
  sentAt: string | null;
}

export interface NotificationAnalytics {
  date: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  avgDeliveryMs: number | null;
}

export interface NotificationFilters {
  category?: NotificationCategory | 'all';
  priority?: NotificationPriority | 'all';
  channel?: NotificationChannel | 'all';
  status?: 'read' | 'unread' | 'archived' | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SendNotificationInput {
  title: string;
  body?: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  recipientIds: string[];
  recipientRoles: Portal[];
  studentId?: string;
  metadata?: Record<string, unknown>;
  scheduledFor?: string;
  expiresAt?: string;
}

export interface ChannelAdapter {
  send(payload: {
    to: string;
    title: string;
    body: string;
    metadata: Record<string, unknown>;
  }): Promise<{ success: boolean; providerId?: string; error?: string }>;
}
