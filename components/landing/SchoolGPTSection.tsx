'use client';

import React, { useState, useEffect } from 'react';

const STORY_STEPS = [
  {
    step: '01',
    title: 'Teacher Dashboard',
    desc: 'Attendance & engagement signals synced in real time across Class 8-B.',
    icon: 'dashboard',
    badge: 'Real-time Signal',
    highlight: '8-B Attendance: 94%',
    color: 'border-sky-500/40 text-sky-400 bg-sky-500/10'
  },
  {
    step: '02',
    title: 'AI Notices Attendance Drop',
    desc: 'SchoolGPT flags 3 consecutive late arrivals for Aarav Sharma.',
    icon: 'warning',
    badge: 'Pattern Detected',
    highlight: 'Flagged: 3 Late Pings',
    color: 'border-amber-500/40 text-amber-400 bg-amber-500/10'
  },
  {
    step: '03',
    title: 'Reason Discovered',
    desc: 'Cross-analyzes bus route delays with morning health check log.',
    icon: 'find_in_page',
    badge: 'Root Cause AI',
    highlight: 'Route 04 Traffic + Mild Fever Logged',
    color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10'
  },
  {
    step: '04',
    title: 'Draft Parent Message',
    desc: 'SchoolGPT generates a personalized, empathetic update for Aarav’s mother.',
    icon: 'chat',
    badge: '1-Click Communication',
    highlight: '"Hi Priya, Aarav arrived safely at 8:22 AM..."',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
  },
  {
    step: '05',
    title: 'Meeting Scheduled & Risk Resolved',
    desc: 'Parent confirms home rest tomorrow. Student risk score drops to 0%.',
    icon: 'check_circle',
    badge: 'Outcome Achieved',
    highlight: 'Risk Score: Resolved (14%)',
    color: 'border-teal-500/40 text-teal-400 bg-teal-500/10'
  }
];

export function SchoolGPTSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STORY_STEPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = STORY_STEPS[activeStep];

  return (
    <div className="bg-slate-950 rounded-[2.5rem] p-8 md:p-14 ambient-shadow border border-slate-800 text-white relative overflow-hidden my-12" id="schoolgpt">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-fixed/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/40 border border-primary-fixed-dim/30 px-3.5 py-1.5 rounded-full mb-4">
            <span className="material-symbols-outlined text-secondary-container text-sm">auto_awesome</span>
            <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider font-bold">Revolutionary AI Workflow</span>
          </div>
          <h3 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white leading-tight">
            SchoolGPT: From Signal to <span className="text-secondary-container glow-text">Action in Seconds</span>
          </h3>
        </div>
        <p className="font-body-lg text-body-md text-slate-300 max-w-md">
          Not just another chatbot. SchoolGPT actively monitors student signals, detects hidden risks, and completes administrative actions automatically.
        </p>
      </div>

      {/* Interactive Story Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Story Steps List */}
        <div className="lg:col-span-5 space-y-3">
          {STORY_STEPS.map((s, idx) => {
            const isActive = idx === activeStep;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-start gap-4 border ${
                  isActive
                    ? 'bg-slate-900/90 border-secondary-container/60 shadow-xl scale-[1.02]'
                    : 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl font-bold font-mono text-sm flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-secondary-container text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {s.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>{s.title}</h4>
                    {isActive && <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Live Interactive Simulator Card */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl relative min-h-[380px] flex flex-col justify-between">
          {/* Top Bar simulation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-slate-500 ml-2">SchoolGPT Telemetry Pipeline</span>
            </div>
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${current.color}`}>
              {current.badge}
            </span>
          </div>

          {/* Center Story Step Graphic Visualizer */}
          <div className="my-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center text-secondary-container shadow-lg">
                <span className="material-symbols-outlined text-2xl">{current.icon}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Active Workflow Step {current.step} / 05</span>
                <h4 className="text-xl font-extrabold text-white">{current.title}</h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-secondary-fixed leading-relaxed">
              <div className="flex items-center justify-between text-slate-500 text-[10px] mb-2 border-b border-slate-800/80 pb-1">
                <span>AI Insight Output</span>
                <span>Confidence: 99.4%</span>
              </div>
              <p className="text-white font-sans text-sm font-semibold">{current.highlight}</p>
              <p className="text-slate-400 font-sans text-xs mt-2">{current.desc}</p>
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>AUTOMATED RESOLUTION PROGRESS</span>
              <span className="text-secondary-container font-bold">{((activeStep + 1) * 20)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 transition-all duration-500"
                style={{ width: `${(activeStep + 1) * 20}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
