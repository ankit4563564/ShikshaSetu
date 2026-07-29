'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function DualExperienceHubSection() {
  return (
    <section className="py-16 md:py-20 bg-[#FAFBFF] rounded-[2rem] my-8 border border-[#E5E7EB] relative overflow-hidden" id="dual-experience">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-[#F4FBF7] border border-[#22C55E]/30 px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[13px] font-mono font-extrabold text-[#0F766E] uppercase tracking-widest">
              ONE PLATFORM &bull; TWO EXPERIENCES
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-[2.75rem] font-extrabold text-[#111827] tracking-tight leading-[1.15]">
            Two Experiences. <span className="text-[#0F766E]">One Connected Story.</span>
          </h2>
          <p className="font-body text-base md:text-[17px] text-[#4B5563] font-medium max-w-2xl mx-auto leading-relaxed">
            ShikshaSetu links home and school seamlessly — keeping parents calm and giving teachers time back to teach.
          </p>
        </div>

        {/* ── DUAL EXPERIENCE 2-COLUMN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">
          
          {/* LEFT: Parent Experience Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-[#E5E7EB] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-3xl p-3 rounded-2xl bg-[#F4FBF7] border border-[#E5E7EB]">👨‍👩‍👧</span>
                <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-[#0F766E] bg-[#F4FBF7] px-3.5 py-1.5 rounded-full border border-[#22C55E]/30">
                  Parent Experience
                </span>
              </div>

              {/* Editorial Headline */}
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] leading-snug group-hover:text-[#0F766E] transition-colors">
                Parents never have to wonder again.
              </h3>

              {/* Supporting Copy (Max 3 lines) */}
              <p className="text-base text-[#4B5563] font-medium leading-relaxed">
                Know when your child boards the bus, reaches school, completes homework, and returns home—all from one connected experience.
              </p>

              {/* 3 Core Benefits */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[13px] font-bold text-[#111827]">
                  <span className="text-[#22C55E]">✓</span> Live Bus Updates
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[13px] font-bold text-[#111827]">
                  <span className="text-[#22C55E]">✓</span> Instant Gate Signals
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[13px] font-bold text-[#111827]">
                  <span className="text-[#22C55E]">✓</span> Connected Story
                </span>
              </div>

              {/* Realistic iPhone Device Frame (Only 1 Meaningful Moment) */}
              <div className="relative mx-auto w-full max-w-[290px] h-[340px] rounded-[32px] overflow-hidden shadow-xl border-4 border-slate-900 bg-slate-950 p-3 flex flex-col justify-between my-6 group-hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between px-2 text-[9px] font-mono text-white/70 z-10">
                  <span>08:14 AM</span>
                  <div className="w-12 h-2.5 bg-slate-900 rounded-full mx-auto" />
                  <span>100% ⚡</span>
                </div>
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/images/parent_safety_app.jpg"
                    alt="Parent Mobile App Experience"
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>
                {/* Single Meaningful Moment Overlay */}
                <div className="relative z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E5E7EB] text-[#111827] space-y-1 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#0F766E] uppercase tracking-wider font-mono">Live Gate Scan</span>
                    <span className="text-[9px] text-[#6B7280] font-mono">Just now</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-[#111827]">✓ Your child reached school safely.</h4>
                  <p className="text-[10px] text-[#6B7280] font-medium">Gate #2 RFID Scan Verified &bull; 08:14 AM</p>
                </div>
                <div className="w-20 h-1 bg-white/40 rounded-full mx-auto z-10" />
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/parent"
              className="w-full text-center py-3.5 px-6 rounded-xl font-bold text-sm bg-[#0F766E] hover:bg-[#0d665f] text-white shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
            >
              Explore Parent Experience
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* RIGHT: Teacher Experience Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-[#E5E7EB] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-3xl p-3 rounded-2xl bg-[#F5F8FF] border border-[#E5E7EB]">👩‍🏫</span>
                <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-[#3b82f6] bg-[#F5F8FF] px-3.5 py-1.5 rounded-full border border-blue-200">
                  Teacher Experience
                </span>
              </div>

              {/* Editorial Headline */}
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] leading-snug group-hover:text-blue-600 transition-colors">
                Teachers finally get their evenings back.
              </h3>

              {/* Supporting Copy (Max 3 lines) */}
              <p className="text-base text-[#4B5563] font-medium leading-relaxed">
                Attendance, communication, classroom insights and AI assistance come together in one calm workspace.
              </p>

              {/* 3 Core Benefits */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[13px] font-bold text-[#111827]">
                  <span className="text-[#22C55E]">✓</span> 1-Tap Attendance
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[13px] font-bold text-[#111827]">
                  <span className="text-[#22C55E]">✓</span> Quiet AI Radar
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[13px] font-bold text-[#111827]">
                  <span className="text-[#22C55E]">✓</span> Automated PTM Summaries
                </span>
              </div>

              {/* Realistic MacBook Device Frame (Only 1 Workflow) */}
              <div className="relative mx-auto w-full max-w-[360px] h-[220px] rounded-2xl overflow-hidden shadow-xl border-4 border-slate-800 bg-slate-950 p-3.5 flex flex-col justify-between my-6 group-hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-semibold">Teacher Workstation &bull; Class 8A</span>
                </div>
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/images/teacher_classroom_ai.jpg"
                    alt="Teacher Workstation Experience"
                    fill
                    className="object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>
                {/* Single Workflow Overlay */}
                <div className="relative z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[#E5E7EB] text-[#111827] space-y-1 shadow-lg mt-auto">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#0F766E] font-bold">✨ SchoolGPT Intelligence</span>
                    <span className="text-[#22C55E] font-bold">✓ 45 Mins Saved Today</span>
                  </div>
                  <p className="text-xs font-bold text-[#111827]">
                    &ldquo;3 students may need extra attention in Science today.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/teacher"
              className="w-full text-center py-3.5 px-6 rounded-xl font-bold text-sm bg-[#111827] hover:bg-slate-800 text-white shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
            >
              Explore Teacher Experience
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

        </div>

        {/* ── AMBIENT INTELLIGENCE CONNECTOR ── */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5E7EB] shadow-sm text-center max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] px-3.5 py-1.5 rounded-full">
            <span className="text-[#F4B942]">✨</span>
            <span className="text-xs font-mono font-bold text-[#111827] uppercase tracking-wider">
              Connected Intelligence Engine
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-extrabold text-[#111827] font-display">
            One Shared Platform. Continuous Harmony.
          </h3>

          <p className="text-[15px] text-[#4B5563] font-medium leading-relaxed max-w-xl mx-auto">
            Linking parent peace of mind with teacher efficiency in real time — because a calm school day benefits every child.
          </p>
        </div>

      </div>
    </section>
  );
}

