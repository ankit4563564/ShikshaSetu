'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'Today' | 'Homework' | 'Exams' | 'Achievements' | 'Missions' | 'Wellbeing';

interface MobileNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  unreadCounts?: {
    homework?: number;
    achievements?: number;
    missions?: number;
  };
}

const TAB_CONFIG: Record<Tab, { icon: string; label: string; color: string }> = {
  Today: { icon: '⌂', label: 'Today', color: 'text-primary' },
  Homework: { icon: '📋', label: 'Work', color: 'text-marigold' },
  Exams: { icon: '📝', label: 'Exams', color: 'text-warm-clay' },
  Achievements: { icon: '🏆', label: 'Awards', color: 'text-sage' },
  Missions: { icon: '✦', label: 'Quests', color: 'text-primary' },
  Wellbeing: { icon: '◌', label: 'Mind', color: 'text-sage' },
};

export default function StudentMobileNav({ activeTab, onTabChange, unreadCounts }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab: Tab) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/60 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          {/* Today */}
          <button
            type="button"
            onClick={() => handleTabClick('Today')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'Today'
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:text-primary hover:bg-primary/5'
            }`}
            aria-label="Today"
            aria-current={activeTab === 'Today' ? 'page' : undefined}
          >
            <span className="text-xl" aria-hidden="true">
              {TAB_CONFIG.Today.icon}
            </span>
            <span className="text-[10px] font-bold">{TAB_CONFIG.Today.label}</span>
          </button>

          {/* Homework */}
          <button
            type="button"
            onClick={() => handleTabClick('Homework')}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'Homework'
                ? 'bg-marigold/10 text-marigold'
                : 'text-muted hover:text-marigold hover:bg-marigold/5'
            }`}
            aria-label={`Homework${unreadCounts?.homework ? ` (${unreadCounts.homework} pending)` : ''}`}
            aria-current={activeTab === 'Homework' ? 'page' : undefined}
          >
            {unreadCounts?.homework && unreadCounts.homework > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-warm-clay text-[9px] font-extrabold text-white">
                {unreadCounts.homework > 9 ? '9+' : unreadCounts.homework}
              </span>
            )}
            <span className="text-xl" aria-hidden="true">
              {TAB_CONFIG.Homework.icon}
            </span>
            <span className="text-[10px] font-bold">{TAB_CONFIG.Homework.label}</span>
          </button>

          {/* Missions (Quest Board) */}
          <button
            type="button"
            onClick={() => handleTabClick('Missions')}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'Missions'
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:text-primary hover:bg-primary/5'
            }`}
            aria-label="Missions"
            aria-current={activeTab === 'Missions' ? 'page' : undefined}
          >
            <span className="text-xl" aria-hidden="true">
              {TAB_CONFIG.Missions.icon}
            </span>
            <span className="text-[10px] font-bold">{TAB_CONFIG.Missions.label}</span>
          </button>

          {/* More Menu */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isMenuOpen
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:text-primary hover:bg-primary/5'
            }`}
            aria-label="More options"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-more-menu"
          >
            <span className="text-xl" aria-hidden="true">
              ⋮
            </span>
            <span className="text-[10px] font-bold">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Menu Panel */}
            <motion.div
              id="mobile-more-menu"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-16 left-0 right-0 z-50 mx-4 mb-2 rounded-2xl border border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur-xl lg:hidden"
              role="menu"
              aria-label="Additional navigation options"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-extrabold text-ink">More</h3>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-primary/5 hover:text-primary"
                  aria-label="Close menu"
                >
                  <span className="text-lg" aria-hidden="true">
                    ×
                  </span>
                </button>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleTabClick('Exams')}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                    activeTab === 'Exams'
                      ? 'bg-warm-clay/10 text-warm-clay'
                      : 'text-muted hover:bg-primary/5 hover:text-primary'
                  }`}
                  role="menuitem"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {TAB_CONFIG.Exams.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{TAB_CONFIG.Exams.label}</div>
                    <div className="text-xs text-muted">Upcoming tests & marks</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('Achievements')}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                    activeTab === 'Achievements'
                      ? 'bg-sage/10 text-sage'
                      : 'text-muted hover:bg-primary/5 hover:text-primary'
                  }`}
                  role="menuitem"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {TAB_CONFIG.Achievements.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{TAB_CONFIG.Achievements.label}</div>
                    <div className="text-xs text-muted">Badges & rewards</div>
                  </div>
                  {unreadCounts?.achievements && unreadCounts.achievements > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage text-xs font-bold text-white">
                      {unreadCounts.achievements}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('Wellbeing')}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                    activeTab === 'Wellbeing'
                      ? 'bg-sage/10 text-sage'
                      : 'text-muted hover:bg-primary/5 hover:text-primary'
                  }`}
                  role="menuitem"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {TAB_CONFIG.Wellbeing.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{TAB_CONFIG.Wellbeing.label}</div>
                    <div className="text-xs text-muted">School Mitra & Worry Jar</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed bottom nav - Mobile Only */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </>
  );
}
