'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLandingModal } from '../LandingModalContext';

export function EcosystemHero() {
  const { openRoleSelector } = useLandingModal();
  const [activeNode, setActiveNode] = useState<'teacher' | 'student' | 'parent' | 'ai' | null>(null);

  const nodes = [
    {
      id: 'teacher',
      label: 'Class Teacher',
      name: 'Ms. Ananya Mehra',
      icon: '👨‍🏫',
      tag: 'Observes Evidence',
      desktopPos: 'sm:top-2 sm:left-1/2 sm:-translate-x-1/2',
      description: 'Reviews formative check-ins & triggers targeted 5-min reviews.',
    },
    {
      id: 'student',
      label: 'Student Learner',
      name: 'Priya Patel',
      icon: '🎓',
      tag: 'Learns & Checks',
      desktopPos: 'sm:bottom-4 sm:left-6',
      description: 'Completes 15-min targeted revision with SchoolMitra.',
    },
    {
      id: 'parent',
      label: 'Parent Guardian',
      name: 'Rajesh Patel',
      icon: '👨‍👩‍👧',
      tag: 'Supports at Home',
      desktopPos: 'sm:bottom-4 sm:right-6',
      description: 'Receives meaningful dinner conversation prompts, not raw marks.',
    },
    {
      id: 'ai',
      label: 'Ecosystem Intelligence',
      name: 'SchoolGPT & Mitra',
      icon: '🤖',
      tag: 'Connects Truth',
      desktopPos: 'sm:top-1/2 sm:right-4 sm:-translate-y-1/2',
      description: 'Synthesizes learning signals without inventing facts.',
    },
  ];

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-blue-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-14">
        {/* Top Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-200/80 shadow-xs backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            <span className="text-[11px] font-black tracking-wider uppercase text-indigo-950">
              The Intelligent Learning Ecosystem
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded-full border border-indigo-100">
              v2.0
            </span>
          </div>
        </motion.div>

        {/* Hero Title & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]"
          >
            The school ERP that <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              actually understands learning.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Traditional ERPs tell schools what happened. ShikshaSetu connects the people, data, and AI that help decide{' '}
            <strong className="text-slate-900 font-black">what happens next</strong>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openRoleSelector}
              className="w-full sm:w-auto bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white font-display text-sm font-black px-8 py-4 rounded-2xl shadow-lg shadow-indigo-950/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>See ShikshaSetu in Action</span>
              <span className="text-indigo-400 font-bold">&rarr;</span>
            </motion.button>

            <a
              href="#learning-loop"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 font-display text-sm font-black border border-slate-200/90 shadow-xs transition-all text-center"
            >
              Explore the Learning Journey
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-xs font-bold text-slate-400 tracking-wide"
          >
            ✨ One school • One source of truth • Every learner connected
          </motion.p>
        </div>

        {/* ============================================================ */}
        {/* HERO LIVING ECOSYSTEM CANVAS                                 */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative max-w-4xl mx-auto rounded-3xl bg-white/80 border border-indigo-100/90 p-6 sm:p-10 shadow-xl shadow-indigo-500/5 backdrop-blur-2xl"
        >
          {/* Radar background decoration for desktop */}
          <div className="absolute inset-0 hidden sm:flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 rounded-full border border-indigo-200/40" />
            <div className="w-[420px] h-[420px] rounded-full border border-indigo-100/60 animate-ping opacity-15" />
          </div>

          <div className="relative min-h-[380px] sm:min-h-[440px] flex flex-col sm:block items-center justify-center gap-4">
            {/* Central Student Identity: Priya Patel */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="sm:absolute sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-10 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center shadow-2xl border border-indigo-700/50 w-full max-w-[240px]"
            >
              <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-black shadow-md shadow-indigo-500/30 mb-2.5">
                👩‍🎓
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block mb-0.5">
                One Canonical Learner
              </span>
              <h3 className="font-display text-base sm:text-lg font-black text-white leading-tight">
                Priya Patel
              </h3>
              <p className="text-xs text-indigo-200/90 font-medium mt-0.5">
                Class 8A • Roll #802
              </p>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Journey Sync</span>
              </div>
            </motion.div>

            {/* Connected Nodes: Desktop (absolute radial) & Mobile (2x2 grid) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:block">
              {nodes.map((node) => {
                const isHovered = activeNode === node.id;
                return (
                  <motion.div
                    key={node.id}
                    onMouseEnter={() => setActiveNode(node.id as any)}
                    onMouseLeave={() => setActiveNode(null)}
                    whileHover={{ scale: 1.04 }}
                    className={`sm:absolute ${node.desktopPos} z-20 cursor-pointer transition-all duration-300`}
                  >
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all sm:max-w-[210px]">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-xl p-1 rounded-xl bg-slate-50 border border-slate-100">
                          {node.icon}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate">
                            {node.label}
                          </span>
                          <h4 className="font-display text-xs font-black text-slate-900 truncate">
                            {node.name}
                          </h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block">
                        {node.tag}
                      </span>
                      {isHovered && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100 leading-snug"
                        >
                          {node.description}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
