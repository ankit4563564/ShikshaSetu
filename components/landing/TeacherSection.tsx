import React from 'react';
import Image from 'next/image';

export function TeacherSection() {
  return (
    <div className="rounded-[2.5rem] p-8 md:p-12 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-white/95 border border-teal-200/50 ambient-shadow grid grid-cols-1 md:grid-cols-2 gap-12 items-center hover:-translate-y-1 transition-all duration-300">
      {/* Content */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 px-3.5 py-1 rounded-full">
          <span className="material-symbols-outlined text-teal-700 text-sm">laptop_mac</span>
          <span className="font-label-sm text-label-sm text-teal-900 font-bold uppercase tracking-wider">Teacher Workstation &amp; AI Assistant</span>
        </div>
        <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
          Focus More on Teaching, Less on Notes
        </h3>
        <p className="font-body-lg text-body-lg text-slate-700 font-medium">
          Generate interactive lesson plans in seconds, track student classroom mood, and automate grading with AI tools tailored for CBSE and ICSE curriculums.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-teal-950 bg-teal-100/90 px-3 py-1.5 rounded-full border border-teal-300/60 font-semibold">
            <span className="material-symbols-outlined text-sm text-teal-600">auto_awesome</span> Lesson Generator
          </span>
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-teal-950 bg-teal-100/90 px-3 py-1.5 rounded-full border border-teal-300/60 font-semibold">
            <span className="material-symbols-outlined text-sm text-teal-600">calendar_today</span> Class Planner
          </span>
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-teal-950 bg-teal-100/90 px-3 py-1.5 rounded-full border border-teal-300/60 font-semibold">
            <span className="material-symbols-outlined text-sm text-teal-600">psychology</span> Student Insights
          </span>
        </div>
        <button type="button" className="mt-4 flex items-center gap-2 font-title-md text-title-md text-teal-800 hover:text-teal-950 transition-colors font-extrabold">
          Explore Teacher Workstation <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      {/* Laptop Dashboard Visual */}
      <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-teal-400/30 bg-slate-950 flex items-center justify-center">
        <Image
          src="/images/teacher_classroom_ai.jpg"
          alt="A modern Indian classroom setting with teacher using digital tablet and laptop dashboard."
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        {/* Floating Laptop Widget Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-teal-400/40 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">auto_stories</span>
            </div>
            <div>
              <p className="text-xs font-bold text-teal-300">Physics Chapter 4 Quiz Generated</p>
              <p className="text-[9px] text-slate-300">Saved 45 mins of preparation</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30">1-Click</span>
        </div>
      </div>
    </div>
  );
}
