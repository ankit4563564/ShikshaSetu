'use client';

import React from 'react';
import { motion } from 'framer-motion';

const CONNECTED_STORY_NODES = [
  {
    time: '07:20 AM',
    emoji: '🚌',
    title: 'Aarav boarded Bus #04.',
    desc: 'Live GPS telemetry active. Parents receive automated arrival ETA on their phones before even asking.',
    tag: 'Morning Transit',
    tagBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    time: '08:05 AM',
    emoji: '🏫',
    title: 'Arrived safely at campus gate.',
    desc: 'Instant RFID pass scan. Gate security photo verified and instant push signal delivered to parents.',
    tag: 'Gate Verification',
    tagBg: 'bg-[#F4FBF7] text-[#0F766E] border-[#22C55E]/30',
    iconBg: 'bg-[#F4FBF7] text-[#0F766E]',
  },
  {
    time: '10:30 AM',
    emoji: '📚',
    title: 'Classroom roll call & engagement.',
    desc: 'Attendance automatically synced to register. Teachers save 15 minutes of manual attendance taking.',
    tag: 'Classroom Signal',
    tagBg: 'bg-sky-50 text-sky-800 border-sky-200/80',
    iconBg: 'bg-sky-100 text-sky-700',
  },
  {
    time: '01:15 PM',
    emoji: '✨',
    title: 'SchoolGPT suggested a follow-up.',
    desc: 'Quiet AI radar identifies students needing support and prepares 1-click updates for parents.',
    tag: 'SchoolGPT AI',
    tagBg: 'bg-purple-50 text-purple-800 border-purple-200/80',
    iconBg: 'bg-purple-100 text-purple-700',
  },
  {
    time: '03:35 PM',
    emoji: '🏠',
    title: 'Reached home safely.',
    desc: 'Final GPS drop-off ping confirmed. Parents receive home notification. One calm school day complete.',
    tag: 'Home Safe',
    tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
];

export function SchoolDayStorySection() {
  return (
    <section className="pt-10 pb-10 md:pt-12 md:pb-12 bg-[#F4FBF7] rounded-[2rem] my-8 border border-[#E5E7EB] relative overflow-hidden" id="story">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
        
        {/* Section Header — tightened bottom margin */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-7">
          <div className="inline-flex items-center gap-2 bg-white border border-[#22C55E]/30 px-4 py-1.5 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[13px] font-mono font-extrabold text-[#0F766E] uppercase tracking-widest">
              CONNECTED STORY
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-[2.5rem] font-extrabold text-[#111827] tracking-tight leading-[1.15]">
            Every school day tells <span className="text-[#0F766E]">one connected story.</span>
          </h2>
          <p className="font-body text-[15px] md:text-base text-[#4B5563] font-medium max-w-2xl mx-auto leading-relaxed">
            Follow the live operational chain from morning bus boarding to evening home-safe confirmation.
          </p>
        </div>

        {/* ── VERTICAL CONNECTED TIMELINE STORY ── */}
        <div className="relative max-w-4xl mx-auto">
          {/* Animated Connecting Vertical Line */}
          <div className="absolute left-6 sm:left-1/2 top-6 bottom-6 w-1 -translate-x-1/2 bg-gradient-to-b from-[#22C55E] via-[#0F766E] to-[#22C55E] opacity-30 rounded-full z-0" />

          <div className="space-y-2 sm:space-y-3 relative z-10">
            {CONNECTED_STORY_NODES.map((node, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={node.time}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Card */}
                  <div className="w-full sm:w-[calc(50%-2.5rem)] bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-mono font-extrabold text-[#0F766E] bg-[#F4FBF7] border border-[#22C55E]/30 px-2.5 py-0.5 rounded-full">
                        ⏱️ {node.time}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${node.tagBg}`}>
                        {node.tag}
                      </span>
                    </div>

                    <h4 className="font-display text-[15px] sm:text-[15px] font-extrabold text-[#111827] group-hover:text-[#0F766E] transition-colors leading-snug mb-1">
                      {node.title}
                    </h4>

                    <p className="text-[13px] sm:text-[14px] text-[#4B5563] font-medium leading-relaxed">
                      {node.desc}
                    </p>
                  </div>

                  {/* Central Node Badge */}
                  <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border-2 border-[#0F766E] text-base shadow-md z-20 transition-transform hover:scale-110">
                    {node.emoji}
                  </div>

                  {/* Spacer for 2-column alternating alignment */}
                  <div className="hidden sm:block w-[calc(50%-2.5rem)]" />
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
