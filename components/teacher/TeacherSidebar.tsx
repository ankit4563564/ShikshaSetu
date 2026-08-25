'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface TeacherSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSpotlight: () => void;
  teacherName?: string;
}

const navItems = [
  { id: 'today', label: 'Today', icon: '🏠' },
  { id: 'students', label: 'Students', icon: '👨‍🎓' },
  { id: 'classes', label: 'Classes', icon: '📚' },
  { id: 'assignments', label: 'Assignments', icon: '📝' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'parents', label: 'Parents', icon: '💬' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function TeacherSidebar({
  activeTab,
  onTabChange,
  onOpenSpotlight,
  teacherName,
}: TeacherSidebarProps) {
  const displayName = teacherName || 'Teacher';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'T';

  return (
    <aside className="w-64 bg-white/85 border-r border-slate-200/80 flex flex-col justify-between p-5 shrink-0 hidden md:flex min-h-screen shadow-[4px_0_24px_rgba(15,23,42,0.02)] backdrop-blur-2xl">
      <div className="space-y-6">
        {/* Logo Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 flex items-center justify-center font-display font-black text-white text-base shadow-md shadow-slate-900/20">
            S
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 text-base tracking-tight leading-none">ShikshaSetu</h3>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Teacher Copilot</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-display text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md shadow-slate-900/25'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Footer */}
      <div className="space-y-3.5 pt-4 border-t border-slate-200/80">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSpotlight}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all text-xs font-extrabold cursor-pointer shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <span>🔍</span>
            <span>AI Spotlight</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200/80 font-mono text-[10px] font-black text-slate-500 shadow-2xs">
            ⌘K
          </span>
        </motion.button>

        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs font-black flex items-center justify-center shadow-md shadow-indigo-500/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-xs font-black text-slate-900 truncate">{displayName}</h4>
            <p className="text-[10px] text-slate-500 truncate font-semibold">Faculty / Class Teacher</p>
          </div>
        </div>

        <SignOutButton className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-700 font-display text-xs font-bold transition-all border border-rose-200/60 cursor-pointer shadow-sm">
          <span className="flex items-center gap-2">
            <span>🚪</span>
            <span>Sign Out</span>
          </span>
          <span className="text-[10px] text-rose-500 font-mono">→</span>
        </SignOutButton>
      </div>
    </aside>
  );
}
