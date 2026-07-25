'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Real-world road polyline coordinates matching the Noida/Saket school transit corridor
// (Saket → DND Flyway → Sector 128 → Sector 39 → Dadri Main Rd → Yamuna Canal Rd → School)
const ROAD_ROUTE_COORDINATES: [number, number][] = [
  [28.5355, 77.3411], // 1. Home / RDS Noida Sector 128
  [28.5412, 77.3450], // DND Expressway Ramp
  [28.5480, 77.3485], // Sector 44 Flyover
  [28.5552, 77.3508], // 2. Active Stop: Maple Residency (Sector 39)
  [28.5610, 77.3540], // Sector 39 Junction
  [28.5678, 77.3592], // Dadri Main Rd Turn
  [28.5805, 77.3620], // ISKCON Noida Corridor
  [28.5950, 77.3680], // NEPZ Post Office Intersection
  [28.6080, 77.3720], // Yamuna Canal Rd Bridge
  [28.6210, 77.3820], // 3. Noida School Campus Gate #2
];

// Helper to interpolate between two LatLng points
function interpolateLatLng(p1: [number, number], p2: [number, number], factor: number): [number, number] {
  return [
    p1[0] + (p2[0] - p1[0]) * factor,
    p1[1] + (p2[1] - p1[1]) * factor,
  ];
}

// Helper to compute compass bearing angle (in degrees) between two points
function calculateBearing(p1: [number, number], p2: [number, number]): number {
  const lat1 = (p1[0] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

interface InteractiveTransitMapProps {
  showInfoPanel?: boolean;
  parentPortalHref?: string;
  nextStopName?: string;
  etaMins?: string;
  driverName?: string;
  busNumber?: string;
}

export default function InteractiveTransitMap({
  showInfoPanel = true,
  parentPortalHref = '/parent',
  nextStopName = 'Maple Residency',
  etaMins = '04',
  driverName = 'Rakesh Kumar',
  busNumber = 'Bus 04',
}: InteractiveTransitMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);

  const [routeProgress, setRouteProgress] = useState(68);
  const [currentSpeed, setCurrentSpeed] = useState(28);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Leaflet Map dynamically to avoid SSR window errors
  useEffect(() => {
    let animationFrameId: number;
    let isSubscribed = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        // Dynamically import Leaflet
        const L = (await import('leaflet')).default;

        if (!isSubscribed || !mapContainerRef.current) return;

        // 1. Initialize Map centered on active route
        const map = L.map(mapContainerRef.current, {
          center: [28.5600, 77.3550],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        // 2. Add Premium Light Map Style Tiles (CartoDB Positron / Light Vector style)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        // 3. Draw Completed & Remaining Road Polyline Paths
        const fullPath = ROAD_ROUTE_COORDINATES;
        const splitIndex = 3; // Active progress split at Stop 2

        const completedPath = fullPath.slice(0, splitIndex + 1);
        const remainingPath = fullPath.slice(splitIndex);

        // Completed route (Light Blue Glow)
        L.polyline(completedPath, {
          color: '#60a5fa',
          weight: 6,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Active/Remaining route (Deep Indigo Polyline)
        L.polyline(remainingPath, {
          color: '#4f63d2',
          weight: 7,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // 4. Add Custom Waypoint Markers matching mockup design
        const createWaypointHtml = (label: string, iconSymbol: string, statusClass: string) => `
          <div class="flex flex-col items-center group">
            <div class="h-9 w-9 rounded-full bg-slate-900 border-2 border-white text-white flex items-center justify-center shadow-lg text-sm font-bold transition-transform group-hover:scale-110">
              ${iconSymbol}
            </div>
            <div class="mt-1 px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[10px] font-extrabold text-slate-900 shadow-sm border border-slate-200 whitespace-nowrap">
              ${label}
            </div>
          </div>
        `;

        // Home Waypoint Marker
        const homeIcon = L.divIcon({
          html: createWaypointHtml('Home', '🏠', 'home'),
          className: 'custom-waypoint-marker',
          iconSize: [80, 50],
          iconAnchor: [40, 25],
        });
        L.marker(ROAD_ROUTE_COORDINATES[0], { icon: homeIcon }).addTo(map);

        // Maple Residency Waypoint Marker
        const mapleIcon = L.divIcon({
          html: createWaypointHtml('Maple Residency', '🚏', 'active'),
          className: 'custom-waypoint-marker',
          iconSize: [110, 50],
          iconAnchor: [55, 25],
        });
        L.marker(ROAD_ROUTE_COORDINATES[3], { icon: mapleIcon }).addTo(map);

        // School Waypoint Marker
        const schoolIcon = L.divIcon({
          html: createWaypointHtml('School', '🎓', 'school'),
          className: 'custom-waypoint-marker',
          iconSize: [80, 50],
          iconAnchor: [40, 25],
        });
        L.marker(ROAD_ROUTE_COORDINATES[ROAD_ROUTE_COORDINATES.length - 1], { icon: schoolIcon }).addTo(map);

        // 5. Add Animated Yellow Bus Marker with Compass Rotation
        const busIcon = L.divIcon({
          html: `
            <div id="yellow-bus-marker" class="relative flex items-center justify-center">
              <div class="absolute h-12 w-12 rounded-full bg-indigo-500/30 animate-ping"></div>
              <div class="relative h-10 w-10 rounded-full bg-amber-400 border-2 border-white text-slate-900 flex items-center justify-center shadow-xl text-lg transition-transform duration-300">
                🚌
              </div>
            </div>
          `,
          className: 'custom-bus-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const busMarker = L.marker(ROAD_ROUTE_COORDINATES[splitIndex], { icon: busIcon }).addTo(map);
        busMarkerRef.current = busMarker;

        setIsMapLoaded(true);

        // 6. Smooth 60 FPS Bus Movement RequestAnimationFrame Loop along Road Segments
        let progress = 0;
        let segmentIndex = 2; // Start around Maple Residency road segment

        const animateBus = () => {
          if (!isSubscribed) return;

          progress += 0.0015;
          if (progress >= 1) {
            progress = 0;
            segmentIndex = (segmentIndex + 1) % (ROAD_ROUTE_COORDINATES.length - 1);
          }

          const startPt = ROAD_ROUTE_COORDINATES[segmentIndex];
          const endPt = ROAD_ROUTE_COORDINATES[segmentIndex + 1];

          if (startPt && endPt) {
            const currentPos = interpolateLatLng(startPt, endPt, progress);
            const bearing = calculateBearing(startPt, endPt);

            if (busMarkerRef.current) {
              busMarkerRef.current.setLatLng(currentPos);
              
              // Rotate yellow bus marker to match road heading angle
              const markerEl = document.getElementById('yellow-bus-marker');
              if (markerEl) {
                markerEl.style.transform = `rotate(${bearing - 90}deg)`;
              }
            }
          }

          animationFrameId = requestAnimationFrame(animateBus);
        };

        animateBus();
      } catch (err) {
        console.warn('[Interactive Transit Map] Leaflet dynamic initialization error:', err);
      }
    }

    initMap();

    return () => {
      isSubscribed = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="grid overflow-hidden rounded-[28px] border border-slate-800 shadow-[0_32px_80px_rgba(15,20,80,.25)] lg:grid-cols-[1.55fr_1fr] bg-[#0b1329]">
      
      {/* ── MAP CONTAINER PANEL ── */}
      <div className="relative min-h-[480px] sm:min-h-[520px] w-full overflow-hidden bg-slate-100">
        
        {/* Leaflet Map Target */}
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full z-10" />

        {/* Top-Left Live Status Badge */}
        <div className="absolute left-5 top-5 z-20 flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md border border-slate-200">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold text-slate-900">{busNumber} &middot; Live</p>
            <p className="text-[9px] font-semibold text-slate-500">Aarav boarded at 2:43 PM</p>
          </div>
        </div>

        {/* Bottom Progress Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 py-4 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent">
          <div className="flex items-center justify-between mb-1.5 font-mono text-[10px] font-bold text-white">
            <span className="uppercase tracking-wider">Route progress</span>
            <span className="text-sky-400">{routeProgress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${routeProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT INFO PANEL ── */}
      {showInfoPanel && (
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 text-white bg-[#0b1329] border-t lg:border-t-0 lg:border-l border-slate-800 space-y-6">
          
          {/* Header: Next Stop & ETA Pill */}
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] uppercase text-slate-400">Next Stop</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {nextStopName}
                </h3>
                <p className="font-body text-xs text-slate-400 mt-1">
                  1.2 km away &middot; Saket, Noida
                </p>
              </div>

              {/* ETA Badge */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-400 text-slate-950 px-4 py-2.5 font-black shrink-0 shadow-md">
                <span className="text-xl leading-none">{etaMins}</span>
                <span className="text-[9px] uppercase tracking-wider leading-none mt-1">Min ETA</span>
              </div>
            </div>
          </div>

          {/* Telemetry Metrics Table */}
          <div className="space-y-3 font-body text-xs border-t border-b border-slate-800 py-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Status
              </span>
              <span className="font-bold text-emerald-400">On Route</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <span>⏱️</span> Current speed
              </span>
              <span className="font-bold font-mono text-white">{currentSpeed} km/h</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <span>📡</span> Last GPS ping
              </span>
              <span className="font-bold text-slate-300 font-mono">6 sec ago</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <span>🛡️</span> Arrival confidence
              </span>
              <span className="font-bold text-emerald-400">High</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <span>🔔</span> Guardian notified
              </span>
              <span className="font-bold text-emerald-400 font-mono">✓ 2:43 PM</span>
            </div>
          </div>

          {/* Driver Info Card */}
          <div className="space-y-3">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">Driver</span>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black flex items-center justify-center text-xs shrink-0">
                RK
              </div>
              <div>
                <h4 className="font-display text-sm font-extrabold text-white">{driverName}</h4>
                <p className="font-body text-xs text-slate-400">Safe driver &middot; ★ 4.9</p>
              </div>
            </div>
            <p className="font-body text-xs italic text-slate-400">&ldquo;Your child is on the way home.&rdquo;</p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <Link
              href={parentPortalHref}
              className="w-full py-3.5 px-6 rounded-2xl border border-slate-700 hover:border-white bg-slate-900/80 hover:bg-slate-800 text-white font-display text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 text-center"
            >
              <span>Open Parent Portal &rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
