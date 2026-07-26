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

          {/* Right Simulated Parent Notification Visual */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[460px] h-[340px] rounded-[24px] overflow-hidden shadow-xl border border-slate-200/80 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono font-extrabold text-slate-400 uppercase">Parent Notification Stream</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ Verified Safe
                </span>
              </div>

              <div className="relative h-[220px] w-full rounded-2xl overflow-hidden border border-slate-100">
                <Image
                  src="/images/parent_live_bus_map_visual.jpg"
                  alt="Morning Bus Tracking"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
