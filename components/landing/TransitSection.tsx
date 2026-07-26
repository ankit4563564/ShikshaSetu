'use client';

import React from 'react';
import InteractiveTransitMap from '@/components/shared/InteractiveTransitMap';

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
      </div>
    </section>
  );
}
