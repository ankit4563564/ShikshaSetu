'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  {
    id: 'ai-layer',
    badge: '✨ AMBIENT AI OPERATING SYSTEM',
    title: 'SchoolGPT Ambient Intelligence Platform',
    description:
      'Decoupled domain context registry, real-time hybrid RAG, 20/20 benchmark scenario evaluation, and instant Cmd+K Spotlight search across attendance, marks, homework, and PTM summaries.',
    image: '/images/schoolgpt_hero_visual.jpg',
    tags: ['Multi-Agent RAG', 'Cmd+K Spotlight', 'Voice Dictation', 'Action Execution Engine'],
  },
  {
    id: 'safety-telemetry',
    badge: '🛡️ LIVE SAFETY & GPS BUS TRACKING',
    title: 'Complete Parent Peace of Mind',
    description:
      'Real-time GPS bus location, live speed telemetry, gate QR scan verifications, and instant parent home-safe confirmations.',
    image: '/images/parent_safety_app.jpg',
    tags: ['Live Bus GPS', 'Gate Checkpoint Pass', 'Parent Portal', 'Speed Alerts'],
  },
  {
    id: 'teacher-workspace',
    badge: '📊 TEACHER SUPPORT RADAR',
    title: 'Focus More on Teaching, Less on Notes',
    description:
      'Automatic student risk detection, term academic growth comparisons, 1-click WhatsApp parent notifications, and automated PTM PDF summary generation.',
    image: '/images/teacher_classroom_ai.jpg',
    tags: ['Student Support Radar', '1-Click PTM PDF', 'WhatsApp Messaging', 'Growth Analytics'],
  },
];

export default function SchoolGPTShowcase() {
  return (
    <section className="relative bg-slate-950 py-24 sm:py-32 text-white overflow-hidden font-body">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-sky-500/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-20 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-extrabold uppercase tracking-widest">
            ⚡ Next-Gen Platform Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Powered by <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400 bg-clip-text text-transparent">SchoolGPT AI</span> &amp; Live Telemetry
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium">
            ShikshaSetu connects school administrators, teachers, parents, and students into one unified intelligent ecosystem.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-16">
          {features.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text Column */}
              <div className={`lg:col-span-6 space-y-6 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <span className="text-[11px] font-mono font-extrabold text-emerald-400 tracking-wider block">
                  {item.badge}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  {item.description}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href="/teacher"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-950 font-extrabold text-xs shadow-md hover:bg-slate-100 transition-all active:scale-95"
                  >
                    <span>Explore Feature Live</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Image Visualizer Column */}
              <div className={`lg:col-span-6 relative h-[260px] sm:h-[360px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
