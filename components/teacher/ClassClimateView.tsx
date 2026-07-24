'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ClimateData {
  date: string;
  avgMoodScore: number;
  avgEngagementScore: number;
  totalStudents: number;
  studentsWithMoodData: number;
  studentsWithEngagementData: number;
  moodDistribution: {
    very_positive: number;
    positive: number;
    neutral: number;
    negative: number;
    very_negative: number;
  };
  engagementDistribution: {
    very_high: number;
    high: number;
    moderate: number;
    low: number;
    very_low: number;
  };
}

interface ClassClimateViewProps {
  teacherId: string;
}

export default function ClassClimateView({ teacherId }: ClassClimateViewProps) {
  const [climateData, setClimateData] = useState<ClimateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/teacher/class-climate?teacherId=${teacherId}&days=${selectedDays}`);
        if (response.ok && isMounted) {
          const data = await response.json();
          setClimateData(data);
        }
      } catch (error) {
        console.error('[Class Climate] Failed to load data:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [teacherId, selectedDays]);

  const getMoodColor = (score: number) => {
    if (score >= 4.0) return 'text-sage';
    if (score >= 3.0) return 'text-deep-teal';
    if (score >= 2.0) return 'text-marigold';
    return 'text-warm-clay';
  };

  const getEngagementColor = (score: number) => {
    if (score >= 4.0) return 'text-sage';
    if (score >= 3.0) return 'text-deep-teal';
    if (score >= 2.0) return 'text-marigold';
    return 'text-warm-clay';
  };

  const latestData = climateData[0];
  const avgMood = latestData?.avgMoodScore || 0;
  const avgEngagement = latestData?.avgEngagementScore || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌡️</span>
          <h3 className="font-display text-sm font-extrabold text-deep-teal">
            Class Climate
          </h3>
        </div>
      </div>

      <p className="font-body text-xs text-deep-teal/50 leading-relaxed">
        Aggregate class-wide mood and engagement summary, separate from individual student flags.
      </p>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[7, 14, 30].map((days) => (
          <button
            key={days}
            onClick={() => setSelectedDays(days)}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
              selectedDays === days
                ? 'bg-deep-teal text-white'
                : 'bg-paper text-deep-teal/60 hover:bg-deep-teal/5'
            }`}
          >
            {days}d
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-deep-teal/20 border-t-deep-teal"></div>
          <p className="font-body text-xs text-deep-teal/40 mt-3">Loading climate data...</p>
        </div>
      )}

      {/* Climate Summary */}
      {!isLoading && latestData && (
        <div className="grid grid-cols-2 gap-4">
          {/* Mood Card */}
          <div className="bg-paper rounded-xl p-4 border border-deep-teal/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">😊</span>
              <span className="font-display text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">
                Avg Mood
              </span>
            </div>
            <div className={`text-3xl font-display font-extrabold ${getMoodColor(avgMood)}`}>
              {avgMood.toFixed(1)}
            </div>
            <div className="text-[10px] text-deep-teal/40 mt-1">
              / 5.0
            </div>
          </div>

          {/* Engagement Card */}
          <div className="bg-paper rounded-xl p-4 border border-deep-teal/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <span className="font-display text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">
                Avg Engagement
              </span>
            </div>
            <div className={`text-3xl font-display font-extrabold ${getEngagementColor(avgEngagement)}`}>
              {avgEngagement.toFixed(1)}
            </div>
            <div className="text-[10px] text-deep-teal/40 mt-1">
              / 5.0
            </div>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {!isLoading && climateData.length > 0 && (
        <div className="bg-paper rounded-xl p-4 border border-deep-teal/10">
          <h4 className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 mb-4">
            Trend ({selectedDays} days)
          </h4>
          
          <div className="space-y-3">
            {/* Mood Trend */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-deep-teal/60">Mood</span>
                <span className="text-[10px] text-deep-teal/40">5.0</span>
              </div>
              <div className="h-12 flex items-end gap-1">
                {climateData.slice(0, 10).reverse().map((data, idx) => (
                  <motion.div
                    key={data.date}
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.avgMoodScore / 5) * 100}%` }}
                    className={`flex-1 rounded-t transition-colors ${
                      data.avgMoodScore >= 4.0 ? 'bg-sage' :
                      data.avgMoodScore >= 3.0 ? 'bg-deep-teal' :
                      data.avgMoodScore >= 2.0 ? 'bg-marigold' :
                      'bg-warm-clay'
                    }`}
                    style={{ minHeight: '4px' }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-deep-teal/40">0.0</span>
              </div>
            </div>

            {/* Engagement Trend */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-deep-teal/60">Engagement</span>
                <span className="text-[10px] text-deep-teal/40">5.0</span>
              </div>
              <div className="h-12 flex items-end gap-1">
                {climateData.slice(0, 10).reverse().map((data, idx) => (
                  <motion.div
                    key={data.date}
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.avgEngagementScore / 5) * 100}%` }}
                    className={`flex-1 rounded-t transition-colors ${
                      data.avgEngagementScore >= 4.0 ? 'bg-sage' :
                      data.avgEngagementScore >= 3.0 ? 'bg-deep-teal' :
                      data.avgEngagementScore >= 2.0 ? 'bg-marigold' :
                      'bg-warm-clay'
                    }`}
                    style={{ minHeight: '4px' }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-deep-teal/40">0.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribution */}
      {!isLoading && latestData && (
        <div className="grid grid-cols-2 gap-4">
          {/* Mood Distribution */}
          <div className="bg-paper rounded-xl p-4 border border-deep-teal/10">
            <h4 className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 mb-3">
              Mood Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(latestData.moodDistribution).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-deep-teal/60 w-20 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <div className="flex-1 h-2 bg-deep-teal/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-deep-teal rounded-full"
                      style={{ width: `${(value / latestData.totalStudents) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-deep-teal w-6">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Distribution */}
          <div className="bg-paper rounded-xl p-4 border border-deep-teal/10">
            <h4 className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 mb-3">
              Engagement Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(latestData.engagementDistribution).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-deep-teal/60 w-20 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <div className="flex-1 h-2 bg-deep-teal/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-deep-teal rounded-full"
                      style={{ width: `${(value / latestData.totalStudents) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-deep-teal w-6">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && climateData.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-deep-teal/10 rounded-xl bg-paper">
          <span className="text-4xl mb-2 block">🌡️</span>
          <p className="font-body text-xs text-deep-teal/40 font-medium">
            No class climate data available yet.
          </p>
        </div>
      )}
    </div>
  );
}
