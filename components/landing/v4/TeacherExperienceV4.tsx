'use client';

import Image from 'next/image';
import { SectionWrapper, Button } from './Primitives';

export function TeacherExperienceV4() {
  const teacherTools = [
    'Holistic Class Health Radar',
    'Automated Lesson Plan Generator',
    'Student Risk Detection Engine',
    '1-Click WhatsApp Parent Notifications',
    'Automated PTM Summary PDF Builder',
  ];

  return (
    <SectionWrapper bg="bg-[#F5F8FF]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Visual Column */}
        <div className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center">
          <div className="relative w-full max-w-[480px] h-[380px] rounded-[24px] overflow-hidden shadow-xl border border-slate-200/80 bg-white">
            <Image
              src="/images/schoolgpt_hero_visual.jpg"
              alt="Teacher Web Dashboard Analytics"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right Text Column */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
          <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-extrabold uppercase tracking-widest">
            📊 TEACHER EXPERIENCE
          </span>

          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Focus more on teaching, <br />
            <span className="text-blue-600">less on notes.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-lg">
            Automate routine attendance, homework tracking, student risk detection, and parent meeting summaries with smart tools built for teachers.
          </p>

          <div className="space-y-2.5 pt-2">
            {teacherTools.map((tool) => (
              <div key={tool} className="flex items-center gap-2.5 text-xs font-extrabold text-slate-800">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center">
                  ✓
                </span>
                <span>{tool}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button href="/teacher" variant="secondary">Launch Teacher Workspace &rarr;</Button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
