'use client';

import Image from 'next/image';

export function SchoolDayScene5_Outcomes() {
  const stories = [
    {
      metric: '📉 63% Less Inquiries',
      quote: 'ShikshaSetu gives me complete peace of mind. I always know Aarav is safe and what is happening in school.',
      author: 'Priya Sharma',
      role: 'Parent',
      image: '/aarav.png',
      border: 'border-emerald-200',
    },
    {
      metric: '⏱️ 8 Hrs/Wk Saved',
      quote: 'The AI insights and automated tools save me hours every week. I focus on teaching instead of paperwork.',
      author: 'Ritika Verma',
      role: 'Teacher',
      image: '/ananya.png',
      border: 'border-blue-200',
    },
    {
      metric: '🛡️ 100% Verified',
      quote: 'Finally, a platform that connects gate entry, bus tracking, academics, and parent communication seamlessly.',
      author: 'Sandeep Malhotra',
      role: 'Principal',
      image: '/kabir.png',
      border: 'border-purple-200',
    },
  ];

  return (
    <section className="w-full bg-[#FFFFFF] py-20 lg:py-28 font-body text-slate-900 overflow-hidden relative border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-16">
        {/* Scene Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-extrabold uppercase tracking-widest">
            SCENE 5 • MEASURABLE OUTCOMES
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Real results across <br />
            <span className="text-blue-600">the whole school ecosystem.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Proven transformation for parents, teachers, and school leadership.
          </p>
        </div>

        {/* 3 Outcome Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((s) => (
            <div
              key={s.author}
              className={`p-8 bg-white border ${s.border} rounded-[24px] shadow-2xs hover:shadow-md transition-all space-y-6 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-extrabold">
                  {s.metric}
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                  &ldquo;{s.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <Image src={s.image} alt={s.author} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-display text-xs font-black text-slate-900">{s.author}</h4>
                  <p className="text-[10px] text-slate-500 font-bold">{s.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
