'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'Today' | 'Academics' | 'Revision Notes' | 'Homework' | 'Missions' | 'Wellbeing';

interface MobileNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  unreadCounts?: {
    homework?: number;
  };
}

const TAB_CONFIG: Record<Tab, { icon: string; label: string }> = {
  Today: { icon: '⌂', label: 'Today' },
  Academics: { icon: '📊', label: 'Marks' },
  'Revision Notes': { icon: '📚', label: 'Revise' },
  Homework: { icon: '📋', label: 'Work' },
  Missions: { icon: '✦', label: 'Quests' },
  Wellbeing: { icon: '✨', label: 'Help' },
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
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'Today'
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:text-primary hover:bg-primary/5'
            }`}
            aria-label="Today"
            aria-current={activeTab === 'Today' ? 'page' : undefined}
          >
            <span className="text-xl" aria-hidden="true">{TAB_CONFIG.Today.icon}</span>
            <span className="text-[10px] font-bold">{TAB_CONFIG.Today.label}</span>
          </button>

          {/* Homework */}
          <button
            type="button"
            onClick={() => handleTabClick('Homework')}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'Homework'
                ? 'bg-amber-50 text-amber-700'
                : 'text-muted hover:text-amber-700 hover:bg-amber-50/50'
            }`}
            aria-label={`Homework${unreadCounts?.homework ? ` (${unreadCounts.homework} pending)` : ''}`}
            aria-current={activeTab === 'Homework' ? 'page' : undefined}
          >
            {unreadCounts?.homework && unreadCounts.homework > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-warm-clay text-[9px] font-extrabold text-white">
                {unreadCounts.homework > 9 ? '9+' : unreadCounts.homework}
              </span>
            )}
            <span className="text-xl" aria-hidden="true">{TAB_CONFIG.Homework.icon}</span>
            <span className="text-[10px] font-bold">{TAB_CONFIG.Homework.label}</span>
          </button>

          {/* Wellbeing / AI Help */}
          <button
            type="button"
            onClick={() => handleTabClick('Wellbeing')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'Wellbeing'
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:text-primary hover:bg-primary/5'
            }`}
            aria-label="Study Help"
            aria-current={activeTab === 'Wellbeing' ? 'page' : undefined}
          >
            <span className="text-xl" aria-hidden="true">{TAB_CONFIG.Wellbeing.icon}</span>
            <span className="text-[10px] font-bold">{TAB_CONFIG.Wellbeing.label}</span>
          </button>

          {/* More Menu */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              isMenuOpen
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:text-primary hover:bg-primary/5'
            }`}
            aria-label="More options"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-more-menu"
          >
            <span className="text-xl" aria-hidden="true">⋮</span>
            <span className="text-[10px] font-bold">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

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
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-primary/5 hover:text-primary cursor-pointer"
                  aria-label="Close menu"
                >
                  <span className="text-lg" aria-hidden="true">×</span>
                </button>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleTabClick('Academics')}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
                    activeTab === 'Academics'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:bg-primary/5 hover:text-primary'
                  }`}
                  role="menuitem"
                >
                  <span className="text-2xl" aria-hidden="true">{TAB_CONFIG.Academics.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">Academics</div>
                    <div className="text-xs text-muted">Marks, performance & AI insights</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('Revision Notes')}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
                    activeTab === 'Revision Notes'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:bg-primary/5 hover:text-primary'
                  }`}
                  role="menuitem"
                >
                  <span className="text-2xl" aria-hidden="true">{TAB_CONFIG['Revision Notes'].icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">Revision Notes</div>
                    <div className="text-xs text-muted">AI summary notes &amp; quick quizzes</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('Missions')}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
                    activeTab === 'Missions'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:bg-primary/5 hover:text-primary'
                  }`}
                  role="menuitem"
                >
                  <span className="text-2xl" aria-hidden="true">{TAB_CONFIG.Missions.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">Quests & Rewards</div>
                    <div className="text-xs text-muted">Learning missions</div>
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
