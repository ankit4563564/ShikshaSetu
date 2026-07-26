import React from 'react';
import Image from 'next/image';

export function SchoolGPTSection() {
  return (
    <div className="bg-white/95 rounded-[2rem] p-8 md:p-12 ambient-shadow border border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-12 items-center hover:-translate-y-1 transition-transform duration-300">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
          <span className="font-label-sm text-label-sm text-primary">Ambient AI for School Teams</span>
        </div>
        <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">SchoolGPT Ambient Intelligence Platform</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
          Democratize school intelligence with real-time telemetry in one AI layer. Ask anything about students, academics, or school operations.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">check</span> AI Chat Assistant</span>
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">check</span> Real-time Insights</span>
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">check</span> Predictive Analytics</span>
        </div>
        <button type="button" className="mt-6 flex items-center gap-2 font-title-md text-title-md text-primary hover:text-primary-container transition-colors font-bold">
          Explore SchoolGPT <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      <div className="bg-surface-container rounded-2xl h-80 overflow-hidden relative">
        <Image
          src="/images/school_admin_analytics_visual.jpg"
          alt="A clean, modern dashboard interface on a laptop screen showing data visualizations, charts, and an AI chat interface. The aesthetic is corporate modern, light mode, with teal and gold accents."
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
