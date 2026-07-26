'use client';

import React, { useState } from 'react';

const TIMELINE_STEPS = [
  {
    time: '07:30 AM',
    title: 'Bus Starts Route',
    subtitle: 'Morning Transit',
    desc: 'Live GPS ping active. Parents receive automated arrival ETA on their phone.',
    icon: 'directions_bus',
    color: 'bg-amber-500 text-slate-950 border-amber-300'
  },
  {
    time: '08:15 AM',
    title: 'Campus Gate Entry',
    subtitle: 'RFID & QR Pass',
    desc: 'Instant gate scan. Parent receives instant push notification: "Aarav entered campus safely".',
    icon: 'sensor_door',
    color: 'bg-emerald-500 text-slate-950 border-emerald-300'
  },
  {
    time: '08:30 AM',
    title: 'Classroom & Attendance',
    subtitle: 'Signal Sync',
    desc: 'Attendance automatically synced to school dashboard. No manual roll call needed.',
    icon: 'how_to_reg',
    color: 'bg-sky-500 text-slate-950 border-sky-300'
  },
  {
    time: '10:30 AM',
    title: 'Teacher AI Insights',
    subtitle: 'Learning Climate',
    desc: 'SchoolGPT generates personalized quiz practice and highlights attention peaks.',
    icon: 'auto_awesome',
    color: 'bg-indigo-500 text-white border-indigo-300'
  },
  {
    time: '03:30 PM',
    title: 'Home-Safe Confirmation',
    subtitle: 'Evening Drop',
    desc: 'Final GPS drop-off ping. Parent receives home confirmation. One calm day complete.',
    icon: 'home',
    color: 'bg-teal-500 text-slate-950 border-teal-300'
  }
];

export function SchoolDayStorySection() {
  const [activeIdx, setActiveIdx] = useState(1);

  return (
    <section className="py-section-gap bg-slate-950 text-white rounded-[3rem] my-12 relative overflow-hidden" id="story">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary-container/20 border border-secondary-container/40 px-4 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-label-sm text-label-sm text-secondary-fixed tracking-widest uppercase font-bold">The Connected Narrative</span>
          </div>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white">
            One Connected <span className="text-secondary-fixed glow-text">School Day</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-300 font-medium">
            Follow the live chain from morning bus boarding to home-safe arrival.
          </p>
        </div>

        {/* Timeline Desktop/Tablet Horizontal Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {TIMELINE_STEPS.map((step, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={step.time}
                onClick={() => setActiveIdx(idx)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-900 border-secondary-container shadow-2xl scale-[1.03]'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-secondary-fixed">{step.time}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md ${step.color}`}>
                      <span className="material-symbols-outlined text-sm">{step.icon}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-base font-display mb-1">{step.title}</h4>
                  <p className="text-xs text-slate-400 font-semibold mb-3">{step.subtitle}</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
