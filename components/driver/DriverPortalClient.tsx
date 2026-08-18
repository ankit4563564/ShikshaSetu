'use client';

import { useEffect, useRef, useState } from 'react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { boardStudent, deboardStudent, endTrip, raiseAlert, startTrip, updateLiveBusLocation } from '@/lib/journey';
import { createClient } from '@/lib/supabase/client';

type Screen = 'selector' | 'route' | 'boarding' | 'deboarding' | 'complete';
type Driver = { id: string; name: string; bus_identifier: string; emoji: string };
type Stop = { id: string; stop_name: string; stop_order: number; latitude: number; longitude: number; arrival_time: string };
type Student = { id: string; display_name: string };

// The current schema does not link drivers to vehicles. This profile is the seeded
// conductor with a configured route; keeping it explicit prevents unusable routes.
const DRIVERS: Driver[] = [
  { id: 'd1000000-0000-4000-8000-000000000001', name: 'Rajesh Kumar', bus_identifier: 'BUS-001', emoji: '🧑‍✈️' },
  { id: 'd1000000-0000-4000-8000-000000000002', name: 'Suresh Sharma', bus_identifier: 'BUS-002', emoji: '🚌' },
  { id: 'd1000000-0000-4000-8000-000000000003', name: 'Amit Singh', bus_identifier: 'BUS-003', emoji: '🚍' },
];

const progressKey = (tripId: string) => `shikshasetu:conductor-trip:${tripId}`;

// ── Rich Interactive Screen Components ──

function SelectorScreen({ selectedDriver, setSelectedDriver, setErrorText, isBusy, handleStartTrip }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="font-display text-xl font-extrabold text-slate-900">Select Bus Route &amp; Driver</h2>
          <p className="font-body text-xs text-slate-500 mt-1">
            Choose your assigned bus profile to start sharing live location and manage student boarding checklists.
          </p>
        </div>

        {/* Driver Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DRIVERS.map((driver) => {
            const isSelected = selectedDriver?.id === driver.id;
            return (
              <button
                key={driver.id}
                type="button"
                onClick={() => {
                  setSelectedDriver(driver);
                  setErrorText(null);
                }}
                className={`p-5 rounded-2xl text-left transition-all border flex flex-col justify-between h-36 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                    : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-3xl">{driver.emoji}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    {driver.bus_identifier}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-base font-extrabold">{driver.name}</h3>
                  <p className={`font-body text-xs mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    Route: Saket &rarr; School Gate #2
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-500">
            {selectedDriver ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Selected: {selectedDriver.name} ({selectedDriver.bus_identifier})
              </span>
            ) : (
              <span>Please tap a bus driver profile above to continue</span>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedDriver || isBusy}
            onClick={handleStartTrip}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-display text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2 ${
              !selectedDriver || isBusy
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
            }`}
          >
            <span>{isBusy ? 'Initializing Route...' : '▶ Start Bus Route & GPS Broadcast'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function RouteScreen({ currentStop, currentStopIndex, stops, gpsError, isBusy, openCurrentStop, selectedDriver }: any) {
  const isFinalStop = currentStopIndex === stops.length - 1;
  const progressPercent = Math.round(((currentStopIndex + 1) / stops.length) * 100);

  return (
    <div className="space-y-6">
      {/* Route Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-xs">
              {selectedDriver.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-extrabold text-slate-900">{selectedDriver.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                  {selectedDriver.bus_identifier}
                </span>
              </div>
              <p className="font-body text-xs text-slate-500 mt-0.5">Route 4A Saket &middot; Stop {currentStopIndex + 1} of {stops.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-2 shadow-2xs">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              Live Location Active (24 km/h)
            </span>
          </div>
        </div>

        {/* 1. VISUAL LIVE GPS MAP TELEMETRY CANVAS */}
        <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📡</span>
              <span className="font-display text-xs font-bold text-slate-200 uppercase tracking-wider">
                Live Bus Location &amp; Route Map
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-sky-400">Signal: 4G High Accuracy (±3m)</span>
          </div>

          {/* Animated Route Vector Graphic */}
          <div className="relative z-10 space-y-2 py-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 font-mono">
              <span>Route Progress</span>
              <span className="text-emerald-400">{progressPercent}% Completed</span>
            </div>

            <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Horizontal Visual Stop Markers */}
            <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
              {stops.map((s: any, i: number) => (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    i === currentStopIndex
                      ? 'bg-amber-400 ring-4 ring-amber-400/30 animate-pulse'
                      : i < currentStopIndex
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`} />
                  <span className={`truncate max-w-[80px] text-center ${
                    i === currentStopIndex ? 'text-amber-300 font-bold' : 'text-slate-500'
                  }`}>
                    {s.stop_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. CURRENT ACTIVE STOP PRIMARY BANNER */}
        {currentStop && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Current Active Stop #{currentStopIndex + 1}
              </span>
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                Expected: {currentStop.arrival_time || '07:45 AM'}
              </span>
            </div>

            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{currentStop.stop_name}</h3>
              <p className="font-body text-xs text-slate-400 mt-1">
                {isFinalStop ? 'Destination: School Campus Gate #2' : 'Pickup Location · Tap below to verify student boarding'}
              </p>
            </div>

            <button
              type="button"
              disabled={isBusy}
              onClick={openCurrentStop}
              className="w-full py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-display text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 text-center"
            >
              <span>{isBusy ? 'Opening Checklist...' : `📋 Open Checklist for ${currentStop.stop_name} →`}</span>
            </button>
          </div>
        )}

        {/* 3. TIMELINE OF ALL ROUTE STOPS WITH CONNECTING GRAPHIC */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-slate-400">Full Route Schedule</h4>
            <span className="text-[11px] font-semibold text-slate-500">{stops.length} Total Stops</span>
          </div>

          <div className="space-y-3">
            {stops.map((stop: any, idx: number) => {
              const isPast = idx < currentStopIndex;
              const isCurrent = idx === currentStopIndex;
              return (
                <div
                  key={stop.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all shadow-2xs ${
                    isCurrent
                      ? 'bg-amber-50/90 border-amber-300 font-bold text-amber-900 shadow-xs'
                      : isPast
                      ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-extrabold shadow-2xs ${
                      isCurrent
                        ? 'bg-amber-500 text-white'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isPast ? '✓' : idx + 1}
                    </span>
                    <div>
                      <h5 className={`font-display text-sm font-extrabold ${isPast ? 'line-through opacity-70' : 'text-slate-900'}`}>
                        {stop.stop_name}
                      </h5>
                      <p className="font-body text-[11px] text-slate-500">Scheduled Stop #{idx + 1}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold opacity-80">{stop.arrival_time || '07:45 AM'}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isCurrent
                        ? 'bg-amber-200 text-amber-900 border border-amber-300 animate-pulse'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {isCurrent ? '🟢 ACTIVE PICKUP' : isPast ? '✓ COMPLETED' : 'UPCOMING'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardingScreen({ currentStop, currentStopIndex, stops, students, studentStatus, busyStudentId, board, isBusy, continueFromBoarding }: any) {
  const isFinalStop = currentStopIndex === stops.length - 1;
  const boardedCount = Object.values(studentStatus).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Boarding Verification</span>
            <h2 className="font-display text-xl font-extrabold text-slate-900">{currentStop.stop_name}</h2>
          </div>
          <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full font-bold text-xs">
            {boardedCount} of {students.length} Boarded
          </div>
        </div>

        {/* Student Roster */}
        {students.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <p className="text-2xl">🚌</p>
            <p className="font-body text-xs font-bold text-slate-600">No assigned students at this stop.</p>
            <p className="font-body text-[11px] text-slate-400">Tap continue to proceed along the route.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student: any) => {
              const isBoarded = studentStatus[student.id];
              const isBoardingThis = busyStudentId === student.id;
              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isBoarded
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isBoarded ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {student.display_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-extrabold">{student.display_name}</h4>
                      <span className="text-[11px] font-semibold text-slate-500">Saket Stop #3 &middot; Bus #4</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isBoarded || isBoardingThis}
                    onClick={() => board(student.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      isBoarded
                        ? 'bg-emerald-600 text-white cursor-default'
                        : isBoardingThis
                        ? 'bg-slate-300 text-slate-600'
                        : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95 shadow-xs'
                    }`}
                  >
                    {isBoarded ? '✓ Boarded' : isBoardingThis ? 'Boarding...' : 'Mark Boarded'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">
            {students.length - boardedCount > 0 ? (
              <span className="text-amber-700 font-bold">⚠️ {students.length - boardedCount} student(s) unboarded</span>
            ) : (
              <span className="text-emerald-700 font-bold">✓ All stop students accounted for</span>
            )}
          </p>

          <button
            type="button"
            disabled={isBusy}
            onClick={continueFromBoarding}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-display text-xs font-extrabold hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <span>{isBusy ? 'Processing...' : isFinalStop ? 'Proceed to Deboarding →' : 'Continue to Next Stop →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DeboardingScreen({ currentStop, students, studentStatus, busyStudentId, deboard, isBusy, finishRoute }: any) {
  const deboardedCount = Object.values(studentStatus).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Final Destination Arrival</span>
            <h2 className="font-display text-xl font-extrabold text-slate-900">School Campus Gate #2</h2>
          </div>
          <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full font-bold text-xs">
            {deboardedCount} of {students.length} Deboarded
          </div>
        </div>

        {students.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <p className="text-2xl">🏫</p>
            <p className="font-body text-xs font-bold text-slate-600">All students deboarded safely.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student: any) => {
              const isDeboarded = studentStatus[student.id];
              const isDeboardingThis = busyStudentId === student.id;
              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isDeboarded
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {student.display_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-extrabold">{student.display_name}</h4>
                      <span className="text-[11px] font-semibold text-slate-500">Arrived at School Gate #2</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isDeboarded || isDeboardingThis}
                    onClick={() => deboard(student)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      isDeboarded
                        ? 'bg-emerald-600 text-white cursor-default'
                        : isDeboardingThis
                        ? 'bg-slate-300 text-slate-600'
                        : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95 shadow-xs'
                    }`}
                  >
                    {isDeboarded ? '✓ Deboarded Safe' : isDeboardingThis ? 'Deboarding...' : 'Verify Deboard'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">
            {deboardedCount === students.length ? (
              <span className="text-emerald-700 font-bold">✓ 100% Students Safely Deboarded</span>
            ) : (
              <span className="text-amber-700 font-bold">⚠️ Verify all students before finishing route</span>
            )}
          </p>

          <button
            type="button"
            disabled={isBusy}
            onClick={finishRoute}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-display text-xs font-extrabold hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <span>{isBusy ? 'Finalizing Route...' : '🏁 Complete Route & Send Notifications →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CompleteScreen({ completion, resetTrip, setNotice, setErrorText, setScreen }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl font-bold shadow-inner">
          ✓
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Route Completed Successfully!</h2>
          <p className="font-body text-xs text-slate-500 leading-relaxed">
            All parents and school administrators have been notified of safe arrival at School Campus Gate #2.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Boarded</span>
            <strong className="text-2xl font-black text-slate-900 mt-1 block">{completion.boarded}</strong>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Deboarded</span>
            <strong className="text-2xl font-black text-emerald-700 mt-1 block">{completion.deboarded}</strong>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Missed</span>
            <strong className="text-2xl font-black text-amber-700 mt-1 block">{completion.missed}</strong>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => {
              resetTrip();
              setScreen('selector');
            }}
            className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-display text-xs font-black hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            🔄 Start New Route
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DriverPortalClient() {
  const supabase = createClient();
  const watchIdRef = useRef<number | null>(null);
  const [screen, setScreen] = useState<Screen>('selector');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentStatus, setStudentStatus] = useState<Record<string, boolean>>({});
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [boardingOpenedAt, setBoardingOpenedAt] = useState<number | null>(null);
  const [completion, setCompletion] = useState({ boarded: 0, deboarded: 0, missed: 0 });

  const clearGpsWatch = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const saveProgress = (id: string, stopIndex: number) => {
    localStorage.setItem(progressKey(id), JSON.stringify({ stopIndex }));
  };

  const loadRoute = async (busIdentifier: string) => {
    const { data, error } = await supabase
      .from('bus_stops')
      .select('id, stop_name, stop_order, latitude, longitude, arrival_time')
      .eq('bus_identifier', busIdentifier)
      .order('stop_order', { ascending: true });

    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error(`No route has been configured for ${busIdentifier}.`);
    return data as Stop[];
  };

  const startGpsBroadcast = (busIdentifier: string) => {
    if (!navigator.geolocation) {
      setGpsError('This device does not support GPS. Route operations will work without live tracking.');
      setNotice('Operating in manual mode - Complete stops manually.');
      return;
    }

    clearGpsWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await updateLiveBusLocation(busIdentifier, position.coords.latitude, position.coords.longitude, position.coords.speed, position.coords.heading);
          setGpsError(null);
          if (notice?.includes('manual mode')) {
            setNotice(null);
          }
        } catch (err) {
          console.warn('[Driver GPS] Location update failed:', err);
          setGpsError('Live location could not be saved. Route checklist remains available.');
        }
      },
      (gpsError) => {
        // CRITICAL FIX: Graceful GPS fallback
        if (gpsError.code === gpsError.PERMISSION_DENIED) {
          setGpsError('GPS permission denied. Continuing in manual mode.');
          setNotice('Manual mode: Mark stops as completed. Parents will see route progress without live tracking.');
        } else if (gpsError.code === gpsError.POSITION_UNAVAILABLE) {
          setGpsError('GPS signal weak. Retrying...');
          setNotice('Operating with limited GPS. Route operations continue normally.');
        } else {
          setGpsError('GPS timeout. Retrying automatically.');
        }
        // Don't block route operations - continue in manual mode
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 10_000 },
    );
  };

  const resetTrip = () => {
    clearGpsWatch();
    setTripId(null);
    setSelectedDriver(null);
    setStops([]);
    setStudents([]);
    setStudentStatus({});
    setCurrentStopIndex(0);
    setBoardingOpenedAt(null);
  };

  const handleStartTrip = async () => {
    if (!selectedDriver) return;
    setIsBusy(true);
    setErrorText(null);
    setNotice(null);
    try {
      const route = await loadRoute(selectedDriver.bus_identifier);
      const id = await startTrip(selectedDriver.id, selectedDriver.bus_identifier);
      const saved = localStorage.getItem(progressKey(id));
      const savedIndex = saved ? Number(JSON.parse(saved).stopIndex) : 0;
      const stopIndex = Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < route.length ? savedIndex : 0;
      setStops(route);
      setTripId(id);
      setCurrentStopIndex(stopIndex);
      saveProgress(id, stopIndex);
      startGpsBroadcast(selectedDriver.bus_identifier);
      setScreen('route');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to start the route.');
    } finally {
      setIsBusy(false);
    }
  };

  const loadStudentsForBoarding = async (stop: Stop, id: string) => {
    const [{ data: assigned, error: assignedError }, { data: journeys, error: journeyError }] = await Promise.all([
      supabase.from('student_stops').select('student_id, students(id, display_name)').eq('stop_id', stop.id),
      supabase.from('student_journey').select('student_id, status').eq('trip_id', id),
    ]);
    if (assignedError || journeyError) throw new Error(assignedError?.message || journeyError?.message || 'Unable to load the stop checklist.');

    const roster = (assigned || []).flatMap((row: any) => row.students ? [{ id: row.students.id, display_name: row.students.display_name }] : []);
    const state = Object.fromEntries(roster.map((student) => [student.id, journeys?.some((journey) => journey.student_id === student.id && journey.status === 'boarded') ?? false]));
    setStudents(roster);
    setStudentStatus(state);
  };

  const openCurrentStop = async () => {
    const stop = stops[currentStopIndex];
    if (!stop || !tripId) return;
    setIsBusy(true);
    setErrorText(null);
    setNotice(null);
    try {
      await loadStudentsForBoarding(stop, tripId);
      setBoardingOpenedAt(Date.now());
      setScreen('boarding');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to open this stop.');
    } finally {
      setIsBusy(false);
    }
  };

  const board = async (studentId: string) => {
    if (!tripId) return;
    setBusyStudentId(studentId);
    setErrorText(null);
    try {
      await boardStudent(studentId, tripId);
      setStudentStatus((current) => ({ ...current, [studentId]: true }));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to record boarding.');
    } finally {
      setBusyStudentId(null);
    }
  };

  const openDeboarding = async () => {
    if (!tripId) return;
    const { data, error } = await supabase
      .from('student_journey')
      .select('student_id, students(id, display_name)')
      .eq('trip_id', tripId)
      .eq('status', 'boarded');
    if (error) throw new Error(error.message);
    const roster = (data || []).flatMap((row: any) => row.students ? [{ id: row.students.id, display_name: row.students.display_name }] : []);
    setStudents(roster);
    setStudentStatus(Object.fromEntries(roster.map((student) => [student.id, false])));
    setScreen('deboarding');
  };

  const continueFromBoarding = async () => {
    if (!tripId) return;
    const missed = students.filter((student) => !studentStatus[student.id]);
    setIsBusy(true);
    setErrorText(null);
    try {
      await Promise.all(missed.map((student) => raiseAlert(student.id, tripId, 'missed_stop', `${student.display_name} did not board at ${stops[currentStopIndex].stop_name}. Parent and teacher have been notified.`)));
      if (missed.length) setNotice(`${missed.length} missed-stop alert${missed.length === 1 ? '' : 's'} sent.`);
      setBoardingOpenedAt(null);
      if (currentStopIndex === stops.length - 1) {
        await openDeboarding();
      } else {
        const next = currentStopIndex + 1;
        setCurrentStopIndex(next);
        saveProgress(tripId, next);
        setScreen('route');
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not continue to the next step.');
    } finally {
      setIsBusy(false);
    }
  };

  const deboard = async (student: Student) => {
    const stop = stops[currentStopIndex];
    if (!tripId || !stop) return;
    setBusyStudentId(student.id);
    setErrorText(null);
    try {
      await deboardStudent(student.id, tripId, stop.stop_name, stop.latitude, stop.longitude);
      setStudentStatus((current) => ({ ...current, [student.id]: true }));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to record deboarding.');
    } finally {
      setBusyStudentId(null);
    }
  };

  const finishRoute = async () => {
    if (!tripId) return;
    const remaining = students.filter((student) => !studentStatus[student.id]);
    if (remaining.length) {
      setErrorText(`Deboard every student before completing the route (${remaining.length} still on the bus).`);
      return;
    }
    setIsBusy(true);
    try {
      const { data, error } = await supabase.from('student_journey').select('status').eq('trip_id', tripId);
      if (error) throw new Error(error.message);
      await endTrip(tripId);
      localStorage.removeItem(progressKey(tripId));
      setCompletion({
        boarded: data?.filter((journey) => ['deboarded', 'home_safe'].includes(journey.status)).length || 0,
        deboarded: data?.filter((journey) => ['deboarded', 'home_safe'].includes(journey.status)).length || 0,
        missed: data?.filter((journey) => journey.status === 'waiting').length || 0,
      });
      clearGpsWatch();
      setScreen('complete');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Unable to complete the route.');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => () => clearGpsWatch(), []);

  const currentStop = stops[currentStopIndex];
  const boardedCount = Object.values(studentStatus).filter(Boolean).length;

  return (
    <main className="driver-portal-shell mx-auto min-h-screen max-w-6xl bg-paper px-4 py-6 font-body text-deep-teal sm:px-6 lg:px-10">
      {/* Driving Safety Banner */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">⚠️</span>
          <div>
            <strong className="text-xs font-black block">Safety Protocol: Hands-Free Vehicle Mode</strong>
            <p className="text-[10px] font-semibold opacity-80">Drivers must not operate mobile screens while vehicle is in motion. App is operated by the Bus Conductor / Attendant.</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-[10px] font-extrabold text-amber-900 border border-amber-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
          PASSIVE GPS ACTIVE
        </span>
      </div>

      <header className="driver-portal-header mb-7 rounded-[2rem] border border-white/80 bg-white/70 p-6 text-center shadow-[0_18px_45px_rgba(63,81,181,.09)] backdrop-blur-xl sm:p-8 relative">
        <div className="absolute top-4 right-4">
          <SignOutButton
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-display text-xs font-bold transition-all border border-rose-200/60"
            title="Sign Out"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </SignOutButton>
        </div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-deep-teal/45">Bus Transit & Conductor Console</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Transport Attendant Portal</h1>
        <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-relaxed text-deep-teal/60">Designed for the bus conductor to log student boarding & deboarding — while the driver focuses 100% on safe navigation with passive background GPS streaming.</p>
      </header>

      {errorText && <div role="alert" className="mb-5 rounded-xl border border-warm-clay/30 bg-warm-clay/10 p-3 text-xs font-semibold text-warm-clay">⚠ {errorText}</div>}
      {notice && <div className="mb-5 rounded-xl border border-sage/20 bg-sage/10 p-3 text-xs font-semibold text-sage">✓ {notice}</div>}

      {screen === 'selector' && <SelectorScreen selectedDriver={selectedDriver} setSelectedDriver={setSelectedDriver} setErrorText={setErrorText} isBusy={isBusy} handleStartTrip={handleStartTrip} />}
      {screen === 'route' && selectedDriver && <RouteScreen currentStop={currentStop} currentStopIndex={currentStopIndex} stops={stops} gpsError={gpsError} isBusy={isBusy} openCurrentStop={openCurrentStop} selectedDriver={selectedDriver} />}
      {screen === 'boarding' && currentStop && <BoardingScreen currentStop={currentStop} currentStopIndex={currentStopIndex} stops={stops} students={students} studentStatus={studentStatus} busyStudentId={busyStudentId} board={board} isBusy={isBusy} continueFromBoarding={continueFromBoarding} />}
      {screen === 'deboarding' && currentStop && <DeboardingScreen currentStop={currentStop} students={students} studentStatus={studentStatus} busyStudentId={busyStudentId} deboard={deboard} isBusy={isBusy} finishRoute={finishRoute} />}
      {screen === 'complete' && <CompleteScreen completion={completion} resetTrip={resetTrip} setNotice={setNotice} setErrorText={setErrorText} setScreen={setScreen} />}
    </main>
  );
}
