'use client';

import { m as motion } from 'framer-motion';

const students = [
  {
    initials: 'AS',
    name: 'Aarav Sharma',
    grade: 'Grade 8A',
    status: 'ON TRACK',
    statusColor: 'text-[#6b9080]',
    statusBg: 'bg-[#6b9080]/8 border-[#6b9080]/20',
    avatarBg: 'bg-[#6b9080]/15 text-[#6b9080]',
    dot: 'bg-[#6b9080]',
  },
  {
    initials: 'PP',
    name: 'Priya Patel',
    grade: 'Grade 8A',
    status: 'WATCHING',
    statusColor: 'text-[#e8a33d]',
    statusBg: 'bg-[#e8a33d]/8 border-[#e8a33d]/20',
    avatarBg: 'bg-[#e8a33d]/15 text-[#e8a33d]',
    dot: 'bg-[#e8a33d]',
  },
  {
    initials: 'RK',
    name: 'Rohan Kumar',
    grade: 'Grade 8A',
    status: 'ATTENTION',
    statusColor: 'text-[#c06c5c]',
    statusBg: 'bg-[#c06c5c]/8 border-[#c06c5c]/20',
    avatarBg: 'bg-[#c06c5c]/15 text-[#c06c5c]',
    dot: 'bg-[#c06c5c]',
  },
];

export default function TeacherShowcase() {
  return (
    <section id="teacher-showcase" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      {/* Outer wrapper */}
      <div className="relative rounded-[36px] border border-[#1f4e5f]/10 bg-gradient-to-br from-white via-[#fbf8f3] to-[#f4f9f7] p-8 md:p-14 shadow-[0_20px_60px_rgba(31,78,95,0.05)] overflow-hidden">
        
        {/* Ambient background glows */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#6b9080]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#e8a33d]/8 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 grid gap-6 md:grid-cols-12 items-end border-b border-[#1f4e5f]/10 pb-10">
          <div className="md:col-span-7 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1f4e5f]/50">
              TEACHER WORKSPACE
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1f4e5f] leading-tight tracking-tight">
              One glance for the teacher.{' '}
              <span className="text-[#6b9080]">Confidence</span>{' '}
              for the parent.
            </h2>
          </div>
          <div className="md:col-span-5 md:flex md:justify-end">
            <p className="max-w-[280px] text-xs font-medium leading-relaxed text-[#1f4e5f]/70">
              Live parent updates mean teachers spend less time on status notes and more time doing what matters — teaching.
            </p>
          </div>
        </div>

        {/* Mockup Row */}
        <div className="relative z-10 mt-14 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

          {/* ─── Teacher Roster Tablet ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[460px] rounded-[28px] border border-[#1f4e5f]/10 bg-white/80 backdrop-blur-md shadow-[0_20px_50px_rgba(31,78,95,0.06)] overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f4e5f]/8 bg-[#1f4e5f]/[0.02]">
              <div>
                <h4 className="text-sm font-extrabold text-[#1f4e5f] tracking-tight">Class 8A Status</h4>
                <p className="text-[9px] text-[#1f4e5f]/50 font-black uppercase tracking-widest mt-0.5">MS. ANANYA MEHRA</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6b9080] animate-pulse" />
                <span className="text-[9px] font-bold text-[#6b9080] uppercase tracking-wider">LIVE</span>
              </div>
            </div>

            {/* Student Rows */}
            <div className="p-5 space-y-3">
              {students.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#1f4e5f]/[0.06] shadow-[0_4px_12px_rgba(31,78,95,0.03)] hover:shadow-[0_6px_18px_rgba(31,78,95,0.07)] transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Avatar */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-extrabold ${s.avatarBg}`}>
                      {s.initials}
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-[#1f4e5f] tracking-tight">{s.name}</h5>
                      <p className="text-[9px] text-[#1f4e5f]/50 font-bold mt-0.5 uppercase tracking-wider">{s.grade}</p>
                    </div>
                  </div>
                  {/* Status Pill */}
                  <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider ${s.statusColor} ${s.statusBg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.status}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Footer Bar */}
            <div className="px-5 py-3 border-t border-[#1f4e5f]/8 bg-[#1f4e5f]/[0.02] flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#1f4e5f]/40 uppercase tracking-widest">32 students · 3 flagged</span>
              <span className="text-[9px] font-bold text-[#6b9080]">Updated just now</span>
            </div>
          </motion.div>

          {/* ─── Bus Tracking Phone ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[240px] flex-shrink-0"
          >
            {/* Phone frame */}
            <div className="rounded-[36px] border-[10px] border-[#1f4e5f] bg-[#1f4e5f] shadow-[0_30px_60px_rgba(31,78,95,0.3)]">
              {/* Dynamic island */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-[18px] w-[70px] bg-black rounded-full" />
              </div>

              {/* Screen */}
              <div className="rounded-[28px] bg-white overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#1f4e5f]">
                  <span className="text-[9px] font-bold text-white/80">9:41</span>
                  <span className="text-[9px] font-bold text-white/80">●●●</span>
                </div>

                <div className="p-4 space-y-3">
                  {/* Boarded card */}
                  <div className="rounded-2xl border border-[#6b9080]/20 bg-[#6b9080]/8 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6b9080] animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#6b9080]">BOARDED</span>
                    </div>
                    <h5 className="text-xs font-extrabold text-[#1f4e5f] leading-tight">Rohan is on the bus</h5>
                    <p className="text-[9px] text-[#1f4e5f]/60 font-medium">Boarding event recorded · route visible</p>
                  </div>

                  {/* Route details card */}
                  <div className="rounded-2xl border border-[#1f4e5f]/10 bg-white p-3.5 space-y-2.5 shadow-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-[#1f4e5f]/8">
                      <span className="text-[9px] font-bold text-[#1f4e5f]/50 uppercase tracking-wider">Next Stop</span>
                      <span className="text-[9px] font-extrabold text-[#1f4e5f]">Lodhi Gardens</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#1f4e5f]/8">
                      <span className="text-[9px] font-bold text-[#1f4e5f]/50 uppercase tracking-wider">Speed</span>
                      <span className="text-[9px] font-extrabold text-[#e8a33d]">22 km/h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-[#1f4e5f]/50 uppercase tracking-wider">ETA School</span>
                      <span className="text-[9px] font-extrabold text-[#6b9080]">8:05 AM</span>
                    </div>
                  </div>

                  {/* Pulsing map bar */}
                  <div className="rounded-2xl bg-[#1f4e5f] p-3 flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="h-6 w-6 rounded-full bg-[#e8a33d] flex items-center justify-center text-[10px] flex-shrink-0"
                    >
                      🚌
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: '0%' }}
                          whileInView={{ width: '68%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className="h-full bg-[#e8a33d] rounded-full"
                        />
                      </div>
                      <p className="text-[8px] font-bold text-white/60 mt-1">Route 4B · 68% complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
