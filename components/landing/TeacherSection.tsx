import React from 'react';
import Image from 'next/image';

export function TeacherSection() {
  return (
    <div className="bg-white/95 rounded-[2rem] p-8 md:p-12 ambient-shadow border border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-12 items-center hover:-translate-y-1 transition-transform duration-300">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-primary text-sm">school</span>
          <span className="font-label-sm text-label-sm text-primary">Smarter Teaching Experience</span>
        </div>
        <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Focus More on Teaching, Less on Notes</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
          Automate routine tasks, save time, and enhance student engagement with smart tools built for teachers.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">check</span> Lesson Generator</span>
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">check</span> Class Planner</span>
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm">check</span> Student Insights</span>
        </div>
        <button type="button" className="mt-6 flex items-center gap-2 font-title-md text-title-md text-primary hover:text-primary-container transition-colors font-bold">
          Explore Teacher Tools <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      <div className="bg-surface-container rounded-2xl h-80 overflow-hidden relative">
        <Image
          src="/images/teacher_classroom_ai.jpg"
          alt="Professional, high-quality photography of a modern, confident Indian schoolgirl smiling while using a digital tablet in a sleek, contemporary classroom."
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
