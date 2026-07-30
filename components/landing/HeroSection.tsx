'use client';

import React from 'react';
import Image from 'next/image';
import { useLandingModal } from './LandingModalContext';

export function HeroSection() {
  const { openRoleSelector, openLeadModal, openDemoModal, openFeatureModal } = useLandingModal();

  return (
    <section className="hero-gradient min-h-[921px] flex items-center relative overflow-hidden rounded-b-[2rem] pb-section-gap pt-20">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-fixed/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        {/* Left Column: Text & CTA Content */}
        <div className="text-white space-y-8">
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-label-sm text-[13px] text-white/90 tracking-wider">ONE SCHOOL DAY. ONE CONNECTED STORY.</span>
          </div>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-white leading-tight">
            A calmer day<br />
            for <span className="text-secondary-fixed glow-text">every child.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-white/80 max-w-xl">
            Gate entry, classroom attention, bus tracking, and home-safe confirmation — connected for parents, teachers, and school teams.
          </p>
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={openDemoModal}
                className="group relative overflow-hidden bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-title-md text-title-md hover:bg-secondary-fixed hover:-translate-y-1 transition-all duration-100 ease-out shadow-lg flex items-center gap-2 font-extrabold hover:scale-105 active:scale-95 active:translate-y-0 inline-flex"
              >
                <span className="relative z-10 flex items-center gap-2">
                  🚀 Experience Live Demo
                  <span className="material-symbols-outlined text-sm transition-transform duration-100 ease-out group-hover:translate-x-1.5">arrow_forward</span>
                </span>
              </button>
            </div>

            {/* Quick Access Pills for Hackathon Judges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs font-mono text-white/70 font-semibold">Quick Portal Access:</span>
              <a
                href="/parent"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105 flex items-center gap-1.5"
              >
                👨‍👩‍👧 Parent Experience
              </a>
              <a
                href="/teacher"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105 flex items-center gap-1.5"
              >
                👩‍🏫 Teacher Experience
              </a>
            </div>
          </div>
          <div className="flex gap-6 pt-6 border-t border-white/10">
            <a href="#school-story" className="flex items-center gap-2 cursor-pointer hover:opacity-100 opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-secondary-fixed text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-sm text-label-sm text-white/70">Live school signals</span>
            </a>
            <a href="#school-story" className="flex items-center gap-2 cursor-pointer hover:opacity-100 opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-secondary-fixed text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-sm text-label-sm text-white/70">Built for Indian schools</span>
            </a>
          </div>
        </div>

        {/* Right Column: High-Energy Floating Ecosystem Interactive Hero Visual */}
        <div className="relative w-full h-[600px]">
          {/* Main Student Card Container */}
          <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <Image
              src="/shikshasetu-hero-student.png"
              alt="A high-quality photograph of a modern Indian student smiling confidently in a contemporary school hallway."
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/20 pointer-events-none" />

            {/* Bottom Glassmorphism Bar: Live Status */}
            <div
              onClick={() =>
                openFeatureModal({
                  title: 'Live Campus Arrival Status',
                  category: 'Real-Time Telemetry',
                  badge: 'Live Gate Signal',
                  description: 'Instant notification delivered to parents the exact second a child scans their RFID/QR pass at campus gate #2.',
                  details: [
                    'Sub-second RFID reader verification at campus gates',
                    'Automated SMS, WhatsApp & Push alert dispatch',
                    'Real-time photo verification for gate security team'
                  ],
                  metrics: [
                    { label: 'Gate Scan Time', value: '0.8 Seconds' },
                    { label: 'Parent Alert Speed', value: 'Instant' }
                  ],
                  actionHref: '/gate',
                  actionText: 'Open Live Gate Security Console →'
                })
              }
              className="absolute bottom-5 left-5 right-5 glass-panel p-4 rounded-xl flex items-center justify-between border border-white/20 z-20 shadow-xl backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-on-secondary-container">directions_bus</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-white/70">Live Status</p>
                  <p className="font-title-md text-title-md text-white font-bold">Arrived Safely at Campus</p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-white/60 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">Just now</span>
            </div>
          </div>

          {/* ──── FLOATING ECOSYSTEM NOTIFICATIONS ──── */}

          {/* 1. Live Bus Notification */}
          <div
            onClick={() =>
              openFeatureModal({
                title: 'Live School Bus GPS Tracking',
                category: 'Transit Telemetry',
                badge: 'Live GPS',
                description: 'Real-time GPS bus location, driver speed monitor, route progress, and arrival ETA for parents and transit team.',
                details: [
                  'Dynamic ETA calculation based on traffic conditions',
                  'Driver speed limit and safety threshold alerts',
                  'Geofenced pickup and drop-off notifications'
                ],
                metrics: [
                  { label: 'GPS Ping Age', value: '4 Seconds' },
                  { label: 'On-Time Rate', value: '99.4%' }
                ],
                actionHref: '/parent',
                actionText: 'Open Live Bus Tracker →'
              })
            }
            className="absolute -top-4 left-4 sm:-left-6 z-30 animate-float-slow cursor-pointer"
          >
            <div className="glass-panel-light backdrop-blur-xl bg-white/90 px-3.5 py-2.5 rounded-2xl shadow-2xl border border-amber-200/60 flex items-center gap-3 max-w-[210px] hover:scale-110 transition-transform">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">directions_bus</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <p className="text-[11px] font-extrabold text-slate-900 leading-none">Live Bus GPS</p>
                </div>
                <p className="text-[9px] font-semibold text-slate-600 mt-0.5">Bus 04 &middot; 1.2 km away</p>
              </div>
            </div>
          </div>

          {/* 2. Attendance Confirmed */}
          <div
            onClick={() =>
              openFeatureModal({
                title: 'Instant Gate Attendance',
                category: 'Campus Security',
                badge: 'Verified Signal',
                description: 'Automatic roll call sync right as students pass campus entry gates, saving teachers 15 minutes of manual attendance taking.',
                details: [
                  'Sub-second RFID pass scan verification',
                  'Automatic attendance register update in Class 8-B',
                  'Automated absence alert dispatch after 08:30 AM'
                ],
                metrics: [
                  { label: 'Time Saved Daily', value: '15 Mins / Class' },
                  { label: 'Accuracy', value: '100%' }
                ],
                actionHref: '/gate',
                actionText: 'Open Gate Console →'
              })
            }
            className="absolute top-6 -right-3 sm:-right-6 z-30 animate-float-medium cursor-pointer"
          >
            <div className="glass-panel-light backdrop-blur-xl bg-white/90 px-3.5 py-2.5 rounded-2xl shadow-2xl border border-emerald-200/60 flex items-center gap-3 max-w-[215px] hover:scale-110 transition-transform">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">verified</span>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-900 leading-none">Attendance Confirmed</p>
                <p className="text-[9px] font-semibold text-emerald-600 mt-0.5">✓ 08:14 AM &middot; Gate Scan</p>
              </div>
            </div>
          </div>

          {/* 3. Homework Assigned */}
          <div
            onClick={() =>
              openFeatureModal({
                title: 'Homework & Assignment Sync',
                category: 'Academic Workflows',
                badge: 'Automated Sync',
                description: 'Teachers assign homework via voice or text, automatically generating student task checklists and parent reminders.',
                details: [
                  '1-Click quiz and assignment generation',
                  'Direct student quest checklist sync',
                  'Parent WhatsApp summary at 4:00 PM'
                ],
                metrics: [
                  { label: 'Submission Rate', value: '+34%' },
                  { label: 'Parent Engagement', value: '98%' }
                ],
                actionHref: '/student',
                actionText: 'Open Student Portal →'
              })
            }
            className="absolute top-1/3 -left-5 sm:-left-8 z-30 animate-float-fast cursor-pointer"
          >
            <div className="glass-panel-light backdrop-blur-xl bg-white/90 px-3 py-2 rounded-2xl shadow-2xl border border-sky-200/60 flex items-center gap-2.5 max-w-[200px] hover:scale-110 transition-transform">
              <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xs font-bold">assignment_turned_in</span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-900 leading-none">Homework Assigned</p>
                <p className="text-[9px] font-semibold text-slate-600 mt-0.5">Math Ch 5 &middot; Submitted</p>
              </div>
            </div>
          </div>

          {/* 4. Parent Notified */}
          <div
            onClick={() =>
              openFeatureModal({
                title: 'Automated Parent Notification Engine',
                category: 'Communication',
                badge: 'Multi-Channel Alert',
                description: 'Delivers real-time WhatsApp, Push, and SMS alerts for gate arrival, bus transit, homework, and fee reminders.',
                details: [
                  'Multi-channel WhatsApp, Push & SMS routing',
                  'Localized multi-language alerts (Hindi, English)',
                  'Reduces parent call volume by 60%'
                ],
                metrics: [
                  { label: 'Parent Call Reduction', value: '60%' },
                  { label: 'Delivery Rate', value: '99.9%' }
                ],
                actionHref: '/parent',
                actionText: 'Open Parent App →'
              })
            }
            className="absolute top-1/2 -right-4 sm:-right-8 z-30 animate-float-slow cursor-pointer"
          >
            <div className="glass-panel-light backdrop-blur-xl bg-white/90 px-3.5 py-2.5 rounded-2xl shadow-2xl border border-indigo-200/60 flex items-center gap-3 max-w-[210px] hover:scale-110 transition-transform">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">family_restroom</span>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-900 leading-none">Parent Notified</p>
                <p className="text-[9px] font-semibold text-indigo-600 mt-0.5">SMS &amp; Push Delivered</p>
              </div>
            </div>
          </div>

          {/* 5. AI Insight */}
          <div
            onClick={() =>
              openFeatureModal({
                title: 'SchoolGPT Ambient Intelligence',
                category: 'AI Telemetry',
                badge: 'Real-Time AI',
                description: 'Scans student academic, attendance, and emotional telemetry to highlight learning opportunities and early interventions.',
                details: [
                  'Monitors class engagement and attention trends',
                  'Early detection of risk and attendance patterns',
                  'Generates personalized PTM summaries in seconds'
                ],
                metrics: [
                  { label: 'Engagement Peak', value: '+18% Today' },
                  { label: 'Resolution Rate', value: '94%' }
                ],
                actionHref: '/admin',
                actionText: 'Explore SchoolGPT Telemetry →'
              })
            }
            className="absolute bottom-24 left-6 z-30 animate-float-medium cursor-pointer"
          >
            <div className="glass-panel-light backdrop-blur-xl bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3 max-w-[220px] hover:scale-110 transition-transform">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wide">SchoolGPT AI</span>
                </div>
                <p className="text-[10px] font-bold text-white leading-tight">Attention Peak +18% Today</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
