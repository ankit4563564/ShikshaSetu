'use client';

import Link from 'next/link';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fadeSlideUp, staggerContainer, scaleIn } from '@/lib/animations';
import AdminRewardsPanel from '@/components/rewards/AdminRewardsPanel';
import NotificationBell from '@/components/shared/NotificationBell';
import { PrincipalCopilotStrip } from '@/components/copilot/PrincipalCopilotStrip';
import { useNotifications } from '@/components/shared/NotificationContext';
import type { AdminOpsInsight } from '@/lib/product-intelligence';
import {
  ADMIN_ACTIVITY_FEED,
  DEPT_SUMMARIES,
  ANNOUNCEMENTS,
  GATE_ENTRY_LOG,
  GATE_DAILY_STATS,
} from '@/lib/demo/schoolUniverse';

/* ── Lucide-style inline SVG icons ─────────────────────────────────── */
const Icon = {
  LayoutDashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  ),
  Truck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.684-.948V8a1 1 0 0 1 1-1h1.382a1 1 0 0 1 .894.553l1.448 2.894A1 1 0 0 0 20.382 11H22"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Coins: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="M16.71 13.88l.7.71-2.82 2.82"/></svg>
  ),
  HelpCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  TrendingUp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  TrendingDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
  ),
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  ),
  Sparkles: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  ),
};

/* ── Dept icon mapping ─────────────────────────────────────────────── */
const DEPT_ICON_MAP: Record<string, React.FC> = {
  Academics: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Transport: Icon.Truck,
  Security: Icon.Shield,
  Canteen: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  Library: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
};

/* ── Feed icon mapping ──────────────────────────────────────────────── */
const FEED_TYPE_ICON: Record<string, React.FC> = {
  reward: Icon.Coins,
  transport: Icon.Truck,
  gate: Icon.Shield,
  academic: Icon.CheckCircle,
  alert: Icon.AlertTriangle,
};

/* ── Greeting helper ───────────────────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/* ── Time-of-day for current display ───────────────────────────────── */
function getTodayLabel(): string {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

interface AdminDashboardClientProps {
  stats: {
    totalStudents: number;
    needsAttention: number;
    onTrack: number;
    attendanceRate: number;
    moodIndex: number;
    activePasses: number;
    pendingPasses: number;
    activeTrips: number;
    todayScans: number;
    activeDevices: number;
    teacherAlertCount: number;
  };
  teacherMetrics: any[];
  adminId?: string | null;
  adminName?: string;
  opsInsight?: AdminOpsInsight;
  recentScans?: any[];
}

export default function AdminDashboardClient({
  stats, teacherMetrics, adminId = null, adminName = 'Administrator', opsInsight, recentScans = [],
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { registerRecipientId } = useNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'logistics' | 'security' | 'rewards'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (adminId) registerRecipientId(adminId);
  }, [adminId, registerRecipientId]);

  useEffect(() => {
    const supabase = createClient();
    let timer: NodeJS.Timeout | null = null;
    const debouncedRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        router.refresh();
      }, 500);
    };

    const channel = supabase
      .channel('mission-control-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_trips' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_journey' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journey_alerts' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_flags' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gate_passes' }, debouncedRefresh)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debouncedRefresh();
      });
    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [router]);

  const totalStudents = Math.max(stats.totalStudents, 1);
  const healthIndex = Math.round((stats.attendanceRate * 0.6) + ((stats.onTrack / totalStudents) * 100 * 0.4));

  /* ── Build AI Morning Brief summary points ───────────────────────── */
  const briefPoints = useMemo(() => {
    const pts: { text: string; severity: 'red' | 'amber' | 'green' | 'blue' }[] = [];
    if (stats.needsAttention > 0) {
      pts.push({ text: `${stats.needsAttention} student intervention${stats.needsAttention > 1 ? 's' : ''} require${stats.needsAttention === 1 ? 's' : ''} review.`, severity: 'red' });
    }
    if (stats.attendanceRate < 96) {
      pts.push({ text: `Attendance is at ${stats.attendanceRate}% — below the 96% target.`, severity: 'amber' });
    } else {
      pts.push({ text: `Attendance is healthy at ${stats.attendanceRate}%.`, severity: 'green' });
    }
    if (stats.activeTrips > 0) {
      pts.push({ text: `${stats.activeTrips} bus route${stats.activeTrips > 1 ? 's are' : ' is'} currently active.`, severity: 'blue' });
    }
    if (stats.pendingPasses > 0) {
      pts.push({ text: `${stats.pendingPasses} gate pass request${stats.pendingPasses > 1 ? 's' : ''} awaiting approval.`, severity: 'amber' });
    }
    pts.push({ text: 'Campus safety systems are operating normally.', severity: 'green' });
    return pts;
  }, [stats]);

  const estimatedMinutes = useMemo(() => {
    let m = 2;
    if (stats.needsAttention > 0) m += stats.needsAttention * 1.5;
    if (stats.pendingPasses > 0) m += stats.pendingPasses * 0.5;
    return Math.round(m);
  }, [stats]);

  /* ── Priority queue items ────────────────────────────────────────── */
  const priorityItems = useMemo(() => {
    const items: { label: string; severity: 'red' | 'amber' | 'blue'; affected: string; suggestion: string; time: string }[] = [];
    if (stats.needsAttention > 0) {
      items.push({
        label: 'Student Interventions Pending',
        severity: 'red',
        affected: `${stats.needsAttention} student${stats.needsAttention > 1 ? 's' : ''}`,
        suggestion: 'Review flagged student profiles',
        time: `~${Math.ceil(stats.needsAttention * 1.5)} min`,
      });
    }
    if (stats.pendingPasses > 0) {
      items.push({
        label: 'Gate Pass Requests',
        severity: 'amber',
        affected: `${stats.pendingPasses} request${stats.pendingPasses > 1 ? 's' : ''}`,
        suggestion: 'Approve or decline pending passes',
        time: '~30 sec each',
      });
    }
    if (stats.teacherAlertCount > 0) {
      items.push({
        label: 'Active Alerts to Review',
        severity: 'amber',
        affected: `${stats.teacherAlertCount} alert${stats.teacherAlertCount > 1 ? 's' : ''}`,
        suggestion: 'Confirm alert ownership',
        time: `~${stats.teacherAlertCount} min`,
      });
    }
    if (stats.activeTrips > 0) {
      items.push({
        label: 'Transport Routes In Progress',
        severity: 'blue',
        affected: `${stats.activeTrips} route${stats.activeTrips > 1 ? 's' : ''}`,
        suggestion: 'Monitor until completion',
        time: 'Ongoing',
      });
    }
    return items;
  }, [stats]);

  /* ── Department health data with trend ───────────────────────────── */
  const deptHealth = useMemo(() => {
    return DEPT_SUMMARIES.map(d => ({
      name: d.dept,
      status: d.status === 'good' ? 'Healthy' : 'Attention',
      metric: d.metric,
      trend: d.status === 'good' ? 'up' as const : 'down' as const,
      icon: d.dept,
    }));
  }, []);

  /* ── Announcement timeline ───────────────────────────────────────── */
  const bulletinTimeline = useMemo(() => {
    return ANNOUNCEMENTS.slice(0, 4).map(a => ({
      id: a.id,
      title: a.title,
      date: a.date,
      priority: a.priority,
      author: a.author,
    }));
  }, []);

  const sidebarLinks = [
    { label: 'Dashboard', icon: Icon.LayoutDashboard, tab: 'overview' as const },
    { label: 'Logistics', icon: Icon.Truck, tab: 'logistics' as const },
    { label: 'Security', icon: Icon.Shield, tab: 'security' as const },
    { label: 'Rewards', icon: Icon.Coins, tab: 'rewards' as const },
  ];

  const firstName = adminName?.split(' ')[0] || 'Principal';

  /* ── Severity color tokens ───────────────────────────────────────── */
  const sevColor = {
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  };

  return (
    <div className="admin-mission-control min-h-screen bg-[#fafbfc] font-body text-ink antialiased flex">
      {/* Subtle background gradient - very soft */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[10%] w-[800px] h-[600px] rounded-full bg-primary/[0.04] blur-[160px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[500px] rounded-full bg-sage/[0.03] blur-[140px]" />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar ──────────────────────────────────────────────── */}
      <aside className={`fixed md:sticky top-0 h-screen z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-[240px] flex-shrink-0 flex flex-col bg-white/90 border-r border-gray-200/60 backdrop-blur-xl`}>
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-5"/></svg>
            </div>
            <div>
              <strong className="font-display text-[13px] font-extrabold text-ink leading-none block">ShikshaSetu</strong>
              <span className="block text-[9px] font-semibold text-muted/50 uppercase tracking-[0.12em] mt-0.5">School Operations</span>
            </div>
          </div>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 px-3 space-y-0.5 py-4 overflow-y-auto">
          {sidebarLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => { setActiveTab(link.tab); setSidebarOpen(false); }}
                className={`w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  activeTab === link.tab
                    ? 'bg-primary/[0.08] text-primary font-semibold'
                    : 'text-muted/80 hover:text-ink hover:bg-gray-50'
                }`}
              >
                <span className={activeTab === link.tab ? 'text-primary' : 'text-muted/50 group-hover:text-primary transition-colors'}><link.icon /></span>
                <span>{link.label}</span>
              </button>
            )
          )}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100 space-y-1">
          <Link href="mailto:hello@shikshasetu.com" className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-muted/50 hover:text-ink hover:bg-gray-50 transition-all">
            <Icon.HelpCircle />
            <span>Support</span>
          </Link>
          <SignOutButton className="w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-rose-600 hover:bg-rose-50 transition-all">
            <span>🚪</span>
            <span>Sign Out</span>
          </SignOutButton>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen relative z-10">
        {/* Topbar */}
        <header className="sticky top-0 z-20 px-5 lg:px-8 py-3 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-muted/70"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <Icon.X /> : <Icon.Menu />}
            </button>
            <span className="hidden md:block text-[13px] font-medium text-muted/60">{getTodayLabel()}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{firstName[0]}</span>
              </div>
              <span className="text-[13px] font-medium text-ink">{adminName}</span>
            </div>
            <NotificationBell />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </header>

        <motion.main
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="admin-mission-content px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-12"
        >
          {/* ─── COPILOT STRIP ─────────────────────────────────────── */}
          <PrincipalCopilotStrip />

          {/* ═══════════════════════════════════════════════════════════
              PRIMARY: AI MORNING BRIEF
              ═══════════════════════════════════════════════════════════ */}
          <motion.section variants={fadeSlideUp} className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 lg:p-10 shadow-sm border border-gray-200/60">
            {/* Decorative gradient */}
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/[0.06] blur-[80px] pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-sage/[0.04] blur-[60px] pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8 items-start">
              <div className="space-y-5">
                {/* Greeting */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Icon.Sparkles />
                    <span className="text-[11px] font-semibold uppercase tracking-widest">AI Morning Brief</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-ink tracking-tight leading-tight">
                    {getGreeting()}, {firstName}
                  </h1>
                  <p className="text-sm text-muted/70 font-medium max-w-xl leading-relaxed">
                    Everything across campus has been analyzed. Here's what needs your attention today.
                  </p>
                </div>

                {/* Brief points */}
                <div className="space-y-2">
                  {briefPoints.map((pt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                      className="flex items-start gap-2.5"
                    >
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${sevColor[pt.severity].dot}`} />
                      <span className={`text-sm font-medium ${pt.severity === 'green' ? 'text-muted/70' : 'text-ink'}`}>
                        {pt.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Estimated review time + CTA */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-muted/60">
                    <Icon.Clock />
                    <span className="text-[12px] font-medium">Estimated review time: <strong className="text-ink font-semibold">{estimatedMinutes} minutes</strong></span>
                  </div>
                  {priorityItems.length > 0 && (
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-all shadow-md">
                      Review Today's Priorities
                      <Icon.ArrowRight />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Campus Health Score ─────────────────────────────── */}
              <div className="relative rounded-2xl bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 p-5 text-center border border-emerald-200/50">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/80 block">Campus Health</span>
                <motion.strong
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="font-display text-5xl font-black text-emerald-700 block mt-2 tracking-tight"
                >
                  {Math.min(healthIndex, 100)}%
                </motion.strong>
                <p className="text-[10px] font-medium text-emerald-600/60 mt-1.5">Attendance & Engagement</p>
              </div>
            </div>
          </motion.section>

          {activeTab === 'overview' && (
            <motion.div variants={staggerContainer} className="space-y-8">

              {/* ═══════════════════════════════════════════════════════
                  SECONDARY: KPI Strip — 4 supporting metrics
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeSlideUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Attendance', value: `${stats.attendanceRate}%`, color: 'emerald' },
                  { label: 'Support Cases', value: `${stats.needsAttention}`, color: stats.needsAttention > 0 ? 'red' : 'emerald' },
                  { label: 'Gate Pass Requests', value: `${stats.activePasses + stats.pendingPasses}`, color: stats.pendingPasses > 0 ? 'amber' : 'emerald' },
                  { label: "Today's Campus Entries", value: `${stats.todayScans}`, color: 'blue' },
                ].map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="rounded-xl bg-white p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-[11px] font-semibold text-muted/60 uppercase tracking-wider">{kpi.label}</p>
                    <strong className={`text-2xl font-extrabold block mt-1 ${
                      kpi.color === 'emerald' ? 'text-emerald-700' :
                      kpi.color === 'red' ? 'text-red-600' :
                      kpi.color === 'amber' ? 'text-amber-700' :
                      'text-blue-700'
                    }`}>
                      {kpi.value}
                    </strong>
                  </motion.div>
                ))}
              </motion.div>

              {/* ═══════════════════════════════════════════════════════
                  SECONDARY: Today's Priorities — Premium task queue
                  ═══════════════════════════════════════════════════════ */}
              {priorityItems.length > 0 && (
                <motion.section variants={fadeSlideUp} className="rounded-2xl bg-white p-6 lg:p-7 shadow-sm border border-gray-200/60">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-display text-lg font-extrabold text-ink">Today's Priorities</h2>
                      <p className="text-[12px] text-muted/60 mt-0.5 font-medium">Items sorted by urgency — most critical first</p>
                    </div>
                    {opsInsight && (
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        opsInsight.priority === 'urgent' ? 'bg-red-50 text-red-600 border border-red-200/60' :
                        opsInsight.priority === 'watch' ? 'bg-amber-50 text-amber-600 border border-amber-200/60' :
                        'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                      }`}>
                        {opsInsight.priority === 'urgent' ? 'Requires Action' : opsInsight.priority === 'watch' ? 'Monitoring' : 'All Clear'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {priorityItems.map((item, index) => {
                      const c = sevColor[item.severity];
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06 }}
                          className={`group rounded-xl p-4 transition-all border ${c.border} ${c.bg} hover:shadow-sm`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                                <h3 className="text-sm font-semibold text-ink">{item.label}</h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-muted/70">
                                <span className="flex items-center gap-1">
                                  <Icon.Users />
                                  {item.affected}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon.Clock />
                                  {item.time}
                                </span>
                              </div>
                              <p className="text-[12px] text-muted/60 mt-1.5">{item.suggestion}</p>
                            </div>
                            <button className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                              item.severity === 'red'
                                ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                                : 'bg-white text-ink border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}>
                              Review
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* ═══════════════════════════════════════════════════════
                  SECONDARY: School Health + Live Activity side by side
                  ═══════════════════════════════════════════════════════ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── School Health ─────────────────────────────────── */}
                <motion.section variants={fadeSlideUp} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200/60">
                  <h2 className="font-display text-base font-extrabold text-ink mb-4">School Health</h2>
                  <div className="space-y-2">
                    {deptHealth.map((dept, i) => {
                      const DeptIcon = DEPT_ICON_MAP[dept.name] || Icon.Activity;
                      const isHealthy = dept.status === 'Healthy';
                      return (
                        <motion.div
                          key={dept.name}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all cursor-pointer ${
                            isHealthy
                              ? 'bg-gray-50/80 hover:bg-emerald-50/50'
                              : 'bg-amber-50/50 hover:bg-amber-50/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`${isHealthy ? 'text-emerald-600' : 'text-amber-600'}`}>
                              <DeptIcon />
                            </span>
                            <span className="text-[13px] font-semibold text-ink">{dept.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[11px] font-medium ${isHealthy ? 'text-emerald-600' : 'text-amber-700'}`}>
                              {dept.status}
                            </span>
                            <span className={isHealthy ? 'text-emerald-500' : 'text-amber-600'}>
                              {dept.trend === 'up' ? <Icon.TrendingUp /> : <Icon.TrendingDown />}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>

                {/* ── Recent Activity ──────────────────────────────── */}
                <motion.section variants={fadeSlideUp} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200/60">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-base font-extrabold text-ink">Recent Activity</h2>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/50">
                      <motion.span
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                      />
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Live</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {ADMIN_ACTIVITY_FEED.slice(0, 6).map((item, i) => {
                      const FeedIcon = FEED_TYPE_ICON[item.type] || Icon.Activity;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.04 }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-muted/40 group-hover:text-primary transition-colors flex-shrink-0">
                            <FeedIcon />
                          </span>
                          <p className="text-[12px] font-medium text-ink/80 flex-1 min-w-0 truncate">{item.event}</p>
                          <span className="text-[10px] font-medium text-muted/40 flex-shrink-0 tabular-nums">{item.time}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              </div>

              {/* ═══════════════════════════════════════════════════════
                  SUPPORTING: Care Analytics summary strip
                  ═══════════════════════════════════════════════════════ */}
              <motion.section variants={fadeSlideUp} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-display text-base font-extrabold text-ink">Support Progress</h2>
                    <p className="text-[12px] text-muted/60 mt-0.5 font-medium">School-wide intervention response & recovery</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60 self-start sm:self-auto">
                    Recovery Rate: 89%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Resolved Cases', value: '15 / 18', sub: '83%' },
                    { label: 'First Response', value: '6.2 hrs', accent: true },
                    { label: 'Resolution Time', value: '5.4 days', accent: true },
                    { label: 'Early Supported', value: '32', sub: 'students' },
                    { label: 'Prevented Escalations', value: '21', sub: 'cases' },
                    { label: 'Family Engagement', value: '76%', sub: 'active' },
                  ].map((m, i) => (
                    <div key={m.label} className="p-3 rounded-xl bg-gray-50/80">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted/50">{m.label}</p>
                      <strong className={`text-lg font-extrabold block mt-1 ${m.accent ? 'text-emerald-700' : 'text-ink'}`}>{m.value}</strong>
                      {m.sub && <span className="text-[10px] text-muted/40 font-medium">{m.sub}</span>}
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* ═══════════════════════════════════════════════════════
                  SUPPORTING: Campus Bulletins — Timeline style
                  ═══════════════════════════════════════════════════════ */}
              <motion.section variants={fadeSlideUp} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200/60">
                <h2 className="font-display text-base font-extrabold text-ink mb-5">Campus Bulletins</h2>
                <div className="relative pl-5">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-200" />

                  <div className="space-y-4">
                    {bulletinTimeline.map((b, i) => (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="relative flex items-start gap-4"
                      >
                        {/* Timeline dot */}
                        <span className={`absolute -left-5 mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white z-10 ${
                          b.priority === 'high' ? 'bg-amber-500' : 'bg-gray-300'
                        }`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-muted/50 uppercase tracking-wider flex-shrink-0">{b.date}</span>
                            {b.priority === 'high' && (
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Important</span>
                            )}
                          </div>
                          <p className="text-[13px] font-semibold text-ink mt-0.5">{b.title}</p>
                          <p className="text-[11px] text-muted/50 mt-0.5">{b.author}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════
              LOGISTICS TAB — Transport overview
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'logistics' && (
            <motion.div variants={staggerContainer} className="space-y-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/50">Transport Operations</p>
                <h2 className="font-display text-xl font-extrabold text-ink">Logistics Overview</h2>
                <p className="mt-1 text-sm text-muted/60 font-medium">Bus routes, driver status, and student transport tracking.</p>
              </div>

              {/* Transport KPIs */}
              <motion.div variants={fadeSlideUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Active Routes', value: `${stats.activeTrips}`, color: stats.activeTrips > 0 ? 'blue' : 'emerald' },
                  { label: 'Students On Track', value: `${stats.onTrack}`, color: 'emerald' },
                  { label: 'Today\'s Scans', value: `${stats.todayScans}`, color: 'blue' },
                  { label: 'Active Devices', value: `${stats.activeDevices}`, color: 'emerald' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl bg-white p-4 border border-gray-200/60 shadow-sm">
                    <p className="text-[11px] font-semibold text-muted/60 uppercase tracking-wider">{kpi.label}</p>
                    <strong className={`text-2xl font-extrabold block mt-1 ${
                      kpi.color === 'emerald' ? 'text-emerald-700' : 'text-blue-700'
                    }`}>{kpi.value}</strong>
                  </div>
                ))}
              </motion.div>

              {/* Route Status */}
              <motion.section variants={fadeSlideUp} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200/60">
                <h3 className="font-display text-base font-extrabold text-ink mb-4">Route Status</h3>
                <div className="space-y-2">
                  {[
                    { route: 'BUS-001', driver: 'Rajesh Kumar', stops: 'Sector 12 → DPS-14', students: '14/14', status: 'Completed' as const },
                    { route: 'BUS-002', driver: 'Anil Sharma', stops: 'Rajouri Garden → DPS-14', students: '12/12', status: 'Completed' as const },
                    { route: 'BUS-003', driver: 'Suresh Yadav', stops: 'Paschim Vihar → DPS-14', students: '11/11', status: 'Completed' as const },
                    { route: 'BUS-004', driver: 'Mohan Das', stops: 'Pitampura → DPS-14', students: '9/10', status: 'Delayed' as const },
                  ].map((r) => (
                    <div key={r.route} className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                      r.status === 'Completed' ? 'bg-emerald-50/50' : 'bg-amber-50/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={r.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}><Icon.Truck /></span>
                        <div>
                          <span className="text-[13px] font-semibold text-ink">{r.route}</span>
                          <p className="text-[11px] text-muted/50">{r.driver} · {r.stops}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-medium text-muted/60">{r.students} students</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Transport Activity Feed */}
              <motion.section variants={fadeSlideUp} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200/60">
                <h3 className="font-display text-base font-extrabold text-ink mb-4">Transport Activity</h3>
                <div className="space-y-1">
                  {ADMIN_ACTIVITY_FEED.filter(e => e.type === 'transport').map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-blue-500 flex-shrink-0"><Icon.Truck /></span>
                      <p className="text-[12px] font-medium text-ink/80 flex-1 min-w-0 truncate">{item.event}</p>
                      <span className="text-[10px] font-medium text-muted/40 flex-shrink-0 tabular-nums">{item.time}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════
              SECURITY TAB — Gate & Campus Security
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <motion.div variants={staggerContainer} className="space-y-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/50">Campus Security</p>
                <h2 className="font-display text-xl font-extrabold text-ink">Gate & Security</h2>
                <p className="mt-1 text-sm text-muted/60 font-medium">Gate entry log, pass management, and campus access control.</p>
              </div>

              {/* Security KPIs */}
              <motion.div variants={fadeSlideUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Entries', value: `${GATE_DAILY_STATS.totalEntries}`, color: 'blue' },
                  { label: 'Students In', value: `${GATE_DAILY_STATS.studentsIn}`, color: 'emerald' },
                  { label: 'Late Arrivals', value: `${GATE_DAILY_STATS.lateArrivals}`, color: GATE_DAILY_STATS.lateArrivals > 10 ? 'amber' : 'emerald' },
                  { label: 'Gate Pass Exits', value: `${GATE_DAILY_STATS.gatePassExits}`, color: 'blue' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl bg-white p-4 border border-gray-200/60 shadow-sm">
                    <p className="text-[11px] font-semibold text-muted/60 uppercase tracking-wider">{kpi.label}</p>
                    <strong className={`text-2xl font-extrabold block mt-1 ${
                      kpi.color === 'emerald' ? 'text-emerald-700' :
                      kpi.color === 'amber' ? 'text-amber-700' :
                      'text-blue-700'
                    }`}>{kpi.value}</strong>
                  </div>
                ))}
              </motion.div>

              {/* Gate Entry Log */}
              <motion.section variants={fadeSlideUp} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200/60">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base font-extrabold text-ink">Today's Entry Log</h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/50">
                    <motion.span
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                    />
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Live</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {GATE_ENTRY_LOG.map((entry, i) => {
                    const statusColor = entry.status === 'verified' ? 'emerald' :
                                        entry.status === 'late' ? 'amber' :
                                        entry.status === 'gate-pass' ? 'blue' : 'purple';
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`flex-shrink-0 ${
                            statusColor === 'emerald' ? 'text-emerald-500' :
                            statusColor === 'amber' ? 'text-amber-500' :
                            statusColor === 'blue' ? 'text-blue-500' : 'text-purple-500'
                          }`}>
                            <Icon.Shield />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-ink truncate">{entry.name}</p>
                            <p className="text-[10px] text-muted/50">{entry.grade} · {entry.mode === 'entry' ? 'Entry' : 'Exit'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-medium text-muted/40 tabular-nums">{entry.time}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                            statusColor === 'amber' ? 'bg-amber-100 text-amber-700' :
                            statusColor === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>{entry.status === 'verified' ? 'Verified' : entry.status === 'late' ? 'Late' : entry.status === 'gate-pass' ? 'Gate Pass' : 'Visitor'}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>

              {/* Pending Gate Passes */}
              {stats.pendingPasses > 0 && (
                <motion.section variants={fadeSlideUp} className="rounded-2xl bg-amber-50/50 p-6 shadow-sm border border-amber-200/50">
                  <h3 className="font-display text-base font-extrabold text-ink mb-2">Pending Gate Pass Requests</h3>
                  <p className="text-[12px] text-muted/60 mb-4">{stats.pendingPasses} request{stats.pendingPasses > 1 ? 's' : ''} awaiting your approval.</p>
                  <button className="px-4 py-2 rounded-lg bg-amber-600 text-white text-[13px] font-semibold hover:bg-amber-700 transition-all shadow-sm">
                    Review Requests
                  </button>
                </motion.section>
              )}
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.section variants={fadeSlideUp} className="space-y-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/50">Administration</p>
                <h2 className="font-display text-xl font-extrabold text-ink">Campus Coins</h2>
                <p className="mt-1 text-sm text-muted/60 font-medium">Manage the school rewards system.</p>
              </div>
              <AdminRewardsPanel />
            </motion.section>
          )}
        </motion.main>
      </div>
    </div>
  );
}
