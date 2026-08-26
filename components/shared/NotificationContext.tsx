'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  fetchNotificationsAction,
  markNotificationsAsReadAction,
  type DBNotificationData,
} from '@/app/actions/notificationActions';

export interface ChatNotification {
  id: string;
  studentId: string;
  senderRole: 'teacher' | 'parent';
  messageText: string;
  createdAt: string;
  senderName: string;
  isContextFlag?: boolean;
}

interface NotificationContextType {
  notifications: ChatNotification[];
  clearNotificationsForStudent: (studentId: string) => void;
  activeChatStudentId: string | null;
  setActiveChatStudentId: (studentId: string | null) => void;
  registerStudentIds: (ids: string[]) => void;

  dbNotifications: DBNotificationData[];
  unreadCount: number;
  registerRecipientId: (id: string) => void;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [activeChatStudentId, setActiveChatStudentId] = useState<string | null>(null);
  const [registeredStudentIds, setRegisteredStudentIds] = useState<string[]>([]);

  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [dbNotifications, setDbNotifications] = useState<DBNotificationData[]>([]);

  const registerStudentIds = useCallback((ids: string[]) => {
    const uniqueIds = Array.from(new Set(ids));
    setRegisteredStudentIds((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(uniqueIds)) return prev;
      return uniqueIds;
    });
  }, []);

  const registerRecipientId = useCallback((id: string) => {
    setRecipientId((prev) => (prev === id ? prev : id));
  }, []);

  const clearNotificationsForStudent = useCallback((studentId: string) => {
    setNotifications((prev) => prev.filter((n) => n.studentId !== studentId));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!recipientId) return;
    setDbNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markNotificationsAsReadAction(recipientId);
  }, [recipientId]);

  const mergeDbNotifications = useCallback((incoming: DBNotificationData[]) => {
    setDbNotifications((prev) => {
      const byId = new Map<string, DBNotificationData>();
      [...incoming, ...prev].forEach((notification) => byId.set(notification.id, notification));
      return Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  }, []);

  const loadDbNotifications = useCallback(async (id: string) => {
    const data = await fetchNotificationsAction(id);
    mergeDbNotifications(data);
  }, [mergeDbNotifications]);

  useEffect(() => {
    if (!recipientId) return;
    loadDbNotifications(recipientId);
  }, [recipientId, loadDbNotifications]);

  useEffect(() => {
    if (!recipientId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`db-notif-${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${recipientId}`,
        },
        (payload: any) => {
          const newNotif = payload.new;
          if (!newNotif) return;

          const mappedNotif: DBNotificationData = {
            id: newNotif.id,
            recipientId: newNotif.recipient_id,
            recipientRole: newNotif.recipient_role,
            studentId: newNotif.student_id,
            title: newNotif.title,
            body: newNotif.body,
            category: newNotif.category,
            priority: newNotif.priority || 'normal',
            isRead: newNotif.is_read,
            isArchived: newNotif.is_archived || false,
            readAt: newNotif.read_at,
            channels: newNotif.channels || ['in_app'],
            scheduledFor: newNotif.scheduled_for,
            metadata: newNotif.metadata || {},
            createdAt: newNotif.created_at,
          };

          setDbNotifications((prev) => {
            if (prev.some((n) => n.id === mappedNotif.id)) return prev;
            return [mappedNotif, ...prev];
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          loadDbNotifications(recipientId);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, loadDbNotifications]);

  useEffect(() => {
    if (registeredStudentIds.length === 0) return;

    const supabase = createClient();

    const channels = registeredStudentIds.map((studentId) => {
      const channel = supabase.channel(`notif-chat-${studentId}`);

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `student_id=eq.${studentId}`,
          },
          (payload: any) => {
            const newMsg = payload.new;
            if (!newMsg) return;

            if (activeChatStudentId !== studentId) {
              const senderName = newMsg.sender_role === 'teacher' ? 'Teacher' : 'Parent';

              const newNotification: ChatNotification = {
                id: newMsg.id,
                studentId: newMsg.student_id,
                senderRole: newMsg.sender_role as 'teacher' | 'parent',
                messageText: newMsg.content,
                createdAt: newMsg.created_at,
                senderName,
                isContextFlag: newMsg.is_context_flag || false,
              };

              setNotifications((prev) => {
                if (prev.some((n) => n.id === newNotification.id)) return prev;
                return [...prev, newNotification];
              });
            }
          }
        )
        .subscribe();

      return { studentId, channel };
    });

    return () => {
      channels.forEach(({ channel }) => {
        supabase.removeChannel(channel);
      });
    };
  }, [registeredStudentIds, activeChatStudentId]);

  const unreadCount = dbNotifications.filter((n) => !n.isRead && !n.isArchived).length;

  const contextValue = React.useMemo<NotificationContextType>(
    () => ({
      notifications,
      clearNotificationsForStudent,
      activeChatStudentId,
      setActiveChatStudentId,
      registerStudentIds,

      dbNotifications,
      unreadCount,
      registerRecipientId,
      markAllAsRead,
    }),
    [
      notifications,
      clearNotificationsForStudent,
      activeChatStudentId,
      setActiveChatStudentId,
      registerStudentIds,
      dbNotifications,
      unreadCount,
      registerRecipientId,
      markAllAsRead,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
