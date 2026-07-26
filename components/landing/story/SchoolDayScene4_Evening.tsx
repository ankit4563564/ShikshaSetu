'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function SchoolDayScene4_Evening() {
  return (
    <section className="w-full bg-[#F4FBF7] py-20 lg:py-28 font-body text-slate-900 overflow-hidden relative">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-12">
        {/* Scene Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-extrabold uppercase tracking-widest">
            SCENE 4 • EVENING 03:45 PM
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Safe return home. <br />
            <span className="text-emerald-600">Complete daily clarity for parents.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            As bus KL-05-AB-1234 departs school, parents review the daily learning summary on their mobile app and receive live arrival notifications as their child arrives home.
          </p>
        </div>

        {/* Scene Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Summary Card */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 bg-white border border-slate-200/80 rounded-[24px] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-extrabold text-slate-900">Daily Learning Summary</h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Ready in App
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                <li>• <strong>Attendance:</strong> Present in all 6 class periods.</li>
                <li>• <strong>Homework:</strong> Physics Lab #3 due tomorrow.</li>
                <li>• <strong>Teacher Note:</strong> Great participation in Science discussion.</li>
              </ul>
            </div>

            <div className="p-6 bg-white border border-slate-200/80 rounded-[24px] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-extrabold text-slate-900">Home Safe Confirmation</h4>
                <span className="text-xs font-mono font-bold text-slate-500">04:12 PM</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Aarav deboarded at Stop #4 (Nehru Nagar). Conductor verified safe arrival.
              </p>
            </div>
          </div>

          {/* Right Phone Visual */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[440px] h-[360px] rounded-[24px] overflow-hidden shadow-xl border border-slate-200/80 bg-white">
              <Image
                src="/images/parent_safety_app.jpg"
                alt="Parent evening summary app"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
