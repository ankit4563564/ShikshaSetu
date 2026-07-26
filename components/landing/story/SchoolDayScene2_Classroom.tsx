'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function SchoolDayScene2_Classroom() {
  return (
    <section className="w-full bg-[#F5F8FF] py-20 lg:py-28 font-body text-slate-900 overflow-hidden relative">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-12">
        {/* Scene Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-extrabold uppercase tracking-widest">
            SCENE 2 • SCHOOL 09:00 AM
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Classroom focus. <br />
            <span className="text-blue-600">Zero time wasted on manual roll call.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Ms. Priya Sharma opens her Class 8A dashboard. Attendance is automatically synchronized from gate entry, allowing her to start teaching instantly.
          </p>
        </div>

        {/* Scene Interactive Visual Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Teacher Dashboard Visual */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[480px] h-[350px] rounded-[24px] overflow-hidden shadow-xl border border-slate-200/80 bg-white">
              <Image
                src="/images/teacher_classroom_ai.jpg"
                alt="Teacher Classroom Dashboard"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Workflow Stream */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 bg-white border border-slate-200/80 rounded-[24px] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-extrabold text-slate-900">Class 8A Roster</h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  36/38 Present (96%)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                2 students absent (fever notice submitted by parents via app).
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200/80 rounded-[24px] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-extrabold text-slate-900">Assignment Created</h4>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Physics Lab #3
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Due Today at 4:00 PM • Automatically notified to all 38 parents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
