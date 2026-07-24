'use client';

import { motion } from 'framer-motion';
import type { AiInsight } from '@/lib/insights/types';

interface InsightChartProps {
  insight: AiInsight;
  onClose: () => void;
}

export function InsightChart({ insight, onClose }: InsightChartProps) {
  const chartData = insight.chartData as any;

  if (!chartData || (Array.isArray(chartData) && chartData.length === 0)) {
    return null;
  }

  const dataPoints = Array.isArray(chartData)
    ? chartData
    : typeof chartData === 'object'
      ? Object.entries(chartData).map(([k, v]) => ({ date: k, ...(v as any) }))
      : [];

  if (dataPoints.length === 0) return null;

  const values = dataPoints
    .map(d => {
      if (typeof d === 'object' && d !== null) {
        return d.rate || d.count || d.avg_mood || d.delay_rate || d.participation_score || d.value || 0;
      }
      return 0;
    })
    .filter(v => !isNaN(v));

  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);

  const chartWidth = 600;
  const chartHeight = 260;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const getX = (i: number) => padding.left + (dataPoints.length === 1 ? plotWidth / 2 : (i / (dataPoints.length - 1)) * plotWidth);
  const getY = (val: number) => {
    const normalized = maxVal === minVal ? 0.5 : (val - minVal) / (maxVal - minVal);
    return padding.top + plotHeight - normalized * plotHeight;
  };

  const linePath = dataPoints
    .map((d, i) => {
      const val = d.rate || d.count || d.avg_mood || d.delay_rate || d.participation_score || d.value || 0;
      return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`;
    })
    .join(' ');

  const areaPath =
    linePath +
    ` L ${getX(dataPoints.length - 1)} ${padding.top + plotHeight} L ${getX(0)} ${padding.top + plotHeight} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(p => ({
    y: padding.top + plotHeight * (1 - p),
    label: (minVal + (maxVal - minVal) * p).toFixed(1),
  }));

  const getColor = () => {
    switch (insight.severity) {
      case 'positive': return '#6B9080';
      case 'critical': return '#C1502E';
      case 'warning': return '#E8A33D';
      default: return '#3f51b5';
    }
  };

  const color = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-deep-teal/10">
          <div>
            <h3 className="font-display text-lg font-extrabold text-deep-teal">{insight.title}</h3>
            <p className="text-xs text-deep-teal/50 mt-0.5">{insight.insightDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-deep-teal/5 text-deep-teal/40 transition-colors"
            aria-label="Close chart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chart */}
        <div className="p-6">
          <svg className="w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {gridLines.map((line, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={line.y}
                  x2={chartWidth - padding.right}
                  y2={line.y}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
                <text
                  x={padding.left - 8}
                  y={line.y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9ca3af"
                  fontFamily="Inter, sans-serif"
                >
                  {line.label}
                </text>
              </g>
            ))}

            {/* Area */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points + labels */}
            {dataPoints.map((d, i) => {
              const val = d.rate || d.count || d.avg_mood || d.delay_rate || d.participation_score || d.value || 0;
              const x = getX(i);
              const y = getY(val);
              const label = d.date || d.day || d.category || d.label || `P${i + 1}`;

              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill={color} stroke="white" strokeWidth="2" />
                  <text
                    x={x}
                    y={chartHeight - 5}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#9ca3af"
                    fontFamily="Inter, sans-serif"
                  >
                    {typeof label === 'string' && label.length > 8 ? label.substring(0, 8) + '...' : label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Details */}
        <div className="px-6 pb-5 border-t border-deep-teal/10 pt-4 space-y-3">
          <p className="text-sm text-deep-teal/70 leading-relaxed">{insight.description}</p>

          {insight.recommendation && (
            <div className="p-3 rounded-xl bg-sage/8 border border-sage/15">
              <p className="text-[9px] font-bold uppercase tracking-widest text-sage/60 mb-1">Recommendation</p>
              <p className="text-xs text-sage leading-relaxed">{insight.recommendation}</p>
            </div>
          )}

          {insight.actionSuggestions && insight.actionSuggestions.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 mb-1.5">Suggested Actions</p>
              <div className="space-y-1">
                {insight.actionSuggestions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-deep-teal/70 pl-1">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sage mt-1.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-[9px] font-mono text-deep-teal/30 pt-2 border-t border-deep-teal/5">
            <span>Max: {maxVal.toFixed(1)}</span>
            <span>Min: {minVal.toFixed(1)}</span>
            <span>Points: {dataPoints.length}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
