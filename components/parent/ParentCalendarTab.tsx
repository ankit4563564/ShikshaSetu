'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCalendarPeriodsAction, CalendarPeriodData } from '@/app/actions/calendarActions';
import { summarizeNoticeAction, type NoticeSummaryResult } from '@/app/actions/parentAiActions';

interface ParentCalendarTabProps {
  studentName?: string;
  isLoading?: boolean;
}

export function ParentCalendarTab({
  studentName = 'Student',
  isLoading = false,
}: ParentCalendarTabProps) {
  const [periods, setPeriods] = useState<CalendarPeriodData[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'holiday' | 'exam_period'>('upcoming');
  const [isFetching, setIsFetching] = useState(true);

  // AI Notice Summaries
  const [activeAiNoticeId, setActiveAiNoticeId] = useState<string | null>(null);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiSummaryCache, setAiSummaryCache] = useState<Record<string, NoticeSummaryResult>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadCalendar() {
      setIsFetching(true);
      try {
        const data = await fetchCalendarPeriodsAction();
        if (isMounted) {
          setPeriods(data || []);
        }
      } catch (err) {
        console.warn('[ParentCalendarTab] Error loading calendar:', err);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    }
    loadCalendar();
    return () => {
      isMounted = false;
    };
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredPeriods = useMemo(() => {
    return periods.filter((p) => {
      if (filterType === 'upcoming') {
        return p.endDate >= todayStr;
      }
      if (filterType === 'holiday') {
        return p.type === 'holiday' || p.type === 'break';
      }
      if (filterType === 'exam_period') {
        return p.type === 'exam_period';
      }
      return true;
    });
  }, [periods, filterType, todayStr]);

  const handleExportIcs = () => {
    if (periods.length === 0) return;
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ShikshaSetu//Parent Portal Calendar//EN\nCALSCALE:GREGORIAN\n';
    periods.forEach((p) => {
      const sDate = p.startDate.replace(/-/g, '');
      const eDate = p.endDate.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\nSUMMARY:${p.name}\nDESCRIPTION:${p.description || p.type}\nDTSTART;VALUE=DATE:${sDate}\nDTEND;VALUE=DATE:${eDate}\nEND:VEVENT\n`;
    });
    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'school_calendar.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSummarizeNotice = async (period: CalendarPeriodData) => {
    if (activeAiNoticeId === period.id) {
      setActiveAiNoticeId(null);
      return;
    }

    setActiveAiNoticeId(period.id);

    if (aiSummaryCache[period.id]) return;

    setAiLoadingId(period.id);
    try {
      const res = await summarizeNoticeAction({
        title: period.name,
        content: period.description || `${period.name} scheduled from ${period.startDate} to ${period.endDate}`,
        date: period.startDate,
      });

      if (res.success && res.summary) {
        setAiSummaryCache((prev) => ({ ...prev, [period.id]: res.summary! }));
      }
    } catch (err) {
      console.error('Failed to summarize notice:', err);
    } finally {
      setAiLoadingId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'exam_period':
        return { label: 'Exam Schedule', bg: 'bg-rose-50 border-rose-200 text-rose-700', icon: '📝' };
      case 'holiday':
        return { label: 'Holiday', bg: 'bg-amber-50 border-amber-200 text-amber-700', icon: '🌴' };
      case 'break':
        return { label: 'Vacation Break', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: '🏖️' };
      default:
        return { label: 'School Notice', bg: 'bg-blue-50 border-blue-200 text-blue-700', icon: '📅' };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deep-teal/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-extrabold text-deep-teal">
              School Calendar &amp; Notices
            </h3>
          </div>
          <p className="font-body text-xs text-deep-teal/60 font-medium mt-0.5">
            Official holidays, exam dates, PTMs, and circulars for {studentName}.
          </p>
        </div>

        <button
          onClick={handleExportIcs}
          disabled={isFetching || periods.length === 0}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-deep-teal/20 text-deep-teal text-xs font-bold hover:bg-deep-teal/5 transition-all shadow-2xs disabled:opacity-50"
        >
          <span>📥</span>
          <span>Add to Phone Calendar (.ics)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'upcoming', label: 'Upcoming Dates', icon: '⏳' },
          { id: 'holiday', label: 'Holidays & Breaks', icon: '🌴' },
          { id: 'exam_period', label: 'Exam Schedules', icon: '📝' },
          { id: 'all', label: 'All Notices', icon: '📑' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
              filterType === tab.id
                ? 'bg-deep-teal border-deep-teal text-white shadow-xs'
                : 'bg-white border-deep-teal/10 text-deep-teal/70 hover:bg-deep-teal/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {isFetching ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
            <p className="text-xs text-deep-teal/40 font-medium">Loading school calendar...</p>
          </div>
        ) : filteredPeriods.length === 0 ? (
          <div className="rounded-3xl border border-deep-teal/10 bg-paper/60 p-8 text-center space-y-2">
            <div className="text-3xl">🗓️</div>
            <h4 className="font-display text-sm font-bold text-deep-teal">No matching school dates</h4>
            <p className="font-body text-xs text-deep-teal/50 max-w-sm mx-auto">
              There are no scheduled {filterType === 'upcoming' ? 'upcoming' : filterType} events registered in the school calendar at this time.
            </p>
          </div>
        ) : (
          filteredPeriods.map((period) => {
            const badge = getTypeBadge(period.type);
            const isOngoing = period.startDate <= todayStr && period.endDate >= todayStr;
            const isAiOpen = activeAiNoticeId === period.id;
            const aiSummary = aiSummaryCache[period.id];
            const isAiLoading = aiLoadingId === period.id;

            return (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl border p-5 bg-white shadow-xs transition-all space-y-3 ${
                  isOngoing ? 'border-amber-300 bg-amber-50/20' : 'border-deep-teal/10 hover:border-deep-teal/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.icon} {badge.label}
                      </span>
                      {isOngoing && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white animate-pulse">
                          Active Now
                        </span>
                      )}
                    </div>
                    <h4 className="font-display text-sm font-bold text-deep-teal mt-1">
                      {period.name}
                    </h4>
                    {period.description && (
                      <p className="font-body text-xs text-deep-teal/70 leading-relaxed">
                        {period.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-display text-xs font-extrabold text-deep-teal">
                      {new Date(period.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {period.startDate !== period.endDate && (
                      <p className="text-[10px] text-deep-teal/50">
                        to {new Date(period.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── AI Summarize Trigger ── */}
                <div className="pt-1 border-t border-deep-teal/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSummarizeNotice(period)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                      isAiOpen
                        ? 'bg-deep-teal text-white'
                        : 'bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100'
                    }`}
                  >
                    <span>✨</span>
                    <span>{isAiOpen ? 'Hide Summary' : 'Summarize with AI'}</span>
                  </button>

                  <span className="text-[10px] text-deep-teal/40 font-medium">
                    Verified Notice
                  </span>
                </div>

                {/* ── Expandable AI Summary Card ── */}
                <AnimatePresence>
                  {isAiOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50/60 border border-teal-300 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-teal-200 pb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-900 font-mono">
                          📌 AI Parent Summary
                        </span>
                        <span className="text-[9px] text-teal-700 font-semibold">
                          Quick Highlights
                        </span>
                      </div>

                      {isAiLoading ? (
                        <div className="space-y-2 py-2">
                          <div className="h-3.5 bg-teal-200/50 rounded animate-pulse w-full" />
                          <div className="h-3.5 bg-teal-200/50 rounded animate-pulse w-3/4" />
                        </div>
                      ) : aiSummary ? (
                        <div className="space-y-2">
                          <div className="space-y-0.5">
                            <span className="font-bold text-teal-950 block">What you need to know:</span>
                            <p className="text-teal-900 leading-relaxed font-medium">
                              {aiSummary.whatParentsNeedToKnow}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <div className="px-2.5 py-1 rounded-xl bg-white border border-teal-200 text-teal-900 font-semibold">
                              🗓️ {aiSummary.importantDates.join(', ')}
                            </div>
                            <div className="px-2.5 py-1 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 font-bold">
                              ⚡ Action: {aiSummary.actionRequired}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
