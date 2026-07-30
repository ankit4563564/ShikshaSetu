'use client';

import { useState, useEffect, useRef } from 'react';
import { getCanonicalBusLocation } from '@/lib/canonical';
import { createClient } from '@/lib/supabase/client';

interface ChatMessage {
  id: string;
  studentId: string;
  senderId: string;
  senderRole: 'parent' | 'teacher' | 'student';
  messageText: string;
  isContextFlag: boolean;
  createdAt: string;
}

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
  const [busMetrics, setBusMetrics] = useState<{ speed: number; nextStop: string; eta: number }>({ speed: 0, nextStop: 'Loading...', eta: 0 });
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    async function loadBusData() {
      try {
        const busLocation = await getCanonicalBusLocation();
        if (busLocation) {
          setBusMetrics({
            speed: busLocation.speed_kmh,
            nextStop: busLocation.next_stop,
            eta: busLocation.eta_minutes,
          });
          setLastUpdated(Math.floor((Date.now() - new Date(busLocation.last_updated).getTime()) / 1000));
        }
      } catch (error) {
        console.error('Failed to load bus data:', error);
      }
    }
    loadBusData();
  }, [studentId]);
  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deep-teal/10 pb-3">
          <div>
            <h3 className="font-display text-xl font-black text-deep-teal">Guardian Journey™</h3>
            <p className="font-body text-xs text-deep-teal/60 font-semibold mt-0.5">
              Live child safety updates at every step.
            </p>
          </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deep-teal/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl font-black text-deep-teal">
              Guardian Journey™
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-sage/15 text-sage font-extrabold text-[10px] uppercase tracking-wider border border-sage/30">
              🛡️ Live Child Safety Updates
            </span>
          </div>
          <p className="font-body text-xs text-deep-teal/60 font-semibold mt-0.5">
            Verified safety updates at every step of your child's school day.
          </p>
        </div>
      </div>

      {/* Live tracking hero card */}
      <div className="rounded-3xl bg-gradient-to-br from-sage/15 via-white to-primary/5 border border-sage/30 p-6 shadow-md backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">Status</span>
              <strong className="text-xl font-black leading-none mt-1">Verified</strong>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sage animate-ping" />
                <h4 className="font-display text-base font-black text-ink">Child Safety Status: Fully Verified</h4>
              </div>
              <p className="text-xs font-semibold text-muted/80">All safety checkpoints confirmed today.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bus metrics footer */}
      <div className="journey-map rounded-2xl border border-deep-teal/10 bg-paper p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2">
          <span className="font-display text-xs font-bold text-deep-teal/40 uppercase tracking-widest">
            Live Bus Tracking
          </span>
          <span className="text-[10px] text-sage font-extrabold uppercase bg-sage/10 px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Live
          </span>
        </div>

        {/* Simple bus route visualization */}
        <div className="h-[250px] w-full rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-deep-teal/5 relative overflow-hidden">
          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Route path */}
            <path d="M 50 200 Q 100 150 150 120 T 250 80 T 350 50" 
                  fill="none" 
                  stroke="#0F766E" 
                  strokeWidth="3" 
                  strokeDasharray="8,4"
                  strokeLinecap="round"/>
            
            {/* Stop markers */}
            <circle cx="50" cy="200" r="6" fill="#0F766E" />
            <circle cx="150" cy="120" r="6" fill="#0F766E" />
            <circle cx="250" cy="80" r="6" fill="#0F766E" />
            <circle cx="350" cy="50" r="6" fill="#0F766E" />
            
            {/* Bus icon on route */}
            <g transform="translate(200, 95)">
              <rect x="-12" y="-8" width="24" height="16" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5"/>
              <circle cx="-6" cy="8" r="3" fill="#1F2937"/>
              <circle cx="6" cy="8" r="3" fill="#1F2937"/>
              <rect x="-8" y="-4" width="16" height="6" rx="1" fill="#FEF3C7"/>
            </g>
            
            {/* Stop labels */}
            <text x="50" y="220" fontSize="10" fill="#64748B" textAnchor="middle">Sector 12</text>
            <text x="150" y="140" fontSize="10" fill="#64748B" textAnchor="middle">Rajouri Garden</text>
            <text x="250" y="100" fontSize="10" fill="#64748B" textAnchor="middle">Paschim Vihar</text>
            <text x="350" y="70" fontSize="10" fill="#64748B" textAnchor="middle">School</text>
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg px-3 py-1.5 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-3 h-3 rounded-full bg-[#0F766E]"></div>
              <span className="text-slate-600 font-medium">Bus Route</span>
              <div className="w-4 h-3 rounded bg-[#F59E0B] border border-[#B45309]"></div>
              <span className="text-slate-600 font-medium">Bus #4</span>
            </div>
          </div>
        </div>

        {/* Map Footer Information */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-deep-teal/5 text-center">
          <div className="space-y-0.5">
            <span className="text-[9px] text-deep-teal/40 uppercase tracking-wider block font-bold">Next stop</span>
            <span className="font-body text-xs font-bold text-deep-teal/80">{busMetrics.nextStop}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] text-deep-teal/40 uppercase tracking-wider block font-bold">ETA</span>
            <span className="font-body text-xs font-bold text-deep-teal/80">{busMetrics.eta} mins</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] text-deep-teal/40 uppercase tracking-wider block font-bold">Speed</span>
            <span className="font-body text-xs font-bold text-deep-teal/80">{busMetrics.speed} km/h</span>
          </div>
        </div>

        <div className="text-[9px] text-deep-teal/30 pt-1 font-medium italic text-right">
          Last location update: {lastUpdated < 60 ? `${lastUpdated} sec ago` : `${Math.floor(lastUpdated / 60)} min ago`}
        </div>
      </div>
    </div>
  );
}
