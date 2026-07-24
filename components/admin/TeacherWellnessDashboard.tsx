'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getTeacherWellnessMetricsAction, type TeacherWellnessMetrics } from '@/app/actions/wellnessActions';

export default function TeacherWellnessDashboard() {
  const [metrics, setMetrics] = useState<TeacherWellnessMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [windowDays, setWindowDays] = useState(30);
  const [threshold, setThreshold] = useState(20);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTeacherWellnessMetricsAction(windowDays, threshold);
      setMetrics(data);
    } catch (error) {
      console.error('[Teacher Wellness] Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [windowDays, threshold]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const generateWellnessFlagMessage = (metric: TeacherWellnessMetrics): string => {
    const { teacherName, alertCount, windowDays, threshold } = metric;
    
    if (alertCount >= threshold * 1.5) {
      return `${teacherName} is handling a very high alert load (${alertCount} alerts in the last ${windowDays} days). Consider providing additional support or resources.`;
    } else if (alertCount >= threshold) {
      return `${teacherName} is handling a high alert load this month (${alertCount} alerts in the last ${windowDays} days).`;
    } else {
      return `${teacherName}'s alert load is within normal range (${alertCount} alerts in the last ${windowDays} days).`;
    }
  };

  const overThresholdTeachers = metrics.filter(m => m.isOverThreshold);
  const normalRangeTeachers = metrics.filter(m => !m.isOverThreshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💚</span>
          <h3 className="font-display text-sm font-extrabold text-deep-teal">
            Teacher Wellness Loop
          </h3>
        </div>
      </div>

      <p className="font-body text-xs text-deep-teal/50 leading-relaxed">
        Tracks alert volume handled per teacher over a rolling window. Surfaces gentle flags when alert counts are high to ensure workload balance.
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4 bg-paper rounded-xl p-4 border border-deep-teal/10">
        <div className="flex items-center gap-2">
          <label className="font-display text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">
            Window:
          </label>
          <select
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
            className="text-xs font-semibold text-deep-teal bg-white border border-deep-teal/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-deep-teal/10"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-display text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">
            Alert Limit:
          </label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="text-xs font-semibold text-deep-teal bg-white border border-deep-teal/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-deep-teal/10"
          >
            <option value={10}>10 alerts</option>
            <option value={15}>15 alerts</option>
            <option value={20}>20 alerts</option>
            <option value={25}>25 alerts</option>
            <option value={30}>30 alerts</option>
          </select>
        </div>

        <button
          onClick={loadMetrics}
          className="ml-auto text-xs font-bold text-deep-teal/60 hover:text-deep-teal underline"
        >
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-deep-teal/20 border-t-deep-teal"></div>
          <p className="font-body text-xs text-deep-teal/40 mt-3">Loading wellness metrics...</p>
        </div>
      )}

      {/* Wellness Flags */}
      {!isLoading && overThresholdTeachers.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-display text-[9px] font-bold uppercase tracking-wider text-warm-clay">
            ⚠️ Wellness Flags ({overThresholdTeachers.length})
          </h4>
          
          <div className="space-y-3">
            {overThresholdTeachers.map((metric) => (
              <motion.div
                key={metric.teacherId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-xl p-4 ${
                  metric.alertCount >= threshold * 1.5
                    ? 'bg-warm-clay/5 border-warm-clay/20'
                    : 'bg-marigold/5 border-marigold/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-display text-sm font-bold text-deep-teal">
                        {metric.teacherName}
                      </h5>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        metric.alertCount >= threshold * 1.5
                          ? 'bg-warm-clay text-white'
                          : 'bg-marigold text-deep-teal'
                      }`}>
                        {metric.alertCount} alerts
                      </span>
                    </div>
                    <p className="font-body text-xs text-deep-teal/70 leading-relaxed">
                      {generateWellnessFlagMessage(metric)}
                    </p>
                  </div>
                </div>

                {metric.recentAlerts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-deep-teal/5">
                    <p className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 mb-2">
                      Recent Alerts
                    </p>
                    <div className="space-y-1">
                      {metric.recentAlerts.map((alert: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-[10px] text-deep-teal/60">
                          <span className="font-semibold">{alert.studentName}</span>
                          <span>•</span>
                          <span className="capitalize">{alert.status.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{new Date(alert.actedAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Normal Range Teachers */}
      {!isLoading && normalRangeTeachers.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-display text-[9px] font-bold uppercase tracking-wider text-sage">
            ✓ Within Normal Range ({normalRangeTeachers.length})
          </h4>
          
          <div className="grid gap-2">
            {normalRangeTeachers.map((metric) => (
              <div
                key={metric.teacherId}
                className="bg-sage/5 border border-sage/10 rounded-lg p-3 flex items-center justify-between"
              >
                <span className="font-display text-xs font-semibold text-deep-teal">
                  {metric.teacherName}
                </span>
                <span className="text-[10px] font-bold text-sage">
                  {metric.alertCount} alerts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && metrics.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-deep-teal/10 rounded-xl bg-paper">
          <span className="text-4xl mb-2 block">💚</span>
          <p className="font-body text-xs text-deep-teal/40 font-medium">
            No teacher data available.
          </p>
        </div>
      )}

      {/* Summary */}
      {!isLoading && metrics.length > 0 && (
        <div className="bg-paper rounded-xl p-4 border border-deep-teal/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-display text-2xl font-extrabold text-deep-teal">
                {metrics.length}
              </div>
              <div className="font-body text-[10px] text-deep-teal/40 uppercase tracking-wider">
                Total Teachers
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-warm-clay">
                {overThresholdTeachers.length}
              </div>
              <div className="font-body text-[10px] text-deep-teal/40 uppercase tracking-wider">
                High Workload
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-sage">
                {normalRangeTeachers.length}
              </div>
              <div className="font-body text-[10px] text-deep-teal/40 uppercase tracking-wider">
                Normal Range
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
