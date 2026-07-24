'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AiInsight, InsightCategory, InsightSeverity } from '@/lib/insights/types';
import { INSIGHT_CATEGORY_ICONS, SEVERITY_COLORS, SEVERITY_ICONS } from '@/lib/insights/types';

interface InsightCardProps {
  insight: AiInsight;
  onDismiss?: (id: string) => void;
  onDrillDown?: (insight: AiInsight) => void;
  onClickChart?: (insight: AiInsight) => void;
}

const CATEGORY_ICONS = INSIGHT_CATEGORY_ICONS;

function inlineSparkline(data: number[]): string {
  if (!data || data.length === 0) return '';
  const w = 80, h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="currentColor" stroke-width="1.5" points="${points}"/></svg>`;
}

export function InsightCard({ insight, onDismiss, onDrillDown, onClickChart }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  const chartData = insight.chartData || insight.metrics?.chart_data;
  const dataValues = chartData
    ?.map((pt: any) => pt.rate || pt.count || pt.avg_mood || pt.delay_rate || pt.participation_score || pt.value || 0)
    .filter((v: any) => typeof v === 'number') as number[] | undefined;

  const hasSparkline = dataValues && dataValues.length >= 2;

  const sparklineHtml = hasSparkline ? inlineSparkline(dataValues!) : null;

  const icon = CATEGORY_ICONS[insight.category as InsightCategory] || '📌';
  const severity = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.info;
  const severityIcon = SEVERITY_ICONS[insight.severity] || '⚪';

  const handleClick = () => {
    setExpanded(!expanded);
    if (!expanded && onClickChart) {
      onClickChart(insight);
    }
  };

  const dismissable = !insight.isDismissed && onDismiss;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:shadow-sm cursor-pointer ${severity.bg} ${severity.border}`}
      onClick={handleClick}
    >
      {/* Severity indicator line */}
      <div className={`absolute top-0 left-0 h-full w-1 ${severity.bg.replace('/10', '/30')}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-deep-teal/80 truncate">{insight.title || 'Untitled Insight'}</p>
            <p className="text-[10px] text-deep-teal/50 mt-0.5">{insight.category?.replace(/_/g, ' ') || 'General'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${severity.badge}`}>
            {severityIcon} {insight.severity}
          </span>
          {dismissable && (
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(insight.id); }}
              className="text-deep-teal/20 hover:text-warm-clay transition-colors p-0.5"
              aria-label="Dismiss insight"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Sparkline */}
      {sparklineHtml && (
        <div
          className="mt-2 text-deep-teal/40"
          dangerouslySetInnerHTML={{ __html: sparklineHtml }}
        />
      )}

      {/* Expanded detail */}
      {expanded && insight.description && (
        <motion.p
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-2 text-[11px] leading-relaxed text-deep-teal/60"
        >
          {insight.description}
        </motion.p>
      )}

      {/* Drill-down button */}
      {expanded && onDrillDown && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => { e.stopPropagation(); onDrillDown(insight); }}
          className="mt-2 text-[10px] font-extrabold text-deep-teal/40 hover:text-deep-teal transition-colors"
        >
          View details →
        </motion.button>
      )}
    </motion.div>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="rounded-2xl border border-deep-teal/10 p-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-deep-teal/10" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-deep-teal/10 rounded w-3/4" />
          <div className="h-2 bg-deep-teal/5 rounded w-1/2" />
        </div>
      </div>
      <div className="mt-3 h-6 bg-deep-teal/5 rounded" />
    </div>
  );
}
