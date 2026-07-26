'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAiInsightsAction,
  getAvailableInsightDatesAction,
  generateInsightsNowAction,
  dismissInsightAction,
} from '@/app/actions/aiInsightsActions';
import { InsightCard } from './InsightCard';
import { InsightChart } from './InsightChart';
import {
  SchoolHealthSummary,
  DailyAISummary,
  PriorityAlertsPanel,
  ActionPanel,
  ComparisonSelector,
  DownloadModal,
  DrillDownModal,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from './InsightsComponents';
import type { AiInsight, InsightCategory, InsightSeverity } from '@/lib/insights/types';

interface InsightsTabProps {
  adminId?: string | null;
  adminName?: string;
}

type ComparisonMode = 'today_yesterday' | 'week_week' | 'month_month';

const SEVERITY_ORDER: Record<InsightSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  positive: 3,
};

export function InsightsTab({ adminId }: InsightsTabProps) {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<InsightSeverity | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showChart, setShowChart] = useState<AiInsight | null>(null);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('today_yesterday');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [showDrillDown, setShowDrillDown] = useState<AiInsight | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const fetchInsights = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ action: 'list' });
      if (date) params.set('date', date);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedSeverity !== 'all') params.set('severity', selectedSeverity);

      const res = await fetch(`/api/admin/insights?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInsights(data.data);
      } else {
        setError(data.error || 'Failed to load insights');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSeverity]);

  const fetchDates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/insights?action=dates');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setAvailableDates(data.data);
        if (!selectedDate) setSelectedDate(data.data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch dates:', e);
    }
  }, [selectedDate]);

  const fetchComparison = useCallback(async () => {
    if (!selectedDate) return;
    try {
      const params = new URLSearchParams({
        action: 'comparison',
        date: selectedDate,
        mode: comparisonMode,
      });
      const res = await fetch(`/api/admin/insights?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setComparisonData(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch comparison:', e);
    }
  }, [selectedDate, comparisonMode]);

  const generateInsights = async () => {
    setGenerating(true);
    try {
      const targetDate = selectedDate || new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const res = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', date: targetDate }),
      });
      const data = await res.json();
      if (data.success) {
        fetchInsights(selectedDate || undefined);
        fetchDates();
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const dismissInsight = async (id: string) => {
    try {
      const res = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', insightId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setInsights(prev => prev.filter(i => i.id !== id));
      }
    } catch (e) {
      console.error('Failed to dismiss:', e);
    }
  };

  const handleDownload = async (format: 'pdf' | 'excel' | 'csv') => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        action: 'download',
        format,
        date: selectedDate || '',
        category: selectedCategory !== 'all' ? selectedCategory : '',
        severity: selectedSeverity !== 'all' ? selectedSeverity : '',
      });
      const res = await fetch(`/api/admin/insights?${params.toString()}`);

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format === 'excel' ? 'xls' : format === 'pdf' ? 'html' : 'csv';
        a.download = `insights-${selectedDate || 'latest'}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  const openDrillDown = (insight: AiInsight) => {
    setShowDrillDown(insight);
  };

  useEffect(() => { fetchDates(); }, [fetchDates]);
  useEffect(() => {
    if (selectedDate) {
      fetchInsights(selectedDate);
      fetchComparison();
    }
  }, [selectedDate, fetchInsights, fetchComparison]);

  const filteredInsights = useMemo(() =>
    insights
      .filter(i => {
        const catMatch = selectedCategory === 'all' || i.category === selectedCategory;
        const sevMatch = selectedSeverity === 'all' || i.severity === selectedSeverity;
        return catMatch && sevMatch;
      })
      .sort((a, b) => {
        if (a.riskAlert !== b.riskAlert) return b.riskAlert ? -1 : 1;
        const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        if (sevDiff !== 0) return sevDiff;
        return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
      })
  , [insights, selectedCategory, selectedSeverity]);

  const schoolHealth = useMemo(() => {
    const attendanceRate = insights.find(i => i.category === 'attendance_trend')?.metrics?.average_rate || 0;
    const homeworkRate = insights.find(i => i.category === 'homework_completion')?.metrics?.completion_rate || 0;
    const wellnessScore = insights.find(i => i.category === 'wellness_trend')?.metrics?.average_mood || 0;
    const highRiskStudents = insights.find(i => i.category === 'students_needing_attention')?.metrics?.high_risk_count || 0;

    const healthScore = Math.round(
      (attendanceRate * 0.3) +
      (homeworkRate * 0.25) +
      (wellnessScore * 20 * 0.25) +
      (Math.max(0, 100 - highRiskStudents * 10) * 0.2)
    );

    return {
      score: Math.min(100, Math.max(0, healthScore)),
      attendanceRate,
      homeworkRate,
      wellnessScore: wellnessScore * 20,
      highRiskStudents,
      status: healthScore >= 90 ? 'excellent' : healthScore >= 75 ? 'good' : healthScore >= 60 ? 'needs_attention' : 'critical',
    };
  }, [insights]);

  const priorityAlerts = useMemo(() =>
    filteredInsights.filter(i => i.riskAlert || i.severity === 'critical' || i.severity === 'warning').slice(0, 5)
  , [filteredInsights]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
          <p className="text-xs text-deep-teal/50">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-warm-clay/20 bg-warm-clay/5 p-8 text-center"
      >
        <p className="text-3xl mb-3">⚠️</p>
        <p className="font-bold text-warm-clay mb-1">Error loading insights</p>
        <p className="text-sm text-warm-clay/60 mb-4">{error}</p>
        <button
          onClick={() => fetchInsights(selectedDate)}
          className="px-5 py-2 rounded-xl bg-warm-clay text-white text-sm font-bold hover:bg-warm-clay/90 transition-colors"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-deep-teal">AI Insights Dashboard</h2>
          <p className="text-sm text-deep-teal/50 mt-0.5">
            AI-generated school analytics with actionable recommendations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Selector */}
          <select
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); }}
            className="rounded-xl border border-deep-teal/10 bg-white px-3 py-2 text-sm font-bold text-deep-teal focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {availableDates.map(d => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            className="rounded-xl border border-deep-teal/10 bg-white px-3 py-2 text-sm font-bold text-deep-teal focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value as any)}
            className="rounded-xl border border-deep-teal/10 bg-white px-3 py-2 text-sm font-bold text-deep-teal focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical</option>
            <option value="warning">🟠 Warning</option>
            <option value="info">🔵 Info</option>
            <option value="positive">🟢 Positive</option>
          </select>

          {/* Download Button */}
          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-deep-teal/10 bg-white text-deep-teal text-sm font-bold hover:bg-deep-teal/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Generate Button */}
          <button
            onClick={generateInsights}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-deep-teal text-white text-sm font-bold hover:bg-deep-teal/90 disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <span>✨</span> Generate Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* School Health Summary */}
      <SchoolHealthSummary health={schoolHealth} />

      {/* Daily AI Summary */}
      <DailyAISummary insights={insights} date={selectedDate} comparison={comparisonData} />

      {/* Priority Alerts */}
      {priorityAlerts.length > 0 && (
        <PriorityAlertsPanel
          alerts={priorityAlerts}
          onDismiss={dismissInsight}
          onDrillDown={openDrillDown}
        />
      )}

      {/* What Should I Do? Panel */}
      {filteredInsights.length > 0 && (
        <ActionPanel insights={filteredInsights.slice(0, 4)} />
      )}

      {/* Comparison */}
      {comparisonData && (
        <ComparisonSelector mode={comparisonMode} onChange={setComparisonMode} data={comparisonData} />
      )}

      {/* Insights Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-deep-teal/40">
            All Insights ({filteredInsights.length})
          </p>
        </div>

        {filteredInsights.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-2xl border border-deep-teal/10 bg-white/50"
          >
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold text-deep-teal/50">No insights found</p>
            <p className="text-sm text-deep-teal/35 mt-1">
              {selectedCategory !== 'all' || selectedSeverity !== 'all'
                ? 'Try adjusting your filters'
                : 'Generate insights for this date to get started'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredInsights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onDismiss={dismissInsight}
                  onDrillDown={openDrillDown}
                  onClickChart={setShowChart}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Drill Down Modal */}
      <AnimatePresence>
        {showDrillDown && (
          <DrillDownModal
            insight={showDrillDown}
            onClose={() => setShowDrillDown(null)}
          />
        )}
      </AnimatePresence>

      {/* Chart Modal */}
      <AnimatePresence>
        {showChart && (
          <InsightChart insight={showChart} onClose={() => setShowChart(null)} />
        )}
      </AnimatePresence>

      {/* Download Modal */}
      <AnimatePresence>
        {showDownloadModal && (
          <DownloadModal
            onClose={() => setShowDownloadModal(false)}
            onDownload={handleDownload}
            downloading={downloading}
          />
        )}
      </AnimatePresence>

      {/* Download Loading Overlay */}
      {downloading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center shadow-2xl"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-deep-teal border-t-transparent mx-auto mb-4" />
            <p className="text-deep-teal font-bold">Preparing download...</p>
            <p className="text-sm text-deep-teal/50 mt-1">Generating your report</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
