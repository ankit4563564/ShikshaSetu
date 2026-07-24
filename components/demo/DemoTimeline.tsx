'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDemoRunner } from './DemoRunnerContext';
import { DEMO_STEP_DEFINITIONS, getPortalColor } from '@/lib/demo/demoConstants';

export function DemoTimeline() {
  const { stepStatuses, currentStepIndex, isRunning, isPaused, totalSteps } = useDemoRunner();

  return (
    <div className="demo-timeline relative pl-8 space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {/* Connector line with progress */}
      <motion.div
        className="absolute left-3 top-0 bottom-0 w-1 bg-deep-teal/10"
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      
      {/* Progress fill on connector */}
      <motion.div
        className="absolute left-3 top-0 w-1 bg-gradient-to-b from-sage to-marigold"
        initial={{ height: 0 }}
        animate={{ height: `${(stepStatuses.filter(s => s.status === 'completed').length / totalSteps) * 100}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      <AnimatePresence mode="popLayout">
        {DEMO_STEP_DEFINITIONS.map((step, index) => (
          <DemoStepCard 
            key={step.id} 
            step={step} 
            index={index} 
            status={stepStatuses[index]}
            isCurrent={index === currentStepIndex && (isRunning || isPaused)}
            isPaused={isPaused}
          />
        ))}
      </AnimatePresence>

      {/* Step connectors with dots */}
      {DEMO_STEP_DEFINITIONS.map((step, index) => (
        <motion.div
          key={`dot-${step.id}`}
          className="absolute left-3 w-2 h-2 -translate-x-1/2 rounded-full border-2 border-white"
          style={{ top: `${index * 72 + 36}px` }}
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            backgroundColor: index < currentStepIndex ? 'hsl(var(--color-sage))' : 
                             index === currentStepIndex && (isRunning || isPaused) ? 'hsl(var(--color-marigold))' : 
                             'transparent',
            borderColor: index < currentStepIndex ? 'hsl(var(--color-sage))' : 
                         index === currentStepIndex && (isRunning || isPaused) ? 'hsl(var(--color-marigold))' : 
                         'hsl(var(--color-deep-teal)/0.2)'
          }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        />
      ))}
    </div>
  );
}

function DemoStepCard({ step, index, status, isCurrent, isPaused }: { 
  step: typeof DEMO_STEP_DEFINITIONS[0]; 
  index: number; 
  status: { status: string; error?: string; completedAt?: string; startedAt?: number; result?: any };
  isCurrent: boolean;
  isPaused: boolean;
}) {
  const isCompleted = status?.status === 'completed';
  const isFailed = status?.status === 'failed';
  const isRunning = status?.status === 'running';

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isCurrent 
          ? 'border-marigold/30 bg-marigold/5 shadow-[0_0_0_2px_rgba(217,119,6,0.15)]' 
          : isCompleted 
            ? 'border-sage/30 bg-sage/5' 
            : isFailed 
              ? 'border-warm-clay/30 bg-warm-clay/5' 
              : 'border-white/80 bg-white/70'
      } backdrop-blur-xl group`}
    >
      {/* Status indicator */}
      <div className="absolute -top-2 -right-2">
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            isCompleted ? 'bg-sage text-white' :
            isFailed ? 'bg-warm-clay text-white' :
            isRunning ? 'bg-marigold text-white' :
            'bg-deep-teal/10 text-deep-teal/40'
          }`}
        >
          {isFailed ? '✕' : isCompleted ? '✓' : isRunning ? '⟳' : step.icon}
        </motion.span>
      </div>

      {/* Portal badge */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
          getPortalColor(step.portal).includes('sage') ? 'bg-sage/10 text-sage' :
          getPortalColor(step.portal).includes('primary') ? 'bg-primary/10 text-primary' :
          getPortalColor(step.portal).includes('marigold') ? 'bg-marigold/10 text-marigold' :
          getPortalColor(step.portal).includes('deep-teal') ? 'bg-deep-teal/10 text-deep-teal' :
          getPortalColor(step.portal).includes('warm-clay') ? 'bg-warm-clay/10 text-warm-clay' :
          'bg-deep-teal/10 text-deep-teal/60'
        }`}
      >
        {step.portal === 'all' ? '⚡' : step.icon} {step.portal}
      </motion.div>

      {/* Step content */}
      <div className="mt-2 space-y-2">
        <motion.h4
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-sm font-extrabold text-deep-teal"
        >
          Step {step.id}: {step.title}
        </motion.h4>
        
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[11px] leading-relaxed text-deep-teal/70"
        >
          {step.description}
        </motion.p>

        {/* Running animation */}
        {isRunning && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
            className="h-1 rounded-full bg-marigold/30 overflow-hidden"
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
              className="h-full w-1/4 bg-marigold rounded-full"
            />
          </motion.div>
        )}

        {/* Error display */}
        {isFailed && status?.error && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-medium text-warm-clay flex items-center gap-1"
          >
            <span>⚠</span> {status.error}
          </motion.p>
        )}

        {/* Completion timestamp */}
        {isCompleted && status?.completedAt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[9px] text-deep-teal/40 font-mono"
          >
            Completed at {new Date(status.completedAt).toLocaleTimeString()}
          </motion.p>
        )}

        {/* Duration info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-[9px] text-deep-teal/40"
        >
          <span>⏱ ~{Math.round(step.estimatedDuration / 1000)}s</span>
          {status?.startedAt && !isCompleted && <span className="text-sage">▸ Running...</span>}
          {isCompleted && status?.startedAt && status?.completedAt && (
            <span className="text-sage">
              ✓ Done in {Math.round((Number(status.completedAt) - status.startedAt) / 1000)}s
            </span>
          )}
        </motion.div>
      </div>

      {/* Pulse ring for current running step */}
      {isCurrent && isRunning && !isPaused && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-marigold/30 pointer-events-none"
          animate={{ boxShadow: ['0 0 0 0 rgba(217,119,6,0.4)', '0 0 0 8px rgba(217,119,6,0)'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}