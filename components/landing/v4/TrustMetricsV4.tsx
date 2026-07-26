'use client';

import { SectionWrapper } from './Primitives';

export function TrustMetricsV4() {
  const metrics = [
    { value: '500+', label: 'Schools onboard', icon: '🏫', color: 'bg-blue-50 text-blue-700' },
    { value: '1M+', label: 'Students connected', icon: '👥', color: 'bg-emerald-50 text-emerald-700' },
    { value: '10M+', label: 'Daily interactions', icon: '📈', color: 'bg-purple-50 text-purple-700' },
    { value: '99.9%', label: 'System uptime', icon: '🛡️', color: 'bg-sky-50 text-sky-700' },
    { value: '24/7', label: 'Support', icon: '🎧', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <SectionWrapper bg="bg-[#FAFBFF]" className="py-10">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="p-5 bg-white border border-slate-200/80 rounded-[24px] shadow-2xs hover:shadow-xs transition-all space-y-2 text-center"
          >
            <div className={`w-9 h-9 mx-auto rounded-2xl ${m.color} flex items-center justify-center text-sm font-black`}>
              {m.icon}
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900">{m.value}</h3>
              <p className="text-[11px] font-medium text-slate-500">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
