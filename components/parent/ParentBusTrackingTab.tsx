'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getLiveBusLocationAction, type LiveBusLocationRecord } from '@/app/actions/busTrackingActions';
import { createClient } from '@/lib/supabase/client';

interface ParentBusTrackingTabProps {
  studentId?: string;
  studentName?: string;
  isLoading?: boolean;
  isEnabled?: boolean;
}

export function ParentBusTrackingTab({
  studentId,
  studentName = 'Aarav Sharma',
  isLoading = false,
  isEnabled = true,
}: ParentBusTrackingTabProps) {
  const [busLocation, setBusLocation] = useState<LiveBusLocationRecord | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);

  const fetchLocation = async () => {
    try {
      const loc = await getLiveBusLocationAction(undefined, studentId);
      if (loc) {
        setBusLocation(loc);
        const diffSec = Math.max(0, Math.floor((Date.now() - new Date(loc.last_updated).getTime()) / 1000));
        setSecondsAgo(diffSec);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, 4000);
    return () => clearInterval(interval);
  }, [studentId]);

  // Tick secondsAgo counter every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (busLocation?.last_updated) {
        const diff = Math.max(0, Math.floor((Date.now() - new Date(busLocation.last_updated).getTime()) / 1000));
        setSecondsAgo(diff);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [busLocation?.last_updated]);

  // Subscribe to Supabase realtime updates if active
  useEffect(() => {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel('bus-locations-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bus_locations' },
          () => {
            fetchLocation();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Ignored in offline dev
    }
  }, []);

  // Initialize Leaflet Map dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || !busLocation) return;

    let isMounted = true;

    async function initLeaflet() {
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapRef.current) return;

        const { latitude, longitude } = busLocation!;

        if (!leafletMapRef.current) {
          const map = L.map(mapRef.current, {
            center: [latitude, longitude],
            zoom: 15,
            zoomControl: false,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          // Custom bus icon
          const busIcon = L.divIcon({
            className: 'custom-bus-pin',
            html: `
              <div style="
                background: #f59e0b;
                border: 3px solid #ffffff;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                border-radius: 50%;
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
              ">
                🚌
              </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });

          const marker = L.marker([latitude, longitude], { icon: busIcon }).addTo(map);
          marker.bindPopup(`<b>BUS 21</b><br/>Driver: Rajesh Kumar<br/>Speed: ${busLocation?.speed_kmh || 0} km/h`);

          leafletMapRef.current = map;
          busMarkerRef.current = marker;
        } else {
          leafletMapRef.current.panTo([latitude, longitude]);
          if (busMarkerRef.current) {
            busMarkerRef.current.setLatLng([latitude, longitude]);
          }
        }
      } catch (err) {
        console.warn('[ParentBusTrackingTab] Leaflet initialization:', err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
    };
  }, [busLocation?.latitude, busLocation?.longitude]);

  const isLiveFresh = busLocation?.is_live && secondsAgo < 30;
  const isUpdating = busLocation?.is_live && secondsAgo >= 30 && secondsAgo < 120;
  const isStale = busLocation?.is_live && secondsAgo >= 120;
  const isTripEnded = !busLocation?.is_live;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-body">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🚌</span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 font-extrabold block">
                  CANONICAL SCHOOL TRANSPORT
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Track School Bus &middot; {studentName}
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Real-time browser GPS broadcast from Driver Rajesh Kumar (Bus 21 &middot; Greenwood Route).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLiveFresh && (
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                ● LIVE LOCATION ACTIVE
              </span>
            )}
            {isUpdating && (
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                ● UPDATING TELEMETRY
              </span>
            )}
            {isStale && (
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold">
                ⚠️ LAST KNOWN LOCATION
              </span>
            )}
            {isTripEnded && (
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-300 text-slate-600 text-xs font-bold">
                ⏹ TRIP NOT ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Live Telemetry KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Bus</span>
            <span className="font-display font-extrabold text-slate-900 text-sm">BUS 21</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GPS Freshness</span>
            <span className="font-display font-extrabold text-slate-900 text-sm">
              {isTripEnded ? 'Trip Ended' : secondsAgo === 0 ? 'Just now' : `${secondsAgo}s ago`}
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Speed</span>
            <span className="font-display font-extrabold text-slate-900 text-sm">
              {busLocation?.speed_kmh || 0} km/h
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GPS Accuracy</span>
            <span className="font-display font-extrabold text-emerald-700 text-sm">
              &plusmn;{busLocation?.accuracy_meters || 12}m
            </span>
          </div>
        </div>
      </div>

      {/* Realtime Interactive Leaflet Map Container */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-xs font-bold text-slate-700">Live Satellite / Street Position</span>
          <span className="text-[11px] font-mono text-slate-400">
            Lat: {busLocation?.latitude?.toFixed(5) || '28.53550'} &middot; Lng: {busLocation?.longitude?.toFixed(5) || '77.20900'}
          </span>
        </div>

        <div
          ref={mapRef}
          className="w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-200 relative z-10"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-2 pb-1">
          <span>📍 High-Accuracy Device Geolocation &middot; OpenStreetMap Leaflet Engine</span>
          <span>Synced with Canonical Database</span>
        </div>
      </div>
    </div>
  );
}
