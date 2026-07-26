import React from 'react';
import Image from 'next/image';

export function ParentSection() {
  return (
    <div className="rounded-[2.5rem] p-8 md:p-12 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white/95 border border-amber-200/50 ambient-shadow grid grid-cols-1 md:grid-cols-2 gap-12 items-center hover:-translate-y-1 transition-all duration-300">
      {/* Mobile Phone Mockup Visual */}
      <div className="order-2 md:order-1 relative h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-400/30 bg-slate-950 flex items-center justify-center">
        <Image
          src="/images/parent_safety_app.jpg"
          alt="A close-up of a hand holding a smartphone displaying live school bus tracking map interface."
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        {/* Floating Mobile Status Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-amber-400/40 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold text-amber-300">Bus 04 &middot; Arriving in 4 mins</span>
          </div>
          <span className="text-[10px] font-mono text-white/70">GPS Live</span>
        </div>
      </div>

      {/* Content */}
      <div className="order-1 md:order-2 space-y-6">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 rounded-full">
          <span className="material-symbols-outlined text-amber-700 text-sm">smartphone</span>
          <span className="font-label-sm text-label-sm text-amber-900 font-bold uppercase tracking-wider">Parent Assurance Mobile App</span>
        </div>
        <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
          Complete Parent Peace of Mind
        </h3>
        <p className="font-body-lg text-body-lg text-slate-700 font-medium">
          Instant live bus GPS, gate arrival alerts, class participation, and direct teacher communication — wrapped in a warm, intuitive mobile app.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-amber-950 bg-amber-100/90 px-3 py-1.5 rounded-full border border-amber-300/60 font-semibold">
            <span className="material-symbols-outlined text-sm text-amber-600">directions_bus</span> Live Bus GPS
          </span>
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-amber-950 bg-amber-100/90 px-3 py-1.5 rounded-full border border-amber-300/60 font-semibold">
            <span className="material-symbols-outlined text-sm text-amber-600">door_front</span> Gate Alerts
          </span>
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-amber-950 bg-amber-100/90 px-3 py-1.5 rounded-full border border-amber-300/60 font-semibold">
            <span className="material-symbols-outlined text-sm text-amber-600">notifications_active</span> Instant Updates
          </span>
        </div>
        <button type="button" className="mt-4 flex items-center gap-2 font-title-md text-title-md text-amber-800 hover:text-amber-950 transition-colors font-extrabold">
          Explore Parent App <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
