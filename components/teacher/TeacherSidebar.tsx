'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';

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
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-screen">
      <div className="space-y-6">
        {/* Logo Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center font-display font-black text-white text-sm shadow-xs">
            S
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 text-sm tracking-tight">ShikshaSetu</h3>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Teacher Portal</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-display text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Footer */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <button
          onClick={onOpenSpotlight}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-500 hover:text-slate-900 transition-all text-xs font-semibold"
        >
          <span className="flex items-center gap-1.5">
            <span>🔍</span>
            <span>Spotlight</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px] font-bold text-slate-500">
            ⌘K
          </span>
        </button>

        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-xs font-black flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-xs font-extrabold text-slate-900 truncate">{displayName}</h4>
            <p className="text-[10px] text-slate-500 truncate font-medium">Class Teacher</p>
          </div>
        </div>

        <SignOutButton redirectUrl="/login">
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/auth/demo-session', { method: 'DELETE' }).catch(() => {});
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-700 font-display text-xs font-bold transition-all border border-rose-200/60"
          >
            <span className="flex items-center gap-2">
              <span>🚪</span>
              <span>Sign Out</span>
            </span>
            <span className="text-[10px] text-rose-500 font-mono">→</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
