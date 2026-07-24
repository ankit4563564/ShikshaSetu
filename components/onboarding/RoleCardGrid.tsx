'use client';

import { memo } from 'react';
import { LayoutGroup, m, useReducedMotion } from 'framer-motion';
import type { SchoolRoleOption } from './types';
import { SCHOOL_ROLES } from './constants';
import { RoleCard } from './RoleCard';
import { staggerContainerVariants } from './motion/variants';

type RoleCardGridProps = {
  onSelect: (role: SchoolRoleOption) => void;
  disabled?: boolean;
};

function RoleCardGridComponent({ onSelect, disabled }: RoleCardGridProps) {
  const reduceMotion = useReducedMotion();
  const heroRoles = SCHOOL_ROLES.filter((r) => r.isHero);
  const operationalRoles = SCHOOL_ROLES.filter((r) => !r.isHero);

  return (
    <LayoutGroup id="school-story-roles">
      <div className="space-y-6">
        {/* Primary Flagship Dual-Portal Section */}
        <div>
          <div className="mb-3.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-300 border border-amber-400/40 shadow-sm">
              ⭐ HERO PORTALS (PARENT & TEACHER)
            </span>
          </div>
          <m.div
            role="list"
            aria-label="Flagship experiences"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {heroRoles.map((role, index) => (
              <m.div key={role.id} role="listitem" layout={!reduceMotion}>
                <RoleCard
                  role={role}
                  index={index}
                  onSelect={onSelect}
                  disabled={disabled}
                />
              </m.div>
            ))}
          </m.div>
        </div>

        {/* Operational Control Modules Section */}
        <div className="pt-2">
          <div className="mb-3.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-300 border border-white/20 shadow-sm">
              ⚡ CONNECTED OPERATIONAL MODULES
            </span>
          </div>
          <m.div
            role="list"
            aria-label="Operational modules"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {operationalRoles.map((role, index) => (
              <m.div key={role.id} role="listitem" layout={!reduceMotion}>
                <RoleCard
                  role={role}
                  index={index + 2}
                  onSelect={onSelect}
                  disabled={disabled}
                />
              </m.div>
            ))}
          </m.div>
        </div>
      </div>
    </LayoutGroup>
  );
}

export const RoleCardGrid = memo(RoleCardGridComponent);
