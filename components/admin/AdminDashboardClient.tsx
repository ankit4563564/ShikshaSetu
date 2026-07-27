'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
  GATE_DAILY_STATS,
  VENDOR_STATS_TODAY,
  ATTENDANCE_SUMMARY,
} from '@/lib/demo/schoolUniverse';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (adminId) registerRecipientId(adminId);
  }, [adminId, registerRecipientId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('mission-control-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_trips' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_journey' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journey_alerts' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_flags' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gate_passes' }, () => router.refresh())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') router.refresh();
      });
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  const totalStudents = Math.max(stats.totalStudents, 1);
  const healthIndex = Math.round((stats.attendanceRate * 0.6) + ((stats.onTrack / totalStudents) * 100 * 0.4));
  const boardingRate = stats.activeTrips > 0 ? Math.round(stats.onTrack / totalStudents * 100) : 0;

  const sidebarLinks = [
    { label: 'Dashboard', icon: '📊', tab: 'overview' as const },
    { label: 'Logistics', icon: '🚌', href: '/driver' },
    { label: 'Security', icon: '🛡️', href: '/gate' },
    { label: 'Rewards', icon: '🪙', tab: 'rewards' as const },
  ];

  const scanModeLabel: Record<string, string> = {
    transport_board: '🚌 Boarded bus',
    transport_deboard: '🚌 Deboarded bus',
    gate_entry: '🚪 Gate entry',
    gate_exit: '🚪 Gate exit',
    attendance: '✅ Attendance',
  };

  return (
    <div className="admin-mission-control min-h-screen bg-paper font-body text-ink antialiased flex">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[6%] w-[650px] h-[650px] rounded-full bg-primary/12 blur-[130px]" />
        <div className="absolute top-[12%] right-[8%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[130px]" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 flex-shrink-0 flex flex-col bg-white/80 border-r border-primary/10 backdrop-blur-xl shadow-sm`}>
        <div className="px-6 py-5 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xl shadow-inner">🎓</div>
            <div>
              <strong className="font-display text-sm font-extrabold text-primary leading-none block">ShikshaSetu</strong>
              <small className="block text-[9px] font-extrabold text-muted/70 uppercase tracking-[0.14em] mt-1">Mission Control</small>
            </div>
          </div>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 px-4 space-y-1.5 py-6 overflow-y-auto">
          {sidebarLinks.map((link) =>
            'href' in link ? (
              <Link
                key={link.label}
                href={link.href!}
                className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-primary hover:bg-primary/[0.06] transition-all"
              >
                <span className="text-base leading-none">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ) : (
              <button
                key={link.label}
                type="button"
                onClick={() => { setActiveTab(link.tab!); setSidebarOpen(false); }}
                className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === link.tab 
                    ? 'bg-primary/10 text-primary shadow-sm font-extrabold' 
                    : 'text-muted hover:text-primary hover:bg-primary/[0.06]'
                }`}
              >
                <span className="text-base leading-none">{link.icon}</span>
                <span>{link.label}</span>
              </button>
            )
          )}
        </nav>

        <div className="px-4 py-4 border-t border-primary/10">
          <Link href="mailto:hello@shikshasetu.com" className="group flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted/60 hover:text-primary hover:bg-primary/[0.04] transition-all">
            <span className="text-sm leading-none">❓</span>
            <span>Support</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen relative z-10">
        {/* Topbar Header */}
        <header className="sticky top-0 z-20 px-6 lg:px-8 py-4 border-b border-primary/10 bg-white/70 backdrop-blur-md flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors text-ink"
              aria-label="Toggle sidebar"
            >
              <span className="text-lg leading-none">{sidebarOpen ? '✕' : '☰'}</span>
            </button>
            <div className="md:hidden flex items-center gap-2">
              <span className="text-lg">🎓</span>
              <strong className="font-display text-sm font-extrabold text-primary">ShikshaSetu</strong>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-bold text-muted/60 uppercase tracking-widest">Portal /</span>
              <span className="text-xs font-extrabold text-ink capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
              <span className="text-xs font-bold text-ink">{adminName}</span>
            </div>
            <NotificationBell />
            <div className="flex items-center gap-1.5 bg-sage/10 border border-sage/20 px-2.5 py-1 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-sage animate-pulse" />
              <span className="text-[10px] font-extrabold text-sage uppercase tracking-wider">Online</span>
            </div>
          </div>
        </header>

        <motion.main
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="admin-mission-content px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-8"
        >
          {/* ShikshaSetu Copilot Strip */}
          <PrincipalCopilotStrip />
          {/* Hero Banner - Executive Control Overview */}
          <motion.section variants={fadeSlideUp} className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-white/90 via-white/75 to-primary/[0.03] p-6 sm:p-8 shadow-md backdrop-blur-xl">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
              <div className="lg:col-span-3 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/15">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Live School Control</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight">
                  School Operations Overview
                </h1>
                <p className="text-xs sm:text-sm text-muted/80 max-w-2xl font-medium leading-relaxed">
                  Real-time updates on attendance, bus tracking, and daily activity across all 7 school departments.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-ink">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage/10 border border-sage/20 text-sage font-extrabold">
                    ✅ {stats.attendanceRate}% Attendance
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-extrabold">
                    🎯 {stats.onTrack}/{totalStudents} Students On Track
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary font-extrabold">
                    🚌 {stats.activeTrips} Active Routes
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage/15 border border-sage/30 text-sage font-extrabold">
                    🛡️ Student Safety Check: 100% Verified
                  </span>
                </div>
              </div>
              
              {/* School Health Index Widget */}
              <div className="lg:col-span-1 relative overflow-hidden rounded-2xl border border-sage/30 bg-gradient-to-b from-sage/15 to-sage/5 p-5 shadow-sm text-center lg:text-left">
                <div className="flex items-center justify-between">
                  <small className="text-[10px] font-extrabold uppercase tracking-widest text-sage">Campus Health</small>
                  <span className="flex h-2 w-2 rounded-full bg-sage animate-ping" />
                </div>
                <strong className="font-display text-5xl font-black text-sage block mt-2 tracking-tight">{Math.min(healthIndex, 100)}%</strong>
                <p className="text-[10px] font-semibold text-muted/70 mt-1">Attendance & Engagement Index</p>
              </div>
            </div>
          </motion.section>

          {activeTab === 'overview' && (
            <motion.div variants={staggerContainer} className="space-y-6">
              {/* 🌱 CARE ANALYTICS™ (School Support Outcome Metrics) */}
              <motion.section variants={fadeSlideUp} className="rounded-3xl border border-sage/30 bg-gradient-to-br from-sage/10 via-white to-primary/5 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sage/20 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌱</span>
                      <h3 className="font-display text-lg font-black text-ink">Care Analytics™ & School Climate</h3>
                    </div>
                    <p className="text-xs font-semibold text-muted/80 mt-0.5">
                      School-wide support response time, resolution rates & early intervention metrics.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sage/20 text-sage font-extrabold text-[10px] uppercase tracking-wider self-start sm:self-auto">
                    Recovery Rate: 89%
                  </span>
                </div>

                {/* 6 CARE OUTCOME METRICS */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted/60 block">Resolved Cases</span>
                    <strong className="text-xl font-black text-ink block mt-0.5">15 / 18 (83%)</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted/60 block">First Response</span>
                    <strong className="text-xl font-black text-sage block mt-0.5">6.2 Hours</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted/60 block">Resolution Time</span>
                    <strong className="text-xl font-black text-sage block mt-0.5">5.4 Days</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted/60 block">Early Supported</span>
                    <strong className="text-xl font-black text-primary block mt-0.5">32 Students</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted/60 block">Escalations Prevented</span>
                    <strong className="text-xl font-black text-sage block mt-0.5">21 Cases</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/90 border border-sage/20 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted/60 block">Family Activity Rate</span>
                    <strong className="text-xl font-black text-primary block mt-0.5">76% Active</strong>
                  </div>
                </div>

                {/* SCHOOL CLIMATE SUMMARY */}
                <div className="p-4 rounded-2xl bg-white/80 border border-sage/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-4">
                    <span className="text-sage font-black">🌍 School Climate: 92% Positive</span>
                    <span className="text-muted/70">· Most Positive: Grade 6</span>
                    <span className="text-muted/70">· Additional Support: Grade 9</span>
                  </div>
                  <span className="text-primary font-bold">Top Activity: 🌿 Evening Walks</span>
                </div>
              </motion.section>

              {/* Quick KPI Stat Cards */}
              <motion.div variants={fadeSlideUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/80 border border-primary/10 shadow-xs hover:shadow-md transition-all">
                  <span className="text-xl">👨‍🎓</span>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted/60 mt-2">Total Students</p>
                  <strong className="text-2xl font-black text-ink block mt-0.5">{stats.totalStudents}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-white/80 border border-warm-clay/20 shadow-xs hover:shadow-md transition-all">
                  <span className="text-xl">⚠️</span>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-warm-clay mt-2">Needs Attention</p>
                  <strong className="text-2xl font-black text-warm-clay block mt-0.5">{stats.needsAttention}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-white/80 border border-primary/10 shadow-xs hover:shadow-md transition-all">
                  <span className="text-xl">🎫</span>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted/60 mt-2">Active Gate Passes</p>
                  <strong className="text-2xl font-black text-ink block mt-0.5">{stats.activePasses}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-white/80 border border-sage/20 shadow-xs hover:shadow-md transition-all">
                  <span className="text-xl">📲</span>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-sage mt-2">Today's Scans</p>
                  <strong className="text-2xl font-black text-sage block mt-0.5">{stats.todayScans}</strong>
                </div>
              </motion.div>

              {/* Priority Actions Section */}
              {opsInsight && (
                <motion.section variants={fadeSlideUp} className="rounded-3xl border border-primary/15 bg-white/85 p-6 lg:p-7 shadow-sm backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-display text-lg font-extrabold text-ink flex items-center gap-2">
                        <span>🎯</span> Priority Operational Actions
                      </h2>
                      <p className="text-xs text-muted/70 mt-0.5">Automated AI priority queue based on real-time alerts</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                      opsInsight.priority === 'urgent' ? 'bg-warm-clay/15 text-warm-clay border border-warm-clay/30' : 'bg-sage/15 text-sage border border-sage/30'
                    }`}>{opsInsight.priority} Priority</span>
                  </div>
                  <p className="text-sm font-bold text-ink mb-4 bg-primary/5 p-3 rounded-xl border border-primary/10">{opsInsight.headline}</p>
                  {opsInsight.queue.length > 0 && (
                    <div className="space-y-2.5">
                      {opsInsight.queue.map((item, index) => (
                        <div key={item} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                          index === 0 && opsInsight.priority === 'urgent' ? 'bg-warm-clay/5 border border-warm-clay/30 text-warm-clay shadow-xs' : 'bg-white/90 border border-primary/10 text-ink hover:border-primary/25'
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className="text-base">{index === 0 && opsInsight.priority === 'urgent' ? '🔴' : '🔹'}</span>
                            <span>{item}</span>
                          </div>
                          <button className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-extrabold hover:bg-primary hover:text-white transition-all text-[11px]">
                            Review →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.section>
              )}

              {/* Department Health & Live Feed Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Health Section */}
                <motion.section variants={fadeSlideUp} className="rounded-3xl border border-primary/15 bg-white/85 p-6 shadow-sm backdrop-blur-md">
                  <div className="mb-4">
                    <h2 className="font-display text-lg font-extrabold text-ink flex items-center gap-2">
                      <span>🏫</span> Department Status
                    </h2>
                    <p className="text-xs text-muted/70 mt-0.5">Real-time telemetry across departments</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DEPT_SUMMARIES.map(dept => (
                      <div key={dept.dept} className={`rounded-xl border p-3.5 transition-all cursor-pointer hover:scale-[1.02] ${
                        dept.status === 'good' 
                          ? 'border-sage/25 bg-sage/5 hover:border-sage/40 shadow-xs' 
                          : 'border-amber-200 bg-amber-50/80 hover:border-amber-300 shadow-xs'
                      }`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-2xl">{dept.icon}</span>
                          <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dept.status === 'good' ? 'bg-sage animate-pulse' : 'bg-amber-400'}`} />
                        </div>
                        <p className="text-xs font-extrabold text-ink mt-2">{dept.dept}</p>
                        <p className={`text-[10px] mt-0.5 font-bold ${dept.status === 'good' ? 'text-sage' : 'text-amber-800'}`}>
                          {dept.metric}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Live Operations Feed Section */}
                <motion.section variants={fadeSlideUp} className="rounded-3xl border border-primary/15 bg-white/85 p-6 shadow-sm backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-display text-lg font-extrabold text-ink flex items-center gap-2">
                        <span>⚡</span> Live Activity Feed
                      </h2>
                      <p className="text-xs text-muted/70 mt-0.5">Real-time system events</p>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage/10 text-[10px] font-extrabold text-sage border border-sage/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-sage animate-ping" />
                      LIVE STREAM
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {ADMIN_ACTIVITY_FEED.slice(0, 5).map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-primary/10 text-xs hover:border-primary/30 shadow-2xs transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-lg flex-shrink-0">{item.icon}</span>
                          <p className="font-bold text-ink truncate">{item.event}</p>
                        </div>
                        <span className="whitespace-nowrap font-mono text-[10px] font-semibold text-muted/60 flex-shrink-0 bg-primary/5 px-2 py-1 rounded-md">{item.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              </div>

              {/* School Bulletin Section */}
              <motion.section variants={fadeSlideUp} className="rounded-3xl border border-primary/15 bg-white/85 p-6 shadow-sm backdrop-blur-md">
                <h2 className="font-display text-lg font-extrabold text-ink flex items-center gap-2">
                  <span>📢</span> School Bulletin & Announcements
                </h2>
                <p className="text-xs text-muted/70 mt-0.5">Important campus announcements and schedule updates</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {ANNOUNCEMENTS.slice(0, 2).map(a => (
                    <div key={a.id} className={`rounded-2xl p-4 border transition-all ${a.priority === 'high' ? 'border-amber-300 bg-amber-50/70 shadow-xs' : 'border-primary/15 bg-white shadow-xs'}`}>
                      <p className="text-xs font-black text-ink">{a.title}</p>
                      <p className="mt-2 text-[11px] text-muted/70 font-medium leading-relaxed">{a.date}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.section variants={fadeSlideUp} className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted/60">Mission Control</p>
                <h2 className="font-display text-xl font-extrabold text-ink">Campus Coins</h2>
                <p className="mt-1 text-sm text-muted">Manage the school rewards system.</p>
              </div>
              <AdminRewardsPanel />
            </motion.section>
          )}
        </motion.main>
      </div>
    </div>
  );
}
