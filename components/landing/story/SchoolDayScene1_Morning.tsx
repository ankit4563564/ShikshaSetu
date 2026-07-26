'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function SchoolDayScene1_Morning() {
  const steps = [
    { time: '07:15 AM', label: 'Bus Pickup', desc: 'Aarav boards Saket Route #4 bus', icon: '🚌', done: true },
    { time: '07:34 AM', label: 'En Route', desc: 'Driver Ramesh Kumar (28 km/h)', icon: '📍', done: true },
    { time: '08:01 AM', label: 'Gate Checkpoint', desc: 'QR Scanner verifies safe campus entry', icon: '🛡️', done: true },
  ];

  return (
    <section className="w-full bg-[#FAFBFF] py-20 lg:py-28 font-body text-slate-900 overflow-hidden relative">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-12">
        {/* Scene Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-extrabold uppercase tracking-widest">
            SCENE 1 • MORNING 07:15 AM
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            The school day begins <br />
            <span className="text-emerald-600">long before entering the gate.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            From bus boarding to gate verification, parents receive instant updates while school security tracks vehicle telemetry in real time.
          </p>
        </div>

        {/* Scene Interactive Visual Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Timeline Card */}
          <div className="lg:col-span-6 space-y-4">
            {steps.map((st, idx) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="p-5 bg-white border border-slate-200/80 rounded-[24px] shadow-2xs flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-base flex items-center justify-center border border-emerald-100">
                    {st.icon}
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-extrabold text-slate-900">{st.label}</h4>
                    <p className="text-xs text-slate-500 font-medium">{st.desc}</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                  {st.time}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Right Single Smartphone Mockup Displaying Live Parent Notification */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[340px] h-[460px] rounded-[36px] overflow-hidden shadow-2xl border-8 border-slate-900 bg-slate-950 p-4 flex flex-col justify-between">
              {/* Phone Speaker Notch & Status Bar */}
              <div className="flex items-center justify-between px-2 text-[10px] font-mono text-white/70 z-20">
                <span>07:15 AM</span>
                <div className="w-16 h-4 bg-slate-900 rounded-full mx-auto" />
                <span>100% ⚡</span>
              </div>

              {/* Background Live Map Graphic */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/parent_safety_app.jpg"
                  alt="Single Smartphone Live Bus Tracking"
                  fill
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
              </div>

              {/* Live Parent Notification Card Overlay */}
              <div className="relative z-10 my-auto bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-emerald-400/40 text-white space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-extrabold text-emerald-300">Live Parent Push Alert</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Just now</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-display">Aarav Boarded Bus 04</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Saket Pickup Stop #3 &middot; Driver Ramesh Kumar</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Speed: <b className="text-white">28 km/h</b></span>
                  <span className="text-emerald-400 font-bold">ETA: 12 Mins</span>
                </div>
              </div>

              {/* Phone Home Bar */}
              <div className="w-32 h-1 bg-white/40 rounded-full mx-auto z-20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
