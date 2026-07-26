'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const PROMPTS = [
  {
    prompt: 'Why is Aarav struggling with attendance?',
    response: 'Aarav’s morning bus route experienced road construction delays on 3 occasions. His academic engagement in afternoon classes remains high (88%).',
    category: 'Student Support'
  },
  {
    prompt: 'Compare Class 8A and 8B morning arrival',
    response: 'Class 8A shows 96% on-time arrival. Class 8B experienced a 10-minute transit delay due to rain near Sector 39.',
    category: 'Class Insights'
  },
  {
    prompt: 'Prepare PTM Summary for Aarav',
    response: 'Summary for Priya Sharma: Aarav excels in Physics (92%) and English (88%). Recommendation: Bus 04 route adjustment confirmed.',
    category: 'PTM Report'
  },
  {
    prompt: 'Draft Parent Message',
    response: 'Draft WhatsApp: "Hi Priya, Aarav arrived safely at 8:22 AM. Bus 04 was delayed by 10 mins due to weather. He is settled in Class 8-B."',
    category: 'Parent Message'
  }
];

const STORY_STEPS = [
  {
    step: '01',
    title: 'Morning Class Register',
    desc: 'Attendance automatically recorded as students enter campus.',
    icon: 'dashboard',
    badge: 'Morning Signal',
    highlight: '8-B Attendance: 94% Present',
    color: 'border-sky-500/40 text-sky-400 bg-sky-500/10'
  },
  {
    step: '02',
    title: 'Smart Attendance Flag',
    desc: 'SchoolGPT notices 3 consecutive bus delays for Aarav Sharma.',
    icon: 'warning',
    badge: 'Notice Flagged',
    highlight: 'Notice: 3 Transit Delays Noted',
    color: 'border-amber-500/40 text-amber-400 bg-amber-500/10'
  },
  {
    step: '03',
    title: 'Schedule Insights',
    desc: 'Cross-checks bus route traffic with morning health logs.',
    icon: 'find_in_page',
    badge: 'Insights Discovered',
    highlight: 'Route 04 Traffic Delay + Mild Cold Logged',
    color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10'
  },
  {
    step: '04',
    title: 'Draft Parent Message',
    desc: 'SchoolGPT prepares a helpful, warm update for Aarav’s parent.',
    icon: 'chat',
    badge: '1-Click Message',
    highlight: '"Hi Priya, Aarav arrived safely at 8:22 AM..."',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
  },
  {
    step: '05',
    title: 'Student Support Confirmed',
    desc: 'Parent confirms home rest tomorrow. Student support log updated.',
    icon: 'check_circle',
    badge: 'Action Completed',
    highlight: 'Support Action Confirmed',
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
    }, 500);
  };

  const current = STORY_STEPS[activeStep];
  const activePrompt = selectedPromptIdx !== null ? PROMPTS[selectedPromptIdx] : null;

  return (
    <div className="bg-primary text-white rounded-[2.5rem] p-8 md:p-14 ambient-shadow border border-white/10 relative overflow-hidden my-12" id="schoolgpt">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-fixed/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full mb-4">
            <span className="material-symbols-outlined text-secondary-fixed text-sm">auto_awesome</span>
            <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider font-bold">SchoolGPT AI Assistant</span>
          </div>
          <h3 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white leading-tight">
            SchoolGPT: From Signal to <span className="text-secondary-fixed glow-text">Action in Seconds</span>
          </h3>
        </div>
        <p className="font-body-lg text-body-md text-white/80 max-w-md">
          Built for Indian schools. SchoolGPT helps teachers save time on notes, assists admin teams with insights, and keeps parents informed.
        </p>
      </div>

      {/* Interactive Prompt Chips */}
      <div className="mb-10">
        <span className="block text-xs font-mono font-bold text-white/70 uppercase tracking-wider mb-3">
          💡 Try Live SchoolGPT Examples:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {PROMPTS.map((p, idx) => (
            <button
              key={p.prompt}
              type="button"
              onClick={() => handlePromptClick(idx)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                selectedPromptIdx === idx
                  ? 'bg-secondary-container text-on-secondary-container border-secondary-container shadow-lg scale-105'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
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
              className="px-3.5 py-2 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20"
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
                    ? 'bg-white/15 border-secondary-fixed/60 shadow-xl scale-[1.02]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl font-bold font-mono text-sm flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-secondary-container text-on-secondary-container shadow-md' : 'bg-white/10 text-white'
                  }`}
                >
                  {s.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-white/80'}`}>{s.title}</h4>
                    {isActive && <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />}
                  </div>
                  <p className="text-xs text-white/70 mt-1 line-clamp-2">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Live Interactive Console */}
        <div className="lg:col-span-7 bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl relative min-h-[380px] flex flex-col justify-between">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <span className="text-xs font-mono text-white/70 ml-2">SchoolGPT Assistant</span>
            </div>
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${activePrompt ? 'bg-secondary-container text-on-secondary-container border-secondary-container' : current.color}`}>
              {activePrompt ? activePrompt.category : current.badge}
            </span>
          </div>

          {/* Prompt Execution Result OR Active Story Step */}
          {activePrompt ? (
            <div className="my-6 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-secondary-fixed">psychology</span>
                <p className="text-xs font-mono text-secondary-fixed font-bold">Query: &ldquo;{activePrompt.prompt}&rdquo;</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 font-mono text-xs text-white leading-relaxed">
                <div className="flex items-center justify-between text-white/60 text-[10px] mb-2 border-b border-white/10 pb-1">
                  <span>SchoolGPT Response</span>
                  <span>Accuracy: High</span>
                </div>
                {isTyping ? (
                  <p className="text-secondary-fixed animate-pulse font-sans">Checking campus records...</p>
                ) : (
                  <p className="text-white font-sans text-sm leading-relaxed">{activePrompt.response}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="my-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center text-secondary-fixed shadow-lg">
                  <span className="material-symbols-outlined text-2xl">{current.icon}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">Step {current.step} of 05</span>
                  <h4 className="text-xl font-extrabold text-white">{current.title}</h4>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 font-mono text-xs text-secondary-fixed leading-relaxed">
                <div className="flex items-center justify-between text-white/60 text-[10px] mb-2 border-b border-white/10 pb-1">
                  <span>AI Insight</span>
                  <span>Confidence: High</span>
                </div>
                <p className="text-white font-sans text-sm font-semibold">{current.highlight}</p>
                <p className="text-white/70 font-sans text-xs mt-2">{current.desc}</p>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono">
            <span className="text-white/70">CONNECTED CAMPUS AI</span>
            <Link
              href="/admin"
              className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl font-bold font-sans hover:bg-secondary-fixed transition-colors flex items-center gap-1"
            >
              Open SchoolGPT Workstation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
