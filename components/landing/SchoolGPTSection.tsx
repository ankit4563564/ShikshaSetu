'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const PROMPTS = [
  {
    prompt: 'Why is Aarav struggling?',
    response: 'Aarav’s attendance dropped by 12% over 2 weeks due to Route 04 morning bus traffic delays. Math comprehension remains 88%, but morning class attention is impacted.',
    category: 'Student Diagnostics'
  },
  {
    prompt: 'Compare Class 8A and 8B',
    response: 'Class 8A shows 96% attendance with higher Science engagement. Class 8B has 91% attendance due to morning transit bottlenecks near Sector 39.',
    category: 'Class Comparison'
  },
  {
    prompt: 'Generate PTM Summary',
    response: 'Summary for Priya Sharma: Aarav excels in Physics (92%) and English (88%). Recommended focus: Morning transit sleep schedule adjustment.',
    category: 'PTM Report'
  },
  {
    prompt: 'Draft Parent Message',
    response: 'Draft WhatsApp: "Hi Priya, Aarav arrived safely at 8:22 AM. Bus 04 was delayed by 10 mins due to rain. He is settled in Class 8-B."',
    category: 'Communication'
  }
];

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
  const [selectedPromptIdx, setSelectedPromptIdx] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (selectedPromptIdx !== null) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STORY_STEPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [selectedPromptIdx]);

  const handlePromptClick = (idx: number) => {
    setSelectedPromptIdx(idx);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 600);
  };

  const current = STORY_STEPS[activeStep];
  const activePrompt = selectedPromptIdx !== null ? PROMPTS[selectedPromptIdx] : null;

  return (
    <div className="bg-slate-950 rounded-[2.5rem] p-8 md:p-14 ambient-shadow border border-slate-800 text-white relative overflow-hidden my-12" id="schoolgpt">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-fixed/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-8">
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

      {/* Interactive Prompt Chips */}
      <div className="mb-10">
        <span className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
          ⚡ Execute Live Prompt Demo (Click Any Prompt Below):
        </span>
        <div className="flex flex-wrap gap-2.5">
          {PROMPTS.map((p, idx) => (
            <button
              key={p.prompt}
              type="button"
              onClick={() => handlePromptClick(idx)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                selectedPromptIdx === idx
                  ? 'bg-secondary-container text-slate-950 border-secondary-container shadow-lg scale-105'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-xs">chat</span>
              {p.prompt}
            </button>
          ))}
          {selectedPromptIdx !== null && (
            <button
              type="button"
              onClick={() => setSelectedPromptIdx(null)}
              className="px-3.5 py-2 rounded-full text-xs font-bold bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            >
              Reset to Story Flow ↺
            </button>
          )}
        </div>
      </div>

      {/* Interactive Story / Prompt Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Story Steps List */}
        <div className="lg:col-span-5 space-y-3">
          {STORY_STEPS.map((s, idx) => {
            const isActive = selectedPromptIdx === null && idx === activeStep;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setSelectedPromptIdx(null);
                  setActiveStep(idx);
                }}
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

        {/* Right Column: Live Interactive Console */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl relative min-h-[380px] flex flex-col justify-between">
          {/* Top Bar simulation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-slate-500 ml-2">SchoolGPT Telemetry Pipeline</span>
            </div>
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${activePrompt ? 'bg-secondary-container/20 text-secondary-fixed border-secondary-container/40' : current.color}`}>
              {activePrompt ? activePrompt.category : current.badge}
            </span>
          </div>

          {/* Prompt Execution Result OR Active Story Step */}
          {activePrompt ? (
            <div className="my-6 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="material-symbols-outlined text-secondary-container">psychology</span>
                <p className="text-xs font-mono text-secondary-container font-bold">Query: &ldquo;{activePrompt.prompt}&rdquo;</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed">
                <div className="flex items-center justify-between text-slate-500 text-[10px] mb-2 border-b border-slate-800 pb-1">
                  <span>SchoolGPT Response Stream</span>
                  <span>Confidence: 99.8%</span>
                </div>
                {isTyping ? (
                  <p className="text-amber-400 animate-pulse font-sans">Analyzing campus telemetry data...</p>
                ) : (
                  <p className="text-white font-sans text-sm leading-relaxed">{activePrompt.response}</p>
                )}
              </div>
            </div>
          ) : (
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
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-mono">
            <span className="text-slate-400">STATUS: ACTIVE INTELLIGENCE</span>
            <Link
              href="/admin"
              className="bg-secondary-container text-slate-950 px-4 py-2 rounded-xl font-bold font-sans hover:bg-secondary-fixed transition-colors flex items-center gap-1"
            >
              Open Full SchoolGPT Workstation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
