'use client';

import Image from 'next/image';
import { SectionWrapper, SectionHeading } from './Primitives';

export function TestimonialsV4() {
  const stories = [
    {
      quote: "ShikshaSetu gives me complete peace of mind. I always know Aarav is safe and what's happening in school.",
      author: 'Priya Sharma',
      role: 'Parent',
      image: '/aarav.png',
      border: 'border-emerald-200',
    },
    {
      quote: 'The dashboard, AI insights and classroom tools save me hours every day. I can focus on teaching better.',
      author: 'Ritika Verma',
      role: 'Teacher',
      image: '/ananya.png',
      border: 'border-blue-200',
    },
    {
      quote: 'Finally, a platform that connects every part of school operations seamlessly. Highly recommended.',
      author: 'Sandeep Malhotra',
      role: 'Principal',
      image: '/kabir.png',
      border: 'border-purple-200',
    },
  ];

  return (
    <SectionWrapper bg="bg-[#FAFBFF]">
      <div className="space-y-16">
        <SectionHeading
          eyebrow="LOVED BY PARENTS, TEACHERS &amp; PRINCIPALS"
          title="Real people."
          highlight="Real experiences."
          subtitle="Hear from parents, teachers, and school leaders whose daily lives have been transformed."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((s) => (
            <div
              key={s.author}
              className={`p-8 bg-white border ${s.border} rounded-[24px] shadow-2xs hover:shadow-xs transition-all space-y-6 flex flex-col justify-between`}
            >
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                &ldquo;{s.quote}&rdquo;
              </p>

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
    </SectionWrapper>
  );
}
