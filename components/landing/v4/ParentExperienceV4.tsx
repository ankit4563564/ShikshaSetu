'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SectionWrapper, Button } from './Primitives';

export function ParentExperienceV4() {
  const chips = [
    { label: 'Live Bus GPS', icon: '🚌' },
    { label: 'Attendance Check', icon: '✅' },
    { label: 'Homework Status', icon: '📝' },
    { label: 'Teacher Updates', icon: '💬' },
    { label: 'Gate Arrival Pass', icon: '🛡️' },
  ];

  return (
    <SectionWrapper bg="bg-[#FAFBFF]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-extrabold uppercase tracking-widest">
            🛡️ PARENT EXPERIENCE
          </span>

          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Complete peace of mind <br />
            <span className="text-emerald-600">for every parent.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-lg">
            Real-time GPS bus location, live gate arrival alerts, class homework tracking, and automated parent notifications — linked in real time.
          </p>

          {/* Feature Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1.5"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </span>
            ))}
          </div>

          <div className="pt-4">
            <Button href="/parent" variant="primary">Experience Parent App &rarr;</Button>
          </div>
        </div>

        {/* Right Column: Phone Mockup Visual */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="relative w-full max-w-[440px] h-[400px] rounded-[24px] overflow-hidden shadow-xl border border-slate-200/80 bg-white">
            <Image
              src="/images/parent_live_bus_map_visual.jpg"
              alt="Parent app live bus tracking"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
