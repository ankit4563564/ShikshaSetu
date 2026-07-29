'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolGPT } from '../schoolgpt/SchoolGPTProvider';

const INTERACTIVE_DEMOS = [
  {
    question: 'Which students may need extra attention today?',
    answer: "I noticed Aarav's attendance has declined this week, homework submissions are delayed, and classroom participation has dropped. Consider checking in before tomorrow's assessment.",
    tag: 'Student Support Radar',
    category: 'Proactive Alert'
  },
  {
    question: 'Compare Class 8A and 8B morning arrival',
    answer: 'Class 8A shows 96% on-time arrival via Gate 2 RFID. Class 8B experienced a 10-minute transit delay due to rain near Sector 39.',
    tag: 'Arrival Telemetry',
    category: 'Class Insight'
  },
  {
    question: 'Prepare PTM Summary for Aarav',
    answer: 'Aarav excels in Physics (92%) and English (88%). Morning bus delays resolved. Recommended next step: 15-minute review on math fractions.',
    tag: 'PTM Summarizer',
    category: '1-Click Report'
  },
  {
    question: 'Draft Parent Update for Bus Delay',
    answer: '"Hi Priya, Aarav arrived safely at 8:22 AM. Bus 04 was delayed 10 mins due to weather. He is settled in Class 8-B."',
    tag: 'Parent Communication',
    category: 'Automated Draft'
  }
];

export function SchoolGPTSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { openSchoolGPT } = useSchoolGPT();

  const current = INTERACTIVE_DEMOS[activeIdx];

  return (
    <section className="py-16 md:py-20 bg-[#F5F8FF] rounded-[2rem] my-8 border border-[#E5E7EB] relative overflow-hidden" id="schoolgpt">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: EDITORIAL STORYTELLING (~5 COLUMNS) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white border border-blue-200 px-4 py-1.5 rounded-full shadow-xs">
                <span className="text-[#3b82f6]">✨</span>
                <span className="text-[13px] font-mono font-extrabold text-[#3b82f6] uppercase tracking-widest">
                  AMBIENT INTELLIGENCE
                </span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold text-[#111827] tracking-tight leading-[1.15]">
                One intelligence layer. <br />
                <span className="text-[#0F766E]">Every school conversation.</span>
              </h2>

              <p className="font-body text-base md:text-[17px] text-[#4B5563] font-medium leading-relaxed">
                SchoolGPT quietly understands attendance, academics, transport, communication, and wellbeing—transforming signals into timely actions for every stakeholder.
              </p>
            </div>

            {/* 3 CAPABILITY CARDS */}
            <div className="space-y-3 pt-2">
              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#F5F8FF] text-blue-600 flex items-center justify-center font-bold shrink-0">
                  📊
                </div>
                <div>
                  <h4 className="font-extrabold text-[15px] text-[#111827]">Understand</h4>
                  <p className="text-[15px] text-[#4B5563] font-medium mt-0.5 leading-relaxed">
                    Connect attendance, homework, behaviour and communication signals in real time.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#F4FBF7] text-[#0F766E] flex items-center justify-center font-bold shrink-0">
                  ✨
                </div>
                <div>
                  <h4 className="font-extrabold text-[15px] text-[#111827]">Recommend</h4>
                  <p className="text-[15px] text-[#4B5563] font-medium mt-0.5 leading-relaxed">
                    Quietly highlight students who may need extra attention before problems grow.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="font-extrabold text-[15px] text-[#111827]">Act</h4>
                  <p className="text-[15px] text-[#4B5563] font-medium mt-0.5 leading-relaxed">
                    Generate PTM summaries, parent updates, and personalized follow-up plans instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={openSchoolGPT}
                className="inline-flex items-center gap-2 bg-[#0F766E] hover:bg-[#0d665f] text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
              >
                Experience SchoolGPT Companion
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: FLOATING CONVERSATIONAL WINDOW (~7 COLUMNS) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5E7EB] shadow-lg relative space-y-5">
              
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#111827] ml-2">
                    SchoolGPT Companion
                  </span>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-full bg-[#F4FBF7] text-[#0F766E] border border-[#22C55E]/30">
                  {current.category}
                </span>
              </div>

              {/* Interactive Prompt Pills */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
                  Select Contextual Question:
                </span>
                <div className="flex flex-wrap gap-2">
                  {INTERACTIVE_DEMOS.map((demo, idx) => (
                    <button
                      key={demo.question}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border text-left ${
                        activeIdx === idx
                          ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                          : 'bg-[#F8FAFC] text-[#6B7280] border-[#E5E7EB] hover:bg-white hover:text-[#111827]'
                      }`}
                    >
                      {demo.question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Single Meaningful Interaction Box */}
              <div className="min-h-[220px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* User Prompt */}
                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 flex items-start gap-3">
                      <span className="text-lg">👩‍🏫</span>
                      <div>
                        <span className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
                          Teacher Query
                        </span>
                        <p className="text-[15px] sm:text-base font-bold text-[#111827] mt-0.5">
                          &ldquo;{current.question}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* SchoolGPT Response */}
                    <div className="bg-[#F4FBF7] border border-[#22C55E]/30 rounded-2xl p-5 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#22C55E]/20 pb-2">
                        <span className="text-[#0F766E] font-bold">✨ SchoolGPT Intelligence</span>
                        <span className="text-[#6B7280]">{current.tag}</span>
                      </div>
                      <p className="text-[15px] sm:text-base font-medium text-[#111827] leading-relaxed">
                        {current.answer}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Window Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB] text-[11px] font-mono text-[#6B7280]">
                <span>CONNECTED CAMPUS AI</span>
                <button
                  type="button"
                  onClick={openSchoolGPT}
                  className="text-[#0F766E] font-bold hover:underline inline-flex items-center gap-1"
                >
                  Open Live Assistant →
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}



