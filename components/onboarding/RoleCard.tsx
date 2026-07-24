'use client';

import { memo, useCallback, useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import type { SchoolRoleOption } from './types';
import { roleCardVariants, springSnappy } from './motion/variants';

type RoleCardProps = {
  role: SchoolRoleOption;
  index: number;
  onSelect: (role: SchoolRoleOption) => void;
  disabled?: boolean;
};

function RoleCardComponent({ role, index, onSelect, disabled }: RoleCardProps) {
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (reduceMotion) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      setTilt({ x: -y * 5, y: x * 5 });
    },
    [reduceMotion],
  );

  const resetTilt = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <m.button
      type="button"
      variants={roleCardVariants}
      custom={index}
      disabled={disabled}
      onClick={() => {
        // Navigate to sign-in with role parameter
        window.location.href = `/sign-in?role=${role.id}`;
      }}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      aria-label={`Experience as ${role.title}. ${role.description}`}
      style={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        transformPerspective: 900,
      }}
      className={`group relative flex h-full ${
        role.isHero ? 'min-h-[180px] border-marigold/40 bg-gradient-to-br from-white/15 to-deep-teal/40' : 'min-h-[150px] border-white/20 bg-white/[0.08]'
      } flex-col rounded-2xl border p-5 text-left text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:cursor-not-allowed disabled:opacity-60`}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -8,
              scale: 1.03,
              boxShadow: role.isHero
                ? '0 24px 60px rgba(232,163,61,0.35)'
                : '0 24px 60px rgba(107,144,128,0.28)',
            }
      }
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-sage/10 opacity-70"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.16) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
          animation: reduceMotion ? undefined : 'shimmer 2.8s linear infinite',
        }}
      />

      {role.badge && (
        <span
          className={`relative z-10 mb-2 self-start rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${
            role.isHero ? 'bg-marigold text-deep-teal' : 'bg-white/15 text-white/80 border border-white/10'
          }`}
        >
          {role.badge}
        </span>
      )}

      <span className="relative z-10 text-3xl">{role.emoji}</span>
      <span className="relative z-10 mt-2 font-display text-lg font-extrabold tracking-tight">
        {role.title}
      </span>
      <span className="relative z-10 mt-1.5 text-xs leading-relaxed text-white/80">
        {role.description}
      </span>
    </m.button>
  );
}

export const RoleCard = memo(RoleCardComponent);
