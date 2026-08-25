'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { explainAttendanceAction, type AttendanceAiInsightResult } from '@/app/actions/parentAiActions';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
}

interface ParentAttendanceTabProps {
  attendance: AttendanceRecord[];
  studentId?: string;
  studentName?: string;
  isLoading?: boolean;
  isEnabled?: boolean;
}

export function ParentAttendanceTab({
  attendance = [],
  studentId,
  studentName = 'Student',
  isLoading = false,
  isEnabled = true,
}: ParentAttendanceTabProps) {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [aiInsight, setAiInsight] = useState<AttendanceAiInsightResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiCard, setShowAiCard] = useState(true);

  const todayIso = new Date().toISOString().split('T')[0];

  // Find today's attendance record if present
  const todayRecord = useMemo(() => {
    return attendance.find((a) => a.date === todayIso) || null;
  }, [attendance, todayIso]);

  // Total metrics
  const totalDays = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;
  const attendanceRate = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 100;
  const isBelowTarget = totalDays > 0 && attendanceRate < 75;

  // Load AI Attendance Analysis
  useEffect(() => {
    async function loadAiAttendance() {
      if (!studentId && attendance.length === 0) return;
      setIsAiLoading(true);
      try {
        const res = await explainAttendanceAction({
          studentId: studentId || 'b1000000-0000-4000-8000-000000000001',
          studentName: studentName.split(' ')[0],
        });
        if (res.success && res.insight) {
          setAiInsight(res.insight);
        }
      } catch (err) {
        console.warn('Failed to explain attendance:', err);
      } finally {
        setIsAiLoading(false);
      }
    }
    loadAiAttendance();
  }, [studentId, studentName, attendance.length]);

  // Helper to map daily attendance to Mon-Fri weekly rows
  const attendanceWeeks = useMemo(() => {
    if (!attendance || attendance.length === 0) return [];
    const sorted = [...attendance].sort((a, b) => a.date.localeCompare(b.date));
    const weeks = [];
    for (let i = 0; i < sorted.length; i += 5) {
      weeks.push({
        name: `Week ${Math.floor(i / 5) + 1}`,
        days: sorted.slice(i, i + 5),
      });
    }
    return weeks;
  }, [attendance]);

  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-extrabold text-deep-teal">Attendance History</h3>
          <p className="font-body text-xs text-deep-teal/60">View attendance records.</p>
        </div>
        <div className="rounded-2xl border border-deep-teal/10 bg-white p-6 shadow-sm text-center py-10">
          <p className="font-body text-sm text-deep-teal/40 italic">
            🔒 Attendance is hidden because this preference is disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-extrabold text-deep-teal">
              Attendance Record
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-deep-teal/10 text-deep-teal font-extrabold text-[10px] uppercase tracking-wider">
              Term Overview
            </span>
          </div>
          <p className="font-body text-xs text-deep-teal/60 font-medium mt-0.5">
            Daily verified attendance register for {studentName}.
          </p>
        </div>
      </div>

      {/* Today's Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border p-5 shadow-xs flex items-center justify-between bg-white border-deep-teal/10"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold shadow-2xs ${
              todayRecord?.status === 'present'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : todayRecord?.status === 'late'
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : todayRecord?.status === 'absent'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-deep-teal/5 text-deep-teal/60 border border-deep-teal/10'
            }`}
          >
            {todayRecord?.status === 'present'
              ? '✓'
              : todayRecord?.status === 'late'
              ? '⏰'
              : todayRecord?.status === 'absent'
              ? '✗'
              : '📋'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40">
                Today’s Status · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h4 className="font-display text-sm font-extrabold text-deep-teal">
              {todayRecord?.status === 'present'
                ? 'Present in School'
                : todayRecord?.status === 'late'
                ? 'Marked Late Arrival'
                : todayRecord?.status === 'absent'
                ? 'Marked Absent Today'
                : 'Attendance Record Pending'}
            </h4>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              todayRecord?.status === 'present'
                ? 'bg-emerald-100 text-emerald-800'
                : todayRecord?.status === 'late'
                ? 'bg-amber-100 text-amber-800'
                : todayRecord?.status === 'absent'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-deep-teal/10 text-deep-teal/70'
            }`}
          >
            {todayRecord ? todayRecord.status.toUpperCase() : 'IN PROGRESS'}
          </span>
        </div>
      </motion.div>

      {/* Target Warning if below 75% */}
      {isBelowTarget && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 shadow-2xs">
          <span className="text-xl">⚠</span>
          <div className="space-y-0.5">
            <h5 className="font-display text-xs font-bold">
              Attendance is below the school target (75%)
            </h5>
            <p className="text-xs text-amber-700 leading-relaxed">
              Current attendance is {attendanceRate}%. Regular daily attendance ensures continuous learning and fulfills CBSE guidelines.
            </p>
          </div>
        </div>
      )}

      {/* ── AI Attendance Insight Card ── */}
      {showAiCard && (
        <div className="rounded-3xl bg-white border border-teal-600/20 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-deep-teal">
                AI Attendance Analysis
              </h4>
            </div>
            {aiInsight && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {aiInsight.statusRating}
              </span>
            )}
          </div>

          {isAiLoading ? (
            <div className="space-y-2 py-1">
              <div className="h-3.5 bg-deep-teal/5 rounded animate-pulse w-full" />
              <div className="h-3.5 bg-deep-teal/5 rounded animate-pulse w-3/4" />
            </div>
          ) : aiInsight ? (
            <div className="space-y-2 text-xs">
              <p className="text-deep-teal/80 leading-relaxed font-medium">
                {aiInsight.summary}
              </p>
              <div className="p-3 rounded-2xl bg-paper border border-deep-teal/10 space-y-1">
                <span className="font-bold text-deep-teal block text-[11px]">Parent Guidance:</span>
                <p className="text-deep-teal/70 font-medium">{aiInsight.parentAdvice}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="p-4 rounded-3xl bg-white border border-deep-teal/10 text-center shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40 block">
            Rate
          </span>
          <p className="font-display text-2xl font-extrabold text-deep-teal mt-0.5">
            {attendanceRate}%
          </p>
          <span className="text-[10px] text-deep-teal/50 font-semibold">{totalDays} days recorded</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-emerald-200 text-center shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Present
          </span>
          <p className="font-display text-2xl font-extrabold text-emerald-700 mt-0.5">
            {presentCount}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Days attended</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-rose-200 text-center shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
            Absent
          </span>
          <p className="font-display text-2xl font-extrabold text-rose-700 mt-0.5">
            {absentCount}
          </p>
          <span className="text-[10px] text-rose-600 font-semibold">{lateCount} late arrivals</span>
        </div>
      </div>

      {/* Weekly History Grid */}
      <div className="rounded-3xl border border-deep-teal/10 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2">
          <span className="font-display text-xs font-bold text-deep-teal/60 uppercase tracking-wider">
            Daily Attendance Log
          </span>
          <div className="flex items-center gap-3 text-[10px] font-bold text-deep-teal/50">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Late
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Absent
            </span>
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-5 text-center text-xs font-bold text-deep-teal/40 pb-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        {/* Weekly Rows */}
        <div className="space-y-3">
          {(showAllHistory ? attendanceWeeks : attendanceWeeks.slice(-3)).map((week, wIdx) => (
            <div key={wIdx} className="flex items-center justify-between">
              <span className="font-body text-[9px] font-extrabold text-deep-teal/30 w-10 uppercase tracking-wider">
                {week.name}
              </span>
              <div className="grid grid-cols-5 flex-1 items-center justify-items-center">
                {week.days.map((day) => (
                  <div key={day.id} className="flex flex-col items-center justify-center p-1">
                    <span
                      className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs transition-all ${
                        day.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : day.status === 'late'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                      title={`${day.date}: ${day.status}`}
                    >
                      {day.status === 'present' ? '✓' : day.status === 'late' ? '⏰' : '✗'}
                    </span>
                    <span className="text-[9px] font-semibold text-deep-teal/40 mt-0.5">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!showAllHistory && attendanceWeeks.length > 3 && (
          <div className="text-center pt-2 border-t border-deep-teal/5">
            <button
              onClick={() => setShowAllHistory(true)}
              className="text-xs font-bold text-deep-teal hover:underline"
            >
              View Full Term History ({attendanceWeeks.length} weeks) ↓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
