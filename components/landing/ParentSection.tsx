import React from 'react';
import Image from 'next/image';

export function ParentSection() {
  return (
    <div className="bg-white/95 rounded-[2rem] p-8 md:p-12 ambient-shadow border border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-12 items-center hover:-translate-y-1 transition-transform duration-300">
      <div className="order-2 md:order-1 bg-surface-container rounded-2xl h-80 overflow-hidden relative">
        <Image
          src="/images/parent_safety_app.jpg"
          alt="A close-up of a hand holding a smartphone displaying a map interface with a school bus icon moving along a route. The background is a soft, out-of-focus domestic setting. Light mode UI on the phone."
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="order-1 md:order-2 space-y-6">
        <div className="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-primary text-sm">family_restroom</span>
          <span className="font-label-sm text-label-sm text-primary">Live Safety &amp; Parent Assurance</span>
        </div>
        <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Complete Parent Peace of Mind</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
          Real-time GPS bus location, live gate notifications, attendance, homework and instant parent alerts.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">check</span> Live Bus GPS</span>
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">check</span> Gate Alerts</span>
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">check</span> Instant Updates</span>
        </div>
        <button type="button" className="mt-6 flex items-center gap-2 font-title-md text-title-md text-primary hover:text-primary-container transition-colors font-bold">
          Explore Parent App <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
