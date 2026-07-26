'use client';

import { SectionWrapper, SectionHeading } from './Primitives';

export function ConnectedEcosystemV4() {
  const nodes = [
    { label: 'Parents', icon: '👨‍👩‍👦', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Students', icon: '🎒', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Teachers', icon: '👩‍🏫', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'SchoolGPT', icon: '🤖', color: 'bg-indigo-600 text-white border-indigo-400 shadow-md font-black' },
    { label: 'Transport', icon: '🚌', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { label: 'Administration', icon: '🏫', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Attendance', icon: '📊', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  return (
    <SectionWrapper bg="bg-[#FAFBFF]">
      <div className="space-y-16">
        <SectionHeading
          eyebrow="CONNECTED TOGETHER"
          title="Everything you need."
          highlight="All in one place."
          subtitle="Everything connects automatically: Gate entry, bus updates, attendance, marks, and parent messages."
        />

        {/* Connected Ecosystem Animated Nodes Diagram */}
        <div className="p-8 sm:p-12 bg-white border border-slate-200/80 rounded-[24px] shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 items-center relative z-10">
            {nodes.map((n) => (
              <div
                key={n.label}
                className={`p-4 rounded-[24px] border text-center space-y-2 hover:scale-105 transition-transform duration-300 shadow-2xs ${n.color}`}
              >
                <div className="text-2xl">{n.icon}</div>
                <h4 className="font-display text-xs font-extrabold">{n.label}</h4>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-200/70 rounded-2xl text-center text-xs text-slate-500 font-medium">
            ⚡ Instant updates: Gate entry &rarr; Teacher class list &rarr; Parent app notification &rarr; SchoolGPT.
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
