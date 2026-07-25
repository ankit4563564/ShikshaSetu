'use client';

import Link from 'next/link';
import Image from 'next/image';
import { m as motion } from 'framer-motion';

export default function PortalGrid() {
  const primaryHeroPortals = [
    {
      href: '/sign-in?role=parent',
      label: 'Primary Hero Experience 1',
      title: '📱 Parent Mobile Application',
      description: 'Rich mobile application for tracking student milestones, academic growth, and live safety (real-time bus tracking with geofence proximity alerts).',
      image: '/priya.png',
      accent: 'border-t-[#6b9080]',
      tagColor: 'text-[#6b9080] bg-[#6b9080]/10 border-[#6b9080]/20',
      emoji: '📱',
    },
    {
      href: '/sign-in?role=teacher',
      label: 'Primary Hero Experience 2',
      title: '💻 Teacher Web Dashboard',
      description: 'Executive web dashboard enabling teachers to monitor holistic classroom health, attendance, student support radar, and academic progress at a glance.',
      image: '/shikshasetu-hero-student.png',
      accent: 'border-t-[#e8a33d]',
      tagColor: 'text-[#e8a33d] bg-[#e8a33d]/10 border-[#e8a33d]/20',
      emoji: '💻',
    },
  ];

  const operationalModules = [
    {
      href: '/sign-in?role=gate',
      label: 'Operational Module',
      title: '🛡️ Gate Operations Engine',
      description: 'Dynamic QR scanner & gate pass verification engine feeding arrival events directly into Teacher Roster & Parent Timeline.',
      image: '/kabir.png',
      accent: 'border-t-[#c06c5c]',
      tagColor: 'text-[#c06c5c] bg-[#c06c5c]/10 border-[#c06c5c]/20',
      emoji: '🛡️',
    },
    {
      href: '/sign-in?role=driver',
      label: 'Operational Module',
      title: '🚌 Transport Operations Engine',
      description: 'GPS telemetry & conductor hands-free boarding console broadcasting live vehicle position & proximity alerts.',
      image: '/rohan.png',
      accent: 'border-t-[#1f4e5f]',
      tagColor: 'text-[#1f4e5f] bg-[#1f4e5f]/10 border-[#1f4e5f]/20',
      emoji: '🚌',
    },
    {
      href: '/sign-in?role=student',
      label: 'Operational Module',
      title: '🎒 Student Companion Module',
      description: 'School Mitra Socratic AI, Student Growth Journal, and confidential counselor check-in interface.',
      image: '/aarav.png',
      accent: 'border-t-[#1f4e5f]',
      tagColor: 'text-[#1f4e5f] bg-[#1f4e5f]/10 border-[#1f4e5f]/20',
      emoji: '🎒',
    },
    {
      href: '/sign-in?role=admin',
      label: 'Operational Module',
      title: '🏫 School Administration Engine',
      description: 'Care Analytics™, school climate metrics, and operational control feeding executive insights to leadership.',
      image: '/shikshasetu_banner.png',
      accent: 'border-t-[#c06c5c]',
      tagColor: 'text-[#c06c5c] bg-[#c06c5c]/10 border-[#c06c5c]/20',
      emoji: '🏫',
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as any,
    },
  };

  return (
    <section id="demo-section" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28 scroll-mt-24">
      <div className="relative rounded-[36px] bg-white/60 border border-white/80 p-8 md:p-14 shadow-[0_20px_60px_rgba(31,78,95,0.04)] backdrop-blur-xl overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#e8a33d]/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1f4e5f]/10 pb-10 relative z-10"
        >
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1f4e5f]/50">
              CONNECTED SCHOOL OPERATING SYSTEM
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1f4e5f] leading-tight tracking-tight">
              Dual-Portal Hero Experience. <span className="text-[#1f4e5f]/60">Powered by Operational Telemetry.</span>
            </h2>
          </div>
          <p className="max-w-xs text-xs font-semibold leading-relaxed text-[#1f4e5f]/70">
            ShikshaSetu unifies Parent & Teacher flagship applications, continuously fed by background operational engines.
          </p>
        </motion.div>

        {/* 🌟 1. PRIMARY DUAL-PORTAL HERO EXPERIENCES (2 LARGE CARDS) */}
        <div className="mt-10 relative z-10 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <span>⭐</span> Primary Flagship Experiences (Dual-Portal)
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* 📱 CARD 1: PARENT MOBILE APPLICATION VISUAL UI */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Link
                href="/sign-in?role=parent"
                className="group flex flex-col h-full rounded-3xl border border-[#1f4e5f]/20 border-t-4 border-t-[#6b9080] bg-white/95 overflow-hidden shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl"
              >
                {/* Visual UI Preview Box */}
                <div className="relative h-56 w-full bg-slate-900 border-b border-[#1f4e5f]/10 p-4 overflow-hidden flex flex-col justify-between select-none">
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Header Bar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-display text-[11px] font-extrabold text-white">Aarav Sharma &middot; Class 8A</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase">
                      ✓ Verified Safe (98%)
                    </span>
                  </div>

                  {/* Live Bus Widget UI */}
                  <div className="relative z-10 p-3 bg-slate-800/90 border border-slate-700 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <span>🚌</span> Live Bus #4 &middot; Ramesh Kumar
                      </span>
                      <span className="font-mono text-[9px] font-bold text-sky-400">ETA 5 mins</span>
                    </div>
                    <p className="font-display text-xs font-bold text-white">Passing Hauz Khas Junction &rarr; En Route Home</p>
                  </div>

                  {/* Journey Feed Preview */}
                  <div className="relative z-10 space-y-1 pt-1 border-t border-slate-800 text-[10px] font-medium text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="text-emerald-400">✓</span> 08:18 AM Gate #2 QR Verified
                    </span>
                    <span className="text-slate-400 font-mono">100% ID Match</span>
                  </div>
                </div>

                <div className="p-7 flex-1 flex flex-col space-y-3">
                  <span className="self-start inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border text-[#6b9080] bg-[#6b9080]/10 border-[#6b9080]/20">
                    Primary Hero Experience 1
                  </span>
                  <h3 className="text-xl font-black text-[#1f4e5f] group-hover:text-primary transition-colors duration-200">
                    📱 Parent Mobile Application
                  </h3>
                  <p className="text-xs font-medium text-[#1f4e5f]/80 leading-relaxed flex-1">
                    Rich mobile application for tracking student milestones, academic growth, and live safety (real-time bus tracking with geofence proximity alerts).
                  </p>
                  <div className="pt-3 flex items-center text-xs font-black text-primary group-hover:translate-x-1 transition-transform duration-200">
                    Launch Hero Experience →
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* 💻 CARD 2: TEACHER WEB DASHBOARD VISUAL UI */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Link
                href="/sign-in?role=teacher"
                className="group flex flex-col h-full rounded-3xl border border-[#1f4e5f]/20 border-t-4 border-t-[#e8a33d] bg-white/95 overflow-hidden shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl"
              >
                {/* Visual UI Preview Box */}
                <div className="relative h-56 w-full bg-slate-900 border-b border-[#1f4e5f]/10 p-4 overflow-hidden flex flex-col justify-between select-none">
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e8a33d_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Header Bar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className="font-display text-[11px] font-extrabold text-white">Ms. Ananya Mehra</span>
                      <p className="text-[9px] text-slate-400 font-medium">Class 8A &middot; Math &amp; Science</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                      ✅ 1-Tap Roll Call (14/14)
                    </span>
                  </div>

                  {/* Student Support Radar Chips */}
                  <div className="relative z-10 grid grid-cols-3 gap-1.5">
                    <div className="p-2 bg-slate-800/90 border border-slate-700 rounded-lg text-center">
                      <span className="text-[9px] text-slate-400 font-bold block">On Track</span>
                      <strong className="text-xs font-black text-emerald-400">12</strong>
                    </div>
                    <div className="p-2 bg-slate-800/90 border border-slate-700 rounded-lg text-center">
                      <span className="text-[9px] text-slate-400 font-bold block">Worth Watching</span>
                      <strong className="text-xs font-black text-amber-400">2</strong>
                    </div>
                    <div className="p-2 bg-slate-800/90 border border-slate-700 rounded-lg text-center">
                      <span className="text-[9px] text-slate-400 font-bold block">Attention</span>
                      <strong className="text-xs font-black text-rose-400">0</strong>
                    </div>
                  </div>

                  {/* Class Roster Preview */}
                  <div className="relative z-10 space-y-1 pt-1 border-t border-slate-800 text-[10px] font-medium text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold text-slate-200">
                      <span>👤</span> Aarav Sharma (92% Math Quiz)
                    </span>
                    <span className="text-emerald-400 font-bold">Class Participation: High</span>
                  </div>
                </div>

                <div className="p-7 flex-1 flex flex-col space-y-3">
                  <span className="self-start inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border text-[#e8a33d] bg-[#e8a33d]/10 border-[#e8a33d]/20">
                    Primary Hero Experience 2
                  </span>
                  <h3 className="text-xl font-black text-[#1f4e5f] group-hover:text-primary transition-colors duration-200">
                    💻 Teacher Web Dashboard
                  </h3>
                  <p className="text-xs font-medium text-[#1f4e5f]/80 leading-relaxed flex-1">
                    Executive web dashboard enabling teachers to monitor holistic classroom health, attendance, student support radar, and academic progress at a glance.
                  </p>
                  <div className="pt-3 flex items-center text-xs font-black text-primary group-hover:translate-x-1 transition-transform duration-200">
                    Launch Hero Experience →
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* 📐 2. ECOSYSTEM ARCHITECTURE VISUALIZATION DIAGRAM */}
        <div className="my-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/5 via-sage/10 to-primary/5 border border-primary/20 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest">
            📐 3-Layer System Architecture
          </div>
          <h4 className="text-lg font-black text-ink">How shikshasetu Powers the School Ecosystem</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left text-xs pt-2">
            <div className="p-4 rounded-2xl bg-white border border-primary/20 shadow-xs space-y-1">
              <strong className="text-primary font-black block">1. Flagship Dual-Portal UX</strong>
              <p className="text-muted/80 text-[11px]">📱 Parent Mobile App & 💻 Teacher Web Dashboard experience.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-sage/30 shadow-xs space-y-1">
              <strong className="text-sage font-black block">2. Intelligence Layer</strong>
              <p className="text-muted/80 text-[11px]">Guardian Journey™, Student Pulse™, Care Journey™ & SchoolGPT™.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-amber-500/20 shadow-xs space-y-1">
              <strong className="text-amber-800 font-black block">3. Operational Modules</strong>
              <p className="text-muted/80 text-[11px]">Gate, Transport, Attendance & Admin telemetry feeding live data.</p>
            </div>
          </div>
        </div>

        {/* ⚡ 3. CONNECTED OPERATIONAL MODULES (SECONDARY DATA ENGINES) */}
        <div className="space-y-4 relative z-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted/70 flex items-center gap-2">
            <span>⚡</span> Connected Operational Modules (Background Data Engines)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {operationalModules.map((portal) => (
              <motion.div
                key={portal.href}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Link
                  href={portal.href}
                  className={`group flex flex-col h-full rounded-2xl border border-[#1f4e5f]/10 ${portal.accent} border-t-4 bg-white/80 overflow-hidden shadow-xs backdrop-blur-md transition-all duration-200 hover:shadow-md`}
                >
                  <div className="p-5 flex-1 flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{portal.emoji}</span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted/60 bg-deep-teal/5 px-2 py-0.5 rounded-full">
                        {portal.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[#1f4e5f] group-hover:text-primary transition-colors">
                      {portal.title}
                    </h4>
                    <p className="text-[11px] font-medium text-muted/75 leading-relaxed flex-1">
                      {portal.description}
                    </p>
                    <div className="pt-2 flex items-center text-[11px] font-bold text-deep-teal/70 group-hover:text-primary">
                      Open Module →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
