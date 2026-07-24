'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchNotificationsPaginatedAction,
  markNotificationAsReadAction,
  markNotificationsAsReadAction,
  archiveNotificationAction,
  unarchiveNotificationAction,
  getNotificationDeliveryLogsAction,
  getNotificationAnalyticsAction,
  getNotificationDeliveryStatsAction,
  type DBNotificationData,
} from '@/app/actions/notificationActions';

const CATEGORY_ICONS: Record<string, string> = {
  safety: '🛡️',
  transport: '🚌',
  gate: '🚪',
  academic: '📚',
  attendance: '✅',
  wellness: '💚',
  chat: '💬',
  system: '⚙️',
};

const PRIORITY_STYLES: Record<string, { dot: string; badge: string }> = {
  urgent: { dot: 'bg-warm-clay', badge: 'bg-warm-clay/15 text-warm-clay' },
  high: { dot: 'bg-marigold', badge: 'bg-marigold/15 text-marigold' },
  normal: { dot: 'bg-primary', badge: 'bg-primary/15 text-primary' },
  low: { dot: 'bg-deep-teal/30', badge: 'bg-deep-teal/10 text-deep-teal/50' },
};

type ViewMode = 'list' | 'analytics';

export function NotificationCenter({
  recipientId,
  isOpen,
  onClose,
}: {
  recipientId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<DBNotificationData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<DBNotificationData | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [deliveryStats, setDeliveryStats] = useState<any>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadNotifications = useCallback(async () => {
    if (!recipientId || !isOpen) return;
    setLoading(true);
    try {
      const result = await fetchNotificationsPaginatedAction(recipientId, {
        category: filterCategory as any,
        priority: filterPriority as any,
        status: filterStatus as any,
        search: debouncedSearch || undefined,
        limit: 50,
      });
      setNotifications(result.notifications);
      setTotal(result.total);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [recipientId, isOpen, filterCategory, filterPriority, filterStatus, debouncedSearch]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const loadAnalytics = useCallback(async () => {
    try {
      const [analyticsData, statsData] = await Promise.all([
        getNotificationAnalyticsAction({ dateFrom: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] }),
        getNotificationDeliveryStatsAction(),
      ]);
      setAnalytics(analyticsData);
      setDeliveryStats(statsData);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'analytics' && isOpen) {
      loadAnalytics();
    }
  }, [viewMode, isOpen, loadAnalytics]);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsReadAction(id, recipientId);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markNotificationsAsReadAction(recipientId);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleArchive = async (id: string) => {
    await archiveNotificationAction(id, recipientId);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotification?.id === id) setSelectedNotification(null);
  };

  const handleUnarchive = async (id: string) => {
    await unarchiveNotificationAction(id, recipientId);
    setNotifications(prev => prev.filter(n => n.id === id));
  };

  const openDetails = async (notif: DBNotificationData) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      await handleMarkRead(notif.id);
    }
    const logs = await getNotificationDeliveryLogsAction(notif.id);
    setDeliveryLogs(logs);
  };

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead && !n.isArchived).length,
    [notifications]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" 
        onClick={onClose} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-extrabold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'analytics' : 'list')}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                title="Analytics"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-200 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors font-bold text-xs"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-deep-teal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-deep-teal/10 bg-white text-xs text-deep-teal placeholder:text-deep-teal/30 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
        )}

      {/* Filters */}
      {viewMode === 'list' && (
        <div className="px-5 py-2.5 border-b border-deep-teal/5 flex items-center gap-2 overflow-x-auto">
          <FilterChip
            label="All"
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
          />
          <FilterChip
            label="Unread"
            active={filterStatus === 'unread'}
            onClick={() => setFilterStatus('unread')}
            count={unreadCount}
          />
          <FilterChip
            label="Archived"
            active={filterStatus === 'archived'}
            onClick={() => setFilterStatus('archived')}
          />
          <div className="w-px h-4 bg-deep-teal/10" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-[10px] font-bold text-deep-teal/60 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="academic">📚 Academic</option>
            <option value="safety">🛡️ Safety</option>
            <option value="wellness">💚 Wellness</option>
            <option value="transport">🚌 Transport</option>
            <option value="chat">💬 Chat</option>
            <option value="system">⚙️ System</option>
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="text-[10px] font-bold text-deep-teal/60 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="all">All Priority</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="normal">🔵 Normal</option>
            <option value="low">⚪ Low</option>
          </select>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'analytics' ? (
          <AnalyticsView analytics={analytics} stats={deliveryStats} />
        ) : selectedNotification ? (
          <DetailView
            notification={selectedNotification}
            deliveryLogs={deliveryLogs}
            onClose={() => setSelectedNotification(null)}
            onArchive={handleArchive}
          />
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-xs font-bold text-deep-teal/40">No notifications</p>
            <p className="text-[10px] text-deep-teal/30 mt-0.5">
              {searchQuery ? 'Try a different search' : 'You\'re all caught up'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-deep-teal/5">
            <AnimatePresence initial={false}>
              {notifications.map(notif => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onClick={() => openDetails(notif)}
                  onArchive={() => handleArchive(notif.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {viewMode === 'list' && !selectedNotification && total > 0 && (
        <div className="px-5 py-2.5 border-t border-deep-teal/5 text-center">
          <p className="text-[10px] text-deep-teal/30">
            Showing {notifications.length} of {total} notifications
          </p>
        </div>
      )}
    </motion.div>
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors whitespace-nowrap ${
        active
          ? 'bg-deep-teal text-white'
          : 'bg-deep-teal/5 text-deep-teal/50 hover:bg-deep-teal/10'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`ml-0.5 ${active ? 'text-white/70' : 'text-deep-teal/30'}`}>{count}</span>
      )}
    </button>
  );
}

function NotificationItem({
  notification,
  onClick,
  onArchive,
}: {
  notification: DBNotificationData;
  onClick: () => void;
  onArchive: () => void;
}) {
  const priorityStyle = PRIORITY_STYLES[notification.priority] || PRIORITY_STYLES.normal;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`px-5 py-3 hover:bg-deep-teal/[0.02] transition-colors cursor-pointer group ${
        !notification.isRead ? 'bg-primary/[0.03]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="relative">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-deep-teal/5 text-sm">
              {CATEGORY_ICONS[notification.category] || 'ℹ️'}
            </span>
            {!notification.isRead && (
              <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${priorityStyle.dot}`} />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-[11px] truncate ${!notification.isRead ? 'font-bold text-deep-teal' : 'font-medium text-deep-teal/80'}`}>
              {notification.title}
            </p>
            {notification.priority !== 'normal' && (
              <span className={`flex-shrink-0 px-1 py-0.5 rounded text-[8px] font-bold ${priorityStyle.badge}`}>
                {notification.priority}
              </span>
            )}
          </div>
          <p className="text-[10px] text-deep-teal/50 leading-relaxed line-clamp-2 mt-0.5">
            {notification.body}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[8px] text-deep-teal/30">
              {new Date(notification.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            {notification.channels && notification.channels.length > 1 && (
              <span className="text-[8px] text-deep-teal/25">
                via {notification.channels.join(', ')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onArchive(); }}
          className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-deep-teal/5 text-deep-teal/30 transition-all"
          title="Archive"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

function DetailView({
  notification,
  deliveryLogs,
  onClose,
  onArchive,
}: {
  notification: DBNotificationData;
  deliveryLogs: any[];
  onClose: () => void;
  onArchive: (id: string) => void;
}) {
  const priorityStyle = PRIORITY_STYLES[notification.priority] || PRIORITY_STYLES.normal;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-deep-teal/5 text-deep-teal/40 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => onArchive(notification.id)}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-deep-teal/10 hover:bg-deep-teal/5 text-deep-teal/50 transition-colors"
        >
          Archive
        </button>
      </div>

      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-deep-teal/5 text-xl">
          {CATEGORY_ICONS[notification.category] || 'ℹ️'}
        </span>
        <div>
          <h4 className="font-display text-sm font-extrabold text-deep-teal">{notification.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${priorityStyle.badge}`}>
              {notification.priority}
            </span>
            <span className="text-[10px] text-deep-teal/40">{notification.category}</span>
            <span className="text-[10px] text-deep-teal/30">
              {new Date(notification.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-deep-teal/70 leading-relaxed">{notification.body}</p>

      {/* Read receipt */}
      <div className="p-3 rounded-xl bg-deep-teal/5 border border-deep-teal/10">
        <p className="text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 mb-1">Read Receipt</p>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${notification.isRead ? 'bg-sage' : 'bg-marigold'}`} />
          <span className="text-[10px] font-bold text-deep-teal">
            {notification.isRead ? 'Read' : 'Unread'}
          </span>
          {notification.readAt && (
            <span className="text-[9px] text-deep-teal/40">
              on {new Date(notification.readAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Delivery logs */}
      {deliveryLogs.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 mb-2">Delivery Log</p>
          <div className="space-y-1.5">
            {deliveryLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] p-2 rounded-lg bg-white border border-deep-teal/5">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  log.status === 'delivered' ? 'bg-sage' : log.status === 'failed' ? 'bg-warm-clay' : 'bg-marigold'
                }`} />
                <span className="font-bold text-deep-teal/60">{log.channel}</span>
                <span className="text-deep-teal/40">{log.status}</span>
                <span className="text-deep-teal/25 ml-auto">Attempt {log.attempt}</span>
                {log.deliveredAt && (
                  <span className="text-[8px] text-deep-teal/25">{new Date(log.deliveredAt).toLocaleTimeString()}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Channels sent */}
      {notification.channels && notification.channels.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 mb-1">Channels</p>
          <div className="flex flex-wrap gap-1.5">
            {notification.channels.map(ch => (
              <span key={ch} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-deep-teal/5 text-deep-teal/50">
                {ch === 'in_app' ? '🔔 In-App' : ch === 'email' ? '📧 Email' : ch === 'sms' ? '📱 SMS' : ch === 'whatsapp' ? '💬 WhatsApp' : ch === 'push' ? '📲 Push' : ch}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsView({
  analytics,
  stats,
}: {
  analytics: any[];
  stats: any;
}) {
  const channelColors: Record<string, string> = {
    push: 'bg-primary',
    email: 'bg-sage',
    sms: 'bg-marigold',
    whatsapp: 'bg-sage',
    in_app: 'bg-deep-teal',
  };

  return (
    <div className="p-5 space-y-5">
      <h4 className="font-display text-xs font-extrabold text-deep-teal">Notification Analytics</h4>

      {/* Summary stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-sage/8 text-center">
            <p className="font-display text-lg font-extrabold text-sage">{stats.totalDelivered}</p>
            <p className="text-[9px] font-bold text-sage/60">Delivered</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-clay/8 text-center">
            <p className="font-display text-lg font-extrabold text-warm-clay">{stats.totalFailed}</p>
            <p className="text-[9px] font-bold text-warm-clay/60">Failed</p>
          </div>
          <div className="p-3 rounded-xl bg-marigold/8 text-center">
            <p className="font-display text-lg font-extrabold text-marigold">{stats.totalPending + stats.totalRetrying}</p>
            <p className="text-[9px] font-bold text-marigold/60">Pending</p>
          </div>
        </div>
      )}

      {/* By channel */}
      {stats?.byChannel && stats.byChannel.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 mb-2">By Channel</p>
          <div className="space-y-2">
            {stats.byChannel.map((ch: any) => {
              const total = ch.sent + ch.delivered + ch.failed;
              const pct = total > 0 ? (ch.delivered / total) * 100 : 0;
              return (
                <div key={ch.channel} className="p-2.5 rounded-xl bg-white border border-deep-teal/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-deep-teal capitalize">{ch.channel}</span>
                    <span className="text-[9px] text-deep-teal/40">{pct.toFixed(0)}% success</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-deep-teal/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${channelColors[ch.channel] || 'bg-deep-teal'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[8px] text-deep-teal/40">
                    <span>{ch.delivered} delivered</span>
                    <span>{ch.failed} failed</span>
                    <span>{ch.sent} sent</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent daily */}
      {analytics.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 mb-2">Last 7 Days</p>
          <div className="space-y-1">
            {analytics.slice(0, 14).map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-[9px] py-1">
                <span className="text-deep-teal/40 w-16">{a.date}</span>
                <span className="text-deep-teal/30 w-12">{a.channel}</span>
                <span className="text-sage font-bold">{a.totalDelivered}</span>
                <span className="text-warm-clay/60">{a.totalFailed}</span>
                <span className="text-deep-teal/20">{a.totalRead} read</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!stats || !stats.byChannel || stats.byChannel.length === 0) && analytics.length === 0 && (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">📊</p>
          <p className="text-xs text-deep-teal/40">No analytics data yet</p>
          <p className="text-[10px] text-deep-teal/30 mt-0.5">Analytics will appear once notifications are sent</p>
        </div>
      )}
    </div>
  );
}
