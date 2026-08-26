'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import {
  updateLiveBusLocationAction,
  endLiveBusTripAction,
} from '@/app/actions/busTrackingActions';

export default function DriverPortalClient() {
  const [isTripActive, setIsTripActive] = useState(false);
  const [gpsPermissionState, setGpsPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
    timestamp: number;
  } | null>(null);
  const [lastBroadcastTime, setLastBroadcastTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Check initial geolocation capability
  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.geolocation) {
      setGpsPermissionState('unsupported');
      setErrorMsg('Geolocation is not supported by your browser.');
    }
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
        setGpsPermissionState('granted');
        setIsTripActive(true);
        setIsBusy(false);

        // Throttle server updates to at most once every 5 seconds
        if (now - lastUpdateRef.current >= 5000) {
          lastUpdateRef.current = now;
          try {
            await updateLiveBusLocationAction({
              busIdentifier: 'BUS-21',
              latitude,
              longitude,
              accuracy,
              speed,
              heading,
              isLive: true,
            });
            setLastBroadcastTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          } catch (err) {
            console.error('[DriverPortal] Location broadcast failed:', err);
          }
        }
      },
      (err) => {
        setIsBusy(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsPermissionState('denied');
          setErrorMsg('Location access is required to share the bus location with parents.');
        } else {
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

    setIsTripActive(false);
    setCurrentCoords(null);
    setLastBroadcastTime(null);

    try {
      await endLiveBusTripAction('BUS-21');
    } catch {
      // Ignored
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-body antialiased flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
            🚌
          </div>
          <div>
            <h1 className="font-display text-sm font-extrabold text-white tracking-wide">SHIKSHASETU &middot; DRIVER</h1>
            <p className="text-[11px] font-medium text-slate-400">Good morning, Rajesh</p>
          </div>
        </div>

        <SignOutButton className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          Sign Out
        </SignOutButton>
      </header>

      {/* Main Driver Operations Console */}
      <main className="max-w-xl w-full mx-auto my-auto space-y-5 py-6">
        {/* Vehicle Profile Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                ASSIGNED VEHICLE
              </span>
              <h2 className="font-display text-3xl font-black text-white">BUS 21</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">Route: Greenwood &rarr; ShikshaSetu Academy</p>
            </div>

            <div className="text-right">
              {isTripActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  LIVE LOCATION ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[11px] font-bold">
                  ● TRIP NOT STARTED
                </span>
              )}
            </div>
          </div>

          {/* Active GPS Telemetry Display */}
          {isTripActive && currentCoords && (
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Current Latitude</span>
                  <span className="font-mono font-bold text-white text-sm">{currentCoords.latitude.toFixed(6)}°</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Current Longitude</span>
                  <span className="font-mono font-bold text-white text-sm">{currentCoords.longitude.toFixed(6)}°</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">GPS Accuracy</span>
                  <span className="font-bold text-emerald-400">~{Math.round(currentCoords.accuracy)} metres</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Last Broadcast</span>
                  <span className="font-bold text-slate-300">{lastBroadcastTime || 'Just now'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Permission Denied / Error Warning */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs space-y-2">
              <p className="font-bold">⚠️ {errorMsg}</p>
              {gpsPermissionState === 'denied' && (
                <p className="text-[11px] text-rose-300">
                  Please enable location permissions in your browser or device settings and tap Try Again.
                </p>
              )}
            </div>
          )}

          {/* Primary Action Controls */}
          <div className="pt-2">
            {!isTripActive ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={handleStartTrip}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-extrabold text-base tracking-wide shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isBusy ? 'Requesting GPS Permission...' : '▶ START TRIP & BROADCAST GPS'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopTrip}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-display font-extrabold text-base tracking-wide shadow-lg shadow-rose-600/30 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⏹ STOP TRIP & END BROADCAST</span>
              </button>
            )}
          </div>
        </div>

        {/* Informational Guidance Note for Driver */}
        <div className="text-center text-[11px] text-slate-500 font-medium space-y-1">
          <p>📡 Uses high-accuracy device GPS &middot; Broadcasts to authorized parents in real-time</p>
          <p>Always keep this tab open during transit for uninterrupted live route tracking.</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl w-full mx-auto text-center text-[10px] font-mono text-slate-600 pt-4 border-t border-slate-900">
        ShikshaSetu School Fleet Network &middot; Bus Telemetry Node
      </footer>
    </div>
  );
}
