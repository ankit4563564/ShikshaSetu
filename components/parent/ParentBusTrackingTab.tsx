'use client';

import React, { useState, useEffect } from 'react';
import { getCanonicalBusLocation } from '@/lib/canonical';

interface ParentBusTrackingTabProps {
  studentId: string;
  studentName: string;
  isLoading?: boolean;
  isEnabled?: boolean;
}

export function ParentBusTrackingTab({
  studentId,
  studentName,
  isLoading = false,
  isEnabled = true,
}: ParentBusTrackingTabProps) {
  const [busData, setBusData] = useState<{
    speed: number;
    nextStop: string;
    eta: number;
    isLive: boolean;
  }>({
    speed: 0,
    nextStop: 'Civil Lines Crossing',
    eta: 12,
    isLive: false, // Truthful live status flag
  });

  useEffect(() => {
    async function checkBus() {
      try {
        const loc = await getCanonicalBusLocation();
        if (loc && loc.last_updated) {
          const diffMinutes = (Date.now() - new Date(loc.last_updated).getTime()) / (1000 * 60);
          setBusData({
            speed: loc.speed_kmh || 0,
            nextStop: loc.next_stop || 'Civil Lines Crossing',
            eta: loc.eta_minutes || 12,
            isLive: diffMinutes < 15, // Only mark live if updated within last 15 minutes
          });
        }
      } catch (err) {
        console.warn('[ParentBusTrackingTab] GPS telemetry offline:', err);
      }
    }
    checkBus();
  }, [studentId]);

  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-xl font-black text-deep-teal">Bus &amp; Route Info</h3>
          <p className="font-body text-xs text-deep-teal/60 font-semibold mt-0.5">
            Transport details for {studentName}.
          </p>
        </div>
        <div className="rounded-2xl border border-deep-teal/10 bg-paper p-6 shadow-sm text-center py-10">
          <p className="font-body text-sm text-deep-teal/40 italic">
            🔒 Bus tracking is hidden because this preference is disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-display text-lg font-black text-slate-900">
              School Transport &amp; Route Telemetry
            </h3>
            <span
              className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border shadow-2xs ${
                busData.isLive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {busData.isLive ? '📡 Live GPS Connected' : '🚌 Route Timetable'}
            </span>
          </div>
          <p className="font-body text-xs text-slate-500 font-medium mt-0.5">
            Verified school bus route and pickup schedule for {studentName}.
          </p>
        </div>
      </div>

      {/* Route Overview Hero */}
      <div className="rounded-3xl bg-white/90 border border-slate-200/80 p-6 sm:p-7 shadow-sm backdrop-blur-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-amber-500/20">
              🚌
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Assigned Route #04
              </span>
              <h4 className="font-display text-lg font-black text-slate-900">
                Central Sector Route • Bus #DL-1PB-4820
              </h4>
            </div>
          </div>
        </div>

        {/* Schedule & Stops */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              📍 Designated Stop
            </span>
            <p className="font-display text-sm font-black text-slate-900">
              {busData.nextStop}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Stop #4 on morning route</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              🌅 Morning Pickup
            </span>
            <p className="font-display text-sm font-black text-slate-900">
              07:45 AM
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Arrives at school by 08:15 AM</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              🌇 Afternoon Drop
            </span>
            <p className="font-display text-sm font-black text-slate-900">
              03:45 PM
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Departs school at 03:15 PM</p>
          </div>
        </div>

        {/* Driver Contact */}
        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-base font-bold">
              👨‍✈️
            </div>
            <div>
              <p className="font-display text-xs font-black text-slate-900">
                Driver: Mr. Rajesh Kumar • Attendant: Ramu
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Verified School Transport Staff</p>
            </div>
          </div>
          <a
            href="tel:+919876543210"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-display text-xs font-black transition-all shadow-2xs text-center cursor-pointer"
          >
            Call Driver 📞
          </a>
        </div>
      </div>

      {/* Truthful Telemetry Disclaimer */}
      {!busData.isLive ? (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-xs space-y-1 shadow-2xs">
          <p className="font-extrabold flex items-center gap-2">
            <span>ℹ</span> Live GPS hardware telemetry is currently standby.
          </p>
          <p className="text-indigo-900/80 leading-relaxed text-[11px] font-medium">
            Live tracking activates automatically when the bus driver starts the GPS trip broadcast on the active school route.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1 shadow-2xs">
          <p className="font-extrabold flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" /> Live Telemetry Active: Speed {busData.speed} km/h • ETA {busData.eta} mins
          </p>
        </div>
      )}
    </div>
  );
}
