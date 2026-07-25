'use client';

import { memo } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { JOURNEY_TIMELINE, TIMELINE_DURATION_MS } from './constants';
import { timelineStepVariants } from './motion/variants';

type JourneyTimelineProps = {
  onComplete: () => void;
};

function JourneyTimelineComponent({ onComplete }: JourneyTimelineProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className="mx-auto flex max-w-sm flex-col items-center px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      onAnimationComplete={() => {
        window.setTimeout(
          onComplete,
          reduceMotion ? 200 : TIMELINE_DURATION_MS,
        );
      }}
    >
      <m.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-extrabold tracking-tight text-white"
      >
        Preparing your journey...
      </m.p>

      <div className="relative mt-10 flex flex-col items-center">
        {JOURNEY_TIMELINE.map((step, index) => (
          <div key={step.id} className="relative flex flex-col items-center">
            <m.div
              custom={index}
              variants={timelineStepVariants}
              initial="hidden"
              animate="visible"
              className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-2.5 backdrop-blur-md"
            >
              <span className="text-xl" aria-hidden>
                {step.emoji}
              </span>
              <span className="text-sm font-semibold text-white/90">{step.label}</span>
            </m.div>

            {index < JOURNEY_TIMELINE.length - 1 && (
              <div className="relative flex h-10 w-px items-center justify-center">
                <span className="absolute inset-y-0 w-px bg-white/15" aria-hidden />
                <m.span
                  aria-hidden
                  className="absolute top-0 w-px origin-top bg-gradient-to-b from-sage via-marigold/80 to-sage"
                  initial={{ scaleY: 0, opacity: 0.4 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{
                    duration: reduceMotion ? 0.01 : 0.9,
                    delay: reduceMotion ? 0 : index * 0.45 + 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ height: '100%' }}
                />
                <m.span
                  aria-hidden
                  className="absolute h-2 w-2 rounded-full bg-marigold/90 shadow-[0_0_12px_rgba(232,163,61,0.65)]"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: [0, 1, 0], y: [0, 18, 36] }}
                  transition={{
                    duration: reduceMotion ? 0.01 : 1.8,
                    delay: reduceMotion ? 0 : index * 0.45 + 0.25,
                    repeat: reduceMotion ? 0 : 1,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </m.div>
  );
}

export const JourneyTimeline = memo(JourneyTimelineComponent);
