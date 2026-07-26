'use client';

import React from 'react';
import type { SchoolGPTRole } from './types';

export interface RoleThemeConfig {
  role: SchoolGPTRole;
  title: string;
  badge: string;
  headerBg: string;
  accentColor: string;
  btnBg: string;
  containerBorder: string;
}

export const ROLE_THEME_MAP: Record<SchoolGPTRole, RoleThemeConfig> = {
  teacher: {
    role: 'teacher',
    title: 'SchoolGPT Teacher Workstation',
    badge: '👩‍🏫 Academic Companion',
    headerBg: 'from-slate-900 via-teal-950 to-slate-900',
    accentColor: 'text-teal-300',
    btnBg: 'bg-teal-600 hover:bg-teal-500 text-white',
    containerBorder: 'border-teal-500/30',
  },
  parent: {
    role: 'parent',
    title: 'SchoolGPT Parent Safety & Growth Assistant',
    badge: '👨‍👩‍👧 Family Assistant',
    headerBg: 'from-slate-900 via-amber-950 to-slate-900',
    accentColor: 'text-amber-300',
    btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    containerBorder: 'border-amber-500/30',
  },
  student: {
    role: 'student',
    title: 'SchoolGPT Study & Quest Partner',
    badge: '🎓 AI Study Buddy',
    headerBg: 'from-slate-900 via-indigo-950 to-slate-900',
    accentColor: 'text-indigo-300',
    btnBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    containerBorder: 'border-indigo-500/30',
  },
  admin: {
    role: 'admin',
    title: 'SchoolGPT Campus Mission Control',
    badge: '🏛️ Campus Operations',
    headerBg: 'from-slate-950 via-primary to-slate-950',
    accentColor: 'text-secondary-fixed',
    btnBg: 'bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container',
    containerBorder: 'border-white/15',
  },
  driver: {
    role: 'driver',
    title: 'SchoolGPT Driver Co-Pilot',
    badge: '🚌 Transit Assistant',
    headerBg: 'from-slate-950 via-amber-900 to-slate-950',
    accentColor: 'text-amber-400',
    btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold',
    containerBorder: 'border-amber-500/40',
  },
  gate: {
    role: 'gate',
    title: 'SchoolGPT Gate Verification Assistant',
    badge: '🚪 Security Console',
    headerBg: 'from-slate-950 via-emerald-950 to-slate-950',
    accentColor: 'text-emerald-400',
    btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold',
    containerBorder: 'border-emerald-500/40',
  },
  vendor: {
    role: 'vendor',
    title: 'SchoolGPT Vendor Portal',
    badge: '📦 Inventory Control',
    headerBg: 'from-slate-900 via-slate-800 to-slate-900',
    accentColor: 'text-slate-300',
    btnBg: 'bg-slate-700 hover:bg-slate-600 text-white',
    containerBorder: 'border-slate-700',
  },
};

export class RoleUIAdapter {
  static getTheme(role: SchoolGPTRole): RoleThemeConfig {
    return ROLE_THEME_MAP[role] || ROLE_THEME_MAP.student;
  }
}
