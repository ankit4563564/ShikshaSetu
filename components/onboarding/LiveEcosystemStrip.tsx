'use client';

import { memo } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { ECOSYSTEM_CHIPS } from './constants';

function LiveEcosystemStripComponent() {
  const reduceMotion = useReducedMotion();
  const chips = [...ECOSYSTEM_CHIPS, ...ECOSYSTEM_CHIPS];

  return (
    <div
      aria-label="Live school ecosystem capabilities"
      className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] py-3 backdrop-blur-md"
    >
      <m.div
        className="flex w-max gap-3 px-4"
        animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {chips.map((chip, index) => (
          <span
            key={`${chip}-${index}`}
            className="inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          >
            {chip}
          </span>
        ))}
      </m.div>
    </div>
  );
}

export const LiveEcosystemStrip = memo(LiveEcosystemStripComponent);
