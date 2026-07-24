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
            {primaryHeroPortals.map((portal) => (
              <motion.div
                key={portal.href}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Link
                  href={portal.href}
                  className={`group flex flex-col h-full rounded-3xl border border-[#1f4e5f]/20 ${portal.accent} border-t-4 bg-white/95 overflow-hidden shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl`}
                >
                  <div className="relative h-52 w-full border-b border-[#1f4e5f]/5 bg-[#1f4e5f]/5 overflow-hidden">
                    <Image
                      src={portal.image}
                      alt={`${portal.title} - ${portal.description.substring(0, 100)}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-2xl shadow-lg backdrop-blur-md">
                      {portal.emoji}
                    </div>
                  </div>

                  <div className="p-7 flex-1 flex flex-col space-y-3">
                    <span className={`self-start inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${portal.tagColor}`}>
                      {portal.label}
                    </span>
                    <h3 className="text-xl font-black text-[#1f4e5f] group-hover:text-primary transition-colors duration-200">
                      {portal.title}
                    </h3>
                    <p className="text-xs font-medium text-[#1f4e5f]/80 leading-relaxed flex-1">
                      {portal.description}
                    </p>
                    <div className="pt-3 flex items-center text-xs font-black text-primary group-hover:translate-x-1 transition-transform duration-200">
                      Launch Hero Experience →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
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
