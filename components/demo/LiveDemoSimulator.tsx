'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDemoRunner } from './DemoRunnerContext';

export function LiveDemoSimulator() {
  const { currentStepIndex, currentStep, isRunning, isPaused } = useDemoRunner();

  // Active step info fallback
  const stepId = currentStep?.id || 1;
  const portal = currentStep?.portal || 'gate';

  return (
    <div className="rounded-3xl border border-deep-teal/15 bg-slate-900 text-white p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-between">
      {/* Top Simulator Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 rounded-full bg-red-500" />
          <span className="flex h-3 w-3 rounded-full bg-yellow-500" />
          <span className="flex h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2 font-mono text-xs text-slate-400">
            https://shikshasetu.app/{portal}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
            {portal.toUpperCase()} SIMULATOR
          </span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE STAGE
          </span>
        </div>
      </div>

      {/* Main Visual Stage Display */}
      <div className="my-6 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        <AnimatePresence mode="wait">
          {stepId === 1 || stepId === 2 ? (
            /* Gate QR Scan Simulator */
            <motion.div
              key="gate-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4 max-w-sm w-full bg-slate-800/80 border border-teal-500/40 rounded-2xl p-6 shadow-xl"
            >
              <div className="text-5xl animate-bounce">🛡️</div>
              <h3 className="font-display text-xl font-black text-teal-300">Gate #2 Kiosk Scan</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-teal-500/30 font-mono text-xs text-teal-400 space-y-1 text-left">
                <p>➔ Student: Aarav Sharma (Class 8-A)</p>
                <p>➔ Token: QR-TOKEN-8A-90123</p>
                <p className="text-emerald-400 font-bold">✓ SCAN SUCCESS (8:09 AM)</p>
              </div>
              <p className="text-xs text-slate-300">Face & QR token verified. Gate pass marked ACTIVE.</p>
            </motion.div>
          ) : stepId === 3 || stepId === 4 ? (
            /* Teacher Attendance Roster Simulator */
            <motion.div
              key="teacher-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4 max-w-sm w-full bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-6 shadow-xl"
            >
              <div className="text-5xl">💻</div>
              <h3 className="font-display text-xl font-black text-emerald-300">Teacher Classroom Radar</h3>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 text-xs text-left space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-white">Class 8-A Roster</span>
                  <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">96% PRESENT</span>
                </div>
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <span>👦 Aarav Sharma</span>
                  <span className="text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded text-[10px]">✓ PRESENT (Auto-Gate)</span>
                </div>
              </div>
              <p className="text-xs text-slate-300">Ms. Ananya Mehra&apos;s roster updated automatically.</p>
            </motion.div>
          ) : stepId === 5 || stepId === 7 ? (
            /* Parent Mobile Push Notification Simulator */
            <motion.div
              key="parent-stage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 max-w-sm w-full bg-gradient-to-br from-slate-800 to-amber-950/40 border border-amber-400/50 rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-5xl animate-pulse">📱</div>
              <h3 className="font-display text-xl font-black text-amber-300">Parent Mobile Alert</h3>
              <div className="bg-amber-400 text-slate-950 p-4 rounded-xl text-left shadow-lg space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-800">SHIKSHASETU PUSH ALERT</p>
                <p className="text-xs font-bold">Aarav Sharma has arrived safely at school!</p>
                <p className="text-[11px] font-medium text-slate-900">Gate #2 entry logged at 8:09 AM with 100% safety match.</p>
              </div>
              <p className="text-xs text-slate-300">Rohit Sharma&apos;s phone notified instantly.</p>
            </motion.div>
          ) : stepId === 6 || stepId === 14 || stepId === 15 ? (
            /* Bus Telemetry Simulator */
            <motion.div
              key="bus-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4 max-w-sm w-full bg-slate-800/80 border border-orange-500/40 rounded-2xl p-6 shadow-xl"
            >
              <div className="text-5xl animate-bounce">🚌</div>
              <h3 className="font-display text-xl font-black text-orange-300">Bus #4 Live Telemetry</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-orange-500/30 text-xs text-left space-y-1.5 font-mono text-orange-200">
                <p>📍 Location: Green Park Stop (2.4 km)</p>
                <p>⏱️ Status: En Route (34 km/h)</p>
                <p className="text-emerald-400 font-bold">✓ Aarav Sharma Boarded & Deboarded Safe</p>
              </div>
              <p className="text-xs text-slate-300">Driver Ramesh Kumar & Parent journey sync active.</p>
            </motion.div>
          ) : stepId === 8 || stepId === 9 || stepId === 10 ? (
            /* Student Coins & Reward Simulator */
            <motion.div
              key="coins-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4 max-w-sm w-full bg-slate-800/80 border border-blue-500/40 rounded-2xl p-6 shadow-xl"
            >
              <div className="text-5xl">🪙</div>
              <h3 className="font-display text-xl font-black text-blue-300">Campus Coin Rewards</h3>
              <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-400/40 text-xs text-left space-y-1 text-blue-100">
                <p className="font-bold text-amber-300 text-sm">+25 Campus Coins Awarded!</p>
                <p className="text-[11px]">Reason: Class Participation in Math Quiz</p>
                <p className="text-emerald-300 font-bold text-xs">New Balance: 175 Coins</p>
              </div>
              <p className="text-xs text-slate-300">Aarav generated a QR token for Canteen Free Meal reward.</p>
            </motion.div>
          ) : (
            /* Vendor Canteen POS Simulator */
            <motion.div
              key="vendor-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4 max-w-sm w-full bg-slate-800/80 border border-purple-500/40 rounded-2xl p-6 shadow-xl"
            >
              <div className="text-5xl">🛒</div>
              <h3 className="font-display text-xl font-black text-purple-300">Canteen Vendor POS</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 text-xs text-left space-y-1 font-mono text-purple-200">
                <p>🛒 Item: Healthy Snack Pack</p>
                <p>🎟️ Token: QR-MEAL-COIN-4491</p>
                <p className="text-emerald-400 font-bold">✓ REDEEMED & STOCK UPDATED</p>
              </div>
              <p className="text-xs text-slate-300">Vendor stock decremented & Mission Control analytics refreshed.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Simulator Footer CTA */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">
          Step {stepId} of 15: <span className="text-white font-bold">{currentStep?.title || 'Gate Entry'}</span>
        </span>
        <a
          href={
            portal === 'parent' ? '/parent' :
            portal === 'teacher' ? '/teacher' :
            portal === 'admin' ? '/admin' :
            portal === 'student' ? '/student' :
            portal === 'driver' ? '/driver' :
            portal === 'gate' ? '/gate' :
            '/vendor'
          }
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5"
        >
          <span>Open Full {portal.toUpperCase()} Dashboard</span>
          <span>➔</span>
        </a>
      </div>
    </div>
  );
}
