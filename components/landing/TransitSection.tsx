import React from 'react';
import Link from 'next/link';

export function TransitSection() {
  return (
    <section className="py-section-gap bg-surface-container-low rounded-t-[3rem]" id="parents">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-bold">Live Tracking</span>
            </div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              The map parents actually want to watch.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface font-medium">
              Live bus locations, safe arrivals, instant updates — total transparency.
            </p>
            <div className="flex gap-4 pt-4">
              <button type="button" className="border border-outline text-on-surface px-6 py-2 rounded-full font-title-md text-title-md hover:bg-surface-container transition-colors flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-sm">play_circle</span> How it works
              </button>
            </div>
          </div>
          <div className="lg:col-span-8 relative">
            {/* Complex Map UI Simulation */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-outline-variant/30 h-[500px]">
              {/* Map Area */}
              <div className="w-full md:w-3/5 h-full relative bg-[#e5e5e5] flex items-center justify-center overflow-hidden" data-location="Suburban Map">
                {/* Abstract Map Background (CSS Pattern) */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#00272c 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {/* SVG Route Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 500">
                  <path className="opacity-30" d="M 50,450 Q 150,300 250,250 T 450,50" fill="none" stroke="#00272c" strokeDasharray="8 8" strokeWidth="4" />
                  <path className="route-line" d="M 50,450 Q 150,300 250,250 T 450,50" fill="none" stroke="#fcba52" strokeWidth="4" />
                </svg>
                {/* Map Pins */}
                <div className="absolute bottom-10 left-10 flex flex-col items-center">
                  <div className="bg-white p-1 rounded-full shadow-md z-10"><div className="w-4 h-4 bg-primary rounded-full" /></div>
                  <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold mt-1 shadow-sm text-on-surface">Home</span>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                  <div className="bg-secondary-container p-2 rounded-full shadow-lg animate-bounce">
                    <span className="material-symbols-outlined text-on-secondary-container text-sm">directions_bus</span>
                  </div>
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mt-2 shadow-md text-on-surface">Bus 04 - Live</span>
                </div>
                <div className="absolute top-10 right-10 flex flex-col items-center">
                  <div className="bg-white p-1 rounded-full shadow-md z-10"><div className="w-4 h-4 bg-primary-container rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[10px] text-white">school</span></div></div>
                  <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold mt-1 shadow-sm text-on-surface">School</span>
                </div>
              </div>
              {/* Sidebar Data */}
              <div className="w-full md:w-2/5 h-full bg-primary text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                {/* Abstract decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <div>
                  <p className="font-label-sm text-label-sm text-white/70 uppercase mb-1 font-bold">Next Stop</p>
                  <div className="flex justify-between items-start">
                    <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-white leading-tight">Maple<br />Residency</h4>
                    <div className="bg-secondary-container text-on-secondary-container px-3 py-2 rounded-xl text-center">
                      <span className="block font-bold text-xl leading-none">04</span>
                      <span className="block text-[8px] font-bold uppercase tracking-wider mt-1">Min ETA</span>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                      <span className="text-white/80 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400" /> Status</span>
                      <span className="font-bold text-green-400">On Route</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                      <span className="text-white/80">Current speed</span>
                      <span className="font-bold">28 km/h</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                      <span className="text-white/80">Last GPS ping</span>
                      <span className="font-bold">6 sec ago</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                      <span className="text-white/80">Guardian notified</span>
                      <span className="font-bold text-white">✓ 2:43 PM</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center text-white font-bold text-sm">RK</div>
                    <div>
                      <p className="font-bold text-sm leading-tight text-white">Rakesh Kumar</p>
                      <p className="text-[10px] text-white/80 font-medium">Safe driver · ★ 4.9</p>
                    </div>
                  </div>
                  <Link href="/parent-portal" className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white py-3 rounded-full font-title-md text-sm transition-colors flex items-center justify-center gap-2 font-bold">
                    Open Parent Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
