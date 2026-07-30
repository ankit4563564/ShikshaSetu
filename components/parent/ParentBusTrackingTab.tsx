'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // Demo journey state
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [isJourneyComplete, setIsJourneyComplete] = useState(false);
  const [gateScanTime, setGateScanTime] = useState<string | null>(null);
  const [isGateScanVerified, setIsGateScanVerified] = useState(false);
  const animationRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  
  // Database metrics (fallback for demo)
  const [busMetrics, setBusMetrics] = useState<{ speed: number; nextStop: string; eta: number }>({ speed: 0, nextStop: 'Loading...', eta: 0 });
  const [hasArrived, setHasArrived] = useState(false);
  
  // Route coordinates for animation
  const routeStops = [
    { x: 50, y: 200, name: 'Sector 12' },
    { x: 150, y: 120, name: 'Rajouri Garden' },
    { x: 250, y: 80, name: 'Paschim Vihar' },
    { x: 350, y: 50, name: 'School Gate' },
  ];
  
  const JOURNEY_DURATION = 25000; // 25 seconds for demo
  
  // Calculate position along route based on progress (0-1)
  const getBusPosition = (progress: number) => {
    const totalSegments = routeStops.length - 1;
    const segmentProgress = progress * totalSegments;
    const currentSegment = Math.min(Math.floor(segmentProgress), totalSegments - 1);
    const t = segmentProgress - currentSegment;
    
    const start = routeStops[currentSegment];
    const end = routeStops[currentSegment + 1];
    
    // Quadratic bezier interpolation for smooth curves
    const controlX = (start.x + end.x) / 2;
    const controlY = (start.y + end.y) / 2 - 30;
    
    const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * controlX + t * t * end.x;
    const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * controlY + t * t * end.y;
    
    return { x, y };
  };
  
  // Get current stop based on progress
  const getCurrentStop = (progress: number) => {
    const totalSegments = routeStops.length - 1;
    const segmentProgress = progress * totalSegments;
    const currentSegment = Math.min(Math.floor(segmentProgress), totalSegments - 1);
    
    if (progress >= 1) return { name: 'School Gate', eta: 0 };
    if (currentSegment >= routeStops.length - 1) return { name: 'School Gate', eta: 0 };
    
    const remainingSegments = totalSegments - currentSegment;
    const eta = Math.ceil(remainingSegments * (1 - (segmentProgress - currentSegment)));
    return { name: routeStops[currentSegment + 1].name, eta };
  };

  // Demo journey animation
  useEffect(() => {
    if (hasStartedRef.current || isJourneyComplete) return;
    hasStartedRef.current = true;
    
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / JOURNEY_DURATION, 1);
      
      setJourneyProgress(progress);
      
      // Update ETA and next stop based on progress
      const currentStop = getCurrentStop(progress);
      setBusMetrics({
        speed: progress < 1 ? 25 : 0,
        nextStop: currentStop.name,
        eta: currentStop.eta,
      });
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsJourneyComplete(true);
        setHasArrived(true);
        
        // Trigger gate scan after arrival
        setTimeout(() => {
          setGateScanTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          setIsGateScanVerified(true);
        }, 1500);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isJourneyComplete]);
  
  // Replay journey
  const handleReplay = () => {
    setJourneyProgress(0);
    setIsJourneyComplete(false);
    setHasArrived(false);
    setGateScanTime(null);
    setIsGateScanVerified(false);
    hasStartedRef.current = false;
  };
  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deep-teal/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-black text-deep-teal">Aarav's School Journey</h3>
            </div>
            <p className="font-body text-xs text-deep-teal/60 font-semibold mt-0.5">
              Follow the important moments of Aarav's trip to school.
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
              Aarav's School Journey
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-sage/15 text-sage font-extrabold text-[10px] uppercase tracking-wider border border-sage/30">
              🛡️ Safety Updates
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[10px] uppercase tracking-wider border border-amber-200">
              Demo Route
            </span>
          </div>
          <p className="font-body text-xs text-deep-teal/60 font-semibold mt-0.5">
            Follow the important moments of Aarav's trip to school.
          </p>
        </div>
      </div>

      {/* Current Status Card - WHERE IS MY CHILD? IS EVERYTHING OK? */}
      <div className="rounded-3xl bg-gradient-to-br from-sage/15 via-white to-primary/5 border border-sage/30 p-5 shadow-md backdrop-blur-xl">
        {isGateScanVerified ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
              <span className="text-lg">✓</span>
            </div>
            <div className="flex-1">
              <h4 className="font-display text-base font-black text-deep-teal">Aarav is safely at school</h4>
              <p className="text-xs font-semibold text-deep-teal/70 mt-0.5">Arrival and gate entry confirmed · {gateScanTime}</p>
            </div>
          </div>
        ) : hasArrived ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
              <span className="text-lg">✓</span>
            </div>
            <div className="flex-1">
              <h4 className="font-display text-base font-black text-deep-teal">Bus arrived at School</h4>
              <p className="text-xs font-semibold text-deep-teal/70 mt-0.5">Gate scan verifying...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-800 shrink-0 shadow-2xs">
              <span className="text-lg">🚌</span>
            </div>
            <div className="flex-1">
              <h4 className="font-display text-base font-black text-deep-teal">Aarav is on the way to school</h4>
              <p className="text-xs font-semibold text-deep-teal/70 mt-0.5">Bus #04 · ETA {busMetrics.eta} min · Destination: School Gate</p>
            </div>
          </div>
        )}
      </div>

      {/* Bus metrics footer */}
      <div className="journey-map rounded-2xl border border-deep-teal/10 bg-paper p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2">
          <span className="font-display text-xs font-bold text-deep-teal/40 uppercase tracking-widest">
            School Bus Journey
          </span>
          <span className="text-[10px] text-sage font-extrabold uppercase bg-sage/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" /> {isJourneyComplete ? 'Arrived' : 'Route Active'}
          </span>
        </div>

        {/* Compact bus route visualization */}
        <div className="h-[180px] w-full rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-deep-teal/5 relative overflow-hidden">
          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Route path - completed portion */}
            <path d="M 50 200 Q 100 150 150 120 T 250 80 T 350 50" 
                  fill="none" 
                  stroke="#0F766E" 
                  strokeWidth="3" 
                  strokeDasharray="8,4"
                  strokeLinecap="round"
                  opacity="0.3"/>
            
            {/* Route path - completed portion (solid) */}
            <path 
                  d={`M 50 200 Q 100 150 150 120 T 250 80 T 350 50`}
                  fill="none"
                  stroke="#0F766E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${journeyProgress * 800}, 800`}
                  opacity="0.8"/>
            
            {/* Stop markers */}
            {routeStops.map((stop, index) => {
              const isCompleted = journeyProgress > (index / (routeStops.length - 1));
              const isCurrent = Math.abs(journeyProgress - (index / (routeStops.length - 1))) < 0.1;
              return (
                <circle 
                  key={index}
                  cx={stop.x} 
                  cy={stop.y} 
                  r={isCurrent ? 8 : 6} 
                  fill={isCompleted ? "#10B981" : "#0F766E"}
                  opacity={isCompleted ? 1 : 0.6}
                />
              );
            })}
            
            {/* Animated bus icon */}
            <AnimatePresence>
              {!hasArrived && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transform={`translate(${getBusPosition(journeyProgress).x}, ${getBusPosition(journeyProgress).y})`}
                >
                  <rect x="-12" y="-8" width="24" height="16" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5"/>
                  <circle cx="-6" cy="8" r="3" fill="#1F2937"/>
                  <circle cx="6" cy="8" r="3" fill="#1F2937"/>
                  <rect x="-8" y="-4" width="16" height="6" rx="1" fill="#FEF3C7"/>
                </motion.g>
              )}
            </AnimatePresence>
            
            {/* Stop labels */}
            <text x="50" y="220" fontSize="10" fill="#64748B" textAnchor="middle">Sector 12</text>
            <text x="150" y="140" fontSize="10" fill="#64748B" textAnchor="middle">Rajouri Garden</text>
            <text x="250" y="100" fontSize="10" fill="#64748B" textAnchor="middle">Paschim Vihar</text>
            <text x="350" y="70" fontSize="10" fill="#64748B" textAnchor="middle">School Gate</text>
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
            <span className="font-body text-xs font-bold text-deep-teal/80">{hasArrived ? 'Arrived' : busMetrics.nextStop}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] text-deep-teal/40 uppercase tracking-wider block font-bold">ETA</span>
            <span className="font-body text-xs font-bold text-deep-teal/80">{hasArrived ? 'Arrived' : `${busMetrics.eta} min`}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] text-deep-teal/40 uppercase tracking-wider block font-bold">Speed</span>
            <span className="font-body text-xs font-bold text-deep-teal/80">{hasArrived ? '0' : busMetrics.speed} km/h</span>
          </div>
        </div>
        
        {/* Replay control - only show after completion */}
        {isJourneyComplete && (
          <div className="pt-2 text-center">
            <button
              onClick={handleReplay}
              className="text-xs font-semibold text-deep-teal/60 hover:text-deep-teal underline decoration-dotted underline-offset-2 transition-colors"
            >
              Replay Journey
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
