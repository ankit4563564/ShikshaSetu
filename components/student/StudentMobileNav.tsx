'use client';

import React from 'react';

export type StudentTab = 'Today' | 'Homework' | 'Revision' | 'Tests & Marks' | 'Timetable' | 'Ask a Doubt' | 'Worry Jar';

interface MobileNavProps {
  activeTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
  unreadCounts?: {
    homework?: number;
  };
}

const TAB_CONFIG: Array<{ id: StudentTab; icon: string; label: string }> = [
  { id: 'Today', icon: '⚡', label: 'Today' },
  { id: 'Homework', icon: '📋', label: 'Homework' },
  { id: 'Revision', icon: '📚', label: 'Revision' },
  { id: 'Tests & Marks', icon: '📊', label: 'Marks' },
  { id: 'Ask a Doubt', icon: '💡', label: 'Doubt' },
  { id: 'Worry Jar', icon: '🏺', label: 'Worry Jar' },
];

export default function StudentMobileNav({ activeTab, onTabChange, unreadCounts }: MobileNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5 safe-area-bottom">
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
              {tab.id === 'Homework' && unreadCounts?.homework && unreadCounts.homework > 0 ? (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
