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
        window.location.href = `/login`;
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
        role.isHero
          ? 'min-h-[190px] border-2 border-amber-400/60 bg-gradient-to-br from-slate-900/95 via-[#14323c] to-[#0c1f26] shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
          : 'min-h-[155px] border border-white/30 bg-slate-900/85 hover:border-emerald-400/60 shadow-[0_12px_35px_rgba(0,0,0,0.4)]'
      } flex-col rounded-2xl p-5 text-left text-white backdrop-blur-2xl transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-60`}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -6,
              scale: 1.025,
              boxShadow: role.isHero
                ? '0 25px 65px rgba(245,158,11,0.45)'
                : '0 20px 55px rgba(52,211,153,0.35)',
            }
      }
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 via-transparent to-amber-500/10 opacity-80"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
          animation: reduceMotion ? undefined : 'shimmer 2.8s linear infinite',
        }}
      />

      {role.badge && (
        <span
          className={`relative z-10 mb-2 self-start rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${
            role.isHero
              ? 'bg-amber-400 text-slate-950 shadow-sm border border-amber-300'
              : 'bg-white/20 text-emerald-300 border border-emerald-400/40'
          }`}
        >
          {role.badge}
        </span>
      )}

      <span className="relative z-10 text-3xl drop-shadow-md">{role.emoji}</span>
      <span className="relative z-10 mt-2 font-display text-lg font-black tracking-tight text-white drop-shadow-sm">
        {role.title}
      </span>
      <span className="relative z-10 mt-1.5 text-xs font-medium leading-relaxed text-slate-200">
        {role.description}
      </span>
      <span className="relative z-10 mt-auto pt-3 font-display text-[11px] font-extrabold uppercase tracking-wider text-amber-300 group-hover:text-amber-200 flex items-center gap-1">
        <span>Access Portal</span>
        <span className="transition-transform group-hover:translate-x-1">➔</span>
      </span>
    </m.button>
  );
}

export const RoleCard = memo(RoleCardComponent);
