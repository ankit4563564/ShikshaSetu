'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AiInsight, InsightCategory, InsightSeverity, InsightComparison } from '@/lib/insights/types';
import { INSIGHT_CATEGORY_LABELS, INSIGHT_CATEGORY_ICONS } from '@/lib/insights/types';

const CATEGORY_LABELS = INSIGHT_CATEGORY_LABELS;
const CATEGORY_ICONS = INSIGHT_CATEGORY_ICONS;

export { CATEGORY_LABELS, CATEGORY_ICONS };

/* ===== School Health Summary ===== */
export function SchoolHealthSummary({ health }: { health: any }) {
  const statusConfig = {
    excellent: { bg: 'bg-sage/8', border: 'border-sage/25', text: 'text-sage', accent: 'bg-sage', icon: '🌟', label: 'Excellent', desc: 'All systems running smoothly. School is in great shape today.' },
    good: { bg: 'bg-primary/8', border: 'border-primary/25', text: 'text-primary', accent: 'bg-primary', icon: '👍', label: 'Good', desc: 'School is performing well. A few areas could use attention.' },
    needs_attention: { bg: 'bg-marigold/8', border: 'border-marigold/25', text: 'text-marigold', accent: 'bg-marigold', icon: '⚠️', label: 'Needs Attention', desc: 'Some areas require immediate focus. Review alerts below.' },
    critical: { bg: 'bg-warm-clay/8', border: 'border-warm-clay/25', text: 'text-warm-clay', accent: 'bg-warm-clay', icon: '🔴', label: 'Critical', desc: 'Urgent issues detected. Take action immediately.' },
  };

  const status = statusConfig[health.status as keyof typeof statusConfig] || statusConfig.good;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${status.bg} ${status.border} overflow-hidden`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${status.accent}/15`}>
              <span className="text-3xl">{status.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40">School Health</p>
              <p className="font-display text-3xl font-extrabold text-deep-teal">{health.score}%</p>
              <p className={`text-sm font-bold ${status.text}`}>{status.label}</p>
            </div>
          </div>
          <div className="sm:ml-auto max-w-xs">
            <p className="text-xs text-deep-teal/60 leading-relaxed">{status.desc}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricBox label="Attendance" value={`${health.attendanceRate.toFixed(1)}%`} icon="📊" trend={health.attendanceRate >= 90 ? 'up' : health.attendanceRate >= 75 ? 'stable' : 'down'} />
          <MetricBox label="Homework" value={`${health.homeworkRate.toFixed(1)}%`} icon="📚" trend={health.homeworkRate >= 85 ? 'up' : health.homeworkRate >= 70 ? 'stable' : 'down'} />
          <MetricBox label="Wellness" value={`${health.wellnessScore.toFixed(0)}%`} icon="💚" trend={health.wellnessScore >= 70 ? 'up' : health.wellnessScore >= 50 ? 'stable' : 'down'} />
          <MetricBox label="Need Attention" value={health.highRiskStudents} icon="⚠️" trend={health.highRiskStudents <= 2 ? 'up' : health.highRiskStudents <= 5 ? 'stable' : 'down'} />
        </div>
      </div>
    </motion.div>
  );
}

function MetricBox({ label, value, icon, trend }: { label: string; value: string | number; icon: string; trend: 'up' | 'down' | 'stable' }) {
  const trendColors = { up: 'text-sage', down: 'text-warm-clay', stable: 'text-marigold' };
  const trendIcons = { up: '↑', down: '↓', stable: '→' };
  return (
    <div className="p-3 rounded-xl bg-white/60 border border-deep-teal/5">
      <div className="flex items-center justify-between">
        <span className="text-lg">{icon}</span>
        <span className={`text-[10px] font-bold ${trendColors[trend]}`}>{trendIcons[trend]}</span>
      </div>
      <p className="font-display text-xl font-extrabold text-deep-teal mt-1">{value}</p>
      <p className="text-[10px] font-bold text-deep-teal/40 mt-0.5">{label}</p>
    </div>
  );
}

/* ===== Daily AI Summary ===== */
export function DailyAISummary({ insights, date, comparison }: { insights: AiInsight[]; date: string; comparison: any }) {
  if (!date) return null;

  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const warningCount = insights.filter(i => i.severity === 'warning').length;
  const riskAlerts = insights.filter(i => i.riskAlert).length;
  const positiveCount = insights.filter(i => i.severity === 'positive').length;

  const summary = generateDailySummary(insights, comparison);

  const recommendedActions = generateRecommendedActions(insights);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-deep-teal/10 bg-white shadow-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-lg">🤖</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Daily AI Summary · {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-sm text-deep-teal/80 mt-2 leading-relaxed">{summary}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {criticalCount > 0 && <StatBadge value={criticalCount} label="Critical" color="warm-clay" icon="🔴" />}
              {warningCount > 0 && <StatBadge value={warningCount} label="Warnings" color="marigold" icon="🟠" />}
              {riskAlerts > 0 && <StatBadge value={riskAlerts} label="Risk Alerts" color="warm-clay" icon="⚠️" />}
              {positiveCount > 0 && <StatBadge value={positiveCount} label="Positive" color="sage" icon="🟢" />}
              {comparison && comparison.overall_change !== 0 && (
                <StatBadge
                  value={`${comparison.overall_change > 0 ? '+' : ''}${comparison.overall_change.toFixed(1)}%`}
                  label="vs Last Period"
                  color={comparison.overall_change > 0 ? 'sage' : 'warm-clay'}
                  icon={comparison.overall_change > 0 ? '📈' : '📉'}
                />
              )}
            </div>
          </div>
        </div>

        {recommendedActions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-deep-teal/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40 mb-2">Recommended Actions</p>
            <ul className="space-y-1.5">
              {recommendedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-deep-teal/70">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatBadge({ value, label, color, icon }: { value: number | string; label: string; color: string; icon: string }) {
  const colorMap: Record<string, string> = {
    'warm-clay': 'bg-warm-clay/10 text-warm-clay',
    marigold: 'bg-marigold/10 text-marigold',
    sage: 'bg-sage/10 text-sage',
    primary: 'bg-primary/10 text-primary',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${colorMap[color] || colorMap.primary}`}>
      <span>{icon}</span>
      <span>{typeof value === 'number' ? value : value}</span>
      <span className="opacity-70">{label}</span>
    </span>
  );
}

function generateDailySummary(insights: AiInsight[], comparison: any): string {
  const parts: string[] = [];
  const critical = insights.filter(i => i.severity === 'critical').length;
  const warning = insights.filter(i => i.severity === 'warning').length;
  const positive = insights.filter(i => i.severity === 'positive').length;

  if (critical > 0) parts.push(`${critical} critical issue${critical > 1 ? 's' : ''} need immediate attention.`);
  if (warning > 0) parts.push(`${warning} warning${warning > 1 ? 's' : ''} flagged for review.`);
  if (positive > 0) parts.push(`${positive} positive trend${positive > 1 ? 's' : ''} noted.`);

  if (comparison) {
    const change = comparison.overall_change;
    if (change > 5) parts.push(`Overall metrics improved by ${change.toFixed(1)}% vs last period.`);
    else if (change < -5) parts.push(`Overall metrics declined by ${Math.abs(change).toFixed(1)}% vs last period.`);
    else if (change !== 0) parts.push(`Metrics stable vs last period (${change > 0 ? '+' : ''}${change.toFixed(1)}%).`);
  }

  if (parts.length === 0) return 'All systems operating normally. No critical issues detected today.';
  return parts.join(' ');
}

function generateRecommendedActions(insights: AiInsight[]): string[] {
  const actions: string[] = [];

  const attInsight = insights.find(i => i.category === 'attendance_trend' && (i.severity === 'critical' || i.severity === 'warning'));
  if (attInsight) {
    const affected = attInsight.metrics?.affected_classes || attInsight.metrics?.low_attendance_classes || [];
    if (Array.isArray(affected) && affected.length > 0) {
      actions.push(`Review attendance for ${affected.join(', ')} - consider parent outreach`);
    } else {
      actions.push(`Address declining attendance trend - meet with class teachers`);
    }
  }

  const hwInsight = insights.find(i => i.category === 'homework_completion' && (i.severity === 'critical' || i.severity === 'warning'));
  if (hwInsight) {
    actions.push(`Send homework completion reminders to students and parents`);
  }

  const busInsight = insights.find(i => i.category === 'bus_delays' && (i.severity === 'critical' || i.severity === 'warning'));
  if (busInsight) {
    actions.push(`Check with transport staff about bus route delays`);
  }

  const riskInsight = insights.find(i => i.category === 'students_needing_attention' && i.riskAlert);
  if (riskInsight) {
    const count = riskInsight.metrics?.high_risk_count || riskInsight.metrics?.students_affected || 0;
    actions.push(`Schedule counsellor meeting for ${count || 'flagged'} at-risk students`);
  }

  const wellnessInsight = insights.find(i => i.category === 'wellness_trend' && (i.severity === 'critical' || i.severity === 'warning'));
  if (wellnessInsight) {
    actions.push(`Review student wellness data and consider check-in sessions`);
  }

  const positiveInsights = insights.filter(i => i.severity === 'positive');
  if (positiveInsights.length > 0) {
    const categories = positiveInsights.map(i => CATEGORY_LABELS[i.category]).slice(0, 2);
    actions.push(`Recognize improvements in ${categories.join(' and ')}`);
  }

  return actions.slice(0, 5);
}

/* ===== Priority Alerts Panel ===== */
export function PriorityAlertsPanel({
  alerts,
  onDismiss,
  onDrillDown,
}: {
  alerts: AiInsight[];
  onDismiss: (id: string) => void;
  onDrillDown: (insight: AiInsight) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-warm-clay/20 bg-warm-clay/5 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-warm-clay/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🚨</span>
          <p className="font-display text-sm font-extrabold text-warm-clay">Priority Alerts</p>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warm-clay/15 text-warm-clay">
            {alerts.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-warm-clay/10">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="px-5 py-3.5 hover:bg-warm-clay/5 transition-colors cursor-pointer"
            onClick={() => onDrillDown(alert)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-sm">{alert.severity === 'critical' ? '🔴' : '🟠'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-deep-teal truncate">{alert.title}</h4>
                  {alert.riskAlert && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-warm-clay/15 text-warm-clay">
                      RISK
                    </span>
                  )}
                </div>
                <p className="text-xs text-deep-teal/60 mt-0.5 line-clamp-1">{alert.description}</p>
                {alert.actionSuggestions?.[0] && (
                  <p className="text-[10px] text-primary font-medium mt-1.5 flex items-center gap-1">
                    <span>→</span> {alert.actionSuggestions[0]}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(alert.id); }}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-warm-clay/10 text-warm-clay/40 hover:text-warm-clay transition-colors"
                aria-label="Dismiss alert"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ===== What Should I Do? Panel ===== */
export function ActionPanel({ insights }: { insights: AiInsight[] }) {
  const actionCards = useMemo(() => {
    const cards: {
      insight: AiInsight;
      action: string;
      icon: string;
      color: string;
      urgency: string;
    }[] = [];

    insights.forEach(insight => {
      if (!insight.actionSuggestions?.length) return;
      const sevColors: Record<string, string> = { critical: 'warm-clay', warning: 'marigold', info: 'primary', positive: 'sage' };
      insight.actionSuggestions.slice(0, 2).forEach(action => {
        cards.push({
          insight,
          action,
          icon: CATEGORY_ICONS[insight.category],
          color: sevColors[insight.severity] || 'primary',
          urgency: insight.severity === 'critical' ? 'Urgent' : insight.severity === 'warning' ? 'Soon' : 'Normal',
        });
      });
    });

    return cards.slice(0, 6);
  }, [insights]);

  if (actionCards.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/15 bg-primary/5 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-primary/10 flex items-center gap-2.5">
        <span className="text-lg">💡</span>
        <p className="font-display text-sm font-extrabold text-primary">What Should I Do?</p>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actionCards.map((card, index) => (
          <motion.button
            key={`${card.insight.id}-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.06 }}
            className="text-left p-3.5 rounded-xl bg-white/60 border border-deep-teal/5 hover:border-primary/25 hover:bg-white transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{card.icon}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                card.color === 'warm-clay' ? 'bg-warm-clay/10 text-warm-clay' :
                card.color === 'marigold' ? 'bg-marigold/10 text-marigold' :
                card.color === 'sage' ? 'bg-sage/10 text-sage' :
                'bg-primary/10 text-primary'
              }`}>
                {card.urgency}
              </span>
            </div>
            <p className="text-xs font-medium text-deep-teal leading-relaxed line-clamp-2">{card.action}</p>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View insight</span>
              <span>→</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ===== Comparison Panel ===== */
export function ComparisonSelector({
  mode,
  onChange,
  data,
}: {
  mode: string;
  onChange: (m: any) => void;
  data: InsightComparison;
}) {
  if (!data) return null;

  const getTrend = (change: number): { icon: string; text: string; color: string } => {
    if (change > 2) return { icon: '⬆', text: 'Better', color: 'text-sage' };
    if (change < -2) return { icon: '⬇', text: 'Worse', color: 'text-warm-clay' };
    return { icon: '➡', text: 'Same', color: 'text-deep-teal/50' };
  };

  const trend = getTrend(data.change);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-2xl border border-deep-teal/10 bg-white shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-deep-teal/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📊</span>
          <p className="font-display text-sm font-extrabold text-deep-teal">Compare Performance</p>
        </div>
        <select
          value={mode}
          onChange={e => onChange(e.target.value)}
          className="rounded-lg border border-deep-teal/10 bg-white px-3 py-1.5 text-xs font-bold text-deep-teal focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="today_yesterday">Today vs Yesterday</option>
          <option value="week_week">This Week vs Last Week</option>
          <option value="month_month">This Month vs Last Month</option>
        </select>
      </div>

      <div className="p-5 grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-xl bg-deep-teal/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">Current</p>
          <p className="font-display text-2xl font-extrabold text-deep-teal mt-1">{data.current?.toFixed(1) || 'N/A'}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-deep-teal/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">Previous</p>
          <p className="font-display text-2xl font-extrabold text-deep-teal mt-1">{data.previous?.toFixed(1) || 'N/A'}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-deep-teal/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">Change</p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className={`font-display text-2xl font-extrabold ${trend.color}`}>
              {data.change > 0 ? '+' : ''}{data.change?.toFixed(1) || 0}%
            </span>
          </div>
          <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold ${trend.color}`}>
            {trend.icon} {trend.text}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ===== Download Modal ===== */
export function DownloadModal({
  onClose,
  onDownload,
  downloading,
}: {
  onClose: () => void;
  onDownload: (format: 'pdf' | 'excel' | 'csv') => void;
  downloading: boolean;
}) {
  const formats = [
    { key: 'pdf' as const, icon: '📄', label: 'PDF Report', desc: 'Formatted report for printing or sharing' },
    { key: 'excel' as const, icon: '📊', label: 'Excel Spreadsheet', desc: 'Data in spreadsheet format for analysis' },
    { key: 'csv' as const, icon: '📋', label: 'CSV Data', desc: 'Raw data for importing into other tools' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-deep-teal/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-extrabold text-deep-teal">Download Report</h3>
              <p className="text-xs text-deep-teal/50 mt-0.5">Choose a format for your insights report</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-deep-teal/5 text-deep-teal/40 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {formats.map(fmt => (
            <button
              key={fmt.key}
              onClick={() => { if (!downloading) { onDownload(fmt.key); onClose(); } }}
              disabled={downloading}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-deep-teal/10 hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-50 group"
            >
              <span className="text-2xl">{fmt.icon}</span>
              <div className="text-left flex-1">
                <p className="font-bold text-sm text-deep-teal group-hover:text-primary transition-colors">{fmt.label}</p>
                <p className="text-[11px] text-deep-teal/50 mt-0.5">{fmt.desc}</p>
              </div>
              <svg className="w-4 h-4 text-deep-teal/30 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===== Drill Down Modal ===== */
export function DrillDownModal({ insight, onClose }: { insight: AiInsight; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'classes' | 'actions'>('overview');

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: '📋' },
    { key: 'students' as const, label: 'Students', icon: '👤' },
    { key: 'classes' as const, label: 'Classes', icon: '🏫' },
    { key: 'actions' as const, label: 'Actions', icon: '✅' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-deep-teal/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{CATEGORY_ICONS[insight.category]}</span>
            <div>
              <h3 className="font-display text-lg font-extrabold text-deep-teal">{insight.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-deep-teal/40">{insight.insightDate}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  insight.severity === 'critical' ? 'bg-warm-clay/10 text-warm-clay' :
                  insight.severity === 'warning' ? 'bg-marigold/10 text-marigold' :
                  insight.severity === 'positive' ? 'bg-sage/10 text-sage' :
                  'bg-primary/10 text-primary'
                }`}>
                  {insight.severity}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-deep-teal/5 text-deep-teal/40 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-deep-teal/10 px-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'text-primary border-primary'
                  : 'text-deep-teal/40 border-transparent hover:text-deep-teal hover:border-deep-teal/20'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTabContent insight={insight} />}
          {activeTab === 'students' && <StudentsTabContent insight={insight} />}
          {activeTab === 'classes' && <ClassesTabContent insight={insight} />}
          {activeTab === 'actions' && <ActionsTabContent insight={insight} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

function OverviewTabContent({ insight }: { insight: AiInsight }) {
  const metrics = insight.metrics as Record<string, any>;
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-deep-teal/5 border border-deep-teal/10">
        <p className="text-sm text-deep-teal/80 leading-relaxed">{insight.description}</p>
      </div>

      {metrics && Object.keys(metrics).length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40 mb-3">Key Metrics</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(metrics).slice(0, 8).map(([key, value]) => (
              <div key={key} className="p-3 rounded-xl bg-white border border-deep-teal/5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-deep-teal/40">{key.replace(/_/g, ' ')}</p>
                <p className="font-display text-lg font-extrabold text-deep-teal mt-0.5">{String(typeof value === 'number' ? value.toFixed?.(1) || value : value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {insight.recommendation && (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40 mb-2">Recommendation</h4>
          <div className="p-4 rounded-xl bg-sage/8 border border-sage/20">
            <p className="text-sm text-sage leading-relaxed">{insight.recommendation}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-[9px] font-mono text-deep-teal/30 pt-2 border-t border-deep-teal/5">
        <span>Generated: {new Date(insight.generatedAt).toLocaleString()}</span>
        <span>·</span>
        <span>Category: {insight.category.replace(/_/g, ' ')}</span>
        {insight.riskAlert && <span className="text-warm-clay font-bold">⚠ Risk Alert</span>}
      </div>
    </div>
  );
}

function StudentsTabContent({ insight }: { insight: AiInsight }) {
  const metadata = insight.metadata as Record<string, any>;
  const affectedStudents = metadata?.affected_students || metadata?.students || [];

  if (!Array.isArray(affectedStudents) || affectedStudents.length === 0) {
    const metrics = insight.metrics as Record<string, any>;
    const studentCount = metrics?.high_risk_count || metrics?.students_affected || metrics?.low_mood_count || 0;

    return (
      <div className="text-center py-8">
        <p className="text-3xl mb-3">👤</p>
        <p className="font-bold text-deep-teal/60 text-sm">Student Details</p>
        <p className="text-xs text-deep-teal/40 mt-1">
          {studentCount > 0 ? `${studentCount} student${studentCount > 1 ? 's' : ''} flagged by this insight` : 'No specific students flagged'}
        </p>
        <div className="mt-4 p-4 rounded-xl bg-deep-teal/5 border border-deep-teal/10 max-w-sm mx-auto">
          <p className="text-xs text-deep-teal/60">
            For detailed student information, check the Students portal or contact the class teacher directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-deep-teal/50">{affectedStudents.length} student{affectedStudents.length !== 1 ? 's' : ''} affected</p>
      <div className="space-y-2">
        {affectedStudents.map((student: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl border border-deep-teal/10 bg-white flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-deep-teal/8 text-deep-teal text-xs font-bold">
              {typeof student === 'string' ? student.charAt(0) : (student.name || student.id || '?').charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-deep-teal">{typeof student === 'string' ? student : student.name || student.id}</p>
              {student.class && <p className="text-[10px] text-deep-teal/40">{student.class}</p>}
            </div>
            {student.risk && (
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                student.risk === 'High' || student.risk === 'high' ? 'bg-warm-clay/10 text-warm-clay' :
                student.risk === 'Medium' || student.risk === 'medium' ? 'bg-marigold/10 text-marigold' :
                'bg-sage/10 text-sage'
              }`}>
                {student.risk} Risk
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ClassesTabContent({ insight }: { insight: AiInsight }) {
  const metadata = insight.metadata as Record<string, any>;
  const classes = metadata?.affected_classes || metadata?.classes || [];

  if (!Array.isArray(classes) || classes.length === 0) {
    const metrics = insight.metrics as Record<string, any>;
    const classInfo = metrics?.affected_classes || metrics?.low_attendance_classes || [];

    return (
      <div className="text-center py-8">
        <p className="text-3xl mb-3">🏫</p>
        <p className="font-bold text-deep-teal/60 text-sm">Class Breakdown</p>
        <p className="text-xs text-deep-teal/40 mt-1">
          {Array.isArray(classInfo) && classInfo.length > 0
            ? `Affected classes: ${classInfo.join(', ')}`
            : 'No specific class breakdown available for this insight'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-deep-teal/50">{classes.length} class{classes.length !== 1 ? 'es' : ''} affected</p>
      <div className="rounded-xl border border-deep-teal/10 overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2.5 bg-deep-teal/5 text-[10px] font-bold uppercase tracking-wider text-deep-teal/50">
          <div>Class</div>
          <div>Students</div>
          <div>Status</div>
          <div>Action</div>
        </div>
        {classes.map((cls: any, i: number) => (
          <div key={i} className={`grid grid-cols-4 px-4 py-3 border-t border-deep-teal/10 ${i % 2 === 0 ? 'bg-white/50' : ''}`}>
            <div className="font-bold text-sm text-deep-teal">{cls.name || cls}</div>
            <div className="text-sm text-deep-teal/60">{cls.students || '-'}</div>
            <div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                cls.risk > 2 ? 'bg-warm-clay/10 text-warm-clay' :
                cls.risk > 0 ? 'bg-marigold/10 text-marigold' : 'bg-sage/10 text-sage'
              }`}>
                {cls.status || (cls.risk > 2 ? 'At Risk' : cls.risk > 0 ? 'Monitor' : 'OK')}
              </span>
            </div>
            <div>
              <button className="text-[10px] font-bold text-primary hover:underline">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionsTabContent({ insight }: { insight: AiInsight }) {
  const actions = insight.actionSuggestions || [];

  if (actions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-3xl mb-3">✅</p>
        <p className="font-bold text-deep-teal/60 text-sm">No Actions Required</p>
        <p className="text-xs text-deep-teal/40 mt-1">No specific actions suggested for this insight</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-deep-teal/50">{actions.length} suggested action{actions.length !== 1 ? 's' : ''}</p>
      {actions.map((action: string, i: number) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-white border border-deep-teal/5 hover:border-primary/20 transition-colors"
        >
          <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
            {i + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-deep-teal">{action}</p>
            <div className="mt-2.5 flex gap-2">
              <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm">
                Assign
              </button>
              <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-deep-teal/15 hover:bg-deep-teal/5 transition-colors">
                Delegate
              </button>
              <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-deep-teal/50 hover:text-deep-teal hover:bg-deep-teal/5 transition-colors">
                Schedule
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
