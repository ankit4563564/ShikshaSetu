'use client';

import { motion } from 'framer-motion';
import { useDemoRunner } from './DemoRunnerContext';
import { DEMO_SPEEDS, type DemoSpeed } from '@/lib/demo/demoConstants';

export function DemoControls() {
  const { 
    isRunning, 
    isPaused, 
    speed, 
    setSpeed, 
    startDemo, 
    pauseDemo, 
    resumeDemo, 
    stopDemo, 
    restartDemo,
    currentStep,
    progress,
    completedCount,
    totalSteps 
  } = useDemoRunner();

  return (
    <div className="demo-controls rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl space-y-5">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm font-bold text-deep-teal/60">
          <span>{completedCount} / {totalSteps} steps completed</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <motion.div 
          className="h-3 rounded-full bg-deep-teal/10 overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-sage to-deep-teal"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </motion.div>
        {currentStep && (
          <p className="text-sm font-semibold text-deep-teal flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-deep-teal/10 text-deep-teal/60">
              Step {currentStep.id}
            </span>
            {currentStep.title}
          </p>
        )}
      </div>

      {/* Main Control Buttons */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <motion.button
            onClick={startDemo}
            className="flex-1 rounded-xl bg-sage px-5 py-4 text-sm font-bold text-white shadow-sm hover:bg-sage/90 active:scale-[0.98] transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ▶  Start School Day Demo
          </motion.button>
        ) : isPaused ? (
          <>
            <motion.button
              onClick={resumeDemo}
              className="flex-1 rounded-xl bg-sage px-5 py-4 text-sm font-bold text-white shadow-sm hover:bg-sage/90 active:scale-[0.98] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ▶  Resume
            </motion.button>
            <motion.button
              onClick={pauseDemo}
              className="rounded-xl border border-marigold/20 bg-marigold/10 px-5 py-4 text-sm font-bold text-marigold hover:bg-marigold/20 transition-all"
              whileTap={{ scale: 0.98 }}
            >
              ⏸  Pause
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              onClick={pauseDemo}
              className="flex-1 rounded-xl border border-marigold/20 bg-marigold/10 px-5 py-4 text-sm font-bold text-marigold hover:bg-marigold/20 transition-all"
              whileTap={{ scale: 0.98 }}
            >
              ⏸  Pause
            </motion.button>
            <motion.button
              onClick={stopDemo}
              className="rounded-xl border border-warm-clay/20 bg-warm-clay/10 px-5 py-4 text-sm font-bold text-warm-clay hover:bg-warm-clay/20 transition-all"
              whileTap={{ scale: 0.98 }}
            >
              ■  Stop
            </motion.button>
          </>
        )}
      </div>

      {isRunning && (
        <motion.button
          onClick={restartDemo}
          disabled={completedCount === 0 && !isPaused}
          className="w-full rounded-xl border border-deep-teal/20 px-5 py-3 text-sm font-bold text-deep-teal/60 hover:bg-deep-teal/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.98 }}
        >
          ↺  Restart Demo
        </motion.button>
      )}

      {/* Speed Selector */}
      <div className="pt-2 border-t border-deep-teal/5">
        <div className="flex items-center justify-between text-xs font-bold text-deep-teal/60 mb-2">
          <span>Playback Speed</span>
          <span className="text-sage">{DEMO_SPEEDS.find(s => s.value === speed)?.label || '1x'}</span>
        </div>
        <div className="flex gap-2">
          {DEMO_SPEEDS.map(s => (
            <motion.button
              key={s.value}
              onClick={() => setSpeed(s.value)}
              className={`flex-1 rounded-lg px-3 py-2.5 text-[10px] font-bold transition-all ${
                speed === s.value
                  ? 'bg-sage text-white shadow-sm'
                  : 'border border-deep-teal/10 text-deep-teal/60 hover:bg-deep-teal/5'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {s.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}