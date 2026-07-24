'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { DemoRunnerProvider, useDemoRunner } from '@/components/demo/DemoRunnerContext';
import { DemoControls } from '@/components/demo/DemoControls';
import { DemoTimeline } from '@/components/demo/DemoTimeline';
import { DemoPortalStatus } from '@/components/demo/DemoPortalStatus';
import { DEMO_STEP_DEFINITIONS, getPortalColor } from '@/lib/demo/demoConstants';

function DemoContent() {
  const { isRunning, isPaused, currentStep, progress, completedCount, totalSteps, startDemo } = useDemoRunner();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      void startDemo();
    }
  }, [startDemo]);

  return (
    <div className="demo-page min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-deep-teal/5 bg-white/95 backdrop-blur-xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-3xl"
            >
              🎬
            </motion.span>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl sm:text-3xl font-extrabold text-deep-teal"
              >
                School Day Demo
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-deep-teal/60"
              >
                Complete ecosystem simulation in under 5 minutes
              </motion.p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1 text-sage font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
              Live
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Real DB Actions
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left Panel - Timeline & Controls */}
          <div className="space-y-6">
            {/* Demo Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="demo-controls-section"
            >
              <DemoControls />
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="demo-timeline-section rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-display text-sm font-extrabold text-deep-teal">Demo Steps</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-sage/10 text-sage font-bold">
                    {DEMO_STEP_DEFINITIONS.length} Steps
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    ~3 min at 1x
                  </span>
                </div>
              </div>
              <DemoTimeline />
            </motion.div>
          </div>

          {/* Right Panel - Live Portal Status */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="demo-portal-section"
            >
              <DemoPortalStatus />
            </motion.div>

            {/* Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl"
            >
              <p className="font-display text-sm font-extrabold text-deep-teal mb-3">About This Demo</p>
              <div className="space-y-2 text-xs text-deep-teal/70">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage text-white text-[9px]">1</span>
                  <span>Gate scan triggers attendance & notifications</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage text-white text-[9px]">2</span>
                  <span>Bus boarding tracked with live GPS simulation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage text-white text-[9px]">3</span>
                  <span>Homework & coins awarded in real-time</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage text-white text-[9px]">4</span>
                  <span>Reward redeemed → QR → vendor scan → inventory</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage text-white text-[9px]">5</span>
                  <span>Home safe confirmation completes journey</span>
                </div>
              </div>
            </motion.div>

            {/* Speed reference */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl"
            >
              <p className="font-display text-sm font-extrabold text-deep-teal mb-3">Speed Reference</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-deep-teal/5 p-3 text-center">
                  <p className="font-extrabold text-deep-teal">0.5x</p>
                  <p className="text-deep-teal/60">Detailed viewing</p>
                </div>
                <div className="rounded-xl bg-sage/10 p-3 text-center">
                  <p className="font-extrabold text-sage">1x</p>
                  <p className="text-deep-teal/60">Normal speed</p>
                </div>
                <div className="rounded-xl bg-marigold/10 p-3 text-center">
                  <p className="font-extrabold text-marigold">2x</p>
                  <p className="text-deep-teal/60">Quick overview</p>
                </div>
                <div className="rounded-xl bg-warm-clay/10 p-3 text-center">
                  <p className="font-extrabold text-warm-clay">5x</p>
                  <p className="text-deep-teal/60">Rapid demo</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-deep-teal/5 bg-white/95 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-xs text-deep-teal/40">
          <p>ShikshaSetu School Day Demo — Real database actions, real-time portal updates</p>
        </div>
      </footer>
    </div>
  );
}

export default function DemoPage() {
  return (
    <DemoRunnerProvider>
      <DemoContent />
    </DemoRunnerProvider>
  );
}
