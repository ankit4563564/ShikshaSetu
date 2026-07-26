'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TeacherSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSpotlight: () => void;
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

export default function TeacherSidebar({ activeTab, onTabChange, onOpenSpotlight }: TeacherSidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-5 min-h-screen font-body select-none shrink-0">
      {/* Top Header Logo */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-display text-sm font-black flex items-center justify-center shadow-md">
            🤖
          </div>
          <div>
            <h1 className="font-display text-base font-extrabold text-slate-900 leading-tight">SchoolGPT</h1>
            <p className="text-[11px] font-medium text-slate-500">AI Assistant</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Command Palette Shortcut */}
      <div className="space-y-3 pt-6 border-t border-slate-100">
        <button
          type="button"
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
            PS
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-xs font-extrabold text-slate-900 truncate">Ms. Priya Sharma</h4>
            <p className="text-[10px] text-slate-500 truncate font-medium">Science Teacher</p>
          </div>
          <span className="text-xs text-slate-400">⌄</span>
        </div>
      </div>
    </aside>
  );
}
