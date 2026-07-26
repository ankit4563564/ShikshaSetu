import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function AdminOperationsSection() {
  return (
    <div className="rounded-[2.5rem] p-8 md:p-12 bg-white/95 border border-outline-variant/30 ambient-shadow grid grid-cols-1 md:grid-cols-2 gap-12 items-center hover:-translate-y-1 transition-all duration-300">
      {/* Desktop Dashboard Visual */}
      <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 bg-surface-container flex items-center justify-center">
        <Image
          src="/images/school_admin_analytics_visual.jpg"
          alt="A clean modern school administration dashboard showing real-time student attendance and transit metrics."
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        
        {/* Clean, Human Dashboard Card Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-outline-variant/40 text-on-surface shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">domain</span>
            </div>
            <div>
              <p className="text-xs font-bold text-primary font-display">Campus Live Status</p>
              <p className="text-[11px] text-on-surface-variant font-medium">1,420 Students &middot; 42 Buses Active</p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
            ✓ Gate Entry Complete
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 bg-surface-container-high px-3.5 py-1.5 rounded-full border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary text-sm">domain</span>
          <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">For School Leaders &amp; Admin</span>
        </div>

        <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight">
          Complete Campus Visibility in One Place
        </h3>

        <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
          Bring harmony to your school day — live gate entry, bus tracking, daily attendance, and automated parent communication linked in one clean, simple dashboard.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3.5 py-1.5 rounded-full border border-outline-variant/30 font-semibold">
            <span className="material-symbols-outlined text-sm text-primary">sensor_door</span> Gate Safety
          </span>
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3.5 py-1.5 rounded-full border border-outline-variant/30 font-semibold">
            <span className="material-symbols-outlined text-sm text-primary">directions_bus</span> Live Bus Fleet
          </span>
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3.5 py-1.5 rounded-full border border-outline-variant/30 font-semibold">
            <span className="material-symbols-outlined text-sm text-primary">notifications_active</span> Parent Updates
          </span>
        </div>

        <Link href="/admin" className="mt-4 inline-flex items-center gap-2 font-title-md text-title-md text-primary hover:text-primary-container transition-colors font-bold">
          Explore Admin Dashboard <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
