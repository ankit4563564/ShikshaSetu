'use client';

import React from 'react';
import InteractiveTransitMap from '@/components/shared/InteractiveTransitMap';

export function TransitSection() {
  return (
    <section className="py-section-gap bg-surface-container-low rounded-[3rem] my-12" id="parents">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary-container/20 border border-secondary-container/50 px-4 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-bold">Live Bus &amp; Gate Telemetry</span>
          </div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            The map parents actually want to watch.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
            Live bus GPS locations, gate entry time-stamps, route telemetry, and driver contact — total transparency for every school morning.
          </p>
        </div>

        {/* Dominant Full-Width Interactive Map Showcase (80%+ section width) */}
        <div className="relative w-full rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800">
          <InteractiveTransitMap
            showInfoPanel={true}
            parentPortalHref="/parent"
            nextStopName="Maple Residency"
            etaMins="04"
            driverName="Rakesh Kumar"
            busNumber="Bus 04"
          />
        </div>
      </div>
    </section>
  );
}
