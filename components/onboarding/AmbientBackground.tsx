'use client';

import { memo, useMemo } from 'react';
import { m, useReducedMotion } from 'framer-motion';

type AmbientBackgroundProps = {
  className?: string;
};

function AmbientBackgroundComponent({ className = '' }: AmbientBackgroundProps) {
  const reduceMotion = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: reduceMotion ? 8 : 18 }, (_, index) => ({
        id: index,
        left: `${8 + ((index * 17) % 84)}%`,
        top: `${6 + ((index * 23) % 88)}%`,
        size: 2 + (index % 3),
        delay: (index % 7) * 0.35,
        duration: 6 + (index % 5),
      })),
    [reduceMotion],
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <m.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(107,144,128,0.18),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(232,163,61,0.12),transparent_45%)]"
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.55, 0.75, 0.55],
              }
        }
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-[0.14]" viewBox="0 0 800 600">
        {[0, 1, 2].map((line) => (
          <m.path
            key={line}
            d={`M ${80 + line * 120} 80 Q ${260 + line * 40} 180, ${420 + line * 30} 280 T ${720 - line * 20} 520`}
            fill="none"
            stroke="rgba(107,144,128,0.35)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={
              reduceMotion
                ? { pathLength: 1, opacity: 0.25 }
                : { pathLength: [0.2, 1, 0.35], opacity: [0.15, 0.35, 0.15] }
            }
            transition={{
              duration: 10 + line * 2,
              repeat: reduceMotion ? 0 : Infinity,
              ease: 'easeInOut',
              delay: line * 0.8,
            }}
          />
        ))}
      </svg>

      {particles.map((particle) => (
        <m.span
          key={particle.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={
            reduceMotion
              ? { opacity: 0.25 }
              : {
                  y: [0, -18, 0],
                  opacity: [0.15, 0.45, 0.15],
                }
          }
          transition={{
            duration: particle.duration,
            repeat: reduceMotion ? 0 : Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

export const AmbientBackground = memo(AmbientBackgroundComponent);
