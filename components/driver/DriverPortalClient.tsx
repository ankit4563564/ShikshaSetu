'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import {
  updateLiveBusLocationAction,
  endLiveBusTripAction,
} from '@/app/actions/busTrackingActions';

type DriverGpsState =
  | 'GPS READY'
  | 'LOCATION ACTIVE'
  | 'LOCATION UNAVAILABLE'
  | 'NETWORK ERROR'
  | 'TRIP ENDED';

export default function DriverPortalClient() {
  const [driverState, setDriverState] = useState<DriverGpsState>('GPS READY');
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
    timestamp: number;
  } | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastServerAckRef = useRef<number>(0);

  // Check initial geolocation capability
  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.geolocation) {
      setDriverState('LOCATION UNAVAILABLE');
      setErrorMsg('Geolocation is not supported on this device.');
    }
  }, []);

  // Timer to calculate live freshness ("Updated X seconds ago")
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastServerAckRef.current > 0) {
        const diff = Math.floor((Date.now() - lastServerAckRef.current) / 1000);
        setSecondsAgo(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const handleStartTrip = () => {
    if (!navigator.geolocation) {
      setDriverState('LOCATION UNAVAILABLE');
      setErrorMsg('Geolocation is not supported on this device.');
      return;
    }

    setIsBusy(true);
    setErrorMsg(null);

    // Request actual browser geolocation position & start continuous watch
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        const now = Date.now();

        setCurrentCoords({
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          timestamp: now,
        });
        setIsBusy(false);
        setErrorMsg(null);

        // Throttle server updates to at most once every 4 seconds
        if (now - lastUpdateRef.current >= 4000) {
          lastUpdateRef.current = now;
          try {
            const res = await updateLiveBusLocationAction({
              busIdentifier: 'BUS-21',
              latitude,
              longitude,
              accuracy,
              speed,
              heading,
              isLive: true,
            });

            if (res.success) {
              lastServerAckRef.current = Date.now();
              setSecondsAgo(0);
              setDriverState('LOCATION ACTIVE');
            } else {
              setDriverState('NETWORK ERROR');
              setErrorMsg(res.error || 'Failed to broadcast location.');
            }
          } catch (err: any) {
            console.error('[DriverPortal] Location broadcast failed:', err);
            setDriverState('NETWORK ERROR');
            setErrorMsg(err?.message || 'Network communication error.');
          }
        }
      },
      (err) => {
        setIsBusy(false);
        if (err.code === err.PERMISSION_DENIED) {
          setDriverState('LOCATION UNAVAILABLE');
          setErrorMsg('Location permission was denied. Please allow location access to share bus position with parents.');
        } else {
          setDriverState('LOCATION UNAVAILABLE');
          setErrorMsg(`GPS error: ${err.message}`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = watchId;
  };

  const handleStopTrip = async () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setDriverState('TRIP ENDED');
    setCurrentCoords(null);
    lastServerAckRef.current = 0;

    try {
      await endLiveBusTripAction('BUS-21');
    } catch {
      // Ignored
    }
  };

  const isTripActive = driverState === 'LOCATION ACTIVE';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body antialiased flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between border-b border-slate-800/80 pb-3 pt-1">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🚌</span>
          <div>
            <h1 className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono">
              SHIKSHASETU FLEET
            </h1>
            <p className="text-sm font-bold text-white">Rajesh Kumar</p>
          </div>
        </div>

        <SignOutButton className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer">
          Sign Out
        </SignOutButton>
      </header>

      {/* Main Single-Purpose Screen */}
      <main className="max-w-md w-full mx-auto my-auto space-y-6 py-4">
        {/* Route Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block">
              ASSIGNED VEHICLE
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
              BUS-21
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 pt-1">
              Greenwood &rarr; ShikshaSetu Academy
            </p>
          </div>

          {/* Status Indicator */}
          <div className="py-2 flex justify-center">
            {driverState === 'GPS READY' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                ● GPS READY
              </span>
            )}
            {driverState === 'LOCATION ACTIVE' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono text-xs font-black shadow-lg shadow-emerald-500/10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                ● LIVE LOCATION SHARING
              </span>
            )}
            {driverState === 'LOCATION UNAVAILABLE' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-950/80 border border-rose-600/60 text-rose-300 font-mono text-xs font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                ⚠ LOCATION UNAVAILABLE
              </span>
            )}
            {driverState === 'NETWORK ERROR' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono text-xs font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                ⚠ NETWORK ERROR (RETRYING)
              </span>
            )}
            {driverState === 'TRIP ENDED' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono text-xs font-black">
                ● TRIP ENDED
              </span>
            )}
          </div>

          {/* Active Trip Telemetry Info */}
          {isTripActive && currentCoords && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400 font-medium">
                <span>Last updated:</span>
                <span className="font-bold text-white font-mono">
                  {secondsAgo <= 1 ? 'Just now' : `${secondsAgo}s ago`}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 font-medium">
                <span>GPS Accuracy:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  &plusmn;{Math.round(currentCoords.accuracy)}m
                </span>
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* HUGE ACTION BUTTON */}
          <div className="pt-2">
            {!isTripActive ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={handleStartTrip}
                className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-display font-black text-lg sm:text-xl tracking-wider shadow-xl shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isBusy ? 'Connecting GPS...' : '▶ START TRIP'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopTrip}
                className="w-full py-5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-display font-black text-lg sm:text-xl tracking-wider shadow-xl shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⏹ STOP TRIP</span>
              </button>
            )}
          </div>
        </div>

        {/* Driver Guidance */}
        <p className="text-center text-xs text-slate-500 font-medium px-4">
          Keep this screen open while driving. Bus location updates are automatically shared with student parents.
        </p>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] font-mono text-slate-600 pb-2">
        ShikshaSetu Driver Operations
      </footer>
    </div>
  );
}

